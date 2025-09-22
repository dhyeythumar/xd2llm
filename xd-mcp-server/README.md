# XD MCP Server

A Model Context Protocol (MCP) server that bridges Adobe XD plugins with Large Language Models (LLMs), enabling AI assistants to interact with XD design elements and extract comprehensive design specifications.

## 🚀 Features

-   **Real-time Communication**: WebSocket and HTTP communication between XD plugins and LLMs
-   **Comprehensive Design Specs**: Extract detailed element specifications including dimensions, typography, colors, and visual properties
-   **Multiple Formats**: Support for JSON and SCSS output formats
-   **Auto-reconnection**: Robust connection handling with automatic reconnection
-   **Easy Integration**: Simple integration with existing XD plugins

## 📋 Prerequisites

-   Node.js 22.0.0 or higher
-   Adobe XD with plugin development enabled
-   An MCP-compatible LLM client (like Claude Desktop, Cursor, etc.)

## 🛠 Installation

1. **Clone or download this repository**

    ```bash
    git clone <repository-url>
    cd xd-mcp-server
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Start the MCP server**

    ```bash
    npm start
    ```

    For development with auto-reload:

    ```bash
    npm run dev
    ```

## 🔧 Configuration

### MCP Client Configuration

Add the following to your MCP client configuration (e.g., Claude Desktop config):

```json
{
    "mcpServers": {
        "xd-mcp-server": {
            "command": "node",
            "args": ["/path/to/xd-mcp-server/src/server.js"],
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

### 2. `get_selected_xd_node` (TODO :: check this)

Get comprehensive details of the currently selected XD element.

**Parameters:**

-   `format` (string, optional): Output format - "json"
-   `includeMetadata` (boolean, optional): Include extraction metadata (default: true)

**Example Usage:**

```
Get the selected XD node details in JSON format
```

## 📊 Data Structure (TODO :: Update this)

The server returns comprehensive design specifications:

```json
{
    "basic": {
        "name": "Button Text",
        "type": "Text",
        "guid": "...",
        "visible": true,
        "locked": false
    },
    "dimensions": {
        "globalBounds": { "x": 100, "y": 200, "width": 120, "height": 40 },
        "localBounds": { "x": 0, "y": 0, "width": 120, "height": 40 }
    },
    "visual": {
        "opacity": 1,
        "blendMode": "normal",
        "fill": {
            "type": "Color",
            "color": { "r": 255, "g": 255, "b": 255, "a": 1, "hex": "#ffffff" }
        }
    },
    "typography": {
        "content": "Click me",
        "fontFamily": "Arial",
        "fontSize": 16,
        "fontStyle": "Bold"
    }
}
```

## 🔄 Communication Flow

```
LLM Client ←→ MCP Server ←→ Adobe XD Plugin
    ↑              ↑              ↑
  Tools      WebSocket/HTTP     Bridge
```

1. **LLM** calls MCP tool (e.g., "get selected XD node")
2. **MCP Server** processes request and communicates with XD plugin
3. **XD Plugin** extracts design data and sends back to server
4. **MCP Server** formats and returns data to LLM

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
# Check server health
curl http://localhost:6000/health

# Send test selection data
curl -X POST http://localhost:6000/xd/selection \
  -H "Content-Type: application/json" \
  -d '{"data": {"basic": {"name": "Test", "type": "Rectangle"}}}'
```

## 📝 Development (TODO :: update this based updated project structure)

### Project Structure

```
xd-mcp/
├── src/
│   └── server.js              # Main MCP server
├── package.json
└── README.md
```

### Adding New Tools

1. Add tool definition in `setupMCPTools()` method
2. Implement handler in `CallToolRequestSchema` handler
3. Add corresponding functionality in XD plugin bridge

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
