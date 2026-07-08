// =============================================================
// Nova Wood — Core: HTTP Error Classes
// Centralized error handling with i18n-ready messages
// =============================================================

/** Base class for all known HTTP errors */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

/** 400 Bad Request */
export class BadRequestError extends AppError {
  constructor(message = 'Bad request', code?: string) {
    super(message, 400, code);
  }
}

/** 401 Unauthorized */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', code?: string) {
    super(message, 401, code ?? 'UNAUTHORIZED');
  }
}

/** 403 Forbidden */
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', code?: string) {
    super(message, 403, code ?? 'FORBIDDEN');
  }
}

/** 404 Not Found */
export class NotFoundError extends AppError {
  constructor(resource = 'Resource', code?: string) {
    super(`${resource} not found`, 404, code ?? 'NOT_FOUND');
  }
}

/** 409 Conflict */
export class ConflictError extends AppError {
  constructor(message = 'Resource already exists', code?: string) {
    super(message, 409, code ?? 'CONFLICT');
  }
}

/** 422 Unprocessable Entity (validation errors) */
export class ValidationError extends AppError {
  public readonly errors: Record<string, string[]>;

  constructor(errors: Record<string, string[]>, message = 'Validation failed') {
    super(message, 422, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

/** 429 Too Many Requests */
export class RateLimitError extends AppError {
  constructor(message = 'Too many requests. Please try again later.') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

/** 500 Internal Server Error */
export class InternalError extends AppError {
  constructor(message = 'An unexpected error occurred') {
    super(message, 500, 'INTERNAL_ERROR');
  }
}
