# Story 32.6: Optimize Map View for Touch Interactions

## Priority: Medium

## Context

The interactive map (`components/ResortMapView.tsx`) was primarily designed for desktop use with mouse interactions. Mobile users need touch-optimized controls, larger tap targets for markers, and better handling of the legend and resort popups.

## Current State

**Location:** `apps/v1/components/ResortMapView.tsx`

**Current Issues:**
- Legend is always visible, can obscure content on small screens
- Map markers use default Leaflet pin sizes (small for touch)
- Popups can be difficult to dismiss on touch
- No pinch-to-zoom instruction for first-time users
- No "locate me" functionality
- Scroll zoom can interfere with page scrolling on mobile

## Requirements

1. Make legend collapsible/dismissible on mobile
2. Increase marker touch targets
3. Add pinch-to-zoom hint overlay for first-time users
4. Implement "Locate Me" floating action button
5. Use bottom sheet pattern for resort details (vs popups)
6. Handle scroll zoom behavior appropriately

## Implementation

### 1. Collapsible Legend

```tsx
// components/map/MapLegend.tsx
'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MapLegendProps {
  className?: string;
}

export function MapLegend({ className }: MapLegendProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const legendItems = [
    { color: 'bg-epic-red', label: 'Epic Pass' },
    { color: 'bg-ikon-orange', label: 'Ikon Pass' },
    { color: 'bg-blue-500', label: 'Local/Indy' },
    { color: 'bg-gray-400', label: 'Lost/Former' },
  ];

  return (
    <div
      className={cn(
        'absolute bottom-4 left-4 bg-white rounded-lg shadow-lg z-[1000]',
        className
      )}
    >
      {/* Mobile: Collapsed by default */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="md:hidden flex items-center gap-2 px-3 py-2 min-h-[44px] w-full"
        aria-expanded={isExpanded}
      >
        <span className="text-sm font-medium">Legend</span>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronUp className="w-4 h-4" />
        )}
      </button>

      {/* Legend content */}
      <div
        className={cn(
          'px-3 pb-3 grid grid-cols-2 gap-2',
          // Mobile: collapsible
          'md:pt-3',
          !isExpanded && 'hidden md:grid'
        )}
      >
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className={cn('w-3 h-3 rounded-full', item.color)} />
            <span className="text-xs text-gray-700">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 2. Larger Touch-Friendly Markers

```tsx
// components/map/ResortMarker.tsx
import L from 'leaflet';

// Create larger markers for touch devices
export const createTouchMarkerIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="relative">
        <div class="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-lg border-2" style="border-color: ${color}">
          <div class="w-4 h-4 rounded-full" style="background-color: ${color}"></div>
        </div>
        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-6 border-transparent" style="border-top-color: ${color}"></div>
      </div>
    `,
    iconSize: [40, 48],
    iconAnchor: [20, 48],
    popupAnchor: [0, -48],
  });
};
```

### 3. First-Time Pinch-to-Zoom Hint

```tsx
// components/map/MapGestureHint.tsx
'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const HINT_STORAGE_KEY = 'map-gesture-hint-shown';

export function MapGestureHint() {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    // Only show on touch devices, first visit
    const isTouchDevice = 'ontouchstart' in window;
    const hasSeenHint = localStorage.getItem(HINT_STORAGE_KEY);

    if (isTouchDevice && !hasSeenHint) {
      setShowHint(true);
      // Auto-hide after 4 seconds
      const timer = setTimeout(() => {
        setShowHint(false);
        localStorage.setItem(HINT_STORAGE_KEY, 'true');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!showHint) return null;

  return (
    <div className="absolute inset-0 z-[1001] flex items-center justify-center bg-black/40 pointer-events-none">
      <div className="bg-white rounded-xl px-6 py-4 shadow-xl text-center pointer-events-auto">
        <button
          onClick={() => {
            setShowHint(false);
            localStorage.setItem(HINT_STORAGE_KEY, 'true');
          }}
          className="absolute top-2 right-2 p-1"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
        <div className="text-4xl mb-2">👆👆</div>
        <p className="text-sm text-gray-700">
          Use two fingers to zoom and pan
        </p>
      </div>
    </div>
  );
}
```

### 4. Locate Me FAB

```tsx
// components/map/LocateMeButton.tsx
'use client';

import { useState } from 'react';
import { Navigation, Loader2 } from 'lucide-react';
import { useMap } from 'react-leaflet';
import { cn } from '@/lib/utils';

export function LocateMeButton() {
  const map = useMap();
  const [isLocating, setIsLocating] = useState(false);

  const handleLocate = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.setView([latitude, longitude], 8);
        setIsLocating(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsLocating(false);
      }
    );
  };

  return (
    <button
      onClick={handleLocate}
      disabled={isLocating}
      className={cn(
        'absolute bottom-4 right-4 z-[1000]',
        'w-12 h-12 rounded-full bg-white shadow-lg',
        'flex items-center justify-center',
        'hover:bg-gray-50 active:bg-gray-100',
        'transition-colors'
      )}
      aria-label="Find my location"
    >
      {isLocating ? (
        <Loader2 className="w-5 h-5 text-ski-blue animate-spin" />
      ) : (
        <Navigation className="w-5 h-5 text-ski-blue" />
      )}
    </button>
  );
}
```

### 5. Mobile Bottom Sheet for Resort Details (Advanced)

```tsx
// Instead of popups, use a draggable bottom sheet
// This is a more complex implementation - consider using a library like react-spring-bottom-sheet
```

### 6. Disable Scroll Zoom on Mobile (Touch to Enable)

```tsx
// In ResortMapView.tsx
<MapContainer
  center={[44, -98]}
  zoom={4}
  scrollWheelZoom={false} // Disable by default
  tap={true}
  touchZoom={true}
  className="w-full h-[500px] lg:h-[600px]"
>
  {/* Enable scroll zoom on map click/focus */}
  <MapEventHandler />
</MapContainer>

// MapEventHandler component
function MapEventHandler() {
  const map = useMap();

  useEffect(() => {
    map.on('focus', () => map.scrollWheelZoom.enable());
    map.on('blur', () => map.scrollWheelZoom.disable());
  }, [map]);

  return null;
}
```

## Acceptance Criteria

- [ ] Legend collapsible on mobile, expanded on desktop
- [ ] Map markers have larger touch targets (40px+)
- [ ] First-time users see pinch-to-zoom hint on touch devices
- [ ] "Locate Me" button works and centers map on user location
- [ ] Scroll zoom doesn't interfere with page scrolling
- [ ] Map interactions feel natural on touch devices
- [ ] All controls meet 44px touch target minimum

## Testing

1. Test on mobile device with touch interactions
2. Verify legend collapses and expands
3. Test marker tapping - should be easy to tap
4. Verify pinch-to-zoom hint appears once
5. Test "Locate Me" with location permissions
6. Verify page scrolling isn't hijacked by map

## Effort: Medium (2-4 hours)
