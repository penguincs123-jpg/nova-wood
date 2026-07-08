'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    city: 'القاهرة',
    street: '',
    paymentMethod: 'COD',
  });

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

  const shippingAmount = subtotal > 500 || subtotal === 0 ? 0 : 50;
  const total = subtotal + shippingAmount;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    // Simulate placing order API request
    setTimeout(() => {
      const generatedOrderNum = `NW-${Date.now().toString().slice(-8)}`;
      setOrderNumber(generatedOrderNum);
      setSuccess(true);
      clearCart();
      setLoading(false);
    }, 1500);
  };

  if (success) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center', direction: 'rtl' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '40px', border: '1px solid var(--gray-200)', borderRadius: '12px', backgroundColor: 'var(--white)' }}>
          <div style={{ fontSize: '5rem', marginBottom: '24px' }}>🎉</div>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px', color: 'var(--primary-color)' }}>تم تسجيل طلبك بنجاح!</h2>
          <p style={{ fontSize: '16px', color: '#4b5563', marginBottom: '24px', lineHeight: '1.8' }}>
            شكراً لتسوقك من نوفا وود. رقم طلبك هو <strong>{orderNumber}</strong>. سنتواصل معك هاتفياً قريباً لتأكيد موعد التوصيل.
          </p>
          <button className="btn btn-primary" onClick={() => router.push('/')} style={{ width: '100%', padding: '12px 0' }}>
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container checkout-page" style={{ padding: '40px 24px', direction: 'rtl' }}>
      <h1 className="section-title" style={{ fontSize: '32px', marginBottom: '32px' }}>{t.title}</h1>

      {items.length === 0 ? (
        <div className="text-center" style={{ padding: '64px 0' }}>
          <p className="text-muted" style={{ marginBottom: '24px' }}>لا توجد منتجات لإتمام الشراء.</p>
          <button className="btn btn-primary" onClick={() => router.push('/products')}>اكتشف المنتجات</button>
        </div>
      ) : (
        <form onSubmit={handlePlaceOrder} className="checkout-layout flex gap-8">
          {/* CHECKOUT FORM */}
          <div style={{ flexGrow: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* SHIPPING ADDRESS BLOCK */}
              <div className="section-card" style={{ padding: '24px', backgroundColor: 'var(--white)', borderRadius: '12px', border: '1px solid var(--gray-200)' }}>
                <h2 className="section-title" style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', borderBottom: '1.5px solid var(--gray-100)', paddingBottom: '12px' }}>{t.shippingTitle}</h2>
                
                <div className="grid grid-cols-2" style={{ gap: '16px', marginBottom: '16px' }}>
                  <div className="flex flex-col gap-2">
                    <label style={{ fontSize: '14px', fontWeight: '600' }}>{t.firstName} *</label>
                    <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} style={{ padding: '12px', border: '1px solid var(--gray-300)', borderRadius: '6px' }} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label style={{ fontSize: '14px', fontWeight: '600' }}>{t.lastName} *</label>
                    <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} style={{ padding: '12px', border: '1px solid var(--gray-300)', borderRadius: '6px' }} />
                  </div>
                </div>

                <div className="grid grid-cols-2" style={{ gap: '16px', marginBottom: '16px' }}>
                  <div className="flex flex-col gap-2">
                    <label style={{ fontSize: '14px', fontWeight: '600' }}>{t.phone} *</label>
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} style={{ padding: '12px', border: '1px solid var(--gray-300)', borderRadius: '6px' }} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label style={{ fontSize: '14px', fontWeight: '600' }}>{t.city} *</label>
                    <input required type="text" name="city" value={formData.city} onChange={handleInputChange} style={{ padding: '12px', border: '1px solid var(--gray-300)', borderRadius: '6px' }} />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label style={{ fontSize: '14px', fontWeight: '600' }}>{t.street} *</label>
                  <input required type="text" name="street" value={formData.street} onChange={handleInputChange} style={{ padding: '12px', border: '1px solid var(--gray-300)', borderRadius: '6px' }} />
                </div>
              </div>

              {/* PAYMENT METHODS BLOCK */}
              <div className="section-card" style={{ padding: '24px', backgroundColor: 'var(--white)', borderRadius: '12px', border: '1px solid var(--gray-200)' }}>
                <h2 className="section-title" style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', borderBottom: '1.5px solid var(--gray-100)', paddingBottom: '12px' }}>{t.paymentTitle}</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label className="flex items-center gap-4" style={{ padding: '16px', border: '1px solid var(--gray-200)', borderRadius: '8px', cursor: 'pointer' }}>
                    <input type="radio" name="paymentMethod" value="COD" checked={formData.paymentMethod === 'COD'} onChange={handleInputChange} />
                    <div>
                      <strong>{t.cod}</strong>
                    </div>
                  </label>
                  <label className="flex items-center gap-4" style={{ padding: '16px', border: '1px solid var(--gray-200)', borderRadius: '8px', cursor: 'pointer' }}>
                    <input type="radio" name="paymentMethod" value="CARD" checked={formData.paymentMethod === 'CARD'} onChange={handleInputChange} />
                    <div>
                      <strong>{t.card}</strong>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* ORDER REVIEW SIDEBAR */}
          <aside className="section-card" style={{ width: '380px', flexShrink: 0, padding: '24px', backgroundColor: 'var(--white)', borderRadius: '12px', border: '1px solid var(--gray-200)', height: 'fit-content' }}>
            <h2 className="section-title" style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', borderBottom: '1.5px solid var(--gray-100)', paddingBottom: '12px' }}>{t.orderSummary}</h2>

            {/* ITEM LIST */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px', maxHeight: '200px', overflowY: 'auto' }}>
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center gap-4">
                  <div className="flex gap-2 items-center">
                    <div style={{ position: 'relative', width: '50px', height: '50px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--gray-200)', flexShrink: 0 }}>
                      <Image src={item.imageUrl || 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?q=80&w=300'} alt={item.name} fill style={{ objectFit: 'cover' }} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: '700' }}>{item.name}</h4>
                      <span className="text-muted" style={{ fontSize: '12px' }}>الكمية: {item.quantity}</span>
                    </div>
                  </div>
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>
                    {item.quantity * item.price} {t.currency}
                  </span>
                </div>
              ))}
            </div>

            {/* SUMMARY VALUES */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', borderTop: '1px solid var(--gray-100)', paddingTop: '16px' }}>
              <div className="flex justify-between text-muted" style={{ fontSize: '14px' }}>
                <span>المجموع الفرعي</span>
                <span>{subtotal} {t.currency}</span>
              </div>
              <div className="flex justify-between text-muted" style={{ fontSize: '14px' }}>
                <span>تكلفة الشحن</span>
                <span>{shippingAmount === 0 ? 'توصيل مجاني' : `${shippingAmount} ${t.currency}`}</span>
              </div>
            </div>

            <div className="flex justify-between items-center" style={{ borderTop: '1.5px solid var(--gray-100)', paddingTop: '20px', marginBottom: '32px' }}>
              <strong style={{ fontSize: '18px' }}>{t.total}</strong>
              <strong style={{ fontSize: '24px', color: 'var(--primary-color)' }}>{total} {t.currency}</strong>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ display: 'flex', width: '100%', padding: '16px 0', borderRadius: '8px', fontSize: '16px', justifyContent: 'center' }}>
              {loading ? 'جاري معالجة الطلب...' : t.placeOrder}
            </button>
          </aside>
        </form>
      )}
    </div>
  );
}
