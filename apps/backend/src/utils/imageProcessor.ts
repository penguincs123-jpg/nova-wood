// =============================================================
// Nova Wood — Utils: Image Processing
// Converts uploaded images to WebP and AVIF formats using Sharp
// =============================================================
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { env } from '@config/env';

export interface ProcessedImages {
  original: string;   // relative path
  webp: string;       // relative path
  avif: string;       // relative path
  originalUrl: string;
  webpUrl: string;
  avifUrl: string;
  width: number;
  height: number;
}

/**
 * Processes an uploaded image file:
 * - Strips EXIF data
 * - Creates WebP version
 * - Creates AVIF version
 * - Returns paths to all versions
 */
export async function processImage(
  inputPath: string,
  filename: string
): Promise<ProcessedImages> {
  const baseName = path.parse(filename).name;
  const webpFilename = `${baseName}.webp`;
  const avifFilename = `${baseName}.avif`;

  const webpPath = path.join(env.UPLOAD_DIR, 'webp', webpFilename);
  const avifPath = path.join(env.UPLOAD_DIR, 'avif', avifFilename);

  // Ensure output directories exist
  await fs.mkdir(path.join(env.UPLOAD_DIR, 'webp'), { recursive: true });
  await fs.mkdir(path.join(env.UPLOAD_DIR, 'avif'), { recursive: true });

  // Get image metadata
  const metadata = await sharp(inputPath).metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;

  // Convert to WebP
  await sharp(inputPath)
    .rotate() // auto-rotate based on EXIF
    .webp({ quality: env.IMAGE_QUALITY_WEBP, effort: 4 })
    .toFile(webpPath);

  // Convert to AVIF
  await sharp(inputPath)
    .rotate()
    .avif({ quality: env.IMAGE_QUALITY_AVIF, effort: 4 })
    .toFile(avifPath);

  const baseUrl = env.CDN_BASE_URL || '/uploads';

  return {
    original: path.join('original', filename),
    webp: path.join('webp', webpFilename),
    avif: path.join('avif', avifFilename),
    originalUrl: `${baseUrl}/original/${filename}`,
    webpUrl: `${baseUrl}/webp/${webpFilename}`,
    avifUrl: `${baseUrl}/avif/${avifFilename}`,
    width,
    height,
  };
}

/**
 * Deletes all versions of an image (original, webp, avif).
 */
export async function deleteImageFiles(filename: string): Promise<void> {
  const baseName = path.parse(filename).name;
  const ext = path.parse(filename).ext;

  const filePaths = [
    path.join(env.UPLOAD_DIR, 'original', `${baseName}${ext}`),
    path.join(env.UPLOAD_DIR, 'webp', `${baseName}.webp`),
    path.join(env.UPLOAD_DIR, 'avif', `${baseName}.avif`),
  ];

  await Promise.allSettled(filePaths.map((p) => fs.unlink(p)));
}

/**
 * Generates responsive image srcset string for frontend use.
 */
export function generateSrcSet(baseUrl: string, sizes = [400, 800, 1200]): string {
  return sizes.map((size) => `${baseUrl}?w=${size} ${size}w`).join(', ');
}
