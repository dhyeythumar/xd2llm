/**
 * MCP Handler - Handles Model Context Protocol logic
 *
 * This module contains all MCP-specific functionality including
 * tool definitions, request handling, and response formatting.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import logger from './logger.js';

export default class MCPServer {
    constructor(wsServer) {
        this.wsServer = wsServer;
    }

    getServer() {
        // Initialize stateless MCP server
        const mcpServer = new McpServer(
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

        // Register tools with the stateless MCP server
        this.setupMCPTools(mcpServer);
        return mcpServer;
    }

    setupMCPTools(mcpServer) {
        // Register tools/list handlers
        mcpServer.registerTool(
            'get_xd_connection_status',
            {
                description: 'Check if Adobe XD plugin is connected and ready to provide data',
            },
            async () => await this.getConnectionStatus()
        );

        mcpServer.registerTool(
            'get_selected_xd_node',
            {
                description:
                    'Get details of the currently selected node/element in Adobe XD. Returns comprehensive specifications including dimensions, visual properties, typography, and more.',
            },
            async () => await this.getSelectedNodeJSON()
        );
        );
    }

    // MCP tool to get connection status
    async getConnectionStatus() {
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

    // MCP tool to get selected node JSON
    async getSelectedNodeJSON() {
        try {
            if (!this.wsServer.isConnected()) {
                throw new Error('No Adobe XD plugin connected. Please ensure the XD plugin is installed and running.');
            }

            const selectedNodeJSON = await this.wsServer.requestSelectedNodeJSON();
            if (!selectedNodeJSON) {
                throw new Error('Export failed. Please ensure node is selected in Adobe XD and try again');
            }

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(selectedNodeJSON, null, 2),
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

    // Stateless MCP request handler, that creates server & transport on the fly
    async handleRequest(req, res) {
        try {
            const server = this.getServer();
            const transport = new StreamableHTTPServerTransport({
                sessionIdGenerator: undefined,
            });

            res.on('close', () => {
                transport.close();
                server.close();
            });

            await server.connect(transport);
            await transport.handleRequest(req, res, req.body);
        } catch (error) {
            logger.server('mcp-request-error', 'Error handling MCP request:', error);

            if (!res.headersSent) {
                res.status(500).json({
                    jsonrpc: '2.0',
                    error: {
                        code: -32603,
                        message: 'Internal server error',
                    },
                    id: null,
                });
            }
        }
    }
}
