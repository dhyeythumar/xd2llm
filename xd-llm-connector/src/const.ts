export const SERVER_NAME = 'xd-llm-connector';
export const WS_SERVER_NAME = 'ws-server';
export const MCP_SERVER_NAME = 'mcp-server';

export const PORT = 4000;

export const WS_RESPONSE_TIMEOUT_MS = 5000;

export const MSGS = {
    // Info messages
    SERVER_LISTENING: 'Server listening...',
    SERVER_CLOSED: 'Server closed successfully!',

    // Warning messages
    CONNECTION_LIMIT_EXCEEDED: 'Additional connection rejected, only one connection allowed!',
    UNKNOWN_MESSAGE: 'Received unknown message type',

    // Server Error messages
    SERVER_ERROR: 'Server error :: ',
    HTTP_SERVER_NOT_INITIALIZED: 'HTTP server not initialized',
    HTTP_SERVER_CLOSE_TIMEOUT: 'HTTP server close timeout, forcing shutdown!',

    // WebSocket Error messages
    NO_CONNECTION: 'No Adobe XD plugin connected. Please ensure the XD plugin is installed and running.',
    REQUEST_TIMEOUT: 'No response from Adobe XD plugin. Please select a node and try again.',
    SEND_MSG_FAILURE: 'Failed to send message to Adobe XD plugin.',
    MESSAGE_PARSE_ERROR: 'Failed to parse websocket message.',

    // MCP Error messages
    MCP_REQUEST_ERROR: 'Error while handling MCP request :: ',
    CONTENT_MISSING_ERROR: 'No proper data returned from Adobe XD plugin. Please select a node and try again.',
    TOOL_ERROR: 'Please check with tool developer for more details.',
} as const;
