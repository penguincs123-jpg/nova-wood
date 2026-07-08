import type { Metadata } from 'next';
import './globals.css';
import React from 'react';

export const metadata: Metadata = {
  title: 'Nova Wood — Admin Control Panel',
  description: 'Manage products, categories, orders, settings and content for Nova Wood.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="admin-layout">
          {/* SIDEBAR NAVIGATION */}
          <aside className="sidebar">
            <div className="logo">
              Nova <span>Wood</span>
            </div>

            <nav>
              <ul className="nav-list">
                <li>
                  <a href="/" className="nav-link active">
                    📊 Dashboard
                  </a>
                </li>
                <li>
                  <a href="/products" className="nav-link">
                    📦 Products
                  </a>
                </li>
                <li>
                  <a href="/categories" className="nav-link">
                    📁 Categories
                  </a>
                </li>
                <li>
                  <a href="/orders" className="nav-link">
                    🛒 Orders
                  </a>
                </li>
                <li>
                  <a href="/settings" className="nav-link">
                    ⚙️ Settings
                  </a>
                </li>
                <li>
                  <a href="/media" className="nav-link">
                    🖼️ Media Library
                  </a>
                </li>
              </ul>
            </nav>
          </aside>

          {/* MAIN PAGE CONTENT */}
          <main className="main-content">{children}</main>
        </div>
      </body>
    </html>
  );
}
