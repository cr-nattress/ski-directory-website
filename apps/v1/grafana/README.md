# Grafana Dashboards & Alerts

This directory contains Grafana dashboard and alert configurations for the Ski Directory UI observability system.

## Prerequisites

1. Grafana Cloud account (free tier is sufficient)
2. Loki datasource configured
3. Logs shipping to Loki from the UI (requires `observabilityLogging: true` feature flag)

## Dashboards

### UI Health (`dashboards/ui-health.json`)

Monitors overall application health:
- Log volume by level (info, warn, error)
- Error rate percentage (with threshold indicators)
- Active sessions count
- Logs by component distribution
- Recent errors log view
- Top errors table

### UI Performance (`dashboards/ui-performance.json`)

Monitors performance metrics:
- Core Web Vitals (LCP, FID, CLS, TTFB)
- API response times by hook
- Slow requests count (>2s)
- Web Vital ratings distribution
- Core Web Vitals over time

## Alerts

### Alert Rules (`alerts/ui-alerts.json`)

Configured alerts:

| Alert | Threshold | Duration | Severity |
|-------|-----------|----------|----------|
| High Error Rate | >5% | 5 minutes | Warning |
| No Logs Received | No logs | 10 minutes | Critical |
| High LCP | p95 >4s | 10 minutes | Warning |
| Elevated API Failures | >10/min | 5 minutes | Warning |

## Import Instructions

### Dashboards

1. Log in to your Grafana instance
2. Go to **Dashboards** > **Import**
3. Click **Upload JSON file**
4. Select `dashboards/ui-health.json` or `dashboards/ui-performance.json`
5. Select your Loki datasource when prompted
6. Click **Import**

### Alerts

1. Go to **Alerting** > **Alert rules**
2. Click **Import** or use the Grafana provisioning API
3. Select `alerts/ui-alerts.json`
4. Configure notification channels as needed

## Environment Setup

Add these variables to your `.env.local`:

```env
NEXT_PUBLIC_GRAFANA_LOKI_URL=https://logs-prod-XXX.grafana.net
NEXT_PUBLIC_GRAFANA_LOKI_USERNAME=your-username
NEXT_PUBLIC_GRAFANA_LOKI_API_TOKEN=glc_your-token
NEXT_PUBLIC_GRAFANA_APP_NAME=ski-directory-ui
```

Enable observability logging:
```typescript
// lib/config/feature-flags.ts
observabilityLogging: true,
```

## LogQL Reference

### Useful Queries

```logql
# All errors
{app="ski-directory-ui"} |= `"level":"error"` | json

# Slow API responses
{app="ski-directory-ui"} |= `Slow response detected` | json

# Core Web Vitals
{app="ski-directory-ui"} |= `Core Web Vital` | json

# Errors by component
sum(count_over_time({app="ski-directory-ui"} |= `"level":"error"` | json [1h])) by (component)

# Average LCP over time
avg_over_time({app="ski-directory-ui"} |= `Core Web Vital: LCP` | json | unwrap value [5m])
```

## Support

For issues with the observability system, check:
1. Feature flag is enabled
2. Environment variables are set correctly
3. Network connectivity to Grafana Cloud
4. Browser console for any errors
