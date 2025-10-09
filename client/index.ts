/*
This class initializes the LogBuilder class that users initialize with their API key and project ID
Allows users to create log entries
*/

import { LogEntry, LogLevel, LogBuilderConfig } from "./types";
import { Transport } from "./transport"; 
import { Batcher } from "../middleware/batcher";
import { RetryQueue } from "../middleware/retryQueue";

export class LogBuilder {
    private config: LogBuilderConfig;
    private transport: Transport;
    private batcher: Batcher;
    private retryQueue: RetryQueue;

    constructor(config: LogBuilderConfig) {
        if (!config.apiKey) {
            throw new Error("apiKey is required");
        }
        if (!config.projectID) {
            throw new Error("projectID is required");
        }

        this.config = config;
        this.transport = new Transport(
            config.endpointURL || "https://default-endpoint.com/logs",
            config.apiKey
        );

        // Set up retry queue
        this.retryQueue = new RetryQueue(
            async (logs: LogEntry[]) => {
                await this.transport.send(logs);
            }
        );

        // Set up batcher with onFlush callback that sends logs via transport, using RetryQueue on failure
        this.batcher = new Batcher(
            config.batchSize || 40,
            config.flushInterval || 5000,
            (logs: LogEntry[]) => {
                this.sendBatch(logs);
            }
        );
    }

    private log(level: LogLevel, message: string, metadata?: Record<string, any>) {
        const logEntry: LogEntry = {
            timestamp: new Date().toISOString(),
            source: 'sdk',
            level,
            message,
            service: `${this.config.projectID}-${this.config.environment}`,
            fields: metadata ? this.convertToStringMap(metadata) : undefined,
        };
        this.batcher.add(logEntry);
    }

    private convertToStringMap(metadata: Record<string, any>): Record<string, string> {
        const stringMap: Record<string, string> = {};
        for (const [key, value] of Object.entries(metadata)) {
            stringMap[key] = typeof value === 'string' ? value : JSON.stringify(value);
        }
        return stringMap;
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

    // Graceful shutdown: flush batcher and drain retry queue
    async shutdown() {
        // Flush pending logs
        this.batcher.flush();
        // Stop periodic flushing
        this.batcher.stop();
        // Drain retry queue for any failed batches
        await this.retryQueue.drain();
    }

    // Optionally, expose a flush method for manual flush
    async flush() {
        this.batcher.flush();
    }

    private async sendBatch(logs: LogEntry[]) {
        try {
            await this.transport.send(logs);
        } catch (err) {
            this.retryQueue.enqueue(logs);
        }
    }

}