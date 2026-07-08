// =============================================================
// Nova Wood — Auth Module: Controller
// Handles HTTP layer for auth endpoints
// =============================================================
import type { Request, Response, Router } from 'express';
import { authService } from './auth.service';
import { sendSuccess, sendCreated } from '@core/response';
import { asyncHandler } from '@middleware/errorHandler';
import { validateBody } from '@middleware/validate';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
} from './auth.schema';
import express from 'express';
import { authenticate } from '@middleware/authenticate';
import { authLimiter } from '@middleware/rateLimit';

const router: Router = express.Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new customer account
 * @access  Public
 */
router.post(
  '/register',
  authLimiter,
  validateBody(registerSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    return sendCreated(res, result, 'Account created successfully');
  })
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login and receive JWT tokens
 * @access  Public
 */
router.post(
  '/login',
  authLimiter,
  validateBody(loginSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(
      req.body,
      req.headers['user-agent'],
      req.ip
    );
    return sendSuccess(res, result, 'Login successful');
  })
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Get a new access token using refresh token
 * @access  Public
 */
router.post(
  '/refresh',
  validateBody(refreshSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const tokens = await authService.refreshTokens(req.body.refreshToken);
    return sendSuccess(res, tokens, 'Tokens refreshed');
  })
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Revoke refresh token
 * @access  Private
 */
router.post(
  '/logout',
  authenticate,
  validateBody(refreshSchema),
  asyncHandler(async (req: Request, res: Response) => {
    await authService.logout(req.body.refreshToken);
    return sendSuccess(res, null, 'Logged out successfully');
  })
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current authenticated user profile
 * @access  Private
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.getProfile(req.user!.sub);
    return sendSuccess(res, user);
  })
);

export default router;
