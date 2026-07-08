import React from 'react';

interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  total: number;
  user?: { email: string } | null;
  guestEmail?: string | null;
}

async function getOrders(): Promise<Order[]> {
  try {
    const res = await fetch('http://localhost:4000/api/v1/admin/orders', {
      headers: { 'Authorization': 'Bearer DEV_TOKEN_MOCK' },
      next: { revalidate: 10 },
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    return data.data || [];
  } catch {
    return [
      {
        id: 'o1',
        orderNumber: 'NW-20260708-8495',
        createdAt: '2026-07-08T14:32:00.000Z',
        paymentMethod: 'CREDIT_CARD',
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        total: 10999,
        user: { email: 'client1@gmail.com' },
      },
      {
        id: 'o2',
        orderNumber: 'NW-20260708-1123',
        createdAt: '2026-07-08T15:11:00.000Z',
        paymentMethod: 'CASH_ON_DELIVERY',
        paymentStatus: 'PENDING',
        status: 'PENDING',
        total: 3999,
        guestEmail: 'guest_user@gmail.com',
      },
      {
        id: 'o3',
        orderNumber: 'NW-20260708-4439',
        createdAt: '2026-07-08T12:05:00.000Z',
        paymentMethod: 'PAYMOB',
        paymentStatus: 'PAID',
        status: 'DELIVERED',
        total: 18000,
        user: { email: 'ahmed_lux@gmail.com' },
      }
    ];
  }
}

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="section-title" style={{ fontSize: '28px', marginBottom: '8px' }}>
          Orders Management
        </h1>
        <p className="text-muted">
          Review placed orders, approve payment statuses, update shipments, and process refunds.
        </p>
      </div>

      {/* ORDERS GRID TABLE */}
      <div className="section-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Payment Method</th>
              <th>Payment Status</th>
              <th>Order Status</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td style={{ fontWeight: '700', color: 'var(--white)' }}>{order.orderNumber}</td>
                <td>{new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</td>
                <td>{order.user?.email || order.guestEmail || 'Guest'}</td>
                <td style={{ fontSize: '13px', fontWeight: '500' }}>{order.paymentMethod}</td>
                <td>
                  <span className={`badge ${order.paymentStatus === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
                    {order.paymentStatus}
                  </span>
                </td>
                <td>
                  <span
                    className={`badge ${
                      order.status === 'DELIVERED'
                        ? 'badge-success'
                        : order.status === 'PENDING'
                        ? 'badge-warning'
                        : 'badge-info'
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td style={{ fontWeight: '700' }}>{Number(order.total).toLocaleString()} EGP</td>
                <td>
                  <div className="flex gap-2">
                    <button style={{ color: 'var(--accent-color)', cursor: 'pointer' }}>View Details</button>
                    <button style={{ color: 'var(--secondary-color)', cursor: 'pointer' }}>Update Status</button>
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
