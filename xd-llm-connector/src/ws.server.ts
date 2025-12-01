import type { IncomingMessage } from 'http';
import type { Server as HTTPServer } from 'http';

import { WebSocketServer, WebSocket } from 'ws';
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import Logger from './logger.js';

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

const logger = new Logger('ws-server');

/**
 * WebSocket and HTTP Server for XD Plugin Communication
 *
 * Acts as a real-time bridge between LLMs and Adobe XD plugins.
 * Does not store data - requests fresh data from XD plugin on demand.
 * Enforces single connection limit.
 */
export default class WSServer extends EventEmitter {
    private wsServer: WebSocketServer | null;
    private xdClient: { remoteAddress: string; ws: WebSocket; connectionId: string } | null;

    /**
     * Send message to connected XD plugin
     */
    private sendOutboundMessage(message: OutboundMessage): boolean {
        if (!this.isXDClientConnected()) return false;

        this.xdClient!.ws.send(JSON.stringify(message));
        return true;
    }

    /**
     * Handle messages from connected XD plugin
     */
    private handleInboundMessage(connectionId: string, data: InboundMessage): void {
        switch (data.type) {
            case 'selected_node':
                logger.wsEvent('received', connectionId, `${data.type} message`);
                // Emit event for listeners to handle the response
                this.emit('selected_node', data.payload);
                break;

            case 'ping':
                logger.wsEvent('ping', connectionId);
                this.sendOutboundMessage({
                    type: 'pong',
                    connectionId,
                    timestamp: Date.now(),
                });
                break;

            case 'error':
                logger.wsEvent('received-error', connectionId, data.message || '');
                // Emit error event
                this.emit('xd_error', new Error(data.message));
                break;

            default:
                logger.wsEvent('unknown-message', connectionId, `type: ${data.type}`);
        }
    }

    private handleWSConnection(): void {
        if (!this.xdClient) return;

        this.xdClient.ws.on('open', () => {
            logger.wsConnection('established', this.getXDClientConnectionId()!, `from ${this.xdClient!.remoteAddress}`);
        });

        this.xdClient.ws.on('close', () => {
            logger.wsConnection('closed', this.getXDClientConnectionId()!);
            this.xdClient = null;
        });

        this.xdClient.ws.on('error', (error: Error) => {
            logger.wsConnection('error', this.getXDClientConnectionId()!, error.message);
            this.xdClient = null;
        });

        this.xdClient.ws.on('message', (message: Buffer) => {
            try {
                const data = JSON.parse(message.toString()) as InboundMessage;
                this.handleInboundMessage(this.getXDClientConnectionId()!, data);
            } catch (error: any) {
                logger.wsEvent('parse-error', this.getXDClientConnectionId()!, error.message);
            }
        });

        // Send welcome message
        this.sendOutboundMessage({
            type: 'welcome',
            connectionId: this.getXDClientConnectionId()!,
            timestamp: Date.now(),
        });
    }

    constructor() {
        super();
        this.wsServer = null;
        this.xdClient = null;
    }

    setupWSServer(httpServer: HTTPServer): void {
        // Setup WebSocket server for real-time communication
        this.wsServer = new WebSocketServer({ server: httpServer });

        this.wsServer.on('listening', () => {
            logger.server('ws-server-listening', 'WebSocket server listening for XD plugin connections');
        });

        this.wsServer.on('close', () => {
            logger.server('ws-server-closed', 'WebSocket server closed');
        });

        this.wsServer.on('error', (error: Error) => {
            logger.server('ws-server-error', `WebSocket server error :: ${error.message}`);
        });

        this.wsServer.on('connection', (ws: WebSocket, req: IncomingMessage) => {
            const remoteAddress = req.socket.remoteAddress || '';

            // Reject if already connected with another connection
            if (this.isXDClientConnected()) {
                logger.wsConnection(
                    'rejected',
                    'additional-connection',
                    `from ${remoteAddress} - only one connection allowed`
                );
                ws.close(1008, 'Only one XD plugin connection allowed!');
                return;
            }

            this.xdClient = { remoteAddress, ws, connectionId: uuidv4() };
            this.handleWSConnection();
        });
    }

    isXDClientConnected(): boolean {
        return this.xdClient?.ws.readyState === WebSocket.OPEN;
    }

    getXDClientConnectionId(): string | undefined {
        return this.xdClient?.connectionId;
    }

    // Send request for current selected node to XD plugin and wait for response
    async requestSelectedNode(timeout: number = 5000): Promise<any> {
        if (!this.isXDClientConnected()) throw new Error('No XD plugin connected');

        const message: OutboundMessage = {
            type: 'request_selected_node',
            connectionId: this.getXDClientConnectionId()!,
            timestamp: Date.now(),
        };

        logger.wsEvent('sending', this.getXDClientConnectionId()!, `${message.type} message`);

        return new Promise((resolve, reject) => {
            // Set up timeout
            const timeoutId = setTimeout(() => {
                this.removeListener('selected_node', onSelectedNode);
                this.removeListener('xd_error', onError);
                logger.wsEvent('timeout', this.getXDClientConnectionId()!, `selected_node request after ${timeout}ms`);
                reject(new Error('Selected node request timeout'));
            }, timeout);

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
            if (!this.sendOutboundMessage(message)) {
                clearTimeout(timeoutId);
                this.removeListener('selected_node', onSelectedNode);
                this.removeListener('xd_error', onError);
                logger.wsEvent('send-failed', this.getXDClientConnectionId()!, 'Failed to send message');
                reject(new Error('Failed to send selected node request to XD plugin'));
            }
        });
    }

    // Cleanup xdClient and shutdown websocket server
    close(): void {
        try {
            // Close XD Client if exists
            if (this.isXDClientConnected()) {
                this.xdClient!.ws.terminate();
                this.xdClient!.ws.removeAllListeners();
                this.xdClient = null;
            }

            // Close WebSocket server if exists
            if (this.wsServer) {
                this.wsServer.close();
                this.wsServer.removeAllListeners();
            }
        } catch (error: any) {
            logger.error('Error closing WebSocket server:', error);
        }
    }
}
