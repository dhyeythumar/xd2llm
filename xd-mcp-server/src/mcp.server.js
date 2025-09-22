#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import WebSocketServer from './ws.server.js';

/**
 * XD MCP Server - Bridge between Adobe XD plugins and LLMs
 *
 * This server provides MCP tools that LLMs can use to interact with Adobe XD
 * through a plugin running inside the XD application.
 */

class XDMCPServer {
    constructor() {
        this.mcpServer = new Server(
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

        // WebSocket server for XD plugin communication
        this.wsServer = new WebSocketServer();

        this.setupMCPTools();
        this.setupErrorHandling();
    }

    setupMCPTools() {
        // List available tools
        this.mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
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
        this.mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
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
        // Basic connection check
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        connected: this.wsServer.isConnected(),
                        connectionId: this.wsServer.getConnectionId(),
                    }),
                },
            ],
        };
    }

    async handleGetSelectedNode() {
        try {
            // Check if we have an XD connection
            if (!this.wsServer.isConnected()) {
                throw new Error('No Adobe XD plugin connected. Please ensure the XD plugin is installed and running.');
            }

            // Request fresh selection data from XD plugin and wait for response
            const selectedNodeData = await this.wsServer.requestSelectionData();
            if (!selectedNodeData) {
                throw new Error(
                    'No element is currently selected in Adobe XD. Please select an element and try again.'
                );
            }

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(selectedNodeData, null, 2),
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error getting selection data from Adobe XD: ${error.message}`,
                    },
                ],
                isError: true,
            };
        }
    }

    setupErrorHandling() {
        this.mcpServer.onerror = (error) => {
            console.error('[MCP Error]', error);
        };

        process.on('SIGINT', async () => {
            console.log('Shutting down XD MCP Server...');

            // Close WebSocket server
            await this.wsServer.close();

            await this.mcpServer.close();
            process.exit(0);
        });
    }

    async start() {
        // Start WebSocket server
        const port = process.env.XD_MCP_PORT || 6000;
        await this.wsServer.start(port);

        // Start MCP server
        const transport = new StdioServerTransport();
        await this.mcpServer.connect(transport);
        console.error('XD MCP Server running on stdio');
    }
}

// Start the server
const server = new XDMCPServer();
server.start().catch(console.error);
