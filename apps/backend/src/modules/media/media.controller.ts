// =============================================================
// Nova Wood — Media Module: Controller
// Handles file uploads with WebP/AVIF conversion
// =============================================================
import express from 'express';
import type { Router, Request, Response } from 'express';
import { sendSuccess, sendCreated } from '@core/response';
import { asyncHandler } from '@middleware/errorHandler';
import { authenticate, authorize } from '@middleware/authenticate';
import { uploadMultiple, uploadSingle } from '@config/multer';
import { processImage, deleteImageFiles } from '@utils/imageProcessor';
import { prisma } from '@config/database';
import { NotFoundError } from '@core/errors';

const router: Router = express.Router();

/**
 * @route   POST /api/v1/media/upload
 * @desc    Upload a single image (converts to WebP + AVIF)
 * @access  Admin
 */
router.post(
  '/upload',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  (req, res, next) => {
    uploadSingle(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  },
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Process image to WebP + AVIF
    const processed = await processImage(req.file.path, req.file.filename);

    // Save to media library
    const media = await prisma.media.create({
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        url: processed.originalUrl,
        urlWebp: processed.webpUrl,
        urlAvif: processed.avifUrl,
        mimeType: req.file.mimetype,
        type: 'IMAGE',
        size: req.file.size,
        width: processed.width,
        height: processed.height,
        altText: req.body.altText || req.file.originalname,
        folder: req.body.folder || 'general',
        uploadedBy: req.user?.sub,
      },
    });

    return sendCreated(res, media, 'Image uploaded successfully');
  })
);

/**
 * @route   POST /api/v1/media/upload-multiple
 * @desc    Upload multiple images
 * @access  Admin
 */
router.post(
  '/upload-multiple',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  (req, res, next) => {
    uploadMultiple(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  },
  asyncHandler(async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files?.length) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const uploads = await Promise.all(
      files.map(async (file) => {
        const processed = await processImage(file.path, file.filename);
        return prisma.media.create({
          data: {
            filename: file.filename,
            originalName: file.originalname,
            url: processed.originalUrl,
            urlWebp: processed.webpUrl,
            urlAvif: processed.avifUrl,
            mimeType: file.mimetype,
            type: 'IMAGE',
            size: file.size,
            width: processed.width,
            height: processed.height,
            altText: file.originalname,
            folder: req.body.folder || 'general',
            uploadedBy: req.user?.sub,
          },
        });
      })
    );

    return sendCreated(res, uploads, `${uploads.length} images uploaded`);
  })
);

/**
 * @route   GET /api/v1/media
 * @desc    Get media library with optional folder filter
 * @access  Admin
 */
router.get(
  '/',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  asyncHandler(async (req: Request, res: Response) => {
    const folder = req.query.folder as string | undefined;
    const media = await prisma.media.findMany({
      where: folder ? { folder } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return sendSuccess(res, media);
  })
);

/**
 * @route   DELETE /api/v1/media/:id
 * @desc    Delete a media file (all formats)
 * @access  Admin
 */
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  asyncHandler(async (req: Request, res: Response) => {
    const media = await prisma.media.findUnique({ where: { id: req.params.id } });
    if (!media) throw new NotFoundError('Media');

    // Delete physical files
    await deleteImageFiles(media.filename);

    // Remove from DB
    await prisma.media.delete({ where: { id: req.params.id } });

    return sendSuccess(res, null, 'Media deleted');
  })
);

export default router;
