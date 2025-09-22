/**
 * XD Plugin MCP Connector - Connects Adobe XD plugin to MCP server
 *
 * This module enables communication with the MCP server. It handles both HTTP and WebSocket
 * communication for real-time updates.
 */

class XDMCPConnector {
    constructor(options = {}) {
        this.serverUrl = options.serverUrl || 'http://localhost:6000';
        this.wsUrl = options.wsUrl || 'ws://localhost:6000';
        this.autoConnect = options.autoConnect !== false;
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

        if (this.autoConnect) this.connect();
    }

    /**
     * Connect to MCP server via WebSocket
     */
    connect() {
        if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
            return;
        }

        try {
            console.log('Connecting to XD MCP Server...');
            this.ws = new WebSocket(this.wsUrl);

            this.ws.onopen = () => {
                console.log('Connected to XD MCP Server');
                this.isConnected = true;
                this.reconnectAttempts = 0;

                // Clear any existing reconnect timer
                if (this.reconnectTimer) {
                    clearTimeout(this.reconnectTimer);
                    this.reconnectTimer = null;
                }
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
                console.log('Disconnected from XD MCP Server');
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

        console.log(`Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);

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
                console.log(`Received connection ID: ${this.connectionId}`);
                break;

            case 'request_selection_data':
                this.sendCurrentSelection();
                break;

            case 'pong':
                console.log('Received pong from server');
                break;

            default:
                console.warn('Unknown message type from server:', data.type);
        }
    }

    /**
     * Send current selection data to server
     */
    async sendCurrentSelection() {
        try {
            if (this.isConnected && this.ws.readyState === WebSocket.OPEN && this.selectionData) {
                // Send via WebSocket
                const message = {
                    type: 'selection_data',
                    payload: this.selectionData,
                    timestamp: Date.now(),
                };

                this.ws.send(JSON.stringify(message));
                this.selectionData = null;
            } else {
                throw new Error('Not connected to MCP server');
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
            if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(
                    JSON.stringify({
                        type: 'ping',
                        timestamp: Date.now(),
                    })
                );
            } else {
                console.warn('Not connected to MCP server');
            }
        }, 5000);
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
