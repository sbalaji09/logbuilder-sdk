export interface LogBuilderConfig {
    apiKey: string,
    projectID: number,
    environment: string,
    endpointURL?: string | "https://localhost:3000/callback",
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