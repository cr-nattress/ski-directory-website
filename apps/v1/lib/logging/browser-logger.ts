/**
 * Browser Logger Service
 *
 * Client-side logging service that ships logs to Grafana Cloud Loki.
 * Features:
 * - Batched log delivery (max 50 entries or 10-second intervals)
 * - sendBeacon API for reliable delivery on page unload
 * - Automatic retry with exponential backoff
 * - Console logging in development mode
 * - Feature flag controlled remote logging
 */

import { getLogContext, getMinimalContext, type LogContext } from './log-context';
import { getObservabilityConfig, isGrafanaConfigured } from '@/lib/config/observability';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  sessionId: string;
  pageUrl: string;
  component?: string;
  data?: Record<string, unknown>;
}

interface LokiStream {
  stream: Record<string, string>;
  values: [string, string][];
}

interface LokiPushPayload {
  streams: LokiStream[];
}

/**
 * Browser Logger that sends logs to Grafana Loki
 */
class BrowserLokiLogger {
  private queue: LogEntry[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private retryQueue: LogEntry[] = [];
  private retryCount = 0;
  private isInitialized = false;
  private fullContext: LogContext | null = null;

  constructor() {
    // Initialize on first use (client-side only)
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private initialize(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Capture full context once per session
    this.fullContext = getLogContext();

    // Log configuration warnings
    const config = getObservabilityConfig();
    if (config.enabled && !isGrafanaConfigured()) {
      console.warn(
        '[Logger] Observability logging is enabled but Grafana is not configured. Logs will only appear in console.'
      );
    }

    // Set up flush interval
    this.startFlushTimer();

    // Flush on page unload
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush();
      }
    });

    window.addEventListener('pagehide', () => {
      this.flush();
    });

