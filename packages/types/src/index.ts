// =============================================================
// Nova Wood — Shared TypeScript Types
// Mirrors Prisma models + API contracts
// =============================================================

// ---- Enums ----
export type Role = 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
export type PaymentMethod = 'CASH_ON_DELIVERY' | 'CREDIT_CARD' | 'PAYMOB' | 'STRIPE' | 'BANK_TRANSFER';
export type CouponType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type MediaType = 'IMAGE' | 'VIDEO' | 'DOCUMENT';
export type NotificationType = 'ORDER_PLACED' | 'ORDER_SHIPPED' | 'ORDER_DELIVERED' | 'ORDER_CANCELLED' | 'REVIEW_APPROVED' | 'REVIEW_REJECTED' | 'PROMOTIONAL' | 'SYSTEM';
export type Locale = 'ar' | 'en';

// ---- Pagination ----
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ---- API Response Wrapper ----
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

// ---- Auth Types ----
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JwtPayload {
  sub: string;       // user ID
  email: string;
  role: Role;
  iat: number;
  exp: number;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

// ---- User Types ----
export interface UserPublic {
  id: string;
  email: string;
  role: Role;
  avatar?: string | null;
  profile?: {
    firstName?: string | null;
    lastName?: string | null;
    preferredLocale: string;
  } | null;
  createdAt: Date;
}

// ---- Category Types ----
export interface CategoryTranslationDto {
  locale: Locale;
  name: string;
  description?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

export interface CategoryDto {
  id: string;
  slug: string;
  parentId?: string | null;
  imageUrl?: string | null;
  iconUrl?: string | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  translations: CategoryTranslationDto[];
  children?: CategoryDto[];
  productCount?: number;
}

// ---- Brand Types ----
export interface BrandDto {
  id: string;
  slug: string;
  logoUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
  translations: Array<{
    locale: Locale;
    name: string;
    description?: string | null;
  }>;
}

// ---- Product Types ----
export interface ProductVariantDto {
  id: string;
  sku: string;
  price?: number | null;
  salePrice?: number | null;
  stockQty: number;
  isActive: boolean;
  sortOrder: number;
  attributes: Record<string, string>;
  images: ProductImageDto[];
}

export interface ProductImageDto {
  id: string;
  url: string;
  urlWebp?: string | null;
  urlAvif?: string | null;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
  isMain: boolean;
  sortOrder: number;
}

export interface ProductTranslationDto {
  locale: Locale;
  name: string;
  shortDescription?: string | null;
  description?: string | null;
  features?: string | null;
  materials?: string | null;
  careInstructions?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
}

export interface ProductDto {
  id: string;
  sku: string;
  slug: string;
  categoryId?: string | null;
  brandId?: string | null;
  basePrice: number;
  salePrice?: number | null;
  salePriceEndsAt?: Date | null;
  currency: string;
  stockQty: number;
  weight?: number | null;
  dimensions?: {
    length?: number | null;
    width?: number | null;
    height?: number | null;
  };
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  hasVariants: boolean;
  averageRating: number;
  reviewCount: number;
  soldCount: number;
  translations: ProductTranslationDto[];
  images: ProductImageDto[];
  variants: ProductVariantDto[];
  category?: CategoryDto | null;
  brand?: BrandDto | null;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ---- Product Filters ----
export interface ProductFilters {
  locale?: Locale;
  categoryId?: string;
  categorySlug?: string;
  brandId?: string;
  brandSlug?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  inStock?: boolean;
  tags?: string[];
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'rating' | 'popular';
  page?: number;
  limit?: number;
}

// ---- Cart Types ----
export interface CartItemDto {
  id: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  product: Pick<ProductDto, 'id' | 'slug' | 'basePrice' | 'salePrice' | 'stockQty' | 'images' | 'translations'>;
  variant?: ProductVariantDto | null;
}

export interface CartDto {
  id: string;
  items: CartItemDto[];
  coupon?: CouponDto | null;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  total: number;
  currency: string;
}

// ---- Order Types ----
export interface OrderItemDto {
  id: string;
  productId?: string | null;
  variantId?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  snapshot: Record<string, unknown>;
}

export interface OrderDto {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  currency: string;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  taxAmount: number;
  total: number;
  shippingAddress: Record<string, unknown>;
  notes?: string | null;
  trackingNumber?: string | null;
  estimatedDelivery?: Date | null;
  deliveredAt?: Date | null;
  items: OrderItemDto[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PlaceOrderDto {
  addressId?: string;
  guestEmail?: string;
  guestPhone?: string;
  shippingAddress?: {
    firstName: string;
    lastName: string;
    phone: string;
    country: string;
    city: string;
    state?: string;
    street: string;
    building?: string;
    apartment?: string;
    postalCode?: string;
  };
  couponCode?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}

// ---- Review Types ----
export interface ReviewDto {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  title?: string | null;
  body: string;
  status: ReviewStatus;
  isVerified: boolean;
  helpfulCount: number;
  images?: string[];
  adminReply?: string | null;
  createdAt: Date;
  user?: Pick<UserPublic, 'id' | 'profile' | 'avatar'>;
}

// ---- Coupon Types ----
export interface CouponDto {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  expiresAt?: Date | null;
}

// ---- CMS Types ----
export interface PageDto {
  id: string;
  slug: string;
  isActive: boolean;
  translations: Array<{
    locale: Locale;
    title: string;
    content?: string | null;
    excerpt?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
  }>;
}

export interface SliderDto {
  id: string;
  name: string;
  isActive: boolean;
  autoplay: boolean;
  interval: number;
  translations: Array<{
    locale: Locale;
    title?: string | null;
    subtitle?: string | null;
    ctaText?: string | null;
    ctaUrl?: string | null;
    imageUrl: string;
    imageUrlWebp?: string | null;
    imageUrlAvif?: string | null;
    imageAlt?: string | null;
    mobileImageUrl?: string | null;
    bgColor?: string | null;
  }>;
}

export interface BannerDto {
  id: string;
  placement: string;
  isActive: boolean;
  translations: Array<{
    locale: Locale;
    title?: string | null;
    subtitle?: string | null;
    ctaText?: string | null;
    ctaUrl?: string | null;
    imageUrl: string;
    imageUrlWebp?: string | null;
    imageUrlAvif?: string | null;
    imageAlt?: string | null;
  }>;
}

// ---- Settings Types ----
export type SettingGroup = 'general' | 'seo' | 'theme' | 'social' | 'contact' | 'shipping' | 'payment' | 'email';

export interface SettingDto {
  key: string;
  value?: string | null;
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON' | 'COLOR' | 'IMAGE';
  group: SettingGroup;
  label: string;
  description?: string | null;
  isPublic: boolean;
}

export interface SiteSettings {
  // General
  'site.name': string;
  'site.tagline': string;
  'site.logo': string;
  'site.favicon': string;
  'site.defaultLocale': string;
  'site.currency': string;
  'site.phone': string;
  'site.email': string;
  'site.address': string;
  // Theme — all colors from admin
  'theme.primaryColor': string;
  'theme.secondaryColor': string;
  'theme.accentColor': string;
  'theme.textColor': string;
  'theme.bgColor': string;
  // SEO
  'seo.defaultTitle': string;
  'seo.titleTemplate': string;
  'seo.defaultDescription': string;
  'seo.ogImage': string;
  'seo.googleAnalyticsId': string;
  // Social
  'social.facebook': string;
  'social.instagram': string;
  'social.tiktok': string;
  'social.whatsapp': string;
  'social.youtube': string;
}

// ---- Media Types ----
export interface MediaDto {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  urlWebp?: string | null;
  urlAvif?: string | null;
  mimeType: string;
  type: MediaType;
  size: number;
  width?: number | null;
  height?: number | null;
  altText?: string | null;
  folder?: string | null;
  createdAt: Date;
}

// ---- Address Types ----
export interface AddressDto {
  id: string;
  type: 'SHIPPING' | 'BILLING' | 'BOTH';
  label: string;
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
  city: string;
  state?: string | null;
  street: string;
  building?: string | null;
  apartment?: string | null;
  postalCode?: string | null;
  isDefault: boolean;
}

// ---- Shipping Types ----
export interface ShippingZoneDto {
  id: string;
  name: string;
  countries: string[];
  cities?: string[];
  isActive: boolean;
  rates: ShippingRateDto[];
}

export interface ShippingRateDto {
  id: string;
  name: string;
  price: number;
  freeShippingThreshold?: number | null;
  estimatedDays?: string | null;
}
