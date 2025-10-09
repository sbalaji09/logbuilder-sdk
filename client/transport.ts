/**
 * Handles HTTP communication by taking log entries and using a POST request to send them to the backend endpoint
 */

import { LogEntry } from "./types";
import {Batcher} from "../middleware/batcher"
import {RetryQueue} from "../middleware/retryQueue"

export class Transport {
    private endpointURL: string;
    private apiKey: string;
    private batcher: Batcher
    private retryQueue: RetryQueue

    constructor(endpointURL: string, apiKey: string, batchSize = 50, flushInterval = 5000) {
        this.endpointURL = endpointURL;
        this.apiKey = apiKey;
        this.retryQueue = new RetryQueue((logs: LogEntry[]) => {
            return this.send(logs).then(() => {});
        });
        
        this.batcher = new Batcher(
            batchSize,
            flushInterval,
            (logs: LogEntry[]) => this.send(logs).then(() => {})
        );
    }

    async send(logs: LogEntry[]) : Promise<{ success: boolean; error?: string }>{
        try {
            const response = await fetch(this.endpointURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify(logs),
            });
          
            if (!response.ok) {
                // Throw so RetryQueue can handle this as an error
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return { success: true };
        } catch (error) {
            throw error;
        }
    }

    private async sendBatch(logs: LogEntry[]): Promise<void> {
        try {
            await this.send(logs);
        } catch (err) {
            this.retryQueue.enqueue(logs, err as Error);
        }
    }

    // Add a log to the batch
    log(logEntry: LogEntry): void {
        this.batcher.add(logEntry);
    }

    // Flush and drain log queues
    async flush(): Promise<void> {
        await this.batcher.flush();
        await this.retryQueue.drain();
    }
}