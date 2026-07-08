// =============================================================
// Nova Wood — Users Module: Controller
// Handles user profile, addresses, and wishlist
// =============================================================
import express from 'express';
import type { Router, Request, Response } from 'express';
import { prisma } from '@config/database';
import { sendSuccess, sendCreated, sendNoContent } from '@core/response';
import { asyncHandler } from '@middleware/errorHandler';
import { authenticate } from '@middleware/authenticate';
import { z } from 'zod';
import { validateBody } from '@middleware/validate';

const router: Router = express.Router();

const updateProfileSchema = z.object({
  firstName: z.string().min(2).max(100).optional(),
  lastName: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^\+?[0-9]{7,15}$/).optional(),
  preferredLocale: z.enum(['ar', 'en']).optional(),
  newsletterSubscribed: z.boolean().optional(),
});

const addressSchema = z.object({
  type: z.enum(['SHIPPING', 'BILLING', 'BOTH']).default('SHIPPING'),
  label: z.string().min(1).max(100),
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  phone: z.string().min(7).max(20),
  country: z.string().min(2).max(100),
  city: z.string().min(2).max(100),
  state: z.string().max(100).optional(),
  street: z.string().min(3).max(255),
  building: z.string().max(100).optional(),
  apartment: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  isDefault: z.boolean().default(false),
});

// =============================================================
// PROFILE ENDPOINTS
// =============================================================

/** Get user profile */
router.get(
  '/profile',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.sub },
      include: { profile: true },
    });
    return sendSuccess(res, user);
  })
);

/** Update user profile */
router.put(
  '/profile',
  authenticate,
  validateBody(updateProfileSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { firstName, lastName, preferredLocale, newsletterSubscribed, phone } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.sub },
      data: {
        ...(phone && { phone }),
        profile: {
          update: {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(preferredLocale && { preferredLocale }),
            ...(newsletterSubscribed !== undefined && { newsletterSubscribed }),
          },
        },
      },
      include: { profile: true },
    });

    return sendSuccess(res, user, 'Profile updated successfully');
  })
);

// =============================================================
// ADDRESSES ENDPOINTS
// =============================================================

/** List all user addresses */
router.get(
  '/addresses',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user!.sub },
      orderBy: { isDefault: 'desc' },
    });
    return sendSuccess(res, addresses);
  })
);

/** Create address */
router.post(
  '/addresses',
  authenticate,
  validateBody(addressSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.sub;

    // If isDefault is true, unset other default addresses
    if (req.body.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        ...req.body,
        userId,
      },
    });

    return sendCreated(res, address, 'Address added successfully');
  })
);

/** Update address */
router.put(
  '/addresses/:id',
  authenticate,
  validateBody(addressSchema.partial()),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.sub;

    // Check ownership
    const existing = await prisma.address.findUnique({
      where: { id: req.params.id },
    });
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    if (req.body.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id: req.params.id },
      data: req.body,
    });

    return sendSuccess(res, address, 'Address updated successfully');
  })
);

/** Delete address */
router.delete(
  '/addresses/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.sub;

    const existing = await prisma.address.findUnique({
      where: { id: req.params.id },
    });
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    await prisma.address.delete({
      where: { id: req.params.id },
    });

    return sendNoContent(res);
  })
);

// =============================================================
// WISHLIST ENDPOINTS
// =============================================================

/** Get user wishlist */
router.get(
  '/wishlist',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: req.user!.sub },
      include: {
        product: {
          include: {
            translations: { where: { locale: req.locale } },
            images: { where: { isMain: true }, take: 1 },
          },
        },
      },
    });
    return sendSuccess(res, wishlist);
  })
);

/** Add product to wishlist */
router.post(
  '/wishlist',
  authenticate,
  validateBody(z.object({ productId: z.string() })),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.sub;
    const { productId } = req.body;

    const item = await prisma.wishlist.upsert({
      where: {
        userId_productId: { userId, productId },
      },
      update: {},
      create: { userId, productId },
    });

    return sendCreated(res, item, 'Added to wishlist');
  })
);

/** Remove product from wishlist */
router.delete(
  '/wishlist/:productId',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.sub;

    await prisma.wishlist.deleteMany({
      where: { userId, productId: req.params.productId },
    });

    return sendNoContent(res);
  })
);

export default router;
