'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface Webcam {
  name: string;
  source: string;
  image: string;
}

interface WebcamGalleryProps {
  webcams: Webcam[];
  className?: string;
}

export function WebcamGallery({ webcams, className }: WebcamGalleryProps) {
  const [selectedWebcam, setSelectedWebcam] = useState<Webcam | null>(null);
  const [loadErrors, setLoadErrors] = useState<Set<string>>(new Set());

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedWebcam) {
        setSelectedWebcam(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedWebcam]);

  if (!webcams || webcams.length === 0) {
    return null;
  }

  const handleImageError = (webcamImage: string) => {
    setLoadErrors(prev => new Set([...prev, webcamImage]));
  };

  return (
    <>
      <div className={cn('bg-white rounded-lg border border-neutral-200 overflow-hidden', className)}>
        {/* Header */}
        <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
          <h3 className="font-semibold text-neutral-900">Webcams</h3>
          <span className="text-xs text-neutral-500">
            {webcams.length} camera{webcams.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Webcam grid */}
        <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          {webcams.map((webcam, index) => {
            const hasError = loadErrors.has(webcam.image);

            return (
              <button
                key={`${webcam.name}-${index}`}
                onClick={() => setSelectedWebcam(webcam)}
                aria-label={`View ${webcam.name} webcam in full screen`}
                className="group relative aspect-video bg-neutral-100 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {hasError ? (
                  <div className="absolute inset-0 flex items-center justify-center text-neutral-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                ) : (
                  <Image
                    src={webcam.image}
                    alt={webcam.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={() => handleImageError(webcam.image)}
                    unoptimized
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                )}

                {/* Overlay with name */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <span className="text-xs text-white font-medium truncate block">
                    {webcam.name}
                  </span>
                </div>

                {/* Expand icon on hover */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black/50 rounded p-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lightbox modal */}
      {selectedWebcam && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="webcam-modal-title"
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedWebcam(null)}
        >
          <div
            className="relative max-w-4xl w-full"
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedWebcam(null)}
              aria-label="Close webcam viewer"
              className="absolute -top-12 right-0 text-white hover:text-neutral-300"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image */}
            <div className="bg-neutral-900 rounded-lg overflow-hidden relative aspect-video">
              <Image
                src={selectedWebcam.image}
                alt={selectedWebcam.name}
                fill
                className="object-contain"
                unoptimized
                sizes="(max-width: 1024px) 100vw, 896px"
                priority
              />
            </div>

            {/* Info bar */}
            <div className="mt-3 flex items-center justify-between">
              <h2 id="webcam-modal-title" className="text-white font-medium">{selectedWebcam.name}</h2>
              <a
                href={selectedWebcam.source}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <span>View source</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
