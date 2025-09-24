/**
 * XD Plugin Connector - Connects Adobe XD plugin to WebSocket server
 *
 * This module enables communication with the WebSocket server. It handles WebSocket
 * communication for real-time updates.
 */

const PING_INTERVAL = 10000;
const PORT = 4000;

class WSConnector {
    /**
     * Send message to connected XD plugin
     */
    #sendMessage(message) {
        if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
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
                this.connectionId = data.connectionId;
                console.info(`Received connection ID: ${this.connectionId}`);
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
        }, PING_INTERVAL);
    }

    /**
     * Send current selected node data to server
     */
    async #sendSelectedNode() {
        try {
            console.log('selectedNode', this.selectedNode);
            if (!this.selectedNode.json || !this.selectedNode.image) {
                throw new Error('No selected node!');
            }

            // Send via WebSocket
            const message = {
                type: 'selected_node',
                payload: this.selectedNode,
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
        if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
            return;
        }

        try {
            console.info('Connecting to WebSocket Server...');
            this.ws = new WebSocket(this.wsUrl);

            this.ws.onopen = () => {
                console.info('Connected to WebSocket Server');
                this.isConnected = true;
                this.reconnectAttempts = 0;

                // Clear any existing reconnect timer
                if (this.reconnectTimer) {
                    clearTimeout(this.reconnectTimer);
                    this.reconnectTimer = null;
                }

                // Notify UI about connection
                this.notifyConnectionStatusChange(true, 0);
                this.#ping();
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.#handleServerMessage(data);
                } catch (error) {
                    console.error('Error parsing server message:', error);
                }
            };

            this.ws.onclose = () => {
                console.info('Disconnected from WebSocket Server');
                this.isConnected = false;
                this.connectionId = null;

                // Notify UI about disconnection
                this.notifyConnectionStatusChange(false, this.reconnectAttempts);
                this.#scheduleReconnect();
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.isConnected = false;

                // Notify UI about error/disconnection
                this.notifyConnectionStatusChange(false, this.reconnectAttempts);
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
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached. Giving up.');
            return;
        }

        if (this.reconnectTimer) return; // Already scheduled

        this.reconnectAttempts++;
        const delay = Math.min(this.reconnectInterval * this.reconnectAttempts, 30000);

        console.info(`Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);

        // Notify UI about reconnection attempt
        this.notifyConnectionStatusChange(false, this.reconnectAttempts);

        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.#connect();
        }, delay);
    }

    constructor(options = {}) {
        this.serverUrl = options.serverUrl || `http://localhost:${PORT}`;
        this.wsUrl = options.wsUrl || `ws://localhost:${PORT}`;
        this.reconnectInterval = options.reconnectInterval || 5000;
        this.maxReconnectAttempts = options.maxReconnectAttempts || 5;

        this.ws = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.reconnectTimer = null;
        this.connectionId = null;

        // XD Selection data
        this.selectedNode = {
            json: null,
            image: null,
        };

        // Callback for connection status changes
        this.onConnectionStatusChange = null;

        // Bind methods to preserve 'this' context
        this.handleSelectionChange = this.handleSelectionChange.bind(this);

        this.#connect();
    }

    /**
     * Handle selection change events from XD
     */
    handleSelectionChange(selectedNode) {
        // If a node is selected, set the selected node to the node
        if (selectedNode) {
            this.selectedNode = selectedNode;
        }
        // If no node is selected, set the selected node to null to indicate that no node is selected
        else {
            this.selectedNode = {
                json: null,
                image: null,
            };
        }
    }

    /**
     * Set callback for connection status changes
     */
    setConnectionStatusCallback(callback) {
        this.onConnectionStatusChange = callback;
    }

    /**
     * Notify about connection status change
     */
    notifyConnectionStatusChange(isConnected, reconnectAttempts = 0) {
        if (this.onConnectionStatusChange) {
            this.onConnectionStatusChange(isConnected, reconnectAttempts);
        }
    }

    /**
     * Manually trigger reconnection (reset retry attempts and reconnect)
     */
    manualReconnect() {
        console.info('Manual reconnection triggered');

        // Reset retry attempts
        this.reconnectAttempts = 0;

        // Clear any existing reconnect timer
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        // Close existing connection if any
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }

        this.isConnected = false;
        this.connectionId = null;

        // Notify UI about the manual reconnection attempt
        this.notifyConnectionStatusChange(false, 0);

        // Start fresh connection
        this.#connect();
    }

    /**
     * Disconnect from WebSocket server
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
module.exports = WSConnector;
