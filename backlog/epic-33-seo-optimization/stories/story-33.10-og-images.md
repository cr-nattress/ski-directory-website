# Story 33.10: Implement Dynamic Open Graph Images per Resort

## Priority: Low

## Context

Custom Open Graph images for each resort improve social sharing appearance and click-through rates. Next.js 13+ supports dynamic OG image generation using the ImageResponse API.

## Current State

- Resort pages use hero images for OG (if available)
- No branded, consistent OG image format
- Missing resort stats in social previews

## Requirements

1. Create dynamic OG image generator
2. Include resort name, key stats, and branding
3. Generate at build time for performance
4. Fallback to default image if generation fails

## Implementation

### Dynamic OG Image Route

```tsx
// app/[countryCode]/[stateCode]/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og';
import { getResort } from '@/lib/services/resort-service';

export const runtime = 'edge';
export const alt = 'Ski Resort Information';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
  const resort = await getResort(params.slug);

  if (!resort) {
    // Return default OG image
    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 64,
            fontWeight: 'bold',
          }}
        >
          Ski Directory
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '60px',
          color: 'white',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ fontSize: 64, fontWeight: 'bold', margin: 0 }}>
              {resort.name}
            </h1>
            <p style={{ fontSize: 32, opacity: 0.8, margin: '10px 0 0 0' }}>
              {resort.nearestCity}, {resort.stateCode.toUpperCase()}
            </p>
          </div>
          {/* Pass badges */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {resort.passAffiliations.slice(0, 2).map((pass) => (
              <span
                key={pass}
                style={{
                  background: getPassColor(pass),
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: 24,
                  textTransform: 'capitalize',
                }}
              >
                {pass}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            marginTop: 'auto',
            marginBottom: '40px',
          }}
        >
          <Stat label="Skiable Acres" value={resort.stats.skiableAcres.toLocaleString()} />
          <Stat label="Runs" value={resort.stats.runsCount.toString()} />
          <Stat label="Vertical Drop" value={`${resort.stats.verticalDrop.toLocaleString()}ft`} />
          <Stat label="Lifts" value={resort.stats.liftsCount.toString()} />
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 24, opacity: 0.6 }}>skidirectory.org</p>
          {resort.rating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: 28 }}>★</span>
              <span style={{ fontSize: 28 }}>{resort.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <span style={{ fontSize: 48, fontWeight: 'bold' }}>{value}</span>
      <span style={{ fontSize: 20, opacity: 0.7 }}>{label}</span>
    </div>
  );
}

function getPassColor(pass: string): string {
  switch (pass) {
    case 'epic': return '#dc2626';
    case 'ikon': return '#f97316';
    case 'indy': return '#22c55e';
    default: return '#3b82f6';
  }
}
```

### Twitter Image (Optional separate)

```tsx
// app/[countryCode]/[stateCode]/[slug]/twitter-image.tsx
// Similar to opengraph-image but with Twitter's preferred 2:1 ratio
export const size = { width: 1200, height: 600 };
// ... rest similar to OG image
```

### Caching Strategy

For build-time generation with ISR:

```tsx
// In page.tsx
export const revalidate = 86400; // Regenerate daily

// Or use generateStaticParams
export async function generateStaticParams() {
  const resorts = await getAllResorts();
  return resorts.map((resort) => ({
    countryCode: resort.countryCode,
    stateCode: resort.stateCode,
    slug: resort.slug,
  }));
}
```

## Design Guidelines

- **Colors**: Use ski-blue gradient background (#1e3a5f to #0f172a)
- **Typography**: Bold resort name (64px), stats (48px)
- **Layout**: Name/location top-left, pass badges top-right, stats center, branding bottom
- **Pass colors**: Epic (red), Ikon (orange), Indy (green), Local (blue)

## Acceptance Criteria

- [ ] Dynamic OG images generated for resort pages
- [ ] Images include resort name, location, key stats
- [ ] Pass affiliations shown with correct colors
- [ ] Branding (skidirectory.org) included
- [ ] Fallback image for errors
- [ ] Images cached/generated at build time

## Testing

1. Use Facebook Sharing Debugger to preview OG image
2. Share resort link on Twitter/LinkedIn
3. Verify image loads quickly (should be cached)
4. Check all resorts have consistent formatting
5. Test fallback with invalid resort slug

## Effort: Medium (3-4 hours)
