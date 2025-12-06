# Story 39.2: Image Optimization - Next-gen Formats (WebP/AVIF)

## Priority: P0 (Critical)
## Estimated Savings: 10.57s

## User Story

As a user, I want images to load faster by using modern, efficient formats, so that the page is usable sooner on slower connections.

## Problem

Lighthouse reports "Serve images in next-gen formats" with 10.57s potential savings. Images are being served as JPEG/PNG instead of WebP/AVIF which offer 25-50% better compression.

## Current State

- Images stored in GCS as JPEG/PNG
- Next.js Image component not fully configured for optimization
- Total payload: 6,728 KiB (images are major contributor)

## Acceptance Criteria

- [ ] All images served as WebP with AVIF fallback where supported
- [ ] Next.js Image component handles format conversion automatically
- [ ] Image quality optimized (80-85% for photos, 90%+ for UI)
- [ ] Original images preserved in GCS (format conversion at edge)
- [ ] Lighthouse "Serve images in next-gen formats" shows 0 items
- [ ] Total image payload reduced by at least 40%

## Technical Implementation

### 1. Update next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Enable modern formats
    formats: ['image/avif', 'image/webp'],

    // Remote image domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/ski-directory-assets/**',
      },
    ],

    // Device sizes for srcset
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],

    // Image sizes for srcset
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Minimize quality for faster loads
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
};

module.exports = nextConfig;
```

### 2. Use Next.js Image Component Properly

```tsx
import Image from 'next/image';

// Instead of native img
<Image
  src={resort.heroImage}
  alt={resort.name}
  width={1200}
  height={800}
  quality={80}
  placeholder="blur"
  blurDataURL={resort.heroImageBlur}  // Low-res placeholder
/>
```

### 3. Create Image Loader for GCS

```typescript
// lib/image-loader.ts
const gcsLoader = ({ src, width, quality }: {
  src: string;
  width: number;
  quality?: number;
}) => {
  // If already using Next.js optimization
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`;
};

export default gcsLoader;
```

### 4. Generate Blur Placeholders

For each image, generate a low-res blur placeholder (stored in DB or generated):

```typescript
// During build or image upload
import { getPlaiceholder } from 'plaiceholder';

async function generateBlurPlaceholder(imageUrl: string) {
  const { base64 } = await getPlaiceholder(imageUrl);
  return base64;
}
```

### 5. Components to Update

| Component | Current | Target |
|-----------|---------|--------|
| `PhotoGallery.tsx` | `<img>` | `<Image>` with quality=80 |
| `ResortCard.tsx` | `<img>` | `<Image>` with quality=75 |
| `TrailMapCard.tsx` | `<img>` | `<Image>` with quality=85 |

## Alternative: GCS Image Serving

If Next.js optimization isn't sufficient, consider:

1. **Cloud CDN with Image Optimization**
   - Enable Google Cloud CDN
   - Use image transformation API

2. **Cloudinary/imgix Integration**
   - Upload to image CDN
   - Transform on-the-fly

## Testing

1. Check Network tab - images should show `content-type: image/webp` or `image/avif`
2. Compare file sizes before/after
3. Visual quality comparison (no noticeable degradation)
4. Run Lighthouse to verify improvement

## Files to Modify

- `apps/v1/next.config.js` - Image configuration
- `apps/v1/lib/image-loader.ts` - Custom loader (if needed)
- All components using images

## Definition of Done

- [ ] next.config.js updated with modern image formats
- [ ] All major images use Next.js Image component
- [ ] WebP/AVIF served to supported browsers
- [ ] Image payload reduced by 40%+
- [ ] Lighthouse shows improvement
- [ ] No visual quality regression
