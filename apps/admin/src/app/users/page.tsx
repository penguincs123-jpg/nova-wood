import React from 'react';

interface User {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  profile?: {
    firstName?: string | null;
    lastName?: string | null;
  } | null;
}

async function getUsers(): Promise<User[]> {
  try {
    const res = await fetch('http://localhost:4000/api/v1/admin/users', {
      headers: { 'Authorization': 'Bearer DEV_TOKEN_MOCK' },
      next: { revalidate: 10 },
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    return data.data || [];
  } catch {
    return [
      {
        id: 'u1',
        email: 'admin@novawoodeg.com',
        role: 'SUPER_ADMIN',
        isActive: true,
        createdAt: '2026-07-08T12:00:00.000Z',
        profile: { firstName: 'Nova', lastName: 'Admin' },
      },
      {
        id: 'u2',
        email: 'm.yasser@gmail.com',
        role: 'CUSTOMER',
        isActive: true,
        createdAt: '2026-07-08T14:10:00.000Z',
        profile: { firstName: 'محمد', lastName: 'ياسر' },
      },
      {
        id: 'u3',
        email: 'ahmed_lux@gmail.com',
        role: 'CUSTOMER',
        isActive: false,
        createdAt: '2026-07-08T15:20:00.000Z',
        profile: { firstName: 'أحمد', lastName: 'كامل' },
      }
    ];
  }
}

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="section-title" style={{ fontSize: '28px', marginBottom: '8px' }}>
          Users Control Directory
        </h1>
        <p className="text-muted">
          Manage system users, customer profiles, system staff roles, and activate/deactivate accounts.
        </p>
      </div>

      {/* USERS REGISTRATION TABLE */}
      <div className="section-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email Address</th>
              <th>Staff Role</th>
              <th>Status</th>
              <th>Joined Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td style={{ fontWeight: '600', color: 'var(--white)' }}>
                  {user.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName || ''}` : 'No Name'}
                </td>
                <td style={{ fontWeight: '500' }}>{user.email}</td>
                <td>
                  <span className={`badge ${user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' ? 'badge-danger' : 'badge-info'}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`badge ${user.isActive ? 'badge-success' : 'badge-warning'}`}>
                    {user.isActive ? 'ACTIVE' : 'DEACTIVATED'}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</td>
                <td>
                  <div className="flex gap-2">
                    <button style={{ color: 'var(--accent-color)', cursor: 'pointer' }}>Edit Role</button>
                    <button style={{ color: 'var(--danger)', cursor: 'pointer' }}>
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
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
