# Story 29.8: Add Accessibility Attributes to Components

## Priority: Medium

## Context

Interactive components lack proper accessibility attributes, making the application harder to use with screen readers and other assistive technologies.

## Current State

**Key Locations:**
- `apps/v1/components/ResortCard.tsx` - Card links missing aria-label
- `apps/v1/components/ViewToggle.tsx` - Toggle buttons
- `apps/v1/components/resort-detail/WebcamGallery.tsx` - Modal and buttons

## Requirements

1. Add aria-labels to interactive elements
2. Ensure proper focus management in modals
3. Add keyboard navigation support
4. Use semantic HTML where appropriate

## Implementation

### ResortCard.tsx

```typescript
<Link
  href={`/${resort.countryCode}/${resort.stateCode}/${resort.slug}`}
  className="card group cursor-pointer"
  aria-label={`View details for ${resort.name} ski resort in ${resort.nearestCity}, ${resort.stateCode?.toUpperCase()}`}
>
```

### ViewToggle.tsx

```typescript
<div role="tablist" aria-label="View mode">
  <button
    role="tab"
    aria-selected={mode === 'cards'}
    aria-controls="resort-view"
    onClick={() => setMode('cards')}
    className={/* ... */}
  >
    <span className="sr-only">Card view</span>
    {/* icon */}
  </button>
  <button
    role="tab"
    aria-selected={mode === 'map'}
    aria-controls="resort-view"
    onClick={() => setMode('map')}
    className={/* ... */}
  >
    <span className="sr-only">Map view</span>
    {/* icon */}
  </button>
</div>

{/* In the view container */}
<div id="resort-view" role="tabpanel">
  {mode === 'cards' ? <CardsView /> : <MapView />}
</div>
```

### WebcamGallery.tsx - Modal

```typescript
{selectedWebcam && (
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="webcam-modal-title"
    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
    onClick={() => setSelectedWebcam(null)}
    onKeyDown={(e) => {
      if (e.key === 'Escape') setSelectedWebcam(null);
    }}
  >
    <div
      className="relative max-w-4xl w-full"
      onClick={e => e.stopPropagation()}
    >
      <button
        onClick={() => setSelectedWebcam(null)}
        aria-label="Close webcam viewer"
        className="absolute -top-12 right-0 text-white hover:text-neutral-300"
      >
        {/* close icon */}
      </button>

      <h2 id="webcam-modal-title" className="sr-only">
        {selectedWebcam.name} webcam
      </h2>

      {/* Image and content */}
    </div>
  </div>
)}
```

### WebcamGallery.tsx - Thumbnail Buttons

```typescript
<button
  key={`${webcam.name}-${index}`}
  onClick={() => setSelectedWebcam(webcam)}
  aria-label={`View ${webcam.name} webcam in full screen`}
  className="group relative aspect-video..."
>
```

### Focus Trap for Modals

Create `apps/v1/lib/hooks/useFocusTrap.ts`:

```typescript
import { useEffect, useRef } from 'react';

export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    // Focus first element on open
    firstElement?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);

  return containerRef;
}
```

### Screen Reader Only Class

Add to `apps/v1/app/globals.css` if not present:

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

## Acceptance Criteria

- [ ] ResortCard links have descriptive aria-labels
- [ ] ViewToggle uses proper ARIA tab roles
- [ ] Webcam modal has proper dialog roles
- [ ] Modal closes on Escape key
- [ ] Focus trapped within open modals
- [ ] Screen reader text for icon-only buttons

## Testing

1. Navigate using keyboard only
2. Test with VoiceOver (Mac) or NVDA (Windows)
3. Verify focus order makes sense
4. Check that modals trap focus
5. Run Lighthouse accessibility audit

## Effort: Small (< 2 hours)
