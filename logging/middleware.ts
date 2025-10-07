/**
 * Middleware that automatically logs every HTTP request (method, URL, status code, response time, IP, user agent)
 */


import { LogBuilder } from "../client";

import { Request, Response, NextFunction } from 'express';

export interface ExpressMiddlewareOptions {
    logLevelOverride?: (req: Request, res: Response, statusCode: number) => 'info' | 'warn' | 'error' | undefined;
    customDataExtractor?: (req: Request, res: Response) => Record<string, unknown>;
    ignorePaths?: string[];
}

export function expressMiddleware(
    logger: LogBuilder,
    options: ExpressMiddlewareOptions = {}
) {
    const {
        logLevelOverride,
        customDataExtractor,
        ignorePaths = [],
    } = options;

    return (req: Request, res: Response, next: NextFunction) => {
        if (ignorePaths.includes(req.path)) {
            return next();
        }

        const start = Date.now();

        res.on('finish', () => {
            const durationMs = Date.now() - start;
            const { method, originalUrl } = req;
            const statusCode = res.statusCode;

            const ip = req.ip || req.socket?.remoteAddress || '-';
            const userAgent = req.get('User-Agent') || '-';
            const requestId = req.headers['x-request-id'] || '-';

            const extraData = customDataExtractor ? customDataExtractor(req, res) : {};

            let level: 'info' | 'warn' | 'error' = 'info';

            if (logLevelOverride) {
                level = logLevelOverride(req, res, statusCode) || level;
            } else {
                if (statusCode >= 500) level = 'error';
                else if (statusCode >= 400) level = 'warn';
                else level = 'info';
            }

            const message = `${method} ${originalUrl} ${statusCode} - ${durationMs}ms`;
            const logData = {
                method,
                url: originalUrl,
                statusCode,
                durationMs,
                ip,
                userAgent,
                requestId,
                ...extraData,
            };

            logger[level](message, logData);
        });

        next();
        };
}
