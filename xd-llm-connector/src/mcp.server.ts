/**
 * MCP Handler - Handles Model Context Protocol logic
 *
 * This module contains all MCP-specific functionality including
 * tool definitions, request handling, and response formatting.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import logger from './logger.js';
import WSServer from './ws.server.js';
import { Request, Response } from 'express';

interface MCPResponse {
    content: Array<{
        type: string;
        text?: string;
        data?: string;
        mimeType?: string;
        [key: string]: any;
    }>;
    isError?: boolean;
}

export default class MCPServer {
    private wsServer: WSServer;

    constructor(wsServer: WSServer) {
        this.wsServer = wsServer;
    }

    #returnMcpErrorResponse(message: any): MCPResponse {
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(message, null, 4),
                },
            ],
            isError: true,
        };
    }

    #returnMcpSuccessResponse(message: any, extraDetails: any = {}): MCPResponse {
        // Initialize response with message
        const response: MCPResponse = {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(message, null, 4),
                },
            ],
        };

        // Add extra details if provided
        if (extraDetails && Object.keys(extraDetails).length > 0) {
            response.content.push(extraDetails);
        }

        return response;
    }

    #getServer(): McpServer {
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
        this.#setupMCPTools(mcpServer);
        return mcpServer;
    }

    #setupMCPTools(mcpServer: McpServer): void {
        // Register tools/list handlers
        mcpServer.registerTool(
            'get_xd_connection_status',
            {
                description: 'Check if Adobe XD plugin is connected and ready to provide data',
            },
            async () => await this.#getConnectionStatus()
        );

        mcpServer.registerTool(
            'get_selected_xd_node',
            {
                description:
                    'Get details of the currently selected node in Adobe XD in JSON & image format. Returns comprehensive design specifications including dimensions, visual properties, typography, base64 encoded image, and more.',
            },
            async () => await this.#getSelectedNode()
        );
    }

    // MCP tool to get connection status
    async #getConnectionStatus(): Promise<any> {
        return this.#returnMcpSuccessResponse({
            connected: this.wsServer.isConnected(),
            connectionId: this.wsServer.getConnectionId(),
        });
    }

    // MCP tool to get selected node
    async #getSelectedNode(): Promise<any> {
        try {
            if (!this.wsServer.isConnected()) {
                throw new Error('No Adobe XD plugin connected. Please ensure the XD plugin is installed and running.');
            }

            const selectedNode = await this.wsServer.requestSelectedNode();
            if (!selectedNode || !selectedNode.json || !selectedNode.image) {
                throw new Error(
                    'Failed to get selected node. Please ensure node is selected in Adobe XD and try again'
                );
            }

            return this.#returnMcpSuccessResponse(selectedNode.json, {
                type: 'image',
                data: selectedNode.image,
                mimeType: 'image/png',
            });
        } catch (error: any) {
            return this.#returnMcpErrorResponse({
                message: 'Error getting selection from Adobe XD',
                error: error.message,
            });
        }
    }

    // Stateless MCP request handler, that creates server & transport on the fly
    async handleRequest(req: Request, res: Response): Promise<void> {
        try {
            const server = this.#getServer();
            const transport = new StreamableHTTPServerTransport({
                sessionIdGenerator: undefined,
            });

            res.on('close', () => {
                transport.close();
                server.close();
            });

            await server.connect(transport);
            await transport.handleRequest(req, res);
        } catch (error: any) {
            logger.server('mcp-request-error', `Error handling MCP request: ${error}`);

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
