# XD MCP Server

A Model Context Protocol (MCP) server that bridges Adobe XD plugins with Large Language Models (LLMs), enabling AI assistants to interact with XD design elements and extract comprehensive design specifications in real-time.

## 🚀 Features

-   **Real-time Communication**: EventEmitter-based WebSocket communication for instant data exchange
-   **Single Connection Architecture**: Enforces one XD plugin connection for simplified state management
-   **Comprehensive Design Specs**: Extract detailed element specifications including dimensions, typography, colors, and visual properties
-   **Multiple Output Formats**: Support for JSON and SCSS output formats
-   **Request-Response Pattern**: Direct communication between LLMs and XD plugins without data caching
-   **Auto-cleanup**: Automatic event listener cleanup and error handling
-   **Easy Integration**: Simple integration with existing XD plugins

## 📋 Prerequisites

-   Node.js 22.0.0 or higher
-   Adobe XD with plugin development enabled
-   An MCP-compatible LLM client (like Claude Desktop, Cursor, etc.)

## 🛠 Quick Start

1. **Install dependencies**

    ```bash
    cd xd-mcp-server
    npm install
    ```

2. **Start the server**

    ```bash
    # Production mode
    npm start
    
    # Development mode with auto-reload
    npm run dev
    ```

3. **Test the server**

    ```bash
    # Check server health
    curl http://localhost:6000/health
    
    # Test selection endpoint (requires XD plugin connected)
    curl http://localhost:6000/selection
    ```

## 🔧 Configuration

### MCP Client Configuration

Add the following to your MCP client configuration (e.g., Claude Desktop config):

```json
{
    "mcpServers": {
        "xd-mcp-server": {
            "command": "node",
            "args": ["/absolute/path/to/xd-mcp-server/src/mcp.server.js"],
            "env": {
                "XD_MCP_PORT": "6000"
            }
        }
    }
}
```

### Environment Variables

-   `XD_MCP_PORT`: Port for HTTP/WebSocket server (default: 6000)

## 🎯 Available MCP Tools

### 1. `get_xd_connection_status`

Check if Adobe XD plugin is connected and ready.

**Example Usage:**

```
Check XD connection status
Is Adobe XD connected?
```

### 2. `get_selected_xd_node`

Get comprehensive details of the currently selected XD element in real-time. This tool sends a request to the connected XD plugin and waits for the response.

**Example Usage:**

```
Get the selected XD node details
What are the properties of the selected element?
Extract design specifications from the current selection
```

## 🔄 Real-time Communication Flow

```
LLM Client ←→ MCP Server ←→ WebSocket Server ←→ Adobe XD Plugin
    ↑              ↑              ↑                    ↑
  Tools      Event Handlers   EventEmitter          Bridge
```

1. **LLM** calls MCP tool (e.g., "get selected XD node")
2. **MCP Server** calls WebSocket server's request method
3. **WebSocket Server** sends request to XD plugin and sets up event listener
4. **XD Plugin** processes request and sends response back
5. **WebSocket Server** emits event with response data
6. **Promise resolves** with fresh data from XD
7. **MCP Server** formats and returns data to LLM

## 🏗️ Architecture

The server consists of two main components:

### MCP Server (`mcp.server.js`)
- Handles Model Context Protocol communication
- Provides tools: `get_xd_connection_status`, `get_selected_xd_node`
- Processes LLM requests and formats responses

### WebSocket Server (`ws.server.js`)
- Extends Node.js EventEmitter for real-time communication
- Manages single XD plugin connection
- Provides HTTP endpoints for testing (`/health`, `/selection`)
- Implements request-response pattern without data storage

## 🚨 Troubleshooting

### Connection Issues

1. **Check server status:**

    ```bash
    curl http://localhost:6000/health
    ```

2. **Verify XD plugin connection:**

    - Check console in XD plugin for connection logs
    - Ensure firewall allows connections to port 6000

3. **MCP client issues:**
    - Verify MCP client configuration
    - Check client logs for connection errors

### Common Problems

-   **"No Adobe XD plugin connected"**: Ensure XD plugin is running and bridge is initialized
-   **"No element selected"**: Select an element in XD before calling tools
-   **WebSocket connection failed**: Check if port 6000 is available and not blocked

## 🧪 Testing

Test the server manually:

```bash
# Check server health and connection status
curl http://localhost:6000/health

# Test real-time selection data (requires connected XD plugin)
curl http://localhost:6000/selection

# Expected health response
{
  "status": "ok",
  "connected": true,
  "connectionId": "uuid-string"
}
```

## 📝 Development

### Project Structure

```
xd-mcp-server/
├── src/
│   ├── mcp.server.js          # Main MCP server entry point
│   └── ws.server.js           # WebSocket server with EventEmitter
├── package.json
├── README.md
└── SETUP.md                   # Detailed setup instructions
```

### Adding New Tools

1. Add tool definition in `setupMCPTools()` method in `mcp.server.js`
2. Implement handler in `CallToolRequestSchema` handler
3. Add request method in `ws.server.js` if needed (following EventEmitter pattern)
4. Add corresponding message handling in XD plugin bridge

### Development Commands

```bash
# Install dependencies
npm install

# Start in development mode (auto-reload)
npm run dev

# Start in production mode
npm start

# Check server health
curl http://localhost:6000/health

# Test real-time selection
curl http://localhost:6000/selection
```

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Related Projects

-   [Adobe XD Plugin API](https://adobexdplatform.com/plugin-docs/)
-   [Model Context Protocol](https://modelcontextprotocol.io/)
-   Your existing XD plugins in this repository

## 💡 Use Cases

-   **Design System Documentation**: Extract design tokens and specifications
-   **Code Generation**: Generate CSS/SCSS from XD designs
-   **Design Review**: Automated design specification analysis
-   **Accessibility Audits**: Extract and analyze design properties for accessibility
-   **Design-to-Code Workflows**: Bridge design and development processes
