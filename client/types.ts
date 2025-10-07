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
    timeStamp: string,
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>,
    projectID: string,
    environment: string;
}

export interface TransportResponse {
    success: boolean,
    error?: string;
}