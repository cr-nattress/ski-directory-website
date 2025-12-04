# Epic 32: Mobile UX Optimization

## Overview

Implement mobile-first UI/UX best practices for viewports less than tablet size (< 768px). This epic addresses navigation patterns, touch targets, content organization, and mobile-specific interactions to create a polished mobile experience.

**Analysis Date:** 2025-12-04
**Target Viewports:** < 768px (mobile), with considerations for 768px-1024px (tablet)

## Business Value

- Improved mobile user engagement and retention
- Better Core Web Vitals scores (especially CLS and INP)
- Accessibility compliance (WCAG touch target requirements)
- Competitive parity with modern mobile-first ski apps
- Reduced bounce rate from mobile users

## Current State Analysis

The app has baseline mobile responsiveness via Tailwind breakpoints but lacks:
- Proper desktop/mobile navigation split
- Mobile-specific navigation patterns (bottom nav)
- Consistent 44px touch targets
- Mobile-optimized search experience
- Collapsible content sections
- Mobile gesture support (pull-to-refresh)

## Stories

### High Priority
| Story | Title | Effort |
|-------|-------|--------|
| 32.1 | Implement responsive header with desktop nav | S |
| 32.2 | Add sticky mobile bottom navigation bar | M |
| 32.3 | Increase touch targets to 44px minimum | S |

### Medium Priority
| Story | Title | Effort |
|-------|-------|--------|
| 32.4 | Simplify hero search for mobile | L |
| 32.5 | Add collapsible sections to resort detail | M |
| 32.6 | Optimize map view for touch interactions | M |

### Low Priority
| Story | Title | Effort |
|-------|-------|--------|
| 32.7 | Implement pull-to-refresh on lists | M |
| 32.8 | Add horizontal scroll for filter chips | S |
| 32.9 | Implement consistent skeleton loading states | S |
| 32.10 | Improve mobile footer layout | S |

## Effort Legend
- **S** = Small (< 2 hours)
- **M** = Medium (2-4 hours)
- **L** = Large (4-8 hours)

## Dependencies

- None - all stories can be worked independently
- Recommended order: 32.1 → 32.2 → 32.3 (navigation foundation first)

## Technical Guidelines

### Breakpoint Strategy
```
< 640px  (sm:)  - Mobile phones
< 768px  (md:)  - Large phones / small tablets
< 1024px (lg:)  - Tablets
≥ 1024px        - Desktop
```

### Touch Target Standards
- Minimum size: 44x44px (Apple HIG / WCAG)
- Minimum spacing: 8px between targets
- Use `min-h-[44px] min-w-[44px]` for icon buttons

### Mobile-First Patterns
```tsx
// Correct: mobile-first with desktop override
className="block md:hidden"      // Mobile only
className="hidden md:block"      // Desktop only
className="flex flex-col md:flex-row"  // Stack → row
```

### Safe Area Handling (iOS)
```css
padding-bottom: env(safe-area-inset-bottom);
```

## Acceptance Criteria

- [ ] Header shows horizontal nav on md: and above, hamburger below
- [ ] Bottom nav visible on mobile with 4-5 key actions
- [ ] All interactive elements meet 44px minimum touch target
- [ ] Mobile search uses simplified modal pattern
- [ ] Resort detail sections are collapsible on mobile
- [ ] Map has touch-friendly controls and dismissible legend
- [ ] No horizontal scroll issues on any mobile viewport
- [ ] Lighthouse mobile score ≥ 90 for performance

## Testing Checklist

- [ ] Test on iPhone SE (375px) - smallest common viewport
- [ ] Test on iPhone 14 Pro (393px) - standard iOS
- [ ] Test on Pixel 7 (412px) - standard Android
- [ ] Test on iPad Mini (768px) - tablet breakpoint
- [ ] Test touch interactions with device DevTools
- [ ] Verify safe area insets on notched devices
- [ ] Test with screen readers (VoiceOver, TalkBack)

## Related Documents

- [CLAUDE.md](../../CLAUDE.md) - Architecture overview
- [Epic 29](../epic-29-react-audit-fixes/) - Accessibility improvements (story 29.8)
