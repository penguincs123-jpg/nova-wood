import React from 'react';
import Image from 'next/image';

interface Product {
  id: string;
  sku: string;
  basePrice: number;
  salePrice?: number | null;
  stockQty: number;
  isActive: boolean;
  soldCount: number;
  translations: Array<{ name: string }>;
  images: Array<{ url: string }>;
}

async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch('http://localhost:4000/api/v1/products?locale=en', {
      next: { revalidate: 10 },
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    return data.data || [];
  } catch {
    return [
      {
        id: 'p1',
        sku: 'DESK-TEAK-01',
        basePrice: 12500,
        salePrice: 10999,
        stockQty: 5,
        isActive: true,
        soldCount: 12,
        translations: [{ name: 'Handcrafted Teak Office Desk' }],
        images: [{ url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=300' }],
      },
      {
        id: 'p2',
        sku: 'SOFA-GRAY-02',
        basePrice: 18000,
        salePrice: null,
        stockQty: 8,
        isActive: true,
        soldCount: 4,
        translations: [{ name: 'Scandinavian Minimalist Sofa' }],
        images: [{ url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=300' }],
      },
      {
        id: 'p3',
        sku: 'CHAIR-OAK-03',
        basePrice: 4500,
        salePrice: 3999,
        stockQty: 4,
        isActive: true,
        soldCount: 22,
        translations: [{ name: 'Ergonomic Executive Office Chair' }],
        images: [{ url: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?q=80&w=300' }],
      }
    ];
  }
}

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="section-title" style={{ fontSize: '28px', marginBottom: '8px' }}>
            Products Directory
          </h1>
          <p className="text-muted">
            Manage your furniture catalog, edit product details, view stock, and edit prices.
          </p>
        </div>
        <button className="btn btn-primary">➕ Add New Product</button>
      </div>

      {/* PRODUCTS DIRECTORY TABLE */}
      <div className="section-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Base Price</th>
              <th>Sale Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((prod) => {
              const image = prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?q=80&w=300';
              return (
                <tr key={prod.id}>
                  <td>
                    <div style={{ position: 'relative', width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                      <Image src={image} alt={prod.translations[0]?.name} fill style={{ objectFit: 'cover' }} />
                    </div>
                  </td>
                  <td style={{ fontWeight: '700' }}>{prod.sku}</td>
                  <td style={{ fontWeight: '600', color: 'var(--white)' }}>{prod.translations[0]?.name}</td>
                  <td>{Number(prod.basePrice).toLocaleString()} EGP</td>
                  <td>{prod.salePrice ? `${Number(prod.salePrice).toLocaleString()} EGP` : '-'}</td>
                  <td>
                    <span className={`badge ${prod.stockQty <= 5 ? 'badge-danger' : 'badge-success'}`}>
                      {prod.stockQty} items
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${prod.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {prod.isActive ? 'ACTIVE' : 'INACTIVE'}
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
