// =============================================================
// Nova Wood — Core: API Response Helpers
// Standardized JSON response format for all endpoints
// =============================================================
import type { Response } from 'express';
import type { PaginationMeta } from '@nova-wood/types';

/** Standard success response */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200
): Response {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/** Paginated list response */
export function sendPaginated<T>(
  res: Response,
  data: T[],
  meta: PaginationMeta,
  message?: string
): Response {
  return res.status(200).json({
    success: true,
    message,
    data,
    meta,
  });
}

/** Created response (201) */
export function sendCreated<T>(res: Response, data: T, message?: string): Response {
  return sendSuccess(res, data, message ?? 'Created successfully', 201);
}

/** No content response (204) */
export function sendNoContent(res: Response): Response {
  return res.status(204).send();
}

/** Error response */
export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  errors?: Record<string, string[]>,
  code?: string
): Response {
  return res.status(statusCode).json({
    success: false,
    message,
    code,
    errors,
  });
}

/** Build pagination meta from count + query params */
export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
