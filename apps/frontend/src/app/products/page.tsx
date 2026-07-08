import React from 'react';
import Image from 'next/image';

interface Product {
  id: string;
  sku: string;
  slug: string;
  basePrice: number;
  salePrice?: number | null;
  translations: Array<{ name: string; shortDescription?: string | null; description?: string | null }>;
  images?: Array<{ url: string; isMain?: boolean }> | null;
}

interface Category {
  id: string;
  slug: string;
  translations: Array<{ name: string }>;
}

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
      { id: '1', slug: 'office-furniture', translations: [{ name: 'أثاث مكتبي' }] },
      { id: '2', slug: 'living-room', translations: [{ name: 'غرفة المعيشة' }] },
      { id: '3', slug: 'bedroom', translations: [{ name: 'غرفة النوم' }] },
    ];
  }
}

async function getProducts(locale: string, searchParams: { categorySlug?: string; sortBy?: string }): Promise<Product[]> {
  const { categorySlug, sortBy } = searchParams;
  let url = `http://localhost:4000/api/v1/products?lang=${locale}`;
  if (categorySlug) url += `&categorySlug=${categorySlug}`;
  if (sortBy) url += `&sortBy=${sortBy}`;

  try {
    const res = await fetch(url, { next: { revalidate: 30 } });
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

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; sort?: string };
}) {
  const locale = 'ar';
  const categories = await getCategories(locale);
  const products = await getProducts(locale, {
    categorySlug: searchParams.category,
    sortBy: searchParams.sort,
  });

  const t = {
    title: 'تصفح تشكيلة منتجاتنا',
    subtitle: 'حلول ذكية وقطع أثاث خشبية راقية تلبي احتياجاتك لمنزل ومكتب أكثر فخامة',
    filterCategory: 'التصنيفات',
    allCategories: 'جميع المنتجات',
    sortBy: 'ترتيب حسب',
    newest: 'الأحدث',
    priceAsc: 'السعر: من الأقل للأعلى',
    priceDesc: 'السعر: من الأعلى للأقل',
    popular: 'الأكثر مبيعاً',
    noProducts: 'عذراً، لم نجد أي منتجات تطابق اختيارك.',
    addToCart: 'أضف إلى السلة',
    currency: 'ج.م',
  };

  const categoryParam = searchParams.category ? `category=${searchParams.category}` : '';
  const getSortLink = (sortVal: string) => {
    const parts = [];
    if (categoryParam) parts.push(categoryParam);
    if (sortVal) parts.push(`sort=${sortVal}`);
    return `/products${parts.length > 0 ? `?${parts.join('&')}` : ''}`;
  };

  return (
    <div className="container products-page" style={{ padding: '40px 24px' }}>
      <div className="section-header text-center" style={{ marginBottom: '48px' }}>
        <h1 className="section-title" style={{ fontSize: '32px', marginBottom: '8px' }}>{t.title}</h1>
        <p className="text-muted">{t.subtitle}</p>
      </div>

      <div className="products-layout flex gap-8">
        {/* FILTERS SIDEBAR */}
        <aside className="filters-sidebar" style={{ width: '250px', flexShrink: 0 }}>
          <div className="filter-group" style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>{t.filterCategory}</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li>
                <a
                  href="/products"
                  className={!searchParams.category ? 'active-filter' : ''}
                  style={{ fontWeight: !searchParams.category ? '700' : 'normal' }}
                >
                  ✨ {t.allCategories}
                </a>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <a
                    href={`/products?category=${cat.slug}`}
                    className={searchParams.category === cat.slug ? 'active-filter' : ''}
                    style={{ fontWeight: searchParams.category === cat.slug ? '700' : 'normal' }}
                  >
                    🪵 {cat.translations[0]?.name || cat.slug}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* PRODUCTS GRID VIEW */}
        <div style={{ flexGrow: 1 }}>
          {/* SORT BLOCK */}
          <div className="sort-bar flex justify-between items-center" style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1.5px solid var(--gray-100)' }}>
            <span className="text-muted" style={{ fontSize: '14px' }}>
              {products.length} {products.length === 1 ? 'منتج واحد' : 'منتجات'}
            </span>
            <div className="flex items-center gap-4">
              <span style={{ fontSize: '14px', fontWeight: '500' }}>{t.sortBy}:</span>
              <div className="flex gap-2" style={{ fontSize: '14px' }}>
                <a href={getSortLink('newest')} style={{ color: searchParams.sort === 'newest' || !searchParams.sort ? 'var(--primary-color)' : 'inherit', fontWeight: searchParams.sort === 'newest' || !searchParams.sort ? '700' : 'normal' }}>{t.newest}</a>
                <span className="text-muted">|</span>
                <a href={getSortLink('price_asc')} style={{ color: searchParams.sort === 'price_asc' ? 'var(--primary-color)' : 'inherit', fontWeight: searchParams.sort === 'price_asc' ? '700' : 'normal' }}>{t.priceAsc}</a>
                <span className="text-muted">|</span>
                <a href={getSortLink('price_desc')} style={{ color: searchParams.sort === 'price_desc' ? 'var(--primary-color)' : 'inherit', fontWeight: searchParams.sort === 'price_desc' ? '700' : 'normal' }}>{t.priceDesc}</a>
                <span className="text-muted">|</span>
                <a href={getSortLink('popular')} style={{ color: searchParams.sort === 'popular' ? 'var(--primary-color)' : 'inherit', fontWeight: searchParams.sort === 'popular' ? '700' : 'normal' }}>{t.popular}</a>
              </div>
            </div>
          </div>

          {/* GRID OF CARDS */}
          {products.length === 0 ? (
            <p className="text-center text-muted" style={{ padding: '64px 0' }}>{t.noProducts}</p>
          ) : (
            <div className="grid grid-cols-3">
              {products.map((product) => {
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
          )}
        </div>
      </div>
      
    </div>
  );
}
