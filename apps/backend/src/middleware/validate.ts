// =============================================================
// Nova Wood — Middleware: Validation
// Zod schema validation for request body, query, params
// =============================================================
import type { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '@core/errors';

type RequestPart = 'body' | 'query' | 'params';

/**
 * Creates a validation middleware for a specific part of the request.
 * Throws ValidationError with structured field errors on failure.
 */
export function validate(schema: ZodSchema, part: RequestPart = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[part]);
      req[part] = parsed; // replace with parsed & transformed data
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        for (const issue of err.issues) {
          const key = issue.path.join('.') || 'root';
          errors[key] = errors[key] ?? [];
          errors[key].push(issue.message);
        }
        next(new ValidationError(errors));
        return;
      }
      next(err);
    }
  };
}

/** Validate request body */
export const validateBody = (schema: ZodSchema) => validate(schema, 'body');

/** Validate query string */
export const validateQuery = (schema: ZodSchema) => validate(schema, 'query');

/** Validate URL params */
export const validateParams = (schema: ZodSchema) => validate(schema, 'params');
