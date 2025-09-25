# XD Server (with MCP & Websocket capabilities)

A server that bridges Adobe XD plugins with Large Language Models (LLMs), enabling AI assistants to query the XD design elements and extract comprehensive design specifications in real-time.

> **📖 For detailed setup, configuration, testing, and troubleshooting, see the [Setup Guide](./SETUP.md)**

## 🚀 Key Features

-   **🔄 Stateless Architecture**: On-demand server creation for optimal performance and error isolation
-   **⚡ Real-time Communication**: EventEmitter-based WebSocket communication with XD plugins
-   **🛠️ MCP Integration**: Modern MCP SDK with simplified tool registration
-   **📊 Design Data Extraction**: Comprehensive specs including dimensions, typography, colors, and images
-   **🧹 Auto-cleanup**: Automatic server cleanup per request for memory efficiency

## 📋 Prerequisites

-   **Node.js** 22.0.0 or higher
-   **Adobe XD** with plugin development enabled
-   **MCP-compatible LLM client** (Claude Desktop, Cursor, etc.)

## 🎯 Available MCP Tools

### `get_xd_connection_status`

Check if Adobe XD plugin is connected and ready.

**Example Prompts:**

```
Check XD connection status
Is Adobe XD connected?
Verify XD plugin connection
```

### `get_selected_xd_node`

Get comprehensive details of the currently selected XD element in JSON & Image formats in real-time.

**Example Prompts:**

```
Get the selected XD node details
What are the properties of the selected element?
Extract design specifications from the current selection
Analyze the selected design element
Get design tokens from selected component
```

## 🔄 How It Works

1. **LLM** calls MCP tool via HTTP
2. **Server** creates fresh MCP instance with `StreamableHTTPServerTransport`
3. **WebSocket** sends request to XD plugin and waits for response
4. **XD Plugin** processes request and sends data back
5. **Server** returns fresh data to LLM and cleans up automatically

## 🏗️ Architecture

The server uses a **stateless, on-demand** architecture:

### Stateless MCP Server (`mcp.server.js`)

-   **On-demand Server Creation**: Fresh MCP server instance per request
-   **Dynamic Tool Registration**: Tools registered using modern `registerTool()` API
-   **Automatic Cleanup**: Server and transport destroyed after each request
-   **Memory Efficient**: No persistent connections or state management
-   **Error Isolation**: Request failures don't affect other requests

### Unified HTTP Server (`server.js`)

-   Single process handling both MCP HTTP endpoints and WebSocket communication
-   Routes `/mcp` requests to stateless MCP handler
-   Provides testing endpoints (`/health`, `/selection`)
-   Manages CORS and request parsing

### WebSocket Server (`ws.server.js`)

-   Extends Node.js EventEmitter for real-time communication
-   Manages single XD plugin connection
-   Implements request-response pattern without data storage
-   Provides real-time data fetching from Adobe XD

### 🏆 Architecture Benefits

**Stateless Design:**

-   ✅ **Memory Efficient**: No memory leaks from persistent connections
-   ✅ **Error Isolation**: Request failures don't affect other operations
-   ✅ **Scalable**: Each request is independent and stateless
-   ✅ **Simple Debugging**: Easy to trace individual request lifecycles

**Modern MCP SDK Integration:**

-   ✅ **Simplified Tool Registration**: Uses `registerTool()` instead of manual schema handling
-   ✅ **Automatic Protocol Handling**: SDK manages MCP protocol details
-   ✅ **Transport Abstraction**: `StreamableHTTPServerTransport` handles HTTP complexities
-   ✅ **Standards Compliant**: Follows latest MCP specifications

## 📝 Development

### Project Structure

```
xd-server/
├── src/
│   ├── server.js              # Unified HTTP server (main entry point)
│   ├── mcp.server.js          # Stateless MCP server implementation
│   ├── ws.server.js           # WebSocket server with EventEmitter
│   └── logger.js              # Logging utilities
├── package.json
└── SETUP.md                   # Detailed setup instructions
```

### Development Commands

```bash
# Install dependencies
npm install

# Start in development mode (auto-reload)
npm run dev

# Start in production mode
npm start

# Check server health
curl http://localhost:4000/health
```

### Adding New Tools

1. **Register tool** in `setupMCPTools()` method in `mcp.server.js`:

    ```javascript
    mcpServer.registerTool(
        'your_tool_name',
        { description: 'Tool description' },
        async () => await this.handleYourTool()
    );
    ```

2. **Implement handler** in the same class:

    ```javascript
    async handleYourTool() {
        return { content: [{ type: 'text', text: 'result' }] };
    }
    ```

3. **Add WebSocket method** in `ws.server.js` if needed
4. **Update XD plugin** to handle new message types if required

## 📄 License

MIT License - see [LICENSE](../LICENSE) file for details

## 🔗 Integration

This server is part of the [XD Ecosystem](../README.md) that includes:

-   **XD Plugin**: Real-time design data extraction from Adobe XD
-   **WebSocket Bridge**: EventEmitter-based real-time communication
-   **AI-Powered Workflows**: Direct integration with LLMs for design-to-code

## 🔗 Related Projects

-   [Adobe XD Plugin API](https://adobexdplatform.com/plugin-docs/)
-   [Model Context Protocol](https://modelcontextprotocol.io/)
-   [XD Plugin Documentation](../xd-plugin/README.md)
