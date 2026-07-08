'use client';

import React from 'react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function HeaderActions() {
  const { totalItems } = useCart();
  const { items: wishlistItems } = useWishlist();

  return (
    <div className="header-actions">
      {/* Wishlist */}
      <a
        href="/wishlist"
        className="icon-btn"
        aria-label="Wishlist"
        style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      >
        ❤️
        {wishlistItems.length > 0 && (
          <span style={{
            position: 'absolute',
            top: '-6px',
            right: '-6px',
            background: '#e11d48',
            color: '#fff',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            fontSize: '11px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
          }}>
            {wishlistItems.length > 99 ? '99+' : wishlistItems.length}
          </span>
        )}
      </a>

      {/* Cart */}
      <a
        href="/cart"
        className="icon-btn"
        aria-label="Cart"
        style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      >
        🛒
        {totalItems > 0 && (
          <span style={{
            position: 'absolute',
            top: '-6px',
            right: '-6px',
            background: 'var(--primary-color, #8B4513)',
            color: '#fff',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            fontSize: '11px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
          }}>
            {totalItems > 99 ? '99+' : totalItems}
          </span>
        )}
      </a>

      {/* Account */}
      <a href="/account" className="icon-btn" aria-label="Account">👤</a>
    </div>
  );
}
