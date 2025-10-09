import { LogEntry } from "../client/types";

type SendFunction = (logs: LogEntry[]) => Promise<void>;

interface RetryItem {
    logs: LogEntry[];
    retryCount: number;
}

export class RetryQueue {
    private queue: RetryItem[];
    private maxRetries: number;
    private sendFunction: SendFunction;
    private processing: boolean;
    private timerId: ReturnType<typeof setTimeout> | null;

    constructor(sendfunction: SendFunction, maxRetries: number = 5) {
        this.queue = [];
        this.maxRetries = maxRetries;
        this.sendFunction = sendfunction;
        this.processing = false;
        this.timerId = null;
    }

    enqueue(logs: LogEntry[]) {
        this.queue.push({logs, retryCount: 0})
        this.scheduleProcessing();
    }

    private async processRetries() {
        this.processing = true;
        try {
            for (let i = 0; i < this.queue.length; ) {
                const item = this.queue[i];
                const delay = 1000 * Math.pow(2, item.retryCount);
                await new Promise(res => setTimeout(res, delay));

                try {
                    await this.sendFunction(item.logs);
                    this.queue.splice(i, 1);
                } catch {
                    item.retryCount++;
                    if (item.retryCount >= this.maxRetries) {
                        this.queue.splice(i, 1);
                    } else {
                        i++;
                    }
                }
            }
        } finally {
            this.processing = false;
            if (this.queue.length > 0) {
                this.scheduleProcessing();
            }
        }
    }

    async drain() {
        while (this.queue.length > 0) {
            const item = this.queue[0];
            try {
                await this.sendFunction(item.logs);
                this.queue.shift();
            } catch {
                item.retryCount++;
                if (item.retryCount >= this.maxRetries) {
                    this.queue.shift();
                } else {
                    break;
                }
            }
        }
    }


    private scheduleProcessing() {
        if (!this.processing && !this.timerId && this.queue.length > 0) {
            this.timerId = setTimeout(() => {
                this.timerId = null;
                this.processRetries().catch(() => {
                    // Handle error or ignore to prevent unhandled rejection
                });
            }, 0);
        }
    }
}