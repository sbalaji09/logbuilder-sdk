/**
 * Handles HTTP communication by taking log entries and using a POST request to send them to the backend endpoint
 */

import { LogEntry } from "./types";

export class Transport {
    private endpointURL: string;
    private apiKey: string;

    constructor(endpointURL: string, apiKey: string) {
        this.endpointURL = endpointURL;
        this.apiKey = apiKey;
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
}