import { LogBuilder } from "../client";

export function setupErrorCapture(logger: LogBuilder) {
    const handleError = (err: Error | any, origin: string) => {
        // Log error with stack, name, message
        const errorInfo = {
          stack: err?.stack || 'No stack trace',
          name: err?.name || 'UnknownError',
          message: err?.message || String(err),
          origin,
        };
    
        logger.error(`Unhandled ${origin}`, errorInfo);
    };
    
    const uncaughtExceptionHandler = (err: Error) => handleError(err, 'uncaughtException');
    const unhandledRejectionHandler = (reason: any) => handleError(reason, 'unhandledRejection');

    process.on('uncaughtException', uncaughtExceptionHandler);
    process.on('unhandledRejection', unhandledRejectionHandler);

    // Return cleanup function
    return () => {
    process.off('uncaughtException', uncaughtExceptionHandler);
    process.off('unhandledRejection', unhandledRejectionHandler);
    };
}