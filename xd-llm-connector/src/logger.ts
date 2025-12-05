/**
 * Logger for XD-LLM Connector
 *
 * This server uses HTTP transport for MCP protocol communication,
 * so logs can safely go to stdout without interfering with the protocol.
 */

import chalk from 'chalk';

export default class Logger {
    private serviceName: string;

    constructor(serviceName: string) {
        this.serviceName = serviceName;
    }

    private formatMessage(level: string, message: string, ...args: string[]): string {
        const timestamp = new Date().toISOString();
        const prefix = chalk.white.dim(`[${timestamp}] [${this.serviceName}] [${level.toUpperCase()}]`);

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
        this.writeLog(chalk.blue(this.formatMessage('info', message, ...args)));
    }

    warn(message: string, ...args: string[]): void {
        this.writeLog(chalk.yellow(this.formatMessage('warn', message, ...args)));
    }

    error(message: string, ...args: string[]): void {
        this.writeLog(chalk.red(this.formatMessage('error', message, ...args)));
    }

    debug(message: string, ...args: string[]): void {
        this.writeLog(chalk.cyan(this.formatMessage('debug', message, ...args)));
    }

    log(message: string, ...args: string[]): void {
        this.info(message, ...args);
    }

    // WebSocket connection-specific logging methods
    wsConnection(action: string, connectionId: string, details: string = ''): void {
        const message = `Connection ${action.toUpperCase()} [${connectionId}] | ${details}`.trim();
        this.info(message);
    }

    // Server lifecycle logging
    server(event: string, details: string = ''): void {
        const message = `Server ${event?.toUpperCase()} | ${details}`.trim();
        this.info(message);
    }
}
