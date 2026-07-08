'use client';

import React from 'react';
import Image from 'next/image';
import { useWishlist } from '../context/WishlistContext';
import CartButton from '../components/CartButton';

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();

  const t = {
    title: 'قائمة الأمنيات',
    product: 'المنتج',
    price: 'السعر',
    emptyWishlist: 'قائمة الأمنيات فارغة حالياً.',
    continueShopping: 'اكتشف المجموعة',
    currency: 'ج.م',
    addToCart: 'أضف إلى السلة',
  };

  return (
    <div className="container wishlist-page" style={{ padding: '40px 24px', direction: 'rtl' }}>
      <h1 className="section-title" style={{ fontSize: '32px', marginBottom: '32px' }}>{t.title}</h1>

      {items.length === 0 ? (
        <div className="text-center" style={{ padding: '64px 0' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❤️</div>
          <p className="text-muted" style={{ marginBottom: '24px' }}>{t.emptyWishlist}</p>
          <a href="/products" className="btn btn-primary">{t.continueShopping}</a>
        </div>
      ) : (
        <div className="grid grid-cols-3" style={{ gap: '24px' }}>
          {items.map((item) => {
            const image = item.imageUrl || 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?q=80&w=300';
            return (
              <div key={item.productId} className="product-card card" style={{ padding: '16px', border: '1px solid var(--gray-200)', borderRadius: '12px' }}>
                <a href={`/products/${item.slug}`} style={{ position: 'relative', display: 'block', height: '200px', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
                  <Image src={image} alt={item.name} fill style={{ objectFit: 'cover' }} />
                </a>
                <div className="product-info">
                  <span className="product-sku" style={{ fontSize: '12px', color: '#9ca3af' }}>{item.sku}</span>
                  <a href={`/products/${item.slug}`} className="product-title-link">
                    <h3 className="product-name" style={{ fontSize: '16px', fontWeight: '700', margin: '8px 0' }}>{item.name}</h3>
                  </a>
                  <div className="flex justify-between items-center" style={{ marginTop: '16px' }}>
                    <span className="price-current" style={{ fontWeight: '700', color: 'var(--primary-color)' }}>{item.price} {t.currency}</span>
                    <button
                      onClick={() => removeItem(item.productId)}
                      style={{ color: '#ef4444', fontSize: '12px', border: 'none', background: 'none', cursor: 'pointer' }}
                    >
                      إزالة
                    </button>
                  </div>
                  <div style={{ marginTop: '16px' }}>
                    <CartButton
                      product={{
                        productId: item.productId,
                        slug: item.slug,
                        name: item.name,
                        sku: item.sku,
                        price: item.price,
                        imageUrl: item.imageUrl,
                      }}
                      label={t.addToCart}
                      className="btn btn-primary"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
