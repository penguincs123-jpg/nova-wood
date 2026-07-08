// =============================================================
// Nova Wood — Categories Module: Controller
// =============================================================
import express from 'express';
import type { Router, Request, Response } from 'express';
import { prisma } from '@config/database';
import { sendSuccess } from '@core/response';
import { asyncHandler } from '@middleware/errorHandler';
import { cacheGet, cacheSet } from '@config/redis';

const router: Router = express.Router();

/**
 * @route   GET /api/v1/categories
 * @desc    Get full category tree with translations
 * @access  Public
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const locale = req.locale;
    const cacheKey = `categories:tree:${locale}`;

    const cached = await cacheGet(cacheKey);
    if (cached) return sendSuccess(res, cached);

    // Fetch root categories with their children
    const categories = await prisma.category.findMany({
      where: { parentId: null, isActive: true },
      include: {
        translations: { where: { locale } },
        children: {
          where: { isActive: true },
          include: {
            translations: { where: { locale } },
            _count: { select: { products: { where: { isActive: true } } } },
          },
          orderBy: { sortOrder: 'asc' },
        },
        _count: { select: { products: { where: { isActive: true } } } },
      },
      orderBy: { sortOrder: 'asc' },
    });

    await cacheSet(cacheKey, categories, 600);
    return sendSuccess(res, categories);
  })
);

/**
 * @route   GET /api/v1/categories/:slug
 * @desc    Get single category with products count
 * @access  Public
 */
router.get(
  '/:slug',
  asyncHandler(async (req: Request, res: Response) => {
    const locale = req.locale;
    const category = await prisma.category.findUnique({
      where: { slug: req.params.slug },
      include: {
        translations: { where: { locale } },
        children: {
          where: { isActive: true },
          include: { translations: { where: { locale } } },
        },
        parent: {
          include: { translations: { where: { locale } } },
        },
        _count: { select: { products: { where: { isActive: true } } } },
      },
    });

    if (!category || !category.isActive) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    return sendSuccess(res, category);
  })
);

export default router;
