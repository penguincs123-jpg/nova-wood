'use client';

import React, { useState } from 'react';
import { useCart, CartItem } from '../context/CartContext';

interface CartButtonProps {
  product: Omit<CartItem, 'id' | 'quantity'>;
  label?: string;
  className?: string;
}

export default function CartButton({ product, label = 'أضف إلى السلة', className = 'btn btn-primary' }: CartButtonProps) {
  const { addItem, isInCart } = useCart();
  const [added, setAdded] = useState(false);

  const inCart = isInCart(product.productId, product.variantId);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <button
      className={className}
      onClick={handleAdd}
      style={{
        transition: 'all 0.2s ease',
        backgroundColor: added ? 'var(--success, #16a34a)' : undefined,
      }}
    >
      {added ? '✓ تمت الإضافة!' : inCart ? '✓ في السلة' : label}
    </button>
  );
}
