import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import logger from './logger.js';

/**
 * WebSocket and HTTP Server for XD Plugin Communication
 *
 * Acts as a real-time bridge between LLMs and Adobe XD plugins.
 * Does not store data - requests fresh data from XD plugin on demand.
 * Enforces single connection limit.
 */
export default class WSServer extends EventEmitter {
    constructor() {
        super();

        this.wsServer = null;

        // Single connection tracking
        this.xdConnection = null;
        this.xdConnectionId = null;
    }

    setupWSServer(httpServer) {
        // Setup WebSocket server for real-time communication
        this.wsServer = new WebSocketServer({ server: httpServer });

        this.wsServer.on('connection', (ws, req) => {
            // Check if we already have a connection
            if (this.xdConnection) {
                logger.connection(
                    'rejected',
                    'additional-connection',
                    `from ${req.socket.remoteAddress} - only one connection allowed`
                );
                ws.close(1008, 'Only one XD plugin connection allowed');
                return;
            }

            const connectionId = uuidv4();
            this.xdConnection = ws;
            this.xdConnectionId = connectionId;

            logger.connection('established', connectionId, `from ${req.socket.remoteAddress}`);

            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message.toString());
                    this.handleWebSocketMessage(connectionId, data);
                } catch (error) {
                    logger.ws('parse-error', connectionId, error.message);
                }
            });

            ws.on('close', () => {
                logger.connection('closed', connectionId);
                this.xdConnection = null;
                this.xdConnectionId = null;
            });

            ws.on('error', (error) => {
                logger.ws('error', connectionId, error.message);
                this.xdConnection = null;
                this.xdConnectionId = null;
            });

            // Send welcome message
            ws.send(
                JSON.stringify({
                    type: 'welcome',
                    connectionId,
                    timestamp: Date.now(),
                })
            );
        });
    }

    handleWebSocketMessage(connectionId, data) {
        switch (data.type) {
            case 'selection_data':
                logger.ws('received', connectionId, `selection_data message`);
                // Emit event for listeners to handle the response
                this.emit('selection_data', data.payload);
                break;

            case 'ping':
                logger.ws('ping', connectionId);
                this.sendMessage({
                    type: 'pong',
                    connectionId,
                    timestamp: Date.now(),
                });
                break;

            case 'error':
                logger.ws('received-error', connectionId, data.message);
                // Emit error event
                this.emit('xd_error', new Error(data.message));
                break;

            default:
                logger.ws('unknown-message', connectionId, `type: ${data.type}`);
        }
    }

    // Send message to connected XD plugin
    sendMessage(message) {
        if (this.xdConnection && this.xdConnection.readyState === 1) {
            this.xdConnection.send(JSON.stringify(message));
            return true;
        }
        return false;
    }

    // Send request for selection data to XD plugin and wait for response
    async requestSelectionData(timeout = 10000) {
        if (!this.isConnected()) {
            throw new Error('No XD plugin connected');
        }

        const message = {
            type: 'request_selection_data',
            timestamp: Date.now(),
        };

        logger.ws('sending', this.xdConnectionId, `request_selection_data message`);

        return new Promise((resolve, reject) => {
            // Set up timeout
            const timeoutId = setTimeout(() => {
                this.removeListener('selection_data', onSelectionData);
                this.removeListener('xd_error', onError);
                logger.ws('timeout', this.xdConnectionId, `selection_data request after ${timeout}ms`);
                reject(new Error('Selection data request timeout'));
            }, timeout);

            // Set up event listeners
            const onSelectionData = (data) => {
                clearTimeout(timeoutId);
                this.removeListener('xd_error', onError);
                logger.ws('response-received', this.xdConnectionId, 'selection_data received successfully');
                resolve(data);
            };

            const onError = (error) => {
                clearTimeout(timeoutId);
                this.removeListener('selection_data', onSelectionData);
                logger.ws('response-error', this.xdConnectionId, error.message);
                reject(error);
            };

            // Listen for response
            this.once('selection_data', onSelectionData);
            this.once('xd_error', onError);

            // Send the request
            if (!this.sendMessage(message)) {
                clearTimeout(timeoutId);
                this.removeListener('selection_data', onSelectionData);
                this.removeListener('xd_error', onError);
                logger.ws('send-failed', this.xdConnectionId, 'Failed to send message');
                reject(new Error('Failed to send request to XD plugin'));
            }
        });
    }

    // Public methods for external access
    isConnected() {
        return !!this.xdConnection;
    }

    getConnectionId() {
        return this.xdConnectionId;
    }

    // Cleanup and shutdown websocket server
    close() {
        return new Promise((resolve) => {
            if (this.xdConnection) {
                this.xdConnection.close();
            }
            logger.ws('closed', this.xdConnectionId, 'WebSocket connection closed');
            resolve();
        });
    }
}
