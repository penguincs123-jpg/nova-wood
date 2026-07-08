// =============================================================
// Nova Wood — Utils: Slug Generator
// Creates URL-friendly slugs from multilingual strings
// =============================================================
import slugifyLib from 'slugify';

/**
 * Generates a URL-safe slug from any string.
 * Handles Arabic, English, and mixed text.
 */
export function slugify(text: string, separator = '-'): string {
  return slugifyLib(text, {
    replacement: separator,
    remove: /[*+~.()'"!:@]/g,
    lower: true,
    strict: false,
    locale: 'en',
    trim: true,
  });
}

/**
 * Generates a unique slug by appending a timestamp suffix if needed.
 * Used when creating products/categories to avoid collisions.
 */
export function uniqueSlug(text: string): string {
  const base = slugify(text);
  const suffix = Date.now().toString(36);
  return `${base}-${suffix}`;
}
