'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Options for the useIntersectionObserver hook
 */
interface UseIntersectionObserverOptions {
  /** Threshold(s) at which to trigger callback (0-1) */
  threshold?: number | number[];
  /** Margin around the root element */
  rootMargin?: string;
  /** Whether the observer is enabled */
  enabled?: boolean;
  /** Only trigger once when element becomes visible */
  triggerOnce?: boolean;
}

/**
 * Result from the useIntersectionObserver hook
 */
interface UseIntersectionObserverResult<T extends HTMLElement> {
  /** Ref to attach to the element to observe */
  ref: React.RefObject<T>;
  /** Whether the element is currently intersecting */
  isIntersecting: boolean;
  /** The IntersectionObserverEntry if available */
  entry: IntersectionObserverEntry | null;
}

/**
 * Hook to observe when an element enters or leaves the viewport
 *
 * @param options - Configuration options
 * @returns Object with ref to attach and intersection state
 *
 * @example
 * ```tsx
 * function LoadMoreTrigger({ onLoadMore }: { onLoadMore: () => void }) {
 *   const { ref, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
 *     rootMargin: '200px',
 *     enabled: hasMore,
 *   });
 *
 *   useEffect(() => {
 *     if (isIntersecting) {
 *       onLoadMore();
 *     }
 *   }, [isIntersecting, onLoadMore]);
 *
 *   return <div ref={ref} />;
 * }
 * ```
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLDivElement>(
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverResult<T> {
  const {
    threshold = 0,
    rootMargin = '0px',
    enabled = true,
    triggerOnce = false,
  } = options;

  const ref = useRef<T>(null);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [hasTriggered, setHasTriggered] = useState(false);

  // Track if we should stop observing (for triggerOnce)
  const frozen = triggerOnce && hasTriggered;

  useEffect(() => {
    // Skip if not enabled, no element, or already triggered (for triggerOnce)
    if (!enabled || !ref.current || frozen) {
      return;
    }

    // Check for IntersectionObserver support (SSR safety)
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      ([observerEntry]) => {
        setEntry(observerEntry);

        if (observerEntry.isIntersecting && triggerOnce) {
          setHasTriggered(true);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [enabled, frozen, rootMargin, threshold, triggerOnce]);

  const isIntersecting = entry?.isIntersecting ?? false;

  return {
    ref,
    isIntersecting,
    entry,
  };
}

/**
 * Simpler hook that just calls a callback when element becomes visible
 *
 * @param callback - Function to call when element enters viewport
 * @param options - Configuration options
 * @returns Ref to attach to the sentinel element
 *
 * @example
 * ```tsx
 * function InfiniteList({ loadMore, hasMore }) {
 *   const sentinelRef = useIntersectionCallback(
 *     () => loadMore(),
 *     { enabled: hasMore, rootMargin: '200px' }
 *   );
 *
 *   return (
 *     <>
 *       {items.map(item => <Item key={item.id} {...item} />)}
 *       <div ref={sentinelRef} />
 *     </>
 *   );
 * }
 * ```
 */
export function useIntersectionCallback<T extends HTMLElement = HTMLDivElement>(
  callback: () => void,
  options: Omit<UseIntersectionObserverOptions, 'triggerOnce'> = {}
): React.RefObject<T> {
  const { threshold = 0, rootMargin = '0px', enabled = true } = options;

  const ref = useRef<T>(null);
  const callbackRef = useRef(callback);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || !ref.current) {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          callbackRef.current();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [enabled, rootMargin, threshold]);

  return ref;
}
