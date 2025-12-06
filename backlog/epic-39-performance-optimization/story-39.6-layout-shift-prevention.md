# Story 39.6: Layout Shift Prevention (CLS)

## Priority: P0 (Critical)
## Current CLS: 0.712 (Target: <0.1)

## User Story

As a user, I want the page to not jump around while loading, so that I don't accidentally click the wrong thing.

## Problem

Lighthouse reports CLS of **0.712** which is extremely poor (should be <0.1). This means elements are shifting significantly after initial render, causing a jarring user experience.

## Common CLS Causes

1. **Images without dimensions** - Images load and push content down
2. **Ads/embeds without reserved space** - Dynamic content loading
3. **Web fonts causing FOIT/FOUT** - Text resizing on font load
4. **Dynamic content injection** - Content added after initial paint
5. **Animations/transitions** - CSS properties that trigger layout

## Acceptance Criteria

- [ ] CLS < 0.1 (good score)
- [ ] All images have explicit width/height or aspect-ratio
- [ ] Font loading optimized to prevent text shift
- [ ] Dynamic content has placeholder/skeleton
- [ ] Map container has fixed height
- [ ] Accordion/expand animations don't cause layout shift

## Technical Implementation

### 1. Identify Shifting Elements

Use Chrome DevTools:
1. Open Performance panel
2. Check "Screenshots" and "Web Vitals"
3. Record page load
4. Look for "Layout Shift" markers

Or use Layout Shift Debugger:
```javascript
// Paste in console
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('Layout Shift:', entry.value, entry.sources);
  }
}).observe({ type: 'layout-shift', buffered: true });
```

### 2. Fix Image Dimensions

```tsx
// Bad - no dimensions
<img src={resort.heroImage} alt={resort.name} />

// Good - explicit dimensions
<img
  src={resort.heroImage}
  alt={resort.name}
  width={1200}
  height={800}
/>

// Good - aspect-ratio container
<div className="aspect-video">
  <img
    src={resort.heroImage}
    alt={resort.name}
    className="w-full h-full object-cover"
  />
</div>

// Good - Next.js Image with fill
<div className="relative w-full h-[400px]">
  <Image
    src={resort.heroImage}
    alt={resort.name}
    fill
    className="object-cover"
  />
</div>
```

### 3. Reserve Space for Dynamic Content

```tsx
// Map container - always same height
<div className="h-[400px] bg-gray-100">
  {isLoading ? <MapSkeleton /> : <LocationMap />}
</div>

// Card skeleton
function ResortCardSkeleton() {
  return (
    <div className="h-[300px] bg-gray-100 animate-pulse rounded-lg" />
  );
}
```

### 4. Optimize Font Loading

```tsx
// app/layout.tsx
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',  // Prevent FOIT
  variable: '--font-sans',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-display',
});
```

### 5. Fix Accordion/Expand Animations

```tsx
// Bad - changes height, causes shift
{isExpanded && <div>Content</div>}

// Good - animates max-height, content always in DOM
<div
  className={cn(
    'overflow-hidden transition-all duration-200',
    isExpanded ? 'max-h-96' : 'max-h-0'
  )}
>
  <div>Content</div>
</div>

// Or use CSS Grid for smoother animation
<div
  className="grid transition-all duration-200"
  style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
>
  <div className="overflow-hidden">Content</div>
</div>
```

### 6. Fix Header/Navigation Shifts

```tsx
// Reserve space for sticky header
<div className="h-16">  {/* Fixed height for header */}
  <header className="fixed top-0 left-0 right-0 h-16">
    ...
  </header>
</div>
```

### 7. Fix Photo Gallery

```tsx
// Reserve space for gallery
<div className="grid grid-cols-4 gap-2">
  {images.map((img, i) => (
    <div key={i} className="aspect-square relative">
      <Image
        src={img.url}
        alt={`Photo ${i}`}
        fill
        className="object-cover"
      />
    </div>
  ))}
</div>
```

## Testing

1. Use Lighthouse CLS measurement
2. Use Chrome DevTools Layout Shift visualizer
3. Test on slow 3G to see loading behavior
4. Test with JavaScript disabled (SSR content)

## Components to Audit

| Component | Issue | Fix |
|-----------|-------|-----|
| `PhotoGallery.tsx` | Images without dimensions | Add aspect-ratio |
| `ResortHero.tsx` | Hero image shift | Add fixed height |
| `LocationMapCard.tsx` | Map loading | Fixed container |
| `WeatherForecastCard.tsx` | Dynamic content | Skeleton |
| `ResortHeaderStats.tsx` | Expand animation | Use max-height |
| Header | Position shifts | Fixed height placeholder |

## Definition of Done

- [ ] CLS < 0.1 confirmed in Lighthouse
- [ ] All images have dimensions or aspect-ratio
- [ ] Font loading doesn't cause text shift
- [ ] Dynamic content has skeletons
- [ ] Animations don't trigger layout shifts
- [ ] Manual scroll test shows no visible jumping
