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
}

/**
 * ResortImage component with fallback support for GCS-hosted images.
 * Handles external URLs (GCS, Unsplash) with unoptimized mode.
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
}: ResortImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && fallbackSrc) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  };

  // Use unoptimized for external URLs (GCS, Unsplash, etc.)
  const isExternal = imgSrc.startsWith('https://');

  if (fill) {
    return (
      <Image
        src={imgSrc}
        alt={alt}
        fill
        sizes={sizes}
        className={className}
        priority={priority}
        onError={handleError}
        unoptimized={isExternal}
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
      onError={handleError}
      unoptimized={isExternal}
      style={style}
    />
  );
}

export default ResortImage;
