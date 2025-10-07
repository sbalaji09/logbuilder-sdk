import { LogBuilder } from "../client";
import { LogContext } from "./context";

export class EnhancedLogger {
    constructor(
      private readonly baseLogger: LogBuilder,
      private readonly context: LogContext
    ) {}
  
    private mergeContext(metadata?: Record<string, any>): Record<string, any> {
      return {
        ...this.context.getAll(),
        ...metadata,
      };
    }
  
    info(message: string, metadata?: Record<string, any>) {
      this.baseLogger.info(message, this.mergeContext(metadata));
    }
  
    warn(message: string, metadata?: Record<string, any>) {
      this.baseLogger.warn(message, this.mergeContext(metadata));
    }
  
    error(message: string, metadata?: Record<string, any>) {
      this.baseLogger.error(message, this.mergeContext(metadata));
    }
  
    debug(message: string, metadata?: Record<string, any>) {
      this.baseLogger.debug(message, this.mergeContext(metadata));
    }
  }
  