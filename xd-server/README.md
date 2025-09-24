# XD Server (with MCP & Websocket capabilities)

A server that bridges Adobe XD plugins with Large Language Models (LLMs), enabling AI assistants to query the XD design elements and extract comprehensive design specifications in real-time.

### **For Quick start, Configuration, Testing, Troubleshooting & Monitoring check the [Setup Guide](./SETUP.md)**.

## 🚀 Features

### Core Architecture

-   **Stateless Architecture**: On-demand MCP server creation for optimal memory management and error isolation
-   **Real-time Communication**: EventEmitter-based WebSocket communication for instant data exchange
-   **Single Connection Architecture**: Enforces one XD plugin connection for simplified state management
-   **Modern MCP SDK Integration**: Leverages latest MCP SDK with `registerTool()` API for simplified tool management

### Design Data Extraction

-   **Comprehensive Design Specs**: Extract detailed element specifications including dimensions, typography, colors, and visual properties
-   **Optimized Image Export**: Base64 PNG export with configurable scaling for AI analysis

### Performance & Reliability

-   **Request-Response Pattern**: Direct communication between LLMs and XD plugins without data caching
-   **Auto-cleanup**: Automatic server and transport cleanup per request
-   **Easy Integration**: Simple integration with existing XD plugins

## 📋 Prerequisites

-   **Node.js** 22.0.0 or higher
-   **Adobe XD** with plugin development enabled
-   **MCP-compatible LLM client** (like Claude Desktop, Cursor, etc.)

## 🎯 Available MCP Tools

### 1. `get_xd_connection_status`

Check if Adobe XD plugin is connected and ready.

**Example Usage:**

```
Check XD connection status
Is Adobe XD connected?
```

### 2. `get_selected_xd_node`

Get comprehensive details of the currently selected XD element's in JSON & Image formats in real-time. This tool sends a request to the connected XD plugin and waits for the response.

**Example Usage:**

```
Get the selected XD node details
What are the properties of the selected element?
Extract design specifications from the current selection
```

## 🔄 Real-time Communication Flow

```
LLM Client ←→ Stateless MCP Server ←→ Adobe XD Plugin
    ↑               ↑                      ↑
HTTP/MCP      StreamableHTTP           WebSocket
```

1. **LLM** calls MCP tool via HTTP (e.g., "get selected XD node")
2. **Unified Server** receives request at `/mcp` endpoint
3. **MCP Server** creates fresh server instance with `StreamableHTTPServerTransport`
4. **Tools** are registered dynamically using `registerTool()` API
5. **WebSocket Server** sends request to XD plugin and sets up event listener
6. **XD Plugin** processes request and sends response back
7. **WebSocket Server** emits event with response data
8. **Promise resolves** with fresh data from XD
9. **Server & Transport** are cleaned up automatically after response

## 🏗️ Architecture

The server uses a **stateless, on-demand** architecture for optimal performance:

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
├── README.md
└── SETUP.md                   # Detailed setup instructions
```

### Adding New Tools

1. **Add tool registration** in `setupMCPTools()` method in `mcp.server.js`:

    ```javascript
    mcpServer.registerTool(
        'your_tool_name',
        { description: 'Tool description' },
        async () => await this.handleYourTool()
    );
    ```

2. **Implement tool handler** in the same class:

    ```javascript
    async handleYourTool() {
        // Your tool logic here
        return { content: [{ type: 'text', text: 'result' }] };
    }
    ```

3. **Add WebSocket method** in `ws.server.js` if needed (following EventEmitter pattern)
4. **Update XD plugin** to handle new message types if required

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

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Integration with XD Ecosystem

This server is part of the larger [XD Ecosystem](../README.md) that includes:

-   **XD Plugin**: Real-time design data extraction from Adobe XD
-   **WebSocket Bridge**: EventEmitter-based real-time communication
-   **AI-Powered Workflows**: Direct integration with LLMs for design-to-code

## 🔗 Related Projects

-   [Adobe XD Plugin API](https://adobexdplatform.com/plugin-docs/)
-   [Model Context Protocol](https://modelcontextprotocol.io/)
-   [XD Plugin Documentation](../xd-plugin/README.md)

## 📈 Recent Updates

### New Features

-   **Enhanced Error Handling**: Better error isolation and reporting
-   **Improved Logging**: Structured logging for better debugging
-   **Updated MCP SDK**: Latest SDK integration with modern APIs

## 💡 Use Cases

-   **Design System Documentation**: Extract design tokens and specifications
-   **Code Generation**: Generate CSS/SCSS from XD designs
-   **AI Design Review**: Automated design specification analysis
-   **Design-to-Code Workflows**: Bridge design and development processes
-   **Accessibility Audits**: Extract and analyze design properties for accessibility
