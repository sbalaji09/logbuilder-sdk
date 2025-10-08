import { LogEntry } from "../client/types";

type SendFunction = (logs: LogEntry[]) => Promise<void>;

interface RetryItem {
    logs: LogEntry[];
    retryCount: number;
}

export class RetryQueue {
    queue: RetryItem[];
    maxRetries: number;
    sendFunction: SendFunction;

    constructor(sendfunction: SendFunction, maxRetries: number = 5) {
        this.queue = []
        this.maxRetries = maxRetries;
        this.sendFunction = sendfunction;
    }

    enqueue(logs: LogEntry[], error: Error) {
        this.queue.push({logs, retryCount: 0})
    }
    
    async processRetries() {
        for (let i = 0; i < this.queue.length;) {
            const item = this.queue[i];
            const delay = 1000 * Math.pow(2, item.retryCount);
            await new Promise(res => setTimeout(res, delay));

            try {
                await this.sendFunction(item.logs);

                // On success remove from queue
                this.queue.splice(i, 1);
            } catch {
                item.retryCount++;
                if (item.retryCount > this.maxRetries) {
                    // Drop batch after max retries
                    this.queue.splice(i, 1);
                } else {
                    i++;
                }
            }
        }
    }

    async drain() {
        // Process all retries immediately without delay
        while (this.queue.length > 0) {
            const item = this.queue[0];
            try {
                await this.sendFunction(item.logs);
                this.queue.shift();
            } catch {
                item.retryCount++;
                if (item.retryCount > this.maxRetries) {
                    this.queue.shift();
                } else {
                    // If failed retry again later on next drain
                    break; 
                }
            }
        }
    }
}