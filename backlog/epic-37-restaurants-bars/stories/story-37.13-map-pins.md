# Story 37.13: Map Pins for Dining Venues

## Description

Add dining venue markers to the location map component with differentiated styling by venue type.

## Acceptance Criteria

- [ ] Dining venue pins on location map
- [ ] Different colors/icons for venue types:
  - Restaurant: Red fork/knife
  - Bar: Purple cocktail glass
  - Brewery: Orange beer mug
  - Cafe: Blue coffee cup
  - Lodge Dining: Teal mountain
- [ ] Popup on click with venue info
- [ ] Toggle to show/hide dining venues
- [ ] Legend for venue types
- [ ] Cluster markers when zoomed out
- [ ] Auto-fit bounds to include dining venues

## Map Pin Colors

```typescript
// lib/utils/map-pins.ts
export const DINING_PIN_COLORS = {
  restaurant: '#e74c3c',   // Red
  bar: '#9b59b6',          // Purple
  brewery: '#f39c12',      // Orange
  cafe: '#3498db',         // Blue
  food_truck: '#2ecc71',   // Green
  lodge_dining: '#1abc9c', // Teal
};

export function getDiningPinColor(venueTypes: string[]): string {
  // Priority order for mixed-type venues
  const priority = ['lodge_dining', 'brewery', 'bar', 'restaurant', 'cafe', 'food_truck'];
  for (const type of priority) {
    if (venueTypes.includes(type)) {
      return DINING_PIN_COLORS[type];
    }
  }
  return DINING_PIN_COLORS.restaurant;
}
```

## Custom Marker Component

```tsx
// components/map/DiningMarker.tsx
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { DiningVenue } from '@/lib/types/dining';
import { getDiningPinColor, VENUE_TYPE_LABELS } from '@/lib/utils/dining-helpers';

interface DiningMarkerProps {
  venue: DiningVenue;
  resortSlug: string;
}

export function DiningMarker({ venue, resortSlug }: DiningMarkerProps) {
  const color = getDiningPinColor(venue.venue_type);

  // Custom SVG icon
  const icon = L.divIcon({
    className: 'dining-marker',
    html: `
      <div style="
        width: 28px;
        height: 28px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
          ${getVenueIcon(venue.venue_type[0])}
        </svg>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });

  return (
    <Marker position={[venue.latitude, venue.longitude]} icon={icon}>
      <Popup className="dining-popup">
        <div className="p-2 min-w-[200px]">
          <h4 className="font-semibold text-gray-900">{venue.name}</h4>
          <div className="text-sm text-gray-600 mt-1">
            <span>{VENUE_TYPE_LABELS[venue.venue_type[0]]}</span>
            <span className="mx-1">•</span>
            <span>{venue.price_range}</span>
          </div>
          {venue.is_on_mountain && (
            <div className="text-xs text-purple-600 mt-1">
              On-Mountain • {venue.mountain_location}
            </div>
          )}
          <div className="flex gap-2 mt-2">
            {venue.phone && (
              <a
                href={`tel:${venue.phone}`}
                className="text-xs text-blue-600"
              >
                Call
              </a>
            )}
            {venue.website_url && (
              <a
                href={venue.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600"
              >
                Website
              </a>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

function getVenueIcon(type: string): string {
  // SVG path data for each icon type
  const icons = {
    restaurant: '<path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>',
    bar: '<path d="M21 5V3H3v2l8 9v5H6v2h12v-2h-5v-5l8-9z"/>',
    brewery: '<path d="M4 5h16v2H4zM4 9h14v10H4zM20 9h1v6h-1zM6 11h2v6H6z"/>',
    cafe: '<path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3z"/>',
    food_truck: '<path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>',
    lodge_dining: '<path d="M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z"/>',
  };
  return icons[type] || icons.restaurant;
}
```

## Integration with LocationMapCard

Update LocationMapCard to include dining venue markers:

```tsx
// In LocationMapCard.tsx
import { DiningMarker } from './DiningMarker';

interface LocationMapCardProps {
  resort: Resort;
  skiShops?: SkiShop[];
  diningVenues?: DiningVenue[];
  showDining?: boolean;
  fillHeight?: boolean;
}

export function LocationMapCard({
  resort,
  skiShops = [],
  diningVenues = [],
  showDining = true,
  fillHeight = false,
}: LocationMapCardProps) {
  const [showDiningPins, setShowDiningPins] = useState(showDining);

  return (
    <div className={...}>
      {/* Toggle for dining pins */}
      <div className="absolute top-2 right-2 z-[1000] bg-white rounded shadow px-2 py-1">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showDiningPins}
            onChange={(e) => setShowDiningPins(e.target.checked)}
          />
          Show Dining
        </label>
      </div>

      <MapContainer ...>
        {/* Resort marker */}
        <Marker position={...} />

        {/* Ski shop markers */}
        {skiShops.map(...)}

        {/* Dining venue markers */}
        {showDiningPins && diningVenues.map((venue) => (
          <DiningMarker
            key={venue.id}
            venue={venue}
            resortSlug={resort.slug}
          />
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 z-[1000] bg-white rounded shadow p-2 text-xs">
        <div className="font-medium mb-1">Legend</div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          Restaurant
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-purple-500" />
          Bar
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-orange-500" />
          Brewery
        </div>
      </div>
    </div>
  );
}
```

## Effort

Medium (2-3 hours)
