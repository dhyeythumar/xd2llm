/**
 * MCP Handler - Handles Model Context Protocol logic
 *
 * This module contains all MCP-specific functionality including
 * tool definitions, request handling, and response formatting.
 */
import type { Request, Response } from 'express';
import type { Maybe, StringRecord } from './types.js';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import WSServer from './ws.server.js';
import Logger from './logger.js';
import { MCP_SERVER_NAME, MSGS } from './const.js';

type TextContent = {
    type: 'text';
    text: string;
};

type ImageContent = {
    type: 'image';
    data: string;
    mimeType: 'image/png';
};

type MCPResponse = {
    content: Array<TextContent | ImageContent>;
    isError: boolean;
};

export default class CustomMCPServer {
    private readonly logger = new Logger(MCP_SERVER_NAME);
    private wsServer: WSServer;

    constructor(wsServer: WSServer) {
        this.wsServer = wsServer;
    }

    private getErrorResponse(message: StringRecord) {
        const response: MCPResponse = {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(message, null, 2),
                },
            ],
            isError: true,
        };
        return response;
    }

    private getSuccessResponse(message: StringRecord, extraDetails?: TextContent | ImageContent) {
        const response: MCPResponse = {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(message, null, 2),
                },
            ],
            isError: false,
        };

        // Add extra details if provided
        if (extraDetails && Object.keys(extraDetails).length > 0) {
            response.content.push(extraDetails);
        }
        return response;
    }

    private getServer(): McpServer {
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

    private setupMCPTools(mcpServer: McpServer) {
        // Register tools/list handlers
        mcpServer.registerTool(
            'get_xd_connection_status',
            {
                description: 'Check if Adobe XD plugin is connected and ready to provide data',
            },
            () => this.getConnectionStatus()
        );

        mcpServer.registerTool(
            'get_selected_xd_node',
            {
                description:
                    'Get details of the currently selected node in Adobe XD in JSON & image format. Returns comprehensive design specifications including dimensions, visual properties, typography, base64 encoded image, and more.',
            },
            async () => await this.getSelectedNode()
        );
    }

    // MCP tool to get connection status
    private getConnectionStatus() {
        try {
            return this.getSuccessResponse({
                connected: this.wsServer.isXDClientConnected(),
                connectionId: this.wsServer.getXDClientConnectionId(),
            });
        } catch (error: unknown) {
            return this.getErrorResponse({
                error: (error as Error).message,
                context: MSGS.TOOL_ERROR,
            });
        }
    }

    // MCP tool to get selected node
    private async getSelectedNode() {
        try {
            const selectedNode = await this.wsServer.requestSelectedNode();
            if (!selectedNode || !selectedNode.json || !selectedNode.image) {
                throw new Error(MSGS.CONTENT_MISSING_ERROR);
            }

            return this.getSuccessResponse(selectedNode.json, {
                type: 'image',
                data: selectedNode.image,
                mimeType: 'image/png',
            });
        } catch (error: unknown) {
            return this.getErrorResponse({
                error: (error as Error).message,
                context: MSGS.TOOL_ERROR,
            });
        }
    }

    // Stateless MCP request handler, that creates server & transport on the fly
    async handleRequest(req: Request, res: Response): Promise<void> {
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
            await transport.handleRequest(req, res);
        } catch (error: unknown) {
            this.logger.error(`${MSGS.MCP_REQUEST_ERROR} ${(error as Error).message}`);

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
