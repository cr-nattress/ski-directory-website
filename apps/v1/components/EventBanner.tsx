'use client';

import { useState, useEffect } from 'react';
import { X, Snowflake, AlertTriangle, Info, Cloud, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EventAlert, AlertType } from '@/lib/api/types';

interface EventBannerProps {
  alert: EventAlert | null;
  onDismiss: (alertId: string) => void;
}

const alertConfig: Record<
  AlertType,
  {
    icon: React.ElementType;
    bgColor: string;
    textColor: string;
    borderColor: string;
  }
> = {
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200',
  },
  'snow-report': {
    icon: Snowflake,
    bgColor: 'bg-sky-50',
    textColor: 'text-sky-800',
    borderColor: 'border-sky-200',
  },
  weather: {
    icon: Cloud,
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-800',
    borderColor: 'border-amber-200',
  },
  safety: {
    icon: AlertTriangle,
    bgColor: 'bg-red-50',
    textColor: 'text-red-800',
    borderColor: 'border-red-200',
  },
  system: {
    icon: Bell,
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-300',
  },
};

export function EventBanner({ alert, onDismiss }: EventBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (alert) {
      // Small delay to trigger entrance animation
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [alert]);

  const handleDismiss = () => {
    if (!alert) return;

    setIsExiting(true);
    // Wait for exit animation before calling onDismiss
    setTimeout(() => {
      onDismiss(alert.id);
      setIsExiting(false);
    }, 300);
  };

  if (!alert) return null;

  const config = alertConfig[alert.type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'w-full border-b overflow-hidden transition-all duration-300 ease-out',
        config.bgColor,
        config.borderColor,
        isVisible && !isExiting ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="container-custom py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Icon + Content */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Icon className={cn('w-5 h-5 flex-shrink-0', config.textColor)} />

            <div className="flex-1 min-w-0">
              <p className={cn('text-sm font-medium', config.textColor)}>
                {alert.title}
                {alert.message && (
                  <span className="font-normal ml-1.5">— {alert.message}</span>
                )}
              </p>
            </div>

            {/* Optional Link */}
            {alert.linkUrl && alert.linkText && (
              <a
                href={alert.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'text-sm font-medium underline hover:no-underline flex-shrink-0',
                  config.textColor
                )}
              >
                {alert.linkText}
              </a>
            )}
          </div>

          {/* Dismiss Button */}
          {alert.isDismissible && (
            <button
              onClick={handleDismiss}
              className={cn(
                'p-1 rounded-full hover:bg-black/5 transition-colors flex-shrink-0',
                config.textColor
              )}
              aria-label="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
