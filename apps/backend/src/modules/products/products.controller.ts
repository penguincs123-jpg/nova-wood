// =============================================================
// Nova Wood — Products Module: Controller (Routes)
// =============================================================
import express from 'express';
import type { Router, Request, Response } from 'express';
import { productService } from './products.service';
import { sendSuccess, sendPaginated } from '@core/response';
import { asyncHandler } from '@middleware/errorHandler';
import { authenticate, authorize } from '@middleware/authenticate';
import { z } from 'zod';
import { validateQuery } from '@middleware/validate';
import type { ProductFilters } from '@nova-wood/types';

const router: Router = express.Router();

/** Query schema for product listing */
const productListSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  locale: z.enum(['ar', 'en']).optional(),
  categorySlug: z.string().optional(),
  brandSlug: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.string().optional().transform((v) => v ? Number(v) : undefined),
  maxPrice: z.string().optional().transform((v) => v ? Number(v) : undefined),
  isFeatured: z.string().optional().transform((v) => v === 'true' ? true : undefined),
  isNew: z.string().optional().transform((v) => v === 'true' ? true : undefined),
  isBestSeller: z.string().optional().transform((v) => v === 'true' ? true : undefined),
  inStock: z.string().optional().transform((v) => v === 'true' ? true : undefined),
  sortBy: z.enum(['price_asc', 'price_desc', 'newest', 'rating', 'popular']).optional(),
  tags: z.string().optional().transform((v) => v ? v.split(',') : undefined),
  lang: z.string().optional(),
});

/**
 * @route   GET /api/v1/products
 * @desc    Get paginated product list with filters
 * @access  Public
 */
router.get(
  '/',
  validateQuery(productListSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const filters: ProductFilters = {
      ...req.query as unknown as ProductFilters,
      locale: req.locale as 'ar' | 'en',
    };
    const result = await productService.getProducts(filters) as { data: unknown[]; meta: import('@nova-wood/types').PaginationMeta };
    return sendPaginated(res, result.data, result.meta);
  })
);

/**
 * @route   GET /api/v1/products/:slug
 * @desc    Get single product by slug
 * @access  Public
 */
router.get(
  '/:slug',
  asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.getProductBySlug(req.params.slug, req.locale);
    return sendSuccess(res, product);
  })
);

// ---- Admin Routes ----

/**
 * @route   GET /api/v1/products/admin/:id
 * @desc    Get product by ID (admin, includes all data)
 * @access  Admin
 */
router.get(
  '/admin/:id',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.getProductById(req.params.id);
    return sendSuccess(res, product);
  })
);

export default router;
