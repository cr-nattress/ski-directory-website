# Epic 25: Grafana Cloud Observability for UI

## Overview

Implement comprehensive observability for the ski resort directory frontend using Grafana Cloud. This includes structured logging with info/warn/error levels, performance monitoring, error tracking, and real-time dashboards for monitoring application health.

**Current State:**
- Ad-hoc `console.error()` calls scattered throughout codebase
- Existing engagement tracking system (impressions/clicks) in `lib/tracking/`
- No centralized logging infrastructure
- No performance monitoring or error aggregation
- No external observability platform integration

**Goal State:**
- Centralized logging service with structured JSON logs
- All logs shipped to Grafana Cloud Loki
- Info/warn/error logging throughout UI components and hooks
- Performance tracking for API calls and Core Web Vitals
- Error boundary with automatic error reporting
- Real-time Grafana dashboards for monitoring
- Alerting for critical errors and performance degradation

---

## Architecture Decisions

### Logging Infrastructure

Based on the Grafana implementation guide, we'll implement:

| Component | Location | Purpose |
|-----------|----------|---------|
| `BrowserLogger` | `lib/logging/browser-logger.ts` | Client-side log collection & batching |
| `LogContext` | `lib/logging/log-context.ts` | Session/request context management |
| `useLogger` | `lib/hooks/useLogger.ts` | React hook for component logging |
| `ErrorBoundary` | `components/ErrorBoundary.tsx` | Catch & report React errors |
| `PerformanceMonitor` | `lib/logging/performance.ts` | Core Web Vitals & API timing |

### Log Levels

| Level | When to Use | Example |
|-------|-------------|---------|
| `debug` | Development only, verbose details | "Fetching resorts with filters: {...}" |
| `info` | Normal operations, business events | "Resort search completed: 45 results" |
| `warn` | Recoverable issues, degraded state | "Image failed to load, using placeholder" |
| `error` | Failures requiring attention | "API request failed: 500 Internal Server Error" |

### Environment Configuration

```env
# Grafana Cloud Loki Configuration
NEXT_PUBLIC_GRAFANA_LOKI_URL=https://logs-prod-XXX.grafana.net
NEXT_PUBLIC_GRAFANA_LOKI_USERNAME=your-username
NEXT_PUBLIC_GRAFANA_LOKI_API_TOKEN=glc_your-token
NEXT_PUBLIC_GRAFANA_APP_NAME=ski-directory-ui
```

### Feature Flag

- `observabilityLogging: false` (default off during development)
- Easy toggle to enable/disable log shipping to Grafana

---

## Phased Implementation

### Phase 1: Foundation (Stories 1-3)
Set up core logging infrastructure and Grafana integration.

### Phase 2: Hook & Service Logging (Stories 4-6)
Add logging to data fetching hooks and API services.

### Phase 3: Component Logging (Stories 7-9)
Add logging to UI components, error boundaries, and user interactions.

### Phase 4: Performance & Dashboards (Stories 10-12)
Implement performance monitoring and create Grafana dashboards.

---

## User Stories

---

### Story 1: Browser Logger Service
**Phase 1 | Priority: High | Estimate: 5 points**

**As a** developer
**I want** a centralized browser logging service that ships logs to Grafana Loki
**So that** I can monitor application behavior in production

#### Acceptance Criteria
- [ ] Create `lib/logging/browser-logger.ts` with BrowserLokiLogger class
- [ ] Implement log levels: debug, info, warn, error
- [ ] Batch logs (max 50 events or 10-second intervals)
- [ ] Use `sendBeacon` API for reliable delivery on page unload
- [ ] Fallback to `fetch` with `keepalive: true`
- [ ] Include structured metadata: timestamp, level, session ID, page URL
- [ ] Respect feature flag for enabling/disabling remote logging
- [ ] Always log to console in development mode
- [ ] Re-queue failed batches (up to 3 retries with exponential backoff)

#### Technical Notes
```typescript
interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  sessionId: string;
  pageUrl: string;
  data?: Record<string, unknown>;
}

class BrowserLokiLogger {
  debug(message: string, data?: Record<string, unknown>): void;
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, data?: Record<string, unknown>): void;
  flush(): Promise<void>;
}

export const logger: BrowserLokiLogger;
```

#### Verification
- [ ] Logs appear in browser console during development
- [ ] Logs ship to Grafana Loki when feature flag enabled
- [ ] Batch timing and size limits work correctly
- [ ] Page unload triggers flush via sendBeacon

---

### Story 2: Log Context & Session Management
**Phase 1 | Priority: High | Estimate: 3 points**

