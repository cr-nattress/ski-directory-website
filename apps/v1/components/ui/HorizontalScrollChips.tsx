'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface HorizontalScrollChipsProps {
  children: React.ReactNode;
  className?: string;
  /** Background color for fade gradients (default: from-white) */
  fadeColor?: string;
}

export function HorizontalScrollChips({
  children,
  className,
  fadeColor = 'from-bg-light'
}: HorizontalScrollChipsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);

  const updateFades = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setShowLeftFade(scrollLeft > 0);
    setShowRightFade(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateFades();
    el.addEventListener('scroll', updateFades, { passive: true });
    window.addEventListener('resize', updateFades);

    return () => {
      el.removeEventListener('scroll', updateFades);
      window.removeEventListener('resize', updateFades);
    };
  }, [updateFades]);

  return (
    <div className={cn('relative', className)}>
      {/* Left fade gradient */}
      <div
        className={cn(
          'absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r to-transparent z-10 pointer-events-none transition-opacity',
          fadeColor,
          showLeftFade ? 'opacity-100' : 'opacity-0'
        )}
      />

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className={cn(
          'flex gap-2 overflow-x-auto scrollbar-hide',
          '-mx-4 px-4', // Extend to edges, add padding
          'scroll-smooth snap-x snap-mandatory'
        )}
      >
        {children}
      </div>

      {/* Right fade gradient */}
      <div
        className={cn(
          'absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l to-transparent z-10 pointer-events-none transition-opacity',
          fadeColor,
          showRightFade ? 'opacity-100' : 'opacity-0'
        )}
      />
    </div>
  );
}
