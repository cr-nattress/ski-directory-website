import { EventAlert, AlertApiResponse } from './types';

// Mock alerts for development - replace with real API calls later
const mockAlerts: EventAlert[] = [
  {
    id: 'alert-snow-001',
    type: 'snow-report',
    priority: 'high',
    source: 'snow-api',
    title: 'Fresh Powder Alert',
    message: '12-18" expected across all Front Range resorts tonight',
    linkText: 'View Snow Report',
    linkUrl: '#',
    startsAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    isDismissible: true,
    isPersistent: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'alert-weather-001',
    type: 'weather',
    priority: 'medium',
    source: 'weather-api',
    title: 'Winter Storm Watch',
    message: 'Heavy snowfall and reduced visibility expected Tuesday-Wednesday',
    startsAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    isDismissible: true,
    isPersistent: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'alert-safety-001',
    type: 'safety',
    priority: 'critical',
    source: 'nws-api',
    title: 'Avalanche Warning',
    message: 'Considerable avalanche danger above treeline in backcountry zones',
    linkText: 'CAIC Report',
    linkUrl: 'https://avalanche.state.co.us/',
    startsAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
    isDismissible: true,
    isPersistent: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'alert-info-001',
    type: 'info',
    priority: 'low',
    source: 'manual',
    title: 'Holiday Hours',
    message: 'Extended lift operations through January 2nd',
    startsAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    isDismissible: true,
    isPersistent: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'alert-system-001',
    type: 'system',
    priority: 'low',
    source: 'system',
    title: 'Scheduled Maintenance',
    message: 'Brief service interruption expected Sunday 2-4am MST',
    startsAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    isDismissible: true,
    isPersistent: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Simulated API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface GetAlertsOptions {
  resortSlug?: string;
}

export const alertService = {
  async getActiveAlerts(
    options: GetAlertsOptions = {}
  ): Promise<AlertApiResponse> {
    await delay(100); // Simulate network delay

    const now = new Date();

    let activeAlerts = mockAlerts.filter((alert) => {
      const startsAt = new Date(alert.startsAt);
      const expiresAt = new Date(alert.expiresAt);
      return now >= startsAt && now <= expiresAt;
    });

    // Filter by resort if specified
    if (options.resortSlug) {
      activeAlerts = activeAlerts.filter(
        (alert) => !alert.resortSlug || alert.resortSlug === options.resortSlug
      );
    } else {
      // Global page - only show global alerts
      activeAlerts = activeAlerts.filter((alert) => !alert.resortSlug);
    }

    // Sort by priority (critical first)
    const priorityOrder: Record<string, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };
    activeAlerts.sort(
      (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]
    );

    return {
      data: activeAlerts,
      status: 'success',
    };
  },

  async dismissAlert(alertId: string): Promise<AlertApiResponse> {
    await delay(50);
    // In real implementation, this would update server-side state
    return {
      data: [],
      status: 'success',
      message: `Alert ${alertId} dismissed`,
    };
  },
};