**As a** developer
**I want** consistent context attached to all logs
**So that** I can trace issues across a user session

#### Acceptance Criteria
- [ ] Create `lib/logging/log-context.ts` for session management
- [ ] Generate anonymous session ID (stored in sessionStorage)
- [ ] Track current page/route automatically
- [ ] Include browser metadata: userAgent, viewport size, connection type
- [ ] Privacy-conscious: no PII, no persistent user tracking
- [ ] Context automatically attached to all log entries

#### Technical Notes
```typescript
interface LogContext {
  sessionId: string;
  pageUrl: string;
  referrer: string;
  userAgent: string;
  viewport: { width: number; height: number };
  connectionType?: string;
  timestamp: string;
}

function getLogContext(): LogContext;
function initializeSession(): string;
```

#### Verification
- [ ] Session ID persists across page navigations
- [ ] New session ID generated for new browser sessions
- [ ] Context fields populated correctly
- [ ] No PII in context data

---

### Story 3: Environment Configuration & Feature Flag
**Phase 1 | Priority: High | Estimate: 2 points**

**As a** developer
**I want** environment-based configuration for Grafana logging
**So that** I can easily toggle logging and configure credentials

#### Acceptance Criteria
- [ ] Add environment variables to `.env.example`
- [ ] Create `lib/config/observability.ts` for configuration
- [ ] Add `observabilityLogging` feature flag (default: false)
- [ ] Validate configuration on app startup
- [ ] Log warning if credentials missing when flag enabled
- [ ] Support different Loki endpoints per environment

#### Technical Notes
```typescript
// lib/config/observability.ts
export const observabilityConfig = {
  enabled: featureFlags.observabilityLogging,
  lokiUrl: process.env.NEXT_PUBLIC_GRAFANA_LOKI_URL,
  lokiUsername: process.env.NEXT_PUBLIC_GRAFANA_LOKI_USERNAME,
  lokiToken: process.env.NEXT_PUBLIC_GRAFANA_LOKI_API_TOKEN,
  appName: process.env.NEXT_PUBLIC_GRAFANA_APP_NAME || 'ski-directory-ui',
  environment: process.env.NODE_ENV,
  labels: {
    app: 'ski-directory-ui',
    source: 'browser',
    environment: process.env.NODE_ENV,
  },
};
```

#### Verification
- [ ] App starts without Grafana credentials (graceful degradation)
- [ ] Feature flag correctly enables/disables logging
- [ ] Environment variables read correctly
- [ ] Warning logged if misconfigured

---

### Story 4: useLogger React Hook
**Phase 2 | Priority: High | Estimate: 3 points**

**As a** developer
**I want** a React hook for logging within components
**So that** logging is easy and consistent across the UI

#### Acceptance Criteria
- [ ] Create `lib/hooks/useLogger.ts`
- [ ] Hook accepts component name for automatic context
- [ ] Returns typed logging methods: debug, info, warn, error
- [ ] Automatically includes component name in logs
- [ ] Supports additional context per log call
- [ ] Memoized to prevent unnecessary re-renders

#### Technical Notes
```typescript
interface UseLoggerOptions {
  component: string;
  context?: Record<string, unknown>;
}

interface Logger {
  debug: (message: string, data?: Record<string, unknown>) => void;
  info: (message: string, data?: Record<string, unknown>) => void;
  warn: (message: string, data?: Record<string, unknown>) => void;
  error: (message: string, data?: Record<string, unknown>) => void;
}

function useLogger(options: UseLoggerOptions): Logger;

// Usage
function ResortCard({ resort }) {
  const log = useLogger({ component: 'ResortCard' });

  useEffect(() => {
    log.info('Resort card rendered', { resortId: resort.id });
  }, []);
}
```

#### Verification
- [ ] Hook works in client components
- [ ] Component name appears in logs
- [ ] No performance impact from logging
- [ ] TypeScript types are correct

---

### Story 5: Data Fetching Hook Logging
**Phase 2 | Priority: High | Estimate: 4 points**

**As a** developer
**I want** comprehensive logging in data fetching hooks
**So that** I can monitor API performance and errors

#### Acceptance Criteria
- [ ] Add logging to `useRankedResorts.ts`:
  - Info: fetch started, fetch completed (with count, duration)
  - Warn: slow response (>2s), retry attempts
  - Error: fetch failed (with error details)
- [ ] Add logging to `useThemedResorts.ts` (same pattern)
- [ ] Add logging to `useResorts.ts` (same pattern)
- [ ] Add logging to `useResort.ts` (same pattern)
- [ ] Add logging to `useResortSearch.ts` (same pattern)
- [ ] Include timing metrics: request duration in ms
- [ ] Include result metrics: count, hasMore, page number

