/**
 * useImpressionTracking Hook
 *
 * React hook for tracking resort card impressions using IntersectionObserver.
 * Automatically tracks when a resort card enters the viewport.
 *
 * Epic 24, Story 12: Engagement Tracking Foundation
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { engagementTracker, EventContext } from '@/lib/tracking/engagement-tracker';

interface ImpressionTrackingOptions {
  /** Context where the card is displayed */
  context?: EventContext;
  /** Section ID for themed sections */
  sectionId?: string;
  /** Position in the list (0-based) */
  positionIndex?: number;
  /** Page number for paginated results */
  pageNumber?: number;
  /** Intersection threshold (0-1) */
  threshold?: number;
  /** Only track if element is visible for this long (ms) */
  minVisibleTime?: number;
}

/**
 * Hook to track impressions for a single resort card
 *
 * @param resortId - The resort's unique ID
 * @param resortSlug - The resort's URL slug
 * @param options - Tracking options
 * @returns ref to attach to the card element
 */
export function useImpressionTracking(
  resortId: string,
  resortSlug: string,
  options: ImpressionTrackingOptions = {}
) {
  const {
    context = 'landing',
    sectionId,
    positionIndex,
    pageNumber,
    threshold = 0.5, // 50% visible
    minVisibleTime = 500, // 500ms minimum
  } = options;

  const elementRef = useRef<HTMLElement | null>(null);
  const visibleStartRef = useRef<number | null>(null);
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || hasTrackedRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry.isIntersecting) {
          // Started being visible
          visibleStartRef.current = Date.now();
        } else if (visibleStartRef.current !== null) {
          // Stopped being visible
          const visibleTime = Date.now() - visibleStartRef.current;

          if (visibleTime >= minVisibleTime && !hasTrackedRef.current) {
            // Track the impression
            engagementTracker.trackImpression(resortId, resortSlug, context, {
              sectionId,
              positionIndex,
              pageNumber,
            });
            hasTrackedRef.current = true;
          }

          visibleStartRef.current = null;
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();

      // If still visible when unmounting, track if threshold met
      if (visibleStartRef.current !== null && !hasTrackedRef.current) {
        const visibleTime = Date.now() - visibleStartRef.current;
        if (visibleTime >= minVisibleTime) {
          engagementTracker.trackImpression(resortId, resortSlug, context, {
            sectionId,
            positionIndex,
            pageNumber,
          });
        }
      }
    };
  }, [resortId, resortSlug, context, sectionId, positionIndex, pageNumber, threshold, minVisibleTime]);

  return elementRef;
}

/**
 * Hook to track clicks on resort cards
 *
 * @param resortId - The resort's unique ID
 * @param resortSlug - The resort's URL slug
 * @param options - Tracking options
 * @returns onClick handler to attach to the card
 */
export function useClickTracking(
  resortId: string,
  resortSlug: string,
  options: Omit<ImpressionTrackingOptions, 'threshold' | 'minVisibleTime'> = {}
) {
  const { context = 'landing', sectionId, positionIndex, pageNumber } = options;

  const handleClick = useCallback(() => {
    engagementTracker.trackClick(resortId, resortSlug, context, {
      sectionId,
      positionIndex,
      pageNumber,
    });
  }, [resortId, resortSlug, context, sectionId, positionIndex, pageNumber]);

  return handleClick;
}

/**
 * Combined hook for both impression and click tracking
 *
 * @param resortId - The resort's unique ID
 * @param resortSlug - The resort's URL slug
 * @param options - Tracking options
 * @returns { ref, onClick } to attach to the card element
 */
export function useResortTracking(
  resortId: string,
  resortSlug: string,
  options: ImpressionTrackingOptions = {}
) {
  const ref = useImpressionTracking(resortId, resortSlug, options);
  const onClick = useClickTracking(resortId, resortSlug, options);

  return { ref, onClick };
}
