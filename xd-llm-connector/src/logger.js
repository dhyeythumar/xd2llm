/**
 * MCP-compatible logger for stdio communication
 *
 * Since MCP servers use stdout for protocol communication,
 * all logging must go to stderr with proper formatting.
 */

class MCPLogger {
    constructor(serviceName = 'XD-MCP') {
        this.serviceName = serviceName;
    }

    _formatMessage(level, message, ...args) {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${this.serviceName}] [${level.toUpperCase()}]`;

        // Handle different types of input
        let formattedMessage;
        if (typeof message === 'object') {
            formattedMessage = JSON.stringify(message, null, 2);
        } else if (args.length > 0) {
            formattedMessage = [message, ...args].join(' ');
        } else {
            formattedMessage = String(message);
        }

        return `${prefix} ${formattedMessage}`;
    }

    _writeToStderr(message) {
        process.stderr.write(message + '\n');
    }

    info(message, ...args) {
        this._writeToStderr(this._formatMessage('info', message, ...args));
    }

    warn(message, ...args) {
        this._writeToStderr(this._formatMessage('warn', message, ...args));
    }

    error(message, ...args) {
        this._writeToStderr(this._formatMessage('error', message, ...args));
    }

    debug(message, ...args) {
        this._writeToStderr(this._formatMessage('debug', message, ...args));
    }

    log(message, ...args) {
        // Alias for info
        this.info(message, ...args);
    }

    request(method, details = '') {
        const message = `Request ${method} ${details}`.trim();
        this.debug(message);
    }

    response(method, success, details = '') {
        const level = success ? 'debug' : 'warn';
        const status = success ? 'SUCCESS' : 'FAILED';
        const message = `Response ${method} ${status} ${details}`.trim();
        this[level](message);
    }

    // Connection-specific logging methods
    connection(action, connectionId, details = '') {
        const message = `Connection ${action}: ${connectionId} ${details}`.trim();
        this.info(message);
    }
    // WebSocket-specific logging
    ws(event, connectionId, data = '') {
        const message = `WebSocket ${event} [${connectionId}] | ${data}`.trim();
        this.debug(message);
    }

    // Server lifecycle logging
    server(event, details = '') {
        const message = `Server ${event} | ${details}`.trim();
        this.info(message);
    }
}

// Create and export default logger instance
const logger = new MCPLogger('XD-MCP');

// Override console methods globally if needed
export function overrideConsole() {
    const originalConsole = { ...console };

    console.log = (...args) => logger.info(...args);
    console.info = (...args) => logger.info(...args);
    console.warn = (...args) => logger.warn(...args);
    console.error = (...args) => logger.error(...args);
    console.debug = (...args) => logger.debug(...args);

    // Keep original for restoration
    console._original = originalConsole;

    return originalConsole;
}

export default logger;
