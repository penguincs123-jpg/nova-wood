// =============================================================
// Nova Wood — Admin Module: Controller
// Handles admin analytics, orders moderation, reviews status, and settings
// =============================================================
import express from 'express';
import type { Router, Request, Response } from 'express';
import { prisma } from '@config/database';
import { sendSuccess } from '@core/response';
import { asyncHandler } from '@middleware/errorHandler';
import { authenticate, authorize } from '@middleware/authenticate';
import { z } from 'zod';
import { validateBody } from '@middleware/validate';
import { cacheDelPattern } from '@config/redis';

const router: Router = express.Router();

// Ensure all routes in this router require Admin or Super Admin privileges
router.use(authenticate, authorize('ADMIN', 'SUPER_ADMIN'));

// =============================================================
// DASHBOARD & ANALYTICS
// =============================================================

/** Get sales and order summary statistics */
router.get(
  '/dashboard',
  asyncHandler(async (_req: Request, res: Response) => {
    // 1. Total sales and total orders
    const salesSummary = await prisma.order.aggregate({
      where: { paymentStatus: 'PAID' },
      _sum: { total: true },
      _count: { id: true },
    });

    // 2. Counts of pending orders, products, customers
    const [pendingOrders, totalProducts, totalCustomers] = await Promise.all([
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
    ]);

    // 3. Recent 5 orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true } },
      },
    });

    // 4. Low stock products (less than threshold)
    const lowStockProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        stockQty: { lte: 5 },
      },
      select: {
        id: true,
        sku: true,
        stockQty: true,
        translations: { where: { locale: 'en' }, select: { name: true } },
      },
    });

    return sendSuccess(res, {
      stats: {
        totalSales: salesSummary._sum.total ?? 0,
        totalOrders: salesSummary._count.id,
        pendingOrders,
        totalProducts,
        totalCustomers,
      },
      recentOrders,
      lowStockProducts,
    });
  })
);

// =============================================================
// ORDERS MANAGEMENT
// =============================================================

/** List all orders for administrative panel */
router.get(
  '/orders',
  asyncHandler(async (_req: Request, res: Response) => {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return sendSuccess(res, orders);
  })
);

/** Update order status */
router.put(
  '/orders/:id/status',
  validateBody(z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
    paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED']).optional(),
    note: z.string().optional(),
  })),
  asyncHandler(async (req: Request, res: Response) => {
    const { status, paymentStatus, note } = req.body;

    const order = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: req.params.id },
        data: {
          status,
          ...(paymentStatus && { paymentStatus }),
          ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
          ...(status === 'CANCELLED' && { cancelledAt: new Date() }),
        },
      });

      // Log status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: req.params.id,
          status,
          note: note || `Order status updated to ${status}`,
          createdBy: req.user?.sub,
        },
      });

      return updatedOrder;
    });

    return sendSuccess(res, order, 'Order status updated successfully');
  })
);

// =============================================================
// REVIEW MODERATION
// =============================================================

/** List all reviews requiring moderation */
router.get(
  '/reviews',
  asyncHandler(async (_req: Request, res: Response) => {
    const reviews = await prisma.review.findMany({
      include: {
        product: { select: { slug: true, sku: true } },
        user: { select: { email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return sendSuccess(res, reviews);
  })
);

/** Approve/Reject review */
router.put(
  '/reviews/:id/status',
  validateBody(z.object({
    status: z.enum(['APPROVED', 'REJECTED']),
    adminReply: z.string().optional(),
  })),
  asyncHandler(async (req: Request, res: Response) => {
    const { status, adminReply } = req.body;

    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: { status, adminReply },
    });

    // If approved, update product aggregate rating
    if (status === 'APPROVED') {
      const result = await prisma.review.aggregate({
        where: { productId: review.productId, status: 'APPROVED' },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await prisma.product.update({
        where: { id: review.productId },
        data: {
          averageRating: result._avg.rating ?? 0,
          reviewCount: result._count.rating,
        },
      });
    }

    return sendSuccess(res, review, `Review status updated to ${status}`);
  })
);

// =============================================================
// SETTINGS CONFIGURATION
// =============================================================

/** Update setting values */
router.put(
  '/settings',
  validateBody(z.array(z.object({
    key: z.string(),
    value: z.string().nullable(),
  }))),
  asyncHandler(async (req: Request, res: Response) => {
    const updates = req.body as Array<{ key: string; value: string | null }>;

    await prisma.$transaction(
      updates.map((u) =>
        prisma.setting.update({
          where: { key: u.key },
          data: { value: u.value },
        })
      )
    );

    // Invalidate settings cache
    await cacheDelPattern('cms:settings:*');

    return sendSuccess(res, null, 'Settings updated successfully');
  })
);

export default router;
