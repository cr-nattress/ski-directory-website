# Story 33.6: Implement Internal Linking Component

## Priority: Medium

## Context

Strong internal linking improves SEO by distributing page authority and helping search engines discover content. Currently, resort pages have limited cross-linking to related resorts.

## Current State

- No "Related Resorts" section on resort pages
- No state-based resort listings linked from resort pages
- Limited internal link structure beyond navigation

## Requirements

1. Create "Related Resorts" component showing similar resorts
2. Add "More Resorts in [State]" section
3. Add "Nearby Resorts" based on geography
4. Include contextual links in resort descriptions

## Implementation

### Related Resorts Component

```tsx
// components/resort-detail/RelatedResorts.tsx
import Link from 'next/link';
import { Resort } from '@/lib/mock-data/types';

interface RelatedResortsProps {
  currentResort: Resort;
  relatedResorts: Resort[];
  title?: string;
}

export function RelatedResorts({
  currentResort,
  relatedResorts,
  title = 'Related Resorts',
}: RelatedResortsProps) {
  if (relatedResorts.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-display font-bold mb-6">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatedResorts.slice(0, 6).map((resort) => (
          <Link
            key={resort.id}
            href={`/${resort.stateCode}/${resort.slug}`}
            className="block p-4 border rounded-lg hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold">{resort.name}</h3>
            <p className="text-sm text-gray-600">
              {resort.nearestCity}, {resort.stateCode.toUpperCase()}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {resort.stats.skiableAcres.toLocaleString()} acres
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

### Related Resort Logic

```tsx
// lib/api/resort-service.ts

// Get resorts with same pass affiliation
export async function getRelatedResortsByPass(
  resort: Resort,
  limit: number = 6
): Promise<Resort[]> {
  const allResorts = await getAllResorts();
  return allResorts
    .filter((r) =>
      r.id !== resort.id &&
      r.passAffiliations.some((pass) =>
        resort.passAffiliations.includes(pass)
      )
    )
    .slice(0, limit);
}

// Get resorts in same state
export async function getResortsInState(
  stateCode: string,
  excludeId?: string,
  limit: number = 6
): Promise<Resort[]> {
  const allResorts = await getAllResorts();
  return allResorts
    .filter((r) => r.stateCode === stateCode && r.id !== excludeId)
    .slice(0, limit);
}

// Get nearby resorts by distance
export async function getNearbyResorts(
  resort: Resort,
  maxDistanceMiles: number = 100,
  limit: number = 6
): Promise<Resort[]> {
  const allResorts = await getAllResorts();
  return allResorts
    .filter((r) => r.id !== resort.id)
    .map((r) => ({
      ...r,
      distance: calculateDistance(
        resort.location.lat,
        resort.location.lng,
        r.location.lat,
        r.location.lng
      ),
    }))
    .filter((r) => r.distance <= maxDistanceMiles)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}

function calculateDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  // Haversine formula
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
```

### Usage in Resort Page

```tsx
// app/[state]/[slug]/page.tsx
import { RelatedResorts } from '@/components/resort-detail/RelatedResorts';
import { getNearbyResorts, getResortsInState } from '@/lib/api/resort-service';

export default async function ResortPage({ params }) {
  const resort = await getResort(params.slug);
  const nearbyResorts = await getNearbyResorts(resort, 100, 3);
  const stateResorts = await getResortsInState(resort.stateCode, resort.id, 3);

  return (
    <>
      {/* Existing content */}

      <RelatedResorts
        currentResort={resort}
        relatedResorts={nearbyResorts}
        title="Nearby Resorts"
      />

      <RelatedResorts
        currentResort={resort}
        relatedResorts={stateResorts}
        title={`More Resorts in ${resort.stateCode.toUpperCase()}`}
      />
    </>
  );
}
```

## Acceptance Criteria

- [ ] RelatedResorts component created
- [ ] Nearby resorts shown on resort pages (within 100 miles)
- [ ] State resorts section added
- [ ] Links use proper href format for SEO
- [ ] No duplicate resorts in sections
- [ ] Mobile-responsive grid layout

## Testing

1. Verify related resort links work correctly
2. Check that current resort is excluded
3. Test on mobile for responsive layout
4. Use Screaming Frog to verify internal link structure

## Effort: Medium (2-3 hours)
