import type { IncomingMessage } from 'http';
import type { Server as HTTPServer } from 'http';

import { WebSocketServer, WebSocket } from 'ws';
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import Logger from './logger.js';
import { WS_SERVER_NAME, MSGS, WS_RESPONSE_TIMEOUT_MS } from './const.js';

// msg type while sending ws messages to client.
type OutboundMessage = {
    type: 'pong' | 'welcome' | 'request_selected_node';
    connectionId: string;
    timestamp: number;
};

// msg type while receiving ws messages from client.
type InboundMessage = {
    type: 'selected_node' | 'ping' | 'error';
    payload?: any;
    message?: string;
};

/**
 * WebSocket and HTTP Server for XD Plugin Communication
 *
 * Acts as a real-time bridge between LLMs and Adobe XD plugins.
 * Does not store data - requests fresh data from XD plugin on demand.
 * Enforces single connection limit.
 */
export default class WSServer extends EventEmitter {
    private readonly logger = new Logger(WS_SERVER_NAME);
    private wss: WebSocketServer | null;
    private xdClient: { remoteAddress: string; ws: WebSocket; connectionId: string } | null;

    constructor() {
        super();
        this.wss = null;
        this.xdClient = null;
    }

    // Send message to XD plugin socket connection
    private handleOutboundMessage(message: OutboundMessage): boolean {
        const connectionId = this.getXDClientConnectionId();

        if (!this.isXDClientConnected()) {
            this.logger.error(MSGS.SEND_MSG_FAILURE);
            return false;
        } else {
            this.logger.info(`Sending message [${connectionId}] | Type: ${message.type.toUpperCase()}`);
            this.xdClient!.ws.send(JSON.stringify(message));
            return true;
        }
    }

    // Handle messages from XD plugin socket connection
    private handleInboundMessage(data: InboundMessage): void {
        const connectionId = this.getXDClientConnectionId()!;
        this.logger.info(`Received message [${connectionId}] | Type: ${data.type.toUpperCase()}`);

        switch (data.type) {
            case 'selected_node': {
                this.emit('selected_node', data.payload);
                break;
            }
            case 'ping': {
                this.handleOutboundMessage({
                    type: 'pong',
                    connectionId,
                    timestamp: Date.now(),
                });
                break;
            }
            case 'error': {
                this.emit('xd_error', new Error(data.message));
                break;
            }
            default: {
                this.logger.error(MSGS.UNKNOWN_MESSAGE);
            }
        }
    }

    // Handle socket connection from XD plugin
    private handleNewConnection(): void {
        if (!this.isXDClientConnected()) {
            this.logger.error(MSGS.NO_CONNECTION);
            return;
        }
        const connectionId = this.getXDClientConnectionId()!;

        this.xdClient!.ws.on('open', () => {
            this.logger.wsConnection('established', connectionId, `from ${this.xdClient!.remoteAddress}`);
        });

        this.xdClient!.ws.on('close', () => {
            this.logger.wsConnection('closed', connectionId);
            this.xdClient = null;
        });

        this.xdClient!.ws.on('error', (error: Error) => {
            this.logger.wsConnection('error', connectionId, error.message);
            this.xdClient = null;
        });

        this.xdClient!.ws.on('message', (message: Buffer) => {
            try {
                const data = JSON.parse(message.toString()) as InboundMessage;
                this.handleInboundMessage(data);
            } catch (error: unknown) {
                this.logger.error(MSGS.MESSAGE_PARSE_ERROR, (error as Error).message || '');
            }
        });

        // Send welcome message
        this.handleOutboundMessage({
            type: 'welcome',
            connectionId,
            timestamp: Date.now(),
        });
    }

    isXDClientConnected(): boolean {
        return this.xdClient !== null && this.xdClient.ws.readyState === WebSocket.OPEN;
    }

    getXDClientConnectionId(): string | undefined {
        return this.xdClient?.connectionId;
    }

    // Send request for current selected node to XD plugin and wait for response
    async requestSelectedNode(): Promise<any> {
        if (!this.isXDClientConnected()) throw new Error(MSGS.NO_CONNECTION);
        const connectionId = this.getXDClientConnectionId()!;

        const message: OutboundMessage = {
            type: 'request_selected_node',
            connectionId,
            timestamp: Date.now(),
        };

        return new Promise((resolve, reject) => {
            // Set up timeout
            const timeoutId = setTimeout(() => {
                this.removeListener('selected_node', onSelectedNode);
                this.removeListener('xd_error', onError);
                reject(new Error(MSGS.REQUEST_TIMEOUT));
            }, WS_RESPONSE_TIMEOUT_MS);

            // Set up event listeners
            const onSelectedNode = (data: any) => {
                clearTimeout(timeoutId);
                this.removeListener('xd_error', onError);
                resolve(data);
            };

            const onError = (error: Error) => {
                clearTimeout(timeoutId);
                this.removeListener('selected_node', onSelectedNode);
                reject(error);
            };

            // Listen for response
            this.once('selected_node', onSelectedNode);
            this.once('xd_error', onError);

            // Send the request
            if (!this.handleOutboundMessage(message)) {
                clearTimeout(timeoutId);
                this.removeListener('selected_node', onSelectedNode);
                this.removeListener('xd_error', onError);
                reject(new Error(MSGS.SEND_MSG_FAILURE));
            }
        });
    }

    // Start WebSocket server
    start(httpServer: HTTPServer) {
        this.wss = new WebSocketServer({ server: httpServer });
        this.logger.server('listening', MSGS.SERVER_LISTENING);

        this.wss.on('error', (error: Error) => {
            this.logger.server('error', `${MSGS.SERVER_ERROR} ${error.message}`);
        });

        this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
            const remoteAddress = req.socket.remoteAddress || '';

            // Reject if already connected with another connection
            if (this.isXDClientConnected()) {
                this.logger.warn(MSGS.CONNECTION_LIMIT_EXCEEDED, `=> address: ${remoteAddress}`);
                ws.close(1008, MSGS.CONNECTION_LIMIT_EXCEEDED);
                return;
            }

            this.xdClient = { remoteAddress, ws, connectionId: uuidv4() };
            this.handleNewConnection();
        });
    }

    // Cleanup & shutdown WebSocket server
    close() {
        return new Promise<void>((resolve) => {
            try {
                this.logger.server('shutdown', `Closing WebSocket server...`);

                // Close XD plugin connection if exists
                if (this.isXDClientConnected()) {
                    this.xdClient!.ws.terminate();
                    this.xdClient!.ws.removeAllListeners();
                    this.xdClient = null;
                }

                // Close WebSocket server
                if (this.wss) {
                    this.wss.removeAllListeners();
                    this.wss.close((error: Error | undefined) => {
                        if (error) throw error;
                        this.logger.server('closed', MSGS.SERVER_CLOSED);
                        resolve();
                    });
                }
            } catch (error: unknown) {
                this.logger.error(`${MSGS.SERVER_ERROR} ${(error as Error).message}`);
                resolve();
            }
        });
    }
}
