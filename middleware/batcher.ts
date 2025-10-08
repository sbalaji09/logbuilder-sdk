import { LogEntry } from "../client/types";


export class Batcher {
    batchSize: number;
    flushInterval: number;
    logs: LogEntry[];
    timer: NodeJS.Timer | null;

    constructor(batch_size: number, flush_interval: number) {
        this.batchSize = batch_size
        this.flushInterval = flush_interval
        this.logs = []
        this.timer = setInterval(() => {
            if (this.logs.length > 0) {
                this.flush();
            }
        }, this.flushInterval);
    }

    add(log_entry: LogEntry) {
        this.logs.push(log_entry)
        if (this.logs.length >= this.batchSize) {
            this.flush();
        }
    }

    flush() {
        const temp_logs: LogEntry[] = [...this.logs];
        this.logs.length = 0;
        return temp_logs;
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }   
    }
}