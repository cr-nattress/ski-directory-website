'use client';

import { Resort, ResortImage } from '@/lib/types';
import { getSortedImages, PLACEHOLDER_IMAGE } from '@/lib/utils/resort-images';
import { useState, useCallback, useEffect } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';

interface PhotoGalleryProps {
  resort: Resort;
}

export function PhotoGallery({ resort }: PhotoGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // Handle image error by tracking failed URLs
  const handleImageError = useCallback((url: string) => {
    setFailedImages(prev => new Set(prev).add(url));
  }, []);

  // Get image URL with fallback for failed images
  const getImageUrl = useCallback((url: string) => {
    return failedImages.has(url) ? PLACEHOLDER_IMAGE : url;
  }, [failedImages]);

  // Get images sorted by priority, falling back to heroImage if no images array
  const sortedImages = getSortedImages(resort);
  const images: ResortImage[] = sortedImages.length > 0
    ? sortedImages
    : [{ url: resort.heroImage, alt: `${resort.name} main view`, priority: 1, isCardImage: true, isHeroImage: true }];

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft' && currentImageIndex > 0) {
        setCurrentImageIndex(currentImageIndex - 1);
      } else if (e.key === 'ArrowRight' && currentImageIndex < images.length - 1) {
        setCurrentImageIndex(currentImageIndex + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, currentImageIndex, images.length]);

  return (
    <>
      {/* Desktop Gallery Grid */}
      <div className="hidden sm:grid sm:grid-cols-4 sm:grid-rows-2 gap-2 rounded-lg overflow-hidden relative" style={{ height: '400px' }}>
        {/* Large main image */}
        <button
          onClick={() => openLightbox(0)}
          aria-label={`View ${images[0].alt} in full screen`}
          className="col-span-2 row-span-2 relative group overflow-hidden"
        >
          <Image
            src={getImageUrl(images[0].url)}
            alt={images[0].alt}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => handleImageError(images[0].url)}
            sizes="(max-width: 1024px) 50vw, 400px"
            priority
          />
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
        </button>

        {/* Four smaller images */}
        {images.slice(1, 5).map((image, index) => (
          <button
            key={index}
            onClick={() => openLightbox(index + 1)}
            aria-label={`View ${image.alt} in full screen`}
            className="relative group overflow-hidden"
          >
            <Image
              src={getImageUrl(image.url)}
              alt={image.alt}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => handleImageError(image.url)}
              sizes="(max-width: 1024px) 25vw, 200px"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
          </button>
        ))}

      </div>

      {/* Mobile Gallery - Single image, tap to open lightbox */}
      <button
        onClick={() => openLightbox(0)}
        className="sm:hidden relative rounded-lg overflow-hidden h-64 w-full"
        aria-label={`View ${images[0].alt} in full screen`}
      >
        <Image
          src={getImageUrl(images[0].url)}
          alt={images[0].alt}
          fill
          className="object-cover"
          onError={() => handleImageError(images[0].url)}
          sizes="100vw"
          priority
        />
      </button>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Photo gallery viewer - ${images[currentImageIndex].alt}`}
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            aria-label="Close photo gallery"
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="relative max-w-7xl w-full h-[90vh] p-4" onClick={(e) => e.stopPropagation()}>
            <Image
              src={getImageUrl(images[currentImageIndex].url)}
              alt={images[currentImageIndex].alt}
              fill
              className="object-contain"
              onError={() => handleImageError(images[currentImageIndex].url)}
              sizes="100vw"
              priority
            />

            {/* Image counter */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg text-sm">
              {currentImageIndex + 1} / {images.length}
            </div>

            {/* Navigation arrows */}
            {currentImageIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(currentImageIndex - 1);
                }}
                aria-label="Previous photo"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-colors"
              >
                ←
              </button>
            )}

            {currentImageIndex < images.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(currentImageIndex + 1);
                }}
                aria-label="Next photo"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-colors"
              >
                →
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
