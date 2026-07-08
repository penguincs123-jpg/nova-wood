// =============================================================
// Nova Wood — Products Module: Service
// Business logic layer for product operations
// =============================================================
import { productRepository } from './products.repository';
import { cacheGet, cacheSet, cacheDelPattern } from '@config/redis';
import { NotFoundError } from '@core/errors';
import type { ProductFilters } from '@nova-wood/types';

export class ProductService {
  private readonly CACHE_TTL = 300; // 5 minutes

  /** Get paginated product list with caching */
  async getProducts(filters: ProductFilters) {
    const cacheKey = `products:list:${JSON.stringify(filters)}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;

    const result = await productRepository.findMany(filters);

    await cacheSet(cacheKey, result, this.CACHE_TTL);
    return result;
  }

  /** Get a single product by slug */
  async getProductBySlug(slug: string, locale: string) {
    const cacheKey = `products:slug:${slug}:${locale}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;

    const product = await productRepository.findBySlug(slug, locale);
    if (!product || !product.isActive) {
      throw new NotFoundError('Product');
    }

    // Async view count increment (don't await)
    productRepository.incrementViewCount(product.id).catch(() => {});

    await cacheSet(cacheKey, product, this.CACHE_TTL);
    return product;
  }

  /** Get product by ID (admin) */
  async getProductById(id: string) {
    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError('Product');
    return product;
  }

  /** Create product (admin) */
  async createProduct(data: Parameters<typeof productRepository.create>[0]) {
    const product = await productRepository.create(data);
    await cacheDelPattern('products:*');
    return product;
  }

  /** Update product (admin) */
  async updateProduct(id: string, data: Parameters<typeof productRepository.update>[1]) {
    const product = await productRepository.update(id, data);
    await cacheDelPattern('products:*');
    return product;
  }

  /** Delete (deactivate) product */
  async deleteProduct(id: string) {
    await productRepository.delete(id);
    await cacheDelPattern('products:*');
  }
}

export const productService = new ProductService();
