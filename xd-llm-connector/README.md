# XD LLM Connector

A server that bridges Adobe XD plugins with Large Language Models (LLMs), enabling AI assistants to query XD design elements and extract comprehensive design specifications in real-time.

> **📖 For detailed setup, configuration, testing, and troubleshooting, see the [Setup Guide](./SETUP.md)**.

## 🚀 Key Features

-   **🔄 Stateless Architecture**: On-demand server creation with automatic cleanup per request.
-   **⚡ Real-time Communication**: WebSocket bridge between LLMs and Adobe XD.
-   **🛠️ MCP Integration**: Modern MCP SDK with simplified tool registration.
-   **📊 Design Data Extraction**: Comprehensive specs including dimensions, typography, colors, and images.

## 🎯 Available MCP Tools

### `get_xd_connection_status`

Check if the Adobe XD plugin is connected and ready.

**Example Prompts:**

```
Check XD connection status
Is Adobe XD connected?
Verify XD plugin connection
```

### `get_selected_xd_node`

Get comprehensive details of the currently selected XD element in JSON and image formats in real-time.

**Example Prompts:**

```
Get the selected XD node details
What are the properties of the selected XD element?
Extract design specifications from the current selection inside Adobe XD using XD mcp tools
Analyze the selected design element inside Adobe XD using XD mcp tools
Get design tokens from selected component inside Adobe XD
```

## 🏗️ Architecture

The server uses a **stateless, on-demand** architecture where each request creates a fresh MCP server instance, processes the request, and automatically cleans up. This design ensures memory efficiency, error isolation, and scalability.

### Core Components

**Stateless MCP Server (`mcp.server.ts`)**
-   Creates fresh server instance per request with automatic cleanup
-   Registers tools using modern `registerTool()` API
-   Uses `StreamableHTTPServerTransport` for HTTP handling
-   Ensures request failures don't affect other operations

**Unified HTTP Server (`server.ts`)**
-   Handles both MCP HTTP endpoints (`/mcp`) and WebSocket communication
-   Provides testing endpoints (`/health`, `/selection`)
-   Manages CORS and request parsing

**WebSocket Server (`ws.server.ts`)**
-   EventEmitter-based real-time communication with XD plugin
-   Implements request-response pattern without data storage
-   Maintains single connection to Adobe XD

## 📝 Development

### Project Structure

```
xd-server/
├── src/
│   ├── server.ts              # Unified HTTP server (main entry point)
│   ├── mcp.server.ts          # Stateless MCP server implementation
│   ├── ws.server.ts           # WebSocket server with EventEmitter
│   └── logger.ts              # Logging utilities
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

1. **Register the tool** in the `setupMCPTools()` method in `mcp.server.ts`:

    ```javascript
    mcpServer.registerTool(
        'your_tool_name',
        { description: 'Tool description' },
        async () => await this.handleYourTool()
    );
    ```

2. **Implement the handler** in the same class:

    ```javascript
    async handleYourTool() {
        return { content: [{ type: 'text', text: 'result' }] };
    }
    ```

3. **Add a WebSocket method** in `ws.server.ts` if needed
4. **Update the XD plugin** to handle new message types if required

> Note: This server is part of the [XD2LLM](../README.md) project.

## 📚 References

-   [Model Context Protocol](https://modelcontextprotocol.io/)
