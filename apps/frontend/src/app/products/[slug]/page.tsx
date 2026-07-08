import React from 'react';
import Image from 'next/image';
import CartButton from '../../components/CartButton';
import WishlistButton from '../../components/WishlistButton';

interface ProductTranslation {
  name: string;
  shortDescription?: string | null;
  description?: string | null;
  features?: string | null;
  materials?: string | null;
  careInstructions?: string | null;
}

interface ProductImage {
  id: string;
  url: string;
  isMain: boolean;
}

interface ProductVariant {
  id: string;
  sku: string;
  price?: number | null;
  stockQty: number;
  attributes: Record<string, string>;
}

interface Review {
  id: string;
  rating: number;
  title?: string | null;
  body: string;
  isVerified: boolean;
  createdAt: string;
  user?: {
    profile?: { firstName?: string | null; lastName?: string | null } | null;
    avatar?: string | null;
  } | null;
}

interface ProductDetail {
  id: string;
  sku: string;
  slug: string;
  basePrice: number;
  salePrice?: number | null;
  currency: string;
  stockQty: number;
  translations: ProductTranslation[];
  images: ProductImage[];
  variants: ProductVariant[];
  reviews: Review[];
  category?: { slug: string; translations: Array<{ name: string }> } | null;
  brand?: { translations: Array<{ name: string }> } | null;
}

