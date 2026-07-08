// =============================================================
// Nova Wood — Middleware: Error Handler
// Global Express error handler — handles all thrown errors
// =============================================================
import type { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '@core/errors';
import { env } from '@config/env';
import { ZodError } from 'zod';

/**
 * Global error handling middleware.
 * Must be registered as the LAST middleware in the Express app.
 */
export function globalErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Handle known operational errors
  if (err instanceof AppError) {
    const body: Record<string, unknown> = {
      success: false,
      message: err.message,
      code: err.code,
    };

    // Include validation errors if present
    if (err instanceof ValidationError) {
      body.errors = err.errors;
    }

    res.status(err.statusCode).json(body);
    return;
  }

  // Handle Zod validation errors (from request parsing)
  if (err instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const key = issue.path.join('.') || 'root';
      errors[key] = errors[key] ?? [];
      errors[key].push(issue.message);
    }
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors,
    });
    return;
  }

  // Handle Prisma known errors
  if ((err as { code?: string }).code === 'P2002') {
    res.status(409).json({
      success: false,
      message: 'A record with this value already exists',
      code: 'DUPLICATE_ENTRY',
    });
    return;
  }

  if ((err as { code?: string }).code === 'P2025') {
    res.status(404).json({
      success: false,
      message: 'Record not found',
      code: 'NOT_FOUND',
    });
    return;
  }

  // Handle Multer errors
  if ((err as { name?: string }).name === 'MulterError') {
    res.status(400).json({
      success: false,
      message: err.message,
      code: 'UPLOAD_ERROR',
    });
    return;
  }

  // Unknown / programming errors — do not leak details in production
  console.error('💥 Unhandled error:', err);

  res.status(500).json({
    success: false,
    message: env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
    code: 'INTERNAL_ERROR',
    ...(env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

/** Catches async errors and passes them to globalErrorHandler */
export function asyncHandler<T extends Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: T, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
