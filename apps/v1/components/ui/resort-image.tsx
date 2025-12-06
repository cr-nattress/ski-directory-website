'use client';

import Image from 'next/image';
import { useState } from 'react';

interface ResortImageProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
}

// Domains configured in next.config.js remotePatterns that support optimization
const OPTIMIZABLE_DOMAINS = [
  'storage.googleapis.com',
  'images.unsplash.com',
  'source.unsplash.com',
  'picsum.photos',
  'unpkg.com',
];

/**
 * Check if an external URL can be optimized by Next.js Image
 * Based on remotePatterns in next.config.js
 */
function canOptimizeUrl(url: string): boolean {
  if (!url.startsWith('https://')) return true; // Local images are always optimized
  try {
    const hostname = new URL(url).hostname;
    return OPTIMIZABLE_DOMAINS.some(domain => hostname === domain || hostname.endsWith('.' + domain));
  } catch {
    return false;
  }
}

/**
 * ResortImage component with fallback support for GCS-hosted images.
 * Uses Next.js image optimization for configured remote domains.
 * Enables lazy loading by default for offscreen images.
 */
export function ResortImage({
  src,
  alt,
  fallbackSrc,
  width,
  height,
  className,
  priority = false,
  fill = false,
  sizes,
  style,
  loading,
}: ResortImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && fallbackSrc) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  };

  // Only use unoptimized for URLs not in our remotePatterns
  const shouldOptimize = canOptimizeUrl(imgSrc);

  if (fill) {
    return (
      <Image
        src={imgSrc}
        alt={alt}
        fill
        sizes={sizes}
        className={className}
        priority={priority}
        loading={priority ? undefined : (loading || 'lazy')}
        onError={handleError}
        unoptimized={!shouldOptimize}
        style={style}
      />
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      loading={priority ? undefined : (loading || 'lazy')}
      onError={handleError}
      unoptimized={!shouldOptimize}
      style={style}
    />
  );
}

export default ResortImage;
