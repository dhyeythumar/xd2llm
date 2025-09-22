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

        // Bind methods to preserve 'this' context
        this.handleSelectionChange = this.handleSelectionChange.bind(this);
        // this.sendSelectionData = this.sendSelectionData.bind(this);

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
        // TODO :: check this
        switch (data.type) {
            case 'welcome':
                this.connectionId = data.connectionId;
                console.log(`Received connection ID: ${this.connectionId}`);

                // Send initial selection data if available
                this.sendCurrentSelection(); // TODO :: check this
                break;

            case 'pong':
                // Handle pong response if needed
                break;

            default:
                console.warn('Unknown message type from server:', data.type);
        }
    }

    /**
     * Send current selection data to server
     */
    async sendCurrentSelection(selectionData, requestId = null) {
        try {
            if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
                // Send via WebSocket
                const message = {
                    type: 'selection_data',
                    payload: selectionData,
                    requestId,
                    timestamp: Date.now(),
                };

                this.ws.send(JSON.stringify(message));
            } else {
                // Fallback to HTTP
                await this.sendViaHTTP(selectionData, requestId);
            }
        } catch (error) {
            console.error('Failed to send selection data:', error);

            // Send error message if this was a response to a request
            if (requestId && this.isConnected && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(
                    JSON.stringify({
                        type: 'error',
                        message: error.message,
                        requestId,
                        timestamp: Date.now(),
                    })
                );
            }
        }
    }

    /**
     * Send data via HTTP as fallback
     */
    async sendViaHTTP(selectionData, requestId = null) {
        try {
            const response = await fetch(`${this.serverUrl}/xd/selection`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: selectionData,
                    requestId,
                    timestamp: Date.now(),
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            console.log('Selection data sent via HTTP');
        } catch (error) {
            console.error('Failed to send data via HTTP:', error);
            throw error;
        }
    }

    /**
     * Handle selection change events from XD
     * Call this method when selection changes in your XD plugin
     */
    handleSelectionChange(selectionData) {
        // Debounce selection changes to avoid too many updates
        if (this.selectionChangeTimer) {
            clearTimeout(this.selectionChangeTimer);
        }

        this.selectionChangeTimer = setTimeout(() => {
            this.sendCurrentSelection(selectionData);
        }, 100);
    }

    /**
     * Send ping to server to check connection
     */
    ping() {
        if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(
                JSON.stringify({
                    type: 'ping',
                    timestamp: Date.now(),
                })
            );
        }
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
