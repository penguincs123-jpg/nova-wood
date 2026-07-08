'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar({ placeholder = 'ابحث عن أثاثك الراقي...' }: { placeholder?: string }) {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const q = query.trim();
    if (q) {
      router.push(`/products?q=${encodeURIComponent(q)}`);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSearch();
  }

  return (
    <div className="search-bar">
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button aria-label="Search" className="search-btn" onClick={() => handleSearch()}>
        🔍
      </button>
    </div>
  );
}
