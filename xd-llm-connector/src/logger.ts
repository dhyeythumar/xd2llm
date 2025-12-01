/**
 * Logger for XD-LLM Connector
 *
 * This server uses HTTP transport for MCP protocol communication,
 * so logs can safely go to stdout without interfering with the protocol.
 */

export default class Logger {
    private serviceName: string;

    constructor(serviceName: string) {
        this.serviceName = serviceName;
    }

    private formatMessage(level: string, message: string, ...args: string[]): string {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${this.serviceName}] [${level.toUpperCase()}]`;

        let formattedMessage: string;
        if (args.length > 0) {
            formattedMessage = [message, ...args].join(' ');
        } else {
            formattedMessage = message;
        }

        return `${prefix} ${formattedMessage}`;
    }

    private writeLog(message: string): void {
        process.stdout.write(message + '\n');
    }

    info(message: string, ...args: string[]): void {
        this.writeLog(this.formatMessage('info', message, ...args));
    }

    warn(message: string, ...args: string[]): void {
        this.writeLog(this.formatMessage('warn', message, ...args));
    }

    error(message: string, ...args: string[]): void {
        this.writeLog(this.formatMessage('error', message, ...args));
    }

    debug(message: string, ...args: string[]): void {
        this.writeLog(this.formatMessage('debug', message, ...args));
    }

    log(message: string, ...args: string[]): void {
        this.info(message, ...args);
    }

    request(method: string, details: string = ''): void {
        const message = `Request ${method} ${details}`.trim();
        this.debug(message);
    }

    response(method: string, success: boolean, details: string = ''): void {
        const level = success ? 'debug' : 'warn';
        const status = success ? 'SUCCESS' : 'FAILED';
        const message = `Response ${method} ${status} ${details}`.trim();
        this[level](message);
    }

    // WebSocket connection-specific logging methods
    wsConnection(action: string, connectionId: string, details: string = ''): void {
        const message = `Connection ${action}: ${connectionId} ${details}`.trim();
        this.info(message);
    }

    // WebSocket event-specific logging
    wsEvent(event: string, connectionId: string, data: string = ''): void {
        const message = `WebSocket ${event} [${connectionId}] | ${data}`.trim();
        this.debug(message);
    }

    // Server lifecycle logging
    server(event: string, details: string = ''): void {
        const message = `Server ${event} | ${details}`.trim();
        this.info(message);
    }
}
