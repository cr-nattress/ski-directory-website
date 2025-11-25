'use client';

import { Header } from './Header';
import { EventBanner } from './EventBanner';
import { useEventBanner } from '@/lib/hooks';

interface PageWrapperProps {
  headerVariant?: 'overlay' | 'solid';
  resortSlug?: string; // For resort-specific alerts
  children?: React.ReactNode;
}

export function PageWrapper({
  headerVariant = 'solid',
  resortSlug,
  children,
}: PageWrapperProps) {
  const { activeAlert, dismissAlert } = useEventBanner({ resortSlug });
  const isOverlay = headerVariant === 'overlay';

  return (
    <>
      {/* Banner is always in normal document flow at the very top */}
      <EventBanner alert={activeAlert} onDismiss={dismissAlert} />
      {/* For overlay variant, header overlays the next sibling (hero) but not the banner */}
      {isOverlay ? (
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 z-50">
            <Header variant={headerVariant} />
          </div>
        </div>
      ) : (
        <Header variant={headerVariant} />
      )}
      {children}
    </>
  );
}
