import React from 'react';
import Image from 'next/image';

interface Category {
  id: string;
  slug: string;
  imageUrl?: string | null;
  iconUrl?: string | null;
  translations: Array<{ name: string; description?: string | null }>;
}

interface Product {
  id: string;
  sku: string;
  slug: string;
  basePrice: number;
  salePrice?: number | null;
  translations: Array<{ name: string; shortDescription?: string | null; description?: string | null }>;
  images?: Array<{ url: string; isMain?: boolean }> | null;
}

// Server-side fetching for categories
async function getCategories(locale: string): Promise<Category[]> {
  try {
    const res = await fetch(`http://localhost:4000/api/v1/categories?lang=${locale}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    return data.data || [];
  } catch {
    return [
      { id: '1', slug: 'office-furniture', translations: [{ name: 'أثاث مكتبي' }], iconUrl: null, imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=600&auto=format&fit=crop' },
      { id: '2', slug: 'living-room', translations: [{ name: 'غرفة المعيشة' }], iconUrl: null, imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600&auto=format&fit=crop' },
      { id: '3', slug: 'bedroom', translations: [{ name: 'غرفة النوم' }], iconUrl: null, imageUrl: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=600&auto=format&fit=crop' },
    ];
  }
}

// Server-side fetching for featured products
async function getFeaturedProducts(locale: string): Promise<Product[]> {
  try {
    const res = await fetch(`http://localhost:4000/api/v1/products?isFeatured=true&lang=${locale}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    return data.data || [];
  } catch {
    return [
      {
        id: 'p1',
        sku: 'DESK-TEAK-01',
        slug: 'handcrafted-teak-office-desk',
        basePrice: 12500,
        salePrice: 10999,
        translations: [{ name: 'مكتب عمل من خشب التيك الطبيعي', shortDescription: 'مكتب عمل فاخر مصنوع يدوياً من أفضل أنواع الأخشاب الطبيعية.' }],
        images: [{ url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&auto=format&fit=crop', isMain: true }],
      },
      {
        id: 'p2',
        sku: 'SOFA-GRAY-02',
        slug: 'scandinavian-minimalist-sofa',
        basePrice: 18000,
        salePrice: null,
        translations: [{ name: 'أريكة اسكندنافية مريحة', shortDescription: 'تصميم مينيماليست أنيق يضفي الفخامة على غرفة المعيشة.' }],
        images: [{ url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=600&auto=format&fit=crop', isMain: true }],
      },
      {
        id: 'p3',
        sku: 'CHAIR-OAK-03',
        slug: 'ergonomic-executive-office-chair',
        basePrice: 4500,
        salePrice: 3999,
        translations: [{ name: 'كرسي مكتب طبي مريح', shortDescription: 'كرسي مريح مصمم لدعم الظهر وتوفير أقصى درجات الراحة أثناء العمل.' }],
        images: [{ url: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?q=80&w=600&auto=format&fit=crop', isMain: true }],
      }
    ];
  }
}

export default async function Home() {
  const locale = 'ar';
  const categories = await getCategories(locale);
  const products = await getFeaturedProducts(locale);

  const t = {
    featuredTitle: 'أبرز المنتجات الفاخرة',
    featuredSub: 'اخترنا لك أفضل القطع المصنوعة يدوياً بعناية فائقة لتناسب ذوقك الرفيع',
    categoriesTitle: 'تسوق حسب الأقسام',
    categoriesSub: 'استكشف مجموعتنا المتنوعة من الأثاث المنزلي والمكتبي المميز',
    guaranteesTitle: 'لماذا تختار نوفا وود؟',
    guarantee1Title: 'خشب طبيعي 100%',
    guarantee1Desc: 'نستخدم أفضل أنواع الأخشاب الطبيعية المستدامة (التيك، الزان، والأرو).',
    guarantee2Title: 'صناعة يدوية فاخرة',
    guarantee2Desc: 'قطع فريدة مصممة ومنفذة بأيدي أمهر الحرفيين في مصر.',
    guarantee3Title: 'توصيل وتركيب مجاني',
    guarantee3Desc: 'شحن مجاني وسريع لكافة الطلبات التي تتجاوز قيمتها 500 جنيه مصري.',
    guarantee4Title: 'ضمان لمدة 5 سنوات',
    guarantee4Desc: 'نضمن جودة منتجاتنا ومتانتها لسنوات طويلة من الاستخدام.',
    addToCart: 'أضف إلى السلة',
    currency: 'ج.م',
  };

  return (
    <div className="homepage">
      {/* HERO SLIDER SECTION (STUNNING IMMERSIVE IMAGE) */}
      <section className="hero-banner">
        <div className="hero-overlay"></div>
        <Image
          src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1920&auto=format&fit=crop"
          alt="Premium Furniture Design"
          fill
          priority
          style={{ objectFit: 'cover' }}
          sizes="100vw"
        />
        <div className="container hero-content">
          <h1 className="hero-title animate-fade-in">ابتكر مساحتك الخاصة</h1>
          <p className="hero-subtitle">أثاث خشبي راقٍ مصنوع يدوياً ليجمع بين الفخامة والراحة</p>
          <div className="hero-ctas">
            <a href="/products" className="btn btn-primary animate-hover">اكتشف المجموعة</a>
            <a href="/about" className="btn btn-secondary animate-hover">قصتنا</a>
          </div>
        </div>
      </section>

      {/* BRAND GUARANTEES SECTION */}
      <section className="guarantees-section">
        <div className="container">
          <h2 className="section-title text-center">{t.guaranteesTitle}</h2>
          <div className="grid grid-cols-4">
            <div className="guarantee-card text-center">
              <div className="guarantee-icon">🪵</div>
              <h3>{t.guarantee1Title}</h3>
              <p>{t.guarantee1Desc}</p>
            </div>
            <div className="guarantee-card text-center">
              <div className="guarantee-icon">🪚</div>
              <h3>{t.guarantee2Title}</h3>
              <p>{t.guarantee2Desc}</p>
            </div>
            <div className="guarantee-card text-center">
              <div className="guarantee-icon">🚚</div>
              <h3>{t.guarantee3Title}</h3>
              <p>{t.guarantee3Desc}</p>
            </div>
            <div className="guarantee-card text-center">
              <div className="guarantee-icon">🛡️</div>
              <h3>{t.guarantee4Title}</h3>
              <p>{t.guarantee4Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES GRID SECTION */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">{t.categoriesTitle}</h2>
            <p className="section-subtitle">{t.categoriesSub}</p>
          </div>

          <div className="grid grid-cols-3">
            {categories.map((cat: Category) => (
              <a href={`/categories/${cat.slug}`} key={cat.id} className="category-card card">
                <div className="category-image">
                  <Image
                    src={cat.imageUrl || 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=600'}
                    alt={cat.translations[0]?.name || cat.slug}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{ objectFit: 'cover' }}
                    loading="lazy"
                  />
                </div>
                <div className="category-info">
                  <h3>{cat.translations[0]?.name || cat.slug}</h3>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS SECTION */}
      <section className="products-section">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">{t.featuredTitle}</h2>
            <p className="section-subtitle">{t.featuredSub}</p>
          </div>

          <div className="grid grid-cols-3">
            {products.map((product: Product) => {
              const image = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?q=80&w=600';
              return (
                <div key={product.id} className="product-card card">
                  <a href={`/products/${product.slug}`} className="product-image-container">
                    <Image
                      src={image}
                      alt={product.translations[0]?.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      style={{ objectFit: 'cover' }}
                      loading="lazy"
                    />
                    {product.salePrice && <span className="badge-sale">Sale</span>}
                  </a>
                  <div className="product-info">
                    <span className="product-sku">{product.sku}</span>
                    <a href={`/products/${product.slug}`} className="product-title-link">
                      <h3 className="product-name">{product.translations[0]?.name}</h3>
                    </a>
                    <p className="product-desc text-muted">{product.translations[0]?.shortDescription}</p>
                    
                    <div className="product-footer flex items-center justify-between">
                      <div className="product-price-block">
                        {product.salePrice ? (
                          <>
                            <span className="price-old">{product.basePrice} {t.currency}</span>
                            <span className="price-current">{product.salePrice} {t.currency}</span>
                          </>
                        ) : (
                          <span className="price-current">{product.basePrice} {t.currency}</span>
                        )}
                      </div>
                      <button className="btn btn-primary btn-sm">{t.addToCart}</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
