# Grafana Implementation Guide

Complete guide for implementing Grafana Cloud observability on frontend and backend applications.

---

## Table of Contents

1. [Grafana Cloud Setup](#1-grafana-cloud-setup)
2. [Credentials & Configuration](#2-credentials--configuration)
3. [Backend Implementation](#3-backend-implementation)
4. [Frontend Implementation](#4-frontend-implementation)
5. [Dashboard Configuration](#5-dashboard-configuration)
6. [Alert Configuration](#6-alert-configuration)
7. [LogQL Query Reference](#7-logql-query-reference)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Grafana Cloud Setup

### Create a Grafana Cloud Account

1. Go to [Grafana Cloud](https://grafana.com/products/cloud/)
2. Sign up for a free account (includes 50GB logs/month)
3. Note your Grafana Cloud Stack URL

### Get Your Loki Credentials

1. In Grafana Cloud, go to **My Account** → **Loki**
2. Click **Details** to find:
   - **URL**: `https://logs-prod-XXX.grafana.net` (your region-specific URL)
   - **Username**: Your numeric user ID (e.g., `1403674`)
3. Generate an API token:
   - Click **Generate now** under "Password / API token"
   - Save the token securely (starts with `glc_`)

---

## 2. Credentials & Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Grafana Cloud Loki Configuration
GRAFANA_LOKI_URL=https://logs-prod-XXX.grafana.net
GRAFANA_LOKI_USERNAME=your-user-id
GRAFANA_LOKI_API_TOKEN=glc_your-api-token-here
```

> **Note**: Replace with your own credentials from Grafana Cloud.

### Environment Schema (Zod Validation)

```typescript
// src/schemas/env.schema.ts
import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),

  // Grafana Cloud Logs (optional in development)
  GRAFANA_LOKI_URL: z.string().url().optional(),
  GRAFANA_LOKI_USERNAME: z.string().optional(),
  GRAFANA_LOKI_API_TOKEN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;
```

---

## 3. Backend Implementation

### Dependencies

```bash
npm install pino pino-multi-stream
```

### Loki Transport (lokiTransport.ts)

Create a custom transport that batches and sends logs to Loki:

```typescript
// src/logging/lokiTransport.ts
import { Writable } from 'stream';
import { env } from '../env.js';

interface LokiStream {
  stream: Record<string, string>;
  values: Array<[string, string]>;
}

interface LokiPushRequest {
  streams: LokiStream[];
}

export class LokiTransport extends Writable {
  private buffer: Array<{ timestamp: string; line: string }> = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private readonly batchSize: number;
  private readonly flushInterval: number;
  private readonly url: string;
  private readonly auth: string;
  private readonly labels: Record<string, string>;
  private retryCount = 0;
  private readonly maxRetries = 3;

  constructor(options?: {
    batchSize?: number;
    flushInterval?: number;
    labels?: Record<string, string>;
  }) {
    super({ objectMode: true });

    this.batchSize = options?.batchSize || 100;
    this.flushInterval = options?.flushInterval || 5000; // 5 seconds
    this.labels = options?.labels || {
      app: 'my-app',           // CHANGE THIS to your app name
      environment: env.NODE_ENV,
    };

    if (!env.GRAFANA_LOKI_URL || !env.GRAFANA_LOKI_USERNAME || !env.GRAFANA_LOKI_API_TOKEN) {
      throw new Error('Loki configuration missing');
    }

    this.url = `${env.GRAFANA_LOKI_URL}/loki/api/v1/push`;
    this.auth = `Basic ${Buffer.from(`${env.GRAFANA_LOKI_USERNAME}:${env.GRAFANA_LOKI_API_TOKEN}`).toString('base64')}`;

    this.startFlushTimer();
  }

  _write(chunk: any, _encoding: string, callback: (error?: Error | null) => void): void {
    try {
      const log = typeof chunk === 'string' ? JSON.parse(chunk) : chunk;

      // Convert to nanoseconds for Loki
      const timestamp = log.time
        ? new Date(log.time).getTime() * 1000000
        : Date.now() * 1000000;

      this.buffer.push({
        timestamp: timestamp.toString(),
        line: JSON.stringify(log),
      });

      if (this.buffer.length >= this.batchSize) {
        this.flush().catch(console.error);
      }

      callback();
    } catch (error) {
      callback(error as Error);
    }
  }

  private async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const logsToSend = [...this.buffer];
    this.buffer = [];

    const payload: LokiPushRequest = {
      streams: [
        {
          stream: this.labels,
          values: logsToSend.map((log) => [log.timestamp, log.line]),
        },
      ],
    };

    try {
      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.auth,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Loki push failed: ${response.status} ${response.statusText}`);
      }
      this.retryCount = 0;
    } catch (error) {
      console.error('Failed to push logs to Loki:', error);

      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        const delay = Math.pow(2, this.retryCount) * 1000;
        this.buffer.unshift(...logsToSend);
        setTimeout(() => this.flush().catch(console.error), delay);
      } else {
        console.error(`Dropping ${logsToSend.length} logs after ${this.maxRetries} retries`);
        this.retryCount = 0;
      }
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => this.flush().catch(console.error), this.flushInterval);
  }

  _destroy(error: Error | null, callback: (error: Error | null) => void): void {
    if (this.flushTimer) clearInterval(this.flushTimer);
    this.flush().then(() => callback(error)).catch((e) => callback(error || e));
  }
}
```

### Logger Configuration (logger.ts)

```typescript
// src/logging/logger.ts
import pino from 'pino';
import { env } from '../env.js';
import { LokiTransport } from './lokiTransport.js';
import os from 'os';

export function createLogger() {
  const streams: any[] = [];

  // Console stream (always enabled)
  streams.push({
    level: env.NODE_ENV === 'development' ? 'debug' : 'info',
    stream: pino.destination({ sync: env.NODE_ENV === 'development' }),
  });

  // Loki stream (enabled when configured)
  if (env.GRAFANA_LOKI_URL && env.GRAFANA_LOKI_USERNAME && env.GRAFANA_LOKI_API_TOKEN) {
    try {
      const lokiTransport = new LokiTransport({
        batchSize: 100,
        flushInterval: 5000,
        labels: {
          app: 'my-app',              // CHANGE THIS
          environment: env.NODE_ENV,
          hostname: os.hostname(),
        },
      });

      streams.push({ level: 'info', stream: lokiTransport });
    } catch (error) {
      console.error('Failed to initialize Loki transport:', error);
    }
  }

  return pino(
    {
      level: env.NODE_ENV === 'development' ? 'debug' : 'info',
      base: {
        hostname: os.hostname(),
        environment: env.NODE_ENV,
        pid: process.pid,
      },
      timestamp: pino.stdTimeFunctions.isoTime,
    },
    pino.multistream(streams)
  );
}

// Request-scoped logger
export function createRequestLogger(baseLogger: pino.Logger, requestId: string) {
  return baseLogger.child({ requestId });
}

// Provider-scoped logger
export function createProviderLogger(baseLogger: pino.Logger, provider: string, resortId?: string) {
  return baseLogger.child({ provider, resortId });
}
```

### Server Integration (Fastify Example)

```typescript
// src/server.ts
import Fastify from 'fastify';
import { createLogger } from './logging/logger.js';

const logger = createLogger();

const server = Fastify({
  logger,
  genReqId: () => `req-${Date.now()}-${Math.random().toString(36).substring(7)}`,
});

// Logs will automatically include request/response info
server.listen({ port: 3000 }, (err) => {
  if (err) {
    logger.error(err);
    process.exit(1);
  }
});
```

### Structured Log Fields

Include these fields in your logs for better querying:

| Field | Description | Example |
|-------|-------------|---------|
| `hostname` | Server hostname | `server-01` |
| `environment` | Node environment | `production` |
| `pid` | Process ID | `12345` |
| `requestId` | Unique request ID | `req-1234567890-abc123` |
| `provider` | External service name | `weather-api` |
| `latencyMs` | Operation duration | `150` |
| `success` | Operation result | `true` / `false` |
| `responseTime` | HTTP response time | `200` |
| `statusCode` | HTTP status code | `200` |

---

## 4. Frontend Implementation

### Using Grafana Faro

```bash
npm install @grafana/faro-web-sdk @grafana/faro-web-tracing
```

```typescript
// src/observability/faro.ts
import { initializeFaro, getWebInstrumentations } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

export const faro = initializeFaro({
  url: 'https://faro-collector-prod-XXX.grafana.net/collect',
  apiKey: 'your-faro-api-key',
  app: {
    name: 'my-frontend-app',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
  },
  instrumentations: [
    ...getWebInstrumentations(),
    new TracingInstrumentation(),
  ],
});

// Log events
faro.api.pushLog(['User clicked button']);

// Log errors
faro.api.pushError(new Error('Something went wrong'));

// Track custom metrics
faro.api.pushMeasurement({
  type: 'custom',
  values: { pageLoadTime: 1234 },
});
```

### Alternative: Direct HTTP to Loki

For simpler frontend logging without Faro:

```typescript
// src/lib/browserLogger.ts
class BrowserLokiLogger {
  private buffer: Array<{ timestamp: string; line: string }> = [];
  private readonly url: string;
  private readonly auth: string;
  private readonly labels: Record<string, string>;

  constructor(config: {
    lokiUrl: string;
    username: string;
    token: string;
    app: string;
  }) {
    this.url = `${config.lokiUrl}/loki/api/v1/push`;
    this.auth = `Basic ${btoa(`${config.username}:${config.token}`)}`;
    this.labels = {
      app: config.app,
      source: 'browser',
      environment: process.env.NODE_ENV || 'development',
    };

    // Flush on page unload
    window.addEventListener('beforeunload', () => this.flush());

    // Periodic flush
    setInterval(() => this.flush(), 10000);
  }

  log(level: string, message: string, data?: Record<string, any>) {
    this.buffer.push({
      timestamp: (Date.now() * 1000000).toString(),
      line: JSON.stringify({
        level,
        msg: message,
        time: new Date().toISOString(),
        ...data,
      }),
    });
  }

  async flush() {
    if (this.buffer.length === 0) return;

    const logs = [...this.buffer];
    this.buffer = [];

    try {
      await fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.auth,
        },
        body: JSON.stringify({
          streams: [{ stream: this.labels, values: logs.map(l => [l.timestamp, l.line]) }],
        }),
        keepalive: true,
      });
    } catch (error) {
      console.error('Failed to send logs to Loki:', error);
    }
  }

  info(message: string, data?: Record<string, any>) { this.log('info', message, data); }
  warn(message: string, data?: Record<string, any>) { this.log('warn', message, data); }
  error(message: string, data?: Record<string, any>) { this.log('error', message, data); }
}

export const logger = new BrowserLokiLogger({
  lokiUrl: process.env.NEXT_PUBLIC_GRAFANA_LOKI_URL!,
  username: process.env.NEXT_PUBLIC_GRAFANA_LOKI_USERNAME!,
  token: process.env.NEXT_PUBLIC_GRAFANA_LOKI_API_TOKEN!,
  app: 'my-frontend-app',
});
```

---

## 5. Dashboard Configuration

### API Performance Dashboard

Create file `grafana/dashboards/api-performance.json`:

```json
{
  "dashboard": {
    "title": "API Performance & Latency",
    "tags": ["my-app", "performance"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "Request Rate",
        "type": "timeseries",
        "gridPos": { "h": 8, "w": 12, "x": 0, "y": 0 },
        "targets": [
          {
            "expr": "sum(rate({app=\"my-app\"} |= `\"req\"` [1m]))",
            "legendFormat": "Requests/sec",
            "refId": "A"
          }
        ],
        "fieldConfig": {
          "defaults": { "unit": "reqps" }
        }
      },
      {
        "id": 2,
        "title": "Response Time (p50, p95, p99)",
        "type": "timeseries",
        "gridPos": { "h": 8, "w": 12, "x": 12, "y": 0 },
        "targets": [
          {
            "expr": "quantile_over_time(0.50, {app=\"my-app\"} | json | responseTime != \"\" | unwrap responseTime [5m])",
            "legendFormat": "p50",
            "refId": "A"
          },
          {
            "expr": "quantile_over_time(0.95, {app=\"my-app\"} | json | responseTime != \"\" | unwrap responseTime [5m])",
            "legendFormat": "p95",
            "refId": "B"
          },
          {
            "expr": "quantile_over_time(0.99, {app=\"my-app\"} | json | responseTime != \"\" | unwrap responseTime [5m])",
            "legendFormat": "p99",
            "refId": "C"
          }
        ],
        "fieldConfig": {
          "defaults": { "unit": "ms" }
        }
      },
      {
        "id": 3,
        "title": "HTTP Status Codes",
        "type": "timeseries",
        "gridPos": { "h": 8, "w": 12, "x": 0, "y": 8 },
        "targets": [
          {
            "expr": "sum(rate({app=\"my-app\"} | json | statusCode >= 200 | statusCode < 300 [1m]))",
            "legendFormat": "2xx",
            "refId": "A"
          },
          {
            "expr": "sum(rate({app=\"my-app\"} | json | statusCode >= 400 | statusCode < 500 [1m]))",
            "legendFormat": "4xx",
            "refId": "B"
          },
          {
            "expr": "sum(rate({app=\"my-app\"} | json | statusCode >= 500 [1m]))",
            "legendFormat": "5xx",
            "refId": "C"
          }
        ]
      },
      {
        "id": 4,
        "title": "Error Rate",
        "type": "stat",
        "gridPos": { "h": 8, "w": 12, "x": 12, "y": 8 },
        "targets": [
          {
            "expr": "sum(rate({app=\"my-app\"} |= `\"level\":\"error\"` [5m])) / sum(rate({app=\"my-app\"} [5m]))",
            "refId": "A"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "percentunit",
            "thresholds": {
              "mode": "absolute",
              "steps": [
                { "value": 0, "color": "green" },
                { "value": 0.01, "color": "yellow" },
                { "value": 0.05, "color": "red" }
              ]
            }
          }
        }
      }
    ],
    "refresh": "30s",
    "time": { "from": "now-1h", "to": "now" }
  }
}
```

### Provider Reliability Dashboard

Create file `grafana/dashboards/provider-reliability.json`:

```json
{
  "dashboard": {
    "title": "Provider Reliability",
    "tags": ["my-app", "providers"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "Provider Success Rate",
        "type": "timeseries",
        "gridPos": { "h": 8, "w": 12, "x": 0, "y": 0 },
        "targets": [
          {
            "expr": "sum(rate({app=\"my-app\"} |= `\"provider\"` |= `\"success\":true` [5m])) by (provider) / sum(rate({app=\"my-app\"} |= `\"provider\"` [5m])) by (provider)",
            "legendFormat": "{{provider}}",
            "refId": "A"
          }
        ],
        "fieldConfig": {
          "defaults": { "unit": "percentunit", "min": 0, "max": 1 }
        }
      },
      {
        "id": 2,
        "title": "Provider Error Count",
        "type": "timeseries",
        "gridPos": { "h": 8, "w": 12, "x": 12, "y": 0 },
        "targets": [
          {
            "expr": "sum(rate({app=\"my-app\"} |= `\"provider\"` |= `\"success\":false` [5m])) by (provider)",
            "legendFormat": "{{provider}}",
            "refId": "A"
          }
        ]
      },
      {
        "id": 3,
        "title": "Provider Latency (p95)",
        "type": "timeseries",
        "gridPos": { "h": 8, "w": 24, "x": 0, "y": 8 },
        "targets": [
          {
            "expr": "quantile_over_time(0.95, {app=\"my-app\"} | json | latencyMs != \"\" | unwrap latencyMs [5m]) by (provider)",
            "legendFormat": "{{provider}} p95",
            "refId": "A"
          }
        ],
        "fieldConfig": {
          "defaults": { "unit": "ms" }
        }
      }
    ],
    "refresh": "30s",
    "time": { "from": "now-1h", "to": "now" }
  }
}
```

### Import Dashboards

1. Go to Grafana Cloud → **Dashboards** → **Import**
2. Upload the JSON files
3. Select your Loki data source

---

## 6. Alert Configuration

Create file `grafana/alerts/alert-rules.json`:

```json
{
  "groups": [
    {
      "name": "my-app-alerts",
      "interval": "1m",
      "rules": [
        {
          "alert": "HighErrorRate",
          "expr": "sum(rate({app=\"my-app\"} |= `\"level\":\"error\"` [5m])) / sum(rate({app=\"my-app\"} [5m])) > 0.05",
          "for": "5m",
          "labels": { "severity": "warning", "app": "my-app" },
          "annotations": {
            "summary": "High error rate detected",
            "description": "Error rate is above 5% for the last 5 minutes"
          }
        },
        {
          "alert": "Elevated5xxResponses",
          "expr": "sum(rate({app=\"my-app\"} | json | statusCode >= 500 [5m])) > 10",
          "for": "5m",
          "labels": { "severity": "critical", "app": "my-app" },
          "annotations": {
            "summary": "Elevated 5xx responses",
            "description": "More than 10 5xx responses per second"
          }
        },
        {
          "alert": "HighLatencySpike",
          "expr": "quantile_over_time(0.95, {app=\"my-app\"} | json | responseTime != \"\" | unwrap responseTime [5m]) > 5000",
          "for": "5m",
          "labels": { "severity": "warning", "app": "my-app" },
          "annotations": {
            "summary": "High latency spike",
            "description": "p95 response time > 5000ms"
          }
        },
        {
          "alert": "ProviderFailure",
          "expr": "sum(rate({app=\"my-app\"} |= `\"provider\"` |= `\"success\":false` [5m])) by (provider) / sum(rate({app=\"my-app\"} |= `\"provider\"` [5m])) by (provider) > 0.5",
          "for": "10m",
          "labels": { "severity": "warning", "app": "my-app" },
          "annotations": {
            "summary": "Provider failure rate high",
            "description": "Provider {{provider}} has >50% failure rate"
          }
        },
        {
          "alert": "NoLogsReceived",
          "expr": "absent_over_time({app=\"my-app\"}[10m])",
          "for": "10m",
          "labels": { "severity": "critical", "app": "my-app" },
          "annotations": {
            "summary": "No logs received",
            "description": "Application may be down"
          }
        }
      ]
    }
  ]
}
```

### Configure Alerts in Grafana

1. Go to **Alerting** → **Alert rules**
2. Import `alert-rules.json` or create rules manually
3. Configure notification channels (email, Slack, PagerDuty, etc.)

---

## 7. LogQL Query Reference

### Basic Queries

```logql
# All logs from your app
{app="my-app"}

# Filter by log level
{app="my-app"} |= "level":"error"
{app="my-app"} |= "level":"warn"

# Parse JSON and filter
{app="my-app"} | json | statusCode >= 500
{app="my-app"} | json | responseTime > 2000

# Filter by environment
{app="my-app", environment="production"}
```

### Rate and Aggregation Queries

```logql
# Request rate
sum(rate({app="my-app"} |= "req" [1m]))

# Error rate percentage
sum(rate({app="my-app"} |= "level":"error" [5m])) / sum(rate({app="my-app"} [5m]))

# Latency percentiles
quantile_over_time(0.50, {app="my-app"} | json | responseTime != "" | unwrap responseTime [5m])
quantile_over_time(0.95, {app="my-app"} | json | responseTime != "" | unwrap responseTime [5m])
quantile_over_time(0.99, {app="my-app"} | json | responseTime != "" | unwrap responseTime [5m])
```

### Provider-Specific Queries

```logql
# Logs for specific provider
{app="my-app"} | json | provider="weather-api"

# Provider success rate
sum(rate({app="my-app"} |= "provider" |= "success":true [5m])) by (provider) /
sum(rate({app="my-app"} |= "provider" [5m])) by (provider)

# Provider latency
quantile_over_time(0.95, {app="my-app"} | json | latencyMs != "" | unwrap latencyMs [5m]) by (provider)
```

---

## 8. Troubleshooting

### Logs Not Appearing in Grafana

1. **Check environment variables**:
   ```bash
   echo $GRAFANA_LOKI_URL
   echo $GRAFANA_LOKI_USERNAME
   echo $GRAFANA_LOKI_API_TOKEN
   ```

2. **Verify API token permissions**:
   - Token must have `logs:write` scope
   - Regenerate token if necessary

3. **Check application logs** for Loki transport errors

4. **Test authentication manually**:
   ```bash
   curl -X POST "https://logs-prod-021.grafana.net/loki/api/v1/push" \
     -H "Content-Type: application/json" \
     -H "Authorization: Basic $(echo -n 'USERNAME:TOKEN' | base64)" \
     -d '{"streams":[{"stream":{"app":"test"},"values":[["'$(date +%s)000000000'","test log"]]}]}'
   ```

### High Latency / Dropped Logs

- Increase `batchSize` to reduce HTTP requests
- Increase `flushInterval` for high-latency networks
- Consider log sampling for very high volume

### Local Development

In development mode, logs only go to console. To test Loki:

1. Set `NODE_ENV=staging` or `NODE_ENV=production`
2. Configure Grafana credentials
3. Check Grafana Cloud → Explore → Loki

---

## Quick Checklist

- [ ] Create Grafana Cloud account
- [ ] Get Loki URL and username
- [ ] Generate API token
- [ ] Add environment variables
- [ ] Install dependencies (`pino`, `pino-multi-stream`)
- [ ] Create `lokiTransport.ts`
- [ ] Create `logger.ts`
- [ ] Integrate logger with server
- [ ] Import dashboards
- [ ] Configure alerts
- [ ] Test logs appearing in Grafana
