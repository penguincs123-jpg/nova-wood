import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'قائمة الأمنيات | نوفا وود',
  description: 'تصفح قائمة الأمنيات الخاصة بك من أثاث نوفا وود الفاخر.',
};

export default function WishlistPage() {
  return (
    <div className="container" style={{ padding: '4rem 1rem', minHeight: '60vh', textAlign: 'center', direction: 'rtl' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❤️</div>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-color)' }}>
          قائمة الأمنيات
        </h1>
        <p style={{ color: '#6B7280', marginBottom: '2rem', lineHeight: '1.8' }}>
          قائمة الأمنيات الخاصة بك فارغة حالياً.
          <br />
          تصفح مجموعتنا الفاخرة وأضف القطع التي تعجبك!
        </p>
        <a
          href="/products"
          className="btn btn-primary"
          style={{ display: 'inline-block' }}
        >
          اكتشف المجموعة
        </a>
      </div>
    </div>
  );
}
