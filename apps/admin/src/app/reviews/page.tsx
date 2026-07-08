import React from 'react';

interface Review {
  id: string;
  rating: number;
  title?: string | null;
  body: string;
  isApproved: boolean;
  createdAt: string;
  user: {
    email: string;
    profile?: { firstName?: string | null; lastName?: string | null } | null;
  };
  product: {
    sku: string;
    translations: Array<{ name: string }>;
  };
}

async function getReviews(): Promise<Review[]> {
  try {
    const res = await fetch('http://localhost:4000/api/v1/admin/reviews', {
      headers: { 'Authorization': 'Bearer DEV_TOKEN_MOCK' },
      next: { revalidate: 10 },
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    return data.data || [];
  } catch {
    return [
      {
        id: 'r1',
        rating: 5,
        title: 'Perfect desk',
        body: 'The quality of the wood is outstanding. Delivered on time.',
        isApproved: false,
        createdAt: '2026-07-08T12:00:00.000Z',
        user: { email: 'client1@gmail.com', profile: { firstName: 'محمد', lastName: 'ياسر' } },
        product: { sku: 'DESK-TEAK-01', translations: [{ name: 'Handcrafted Teak Office Desk' }] },
      },
      {
        id: 'r2',
        rating: 4,
        title: 'Very comfortable chair',
        body: 'Provides good lumbar support. Highly recommended.',
        isApproved: true,
        createdAt: '2026-07-07T15:30:00.000Z',
        user: { email: 'yasser@yahoo.com', profile: { firstName: 'ياسر', lastName: 'حلمي' } },
        product: { sku: 'CHAIR-OAK-03', translations: [{ name: 'Ergonomic Executive Office Chair' }] },
      }
    ];
  }
}

export default async function AdminReviewsPage() {
  const reviews = await getReviews();

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="section-title" style={{ fontSize: '28px', marginBottom: '8px' }}>
          Customer Reviews Moderation
        </h1>
        <p className="text-muted">
          Approve, hold or delete user product reviews. Only approved reviews will show on storefront product detail pages.
        </p>
      </div>

      <div className="section-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Customer</th>
              <th>Rating</th>
              <th>Review Text</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((rev) => (
              <tr key={rev.id}>
                <td>
                  <strong style={{ color: 'var(--white)' }}>{rev.product.translations[0]?.name}</strong>
                  <span className="text-muted" style={{ display: 'block', fontSize: '11px' }}>{rev.product.sku}</span>
                </td>
                <td>
                  <span>{rev.user.profile?.firstName} {rev.user.profile?.lastName}</span>
                  <span className="text-muted" style={{ display: 'block', fontSize: '11px' }}>{rev.user.email}</span>
                </td>
                <td style={{ color: 'var(--warning)', fontWeight: 'bold' }}>
                  {'★'.repeat(rev.rating)}
                </td>
                <td>
                  {rev.title && <strong style={{ display: 'block', color: 'var(--white)' }}>{rev.title}</strong>}
                  <p style={{ fontSize: '13px' }} className="text-muted">{rev.body}</p>
                </td>
                <td>{new Date(rev.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</td>
                <td>
                  <span className={`badge ${rev.isApproved ? 'badge-success' : 'badge-warning'}`}>
                    {rev.isApproved ? 'APPROVED' : 'PENDING'}
                  </span>
                </td>
                <td>
                  <div className="flex gap-2">
                    {!rev.isApproved && (
                      <button style={{ color: 'var(--success)', cursor: 'pointer' }}>Approve</button>
                    )}
                    <button style={{ color: 'var(--danger)', cursor: 'pointer' }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
