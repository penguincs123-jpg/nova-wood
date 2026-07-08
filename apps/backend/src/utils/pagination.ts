// =============================================================
// Nova Wood — Utils: Pagination Helper
// Extracts and validates pagination params from query string
// =============================================================
import { z } from 'zod';
import { buildPaginationMeta } from '@core/response';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export const paginationSchema = z.object({
  page: z.string().optional().transform((v) => Math.max(1, parseInt(v ?? '1', 10) || 1)),
  limit: z.string().optional().transform((v) => Math.min(MAX_LIMIT, Math.max(1, parseInt(v ?? '20', 10) || 20))),
});

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

/** Extracts pagination params from a query object */
export function getPagination(query: { page?: string; limit?: string }): PaginationParams {
  const page = Math.max(DEFAULT_PAGE, parseInt(query.page ?? '1', 10) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT));

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  };
}

export { buildPaginationMeta };
