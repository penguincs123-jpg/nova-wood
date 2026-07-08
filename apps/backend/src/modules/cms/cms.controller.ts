// =============================================================
// Nova Wood — CMS Module: Controller
// Pages, sliders, banners, and public settings
// =============================================================
import express from 'express';
import type { Router, Request, Response } from 'express';
import { prisma } from '@config/database';
import { sendSuccess } from '@core/response';
import { asyncHandler } from '@middleware/errorHandler';
import { cacheGet, cacheSet } from '@config/redis';

const router: Router = express.Router();

/**
 * @route   GET /api/v1/cms/settings
 * @desc    Get all public site settings (colors, logo, name, etc.)
 * @access  Public
 */
router.get(
  '/settings',
  asyncHandler(async (_req: Request, res: Response) => {
    const cacheKey = 'cms:settings:public';
    const cached = await cacheGet(cacheKey);
    if (cached) return sendSuccess(res, cached);

    const settings = await prisma.setting.findMany({
      where: { isPublic: true },
      select: { key: true, value: true, type: true, group: true },
    });

    // Convert to key-value object for easy frontend use
    const settingsMap = settings.reduce<Record<string, string | null>>((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});

    await cacheSet(cacheKey, settingsMap, 3600);
    return sendSuccess(res, settingsMap);
  })
);

/**
 * @route   GET /api/v1/cms/sliders
 * @desc    Get active sliders (for homepage hero)
 * @access  Public
 */
router.get(
  '/sliders',
  asyncHandler(async (req: Request, res: Response) => {
    const locale = req.locale;
    const cacheKey = `cms:sliders:${locale}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return sendSuccess(res, cached);

    const sliders = await prisma.slider.findMany({
      where: { isActive: true },
      include: { translations: { where: { locale } } },
      orderBy: { sortOrder: 'asc' },
    });

    await cacheSet(cacheKey, sliders, 600);
    return sendSuccess(res, sliders);
  })
);

/**
 * @route   GET /api/v1/cms/banners/:placement
 * @desc    Get active banners for a specific placement
 * @access  Public
 */
router.get(
  '/banners/:placement',
  asyncHandler(async (req: Request, res: Response) => {
    const locale = req.locale;
    const now = new Date();

    const banners = await prisma.banner.findMany({
      where: {
        placement: req.params.placement,
        isActive: true,
        OR: [
          { startsAt: null },
          { startsAt: { lte: now } },
        ],
        AND: [
          { OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] },
        ],
      },
      include: { translations: { where: { locale } } },
      orderBy: { sortOrder: 'asc' },
    });

    return sendSuccess(res, banners);
  })
);

/**
 * @route   GET /api/v1/cms/pages/:slug
 * @desc    Get a CMS page by slug
 * @access  Public
 */
router.get(
  '/pages/:slug',
  asyncHandler(async (req: Request, res: Response) => {
    const locale = req.locale;
    const page = await prisma.page.findUnique({
      where: { slug: req.params.slug },
      include: { translations: { where: { locale } } },
    });

    if (!page || !page.isActive) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    return sendSuccess(res, page);
  })
);

export default router;
