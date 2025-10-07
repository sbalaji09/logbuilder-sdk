/**
 * Handles HTTP communication by taking log entries and using a POST request to send them to the backend endpoint
 */

import { LogEntry } from "./types";

export class Transport {
    private endpointURL: string;

    constructor(endpointURL: string) {
        this.endpointURL = endpointURL;
    }

    async send(logs: LogEntry[]) : Promise<{ success: boolean; error?: string }>{
        try {
            const response = await fetch(this.endpointURL, {
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
            return { success: false, error: (error as Error)?.message || "Unknown error" };
        }
    }
}