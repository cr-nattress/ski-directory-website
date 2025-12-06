# Story 39.3: Image Optimization - Proper Sizing

## Priority: P1 (High)
## Estimated Savings: 1.45s

## User Story

As a user, I want images sized appropriately for my device, so that I don't download unnecessarily large files.

## Problem

Lighthouse reports "Properly size images" with 1.45s potential savings. Images are being served at full resolution regardless of display size, wasting bandwidth.

## Current State

- Images stored at original resolution (often 2000px+ wide)
- Same image served to mobile and desktop
- No responsive image srcset

## Acceptance Criteria

- [ ] All images have responsive srcset with appropriate breakpoints
- [ ] Mobile users receive smaller images than desktop users
- [ ] Card images optimized for card dimensions (not hero size)
- [ ] Hero images have sizes attribute matching actual display size
- [ ] Lighthouse "Properly size images" opportunity resolved

## Technical Implementation

### 1. Image Size Strategy

| Context | Mobile | Tablet | Desktop | Max |
|---------|--------|--------|---------|-----|
| Hero | 640px | 1024px | 1200px | 1920px |
| Card | 320px | 400px | 400px | 400px |
| Gallery thumb | 160px | 200px | 200px | 200px |
| Trail map | 640px | 1024px | 1200px | 1920px |

### 2. Next.js Image with Sizes

```tsx
// Hero image - full width
<Image
  src={resort.heroImage}
  alt={resort.name}
  fill
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 1200px"
  priority
/>

// Card image - fixed width container
<Image
  src={resort.cardImage}
  alt={resort.name}
  width={400}
  height={300}
  sizes="(max-width: 640px) 100vw, 400px"
/>

// Gallery thumbnail
<Image
  src={thumb.url}
  alt={`${resort.name} photo ${index}`}
  width={200}
  height={150}
  sizes="200px"
/>
```

### 3. Generate Responsive Images at Upload

When images are uploaded to GCS, generate multiple sizes:

```typescript
// sizes to generate
const SIZES = [320, 640, 1024, 1200, 1920];

async function generateResponsiveImages(originalPath: string) {
  const sharp = require('sharp');

  for (const width of SIZES) {
    const outputPath = originalPath.replace('.jpg', `-${width}w.jpg`);
    await sharp(originalPath)
      .resize(width, null, { withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(outputPath);
  }
}
```

### 4. Update Image URL Helper

```typescript
// lib/supabase.ts
export function getResponsiveImageUrl(
  assetPath: string,
  width: number
): string {
  const baseUrl = 'https://storage.googleapis.com/ski-directory-assets';
  // Return size-specific image if available
  const sizedPath = assetPath.replace('.jpg', `-${width}w.jpg`);
  return `${baseUrl}/${sizedPath}`;
}
```

### 5. Components to Update

| Component | Current | Needed |
|-----------|---------|--------|
| `PhotoGallery.tsx` | Fixed width | `sizes` attribute |
| `ResortCard.tsx` | Full image | Card-specific size |
| `ResortHero.tsx` | Full image | Responsive sizes |

## Alternative: On-Demand Resizing

If pre-generating images isn't feasible:

1. **Cloudinary/imgix URL Parameters**
   ```
   https://res.cloudinary.com/.../w_400,q_80/image.jpg
   ```

2. **Next.js Image Optimization API**
   - Handles resizing automatically
   - Caches optimized versions

## Testing

1. Use Chrome DevTools to simulate mobile device
2. Check Network tab for image dimensions
3. Verify images match display size (not larger)
4. Run Lighthouse to confirm improvement

## Definition of Done

- [ ] All images have appropriate `sizes` attribute
- [ ] Mobile users receive appropriately sized images
- [ ] Card images are card-sized (not hero-sized)
- [ ] Lighthouse "Properly size images" resolved
- [ ] No visual quality degradation
