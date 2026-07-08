import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
}

export function Skeleton({ className = '', width, height, borderRadius }: SkeletonProps) {
  const style: React.CSSProperties = {
    width: width ?? '100%',
    height: height ?? '16px',
    borderRadius: borderRadius ?? '4px',
    backgroundColor: 'var(--gray-200)',
    backgroundImage: 'linear-gradient(90deg, var(--gray-200) 25%, var(--gray-100) 50%, var(--gray-200) 75%)',
    backgroundSize: '200% 100%',
    animation: 'skeleton-pulse 1.5s infinite linear',
  };

  return <div className={`skeleton ${className}`} style={style} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="card product-card" style={{ padding: '0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Skeleton height="250px" borderRadius="12px 12px 0 0" />
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Skeleton width="40%" height="12px" />
        <Skeleton width="80%" height="20px" />
        <Skeleton width="95%" height="14px" />
        <div className="flex justify-between items-center" style={{ marginTop: '12px' }}>
          <Skeleton width="30%" height="24px" />
          <Skeleton width="40%" height="36px" borderRadius="6px" />
        </div>
      </div>
    </div>
  );
}

export function ProductListSkeleton() {
  return (
    <div className="grid grid-cols-3" style={{ gap: '24px' }}>
      <ProductCardSkeleton />
      <ProductCardSkeleton />
      <ProductCardSkeleton />
      <ProductCardSkeleton />
      <ProductCardSkeleton />
      <ProductCardSkeleton />
    </div>
  );
}
