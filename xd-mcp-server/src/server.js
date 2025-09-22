#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';

/**
 * XD MCP Server - Bridge between Adobe XD plugins and LLMs
 *
 * This server provides MCP tools that LLMs can use to interact with Adobe XD
 * through a plugin running inside the XD application.
 */

class XDMCPServer {
    constructor() {
        this.server = new Server(
            {
                name: 'xd-mcp-server',
                version: '1.0.0',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        // Store for XD plugin connections and data
        this.xdConnections = new Map();
        this.pendingRequests = new Map();
        this.selectedNodeData = null;
        this.lastUpdateTime = null;

        // HTTP server for XD plugin communication
        this.app = express();
        this.httpServer = null;
        this.wsServer = null;

        this.setupMCPTools();
        this.setupHTTPServer();
        this.setupErrorHandling();
    }

    setupMCPTools() {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'get_xd_connection_status',
                        description: 'Check if Adobe XD plugin is connected and ready to provide data',
                        inputSchema: {
                            type: 'object',
                            properties: {},
                        },
                    },
                    {
                        name: 'get_selected_xd_node',
                        description:
                            'Get details of the currently selected node/element in Adobe XD. Returns comprehensive specifications including dimensions, visual properties, typography, and more.',
                        inputSchema: {},
                    },
                ],
            };
        });

        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            try {
                switch (name) {
                    case 'get_xd_connection_status':
                        return await this.handleGetConnectionStatus(args);

                    case 'get_selected_xd_node':
                        return await this.handleGetSelectedNode(args);

                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error executing tool ${name}: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        });
    }

    async handleGetConnectionStatus() {
        const connectionCount = this.xdConnections.size;
        const hasRecentData = this.selectedNodeData && this.lastUpdateTime;
        const dataAge = hasRecentData ? Date.now() - this.lastUpdateTime : null;

        const status = {
            connected: connectionCount > 0,
            connectionCount,
            hasSelectionData: !!this.selectedNodeData,
            dataAge: dataAge ? `${Math.round(dataAge / 1000)}s ago` : null,
            lastUpdate: this.lastUpdateTime ? new Date(this.lastUpdateTime).toISOString() : null,
        };

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(status, null, 2),
                },
            ],
        };
    }

    async handleGetSelectedNode(args = {}) {
        const { format = 'json', includeMetadata = true } = args;

        // Check if we have any XD connections
        if (this.xdConnections.size === 0) {
            return {
                content: [
                    {
                        type: 'text',
                        text: 'No Adobe XD plugin connected. Please ensure the XD plugin is installed and running.',
                    },
                ],
                isError: true,
            };
        }

        // Check if we have recent selection data
        if (!this.selectedNodeData) {
            return {
                content: [
                    {
                        type: 'text',
                        text: 'No element is currently selected in Adobe XD. Please select an element and try again.',
                    },
                ],
                isError: true,
            };
        }

        // Check if data is stale (older than 30 seconds)
        // const now = Date.now();
        // if (this.lastUpdateTime && now - this.lastUpdateTime > 30000) {
        //     return {
        //         content: [
        //             {
        //                 type: 'text',
        //                 text: "Selection data may be outdated. Consider requesting a fresh update using 'request_xd_selection_update'.",
        //             },
        //         ],
        //     };
        // }

        let responseData = { ...this.selectedNodeData };

        // Remove metadata if not requested
        if (!includeMetadata && responseData.metadata) {
            delete responseData.metadata;
        }

        // Format response based on requested format
        if (format === 'scss' && responseData.scssProperties) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `SCSS Properties for "${responseData.basic?.name || 'Selected Element'}":\n\n${
                            responseData.scssCode || 'No SCSS properties available for this element type.'
                        }`,
                    },
                ],
            };
        }

        // Default JSON format
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(responseData, null, 2),
                },
            ],
        };
    }

    setupHTTPServer() {
        this.app.use(cors());
        this.app.use(express.json({ limit: '10mb' }));

        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'ok',
                connections: this.xdConnections.size,
                hasData: !!this.selectedNodeData,
                lastUpdate: this.lastUpdateTime,
            });
        });

        // Endpoint for XD plugin to send selection data
        this.app.post('/xd/selection', (req, res) => {
            try {
                const { data, requestId } = req.body;

                if (data) {
                    this.selectedNodeData = data;
                    this.lastUpdateTime = Date.now();

                    console.log(
                        `Received selection data: ${data.basic?.name || 'Unknown'} (${data.basic?.type || 'Unknown'})`
                    );
                }

                // Handle pending request if this was a response to a request
                if (requestId && this.pendingRequests.has(requestId)) {
                    const pendingRequest = this.pendingRequests.get(requestId);
                    if (data) {
                        pendingRequest.resolve(data);
                    } else {
                        pendingRequest.reject('No selection data received');
                    }
                }

                res.json({ success: true, timestamp: this.lastUpdateTime });
            } catch (error) {
                console.error('Error processing selection data:', error);
                res.status(500).json({ error: error.message });
            }
        });

        // Start HTTP server
        const port = process.env.XD_MCP_PORT || 6000;
        this.httpServer = this.app.listen(port, () => {
            console.log(`XD MCP HTTP server listening on port ${port}`);
        });

        // Setup WebSocket server for real-time communication
        this.wsServer = new WebSocketServer({ server: this.httpServer });

        this.wsServer.on('connection', (ws, req) => {
            const connectionId = uuidv4();
            this.xdConnections.set(connectionId, ws);

            console.log(`XD plugin connected: ${connectionId} (${req.socket.remoteAddress})`);

            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message.toString());
                    this.handleWebSocketMessage(connectionId, data);
                } catch (error) {
                    console.error(`Error parsing WebSocket message from ${connectionId}:`, error);
                }
            });

            ws.on('close', () => {
                this.xdConnections.delete(connectionId);
                console.log(`XD plugin disconnected: ${connectionId}`);
            });

            ws.on('error', (error) => {
                console.error(`WebSocket error for connection ${connectionId}:`, error);
                this.xdConnections.delete(connectionId);
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
                this.selectedNodeData = data.payload;
                this.lastUpdateTime = Date.now();
                console.log(`Received selection data via WebSocket from ${connectionId}`);

                // Handle pending request if this was a response
                if (data.requestId && this.pendingRequests.has(data.requestId)) {
                    const pendingRequest = this.pendingRequests.get(data.requestId);
                    pendingRequest.resolve(data.payload);
                }
                break;

            case 'ping':
                // Respond to ping with pong
                const connection = this.xdConnections.get(connectionId);
                if (connection && connection.readyState === 1) {
                    connection.send(
                        JSON.stringify({
                            type: 'pong',
                            timestamp: Date.now(),
                        })
                    );
                }
                break;

            case 'error':
                console.error(`Error from XD plugin ${connectionId}:`, data.message);
                if (data.requestId && this.pendingRequests.has(data.requestId)) {
                    const pendingRequest = this.pendingRequests.get(data.requestId);
                    pendingRequest.reject(data.message);
                }
                break;

            default:
                console.warn(`Unknown message type from ${connectionId}:`, data.type);
        }
    }

    setupErrorHandling() {
        this.server.onerror = (error) => {
            console.error('[MCP Error]', error);
        };

        process.on('SIGINT', async () => {
            console.log('Shutting down XD MCP Server...');

            // Close all WebSocket connections
            for (const [connectionId, connection] of this.xdConnections) {
                connection.close();
            }

            // Close HTTP server
            if (this.httpServer) {
                this.httpServer.close();
            }

            await this.server.close();
            process.exit(0);
        });
    }

    async start() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('XD MCP Server running on stdio');
    }
}

// Start the server
const server = new XDMCPServer();
server.start().catch(console.error);
