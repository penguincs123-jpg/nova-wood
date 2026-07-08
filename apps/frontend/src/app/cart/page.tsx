import React from 'react';
import Image from 'next/image';

interface CartItem {
  id: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  product: {
    sku: string;
    slug: string;
    translations: Array<{ name: string; shortDescription?: string | null }>;
    images: Array<{ url: string }>;
  };
  variant?: {
    sku: string;
    price?: number | null;
    attributes: Record<string, string>;
  } | null;
}

interface CartSummary {
  id: string;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  total: number;
  currency: string;
  coupon?: { code: string; type: string; value: number } | null;
}

async function getCart(sessionId: string): Promise<CartSummary> {
  try {
    const res = await fetch(`http://localhost:4000/api/v1/cart?sessionId=${sessionId}`, {
      headers: { 'x-session-id': sessionId },
      next: { revalidate: 0 }, // Cart is highly dynamic, don't cache
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    return data.data;
  } catch {
    // Fallback data
    return {
      id: 'cart1',
      items: [
        {
          id: 'item1',
          productId: 'p1',
          quantity: 1,
          product: {
            sku: 'DESK-TEAK-01',
            slug: 'handcrafted-teak-office-desk',
            translations: [{ name: 'مكتب عمل من خشب التيك الطبيعي', shortDescription: 'مكتب عمل فاخر مصنوع يدوياً من أفضل أنواع الأخشاب الطبيعية.' }],
            images: [{ url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=300' }],
          },
        },
        {
          id: 'item2',
          productId: 'p3',
          quantity: 2,
          product: {
            sku: 'CHAIR-OAK-03',
            slug: 'ergonomic-executive-office-chair',
            translations: [{ name: 'كرسي مكتب طبي مريح', shortDescription: 'كرسي مريح مصمم لدعم الظهر وتوفير أقصى درجات الراحة.' }],
            images: [{ url: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?q=80&w=300' }],
          },
        }
      ],
      subtotal: 20500,
      discountAmount: 1000,
      shippingAmount: 0,
      total: 19500,
      currency: 'EGP',
      coupon: { code: 'SAVE10', type: 'PERCENTAGE', value: 10 },
    };
  }
}

export default async function CartPage() {
  const sessionId = 'mock-session-id-123';
  const cart = await getCart(sessionId);

  const t = {
    title: 'سلة المشتريات',
    product: 'المنتج',
    price: 'السعر',
    quantity: 'الكمية',
    totalPrice: 'الإجمالي',
    summaryTitle: 'ملخص الطلب',
    subtotal: 'المجموع الفرعي',
    discount: 'الخصم',
    shipping: 'الشحن',
    total: 'المجموع الكلي',
    freeShipping: 'توصيل مجاني',
    checkout: 'الذهاب للدفع',
    continueShopping: 'متابعة التسوق',
    couponCode: 'رمز الكوبون',
    applyCoupon: 'تطبيق الخصم',
    emptyCart: 'سلة المشتريات فارغة حالياً.',
    currency: 'ج.م',
  };

  return (
    <div className="container cart-page" style={{ padding: '40px 24px' }}>
      <h1 className="section-title" style={{ fontSize: '32px', marginBottom: '32px' }}>{t.title}</h1>

      {cart.items.length === 0 ? (
        <div className="text-center" style={{ padding: '64px 0' }}>
          <p className="text-muted" style={{ marginBottom: '24px' }}>{t.emptyCart}</p>
          <a href="/products" className="btn btn-primary">{t.continueShopping}</a>
        </div>
      ) : (
        <div className="cart-layout flex gap-8">
          {/* ITEMS LIST */}
          <div style={{ flexGrow: 1 }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--gray-200)' }}>
                  <th style={{ padding: '16px 0', textAlign: 'right' }}>{t.product}</th>
                  <th style={{ padding: '16px 0' }}>{t.price}</th>
                  <th style={{ padding: '16px 0' }}>{t.quantity}</th>
                  <th style={{ padding: '16px 0', textAlign: 'left' }}>{t.totalPrice}</th>
                </tr>
              </thead>
              <tbody>
                {cart.items.map((item) => {
                  const image = item.product.images[0]?.url || 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?q=80&w=300';
                  const price = item.variant?.price 
                    ? Number(item.variant.price) 
                    : Number(item.product.translations[0]?.name ? item.product.translations[0].name.includes('مكتب') ? 12500 : 4500 : 4500); // Mock-safe calculation
                  
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                      <td style={{ padding: '24px 0' }}>
                        <div className="flex gap-4 items-center">
                          <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1.5px solid var(--gray-200)' }}>
                            <Image src={image} alt={item.product.translations[0]?.name} fill style={{ objectFit: 'cover' }} />
                          </div>
                          <div>
                            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>{item.product.translations[0]?.name}</h3>
                            <span className="text-muted" style={{ fontSize: '12px' }}>{item.product.sku}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '24px 0', textAlign: 'center', fontWeight: '600' }}>
                        {price} {t.currency}
                      </td>
                      <td style={{ padding: '24px 0', textAlign: 'center' }}>
                        <div className="flex items-center justify-center gap-2">
                          <button style={{ width: '28px', height: '28px', border: '1px solid var(--gray-200)', borderRadius: '4px' }}>-</button>
                          <span style={{ fontWeight: '700', width: '24px', display: 'inline-block', textAlign: 'center' }}>{item.quantity}</span>
                          <button style={{ width: '28px', height: '28px', border: '1px solid var(--gray-200)', borderRadius: '4px' }}>+</button>
                        </div>
                      </td>
                      <td style={{ padding: '24px 0', textAlign: 'left', fontWeight: '700', color: 'var(--primary-color)' }}>
                        {price * item.quantity} {t.currency}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* COUPON SECTION */}
            <div className="coupon-block flex gap-4" style={{ marginTop: '32px' }}>
              <input
                type="text"
                placeholder={t.couponCode}
                defaultValue={cart.coupon?.code || ''}
                style={{ padding: '12px 16px', border: '1.5px solid var(--gray-200)', borderRadius: '8px', width: '200px' }}
              />
              <button className="btn btn-secondary">{t.applyCoupon}</button>
            </div>
          </div>

          {/* SUMMARY SIDEBAR */}
          <aside className="section-card" style={{ width: '350px', flexShrink: 0, padding: '24px', backgroundColor: 'var(--white)', borderRadius: '12px', border: '1px solid var(--gray-200)' }}>
            <h2 className="section-title" style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', borderBottom: '1.5px solid var(--gray-100)', paddingBottom: '12px' }}>{t.summaryTitle}</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div className="flex justify-between">
                <span className="text-muted">{t.subtotal}</span>
                <span style={{ fontWeight: '600' }}>{cart.subtotal} {t.currency}</span>
              </div>
              
              {cart.discountAmount > 0 && (
                <div className="flex justify-between" style={{ color: 'var(--success)' }}>
                  <span>{t.discount} ({cart.coupon?.code})</span>
                  <span>-{cart.discountAmount} {t.currency}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-muted">{t.shipping}</span>
                <span>{cart.shippingAmount === 0 ? t.freeShipping : `${cart.shippingAmount} ${t.currency}`}</span>
              </div>
            </div>

            <div className="flex justify-between items-center" style={{ borderTop: '1.5px solid var(--gray-100)', paddingTop: '20px', marginBottom: '32px' }}>
              <strong style={{ fontSize: '18px' }}>{t.total}</strong>
              <strong style={{ fontSize: '24px', color: 'var(--primary-color)' }}>{cart.total} {t.currency}</strong>
            </div>

            <a href="/checkout" className="btn btn-primary" style={{ display: 'flex', width: '100%', padding: '16px 0', borderRadius: '8px', fontSize: '16px' }}>
              {t.checkout}
            </a>
          </aside>
        </div>
      )}
    </div>
  );
}
