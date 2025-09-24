# XD MCP Server Setup Guide

> **📖 Documentation Structure**:
> - **[README.md](README.md)**: Quick overview, features, architecture, and basic usage
> - **SETUP.md** (this file): Detailed setup instructions, troubleshooting, and monitoring

This guide provides comprehensive setup instructions for the XD MCP Server, which bridges Adobe XD with LLMs using a stateless, on-demand MCP server architecture with EventEmitter-based real-time communication.

## 📋 Quick Start

### 1. Install Dependencies

```bash
cd xd-mcp-server
npm install
```

### 2. Start the Server

```bash
# Option 1: Using npm script
npm start

# Option 2: Development mode with auto-reload
npm run dev
```

### 3. Configure Your MCP Client

#### For Claude Desktop:

1. Open Claude Desktop settings
2. Add the server configuration from `config/claude-desktop.json`
3. Restart Claude Desktop

#### For Cursor:

Add to your Cursor MCP configuration:

```json
{
    "mcpServers": {
        "xd-mcp-server": {
            "url": "http://localhost:6000/mcp"
        }
    }
}
```

**For custom port:**
```json
{
    "mcpServers": {
        "xd-mcp-server": {
            "url": "http://localhost:PORT/mcp"
        }
    }
}
```

## 🧪 Testing the Setup

### 1. Test Server Health

```bash
curl http://localhost:6000/health
```

Expected response:

```json
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

### 3. Test MCP Tools

In your MCP client (Claude Desktop, Cursor, etc.), try:

```
Check XD connection status
Get the selected XD node details
What are the properties of the selected element?
```

### 4. Test Direct Endpoints

```bash
# Test real-time selection endpoint
curl http://localhost:6000/selection

# This will either return selection data or an error if nothing is selected
```

## 🔍 Testing with MCP Inspector

The MCP Inspector is the recommended way to test and debug your MCP server. It provides an interactive web interface for testing tools, inspecting server capabilities, and monitoring real-time interactions.

### Installation

```bash
# Install MCP Inspector as a dev dependency
npm install --save-dev @modelcontextprotocol/inspector

# Or run directly with npx (no installation needed)
npx @modelcontextprotocol/inspector
```

### Setup and Connection

1. **Start your XD MCP Server:**
   ```bash
   npm start
   ```

2. **Launch MCP Inspector:**
   ```bash
   npx @modelcontextprotocol/inspector
   ```

3. **Connect to Your Server:**
   - The Inspector will open in your browser
   - In the "Server Connection" pane:
     - Select "HTTP" as the transport method
     - Enter server URL: `http://localhost:4000/mcp`
     - Click "Connect"

### Testing Workflow

#### Step 1: Basic Connectivity
- Verify connection status shows "Connected"
- Check that both MCP tools appear in the Tools tab:
  - `get_xd_connection_status`
  - `get_selected_xd_node`

#### Step 2: Test Connection Status Tool
1. Go to the **Tools** tab
2. Find `get_xd_connection_status` tool
3. Click "Test" to execute the tool
4. Review the response:
   - Should show `connected: false` initially
   - Should show `connected: true` after XD plugin connects

#### Step 3: Test XD Plugin Integration
1. Open Adobe XD and load your plugin
2. Test `get_xd_connection_status` again
3. Verify `connected: true` and valid `connectionId`

#### Step 4: Test Selection Tool
1. Select an element in Adobe XD
2. Go to the **Tools** tab
3. Find `get_selected_xd_node` tool
4. Click "Test" to execute
5. Review the detailed element specifications returned

#### Step 5: Real-time Testing
1. Change selections in Adobe XD
2. Re-test the `get_selected_xd_node` tool
3. Verify updated element data is returned
4. Monitor the **Notifications** pane for real-time updates

### Inspector Features for Debugging

**Tools Tab:**
- Lists all available MCP tools with schemas
- Enables interactive tool testing
- Shows execution results and timing
- Displays error messages and stack traces

**Resources Tab:**
- Lists available server resources
- Shows resource metadata and descriptions
- Allows content inspection

**Notifications Pane:**
- Shows all server logs and events
- Displays WebSocket connection status
- Shows real-time notifications from XD plugin
- Helps debug communication issues

### Advanced Testing Scenarios

#### Error Handling Testing
1. **Disconnect XD Plugin:**
   - Close Adobe XD or disable the plugin
   - Test `get_xd_connection_status` - should show `connected: false`
   - Test `get_selected_xd_node` - should return appropriate error

