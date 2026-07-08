import React from 'react';
import Image from 'next/image';

interface MediaFile {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
}

async function getMediaFiles(): Promise<MediaFile[]> {
  try {
    const res = await fetch('http://localhost:4000/api/v1/media', {
      headers: { 'Authorization': 'Bearer DEV_TOKEN_MOCK' },
      next: { revalidate: 10 },
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    return data.data || [];
  } catch {
    return [
      { id: 'm1', filename: 'dining-room-table.webp', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=300', mimeType: 'image/webp', size: 45600 },
      { id: 'm2', filename: 'ergonomic-office-chair.webp', url: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?q=80&w=300', mimeType: 'image/webp', size: 32400 },
      { id: 'm3', filename: 'l-shaped-sofa-set.webp', url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=300', mimeType: 'image/webp', size: 102400 }
    ];
  }
}

export default async function AdminMediaPage() {
  const media = await getMediaFiles();

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="section-title" style={{ fontSize: '28px', marginBottom: '8px' }}>
            Media Library Manager
          </h1>
          <p className="text-muted">
            Upload images, assets, banners and manage WebP/AVIF compressed files.
          </p>
        </div>
        <button className="btn btn-primary">➕ Upload Assets</button>
      </div>

      {/* MEDIA FILES LIST GRID */}
      <div className="grid grid-cols-4" style={{ gap: '24px' }}>
        {media.map((file) => (
          <div key={file.id} className="section-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', height: '180px', width: '100%', borderBottom: '1px solid var(--border-color)' }}>
              <Image src={file.url} alt={file.filename} fill style={{ objectFit: 'cover' }} />
            </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <strong style={{ fontSize: '14px', color: 'var(--white)', wordBreak: 'break-all', display: 'block' }}>
                {file.filename}
              </strong>
              <div className="flex justify-between text-muted" style={{ fontSize: '11px' }}>
                <span>{file.mimeType.toUpperCase()}</span>
                <span>{(file.size / 1024).toFixed(1)} KB</span>
              </div>
              <div className="flex gap-2" style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                <button style={{ color: 'var(--accent-color)', fontSize: '12px', cursor: 'pointer', flex: '1' }}>Copy Link</button>
                <button style={{ color: 'var(--danger)', fontSize: '12px', cursor: 'pointer', flex: '1' }}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
