# XD Server Setup Guide

> **📖 Documentation Structure**:
>
> -   **[README.md](README.md)**: Quick overview, features, architecture, and basic usage
> -   **SETUP.md** (this file): Detailed setup instructions, troubleshooting, and monitoring

This guide provides comprehensive setup instructions for the XD Server, which bridges Adobe XD with LLMs using a stateless, on-demand MCP server architecture with EventEmitter-based real-time communication.

## 🛠 Quick Start

1. **Install dependencies**

    ```bash
    cd xd-server
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
    curl http://localhost:4000/health
    ```

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

## 🧪 Testing the Setup

### 1. Test Server Health

    ```bash
    # Check server health and connection status
    curl http://localhost:4000/health

    # Expected response:
    {
        "status": "ok",
        "xdPlugin": {
            "connected": false,
            "connectionId": null
        },
        "serverInfo": {
            "port": 6000,
            "name": "xd-mcp-server",
            "version": "1.0.0",
            "pid": 12345,
            "startTime": "2025-09-23T09:43:53.427Z"
        }
    }
    ```

### 2. Test XD Plugin Connection

1. Open Adobe XD
2. Load your plugin
3. Check the server health again - `xdPlugin.connected` should be `true` and `xdPlugin.connectionId` should show a UUID

### 3. Test MCP Tools with MCP Client

In your MCP client (Claude Desktop, Cursor, etc.), try:

```
Check XD connection status
Get the selected XD node details
What are the properties of the selected element?
```

### 4. Testing with MCP Inspector

The MCP Inspector is an interactive developer tool for testing and debugging MCP servers. It provides a web interface to inspect server capabilities, test tools, and monitor server interactions in real-time.

1. **Start the XD MCP Server:**

    ```bash
    npm start
    ```

2. **Launch MCP Inspector:**

    ```bash
    npm run inspector
    ```

3. **Connect to Your Server:**
    - In the Inspector's Server Connection pane, select "HTTP" as the transport method
    - Enter the server URL: `http://localhost:4000/mcp`
    - Click "Connect"

### 5. Testing Workflow with inspector

1. **Basic Connectivity Test:**

    - Connect to the server
    - Verify the connection status
    - Check that tools are listed in the Tools tab

2. **Tool Testing:**

    - Test `get_xd_connection_status` tool
    - Test `get_selected_xd_node` tool (requires XD plugin connected)
    - Verify tool responses and error handling

3. **Real-time Testing:**
    - Select elements in Adobe XD
    - Test tools with different selections
    - Monitor notifications for real-time updates

## 🚨 Troubleshooting

### Common Issues

#### "No Adobe XD plugin connected"

**Causes:**

-   XD plugin not running
-   Bridge not initialized
-   Network connectivity issues

**Solutions:**

1. Ensure XD plugin is loaded and active
2. Check browser console in XD for error messages
3. Verify server is running on correct port
4. Check firewall settings

#### "Connection refused" or "ECONNREFUSED"

**Causes:**

-   MCP server not running
-   Wrong port configuration
-   Firewall blocking connections

**Solutions:**

1. Start the MCP server: `npm start`
2. Check port configuration in both server and plugin
3. Verify firewall allows connections to port 6000

#### "No element selected"

**Causes:**

-   No element selected in XD
-   Selection change not detected

**Solutions:**

1. Select an element in XD
2. Try the MCP tool again or test the `/selection` endpoint
3. Check if selection change handler is properly connected in the XD plugin

#### MCP Request Issues

**Causes:**

-   Stateless server creation failures
-   Tool registration problems
-   Transport initialization errors

**Solutions:**

1. Check server logs for MCP-specific errors
2. Verify MCP client configuration uses HTTP URL format
3. Test with `/health` endpoint first
4. Ensure no CORS issues by checking browser developer tools

#### Performance Issues

**Causes:**

-   Frequent server creation overhead
-   Network latency to XD plugin
-   Large selection data responses

**Solutions:**

1. Monitor server logs for timing information
2. Consider request batching if needed
3. Check XD plugin response times
4. Verify network connectivity between components

## 📊 Monitoring

### Server Logs

The server logs important events:

-   XD plugin connections/disconnections
-   Stateless MCP server creation and cleanup
-   Real-time selection data requests and responses
-   MCP tool calls and results
-   WebSocket events and errors
-   EventEmitter events
-   HTTP/MCP request handling

### XD Plugin Logs

Check the browser console in Adobe XD for:

-   Connection status messages
-   WebSocket events
-   Error messages
-   Selection change events
