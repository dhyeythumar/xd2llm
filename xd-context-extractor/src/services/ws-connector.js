/**
 * XD Plugin Connector - Connects Adobe XD plugin to WebSocket server
 *
 * This module enables communication with the WebSocket server. It handles WebSocket
 * communication for real-time updates.
 */

const PING_INTERVAL = 30;
const PORT = 4000;

class WSConnector {
    #wsUrl;
    #reconnectInterval;
    #maxReconnectAttempts;
    #ws;
    #isConnected;
    #reconnectAttempts;
    #reconnectTimer;
    #connectionId;
    #selectedNode;
    #onConnectionStatusChange;

    /**
     * Send message to connected XD plugin
     */
    #sendMessage(message) {
        if (this.#isConnected && this.#ws && this.#ws.readyState === WebSocket.OPEN) {
            this.#ws.send(JSON.stringify(message));
            return true;
        }
        return false;
    }

    /**
     * Handle messages from WebSocket server
     */
    #handleServerMessage(data) {
        switch (data.type) {
            case 'welcome':
                this.#connectionId = data.connectionId;
                console.info(`Received connection ID: ${this.#connectionId}`);
                break;

            case 'request_selected_node':
                this.#sendSelectedNode();
                break;

            case 'pong':
                console.info('Received pong from server');
                break;

            default:
                console.warn('Unknown message type from server:', data.type);
        }
    }

    /**
     * Send ping to server to check connection
     */
    #ping() {
        setInterval(() => {
            const message = {
                type: 'ping',
                timestamp: Date.now(),
            };

            if (this.#sendMessage(message)) console.info('Sent ping to WebSocket server');
            else console.warn('Failed to send ping to WebSocket server');
        }, PING_INTERVAL * 1000);
    }

    /**
     * Send current selected node data to server
     */
    async #sendSelectedNode() {
        try {
            if (!this.#selectedNode.json || !this.#selectedNode.image) {
                throw new Error('No selected node!');
            }

            // Send via WebSocket
            const message = {
                type: 'selected_node',
                payload: this.#selectedNode,
            };

            if (!this.#sendMessage(message)) {
                throw new Error('Failed to send websocket message');
            }
        } catch (error) {
            console.error('Failed to send selected node:', error);

            // Send error message to server
            this.#sendMessage({
                type: 'error',
                message: error.message,
            });
        }
    }

    /**
     * Connect to WebSocket server
     */
    #connect() {
        if (this.#ws && (this.#ws.readyState === WebSocket.CONNECTING || this.#ws.readyState === WebSocket.OPEN)) {
            return;
        }

        try {
            console.info('Connecting to WebSocket Server...');
            this.#ws = new WebSocket(this.#wsUrl);

            this.#ws.onopen = () => {
                console.info('Connected to WebSocket Server');
                this.#isConnected = true;
                this.#reconnectAttempts = 0;

                // Clear any existing reconnect timer
                if (this.#reconnectTimer) {
                    clearTimeout(this.#reconnectTimer);
                    this.#reconnectTimer = null;
                }

                this.notifyConnectionStatusChange(); // Notify UI about connection
                this.#ping(); // Start pinging the server
            };

            this.#ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.#handleServerMessage(data);
                } catch (error) {
                    console.error('Error parsing server message:', error);
                }
            };

            this.#ws.onclose = () => {
                console.info('Disconnected from WebSocket Server');
                this.#isConnected = false;
                this.#connectionId = null;

                // Notify UI about disconnection
                this.notifyConnectionStatusChange();
                this.#scheduleReconnect();
            };

            this.#ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.#isConnected = false;

                // Notify UI about error/disconnection
                this.notifyConnectionStatusChange();
            };
        } catch (error) {
            console.error('Failed to connect to WebSocket server:', error);
            this.#scheduleReconnect();
        }
    }

    /**
     * Schedule reconnection attempt
     */
    #scheduleReconnect() {
        if (this.#reconnectAttempts >= this.#maxReconnectAttempts) {
            console.warn('Max reconnection attempts reached. Giving up.');
            return;
        }

        if (this.#reconnectTimer) return; // Already scheduled

        this.#reconnectAttempts++;
        const delay = Math.min(this.#reconnectInterval * this.#reconnectAttempts, 30000);

        console.info(`Scheduling reconnection attempt ${this.#reconnectAttempts} in ${delay}ms`);

        // Notify UI about reconnection attempt
        this.notifyConnectionStatusChange();

        this.#reconnectTimer = setTimeout(() => {
            this.#reconnectTimer = null;
            this.#connect();
        }, delay);
    }

    constructor(options = {}) {
        this.#wsUrl = options.wsUrl || `ws://localhost:${PORT}`;
        this.#reconnectInterval = options.reconnectInterval || 5000;
        this.#maxReconnectAttempts = options.maxReconnectAttempts || 5;

        this.#ws = null;
        this.#isConnected = false;
        this.#reconnectAttempts = 0;
        this.#reconnectTimer = null;
        this.#connectionId = null;

        // XD Selection data
        this.#selectedNode = {
            json: null,
            image: null,
        };

        // Callback for connection status changes
        this.#onConnectionStatusChange = null;

        this.#connect();
    }

    /**
     * Handle selection change events from XD
     */
    handleSelectionChange(selectedNode) {
        // If a node is selected, set the selected node to the node
        if (selectedNode) {
            this.#selectedNode = selectedNode;
        }
        // If no node is selected, set the selected node to null to indicate that no node is selected
        else {
            this.#selectedNode = {
                json: null,
                image: null,
            };
        }
    }

    /**
     * Set callback for connection status changes
     */
    setConnectionStatusCallback(callback) {
        this.#onConnectionStatusChange = callback;
    }

    /**
     * Notify about connection status change
     */
    notifyConnectionStatusChange() {
        if (this.#onConnectionStatusChange) {
            this.#onConnectionStatusChange();
        }
    }

    /**
     * Get connection status
     */
    getConnectionStatus() {
        return {
            isConnected: this.#isConnected,
            reconnectAttempts: this.#reconnectAttempts,
            maxReconnectAttempts: this.#maxReconnectAttempts,
        };
    }

    /**
     * Manually trigger reconnection (reset retry attempts and reconnect)
     */
    manualReconnect() {
        console.info('Manual reconnection triggered');

        // Disconnect from WebSocket server
        this.disconnect();

        // Notify UI about the manual reconnection attempt
        this.notifyConnectionStatusChange();

        // Start fresh connection
        this.#connect();
    }

    /**
     * Disconnect from WebSocket server
     */
    disconnect() {
        try {
            // Reset retry attempts
            this.#isConnected = false;
            this.#reconnectAttempts = 0;
            this.#connectionId = null;

            if (this.#reconnectTimer) {
                clearTimeout(this.#reconnectTimer);
                this.#reconnectTimer = null;
            }

            if (this.#ws && this.#ws.readyState === WebSocket.OPEN) {
                this.#ws.close();
                this.#ws = null;
            }
        } catch (error) {
            console.error('Failed to disconnect from WebSocket server:', error);
        }
    }
}

// Export for use in XD plugins
module.exports = WSConnector;
