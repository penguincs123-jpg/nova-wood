// =============================================================
// Nova Wood — Middleware: Authentication
// JWT access token verification + role-based access control
// =============================================================
/* eslint-disable @typescript-eslint/no-namespace */
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@config/env';
import { UnauthorizedError, ForbiddenError } from '@core/errors';
import type { JwtPayload, Role } from '@nova-wood/types';

/** Extend Express Request to include typed user payload */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Verifies the JWT Bearer token in the Authorization header.
 * Attaches decoded payload to req.user.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('No authentication token provided');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token has expired', 'TOKEN_EXPIRED');
    }
    throw new UnauthorizedError('Invalid authentication token', 'INVALID_TOKEN');
  }
}

/**
 * Optional authentication — attaches user if token is present,
 * but does NOT throw if no token (for public endpoints that benefit from user context).
 */
export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      req.user = decoded;
    } catch {
      // Ignore invalid token for optional auth
    }
  }

  next();
}

/**
 * Role-based access control guard.
 * Must be used AFTER authenticate().
 * @param roles - allowed roles for this endpoint
 */
export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!roles.includes(req.user.role as Role)) {
      throw new ForbiddenError(
        `Access denied. Required roles: ${roles.join(', ')}`
      );
    }

    next();
  };
}
