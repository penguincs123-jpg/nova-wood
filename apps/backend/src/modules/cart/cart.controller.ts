// =============================================================
// Nova Wood — Cart Module: Controller
// Handles shopping cart items, sessions, and coupon application
// =============================================================
import express from 'express';
import type { Router, Request, Response } from 'express';
import { prisma } from '@config/database';
import { sendSuccess } from '@core/response';
import { asyncHandler } from '@middleware/errorHandler';
import { optionalAuthenticate } from '@middleware/authenticate';
import { z } from 'zod';
import { validateBody } from '@middleware/validate';

const router: Router = express.Router();

const addToCartSchema = z.object({
  productId: z.string(),
  variantId: z.string().optional(),
  quantity: z.number().int().min(1),
  sessionId: z.string().optional(), // for guests
});

const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1),
});

// ---- Helper to locate or create active cart ----
async function getOrCreateCart(req: Request) {
  const userId = req.user?.sub;
  const sessionId = req.headers['x-session-id'] as string || req.query.sessionId as string;

  if (!userId && !sessionId) {
    return null;
  }

  // Look for cart
  let cart = await prisma.cart.findFirst({
    where: userId ? { userId } : { sessionId },
    include: {
      items: {
        include: {
          product: {
            include: {
              translations: { where: { locale: req.locale } },
              images: { where: { isMain: true }, take: 1 },
            },
          },
          variant: true,
        },
      },
      coupon: true,
    },
  });

  // If not found, create new cart
  if (!cart) {
    cart = await prisma.cart.create({
      data: userId ? { userId } : { sessionId },
      include: {
        items: {
          include: {
            product: {
              include: {
                translations: { where: { locale: req.locale } },
                images: { where: { isMain: true }, take: 1 },
              },
            },
            variant: true,
          },
        },
        coupon: true,
      },
    });
  }

  return cart;
}

interface CartItem {
  id: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  product: {
    basePrice: import('@prisma/client').Prisma.Decimal | number;
    salePrice?: import('@prisma/client').Prisma.Decimal | number | null;
  };
  variant?: {
    price?: import('@prisma/client').Prisma.Decimal | number | null;
  } | null;
}

interface CartWithItems {
  id: string;
  items: CartItem[];
  coupon?: {
    code: string;
    type: import('@prisma/client').CouponType;
    value: import('@prisma/client').Prisma.Decimal | number;
    maxDiscountAmount?: import('@prisma/client').Prisma.Decimal | number | null;
  } | null;
}

// ---- Calculate cart summary ----
function calculateCartSummary(cart: CartWithItems | null) {
  if (!cart) {
    return { items: [], subtotal: 0, discountAmount: 0, shippingAmount: 50, total: 50, currency: 'EGP' };
  }

  let subtotal = 0;
  for (const item of cart.items) {
    const price = item.variant?.price 
      ? Number(item.variant.price) 
      : (item.product.salePrice ? Number(item.product.salePrice) : Number(item.product.basePrice));
    subtotal += price * item.quantity;
  }

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

  // Free shipping threshold
  const freeShippingThreshold = 500;
  const shippingAmount = (subtotal - discountAmount) >= freeShippingThreshold ? 0 : 50;
  const total = Math.max(0, subtotal - discountAmount + shippingAmount);

  return {
    id: cart.id,
    items: cart.items,
    coupon: cart.coupon,
    subtotal,
    discountAmount,
    shippingAmount,
    total,
    currency: 'EGP',
  };
}

// =============================================================
// CART ENDPOINTS
// =============================================================

/** Get cart */
router.get(
  '/',
  optionalAuthenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const cart = await getOrCreateCart(req);
    const summary = calculateCartSummary(cart);
    return sendSuccess(res, summary);
  })
);

/** Add item to cart */
router.post(
  '/items',
  optionalAuthenticate,
  validateBody(addToCartSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { productId, variantId, quantity } = req.body;
    const cart = await getOrCreateCart(req);

    if (!cart) {
      return res.status(400).json({ success: false, message: 'Session ID or Auth token required' });
    }

    // Check if item already in cart
    const existingItem = cart.items.find(
      (item) => item.productId === productId && item.variantId === (variantId || null)
    );

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId: variantId || null,
          quantity,
        },
      });
    }

    // Reload cart
    const updatedCart = await getOrCreateCart(req);
    return sendSuccess(res, calculateCartSummary(updatedCart), 'Item added to cart');
  })
);

/** Update item quantity */
router.put(
  '/items/:itemId',
  optionalAuthenticate,
  validateBody(updateCartItemSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { quantity } = req.body;

    await prisma.cartItem.update({
      where: { id: req.params.itemId },
      data: { quantity },
    });

    const cart = await getOrCreateCart(req);
    return sendSuccess(res, calculateCartSummary(cart), 'Cart updated');
  })
);

/** Delete item from cart */
router.delete(
  '/items/:itemId',
  optionalAuthenticate,
  asyncHandler(async (req: Request, res: Response) => {
    await prisma.cartItem.delete({
      where: { id: req.params.itemId },
    });

    const cart = await getOrCreateCart(req);
    return sendSuccess(res, calculateCartSummary(cart), 'Item removed from cart');
  })
);

/** Apply coupon to cart */
router.post(
  '/coupon',
  optionalAuthenticate,
  validateBody(z.object({ code: z.string().min(1) })),
  asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.body;

    const coupon = await prisma.coupon.findUnique({
      where: { code, isActive: true },
    });

    if (!coupon) {
      return res.status(400).json({ success: false, message: 'Invalid or expired coupon code' });
    }

    const now = new Date();
    if (coupon.startsAt && coupon.startsAt > now) {
      return res.status(400).json({ success: false, message: 'Coupon is not active yet' });
    }
    if (coupon.expiresAt && coupon.expiresAt < now) {
      return res.status(400).json({ success: false, message: 'Coupon has expired' });
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    }

    const cart = await getOrCreateCart(req);
    if (!cart) {
      return res.status(400).json({ success: false, message: 'Cart not found' });
    }

    await prisma.cart.update({
      where: { id: cart.id },
      data: { couponId: coupon.id },
    });

    const updatedCart = await getOrCreateCart(req);
    return sendSuccess(res, calculateCartSummary(updatedCart), 'Coupon applied successfully');
  })
);

/** Remove coupon from cart */
router.delete(
  '/coupon',
  optionalAuthenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const cart = await getOrCreateCart(req);
    if (cart) {
      await prisma.cart.update({
        where: { id: cart.id },
        data: { couponId: null },
      });
    }

    const updatedCart = await getOrCreateCart(req);
    return sendSuccess(res, calculateCartSummary(updatedCart), 'Coupon removed');
  })
);

export default router;
