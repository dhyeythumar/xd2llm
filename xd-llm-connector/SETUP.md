# XD LLM Connector Setup Guide

> **📖 Documentation Structure**:
>
> -   **[README.md](README.md)**: Quick overview, features, architecture, and basic usage
> -   **SETUP.md** (this file): Detailed setup instructions, troubleshooting, and monitoring

This guide provides comprehensive setup instructions for the XD LLM Connector, which bridges Adobe XD with LLMs using a stateless, on-demand MCP server architecture with EventEmitter-based real-time communication.

## 🛠 Quick Start

```bash
# 1. Install dependencies
cd xd-llm-connector
npm install

# 2. Start the server (production mode)
npm start

# 3. Verify server is running
curl http://localhost:4000/health
```

For development with auto-reload, use `npm run dev` instead of `npm start`.

## 🔧 Configuration

### MCP Client Configuration

Add the following to your MCP client configuration (e.g., Cursor Desktop config):

```json
{
    "mcpServers": {
        "xd-mcp-server": {
            "url": "http://localhost:4000/mcp"
        }
    }
}
```

## 🧪 Testing & Verification

### Server Health Check

```bash
curl http://localhost:4000/health
```

**Expected response when XD plugin is not connected:**

```json
{
    "status": "ok",
    "xdPlugin": {
        "connected": false,
        "connectionId": null
    },
    "serverInfo": {
        "port": 4000,
        "name": "xd-llm-connector",
        "version": "1.0.0",
        "pid": 12345,
        "startTime": "2025-09-23T09:43:53.427Z"
    }
}
```

Once Adobe XD is open with the plugin loaded, `xdPlugin.connected` will be `true` with a UUID in `connectionId`.

### Testing with MCP Client

In your MCP client (Claude Desktop, Cursor, etc.), try these prompts:

```
Check XD connection status
Get the selected XD node details
What are the properties of the selected element?
```

### Testing with MCP Inspector

The MCP Inspector provides a web interface for testing and debugging MCP servers.

```bash
# Launch inspector (server must be running)
npm run inspector
```

**Inspector Setup:**

1. Select "HTTP" as transport method
2. Enter server URL: `http://localhost:4000/mcp`
3. Click "Connect"

**Testing Workflow:**

-   **Connectivity**: Verify connection and check tools are listed
-   **Tools**: Test `get_xd_connection_status` and `get_selected_xd_node`
-   **Real-time**: Select elements in Adobe XD and test with different selections

## 🚨 Troubleshooting

### Connection Issues

| Issue                              | Possible Causes                                                         | Solutions                                                                                                                                                                               |
| ---------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **"No Adobe XD plugin connected"** | • XD plugin not running<br>• Bridge not initialized<br>• Network issues | 1. Ensure XD plugin is loaded and active<br>2. Check browser console in XD for errors<br>3. Verify server is running: `curl http://localhost:4000/health`<br>4. Check firewall settings |
| **"Connection refused"**           | • Server not running<br>• Incorrect port<br>• Firewall blocking         | 1. Start server: `npm start`<br>2. Verify port configuration matches in server and plugin<br>3. Check firewall allows port 4000                                                         |
| **"No element selected"**          | • Nothing selected in XD<br>• Selection not detected                    | 1. Select an element in Adobe XD<br>2. Test with `/selection` endpoint<br>3. Verify selection handler in plugin                                                                         |

### MCP & Performance Issues

**MCP Request Failures:**

-   Check server logs for MCP-specific errors
-   Verify client configuration uses HTTP URL format: `http://localhost:4000/mcp`
-   Test `/health` endpoint first to confirm server is responding
-   Check browser developer tools for CORS issues

**Performance Problems:**

-   Monitor server logs for timing information
-   Check XD plugin response times
-   Consider request batching for multiple operations
-   Verify network connectivity between components

## 📊 Monitoring & Logs

**Server Logs** - Monitor for:

-   XD plugin connections/disconnections
-   MCP server creation and cleanup
-   Tool calls and responses
-   WebSocket and HTTP events
-   Errors and timing information

**XD Plugin Logs** - Check browser console in Adobe XD for:

-   Connection status and WebSocket events
-   Selection change events
-   Error messages
