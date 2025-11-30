# Interactive Ski Resort Map Implementation Plan

## Overview

Add an interactive map view to the landing page as an alternative to the resort card grid. Users can toggle between "Cards" and "Map" views below the hero section.

---

## Architecture Decisions

### Map Library: Leaflet (Already Installed)
- **Why not Mapbox?** Leaflet is already installed and used in `LocationMapCard.tsx`
- **Benefits:** No additional API keys needed, OSS, existing patterns in codebase
- **Trade-off:** Less fancy styling than Mapbox, but functional and free

### Data Source: Optimized Supabase View
- Create a new `resorts_map_pins` view with minimal fields for fast loading
- Cache results in browser using React Query or SWR pattern
- Fallback to mock data when Supabase is disabled

### Toggle UX: Segmented Control
- Position between Hero and content section
- Persist preference in localStorage
- Animate transition between views

---

## Implementation Tasks

### Phase 1: Supabase Optimization

#### 1.1 Create `resorts_map_pins` View
**Location:** Supabase SQL Editor / migration file

```sql
CREATE OR REPLACE VIEW resorts_map_pins AS
SELECT
  id,
  slug,
  name,
  latitude,
  longitude,
  nearest_city,
  state_code,
  pass_affiliations,
  rating,
  status,
  is_active,
  is_lost,
  terrain_open_percent,
  snowfall_24h
FROM resorts
WHERE is_active = true OR is_lost = true;
```

**Fields rationale:**
- `id, slug, name` - Identity and navigation
- `latitude, longitude` - Map positioning
- `nearest_city, state_code` - Popup context
- `pass_affiliations` - Marker color coding (Epic=red, Ikon=orange)
- `rating` - Popup display
- `status` - Open/closed badge
- `is_active, is_lost` - Filter active vs lost resorts
- `terrain_open_percent, snowfall_24h` - Quick stats for popup

#### 1.2 Create TypeScript Type
**File:** `apps/v1/lib/mock-data/types.ts`

```typescript
export interface ResortMapPin {
  id: string;
  slug: string;
  name: string;
  latitude: number;
  longitude: number;
  nearestCity: string;
  stateCode: string;
  passAffiliations: PassAffiliation[];
  rating: number;
  status: 'open' | 'closed' | 'opening-soon';
  isActive: boolean;
  isLost: boolean;
  terrainOpenPercent?: number;
  snowfall24h?: number;
}
```

#### 1.3 Add Supabase Service Method
**File:** `apps/v1/lib/api/supabase-resort-service.ts`

```typescript
async getMapPins(): Promise<ApiResponse<ResortMapPin[]>> {
  const { data, error } = await supabase
    .from('resorts_map_pins')
    .select('*');

  if (error) throw error;
  return { data: adaptMapPins(data), status: 'success' };
}
```

#### 1.4 Add Resort Service Method (with mock fallback)
**File:** `apps/v1/lib/api/resort-service.ts`

```typescript
async getMapPins(): Promise<ApiResponse<ResortMapPin[]>> {
  if (USE_SUPABASE) {
    return supabaseResortService.getMapPins();
  }

  // Mock fallback - extract minimal data from full resorts
  const pins = mockResorts
    .filter(r => r.isActive || r.isLost)
    .map(r => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      latitude: r.location.lat,
      longitude: r.location.lng,
      nearestCity: r.nearestCity,
      stateCode: 'CO', // Currently Colorado only
      passAffiliations: r.passAffiliations,
      rating: r.rating,
      status: r.conditions.status,
      isActive: r.isActive,
      isLost: r.isLost,
      terrainOpenPercent: r.conditions.terrainOpen,
      snowfall24h: r.conditions.snowfall24h,
    }));

  return { data: pins, status: 'success' };
}
```

---

### Phase 2: Browser Caching

