'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export interface WishlistItem {
  productId: string;
  slug: string;
  name: string;
  sku: string;
  price: number;
  imageUrl: string;
}

interface WishlistContextValue {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleItem: (item: WishlistItem) => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);
const WISHLIST_KEY = 'nova-wood-wishlist';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {
      // ignore
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  }, [items, mounted]);

  const addItem = useCallback((item: WishlistItem) => {
    setItems((prev) => prev.find((i) => i.productId === item.productId) ? prev : [...prev, item]);
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const isInWishlist = useCallback((productId: string) => {
    return items.some((i) => i.productId === productId);
  }, [items]);

  const toggleItem = useCallback((item: WishlistItem) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.productId === item.productId);
      return exists ? prev.filter((i) => i.productId !== item.productId) : [...prev, item];
    });
  }, []);

  return (
    <WishlistContext.Provider value={{ items, addItem, removeItem, isInWishlist, toggleItem }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
