#!/usr/bin/env node

import type { Express, Request, Response } from 'express';
import type { Server as HTTPServer } from 'http';
import type { Socket } from 'net';

import express from 'express';
import cors from 'cors';
import WSServer from './ws.server.js';
import MCPServer from './mcp.server.js';
import Logger from './logger.js';

const PORT = 4000;
const logger = new Logger('server');

/**
 * Single server process that handles both:
 * - WebSocket communication with Adobe XD plugin
 * - MCP HTTP endpoints for LLM clients
 *
 * This provides a clean, single-process architecture while maintaining
 * separation of concerns through modular design.
 */
class Server {
    private wsServer: WSServer;
    private mcpServer: MCPServer;

    private app: Express;
    private httpServer: HTTPServer | null;
    private connections: Set<Socket>;
    private currentPort: number = PORT;
    private startTime: string | null;

    private setupHTTPServer(): void {
        this.app.use(
            cors({
                origin: '*',
                exposedHeaders: ['Mcp-Session-Id'],
                allowedHeaders: ['Content-Type', 'mcp-session-id'],
            })
        );
        this.app.use(express.json({ limit: '10mb' }));

        // Add MCP HTTP transport endpoint to the existing WebSocket server
        this.app.all('/mcp', async (req: Request, res: Response) => {
            await this.mcpServer.handleRequest(req, res);
        });

        // Health check endpoint for testing
        this.app.get('/health', (_, res: Response) => {
            res.json({
                status: 'ok',
                xdConnectionInfo: {
                    connected: this.wsServer.isXDClientConnected(),
                    connectionId: this.wsServer.getXDClientConnectionId(),
                },
                serverInfo: {
                    name: 'xd-llm-connector',
                    version: '1.0.0',
                    pid: process.pid,
                    port: this.currentPort,
                    startTime: this.startTime,
                },
            });
        });
    }

    constructor() {
        this.wsServer = new WSServer();
        this.mcpServer = new MCPServer(this.wsServer);

        this.app = express();
        this.httpServer = null;
        this.connections = new Set(); // Track active connections
        this.startTime = null;

        this.setupHTTPServer();
    }

    start(): Promise<void> {
        return new Promise((resolve, reject) => {
            // Start HTTP server
            this.httpServer = this.app.listen(PORT, async () => {
                this.startTime = new Date().toISOString();
                logger.server('http-server-started', `HTTP server listening on port ${PORT}`);

                // Setup WebSocket server
                this.wsServer.setupWSServer(this.httpServer!);

                resolve();
            });

            // Track connections for proper shutdown
            this.httpServer.on('connection', (socket: Socket) => {
                this.connections.add(socket);
                socket.on('close', () => {
                    this.connections.delete(socket);
                });
            });

            this.httpServer.on('error', (error: Error) => {
                reject(error);
            });
        });
    }

    async close(): Promise<void> {
        try {
            // Close WebSocket server first
            if (this.wsServer) this.wsServer.close();

            // Close HTTP server with timeout
            if (this.httpServer) {
                // First, destroy all existing connections
                for (const socket of this.connections) {
                    socket.destroy();
                }
                this.connections.clear();

                // Close the server with a timeout
                await Promise.race([
                    new Promise<void>((resolve) => {
                        this.httpServer!.close(() => {
                            logger.server('http-closed', 'HTTP server closed successfully');
                            resolve();
                        });
                    }),
                    new Promise<void>((resolve) => {
                        setTimeout(() => {
                            logger.warn('HTTP server close timeout, forcing shutdown');
                            resolve();
                        }, 2000);
                    }),
                ]);
            }
        } catch (error: any) {
            logger.error('Error during server shutdown:', error);
            // Don't throw error to allow process to exit
        }
    }
}

// Start the server if this file is run directly
logger.info('Setting up server');
const server = new Server();

let isShuttingDown = false;

// Graceful shutdown function
const gracefulShutdown = async (signal: string) => {
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
    } catch (error: any) {
        logger.error('Error during graceful shutdown:', error);
        process.exit(1);
    }
};

// Setup graceful shutdown - only register once
process.once('SIGINT', () => gracefulShutdown('SIGINT'));
process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.once('uncaughtException', (error: Error) => {
    logger.error('Uncaught exception:', error.message);
    gracefulShutdown('uncaughtException');
});

process.once('unhandledRejection', (reason: Error) => {
    logger.error('Unhandled rejection:', reason.message);
    gracefulShutdown('unhandledRejection');
});

// Start server
server.start().catch((error: Error) => {
    logger.error('Failed to start server:', error.message);
    process.exit(1);
});

export default Server;