#### 2.1 Create Custom Hook with Caching
**File:** `apps/v1/lib/hooks/useMapPins.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { resortService } from '@/lib/api/resort-service';
import { ResortMapPin } from '@/lib/mock-data/types';

const CACHE_KEY = 'ski-map-pins';
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

interface CachedData {
  pins: ResortMapPin[];
  timestamp: number;
}

export function useMapPins() {
  const [pins, setPins] = useState<ResortMapPin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPins = useCallback(async (bypassCache = false) => {
    try {
      // Check cache first
      if (!bypassCache) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { pins: cachedPins, timestamp }: CachedData = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION_MS) {
            setPins(cachedPins);
            setIsLoading(false);
            return;
          }
        }
      }

      setIsLoading(true);
      const response = await resortService.getMapPins();

      if (response.status === 'success') {
        setPins(response.data);
        // Cache the result
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          pins: response.data,
          timestamp: Date.now(),
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch map pins'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPins();
  }, [fetchPins]);

  return { pins, isLoading, error, refetch: () => fetchPins(true) };
}
```

---

### Phase 3: Map Component

#### 3.1 Create ResortMapView Component
**File:** `apps/v1/components/ResortMapView.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useRouter } from 'next/navigation';
import { useMapPins } from '@/lib/hooks/useMapPins';
import { ResortMapPin } from '@/lib/mock-data/types';
import { cn } from '@/lib/utils';
import L from 'leaflet';

// Custom marker icons by pass type
const createMarkerIcon = (passType: string, isLost: boolean) => {
  const color = isLost ? '#6b7280' : // gray for lost
    passType === 'epic' ? '#dc2626' : // red
    passType === 'ikon' ? '#f97316' : // orange
    '#3b82f6'; // blue default

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background:${color}" class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg border-2 border-white">⛷</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

export function ResortMapView() {
  const router = useRouter();
  const { pins, isLoading, error } = useMapPins();
  const [selectedPin, setSelectedPin] = useState<ResortMapPin | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Fix Leaflet default icon issue
  useEffect(() => {
    if (typeof window !== 'undefined') {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      setMapReady(true);
    }
  }, []);

  if (isLoading || !mapReady) {
    return (
      <div className="w-full h-[500px] lg:h-[600px] bg-neutral-100 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-neutral-500">Loading map...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[500px] lg:h-[600px] bg-neutral-100 rounded-xl flex items-center justify-center">
        <span className="text-red-500">Failed to load map</span>
      </div>
    );
  }

  // Colorado center coordinates
  const center: [number, number] = [39.0, -105.5];

  return (
    <div className="w-full h-[500px] lg:h-[600px] rounded-xl overflow-hidden border border-neutral-200 shadow-sm">
      <MapContainer
        center={center}
        zoom={7}
        className="w-full h-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {pins.map((pin) => {
          const primaryPass = pin.passAffiliations[0] || 'local';
          return (
            <Marker
              key={pin.id}
              position={[pin.latitude, pin.longitude]}
              icon={createMarkerIcon(primaryPass, pin.isLost)}
              eventHandlers={{
                click: () => setSelectedPin(pin),
              }}
            />
          );
        })}

        {selectedPin && (
          <Popup
            position={[selectedPin.latitude, selectedPin.longitude]}
            onClose={() => setSelectedPin(null)}
          >
            <div className="min-w-[200px] space-y-2">
              <h3 className="font-semibold text-lg">{selectedPin.name}</h3>
              <p className="text-sm text-neutral-600">{selectedPin.nearestCity}</p>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-yellow-500">★</span>
                <span>{selectedPin.rating.toFixed(1)}</span>
                {selectedPin.status === 'open' && (
                  <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">
                    Open
                  </span>
                )}
              </div>

              {selectedPin.snowfall24h > 0 && (
                <p className="text-sm text-ski-blue">
                  ❄️ {selectedPin.snowfall24h}" new snow
                </p>
              )}

              <div className="flex gap-1 flex-wrap">
                {selectedPin.passAffiliations.map((pass) => (
                  <span
                    key={pass}
                    className={cn(
                      'text-xs px-2 py-0.5 rounded text-white',
                      pass === 'epic' && 'bg-epic-red',
                      pass === 'ikon' && 'bg-ikon-orange',
                      pass === 'indy' && 'bg-purple-600',
                      pass === 'local' && 'bg-neutral-600'
                    )}
                  >
                    {pass}
                  </span>
                ))}
              </div>

              <button
                onClick={() => router.push(`/colorado/${selectedPin.slug}`)}
                className="w-full mt-2 bg-ski-blue text-white text-sm py-2 rounded-lg hover:bg-ski-blue/90 transition-colors"
              >
                View Details →
              </button>
            </div>
          </Popup>
        )}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg p-3 shadow-lg z-[1000]">
        <div className="text-xs font-semibold mb-2">Pass Types</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-epic-red"></div>
            <span>Epic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-ikon-orange"></div>
            <span>Ikon</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Local/Indy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-neutral-400"></div>
            <span>Lost</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### 3.2 Create Dynamic Import Wrapper
**File:** `apps/v1/components/ResortMapViewWrapper.tsx`

```typescript
'use client';

