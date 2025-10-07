/*
This class initializes the LogBuilder class that users initialize with their API key and project ID
Allows users to create log entries
*/

import { LogEntry, LogLevel, LogBuilderConfig } from "./types";
import { Transport } from "./transport"; 

export class LogBuilder {
    private config: LogBuilderConfig;
    private transport: Transport;

    constructor(config: LogBuilderConfig) {
        if (!config.apiKey) {
            throw new Error("apiKey is required");
        }
        if (!config.projectID) {
            throw new Error("projectID is required");
        } 
    
        this.config = config;
        this.transport = new Transport(config.endpointURL || "https://default-endpoint.com/logs");
    }

    private async log(level: LogLevel, message: string, metadata?: Record<string, any>) {
        const logEntry: LogEntry = {
            timeStamp: new Date().toISOString(),
            level,
            message,
            metadata,
            projectID: this.config.projectID,
            environment: this.config.environment,
        };
        this.transport.send([logEntry]).catch(err => {
            console.error('[LogBuilder] Failed to send log:', err);
        });
    }

    info(message: string, metadata?: Record<string, any>) {
        this.log('info', message, metadata);
    }

    warn(message: string, metadata?: Record<string, any>) {
        this.log('warn', message, metadata);
    }

    error(message: string, metadata?: Record<string, any>) {
        this.log('error', message, metadata);
    }
    
    debug(message: string, metadata?: Record<string, any>) {
        this.log('debug', message, metadata);
    }

    flush() {
        // Nothing to do yet, since sending is immediate
        // If batching is added, send pending logs here
        return Promise.resolve();
    }

}