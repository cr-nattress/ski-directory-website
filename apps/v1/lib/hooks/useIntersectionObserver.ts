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
  ref: React.RefCallback<T>;
  /** Whether the element is currently intersecting */
  isIntersecting: boolean;
  /** The IntersectionObserverEntry if available */
  entry: IntersectionObserverEntry | null;
}

/**
 * Hook to observe when an element enters or leaves the viewport
 *
 * Uses a callback ref pattern to properly handle conditionally rendered elements.
 *
 * @param options - Configuration options
 * @returns Object with ref to attach and intersection state
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

  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [hasTriggered, setHasTriggered] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementRef = useRef<T | null>(null);

  // Track if we should stop observing (for triggerOnce)
  const frozen = triggerOnce && hasTriggered;

  // Cleanup function
  const cleanup = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);

  // Create observer
  const createObserver = useCallback(() => {
    // Skip if not enabled or already triggered (for triggerOnce)
    if (!enabled || frozen) {
      return null;
    }

    // Check for IntersectionObserver support (SSR safety)
    if (typeof IntersectionObserver === 'undefined') {
      return null;
    }

    return new IntersectionObserver(
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
  }, [enabled, frozen, rootMargin, threshold, triggerOnce]);

  // Callback ref - called when element is mounted/unmounted
  const ref = useCallback(
    (node: T | null) => {
      // Cleanup previous observer
      cleanup();

      // Store the element reference
      elementRef.current = node;

      // If we have a node and should observe, create new observer
      if (node && enabled && !frozen) {
        observerRef.current = createObserver();
        if (observerRef.current) {
          observerRef.current.observe(node);
        }
      }
    },
    [cleanup, createObserver, enabled, frozen]
  );

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Re-observe when options change
  useEffect(() => {
    // Re-attach observer when options change and we have an element
    if (elementRef.current && enabled && !frozen) {
      cleanup();
      observerRef.current = createObserver();
      if (observerRef.current) {
        observerRef.current.observe(elementRef.current);
      }
    }
  }, [enabled, frozen, rootMargin, threshold, cleanup, createObserver]);

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
 * @returns Ref callback to attach to the sentinel element
 */
export function useIntersectionCallback<T extends HTMLElement = HTMLDivElement>(
  callback: () => void,
  options: Omit<UseIntersectionObserverOptions, 'triggerOnce'> = {}
): React.RefCallback<T> {
  const { threshold = 0, rootMargin = '0px', enabled = true } = options;

  const callbackRef = useRef(callback);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Callback ref - called when element is mounted/unmounted
  const ref = useCallback(
    (node: T | null) => {
      // Cleanup previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      // If we have a node and should observe
      if (node && enabled) {
        if (typeof IntersectionObserver === 'undefined') {
          return;
        }

        observerRef.current = new IntersectionObserver(
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

        observerRef.current.observe(node);
      }
    },
    [enabled, rootMargin, threshold]
  );

  return ref;
}