import dynamic from 'next/dynamic';

const ResortMapView = dynamic(
  () => import('./ResortMapView').then(mod => ({ default: mod.ResortMapView })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[500px] lg:h-[600px] bg-neutral-100 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-neutral-500">Loading map...</span>
      </div>
    ),
  }
);

export function ResortMapViewWrapper() {
  return <ResortMapView />;
}
```

---

### Phase 4: View Toggle Component

#### 4.1 Create ViewToggle Component
**File:** `apps/v1/components/ViewToggle.tsx`

```typescript
'use client';

import { cn } from '@/lib/utils';
import { Grid3X3, Map } from 'lucide-react';

export type ViewMode = 'cards' | 'map';

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="inline-flex items-center bg-neutral-100 rounded-lg p-1">
      <button
        onClick={() => onChange('cards')}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
          value === 'cards'
            ? 'bg-white text-neutral-900 shadow-sm'
            : 'text-neutral-600 hover:text-neutral-900'
        )}
      >
        <Grid3X3 className="w-4 h-4" />
        Cards
      </button>
      <button
        onClick={() => onChange('map')}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
          value === 'map'
            ? 'bg-white text-neutral-900 shadow-sm'
            : 'text-neutral-600 hover:text-neutral-900'
        )}
      >
        <Map className="w-4 h-4" />
        Map
      </button>
    </div>
  );
}
```

#### 4.2 Create useViewMode Hook (with localStorage persistence)
**File:** `apps/v1/lib/hooks/useViewMode.ts`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { ViewMode } from '@/components/ViewToggle';

const STORAGE_KEY = 'ski-directory-view-mode';

export function useViewMode(defaultMode: ViewMode = 'cards') {
  const [mode, setMode] = useState<ViewMode>(defaultMode);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ViewMode | null;
    if (stored === 'cards' || stored === 'map') {
      setMode(stored);
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage on change
  const setViewMode = (newMode: ViewMode) => {
    setMode(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);
  };

  return { mode, setMode: setViewMode, isHydrated };
}
```

---

### Phase 5: Update Landing Page

#### 5.1 Create ResortSection Component
**File:** `apps/v1/components/ResortSection.tsx`

```typescript
'use client';

import { useState } from 'react';
import { ViewToggle, ViewMode } from './ViewToggle';
import { ResortGrid } from './ResortGrid';
import { ResortMapViewWrapper } from './ResortMapViewWrapper';
import { useViewMode } from '@/lib/hooks/useViewMode';
import { cn } from '@/lib/utils';

export function ResortSection() {
  const { mode, setMode, isHydrated } = useViewMode('cards');

  return (
    <section className="space-y-6">
      {/* Header with toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-semibold">
          Colorado Ski Resorts
        </h2>
        {isHydrated && (
          <ViewToggle value={mode} onChange={setMode} />
        )}
      </div>

      {/* View content with transition */}
      <div className={cn(
        'transition-opacity duration-300',
        !isHydrated && 'opacity-0'
      )}>
        {mode === 'cards' ? (
          <ResortGrid />
        ) : (
          <ResortMapViewWrapper />
        )}
      </div>
    </section>
  );
}
```

