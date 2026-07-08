// =============================================================
// Nova Wood — Middleware: Language Detection
// Sets req.locale from header, query, or user preference
// =============================================================
/* eslint-disable @typescript-eslint/no-namespace */
import type { Request, Response, NextFunction } from 'express';
import { env } from '@config/env';

const SUPPORTED_LOCALES = env.SUPPORTED_LOCALES.split(',').map((l) => l.trim());

declare global {
  namespace Express {
    interface Request {
      locale: string;
    }
  }
}

/**
 * Detects the request locale from:
 * 1. Query param: ?lang=ar
 * 2. Accept-Language header
 * 3. Defaults to DEFAULT_LOCALE from env
 */
export function detectLanguage(req: Request, _res: Response, next: NextFunction): void {
  // 1. Query param takes priority (e.g., ?lang=en)
  const queryLang = req.query.lang as string | undefined;
  if (queryLang && SUPPORTED_LOCALES.includes(queryLang)) {
    req.locale = queryLang;
    return next();
  }

  // 2. Accept-Language header
  const acceptLang = req.headers['accept-language'];
  if (acceptLang) {
    const preferred = acceptLang.split(',')[0].split('-')[0].trim();
    if (SUPPORTED_LOCALES.includes(preferred)) {
      req.locale = preferred;
      return next();
    }
  }

  // 3. Fall back to default
  req.locale = env.DEFAULT_LOCALE;
  next();
}
