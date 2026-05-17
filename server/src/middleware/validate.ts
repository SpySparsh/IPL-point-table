import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodSchema } from 'zod';

interface ValidationIssueResponse {
  field: string;
  message: string;
}

interface ValidationErrorResponse {
  error: string;
  details: ValidationIssueResponse[];
}

export function validate<T>(schema: ZodSchema<T>) {
  return (
    req: Request,
    res: Response<ValidationErrorResponse>,
    next: NextFunction,
  ): void => {
    try {
      req.body = schema.parse(req.body) as T;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(422).json({
          error: 'Validation failed',
          details: err.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
        return;
      }

      next(err);
    }
  };
}