#### 5.2 Update Main Page
**File:** `apps/v1/app/page.tsx`

```typescript
// Replace ResortGrid with ResortSection
import { ResortSection } from '@/components/ResortSection';

export default function Home() {
  return (
    <PageWrapper headerVariant="overlay">
      <Hero />
      <main className="container mx-auto px-4 py-8">
        <ResortSection />
        <ContentSection />
      </main>
      <Footer />
    </PageWrapper>
  );
}
```

---

### Phase 6: Leaflet CSS Fix

#### 6.1 Add Leaflet CSS Import
**File:** `apps/v1/app/globals.css`

Add at the top:
```css
@import 'leaflet/dist/leaflet.css';
```

#### 6.2 Custom Marker Styles
**File:** `apps/v1/app/globals.css`

```css
/* Custom map marker styles */
.custom-marker {
  background: transparent !important;
  border: none !important;
}

.leaflet-popup-content-wrapper {
  border-radius: 12px;
  padding: 0;
}

.leaflet-popup-content {
  margin: 12px;
}
```

---

## File Summary

| File | Action | Purpose |
|------|--------|---------|
| `migration/xxx_create_map_pins_view.sql` | Create | Supabase view for optimized map data |
| `lib/mock-data/types.ts` | Edit | Add `ResortMapPin` interface |
| `lib/api/supabase-resort-service.ts` | Edit | Add `getMapPins()` method |
| `lib/api/resort-service.ts` | Edit | Add `getMapPins()` with mock fallback |
| `lib/hooks/useMapPins.ts` | Create | Hook with localStorage caching |
| `lib/hooks/useViewMode.ts` | Create | View preference persistence |
| `lib/hooks/index.ts` | Edit | Export new hooks |
| `components/ResortMapView.tsx` | Create | Main map component |
| `components/ResortMapViewWrapper.tsx` | Create | SSR-safe wrapper |
| `components/ViewToggle.tsx` | Create | Cards/Map toggle UI |
| `components/ResortSection.tsx` | Create | Container with toggle |
| `app/page.tsx` | Edit | Use ResortSection |
| `app/globals.css` | Edit | Leaflet CSS imports |

---

## Performance Considerations

1. **Supabase View** - Only fetches 12 fields instead of full resort object (~70% smaller payload)
2. **Browser Caching** - 5-minute localStorage cache prevents redundant API calls
3. **Dynamic Import** - Map component only loads when user switches to map view
4. **Marker Clustering** - Consider adding `react-leaflet-cluster` if pin count grows large
5. **View Persistence** - Remembers user preference to avoid unnecessary re-renders

---

## Testing Checklist

- [ ] Map loads without SSR errors
- [ ] All resort pins display at correct locations
- [ ] Clicking pin opens popup with correct data
- [ ] "View Details" navigates to correct resort page
- [ ] Pass colors display correctly (Epic=red, Ikon=orange, etc.)
- [ ] Lost resorts show gray markers
- [ ] Toggle switches between cards and map smoothly
- [ ] View preference persists after page refresh
- [ ] Map works on mobile (touch zoom, tap markers)
- [ ] Cache expires and refreshes after 5 minutes
- [ ] Works with both Supabase and mock data

---

## Future Enhancements

1. **Marker Clustering** - Group nearby pins at low zoom levels
2. **Filter Integration** - Apply category filters to map markers
3. **Current Location** - "Resorts near me" button
4. **Route Planning** - Show driving routes from Denver
5. **Weather Overlay** - Snow forecast layer
6. **State Boundaries** - Highlight Colorado border
7. **Search on Map** - Pan/zoom to searched resort
