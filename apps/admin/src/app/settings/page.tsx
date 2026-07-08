import React from 'react';

interface Setting {
  key: string;
  value: string | null;
  type: string;
  group: string;
  label: string;
}

async function getSettings(): Promise<Setting[]> {
  try {
    const res = await fetch('http://localhost:4000/api/v1/cms/settings', {
      next: { revalidate: 10 },
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    
    // Map back to setting array format
    return Object.entries(data.data || {}).map(([key, val]) => ({
      key,
      value: val as string | null,
      type: key.includes('Color') ? 'COLOR' : 'STRING',
      group: key.split('.')[0] || 'general',
      label: key.split('.')[1]?.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()) || key,
    }));
  } catch {
    return [
      { key: 'site.name', value: 'Nova Wood', type: 'STRING', group: 'general', label: 'Site Name' },
      { key: 'site.tagline', value: 'Premium Furniture & Handcrafted Wood', type: 'STRING', group: 'general', label: 'Tagline' },
      { key: 'theme.primaryColor', value: '#8B4513', type: 'COLOR', group: 'theme', label: 'Primary Color' },
      { key: 'theme.secondaryColor', value: '#D2691E', type: 'COLOR', group: 'theme', label: 'Secondary Color' },
      { key: 'shipping.standardCost', value: '50', type: 'NUMBER', group: 'shipping', label: 'Standard Shipping Cost' },
      { key: 'shipping.freeThreshold', value: '500', type: 'NUMBER', group: 'shipping', label: 'Free Shipping Threshold' },
    ];
  }
}

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="section-title" style={{ fontSize: '28px', marginBottom: '8px' }}>
          System Settings
        </h1>
        <p className="text-muted">
          Adjust website colors, general parameters, shipping values, and metadata options dynamically.
        </p>
      </div>

      <div className="section-card" style={{ maxWidth: '800px' }}>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {settings.map((setting) => (
            <div key={setting.key} className="flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
              <div style={{ maxWidth: '300px' }}>
                <strong style={{ display: 'block', color: 'var(--white)', marginBottom: '4px' }}>{setting.label}</strong>
                <span className="text-muted" style={{ fontSize: '12px' }}>{setting.key}</span>
              </div>
              <div>
                {setting.type === 'COLOR' ? (
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      defaultValue={setting.value || '#000000'}
                      style={{ width: '45px', height: '45px', border: 'none', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'transparent' }}
                    />
                    <input
                      type="text"
                      defaultValue={setting.value || ''}
                      style={{ padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'var(--bg-color)', color: 'var(--white)', width: '120px' }}
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    defaultValue={setting.value || ''}
                    style={{ padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'var(--bg-color)', color: 'var(--white)', width: '350px' }}
                  />
                )}
              </div>
            </div>
          ))}

          <div className="flex justify-end" style={{ marginTop: '24px' }}>
            <button className="btn btn-primary" type="button" style={{ padding: '14px 40px' }}>
              Save Settings Change
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
