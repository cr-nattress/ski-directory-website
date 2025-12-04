# Story 29.9: Memoize Expensive Map Computations

## Priority: Medium

## Context

The ResortMapView component recreates all map markers on every render. With 100+ resorts, this causes unnecessary work and can impact performance during interactions.

## Current State

**Location:** `apps/v1/components/ResortMapView.tsx:145-248`

**Current Code:**
```typescript
{pins.map((pin) => {
  if (!pin.latitude || !pin.longitude) return null;

  const primaryPass = pin.passAffiliations[0] || 'local';
  const icon = createMarkerIcon(primaryPass, pin.isLost);

  if (!icon) return null;

  return (
    <Marker key={pin.id} position={[pin.latitude, pin.longitude]} icon={icon}>
      <Popup>...</Popup>
    </Marker>
  );
})}
```

## Requirements

1. Memoize marker icon creation
2. Memoize filtered/processed pin data
3. Avoid recreating popup content unnecessarily
4. Profile and measure improvement

## Implementation

### Memoize Marker Preparation

```typescript
import { useMemo, useCallback, memo } from 'react';

export function ResortMapView() {
  const router = useRouter();
  const { pins, isLoading, error } = useMapPins();
  const [mapReady, setMapReady] = useState(false);

  // Memoize icon cache
  const iconCache = useMemo(() => new Map<string, L.DivIcon>(), []);

  // Memoize icon getter with caching
  const getIcon = useCallback((passType: string, isLost: boolean) => {
    const key = `${passType}-${isLost}`;
    if (!iconCache.has(key)) {
      const icon = createMarkerIcon(passType, isLost);
      if (icon) iconCache.set(key, icon);
    }
    return iconCache.get(key);
  }, [iconCache]);

  // Memoize processed markers
  const markers = useMemo(() => {
    return pins
      .filter(pin => pin.latitude && pin.longitude)
      .map(pin => ({
        pin,
        position: [pin.latitude, pin.longitude] as [number, number],
        icon: getIcon(pin.passAffiliations[0] || 'local', pin.isLost),
      }))
      .filter(marker => marker.icon);
  }, [pins, getIcon]);

  // Rest of component...
}
```

### Extract Popup as Memoized Component

```typescript
interface MarkerPopupProps {
  pin: ResortMapPin;
  onNavigate: (path: string) => void;
}

const MarkerPopup = memo(function MarkerPopup({ pin, onNavigate }: MarkerPopupProps) {
  const handleClick = useCallback(() => {
    onNavigate(`/${pin.countryCode}/${pin.stateCode}/${pin.slug}`);
  }, [pin, onNavigate]);

  return (
    <Popup>
      <div className="min-w-[200px] space-y-2 p-1">
        <h3 className="font-semibold text-base">{pin.name}</h3>
        <p className="text-sm text-neutral-600">{pin.nearestCity}</p>
        {/* ... rest of popup content */}
        <button
          onClick={handleClick}
          className="w-full mt-2 bg-sky-600 text-white..."
        >
          View Details &rarr;
        </button>
      </div>
    </Popup>
  );
});
```

### Memoize Navigation Callback

```typescript
const handleNavigate = useCallback((path: string) => {
  router.push(path);
}, [router]);
```

### Updated Render

```typescript
return (
  <div className="relative w-full h-[500px]...">
    <MapContainer center={center} zoom={4} ...>
      <TileLayer ... />

      {markers.map(({ pin, position, icon }) => (
        <Marker key={pin.id} position={position} icon={icon}>
          <MarkerPopup pin={pin} onNavigate={handleNavigate} />
        </Marker>
      ))}
    </MapContainer>

    {/* Legend */}
  </div>
);
```

### Consider Marker Clustering (Future Enhancement)

For very large datasets, consider react-leaflet-cluster:

```typescript
import MarkerClusterGroup from 'react-leaflet-cluster';

<MarkerClusterGroup>
  {markers.map(...)}
</MarkerClusterGroup>
```

## Acceptance Criteria

- [ ] Icon creation cached to avoid recreation
- [ ] Marker data processed only when pins change
- [ ] Popup component memoized
- [ ] Navigation callback stable reference
- [ ] No visible performance regression
- [ ] React DevTools shows fewer re-renders

## Testing

1. Open React DevTools Profiler
2. Record while interacting with map
3. Compare render counts before/after
4. Test with 200+ pins for stress test
5. Measure time to initial render

## Performance Metrics

Capture before/after:
- Initial map render time
- Re-render time on interaction
- Memory usage with DevTools

## Effort: Small (< 2 hours)
