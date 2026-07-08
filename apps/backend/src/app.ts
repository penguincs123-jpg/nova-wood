// =============================================================
// Nova Wood — Express Application Setup
// Configures all middleware, routes, and error handlers
// =============================================================
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { env } from '@config/env';
import { globalErrorHandler } from '@middleware/errorHandler';
import { detectLanguage } from '@middleware/language';
import { globalLimiter } from '@middleware/rateLimit';
import apiRouter from '@routes/index';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

const app = express();

// =============================================================
// SECURITY MIDDLEWARE
// =============================================================

app.set('trust proxy', 1);

// Helmet — sets security-related HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // handled by frontend
}));

// CORS — allow frontend and admin origins
app.use(cors({
  origin: [env.FRONTEND_URL, env.ADMIN_URL],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
}));

// Global rate limiter (100 req / 15 min per IP)
app.use(globalLimiter);

// =============================================================
// REQUEST PARSING MIDDLEWARE
// =============================================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

// =============================================================
// LOGGING
// =============================================================
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// =============================================================
// LANGUAGE DETECTION
// =============================================================
app.use(detectLanguage);

// =============================================================
// STATIC FILES (Uploaded Images)
// =============================================================
app.use('/uploads', express.static(path.join(__dirname, '..', env.UPLOAD_DIR), {
  maxAge: '7d',
  etag: true,
  lastModified: true,
}));

// =============================================================
// API ROUTES
// =============================================================
app.use(env.API_PREFIX, apiRouter);

// Swagger API Documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Nova Wood API Documentation',
      version: '1.0.0',
      description: 'Complete API resources for Nova Wood furniture e-commerce',
    },
    servers: [
      {
        url: 'http://localhost:4000/api/v1',
      },
    ],
  },
  apis: [path.join(__dirname, 'routes', '*.ts')],
};
const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// 404 Handler
app.use('*', (_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    code: 'NOT_FOUND',
  });
});

// =============================================================
// GLOBAL ERROR HANDLER (must be last)
// =============================================================
app.use(globalErrorHandler);

export default app;
