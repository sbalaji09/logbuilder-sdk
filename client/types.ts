/**
 * Defines the different data structures:
 * Log entry, configuration options, transport response
 */

export interface LogBuilderConfig {
    apiKey: string,
    projectID: string,
    environment: string,
    endpointURL?: string,
    batchSize: number,
    flushInterval: number;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
    timestamp?: string,
    source: string,
    level: LogLevel,
    message: string,
    service?: string,
    fields?: Record<string, string>;
}

export interface TransportResponse {
    success: boolean,
    error?: string;
}