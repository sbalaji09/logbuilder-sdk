import { LogEntry } from "../client/types";

export class RateLimiter {
    private max_requests_per_second: number;
    private requestTimestamps: number[];

    constructor(max_requests_per_second: number) {
        this.max_requests_per_second = max_requests_per_second;
        this.requestTimestamps = [];
    }

    canSend(): boolean {
        const now = Date.now();
        // Remove timestamps older than 1 second
        this.requestTimestamps = this.requestTimestamps.filter(ts => now - ts < 1000);

        return this.requestTimestamps.length < this.max_requests_per_second;
    }

    async wait(): Promise<void> {
        while (!this.canSend()) {
            const now = Date.now();
            // Calculate when the earliest timestamp expires (1 second after)
            const earliest = this.requestTimestamps[0];
            const waitTime = earliest + 1000 - now;
            if (waitTime > 0) {
                // Sleep until one slot is freed
                await new Promise(res => setTimeout(res, waitTime));
            } else {
                // Safety fallback to prevent infinite loop
                await new Promise(res => setTimeout(res, 10));
            }
        }
    }

    recordSend() {
        const now = Date.now();
        this.requestTimestamps.push(now);
    }
}