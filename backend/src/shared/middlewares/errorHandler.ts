import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../errors/ApiError.js';
import { logger } from '../logger/logger.js';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ApiError) {
    logger.warn(`API Error: ${err.message}`, { statusCode: err.statusCode });
    return res.status(err.statusCode).json({ message: err.message });
  }

  logger.error('Unhandled Error:', { error: String(err), stack: err instanceof Error ? err.stack : undefined });
  return res.status(500).json({ message: 'Internal Server Error' });
}
