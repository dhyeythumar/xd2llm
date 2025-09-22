/**
 * MCP Handler - Handles Model Context Protocol logic
 *
 * This module contains all MCP-specific functionality including
 * tool definitions, request handling, and response formatting.
 */

import logger from './logger.js';

export class MCPHandler {
    constructor(wsServer) {
        this.wsServer = wsServer;
    }

    // Handle MCP HTTP requests
    async handleMCPRequest(req, res) {
        try {
            const { method, params } = req.body;

            logger.debug(`MCP HTTP request: ${method}`);

            let response;
            switch (method) {
                case 'tools/list':
                    response = await this.handleListTools();
                    break;

                case 'tools/call':
                    response = await this.handleToolCall(params);
                    break;

                default:
                    throw new Error(`Unknown MCP method: ${method}`);
            }

            res.json(response);
        } catch (error) {
            logger.error('MCP HTTP request error:', error);
            res.status(500).json({
                error: {
                    code: -1,
                    message: error.message,
                },
            });
        }
    }

    async handleListTools() {
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
                    inputSchema: {
                        type: 'object',
                        properties: {},
                    },
                },
            ],
        };
    }

    async handleToolCall(params) {
        const { name } = params;

        try {
            switch (name) {
                case 'get_xd_connection_status':
                    return await this.handleGetConnectionStatus();

                case 'get_selected_xd_node':
                    return await this.handleGetSelectedNode();

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
    }

    async handleGetConnectionStatus() {
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
            if (!this.wsServer.isConnected()) {
                throw new Error('No Adobe XD plugin connected. Please ensure the XD plugin is installed and running.');
            }

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
}
