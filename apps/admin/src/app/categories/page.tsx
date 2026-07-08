import React from 'react';
import Image from 'next/image';

interface Category {
  id: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  translations: Array<{ name: string; description?: string | null }>;
  imageUrl?: string | null;
  _count?: { products: number } | null;
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch('http://localhost:4000/api/v1/categories?lang=en', {
      next: { revalidate: 10 },
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    
    // Flatten tree response for simplified table view
    return data.data || [];
  } catch {
    return [
      { id: '1', slug: 'office-furniture', sortOrder: 1, isActive: true, isFeatured: true, translations: [{ name: 'Office Furniture', description: 'Office desks, chairs and setups' }], imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=300', _count: { products: 6 } },
      { id: '2', slug: 'living-room', sortOrder: 2, isActive: true, isFeatured: true, translations: [{ name: 'Living Room', description: 'Luxury sofa and seating sets' }], imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=300', _count: { products: 12 } },
      { id: '3', slug: 'bedroom', sortOrder: 3, isActive: true, isFeatured: false, translations: [{ name: 'Bedroom', description: 'Elegant beds and wardrobes' }], imageUrl: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=300', _count: { products: 4 } },
    ];
  }
}

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="section-title" style={{ fontSize: '28px', marginBottom: '8px' }}>
            Categories Directory
          </h1>
          <p className="text-muted">
            Manage catalog departments, structure hierarchies, assign sort order, and toggle visibility status.
          </p>
        </div>
        <button className="btn btn-primary">➕ Add New Category</button>
      </div>

      {/* CATEGORIES DIRECTORY TABLE */}
      <div className="section-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Slug</th>
              <th>Category Name</th>
              <th>Description</th>
              <th>Sort Order</th>
              <th>Products Count</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => {
              const image = cat.imageUrl || 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=300';
              return (
                <tr key={cat.id}>
                  <td>
                    <div style={{ position: 'relative', width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                      <Image src={image} alt={cat.translations[0]?.name || cat.slug} fill style={{ objectFit: 'cover' }} />
                    </div>
                  </td>
                  <td style={{ fontWeight: '700' }}>/{cat.slug}</td>
                  <td style={{ fontWeight: '600', color: 'var(--white)' }}>{cat.translations[0]?.name}</td>
                  <td style={{ fontSize: '13px' }} className="text-muted">{cat.translations[0]?.description || '-'}</td>
                  <td>{cat.sortOrder}</td>
                  <td>
                    <span className="badge badge-info">
                      {cat._count?.products || 0} items
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${cat.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {cat.isActive ? 'VISIBLE' : 'HIDDEN'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button style={{ color: 'var(--accent-color)', cursor: 'pointer' }}>Edit</button>
                      <button style={{ color: 'var(--danger)', cursor: 'pointer' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
