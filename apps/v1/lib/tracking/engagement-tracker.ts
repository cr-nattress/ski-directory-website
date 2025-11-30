/**
 * Engagement Tracker
 *
 * Client-side service for tracking user engagement with resorts.
 * Uses IntersectionObserver for impression tracking.
 * Batches events for efficient API calls.
 *
 * Privacy-conscious: no PII, anonymous session IDs only.
 *
 * Epic 24, Story 12: Engagement Tracking Foundation
 */

import { featureFlags } from '@/lib/config/feature-flags';

/**
 * Event types
 */
export type EventType = 'impression' | 'click' | 'dwell';

/**
 * Context where event occurred
 */
export type EventContext = 'landing' | 'directory' | 'search' | 'themed_section' | 'map';

/**
 * Engagement event to be logged
 */
export interface EngagementEvent {
  resort_id: string;
  resort_slug: string;
  event_type: EventType;
  context?: EventContext;
  section_id?: string;
  position_index?: number;
  page_number?: number;
  session_id?: string;
  dwell_seconds?: number;
}

/**
 * Configuration for the tracker
 */
interface TrackerConfig {
  // Batch events and send periodically
  batchSize: number;
  batchIntervalMs: number;

  // API endpoint
  apiEndpoint: string;

  // Enable/disable tracking
  enabled: boolean;
}

const DEFAULT_CONFIG: TrackerConfig = {
  batchSize: 20,
  batchIntervalMs: 5000, // 5 seconds
  apiEndpoint: '/api/engagement',
  enabled: true,
};

/**
 * Generate an anonymous session ID
 * Stored in sessionStorage, so it persists within a browser session
 * but not across sessions (privacy-friendly)
 */
function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';

  const key = 'ski_session_id';
  let sessionId = sessionStorage.getItem(key);

  if (!sessionId) {
    // Generate a random session ID (not tied to user identity)
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    sessionStorage.setItem(key, sessionId);
  }

  return sessionId;
}

/**
 * Engagement Tracker Singleton
 */
class EngagementTrackerService {
  private config: TrackerConfig;
  private eventQueue: EngagementEvent[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private sessionId: string = '';
  private trackedImpressions: Set<string> = new Set();

  constructor(config: Partial<TrackerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Initialize on client side only
    if (typeof window !== 'undefined') {
      this.sessionId = getOrCreateSessionId();
      this.startBatchTimer();

      // Flush on page unload
      window.addEventListener('beforeunload', () => {
        this.flush();
      });

      // Flush on visibility change (tab switch)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.flush();
        }
      });
    }
  }

  /**
   * Check if tracking is enabled
   */
  isEnabled(): boolean {
    // Check feature flag
    if (!featureFlags.engagementTracking) {
      return false;
    }
    return this.config.enabled;
  }

  /**
   * Start the batch flush timer
   */
  private startBatchTimer(): void {
    if (this.flushTimer) return;

    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.batchIntervalMs);
  }

  /**
   * Stop the batch flush timer
   */
  private stopBatchTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Add an event to the queue
   */
  private queueEvent(event: Omit<EngagementEvent, 'session_id'>): void {
    if (!this.isEnabled()) return;

    this.eventQueue.push({
      ...event,
      session_id: this.sessionId,
    });

    // Flush if batch size reached
    if (this.eventQueue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  /**
   * Flush queued events to the API
   */
  async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // Use sendBeacon for reliability during page unload
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const blob = new Blob(
          [JSON.stringify({ events })],
          { type: 'application/json' }
        );
        navigator.sendBeacon(this.config.apiEndpoint, blob);
      } else {
        // Fallback to fetch
        await fetch(this.config.apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events }),
        });
      }
    } catch (error) {
      // Re-queue events on failure (up to a limit)
      if (this.eventQueue.length < this.config.batchSize * 3) {
        this.eventQueue.push(...events);
      }
      console.warn('Failed to flush engagement events:', error);
    }
  }

  /**
   * Track an impression (resort card appeared in viewport)
   * Deduplicates within the same session
   */
  trackImpression(
    resortId: string,
    resortSlug: string,
    context: EventContext = 'landing',
    options: {
      sectionId?: string;
      positionIndex?: number;
      pageNumber?: number;
    } = {}
  ): void {
    // Deduplicate impressions within session
    const key = `${resortId}-${context}-${options.sectionId || 'main'}`;
    if (this.trackedImpressions.has(key)) return;
    this.trackedImpressions.add(key);

    this.queueEvent({
      resort_id: resortId,
      resort_slug: resortSlug,
      event_type: 'impression',
      context,
      section_id: options.sectionId,
      position_index: options.positionIndex,
      page_number: options.pageNumber,
    });
  }

  /**
   * Track a click (user clicked on resort card)
   */
  trackClick(
    resortId: string,
    resortSlug: string,
    context: EventContext = 'landing',
    options: {
      sectionId?: string;
      positionIndex?: number;
      pageNumber?: number;
    } = {}
  ): void {
    this.queueEvent({
      resort_id: resortId,
      resort_slug: resortSlug,
      event_type: 'click',
      context,
      section_id: options.sectionId,
      position_index: options.positionIndex,
      page_number: options.pageNumber,
    });

    // Flush immediately on click for better accuracy
    this.flush();
  }

  /**
   * Track dwell time (time spent on resort detail page)
   */
  trackDwell(
    resortId: string,
    resortSlug: string,
    dwellSeconds: number,
    context: EventContext = 'landing'
  ): void {
    // Only track meaningful dwell times (> 2 seconds)
    if (dwellSeconds < 2) return;

    this.queueEvent({
      resort_id: resortId,
      resort_slug: resortSlug,
      event_type: 'dwell',
      context,
      dwell_seconds: Math.round(dwellSeconds),
    });
  }

  /**
   * Clear tracked impressions (call on navigation)
   */
  clearImpressions(): void {
    this.trackedImpressions.clear();
  }

  /**
   * Cleanup (call on unmount)
   */
  destroy(): void {
    this.stopBatchTimer();
    this.flush();
  }
}

// Export singleton instance
export const engagementTracker = new EngagementTrackerService();

// Export class for testing
export { EngagementTrackerService };