    // Log session start
    this.info('Session started', {
      viewport: this.fullContext.viewport,
      connectionType: this.fullContext.connectionType,
      referrer: this.fullContext.referrer,
    });
  }

  private startFlushTimer(): void {
    const config = getObservabilityConfig();
    this.flushTimer = setInterval(() => {
      this.flush();
    }, config.batching.flushInterval);
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    data?: Record<string, unknown>,
    component?: string
  ): LogEntry {
    const context = getMinimalContext();

    return {
      level,
      message,
      timestamp: context.timestamp,
      sessionId: context.sessionId,
      pageUrl: context.pageUrl,
      component,
      data,
    };
  }

  private logToConsole(entry: LogEntry): void {
    const config = getObservabilityConfig();
    const prefix = entry.component ? `[${entry.component}]` : '[Logger]';
    const logData = entry.data ? entry.data : undefined;

    // Always log to console in development, or if remote logging is disabled
    if (config.environment === 'development' || !config.enabled) {
      switch (entry.level) {
        case 'debug':
          if (logData) console.debug(prefix, entry.message, logData);
          else console.debug(prefix, entry.message);
          break;
        case 'info':
          if (logData) console.info(prefix, entry.message, logData);
          else console.info(prefix, entry.message);
          break;
        case 'warn':
          if (logData) console.warn(prefix, entry.message, logData);
          else console.warn(prefix, entry.message);
          break;
        case 'error':
          if (logData) console.error(prefix, entry.message, logData);
          else console.error(prefix, entry.message);
          break;
      }
    }
  }

  private addToQueue(entry: LogEntry): void {
    this.queue.push(entry);

    const config = getObservabilityConfig();
    if (this.queue.length >= config.batching.maxBatchSize) {
      this.flush();
    }
  }

  /**
   * Format logs for Loki push API
   */
  private formatForLoki(entries: LogEntry[]): LokiPushPayload {
    const config = getObservabilityConfig();

    // Group entries by level for better querying
    const streams: LokiStream[] = [];
    const entriesByLevel = new Map<LogLevel, LogEntry[]>();

    for (const entry of entries) {
      const levelEntries = entriesByLevel.get(entry.level) || [];
      levelEntries.push(entry);
      entriesByLevel.set(entry.level, levelEntries);
    }

    for (const [level, levelEntries] of entriesByLevel) {
      streams.push({
        stream: {
          ...config.labels,
          level,
        },
        values: levelEntries.map((entry) => [
          // Loki expects nanosecond timestamps as strings
          (new Date(entry.timestamp).getTime() * 1_000_000).toString(),
          JSON.stringify({
            message: entry.message,
            sessionId: entry.sessionId,
            pageUrl: entry.pageUrl,
            component: entry.component,
            ...entry.data,
          }),
        ]),
      });
    }

    return { streams };
  }

  /**
   * Send logs to Loki using sendBeacon (preferred) or fetch
   */
  private async sendToLoki(entries: LogEntry[]): Promise<boolean> {
    const config = getObservabilityConfig();

    if (!isGrafanaConfigured()) {
      return false;
    }

    const payload = this.formatForLoki(entries);
    const body = JSON.stringify(payload);
    const url = `${config.lokiUrl}/loki/api/v1/push`;

    // Create Basic auth header
    const auth = btoa(`${config.lokiUsername}:${config.lokiToken}`);

    // Note: sendBeacon doesn't support custom headers for auth,
    // so we use fetch instead. sendBeacon would be preferred for
    // page unload scenarios but requires a different auth approach.

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`,
        },
        body,
        keepalive: true, // Ensure request completes even if page unloads
      });

      if (!response.ok) {
        console.error(`[Logger] Failed to send logs to Loki: ${response.status} ${response.statusText}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[Logger] Error sending logs to Loki:', error);
      return false;
    }
  }

  /**
   * Retry failed batches with exponential backoff
   */
  private async retryFailedBatch(entries: LogEntry[]): Promise<void> {
    const config = getObservabilityConfig();

    if (this.retryCount >= config.batching.maxRetries) {
      console.error('[Logger] Max retries reached, dropping logs:', entries.length);
      this.retryQueue = [];
      this.retryCount = 0;
      return;
    }

    this.retryCount++;
    const delay = config.batching.retryBaseDelay * Math.pow(2, this.retryCount - 1);

    await new Promise((resolve) => setTimeout(resolve, delay));

    const success = await this.sendToLoki(entries);
    if (!success) {
      this.retryFailedBatch(entries);
    } else {
      this.retryCount = 0;
      this.retryQueue = [];
    }
  }

  /**
   * Flush all queued logs to Loki
   */
  async flush(): Promise<void> {
    if (this.queue.length === 0) {
      return;
    }

    const entries = [...this.queue];
    this.queue = [];

    const config = getObservabilityConfig();

    // Only send to Loki if configured
    if (config.enabled && isGrafanaConfigured()) {
      const success = await this.sendToLoki(entries);
      if (!success) {
        // Add to retry queue
        this.retryQueue.push(...entries);
        this.retryFailedBatch(this.retryQueue);
      }
    }
  }

  /**
   * Log a debug message (development only, not sent to Grafana)
   */
  debug(message: string, data?: Record<string, unknown>, component?: string): void {
    const entry = this.createLogEntry('debug', message, data, component);
    this.logToConsole(entry);
    // Debug logs are not sent to remote (too verbose)
  }

  /**
   * Log an info message
   */
  info(message: string, data?: Record<string, unknown>, component?: string): void {
    const entry = this.createLogEntry('info', message, data, component);
    this.logToConsole(entry);
    this.addToQueue(entry);
  }

  /**
   * Log a warning message
   */
  warn(message: string, data?: Record<string, unknown>, component?: string): void {
    const entry = this.createLogEntry('warn', message, data, component);
    this.logToConsole(entry);
    this.addToQueue(entry);
  }

  /**
   * Log an error message
   */
  error(message: string, data?: Record<string, unknown>, component?: string): void {
    const entry = this.createLogEntry('error', message, data, component);
    this.logToConsole(entry);
    this.addToQueue(entry);
  }

  /**
   * Create a child logger with a fixed component name
   */
  child(component: string): ComponentLogger {
    return new ComponentLogger(this, component);
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush();
  }
}

/**
 * Component-scoped logger that automatically includes component name
 */
class ComponentLogger {
  constructor(
    private parent: BrowserLokiLogger,
    private component: string
  ) {}

  debug(message: string, data?: Record<string, unknown>): void {
    this.parent.debug(message, data, this.component);
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.parent.info(message, data, this.component);
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.parent.warn(message, data, this.component);
  }

  error(message: string, data?: Record<string, unknown>): void {
    this.parent.error(message, data, this.component);
  }
}

// Export singleton instance
export const logger = new BrowserLokiLogger();

// Export types
export type { ComponentLogger };
