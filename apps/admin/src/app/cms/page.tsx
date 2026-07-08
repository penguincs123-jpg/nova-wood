import React from 'react';

interface Page {
  id: string;
  slug: string;
  isActive: boolean;
  translations: Array<{ title: string; content: string }>;
}

async function getPages(): Promise<Page[]> {
  try {
    const res = await fetch('http://localhost:4000/api/v1/cms/pages?lang=en', {
      next: { revalidate: 10 },
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    return data.data || [];
  } catch {
    return [
      {
        id: '1',
        slug: 'about',
        isActive: true,
        translations: [{ title: 'About Us', content: 'Nova Wood is dedicated to handcrafted luxury furniture...' }],
      },
      {
        id: '2',
        slug: 'faq',
        isActive: true,
        translations: [{ title: 'Frequently Asked Questions', content: 'Answers about wood types, customization, and warranty...' }],
      },
      {
        id: '3',
        slug: 'privacy',
        isActive: true,
        translations: [{ title: 'Privacy Policy', content: 'We guarantee privacy on checkouts...' }],
      }
    ];
  }
}

export default async function AdminCmsPage() {
  const pages = await getPages();

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="section-title" style={{ fontSize: '28px', marginBottom: '8px' }}>
            CMS Page Editor
          </h1>
          <p className="text-muted">
            Manage site information pages, custom sliders, FAQ details, and legal agreements.
          </p>
        </div>
        <button className="btn btn-primary">➕ Create New Page</button>
      </div>

      <div className="section-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Page Title</th>
              <th>Slug Route</th>
              <th>Preview Snippet</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.id}>
                <td style={{ fontWeight: '600', color: 'var(--white)' }}>{p.translations[0]?.title}</td>
                <td style={{ fontWeight: '700' }}>/pages/{p.slug}</td>
                <td style={{ fontSize: '13px' }} className="text-muted">
                  {p.translations[0]?.content.substring(0, 75)}...
                </td>
                <td>
                  <span className={`badge ${p.isActive ? 'badge-success' : 'badge-warning'}`}>
                    {p.isActive ? 'PUBLISHED' : 'DRAFT'}
                  </span>
                </td>
                <td>
                  <div className="flex gap-2">
                    <button style={{ color: 'var(--accent-color)', cursor: 'pointer' }}>Edit Page</button>
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