#### Technical Notes
```typescript
// Example in useRankedResorts.ts
const log = useLogger({ component: 'useRankedResorts' });

const fetchPage = async (page: number) => {
  const startTime = performance.now();
  log.info('Fetching ranked resorts', { page, pageSize });

  try {
    const result = await supabase.from('resorts_ranked')...;
    const duration = Math.round(performance.now() - startTime);

    log.info('Fetch completed', {
      page,
      count: result.data?.length,
      totalCount: result.count,
      durationMs: duration
    });

    if (duration > 2000) {
      log.warn('Slow response detected', { durationMs: duration });
    }
  } catch (error) {
    log.error('Fetch failed', {
      page,
      error: error.message,
      code: error.code
    });
  }
};
```

#### Verification
- [ ] All hooks log start/complete/error appropriately
- [ ] Duration tracked correctly
- [ ] Slow response warnings appear for >2s requests
- [ ] Error details captured without sensitive data

---

### Story 6: API Service Logging
**Phase 2 | Priority: Medium | Estimate: 3 points**

**As a** developer
**I want** logging in API service layer
**So that** I can trace issues in data transformation and queries

#### Acceptance Criteria
- [ ] Add logging to `lib/api/supabase-resort-service.ts`
- [ ] Add logging to `lib/api/themed-resorts-service.ts`
- [ ] Add logging to `lib/api/resort-service.ts`
- [ ] Log: query execution, row counts, cache behavior
- [ ] Error logging with query context (not full query for security)
- [ ] Replace existing `console.error` calls with structured logging

#### Technical Notes
```typescript
// lib/api/supabase-resort-service.ts
import { logger } from '@/lib/logging/browser-logger';

export async function getResortBySlug(slug: string) {
  logger.info('Fetching resort by slug', { slug });

  const { data, error } = await supabase
    .from('resorts_full')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    logger.error('Resort fetch failed', {
      slug,
      errorCode: error.code,
      errorMessage: error.message
    });
    return null;
  }

  logger.info('Resort fetched successfully', { slug, hasData: !!data });
  return data;
}
```

#### Verification
- [ ] All console.error calls replaced
- [ ] Query context logged without exposing sensitive data
- [ ] Error codes and messages captured
- [ ] No breaking changes to existing functionality

---

### Story 7: Error Boundary Component
**Phase 3 | Priority: High | Estimate: 4 points**

**As a** user
**I want** graceful error handling when something goes wrong
**So that** I see a helpful message instead of a broken page

**As a** developer
**I want** automatic error reporting to Grafana
**So that** I'm aware of production errors

#### Acceptance Criteria
- [ ] Create `components/ErrorBoundary.tsx` React error boundary
- [ ] Catch JavaScript errors in component tree
- [ ] Display user-friendly error message
- [ ] Provide "Try Again" button to reset
- [ ] Log full error details to Grafana:
  - Error message and stack trace
  - Component stack
  - Current route/page
  - User session context
- [ ] Wrap main app layout with error boundary
- [ ] Create fallback UI component

#### Technical Notes
```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorInfo {
  componentStack: string;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, State> {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('React error boundary caught error', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      route: window.location.pathname,
    });
  }
}
```

#### Verification
- [ ] Errors caught and logged
- [ ] User sees friendly error UI
- [ ] "Try Again" resets error state
- [ ] Child component errors don't crash entire app
- [ ] Error details appear in Grafana

---

### Story 8: Component Interaction Logging
**Phase 3 | Priority: Medium | Estimate: 3 points**

**As a** developer
**I want** to log significant user interactions
**So that** I can understand user behavior and debug issues

#### Acceptance Criteria
- [ ] Add logging to `ViewToggle` component (cards/map switch)
- [ ] Add logging to category chip selection
- [ ] Add logging to search form interactions
- [ ] Add logging to resort card clicks
- [ ] Add logging to infinite scroll triggers
- [ ] All logs include relevant context (selected value, page, etc.)

#### Technical Notes
```typescript
// Example in ViewToggle.tsx
const log = useLogger({ component: 'ViewToggle' });

const handleModeChange = (newMode: ViewMode) => {
  log.info('View mode changed', {
    previousMode: mode,
    newMode,
    page: 'landing'
  });
  setMode(newMode);
};
```

#### Verification
- [ ] User interactions logged with context
- [ ] Logs don't impact UI performance
- [ ] No excessive logging (avoid logging every keystroke)
- [ ] Privacy maintained (no logging of search queries with PII)