2. **No Selection Testing:**
   - Deselect all elements in XD
   - Test `get_selected_xd_node` - should return "No element selected" error

3. **Invalid Inputs:**
   - Test tools with malformed requests
   - Verify proper error responses

#### Performance Testing
1. **Concurrent Requests:**
   - Test multiple tool calls simultaneously
   - Monitor response times in the Inspector
   - Check for any race conditions

2. **Large Selections:**
   - Select complex elements with many properties
   - Test response times and data size
   - Verify all properties are correctly extracted

### Troubleshooting with Inspector

**Connection Issues:**
- Check the Notifications pane for connection errors
- Verify server URL is correct (`http://localhost:6000/mcp`)
- Ensure server is running and accessible

**Tool Execution Failures:**
- Review tool execution logs in Notifications pane
- Check for WebSocket connection status
- Verify XD plugin is connected and responsive

**Performance Issues:**
- Monitor tool execution times
- Check for memory leaks in long-running sessions
- Verify server cleanup after each request

### Development Workflow with Inspector

1. **Make Changes:**
   - Modify your MCP server code
   - Update tool implementations
   - Add new tools or modify existing ones

2. **Test Changes:**
   - Restart the server: `npm start`
   - Reconnect the Inspector
   - Test affected tools and features
   - Monitor logs for any issues

3. **Iterate:**
   - Fix any issues found during testing
   - Re-test until everything works correctly
   - Document any new tools or changes

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

### Health Endpoint

Monitor server status:

```bash
# Basic health check
curl http://localhost:6000/health

# Detailed status with jq (if installed)
curl -s http://localhost:6000/health | jq
```

### XD Plugin Logs

Check the browser console in Adobe XD for:

-   Connection status messages
-   WebSocket events
-   Error messages
-   Selection change events

## 🔄 Development Workflow

### 1. Server Development

```bash
# Start in development mode (auto-reload)
npm run dev

# Make changes to src/server.js, src/mcp.server.js, or src/ws.server.js
# Server automatically restarts
```

**Key files for development:**
- `src/server.js` - Main HTTP server and routing
- `src/mcp.server.js` - Stateless MCP server implementation
- `src/ws.server.js` - WebSocket server with EventEmitter
- `src/logger.js` - Logging utilities

### 2. XD Plugin Development

```bash
# In your XD plugin directory
xdpm watch -c

# Make changes to plugin files
# Plugin automatically reloads in XD
```

### 3. Testing Changes

1. Make changes to server or plugin
2. Test with MCP client
3. Check logs for any issues
4. Iterate as needed

## 🏗️ Understanding the Architecture

### Stateless MCP Server Design

The server uses a **stateless, on-demand** approach:

1. **Per-Request Instances**: Each MCP request creates a fresh server instance
2. **Dynamic Tool Registration**: Tools are registered using `registerTool()` API
3. **Automatic Cleanup**: Server and transport are destroyed after response
4. **Memory Efficient**: No persistent connections or memory leaks

### Request Lifecycle

```
1. HTTP Request → /mcp endpoint
2. Create fresh McpServer instance  
3. Register tools dynamically
4. Process request via StreamableHTTPServerTransport
5. Send response
6. Cleanup server & transport
```

### Benefits

- ✅ **Memory Efficient**: No persistent state
- ✅ **Error Isolation**: Request failures don't affect others  
- ✅ **Scalable**: Independent request processing
- ✅ **Simple Debugging**: Clear request boundaries

## 📝 Next Steps

After successful setup:

1. **Explore MCP Tools**: Try all available tools in your MCP client
2. **Understand Architecture**: Review the stateless design above
3. **Customize Integration**: Modify the bridge for your specific needs
4. **Add Custom Tools**: Extend the server with additional MCP tools using `registerTool()`
5. **Production Deployment**: Consider deployment options for team use

## 🆘 Getting Help

If you encounter issues:

1. Check this troubleshooting guide
2. Review server and plugin logs
3. Test with minimal configuration
4. Check the main README.md for additional information

## 🔗 Useful Commands

```bash
# Install dependencies
npm install

# Start server
npm start

# Development mode
npm run dev

# Check server health
curl http://localhost:6000/health

# View server logs with timestamps
npm start 2>&1 | while IFS= read -r line; do echo "$(date '+%Y-%m-%d %H:%M:%S') $line"; done

# Kill process on port 6000 (if needed)
lsof -ti:6000 | xargs kill -9
```
