/**
 * XD Plugin MCP Connector - Connects Adobe XD plugin to MCP server
 *
 * This module enables communication with the MCP server. It handles both HTTP and WebSocket
 * communication for real-time updates.
 */

const PING_INTERVAL = 10000;
const PORT = 4000;

class XDMCPConnector {
    constructor(options = {}) {
        this.serverUrl = options.serverUrl || `http://localhost:${PORT}`;
        this.wsUrl = options.wsUrl || `ws://localhost:${PORT}`;
        this.reconnectInterval = options.reconnectInterval || 5000;
        this.maxReconnectAttempts = options.maxReconnectAttempts || 10;

        this.ws = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.reconnectTimer = null;
        this.connectionId = null;
        this.selectionData = null;

        // Bind methods to preserve 'this' context
        this.handleSelectionChange = this.handleSelectionChange.bind(this);

        this.connect();
    }

    /**
     * Connect to MCP server via WebSocket
     */
    connect() {
        if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
            return;
        }

        try {
            console.info('Connecting to XD MCP Server...');
            this.ws = new WebSocket(this.wsUrl);

            this.ws.onopen = () => {
                console.info('Connected to XD MCP Server');
                this.isConnected = true;
                this.reconnectAttempts = 0;

                // Clear any existing reconnect timer
                if (this.reconnectTimer) {
                    clearTimeout(this.reconnectTimer);
                    this.reconnectTimer = null;
                }
                this.ping();
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleServerMessage(data);
                } catch (error) {
                    console.error('Error parsing server message:', error);
                }
            };

            this.ws.onclose = () => {
                console.info('Disconnected from XD MCP Server');
                this.isConnected = false;
                this.connectionId = null;
                this.scheduleReconnect();
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.isConnected = false;
            };
        } catch (error) {
            console.error('Failed to connect to MCP server:', error);
            this.scheduleReconnect();
        }
    }

    /**
     * Schedule reconnection attempt
     */
    scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached. Giving up.');
            return;
        }

        if (this.reconnectTimer) return; // Already scheduled

        this.reconnectAttempts++;
        const delay = Math.min(this.reconnectInterval * this.reconnectAttempts, 30000);

        console.info(`Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);

        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connect();
        }, delay);
    }

    /**
     * Handle messages from MCP server
     */
    handleServerMessage(data) {
        switch (data.type) {
            case 'welcome':
                this.connectionId = data.connectionId;
                console.info(`Received connection ID: ${this.connectionId}`);
                break;

            case 'request_selection_data':
                this.sendCurrentSelection();
                break;

            case 'pong':
                console.info('Received pong from server');
                break;

            default:
                console.warn('Unknown message type from server:', data.type);
        }
    }

    // Send message to connected XD plugin
    sendMessage(message) {
        if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
            return true;
        }
        return false;
    }

    /**
     * Send current selection data to server
     */
    async sendCurrentSelection() {
        try {
            if (!this.selectionData) {
                throw new Error('No selection data to send');
            }

            // Send via WebSocket
            const message = {
                type: 'selection_data',
                payload: this.selectionData,
                timestamp: Date.now(),
            };

            if (!this.sendMessage(message)) {
                throw new Error('Failed to send websocket message');
            }
        } catch (error) {
            console.error('Failed to send selection data:', error);
        }
    }

    /**
     * Handle selection change events from XD
     */
    handleSelectionChange(selectionData) {
        this.selectionData = selectionData;
    }

    /**
     * Send ping to server to check connection
     */
    ping() {
        setInterval(() => {
            const message = {
                type: 'ping',
                timestamp: Date.now(),
            };

            if (this.sendMessage(message)) {
                console.info('Sent ping to MCP server');
            } else {
                console.warn('Failed to send ping to MCP server');
            }
        }, PING_INTERVAL);
    }

    /**
     * Disconnect from server
     */
    disconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }

        this.isConnected = false;
        this.connectionId = null;
    }
}

// Export for use in XD plugins
module.exports = XDMCPConnector;
