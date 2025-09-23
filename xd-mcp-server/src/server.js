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

class Server {
    constructor() {
        this.wsServer = new WSServer();
        this.mcpServer = new MCPServer(this.wsServer);

        this.httpServer = null;
        this.app = express();

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

    start(port = 6000) {
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

    close() {
        return new Promise(async (resolve) => {
            await this.wsServer.close();

            if (this.httpServer) {
                this.httpServer.close(() => {
                    logger.server('http-server-started', 'HTTP server shutdown complete');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}

// Start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    logger.info('Setting up server');
    const server = new Server();
    const port = parseInt(process.env.XD_WS_PORT) || 6000;

    // Setup graceful shutdown
    process.on('SIGINT', async () => {
        logger.server('shutdown', 'Received SIGINT signal');
        await server.close();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        logger.server('shutdown', 'Received SIGTERM signal');
        await server.close();
        process.exit(0);
    });

    process.on('uncaughtException', (error) => {
        logger.error('Uncaught exception:', error);
        process.exit(1);
    });

    process.on('unhandledRejection', (reason) => {
        logger.error('Unhandled rejection:', reason);
        process.exit(1);
    });

    server.start(port);
}

export default Server;
