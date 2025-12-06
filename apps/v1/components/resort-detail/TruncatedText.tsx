'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TruncatedTextProps {
  text: string;
  maxLength?: number;
  mobileMaxLength?: number;
  className?: string;
}

/**
 * TruncatedText - Shows truncated text with "Read more" / "Read less" toggle
 *
 * If text exceeds maxLength (default 350, or mobileMaxLength on small screens),
 * shows truncated version with ellipsis and a "Read more" button.
 * User can click to expand/collapse.
 */
export function TruncatedText({
  text,
  maxLength = 350,
  mobileMaxLength = 100,
  className
}: TruncatedTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile on mount and window resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const effectiveMaxLength = isMobile ? mobileMaxLength : maxLength;
  const needsTruncation = text.length > effectiveMaxLength;

  if (!needsTruncation) {
    return <p className={cn('text-gray-700 leading-relaxed', className)}>{text}</p>;
  }

  const truncatedText = text.slice(0, effectiveMaxLength).trim() + '...';

  return (
    <div className={className}>
      <p className="text-gray-700 leading-relaxed">
        {isExpanded ? text : truncatedText}
      </p>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-2 text-sky-600 hover:text-sky-700 text-sm font-medium focus:outline-none focus:underline"
        aria-expanded={isExpanded}
      >
        {isExpanded ? 'Read less' : 'Read more'}
      </button>
    </div>
  );
}
