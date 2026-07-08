'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

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

  // Simple mock coupon logic
  const handleApplyCoupon = () => {
    if (couponCode.trim().toUpperCase() === 'SAVE10') {
      setDiscountAmount(Math.round(subtotal * 0.1));
    } else {
      setDiscountAmount(0);
      alert('كوبون غير صالح. جرب SAVE10 للحصول على خصم 10%');
    }
  };

  const shippingAmount = subtotal > 500 || subtotal === 0 ? 0 : 50;
  const total = Math.max(0, subtotal - discountAmount + shippingAmount);

  return (
    <div className="container cart-page" style={{ padding: '40px 24px', direction: 'rtl' }}>
      <h1 className="section-title" style={{ fontSize: '32px', marginBottom: '32px' }}>{t.title}</h1>

      {items.length === 0 ? (
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
                  <th style={{ padding: '16px 0', textAlign: 'center' }}>{t.price}</th>
                  <th style={{ padding: '16px 0', textAlign: 'center' }}>{t.quantity}</th>
                  <th style={{ padding: '16px 0', textAlign: 'left' }}>{t.totalPrice}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const image = item.imageUrl || 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?q=80&w=300';
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                      <td style={{ padding: '24px 0' }}>
                        <div className="flex gap-4 items-center">
                          <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1.5px solid var(--gray-200)', flexShrink: 0 }}>
                            <Image src={image} alt={item.name} fill style={{ objectFit: 'cover' }} />
                          </div>
                          <div>
                            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>{item.name}</h3>
                            <span className="text-muted" style={{ fontSize: '12px' }}>{item.sku}</span>
                            <button
                              onClick={() => removeItem(item.id)}
                              style={{ display: 'block', color: '#ef4444', fontSize: '12px', border: 'none', background: 'none', padding: 0, marginTop: '4px', cursor: 'pointer' }}
                            >
                              إزالة
                            </button>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '24px 0', textAlign: 'center', fontWeight: '600' }}>
                        {item.price} {t.currency}
                      </td>
                      <td style={{ padding: '24px 0', textAlign: 'center' }}>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            style={{ width: '28px', height: '28px', border: '1px solid var(--gray-200)', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            -
                          </button>
                          <span style={{ fontWeight: '700', width: '24px', display: 'inline-block', textAlign: 'center' }}>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            style={{ width: '28px', height: '28px', border: '1px solid var(--gray-200)', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '24px 0', textAlign: 'left', fontWeight: '700', color: 'var(--primary-color)' }}>
                        {item.price * item.quantity} {t.currency}
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
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                style={{ padding: '12px 16px', border: '1.5px solid var(--gray-200)', borderRadius: '8px', width: '200px' }}
              />
              <button className="btn btn-secondary" onClick={handleApplyCoupon}>{t.applyCoupon}</button>
            </div>
          </div>

          {/* SUMMARY SIDEBAR */}
          <aside className="section-card" style={{ width: '350px', flexShrink: 0, padding: '24px', backgroundColor: 'var(--white)', borderRadius: '12px', border: '1px solid var(--gray-200)' }}>
            <h2 className="section-title" style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', borderBottom: '1.5px solid var(--gray-100)', paddingBottom: '12px' }}>{t.summaryTitle}</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div className="flex justify-between">
                <span className="text-muted">{t.subtotal}</span>
                <span style={{ fontWeight: '600' }}>{subtotal} {t.currency}</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="flex justify-between" style={{ color: 'var(--success)' }}>
                  <span>{t.discount}</span>
                  <span>-{discountAmount} {t.currency}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-muted">{t.shipping}</span>
                <span>{shippingAmount === 0 ? t.freeShipping : `${shippingAmount} ${t.currency}`}</span>
              </div>
            </div>

            <div className="flex justify-between items-center" style={{ borderTop: '1.5px solid var(--gray-100)', paddingTop: '20px', marginBottom: '32px' }}>
              <strong style={{ fontSize: '18px' }}>{t.total}</strong>
              <strong style={{ fontSize: '24px', color: 'var(--primary-color)' }}>{total} {t.currency}</strong>
            </div>

            <a href="/checkout" className="btn btn-primary" style={{ display: 'flex', width: '100%', padding: '16px 0', borderRadius: '8px', fontSize: '16px', justifyContent: 'center' }}>
              {t.checkout}
            </a>
          </aside>
        </div>
      )}
    </div>
  );
}