---

### Story 9: Image Loading & Fallback Logging
**Phase 3 | Priority: Low | Estimate: 2 points**

**As a** developer
**I want** to log image loading failures
**So that** I can identify broken images and CDN issues

#### Acceptance Criteria
- [ ] Add logging to `ResortCard` image error handler
- [ ] Add logging to `ResortRowCard` image error handler
- [ ] Log: image URL, resort ID, fallback used
- [ ] Aggregate similar errors (don't log every failed image load)
- [ ] Track image load success rate as metric

#### Technical Notes
```typescript
// In ResortCard.tsx
const log = useLogger({ component: 'ResortCard' });

useEffect(() => {
  const img = new Image();
  img.onerror = () => {
    log.warn('Image failed to load, using placeholder', {
      resortId: resort.id,
      imageUrl: originalImageUrl,
      fallbackUsed: PLACEHOLDER_IMAGE,
    });
    setImageUrl(PLACEHOLDER_IMAGE);
  };
  img.src = originalImageUrl;
}, [originalImageUrl]);
```

#### Verification
- [ ] Failed image loads logged
- [ ] Successful loads not logged (reduce noise)
- [ ] Resort context included
- [ ] No duplicate logs for same image

---

### Story 10: Performance Monitoring
**Phase 4 | Priority: Medium | Estimate: 4 points**

**As a** developer
**I want** to track Core Web Vitals and page performance
**So that** I can identify and fix performance issues

#### Acceptance Criteria
- [ ] Create `lib/logging/performance.ts`
- [ ] Track Core Web Vitals: LCP, FID, CLS, FCP, TTFB
- [ ] Track custom metrics: time to first resort render, search latency
- [ ] Send metrics to Grafana as structured logs
- [ ] Use `web-vitals` library for accurate measurements
- [ ] Track per-page performance (landing, directory, resort detail)

#### Technical Notes
```typescript
import { onLCP, onFID, onCLS, onFCP, onTTFB } from 'web-vitals';

function initPerformanceMonitoring() {
  onLCP((metric) => {
    logger.info('Core Web Vital: LCP', {
      metric: 'LCP',
      value: metric.value,
      rating: metric.rating,
      page: window.location.pathname,
    });
  });

  // Similar for other metrics
}
```

#### Verification
- [ ] Web Vitals logged for each page
- [ ] Metrics include rating (good/needs-improvement/poor)
- [ ] Custom metrics tracked accurately
- [ ] No significant performance overhead from monitoring

---

### Story 11: Grafana Dashboard - Application Health
**Phase 4 | Priority: Medium | Estimate: 3 points**

**As a** developer/operator
**I want** a Grafana dashboard showing application health
**So that** I can monitor the UI in real-time

#### Acceptance Criteria
- [ ] Create dashboard JSON: `grafana/dashboards/ui-health.json`
- [ ] Panels:
  - Log volume over time (by level)
  - Error rate percentage
  - Top errors by message
  - Active sessions count
  - Page views by route
- [ ] Time range selector (last 1h, 6h, 24h, 7d)
- [ ] Auto-refresh every 30 seconds
- [ ] Document import process

#### Technical Notes
LogQL queries for dashboard:
```logql
# Error rate
sum(rate({app="ski-directory-ui"} |= `"level":"error"` [5m])) /
sum(rate({app="ski-directory-ui"} [5m]))

# Log volume by level
sum(rate({app="ski-directory-ui"} | json [5m])) by (level)

# Top errors
topk(10, sum(rate({app="ski-directory-ui"} |= `"level":"error"` | json [1h])) by (message))
```

#### Verification
- [ ] Dashboard imports successfully
- [ ] All panels show data
- [ ] Queries perform well (<2s)
- [ ] Time ranges work correctly

---

### Story 12: Grafana Dashboard - Performance
**Phase 4 | Priority: Medium | Estimate: 3 points**

**As a** developer/operator
**I want** a Grafana dashboard for performance monitoring
**So that** I can track Core Web Vitals and API latency

#### Acceptance Criteria
- [ ] Create dashboard JSON: `grafana/dashboards/ui-performance.json`
- [ ] Panels:
  - Core Web Vitals (LCP, FID, CLS) by page
  - API response times (p50, p95, p99)
  - Slow request count (>2s)
  - Page load times by route
  - Performance score distribution
- [ ] Visual indicators for good/needs-improvement/poor
- [ ] Comparison with target thresholds

#### Technical Notes
```logql
# LCP p95
quantile_over_time(0.95,
  {app="ski-directory-ui"}
  | json
  | metric="LCP"
  | unwrap value [5m]
)

# API latency by hook
quantile_over_time(0.95,
  {app="ski-directory-ui"}
  | json
  | durationMs > 0
  | unwrap durationMs [5m]
) by (component)
```

#### Verification
- [ ] Dashboard imports successfully
- [ ] Web Vitals display correctly
- [ ] API latency metrics accurate
- [ ] Thresholds visually clear

---

### Story 13: Alert Configuration
**Phase 4 | Priority: Low | Estimate: 2 points**

**As a** developer/operator
**I want** alerts for critical issues
**So that** I'm notified when the application has problems

#### Acceptance Criteria
- [ ] Create alert rules JSON: `grafana/alerts/ui-alerts.json`
- [ ] Alert rules:
  - High error rate (>5% for 5 minutes)
  - No logs received (10 minutes - app may be down)
  - High LCP (>4s p95 for 10 minutes)
  - Elevated API failures (>10 errors/minute)
- [ ] Configure notification channel (email/Slack)
- [ ] Document alert setup process

#### Technical Notes
```json
{
  "alert": "HighErrorRate",
  "expr": "sum(rate({app=\"ski-directory-ui\"} |= `\"level\":\"error\"` [5m])) / sum(rate({app=\"ski-directory-ui\"} [5m])) > 0.05",
  "for": "5m",
  "labels": { "severity": "warning" },
  "annotations": {
    "summary": "High error rate in ski-directory-ui",
    "description": "Error rate is above 5% for the last 5 minutes"
  }
}
```

#### Verification
- [ ] Alerts created in Grafana
- [ ] Test alerts fire correctly
- [ ] Notifications received
- [ ] Alert descriptions are helpful

---

## Implementation Order

```
Phase 1 (Foundation):
  Story 1 → Story 2 → Story 3
  [VERIFY: Logs shipping to Grafana]

