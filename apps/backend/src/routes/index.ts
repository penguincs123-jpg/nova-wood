// =============================================================
// Nova Wood — Main API Router (v1)
// Aggregates all module routers under /api/v1
// =============================================================
import express from 'express';
import type { Router } from 'express';

// Module routers
import authRouter from '@modules/auth/auth.controller';
import productsRouter from '@modules/products/products.controller';
import categoriesRouter from '@modules/categories/categories.controller';
import cartRouter from '@modules/cart/cart.controller';
import ordersRouter from '@modules/orders/orders.controller';
import reviewsRouter from '@modules/reviews/reviews.controller';
import usersRouter from '@modules/users/users.controller';
import cmsRouter from '@modules/cms/cms.controller';
import mediaRouter from '@modules/media/media.controller';
import adminRouter from '@modules/admin/admin.controller';

const router: Router = express.Router();

// ---- Auth ----
router.use('/auth', authRouter);

// ---- Catalog ----
router.use('/products', productsRouter);
router.use('/categories', categoriesRouter);

// ---- Shopping ----
router.use('/cart', cartRouter);
router.use('/orders', ordersRouter);
router.use('/reviews', reviewsRouter);
router.use('/users', usersRouter);

// ---- CMS & Media ----
router.use('/cms', cmsRouter);
router.use('/media', mediaRouter);

// ---- Administrative Panel ----
router.use('/admin', adminRouter);

export default router;
