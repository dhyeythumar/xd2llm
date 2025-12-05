#!/usr/bin/env node

import type { Express, Request, Response } from 'express';
import type { Server as HTTPServer } from 'http';

import http from 'http';
import express from 'express';
import cors from 'cors';
import WSServer from './ws.server.js';
import CustomMCPServer from './mcp.server.js';
import Logger from './logger.js';
import { MSGS, PORT, SERVER_NAME } from './const.js';

/**
 * Single server process that handles both:
 * - WebSocket communication with Adobe XD plugin
 * - MCP HTTP endpoints for LLM clients
 *
 * This provides a clean, single-process architecture while maintaining
 * separation of concerns through modular design.
 */
class Server {
    private readonly logger = new Logger(SERVER_NAME);
    private readonly wsServer: WSServer;
    private readonly mcpServer: CustomMCPServer;

    private app: Express;
    private httpServer: HTTPServer | null;
    private currentPort: number = PORT;
    private startTime: string | null;

    constructor() {
        try {
            this.logger.info('Setting up server...');

            this.app = express();
            this.httpServer = http.createServer(this.app);
            this.startTime = null;

            this.setupHTTPServer();
            this.handleInterruptionAndExceptions();

            this.wsServer = new WSServer();
            this.mcpServer = new CustomMCPServer(this.wsServer);
        } catch (error: any) {
            this.logger.error('Error setting up server:', error);
            process.exit(1);
        }
    }

    private setupHTTPServer() {
        this.app.use(
            cors({
                origin: '*',
                exposedHeaders: ['Mcp-Session-Id'],
                allowedHeaders: ['Content-Type', 'mcp-session-id'],
            })
        );

        // Add MCP HTTP transport endpoint BEFORE JSON middleware
        // MCP transport needs raw request stream, not parsed JSON
        this.app.all('/mcp', async (req: Request, res: Response) => {
            await this.mcpServer.handleRequest(req, res);
        });

        // Apply JSON parsing middleware only to routes that need it (not /mcp)
        this.app.use(express.json({ limit: '10mb' }));

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

    start() {
        return new Promise<void>((resolve, reject) => {
            if (!this.httpServer) return reject(new Error(MSGS.HTTP_SERVER_NOT_INITIALIZED));

            this.httpServer.on('error', (error: Error) => {
                this.logger.server('error', `${MSGS.SERVER_ERROR} ${error.message}`);
                reject(error);
            });

            this.httpServer.on('listening', () => {
                try {
                    this.startTime = new Date().toISOString();
                    this.logger.server('listening', MSGS.SERVER_LISTENING);
                    this.wsServer.start(this.httpServer!);
                    resolve();
                } catch (error: any) {
                    reject(error);
                }
            });

            // Start HTTP server
            this.httpServer.listen(PORT);
        });
    }

    private async close(signal: string) {
        try {
            this.logger.server('close', `${MSGS.SERVER_CLOSING} (${signal} signal)`);

            // Close WebSocket server first
            this.wsServer?.close();

            // Close HTTP server with timeout
            if (this.httpServer) {
                this.httpServer.closeAllConnections();
                this.httpServer.removeAllListeners();

                // Close the server with a timeout
                await Promise.race([
                    new Promise<void>((resolve) => {
                        this.httpServer!.close(() => {
                            resolve();
                        });
                    }),
                    new Promise<void>((resolve) => {
                        setTimeout(() => {
                            this.logger.warn(MSGS.HTTP_SERVER_CLOSE_TIMEOUT);
                            resolve();
                        }, 2000);
                    }),
                ]);
            }
            this.logger.server('closed', MSGS.SERVER_CLOSED);
            process.exit(0);
        } catch (error: any) {
            this.logger.error(`${MSGS.SERVER_ERROR} ${error.message}`);
            process.exit(1);
        }
    }

    private handleInterruptionAndExceptions() {
        // Setup graceful shutdown - only register once
        process.once('SIGINT', () => this.close('SIGINT'));
        process.once('SIGTERM', () => this.close('SIGTERM'));
        process.once('uncaughtException', (error: Error) => {
            this.logger.error('Uncaught exception:', error.message);
            this.close('uncaughtException');
        });
        process.once('unhandledRejection', (reason: Error) => {
            this.logger.error('Unhandled rejection:', reason.message);
            this.close('unhandledRejection');
        });
    }
}

(() => {
    new Server().start().catch(() => process.exit(1));
})();
