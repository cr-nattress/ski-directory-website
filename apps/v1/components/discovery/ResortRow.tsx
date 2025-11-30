'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Resort } from '@/lib/types';
import { ResortRowCard } from './ResortRowCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ResortRowProps {
  title: string;
  icon?: string;
  resorts: Resort[];
  viewAllHref?: string;
  viewAllLabel?: string;
}

/**
 * Horizontal scrolling row of resort cards.
 * Netflix-style themed section with scroll arrows on desktop.
 */
export function ResortRow({
  title,
  icon,
  resorts,
  viewAllHref,
  viewAllLabel = 'View All',
}: ResortRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll position to show/hide arrows
  const updateScrollButtons = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    updateScrollButtons();
    container.addEventListener('scroll', updateScrollButtons);
    window.addEventListener('resize', updateScrollButtons);

    return () => {
      container.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [updateScrollButtons, resorts]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (resorts.length === 0) {
    return null;
  }

  return (
    <section className="relative py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-4 sm:px-0">
        <h3 className="text-xl font-display font-bold text-gray-900">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </h3>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-sm text-ski-blue hover:text-blue-700 font-medium transition-colors"
          >
            {viewAllLabel} &rarr;
          </Link>
        )}
      </div>

      {/* Scroll container */}
      <div className="relative group">
        {/* Left scroll button */}
        <button
          onClick={() => scroll('left')}
          className={cn(
            'absolute left-0 top-1/2 -translate-y-1/2 z-10',
            'w-10 h-10 rounded-full bg-white shadow-lg',
            'flex items-center justify-center',
            'transition-all duration-200',
            'hover:bg-gray-50 hover:scale-110',
            'focus:outline-none focus:ring-2 focus:ring-ski-blue',
            canScrollLeft
              ? 'opacity-0 group-hover:opacity-100'
              : 'opacity-0 pointer-events-none'
          )}
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>

        {/* Right scroll button */}
        <button
          onClick={() => scroll('right')}
          className={cn(
            'absolute right-0 top-1/2 -translate-y-1/2 z-10',
            'w-10 h-10 rounded-full bg-white shadow-lg',
            'flex items-center justify-center',
            'transition-all duration-200',
            'hover:bg-gray-50 hover:scale-110',
            'focus:outline-none focus:ring-2 focus:ring-ski-blue',
            canScrollRight
              ? 'opacity-0 group-hover:opacity-100'
              : 'opacity-0 pointer-events-none'
          )}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>

        {/* Cards container */}
        <div
          ref={scrollRef}
          className={cn(
            'flex gap-4 overflow-x-auto scroll-smooth',
            'px-4 sm:px-0 -mx-4 sm:mx-0',
            'scrollbar-hide'
          )}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {resorts.map((resort) => (
            <ResortRowCard key={resort.id} resort={resort} />
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Loading skeleton for ResortRow
 */
export function ResortRowSkeleton() {
  return (
    <section className="py-6">
      <div className="h-7 w-48 bg-gray-200 rounded animate-pulse mb-4" />
      <div className="flex gap-4 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[200px] sm:w-[220px] bg-gray-100 rounded-xl animate-pulse"
          >
            <div className="aspect-[4/3] bg-gray-200 rounded-t-xl" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