async function getProductBySlug(slug: string, locale: string): Promise<ProductDetail> {
  try {
    const res = await fetch(`http://localhost:4000/api/v1/products/${slug}?lang=${locale}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    return data.data;
  } catch {
    // Fallback data
    return {
      id: 'p1',
      sku: 'DESK-TEAK-01',
      slug,
      basePrice: 12500,
      salePrice: 10999,
      currency: 'EGP',
      stockQty: 5,
      translations: [
        {
          name: 'مكتب عمل من خشب التيك الطبيعي الماسي',
          shortDescription: 'مكتب عمل فاخر مصنوع يدوياً من أفضل أنواع الأخشاب الطبيعية المعالجة.',
          description: 'يتميز هذا المكتب بتصميم يجمع بين الكلاسيكية والحداثة، مصنوع بالكامل من خشب التيك الطبيعي الذي يضمن العمر الطويل والتحمل الشديد للمهام اليومية. يحتوي على أدراج تخزين عملية ومنظمة لتناسب مساحة العمل الخاصة بك.',
          features: '["مصنوع بالكامل من خشب تيك طبيعي 100%","مقاوم للخدش والرطوبة والحرارة","تصميم متين يدوم لسنوات طويلة","أدراج انسيابية صامتة أثناء الفتح والإغلاق"]',
          materials: 'خشب التيك الطبيعي المعالج، مقابض معدنية مضادة للصدأ.',
          careInstructions: 'يمسح بقطعة قماش ناعمة جافة، تجنب تعريضه المباشر لأشعة الشمس المباشرة لفترات طويلة أو السوائل المركزة.',
        },
      ],
      images: [
        { id: 'img1', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800', isMain: true },
        { id: 'img2', url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=800', isMain: false },
      ],
      variants: [
        { id: 'v1', sku: 'DESK-TEAK-01-BR', price: null, stockQty: 3, attributes: { color: 'بني داكن' } },
        { id: 'v2', sku: 'DESK-TEAK-01-LT', price: 13000, stockQty: 2, attributes: { color: 'بني فاتح' } },
      ],
      reviews: [
        {
          id: 'r1',
          rating: 5,
          title: 'ممتاز وجودة خرافية',
          body: 'المكتب وصلني مع التوصيل المجاني، جودة الخشب ممتازة والتركيب كان سريع جداً ومحترف. أنصح بشدة بالتعامل معهم.',
          isVerified: true,
          createdAt: '2026-06-25T14:30:00.000Z',
          user: { profile: { firstName: 'محمد', lastName: 'ياسر' } },
        },
      ],
      category: { slug: 'office-furniture', translations: [{ name: 'أثاث مكتبي' }] },
    };
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const locale = 'ar';
  const product = await getProductBySlug(params.slug, locale);
  const tInfo = product.translations[0];

  const t = {
    addToCart: 'أضف إلى السلة',
    inStock: 'متوفر في المخزن',
    outOfStock: 'غير متوفر حالياً',
    sku: 'رمز المنتج (SKU)',
    category: 'القسم',
    features: 'الميزات الرئيسية',
    materials: 'المواد والخامات',
    care: 'إرشادات العناية',
    reviews: 'آراء العملاء',
    verified: 'شراء مؤكد',
    currency: 'ج.م',
  };

  const featuresList = tInfo.features ? JSON.parse(tInfo.features) : [];

  return (
    <div className="container product-detail-page" style={{ padding: '40px 24px' }}>
      <div className="product-main-grid flex gap-8" style={{ marginBottom: '64px' }}>
        {/* GALLERY SECTION */}
        <div className="product-gallery" style={{ flex: '1', maxWidth: '600px' }}>
          <div className="main-image-container" style={{ position: 'relative', height: '450px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--gray-200)', marginBottom: '16px' }}>
            <Image
              src={product.images[0]?.url || 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?q=80&w=800'}
              alt={tInfo.name}
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
          <div className="thumbnails flex gap-4">
            {product.images.map((img) => (
              <div key={img.id} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1.5px solid var(--gray-200)', cursor: 'pointer' }}>
                <Image src={img.url} alt="thumbnail" fill style={{ objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>

        {/* DETAILS SECTION */}
        <div className="product-details" style={{ flex: '1' }}>
          <span className="text-muted" style={{ fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
            {t.sku}: {product.sku}
          </span>
          <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '16px', color: 'var(--text-color)' }}>{tInfo.name}</h1>
          
          <div className="price-block" style={{ marginBottom: '24px' }}>
            {product.salePrice ? (
              <div className="flex items-center gap-4">
                <span className="price-old" style={{ fontSize: '18px', textDecoration: 'line-through', color: 'var(--gray-400)' }}>{product.basePrice} {t.currency}</span>
                <span className="price-current" style={{ fontSize: '28px', fontWeight: '800', color: 'var(--primary-color)' }}>{product.salePrice} {t.currency}</span>
              </div>
            ) : (
              <span className="price-current" style={{ fontSize: '28px', fontWeight: '800', color: 'var(--primary-color)' }}>{product.basePrice} {t.currency}</span>
            )}
          </div>

          <p className="product-short-desc text-muted" style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '32px' }}>{tInfo.shortDescription}</p>

          {/* STOCK STATUS */}
          <div className="stock-status" style={{ marginBottom: '32px' }}>
            <span className={`badge ${product.stockQty > 0 ? 'badge-success' : 'badge-danger'}`} style={{ padding: '6px 14px', fontSize: '14px' }}>
              {product.stockQty > 0 ? `${t.inStock} (${product.stockQty})` : t.outOfStock}
            </span>
          </div>

          {/* ACTION BUTTONS (ADD TO CART & WISHLIST) */}
          <div className="flex items-center gap-4" style={{ marginBottom: '40px' }}>
            <CartButton
              product={{
                productId: product.id,
                slug: product.slug,
                name: tInfo.name,
                sku: product.sku,
                price: product.salePrice || product.basePrice,
                imageUrl: product.images[0]?.url || 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?q=80&w=300',
              }}
              label={t.addToCart}
              className="btn btn-primary"
            />
            <WishlistButton
              product={{
                productId: product.id,
                slug: product.slug,
                name: tInfo.name,
                sku: product.sku,
                price: product.salePrice || product.basePrice,
                imageUrl: product.images[0]?.url || 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?q=80&w=300',
              }}
              className="btn btn-secondary"
              style={{ height: '48px', width: '48px', padding: 0, fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            />
          </div>

          {/* INFO TABS */}
          <div className="product-tabs" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '24px', borderTop: '1.5px solid var(--gray-100)' }}>
            {product.category && (
              <p style={{ fontSize: '15px' }}>
                <strong>{t.category}:</strong> <a href={`/products?category=${product.category.slug}`} style={{ color: 'var(--primary-color)' }}>{product.category.translations[0]?.name}</a>
              </p>
            )}
            {tInfo.materials && (
              <div>
                <strong style={{ display: 'block', marginBottom: '4px' }}>{t.materials}</strong>
                <p className="text-muted" style={{ fontSize: '14px', lineHeight: '1.5' }}>{tInfo.materials}</p>
              </div>
            )}
            {tInfo.careInstructions && (
              <div>
                <strong style={{ display: 'block', marginBottom: '4px' }}>{t.care}</strong>
                <p className="text-muted" style={{ fontSize: '14px', lineHeight: '1.5' }}>{tInfo.careInstructions}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DESCRIPTION BLOCK */}
      <section className="product-description-section" style={{ marginBottom: '64px', padding: '40px 0', borderTop: '1.5px solid var(--gray-100)' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>تفاصيل المنتج</h2>
        <p className="text-muted" style={{ fontSize: '16px', lineHeight: '1.8', maxWidth: '800px', marginBottom: '32px' }}>{tInfo.description}</p>
        
        {featuresList.length > 0 && (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>{t.features}</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {featuresList.map((f: string, idx: number) => (
                <li key={idx} style={{ fontSize: '14px', color: 'var(--gray-800)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--primary-color)' }}>✔</span> {f}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* REVIEWS SECTION */}
      <section className="product-reviews-section" style={{ padding: '40px 0', borderTop: '1.5px solid var(--gray-100)' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '32px' }}>{t.reviews} ({product.reviews.length})</h2>
        {product.reviews.length === 0 ? (
          <p className="text-muted">لا توجد تقييمات بعد لهذا المنتج.</p>
        ) : (
          <div className="reviews-list flex flex-col gap-4">
            {product.reviews.map((rev) => (
              <div key={rev.id} className="review-item card" style={{ padding: '24px' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: '12px' }}>
                  <div className="flex items-center gap-4">
                    <span style={{ fontWeight: '700', fontSize: '16px' }}>
                      {rev.user?.profile?.firstName} {rev.user?.profile?.lastName}
                    </span>
                    {rev.isVerified && <span className="badge badge-success" style={{ fontSize: '11px' }}>{t.verified}</span>}
                  </div>
                  <span style={{ color: 'var(--warning)', fontWeight: 'bold' }}>{'★'.repeat(rev.rating)}</span>
                </div>
                {rev.title && <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>{rev.title}</h3>}
                <p className="text-muted" style={{ fontSize: '14px', lineHeight: '1.6' }}>{rev.body}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
