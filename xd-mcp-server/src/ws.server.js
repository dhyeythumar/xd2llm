import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';

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

        // Single connection tracking
        this.xdConnection = null;
        this.xdConnectionId = null;

        // HTTP server setup
        this.app = express();
        this.httpServer = null;
        this.wsServer = null;

        this.setupHTTPServer();
    }

    setupHTTPServer() {
        this.app.use(cors());
        this.app.use(express.json({ limit: '10mb' }));

        // Health check endpoint
        this.app.get('/health', (_, res) => {
            res.json({
                status: 'ok',
                connected: this.isConnected(),
                connectionId: this.getConnectionId(),
            });
        });

        this.app.get('/selection', async (_, res) => {
            try {
                const selectedNodeData = await this.requestSelectionData();
                res.json({
                    status: 'ok',
                    selectedNodeData,
                });
            } catch (error) {
                res.status(500).json({
                    status: 'error',
                    message: error.message,
                });
            }
        });
    }

    start(port = 6000) {
        return new Promise((resolve, reject) => {
            try {
                // Start HTTP server
                this.httpServer = this.app.listen(port, () => {
                    console.info(`HTTP server listening on port ${port}`);
                    this.setupWSServer();
                    resolve();
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    setupWSServer() {
        // Setup WebSocket server for real-time communication
        this.wsServer = new WebSocketServer({ server: this.httpServer });

        this.wsServer.on('connection', (ws, req) => {
            // Check if we already have a connection
            if (this.xdConnection) {
                console.warn(
                    `Rejecting additional XD plugin connection from ${req.socket.remoteAddress} - only one connection allowed`
                );
                ws.close(1008, 'Only one XD plugin connection allowed');
                return;
            }

            const connectionId = uuidv4();
            this.xdConnection = ws;
            this.xdConnectionId = connectionId;

            console.info(`XD plugin connected: ${connectionId} (${req.socket.remoteAddress})`);

            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message.toString());
                    this.handleWebSocketMessage(connectionId, data);
                } catch (error) {
                    console.error(`Error parsing WebSocket message from ${connectionId}:`, error);
                }
            });

            ws.on('close', () => {
                console.info(`XD plugin disconnected: ${connectionId}`);
                this.xdConnection = null;
                this.xdConnectionId = null;
            });

            ws.on('error', (error) => {
                console.error(`WebSocket error for connection ${connectionId}:`, error);
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
                console.info(`Received selection data via WebSocket from ${connectionId}`);
                // Emit event for listeners to handle the response
                this.emit('selection_data', data.payload);
                break;

            case 'ping':
                this.sendMessage({
                    type: 'pong',
                    connectionId,
                    timestamp: Date.now(),
                });
                break;

            case 'error':
                console.error(`Error from XD plugin ${connectionId}:`, data.message);
                // Emit error event
                this.emit('xd_error', new Error(data.message));
                break;

            default:
                console.warn(`Unknown message type from ${connectionId}:`, data.type);
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

        return new Promise((resolve, reject) => {
            // Set up timeout
            const timeoutId = setTimeout(() => {
                this.removeListener('selection_data', onSelectionData);
                this.removeListener('xd_error', onError);
                reject(new Error('Selection data request timeout'));
            }, timeout);

            // Set up event listeners
            const onSelectionData = (data) => {
                clearTimeout(timeoutId);
                this.removeListener('xd_error', onError);
                resolve(data);
            };

            const onError = (error) => {
                clearTimeout(timeoutId);
                this.removeListener('selection_data', onSelectionData);
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

    // Cleanup and shutdown
    close() {
        return new Promise((resolve) => {
            // Close WebSocket connection
            if (this.xdConnection) {
                this.xdConnection.close();
            }

            // Close HTTP server
            if (this.httpServer) {
                this.httpServer.close(() => {
                    console.info('XD WebSocket server closed');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}
