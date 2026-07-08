// =============================================================
// Nova Wood — Products Module: Repository
// Data access layer — all Prisma queries for products
// =============================================================
import { prisma } from '@config/database';
import { getPagination, buildPaginationMeta } from '@utils/pagination';
import type { ProductFilters, PaginatedResponse } from '@nova-wood/types';
import type { Prisma } from '@prisma/client';

export class ProductRepository {
  /**
   * Find paginated list of products with filters.
   * Supports multilingual content via locale-specific translations.
   */
  async findMany(filters: ProductFilters): Promise<PaginatedResponse<unknown>> {
    const { page = 1, limit = 20, skip, take } = getPagination({
      page: String(filters.page ?? 1),
      limit: String(filters.limit ?? 20),
    });

    // Build dynamic where clause
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.brandId && { brandId: filters.brandId }),
      ...(filters.isFeatured !== undefined && { isFeatured: filters.isFeatured }),
      ...(filters.isNew !== undefined && { isNew: filters.isNew }),
      ...(filters.isBestSeller !== undefined && { isBestSeller: filters.isBestSeller }),
      ...(filters.inStock && { stockQty: { gt: 0 } }),
      ...(filters.minPrice !== undefined || filters.maxPrice !== undefined
        ? {
            basePrice: {
              ...(filters.minPrice !== undefined && { gte: filters.minPrice }),
              ...(filters.maxPrice !== undefined && { lte: filters.maxPrice }),
            },
          }
        : {}),
      ...(filters.search && {
        translations: {
          some: {
            locale: filters.locale ?? 'ar',
            name: { contains: filters.search },
          },
        },
      }),
      ...(filters.categorySlug && {
        category: { slug: filters.categorySlug },
      }),
      ...(filters.brandSlug && {
        brand: { slug: filters.brandSlug },
      }),
      ...(filters.tags?.length && {
        tags: {
          some: {
            tag: { slug: { in: filters.tags } },
          },
        },
      }),
    };

    // Build orderBy clause
    const orderBy: Prisma.ProductOrderByWithRelationInput = (() => {
      switch (filters.sortBy) {
        case 'price_asc': return { basePrice: 'asc' };
        case 'price_desc': return { basePrice: 'desc' };
        case 'rating': return { averageRating: 'desc' };
        case 'popular': return { soldCount: 'desc' };
        case 'newest':
        default: return { createdAt: 'desc' };
      }
    })();

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          translations: {
            where: { locale: filters.locale ?? 'ar' },
          },
          images: {
            where: { isMain: true },
            take: 1,
          },
          category: {
            include: {
              translations: { where: { locale: filters.locale ?? 'ar' } },
            },
          },
          brand: {
            include: {
              translations: { where: { locale: filters.locale ?? 'ar' } },
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  /** Find a single product by slug with full details */
  async findBySlug(slug: string, locale: string) {
    return prisma.product.findUnique({
      where: { slug },
      include: {
        translations: true, // all locales for SEO
        images: { orderBy: { sortOrder: 'asc' } },
        variants: {
          where: { isActive: true },
          include: { images: true },
          orderBy: { sortOrder: 'asc' },
        },
        category: {
          include: { translations: { where: { locale } } },
        },
        brand: {
          include: { translations: { where: { locale } } },
        },
        tags: { include: { tag: true } },
        reviews: {
          where: { status: 'APPROVED' },
          include: {
            user: {
              select: { id: true, avatar: true, profile: { select: { firstName: true, lastName: true } } },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        relatedTo: {
          include: {
            to: {
              include: {
                translations: { where: { locale } },
                images: { where: { isMain: true }, take: 1 },
              },
            },
          },
          take: 6,
        },
      },
    });
  }

  /** Find product by ID (for admin) */
  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        translations: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { include: { images: true } },
        category: true,
        brand: true,
        tags: { include: { tag: true } },
      },
    });
  }

  /** Create a new product */
  async create(data: Prisma.ProductCreateInput) {
    return prisma.product.create({
      data,
      include: { translations: true, images: true },
    });
  }

  /** Update a product */
  async update(id: string, data: Prisma.ProductUpdateInput) {
    return prisma.product.update({
      where: { id },
      data,
      include: { translations: true, images: true },
    });
  }

  /** Soft delete — just deactivate */
  async delete(id: string) {
    return prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /** Increment view count */
  async incrementViewCount(id: string) {
    return prisma.product.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  }

  /** Update stock after order */
  async updateStock(id: string, quantity: number) {
    return prisma.product.update({
      where: { id },
      data: {
        stockQty: { decrement: quantity },
        soldCount: { increment: quantity },
      },
    });
  }

  /** Recalculate product average rating */
  async recalculateRating(productId: string) {
    const result = await prisma.review.aggregate({
      where: { productId, status: 'APPROVED' },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return prisma.product.update({
      where: { id: productId },
      data: {
        averageRating: result._avg.rating ?? 0,
        reviewCount: result._count.rating,
      },
    });
  }
}

export const productRepository = new ProductRepository();
