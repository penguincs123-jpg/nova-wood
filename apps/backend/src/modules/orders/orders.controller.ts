// =============================================================
// Nova Wood — Orders Module: Controller
// Handles checkout, order creation, and customer history
// =============================================================
import express from 'express';
import type { Router, Request, Response } from 'express';
import { prisma } from '@config/database';
import { sendSuccess, sendCreated } from '@core/response';
import { asyncHandler } from '@middleware/errorHandler';
import { authenticate, optionalAuthenticate } from '@middleware/authenticate';
import { z } from 'zod';
import { validateBody } from '@middleware/validate';

const router: Router = express.Router();

const placeOrderSchema = z.object({
  addressId: z.string().optional(),
  guestEmail: z.string().email().optional(),
  guestPhone: z.string().optional(),
  shippingAddress: z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    phone: z.string(),
    country: z.string(),
    city: z.string(),
    state: z.string().optional(),
    street: z.string(),
    building: z.string().optional(),
    apartment: z.string().optional(),
    postalCode: z.string().optional(),
  }).optional(),
  couponCode: z.string().optional(),
  paymentMethod: z.enum(['CASH_ON_DELIVERY', 'CREDIT_CARD', 'PAYMOB', 'STRIPE', 'BANK_TRANSFER']).default('CASH_ON_DELIVERY'),
  notes: z.string().optional(),
});

/**
 * @route   POST /api/v1/orders
 * @desc    Place a new order (from cart)
 * @access  Optional Auth (supports guest checkout)
 */
router.post(
  '/',
  optionalAuthenticate,
  validateBody(placeOrderSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.sub;
    const sessionId = req.headers['x-session-id'] as string;
    const { addressId, guestEmail, guestPhone, shippingAddress, paymentMethod, notes } = req.body;

    // 1. Get active cart
    const cart = await prisma.cart.findFirst({
      where: userId ? { userId } : { sessionId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        coupon: true,
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    // 2. Determine shipping address
    let addressSnapshot: object | null = null;
    if (userId && addressId) {
      const address = await prisma.address.findUnique({ where: { id: addressId } });
      if (address && address.userId === userId) {
        addressSnapshot = address;
      }
    } else if (shippingAddress) {
      addressSnapshot = shippingAddress;
    }

    if (!addressSnapshot) {
      return res.status(400).json({ success: false, message: 'Shipping address is required' });
    }

    // 3. Calculate order pricing
    let subtotal = 0;
    const orderItemsData: { productId: string; variantId: string | null; quantity: number; unitPrice: number; totalPrice: number; snapshot: string }[] = [];

    for (const item of cart.items) {
      const price = item.variant?.price 
        ? Number(item.variant.price) 
        : (item.product.salePrice ? Number(item.product.salePrice) : Number(item.product.basePrice));
      
      const totalPrice = price * item.quantity;
      subtotal += totalPrice;

      orderItemsData.push({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: price,
        totalPrice,
        snapshot: JSON.stringify(item.product),
      });
    }

    // Discount
    let discountAmount = 0;
    if (cart.coupon) {
      if (cart.coupon.type === 'PERCENTAGE') {
        discountAmount = (subtotal * Number(cart.coupon.value)) / 100;
        if (cart.coupon.maxDiscountAmount) {
          discountAmount = Math.min(discountAmount, Number(cart.coupon.maxDiscountAmount));
        }
      } else if (cart.coupon.type === 'FIXED_AMOUNT') {
        discountAmount = Number(cart.coupon.value);
      }
    }

    // Shipping cost
    const shippingCost = (subtotal - discountAmount) >= 500 ? 0 : 50;
    const total = subtotal - discountAmount + shippingCost;

    // Generate unique order number (NW-YYYYMMDD-XXXX)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `NW-${dateStr}-${rand}`;

    // 4. Create Order & Update stock in a Transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: userId || null,
          guestEmail: userId ? null : (guestEmail || null),
          guestPhone: userId ? null : (guestPhone || null),
          addressId: userId ? (addressId || null) : null,
          couponId: cart.couponId,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          paymentMethod,
          subtotal,
          discountAmount,
          shippingAmount: shippingCost,
          total,
          shippingAddress: JSON.stringify(addressSnapshot),
          notes,
          items: {
            create: orderItemsData,
          },
          statusHistory: {
            create: {
              status: 'PENDING',
              note: 'Order placed successfully',
            },
          },
        },
        include: {
          items: true,
        },
      });

      // Update product/variant stocks
      for (const item of cart.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stockQty: { decrement: item.quantity } },
          });
        }
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQty: { decrement: item.quantity },
            soldCount: { increment: item.quantity },
          },
        });
      }

      // Increment coupon usage
      if (cart.couponId) {
        await tx.coupon.update({
          where: { id: cart.couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    return sendCreated(res, order, 'Order placed successfully');
  })
);

/**
 * @route   GET /api/v1/orders
 * @desc    Get order history for authenticated user
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.sub },
      include: {
        items: {
          include: {
            product: {
              include: {
                translations: { where: { locale: req.locale } },
                images: { where: { isMain: true }, take: 1 },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, orders);
  })
);

/**
 * @route   GET /api/v1/orders/:id
 * @desc    Get single order details
 * @access  Private
 */
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const order = await prisma.order.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.sub,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                translations: { where: { locale: req.locale } },
                images: { where: { isMain: true }, take: 1 },
              },
            },
          },
        },
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return sendSuccess(res, order);
  })
);

export default router;
