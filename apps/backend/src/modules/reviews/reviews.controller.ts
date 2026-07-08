// =============================================================
// Nova Wood — Reviews Module: Controller
// Handles user reviews, ratings, and helpful upvotes
// =============================================================
import express from 'express';
import type { Router, Request, Response } from 'express';
import { prisma } from '@config/database';
import { sendSuccess, sendCreated } from '@core/response';
import { asyncHandler } from '@middleware/errorHandler';
import { authenticate } from '@middleware/authenticate';
import { z } from 'zod';
import { validateBody } from '@middleware/validate';

const router: Router = express.Router();

const sanitizeText = (val: string): string => {
  return val.replace(/<[^>]*>/g, '').trim();
};

const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(255).transform(sanitizeText).optional(),
  body: z.string().min(5).transform(sanitizeText),
  images: z.array(z.string().url()).optional(),
});

/**
 * @route   POST /api/v1/reviews
 * @desc    Create a product review (requires verification check)
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  validateBody(reviewSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.sub;
    const { productId, rating, title, body, images } = req.body;

    // Check if user already reviewed this product
    const existing = await prisma.review.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product',
      });
    }

    // Check if user has purchased the product (verified purchase)
    const purchase = await prisma.order.findFirst({
      where: {
        userId,
        status: 'DELIVERED',
        items: {
          some: { productId },
        },
      },
    });

    const isVerified = !!purchase;

    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        title,
        body,
        isVerified,
        images: images ? JSON.stringify(images) : null,
        status: 'PENDING', // requires admin approval by default
      },
    });

    return sendCreated(res, review, 'Review submitted successfully and is pending approval');
  })
);

/**
 * @route   GET /api/v1/reviews/product/:productId
 * @desc    Get all approved reviews for a product
 * @access  Public
 */
router.get(
  '/product/:productId',
  asyncHandler(async (req: Request, res: Response) => {
    const reviews = await prisma.review.findMany({
      where: {
        productId: req.params.productId,
        status: 'APPROVED',
      },
      include: {
        user: {
          select: {
            id: true,
            avatar: true,
            profile: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, reviews);
  })
);

/**
 * @route   POST /api/v1/reviews/:id/helpful
 * @desc    Increment helpful count for a review
 * @access  Public
 */
router.post(
  '/:id/helpful',
  asyncHandler(async (req: Request, res: Response) => {
    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: { helpfulCount: { increment: 1 } },
    });
    return sendSuccess(res, { helpfulCount: review.helpfulCount }, 'Review marked helpful');
  })
);

export default router;