Phase 2 (Hook & Service Logging):
  Story 4 → Story 5 → Story 6
  [VERIFY: Data fetching fully logged]

Phase 3 (Component Logging):
  Story 7 → Story 8 → Story 9
  [VERIFY: UI interactions and errors logged]

Phase 4 (Performance & Dashboards):
  Story 10 → Story 11 → Story 12 → Story 13
  [VERIFY: Dashboards working, alerts configured]
```

---

## Rollback Plan

If issues arise:
1. Set `observabilityLogging: false` in feature flags
2. All logging reverts to console-only (development behavior)
3. No impact on application functionality
4. Grafana dashboards will show no new data

---

## Success Metrics

- **Coverage**: All data fetching hooks have logging
- **Visibility**: Errors visible in Grafana within 30 seconds
- **Performance**: No measurable impact on page load (<50ms overhead)
- **Adoption**: All new components use `useLogger` hook
- **Actionable**: Alerts lead to resolved issues

---

## Files to Create (New)

```
lib/logging/
  browser-logger.ts
  log-context.ts
  performance.ts
  index.ts

lib/config/
  observability.ts

lib/hooks/
  useLogger.ts

components/
  ErrorBoundary.tsx

grafana/
  dashboards/
    ui-health.json
    ui-performance.json
  alerts/
    ui-alerts.json
```

## Files to Modify

```
lib/config/feature-flags.ts     - Add observabilityLogging flag
lib/hooks/useRankedResorts.ts   - Add logging
lib/hooks/useThemedResorts.ts   - Add logging
lib/hooks/useResorts.ts         - Add logging
lib/hooks/useResort.ts          - Add logging
lib/hooks/useResortSearch.ts    - Add logging
lib/api/supabase-resort-service.ts - Replace console.error
lib/api/themed-resorts-service.ts  - Replace console.error
lib/api/resort-service.ts          - Replace console.error
components/ResortCard.tsx       - Add image logging
components/ViewToggle.tsx       - Add interaction logging
components/IntelligentResortSection.tsx - Add interaction logging
app/layout.tsx                  - Add ErrorBoundary wrapper
.env.example                    - Add Grafana variables
```

---

## Dependencies

- Grafana Cloud account (free tier sufficient)
- Loki endpoint credentials
- `web-vitals` npm package (for Core Web Vitals)
- Feature flag system (Epic 22 - COMPLETED)

---

## Security Considerations

- API token stored in environment variables (not committed)
- No PII in logs (session IDs are anonymous)
- No full query logging (security risk)
- Rate limiting on log shipping (prevent abuse)
- HTTPS only for Loki endpoint
