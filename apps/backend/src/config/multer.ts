// =============================================================
// Nova Wood — Multer Upload Configuration
// Handles file uploads with size limits & type validation
// =============================================================
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { env } from './env';
import type { Request } from 'express';

/** Allowed image MIME types */
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

/** Max file size in bytes */
const MAX_FILE_SIZE = env.MAX_FILE_SIZE_MB * 1024 * 1024;

/** Disk storage — files land in uploads/original/ */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(env.UPLOAD_DIR, 'original'));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

/** File filter — rejects non-image types */
const imageFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`));
  }
};

/** Single image upload */
export const uploadSingle = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: imageFileFilter,
}).single('image');

/** Multiple images upload (max 10) */
export const uploadMultiple = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: imageFileFilter,
}).array('images', 10);
