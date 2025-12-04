# Story 32.3: Increase Touch Targets to 44px Minimum

## Priority: High

## Context

Several interactive elements in the app are below the 44x44px minimum touch target size recommended by WCAG 2.1 and Apple Human Interface Guidelines. This affects usability on touch devices and accessibility compliance.

## Current State

**Undersized Elements Identified:**

| Component | Element | Current Size | Location |
|-----------|---------|--------------|----------|
| Header | Menu button | `p-2` (~32px) | `Header.tsx:44` |
| ViewToggle | Toggle buttons | `px-4 py-2` (~36px height) | `ViewToggle.tsx:31` |
| Footer | Social icons | `w-5 h-5` (~20px) | `Footer.tsx:88-113` |
| ResortCard | Various buttons | Varies | Multiple |
| DirectoryList | Expand button | `py-2` (~32px) | `DirectoryList.tsx` |

## Requirements

1. Increase all touch targets to minimum 44x44px on mobile
2. Maintain visual appearance (icon sizes can stay the same)
3. Add appropriate padding/hit areas without affecting layout
4. Ensure adequate spacing between adjacent targets (8px minimum)
5. Apply `touch-manipulation` for faster tap response

## Implementation

### 1. Header Menu Button

```tsx
// Before
<button className={cn('p-2', ...)}>

// After
<button className={cn('p-2 min-h-[44px] min-w-[44px] flex items-center justify-center', ...)}>
```

### 2. ViewToggle Buttons

```tsx
// Before
<button className={cn('flex items-center gap-2 px-4 py-2 rounded-md...', ...)}>

// After
<button className={cn('flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-md...', ...)}>
```

### 3. Footer Social Icons

```tsx
// Before
<a className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
  <svg className="w-5 h-5" ...>

// After
<a
  className="text-gray-400 hover:text-white transition-colors p-2 -m-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
  aria-label="Instagram"
>
  <svg className="w-5 h-5" ...>
```

Note: The `-m-2` compensates for the added padding to maintain visual layout.

### 4. Global Touch Optimization

Add to `globals.css`:

```css
/* Improve touch responsiveness */
button,
a,
[role="button"] {
  touch-action: manipulation;
}

/* Utility class for touch targets */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}
```

### 5. Create Utility Component (Optional)

```tsx
// components/ui/TouchTarget.tsx
interface TouchTargetProps {
  children: React.ReactNode;
  className?: string;
  as?: 'button' | 'a' | 'div';
}

export function TouchTarget({ children, className, as: Component = 'button' }: TouchTargetProps) {
  return (
    <Component
      className={cn(
        'min-h-[44px] min-w-[44px] flex items-center justify-center',
        className
      )}
    >
      {children}
    </Component>
  );
}
```

## Components to Update

1. **Header.tsx** - Menu button
2. **ViewToggle.tsx** - Both toggle buttons
3. **Footer.tsx** - All social media links
4. **DirectoryList.tsx** - Expand/collapse buttons
5. **ResortCard.tsx** - Any small buttons
6. **PhotoGallery.tsx** - Navigation arrows, close button
7. **ResortMapView.tsx** - Legend toggle, zoom controls

## Acceptance Criteria

- [ ] All interactive elements meet 44x44px minimum touch target
- [ ] Visual appearance unchanged (icons remain same size)
- [ ] Spacing between adjacent targets is at least 8px
- [ ] `touch-manipulation` applied globally to interactive elements
- [ ] No layout shifts from sizing changes
- [ ] Tested on actual touch device or DevTools touch simulation

## Testing

1. Use browser DevTools to measure element sizes
2. Enable touch simulation in DevTools
3. Attempt to tap each interactive element
4. Verify no mis-taps from elements too close together
5. Test on physical mobile device if available
6. Run accessibility audit (Lighthouse/axe)

## Visual Verification Technique

```css
/* Temporary debug style to visualize touch targets */
button, a, [role="button"] {
  outline: 2px solid rgba(255, 0, 0, 0.3) !important;
}
```

## Effort: Small (< 2 hours)
