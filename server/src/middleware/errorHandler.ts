import type { NextFunction, Request, Response } from 'express';

export interface AppError extends Error {
  statusCode?: number;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  void req;
  void next;

  console.error('[GlobalErrorHandler]', err);

  const status = err.statusCode ?? 500;
  const message = err.message ?? 'Internal Server Error';

  res.status(status).json({ error: message });
}
