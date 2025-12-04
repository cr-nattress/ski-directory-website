# Story 29.1: Optimize Gallery Images with Next.js Image

## Priority: Critical

## Context

The WebcamGallery and PhotoGallery components use native `<img>` tags for external images, bypassing Next.js image optimization. This impacts Core Web Vitals (LCP, CLS) and overall page performance.

## Current State

**Locations:**
- `apps/v1/components/resort-detail/WebcamGallery.tsx:60, 113`
- `apps/v1/components/resort-detail/PhotoGallery.tsx:51, 67, 88, 116`

**Current Code:**
```typescript
// eslint-disable-next-line @next/next/no-img-element
<img
  src={webcam.image}
  alt={webcam.name}
  className="w-full h-full object-cover"
  loading="lazy"
/>
```

## Requirements

1. Replace native `<img>` tags with Next.js `Image` component
2. Use `unoptimized` prop for external domains that can't be whitelisted
3. Add proper `sizes` attribute for responsive behavior
4. Maintain existing error handling and lazy loading
5. Ensure lightbox modal images also use Image component

## Implementation

### WebcamGallery.tsx

Replace the thumbnail image:
```typescript
<Image
  src={webcam.image}
  alt={webcam.name}
  fill
  className="object-cover group-hover:scale-105 transition-transform duration-200"
  onError={() => handleImageError(webcam.image)}
  unoptimized
  sizes="(max-width: 768px) 50vw, 33vw"
/>
```

Replace the lightbox image:
```typescript
<Image
  src={selectedWebcam.image}
  alt={selectedWebcam.name}
  width={1280}
  height={720}
  className="w-full h-auto"
  unoptimized
/>
```

### PhotoGallery.tsx

Apply similar changes to all `<img>` elements.

## Acceptance Criteria

- [ ] All native `<img>` tags replaced with Next.js `Image` component
- [ ] Images load with proper lazy loading
- [ ] Error states still work correctly
- [ ] Lightbox modal displays images correctly
- [ ] No eslint-disable comments for `@next/next/no-img-element`
- [ ] Lighthouse performance score maintained or improved

## Testing

1. Load resort detail page with webcams
2. Verify images lazy load on scroll
3. Test image error fallback by blocking an image URL
4. Open lightbox and verify full-size image renders
5. Run Lighthouse audit and compare LCP scores

## Effort: Medium (2-4 hours)
