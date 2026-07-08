'use client';

import React from 'react';
import { useWishlist, WishlistItem } from '../context/WishlistContext';

interface WishlistButtonProps {
  product: WishlistItem;
  className?: string;
  style?: React.CSSProperties;
}

export default function WishlistButton({ product, className = 'icon-btn', style }: WishlistButtonProps) {
  const { isInWishlist, toggleItem } = useWishlist();
  const active = isInWishlist(product.productId);

  function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
  }

  return (
    <button
      className={className}
      onClick={handleToggle}
      aria-label={active ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
      title={active ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
      style={{ ...style, color: active ? '#e11d48' : undefined, transition: 'color 0.2s ease' }}
    >
      {active ? '❤️' : '🤍'}
    </button>
  );
}
