/**
 * Uses AsyncLocalStorage to track contextual data (requestID, userID) throughout the request lifecycle
 * The same context / data can be used across multiple async calls without the need to pass in the values again
 */

import { AsyncLocalStorage } from 'async_hooks';
import { Request, Response, NextFunction } from 'express';

type ContextData = Record<string, any>;

export class LogContext {
  private asyncLocalStorage: AsyncLocalStorage<ContextData>;

  constructor() {
    this.asyncLocalStorage = new AsyncLocalStorage<ContextData>();
  }

  // Runs a callback within a new context scope with empty initial store
  run<T>(callback: () => T): T {
    return this.asyncLocalStorage.run({}, callback);
  }

  // Set a key/value pair in current context store
  set(key: string, value: any): void {
    const store = this.asyncLocalStorage.getStore();
    if (store) {
      store[key] = value;
    }
  }

  // Get a value by key from current context store
  get<T = any>(key: string): T | undefined {
    const store = this.asyncLocalStorage.getStore();
    if (store) {
      return store[key];
    }
    return undefined;
  }

  // Get all context data as a plain object
  getAll(): ContextData {
    const store = this.asyncLocalStorage.getStore();
    return store ? { ...store } : {};
  }

  // Express middleware to auto-create a context for each request, setting requestId
  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      this.run(() => {
        // Example: generate or get requestId and store in context
        const requestId = req.headers['x-request-id'] || generateRequestId();
        this.set('requestId', requestId);
        next();
      });
    };
  }
}

// Utility: simple request ID generator (UUID or any preferred approach)
function generateRequestId() {
  return crypto.randomUUID().slice(0, 9);
}
