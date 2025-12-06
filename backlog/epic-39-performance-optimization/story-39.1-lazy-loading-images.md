# Story 39.1: Image Optimization - Lazy Loading

## Priority: P0 (Critical)
## Estimated Savings: 21.71s

## User Story

As a user, I want pages to load quickly by only loading images that are visible on screen, so that I can start interacting with the page faster.

## Problem

Lighthouse reports "Defer offscreen images" with 21.71s potential savings - the largest opportunity. All images are being loaded on initial page load, even those far below the viewport.

## Acceptance Criteria

- [ ] All images below the fold use native `loading="lazy"` attribute
- [ ] Hero images and LCP candidates use `loading="eager"` (above-fold)
- [ ] Next.js Image components use `priority` prop for above-fold images
- [ ] Photo gallery thumbnails use lazy loading
- [ ] Resort card images in directory view use lazy loading
- [ ] Map pin popups load images lazily (on popup open)
- [ ] Trail map images load lazily
- [ ] Lighthouse "Defer offscreen images" shows 0 items

## Technical Implementation

### 1. Audit Current Image Usage

Find all `<img>` tags and `Image` components:
```bash
grep -r "<img" apps/v1/components/
grep -r "from 'next/image'" apps/v1/components/
```

### 2. Next.js Image Component Updates

```tsx
// Above-fold (hero, LCP candidate)
<Image
  src={resort.heroImage}
  alt={resort.name}
  priority  // Preload for LCP
  loading="eager"
/>

// Below-fold (gallery, cards)
<Image
  src={thumbnail}
  alt={`${resort.name} photo`}
  loading="lazy"  // Default in Next.js, but explicit
/>
```

### 3. Native img Tags

```tsx
// For any remaining native img tags
<img
  src={imageUrl}
  alt="description"
  loading="lazy"
  decoding="async"
/>
```

### 4. Components to Update

| Component | Image Type | Loading Strategy |
|-----------|------------|------------------|
| `ResortHero.tsx` | Hero image | `priority` / eager |
| `PhotoGallery.tsx` | Thumbnails | lazy |
| `ResortCard.tsx` | Card image | lazy (except first 4) |
| `TrailMapCard.tsx` | Trail map | lazy |
| `LocationMapCard.tsx` | Map tiles | lazy (handled by Leaflet) |

### 5. Intersection Observer (if needed)

For complex lazy loading scenarios:
```tsx
const [isVisible, setIsVisible] = useState(false);
const imgRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => setIsVisible(entry.isIntersecting),
    { rootMargin: '100px' }
  );
  if (imgRef.current) observer.observe(imgRef.current);
  return () => observer.disconnect();
}, []);
```

## Testing

1. Run Lighthouse audit before changes (baseline)
2. Implement lazy loading
3. Run Lighthouse audit after changes
4. Verify "Defer offscreen images" opportunity is resolved
5. Check that hero images still load immediately (no flash)
6. Test scroll behavior - images should load before entering viewport

## Files to Modify

- `apps/v1/components/resort-detail/ResortHero.tsx`
- `apps/v1/components/resort-detail/PhotoGallery.tsx`
- `apps/v1/components/ResortCard.tsx`
- `apps/v1/components/resort-detail/TrailMapCard.tsx`
- Any other components using images

## Definition of Done

- [ ] All below-fold images use lazy loading
- [ ] LCP image (hero) uses `priority` prop
- [ ] Lighthouse "Defer offscreen images" shows significant improvement
- [ ] No visual regression (images load before user sees placeholder)
- [ ] Code reviewed and merged
