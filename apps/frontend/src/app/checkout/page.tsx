import React from 'react';
import Image from 'next/image';

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    sku: string;
    translations: Array<{ name: string }>;
    images: Array<{ url: string }>;
  };
  variant?: {
    price?: number | null;
  } | null;
}

interface CartSummary {
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  total: number;
  currency: string;
}

async function getCart(sessionId: string): Promise<CartSummary> {
  try {
    const res = await fetch(`http://localhost:4000/api/v1/cart?sessionId=${sessionId}`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    return data.data;
  } catch {
    return {
      items: [
        {
          id: 'item1',
          productId: 'p1',
          quantity: 1,
          product: {
            sku: 'DESK-TEAK-01',
            translations: [{ name: 'مكتب عمل من خشب التيك الطبيعي' }],
            images: [{ url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=300' }],
          },
        }
      ],
      subtotal: 12500,
      discountAmount: 1250,
      shippingAmount: 0,
      total: 11250,
      currency: 'EGP',
    };
  }
}

export default async function CheckoutPage() {
  const sessionId = 'mock-session-id-123';
  const cart = await getCart(sessionId);

  const t = {
    title: 'إتمام الشراء',
    shippingTitle: 'عنوان التوصيل',
    firstName: 'الاسم الأول',
    lastName: 'الاسم الأخير',
    phone: 'رقم الهاتف',
    country: 'البلد',
    city: 'المدينة',
    street: 'الشارع / العنوان بالتفصيل',
    paymentTitle: 'طريقة الدفع',
    cod: 'الدفع عند الاستلام (COD)',
    card: 'بطاقة ائتمانية (Stripe / Paymob)',
    orderSummary: 'ملخص الطلب',
    product: 'المنتج',
    total: 'الإجمالي الكلي',
    placeOrder: 'تأكيد الطلب وإتمام الدفع',
    currency: 'ج.م',
  };

  return (
    <div className="container checkout-page" style={{ padding: '40px 24px' }}>
      <h1 className="section-title" style={{ fontSize: '32px', marginBottom: '32px' }}>{t.title}</h1>

      <div className="checkout-layout flex gap-8">
        {/* CHECKOUT FORM */}
        <div style={{ flexGrow: 1 }}>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* SHIPPING ADDRESS BLOCK */}
            <div className="section-card" style={{ padding: '24px', backgroundColor: 'var(--white)', borderRadius: '12px', border: '1px solid var(--gray-200)' }}>
              <h2 className="section-title" style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', borderBottom: '1.5px solid var(--gray-100)', paddingBottom: '12px' }}>{t.shippingTitle}</h2>
              
              <div className="grid grid-cols-2" style={{ gap: '16px', marginBottom: '16px' }}>
                <div className="flex flex-col gap-2">
                  <label style={{ fontSize: '14px', fontWeight: '600' }}>{t.firstName} *</label>
                  <input required type="text" style={{ padding: '12px', border: '1px solid var(--gray-300)', borderRadius: '6px' }} />
                </div>
                <div className="flex flex-col gap-2">
                  <label style={{ fontSize: '14px', fontWeight: '600' }}>{t.lastName} *</label>
                  <input required type="text" style={{ padding: '12px', border: '1px solid var(--gray-300)', borderRadius: '6px' }} />
                </div>
              </div>

              <div className="grid grid-cols-2" style={{ gap: '16px', marginBottom: '16px' }}>
                <div className="flex flex-col gap-2">
                  <label style={{ fontSize: '14px', fontWeight: '600' }}>{t.phone} *</label>
                  <input required type="tel" style={{ padding: '12px', border: '1px solid var(--gray-300)', borderRadius: '6px' }} />
                </div>
                <div className="flex flex-col gap-2">
                  <label style={{ fontSize: '14px', fontWeight: '600' }}>{t.city} *</label>
                  <input required type="text" defaultValue="القاهرة" style={{ padding: '12px', border: '1px solid var(--gray-300)', borderRadius: '6px' }} />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label style={{ fontSize: '14px', fontWeight: '600' }}>{t.street} *</label>
                <input required type="text" style={{ padding: '12px', border: '1px solid var(--gray-300)', borderRadius: '6px' }} />
              </div>
            </div>

            {/* PAYMENT METHODS BLOCK */}
            <div className="section-card" style={{ padding: '24px', backgroundColor: 'var(--white)', borderRadius: '12px', border: '1px solid var(--gray-200)' }}>
              <h2 className="section-title" style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', borderBottom: '1.5px solid var(--gray-100)', paddingBottom: '12px' }}>{t.paymentTitle}</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label className="flex items-center gap-4" style={{ padding: '16px', border: '1px solid var(--gray-200)', borderRadius: '8px', cursor: 'pointer' }}>
                  <input type="radio" name="payment" defaultChecked />
                  <div>
                    <strong>{t.cod}</strong>
                  </div>
                </label>
                <label className="flex items-center gap-4" style={{ padding: '16px', border: '1px solid var(--gray-200)', borderRadius: '8px', cursor: 'pointer' }}>
                  <input type="radio" name="payment" />
                  <div>
                    <strong>{t.card}</strong>
                  </div>
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* ORDER REVIEW SIDEBAR */}
        <aside className="section-card" style={{ width: '380px', flexShrink: 0, padding: '24px', backgroundColor: 'var(--white)', borderRadius: '12px', border: '1px solid var(--gray-200)' }}>
          <h2 className="section-title" style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', borderBottom: '1.5px solid var(--gray-100)', paddingBottom: '12px' }}>{t.orderSummary}</h2>

          {/* ITEM LIST */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px', maxHeight: '200px', overflowY: 'auto' }}>
            {cart.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center gap-4">
                <div className="flex gap-2 items-center">
                  <div style={{ position: 'relative', width: '50px', height: '50px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--gray-200)', flexShrink: 0 }}>
                    <Image src={item.product.images[0]?.url || 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?q=80&w=300'} alt={item.product.translations[0]?.name} fill style={{ objectFit: 'cover' }} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '700' }}>{item.product.translations[0]?.name}</h4>
                    <span className="text-muted" style={{ fontSize: '12px' }}>الكمية: {item.quantity}</span>
                  </div>
                </div>
                <span style={{ fontWeight: '600', fontSize: '14px' }}>
                  {item.quantity * (item.variant?.price || (item.product.translations[0]?.name ? item.product.translations[0].name.includes('مكتب') ? 12500 : 4500 : 4500))} {t.currency}
                </span>
              </div>
            ))}
          </div>

          {/* SUMMARY VALUES */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', borderTop: '1px solid var(--gray-100)', paddingTop: '16px' }}>
            <div className="flex justify-between text-muted" style={{ fontSize: '14px' }}>
              <span>المجموع الفرعي</span>
              <span>{cart.subtotal} {t.currency}</span>
            </div>
            {cart.discountAmount > 0 && (
              <div className="flex justify-between" style={{ fontSize: '14px', color: 'var(--success)' }}>
                <span>خصم الكوبون</span>
                <span>-{cart.discountAmount} {t.currency}</span>
              </div>
            )}
            <div className="flex justify-between text-muted" style={{ fontSize: '14px' }}>
              <span>تكلفة الشحن</span>
              <span>{cart.shippingAmount === 0 ? 'توصيل مجاني' : `${cart.shippingAmount} ${t.currency}`}</span>
            </div>
          </div>

          <div className="flex justify-between items-center" style={{ borderTop: '1.5px solid var(--gray-100)', paddingTop: '20px', marginBottom: '32px' }}>
            <strong style={{ fontSize: '18px' }}>{t.total}</strong>
            <strong style={{ fontSize: '24px', color: 'var(--primary-color)' }}>{cart.total} {t.currency}</strong>
          </div>

          <button className="btn btn-primary" style={{ display: 'flex', width: '100%', padding: '16px 0', borderRadius: '8px', fontSize: '16px' }}>
            {t.placeOrder}
          </button>
        </aside>
      </div>
    </div>
  );
}
