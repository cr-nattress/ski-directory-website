/**
 * Log Context & Session Management
 *
 * Provides consistent context for all log entries including:
 * - Anonymous session ID (stored in sessionStorage)
 * - Current page/route information
 * - Browser metadata
 *
 * Privacy-conscious: No PII, no persistent user tracking.
 */

export interface LogContext {
  sessionId: string;
  pageUrl: string;
  referrer: string;
  userAgent: string;
  viewport: { width: number; height: number };
  connectionType?: string;
  timestamp: string;
}

const SESSION_ID_KEY = 'ski-directory-session-id';

/**
 * Generate a random session ID (UUID v4 format)
 */
function generateSessionId(): string {
  // Use crypto.randomUUID if available, otherwise fallback
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Initialize or retrieve the session ID
 * Session ID persists across page navigations within the same browser session
 */
export function initializeSession(): string {
  if (typeof window === 'undefined') {
    return 'server-side';
  }

  try {
    let sessionId = sessionStorage.getItem(SESSION_ID_KEY);

    if (!sessionId) {
      sessionId = generateSessionId();
      sessionStorage.setItem(SESSION_ID_KEY, sessionId);
    }

    return sessionId;
  } catch {
    // sessionStorage may be unavailable (private browsing, etc.)
    return generateSessionId();
  }
}

/**
 * Get the current connection type if available
 */
function getConnectionType(): string | undefined {
  if (typeof navigator === 'undefined') {
    return undefined;
  }

  // Navigator connection API (not available in all browsers)
  const nav = navigator as Navigator & {
    connection?: {
      effectiveType?: string;
      type?: string;
    };
  };

  return nav.connection?.effectiveType || nav.connection?.type;
}

/**
 * Get the current viewport dimensions
 */
function getViewport(): { width: number; height: number } {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

/**
 * Get the full log context for the current environment
 */
export function getLogContext(): LogContext {
  const isServer = typeof window === 'undefined';

  return {
    sessionId: isServer ? 'server-side' : initializeSession(),
    pageUrl: isServer ? '' : window.location.href,
    referrer: isServer ? '' : document.referrer,
    userAgent: isServer ? '' : navigator.userAgent,
    viewport: getViewport(),
    connectionType: getConnectionType(),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get minimal context (for use in batched logs where full context is sent once)
 */
export function getMinimalContext(): Pick<LogContext, 'sessionId' | 'pageUrl' | 'timestamp'> {
  const isServer = typeof window === 'undefined';

  return {
    sessionId: isServer ? 'server-side' : initializeSession(),
    pageUrl: isServer ? '' : window.location.pathname,
    timestamp: new Date().toISOString(),
  };
}
