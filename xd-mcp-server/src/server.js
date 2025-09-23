import express from 'express';
import cors from 'cors';

/**
 * Unified MCP Server
 *
 * Single server process that handles both:
 * - WebSocket communication with Adobe XD plugin
 * - MCP HTTP endpoints for LLM clients
 *
 * This provides a clean, single-process architecture while maintaining
 * separation of concerns through modular design.
 */

import WSServer from './ws.server.js';
import MCPServer from './mcp.server.js';
import logger from './logger.js';

const PORT = 4000;

class Server {
    constructor() {
        this.wsServer = new WSServer();
        this.mcpServer = new MCPServer(this.wsServer);

        this.httpServer = null;
        this.app = express();
        this.connections = new Set(); // Track active connections

        // Server information
        this.currentPort = null;
        this.startTime = null;

        this.setupHTTPServer();
    }

    setupHTTPServer() {
        this.app.use(
            cors({
                origin: '*',
                exposedHeaders: ['Mcp-Session-Id'],
                allowedHeaders: ['Content-Type', 'mcp-session-id'],
            })
        );
        this.app.use(express.json({ limit: '10mb' }));

        // Add MCP HTTP transport endpoint to the existing WebSocket server
        this.app.post('/mcp', async (req, res) => {
            await this.mcpServer.handleRequest(req, res);
        });

        // SSE notifications not supported in stateless mode
        this.app.get('/mcp', async (_, res) => {
            logger.warn('Received GET MCP request');
            res.writeHead(405).end(
                JSON.stringify({
                    jsonrpc: '2.0',
                    error: {
                        code: -32000,
                        message: 'Method not allowed.',
                    },
                    id: null,
                })
            );
        });

        // Session termination not needed in stateless mode
        this.app.delete('/mcp', async (_, res) => {
            logger.warn('Received DELETE MCP request');
            res.writeHead(405).end(
                JSON.stringify({
                    jsonrpc: '2.0',
                    error: {
                        code: -32000,
                        message: 'Method not allowed.',
                    },
                    id: null,
                })
            );
        });

        // Health check endpoint for testing
        this.app.get('/health', (_, res) => {
            res.json({
                status: 'ok',
                xdPlugin: {
                    connected: this.wsServer.isConnected(),
                    connectionId: this.wsServer.getConnectionId(),
                },
                serverInfo: {
                    port: this.currentPort,
                    name: 'xd-mcp-server',
                    version: '1.0.0',
                    pid: process.pid,
                    startTime: this.startTime,
                },
            });
        });

        // Selection endpoint for testing
        this.app.get('/selection', async (_, res) => {
            try {
                const selectedNodeData = await this.wsServer.requestSelectionData();
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

    start(port) {
        try {
            return new Promise((resolve, reject) => {
                try {
                    // Start HTTP server
                    this.httpServer = this.app.listen(port, async () => {
                        this.currentPort = port;
                        this.startTime = new Date().toISOString();
                        logger.server('http-server-started', `HTTP server listening on port ${port}`);

                        // Setup WebSocket server
                        this.wsServer.setupWSServer(this.httpServer);

                        resolve();
                    });

                    // Track connections for proper shutdown
                    this.httpServer.on('connection', (socket) => {
                        this.connections.add(socket);
                        socket.on('close', () => {
                            this.connections.delete(socket);
                        });
                    });

                    this.httpServer.on('error', (error) => {
                        reject(error);
                    });
                } catch (error) {
                    reject(error);
                }
            });
        } catch (error) {
            logger.error('Failed to start unified MCP server:', error);
            process.exit(1);
        }
    }

    async close() {
        try {
            // Close WebSocket server first
            if (this.wsServer) {
                await this.wsServer.close();
            }

            // Close HTTP server with timeout
            if (this.httpServer) {
                // First, destroy all existing connections
                for (const socket of this.connections) {
                    socket.destroy();
                }
                this.connections.clear();

                // Close the server with a timeout
                await Promise.race([
                    new Promise((resolve) => {
                        this.httpServer.close(() => {
                            logger.server('http-closed', 'HTTP server closed successfully');
                            resolve();
                        });
                    }),
                    new Promise((resolve) => {
                        setTimeout(() => {
                            logger.warn('HTTP server close timeout, forcing shutdown');
                            resolve();
                        }, 2000); // 2 second timeout
                    }),
                ]);
            }
        } catch (error) {
            logger.error('Error during server shutdown:', error);
            // Don't throw error to allow process to exit
        }
    }
}

// Start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    logger.info('Setting up server');
    const server = new Server();

    let isShuttingDown = false;

    // Graceful shutdown function
    const gracefulShutdown = async (signal) => {
        if (isShuttingDown) {
            logger.warn('Already shutting down, forcing exit...');
            process.exit(1);
        }

        isShuttingDown = true;
        logger.server('shutdown-start', `Starting server shutdown... (${signal})`);

        try {
            await server.close();
            logger.server('shutdown-complete', 'Graceful shutdown completed');
            process.exit(0);
        } catch (error) {
            logger.error('Error during graceful shutdown:', error);
            process.exit(1);
        }
    };

    // Setup graceful shutdown - only register once
    process.once('SIGINT', () => gracefulShutdown('SIGINT'));
    process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));

    process.once('uncaughtException', (error) => {
        logger.error('Uncaught exception:', error);
        gracefulShutdown('uncaughtException').catch(() => process.exit(1));
    });

    process.once('unhandledRejection', (reason) => {
        logger.error('Unhandled rejection:', reason);
        gracefulShutdown('unhandledRejection').catch(() => process.exit(1));
    });

    // Start server
    server.start(PORT).catch((error) => {
        logger.error('Failed to start server:', error);
        process.exit(1);
    });
}

export default Server;
