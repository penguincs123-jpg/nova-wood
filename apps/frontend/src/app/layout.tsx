import type { Metadata } from 'next';
import './globals.css';
import React from 'react';

// Fetch public settings from backend at build/request time
async function getPublicSettings() {
  try {
    const res = await fetch('http://localhost:4000/api/v1/cms/settings', {
      next: { revalidate: 60 }, // Cache settings for 60 seconds
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    return data.data || {};
  } catch {
    return {
      'site.name': 'Nova Wood',
      'site.tagline': 'Premium Furniture & Handcrafted Wood',
      'theme.primaryColor': '#8B4513',
      'theme.secondaryColor': '#D2691E',
      'theme.accentColor': '#F5DEB3',
      'theme.textColor': '#1A1A1A',
      'theme.bgColor': '#FAFAF8',
      'social.whatsapp': '+201000000000',
    };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  const title = settings['seo.defaultTitle'] || 'Nova Wood - Premium Office Furniture';
  const description = settings['seo.defaultDescription'] || 'Discover Nova Wood\'s premium handcrafted furniture.';
  return {
    title: {
      default: title,
      template: settings['seo.titleTemplate'] || '%s | Nova Wood',
    },
    description,
    metadataBase: new URL('https://novawoodeg.com'),
    openGraph: {
      title,
      description,
      url: 'https://novawoodeg.com',
      siteName: settings['site.name'] || 'Nova Wood',
      images: [
        {
          url: 'https://novawoodeg.com/og-image.jpg',
          width: 1200,
          height: 630,
          alt: settings['site.name'] || 'Nova Wood',
        },
      ],
      locale: 'ar',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://novawoodeg.com/og-image.jpg'],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getPublicSettings();

  // Basic locale detection (usually handled via Next.js middleware, here simplified for portability)
  const locale = 'ar'; // Default to Arabic (rtl)
  const isRtl = locale === 'ar';

  const translations = {
    ar: {
      searchPlaceholder: 'ابحث عن أثاثك الراقي...',
      home: 'الرئيسية',
      office: 'أثاث مكتبي',
      living: 'غرفة المعيشة',
      bedroom: 'غرفة النوم',
      dining: 'غرفة الطعام',
      contact: 'اتصل بنا',
      copyright: 'جميع الحقوق محفوظة © نوفا وود',
      whatsapp: 'تواصل معنا عبر واتساب',
      newsletter: 'اشترك في النشرة الإخبارية',
      subscribe: 'اشترك',
    },
    en: {
      searchPlaceholder: 'Search for premium furniture...',
      home: 'Home',
      office: 'Office Furniture',
      living: 'Living Room',
      bedroom: 'Bedroom',
      dining: 'Dining Room',
      contact: 'Contact Us',
      copyright: 'All rights reserved © Nova Wood',
      whatsapp: 'Chat on WhatsApp',
      newsletter: 'Subscribe to Newsletter',
      subscribe: 'Subscribe',
    }
  };

  const t = translations[locale];

  // Dynamic Styles Injection based on Admin panel settings
  const dynamicStyles = {
    '--primary-color': settings['theme.primaryColor'] || '#8B4513',
    '--secondary-color': settings['theme.secondaryColor'] || '#D2691E',
    '--accent-color': settings['theme.accentColor'] || '#F5DEB3',
    '--text-color': settings['theme.textColor'] || '#1A1A1A',
    '--bg-color': settings['theme.bgColor'] || '#FAFAF8',
  } as React.CSSProperties;

  return (
    <html lang={locale} dir={isRtl ? 'rtl' : 'ltr'} style={dynamicStyles}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LocalBusiness',
              'name': settings['site.name'] || 'Nova Wood',
              'image': 'https://novawoodeg.com/logo.png',
              'telephone': settings['site.phone'] || '+201000000000',
              'email': settings['site.email'] || 'info@novawoodeg.com',
              'address': {
                '@type': 'PostalAddress',
                'streetAddress': '90th St, Fifth Settlement',
                'addressLocality': 'New Cairo',
                'addressRegion': 'Cairo',
                'addressCountry': 'EG',
              },
              'priceRange': '$$',
              'sameAs': settings['social.whatsapp'] ? [
                `https://wa.me/${settings['social.whatsapp']}`,
              ] : [],
            }),
          }}
        />
      </head>
      <body>
        {/* PREMIUM NAVIGATION HEADER */}
        <header className="site-header">
          <div className="container header-container">
            <div className="logo-group">
              <a href="/" className="logo-text">
                {settings['site.name'] || 'Nova Wood'}
              </a>
              <span className="tagline">{settings['site.tagline']}</span>
            </div>

            <div className="search-bar">
              <input type="text" placeholder={t.searchPlaceholder} />
              <button aria-label="Search" className="search-btn">🔍</button>
            </div>

            <nav className="nav-menu">
              <a href="/">{t.home}</a>
              <a href="/products?category=office-furniture">{t.office}</a>
              <a href="/products?category=living-room">{t.living}</a>
              <a href="/products?category=bedroom">{t.bedroom}</a>
              <a href="/products?category=dining-room">{t.dining}</a>
            </nav>

            <div className="header-actions">
              <button className="icon-btn" aria-label="Wishlist">❤️</button>
              <button className="icon-btn" aria-label="Cart">🛒</button>
              <button className="icon-btn" aria-label="Account">👤</button>
            </div>
          </div>
        </header>

        {/* MAIN STOREFRONT CONTENT */}
        <main className="main-content">
          {children}
        </main>

        {/* PREMIUM FOOTER */}
        <footer className="site-footer">
          <div className="container footer-grid">
            <div className="footer-col">
              <h3 className="footer-title">{settings['site.name'] || 'Nova Wood'}</h3>
              <p className="footer-desc">{settings['seo.defaultDescription']}</p>
              {settings['site.phone'] && <p className="footer-info">📞 {settings['site.phone']}</p>}
              {settings['site.email'] && <p className="footer-info">✉️ {settings['site.email']}</p>}
            </div>

            <div className="footer-col">
              <h3 className="footer-title">Quick Links</h3>
              <ul className="footer-links">
                <li><a href="/about">About Us</a></li>
                <li><a href="/faq">FAQ</a></li>
                <li><a href="/terms">Terms & Conditions</a></li>
                <li><a href="/privacy">Privacy Policy</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h3 className="footer-title">{t.newsletter}</h3>
              <div className="newsletter-form">
                <input type="email" placeholder="email@example.com" />
                <button className="btn btn-primary">{t.subscribe}</button>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="container flex items-center justify-between">
              <p>{t.copyright}</p>
              {settings['social.whatsapp'] && (
                <a
                  href={`https://wa.me/${settings['social.whatsapp']}`}
                  className="whatsapp-float"
                  target="_blank"
                  rel="noreferrer"
                >
                  🟢 {t.whatsapp}
                </a>
              )}
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}
