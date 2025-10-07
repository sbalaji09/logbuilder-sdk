import { LogEntry } from "./types";

export class Transport {
    endpointURL: string;

    constructor(endpointURL: string) {
        this.endpointURL = endpointURL;
    }

    async send(logs: LogEntry[]) : Promise<{ success: boolean; error?: string }>{
        try {
            const response = await fetch('https://placeholderbackend.com/logs', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(logs),
              });
          
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return { success: true };
        } catch (error) {
            return { success: false, error: error?.message || "Unknown error" };
        }
    }
}