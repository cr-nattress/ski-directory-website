'use client';

import { Resort, ResortImage } from '@/lib/types';
import { getSortedImages } from '@/lib/utils/resort-images';
import { useState } from 'react';
import { X } from 'lucide-react';

interface PhotoGalleryProps {
  resort: Resort;
}

export function PhotoGallery({ resort }: PhotoGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  return (
    <>
      {/* Desktop Gallery Grid */}
      <div className="hidden sm:grid sm:grid-cols-4 gap-2 rounded-lg overflow-hidden">
        {/* Large main image */}
        <button
          onClick={() => openLightbox(0)}
          className="col-span-2 row-span-2 relative group overflow-hidden"
        >
          <img
            src={images[0].url}
            alt={images[0].alt}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
        </button>

        {/* Four smaller images */}
        {images.slice(1, 5).map((image, index) => (
          <button
            key={index}
            onClick={() => openLightbox(index + 1)}
            className="relative group overflow-hidden aspect-square"
          >
            <img
              src={image.url}
              alt={image.alt}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
          </button>
        ))}

        {/* View All Photos Button (overlay on last image) */}
        <button
          onClick={() => openLightbox(0)}
          className="absolute bottom-4 right-4 bg-white text-gray-900 px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors shadow-md"
        >
          View all photos
        </button>
      </div>

      {/* Mobile Gallery - Single swipeable image */}
      <div className="sm:hidden relative rounded-lg overflow-hidden">
        <img
          src={images[0].url}
          alt={images[0].alt}
          className="w-full h-64 object-cover"
        />
        <button
          onClick={() => openLightbox(0)}
          className="absolute bottom-4 right-4 bg-white text-gray-900 px-4 py-2 rounded-lg font-medium text-sm shadow-md"
        >
          View all photos
        </button>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="relative max-w-7xl max-h-screen p-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[currentImageIndex].url}
              alt={images[currentImageIndex].alt}
              className="max-w-full max-h-[90vh] object-contain mx-auto"
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
