/**
 * @module Utils
 * @purpose General utility functions for the application
 * @context Shared helpers for styling, formatting, and localStorage
 *
 * @exports
 * - cn: Tailwind class name merger (clsx + tailwind-merge)
 * - Formatters: formatNumber, formatSnowfall, formatDistance, formatRating
 * - Alert utilities: getDismissedAlertIds, addDismissedAlertId, clearDismissedAlerts
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names with intelligent conflict resolution
 *
 * @param inputs - Class values (strings, arrays, objects)
 * @returns Merged class string with conflicts resolved
 *
 * @example
 * cn('px-2 py-1', 'px-4') // => 'py-1 px-4' (px-4 wins)
 * cn('text-red-500', condition && 'text-blue-500')
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format number with locale-appropriate separators */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/** Format snowfall in inches (e.g., '6" new' or 'No new snow') */
export function formatSnowfall(inches: number): string {
  if (inches === 0) return 'No new snow';
  return `${inches}" new`;
}

/** Format distance in miles (e.g., '75 mi') */
export function formatDistance(miles: number): string {
  return `${miles} mi`;
}

/** Format rating to one decimal place (e.g., '4.5') */
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

// ============================================
// Alert Dismissal localStorage Utilities
// ============================================

const DISMISSED_ALERTS_KEY = 'skidirectory_dismissed_alerts';

interface DismissedAlert {
  id: string;
  dismissedAt: string;
}

/**
 * Get list of dismissed alert IDs from localStorage
 * Automatically cleans up expired dismissals (older than 7 days)
 */
export function getDismissedAlertIds(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(DISMISSED_ALERTS_KEY);
    if (!stored) return [];

    const dismissals: DismissedAlert[] = JSON.parse(stored);
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Filter out old dismissals
    const validDismissals = dismissals.filter(
      (d) => new Date(d.dismissedAt) > sevenDaysAgo
    );

    // Update storage if we cleaned up any
    if (validDismissals.length !== dismissals.length) {
      localStorage.setItem(DISMISSED_ALERTS_KEY, JSON.stringify(validDismissals));
    }

    return validDismissals.map((d) => d.id);
  } catch {
    return [];
  }
}

/**
 * Add an alert ID to the dismissed list
 */
export function addDismissedAlertId(alertId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const currentIds = getDismissedAlertIds();
    if (currentIds.includes(alertId)) return;

    const stored = localStorage.getItem(DISMISSED_ALERTS_KEY);
    const dismissals: DismissedAlert[] = stored ? JSON.parse(stored) : [];

    dismissals.push({
      id: alertId,
      dismissedAt: new Date().toISOString(),
    });

    localStorage.setItem(DISMISSED_ALERTS_KEY, JSON.stringify(dismissals));
  } catch {
    // Silently fail - localStorage might be full or disabled
  }
}

/**
 * Clear all dismissed alerts (useful for testing)
 */
export function clearDismissedAlerts(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(DISMISSED_ALERTS_KEY);
}
