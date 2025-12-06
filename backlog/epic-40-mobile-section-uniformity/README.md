# Epic 40: Mobile Resort Detail Section Uniformity

## Overview

Standardize the mobile resort detail page sections to use a uniform collapsible accordion pattern. Currently, Location and Nearby sections render as standalone cards while Overview and other sections use the accordion pattern.

## Problem

On mobile resort detail pages:
- **Overview, Terrain & Conditions, Ski Shops, Dining** use accordion pattern (collapsible)
- **Location Map** renders as a standalone card with shadow/border
- **Nearby Services** renders as a tabbed card with shadow/border

This creates visual inconsistency and takes up more vertical space than necessary.

## Goal

Wrap Location and Nearby sections in accordion items to match Overview styling:
- Collapsible with chevron indicator
- Consistent header styling (text-lg font-semibold)
- No shadow/border on mobile (accordion handles styling)
- Uniform spacing and interaction

## Stories

### Story 40.1: Wrap Location Map in Accordion
- Move LocationMapCardWrapper inside AccordionItem
- Title: "Location"
- Default: collapsed (user can expand to see map)
- Remove card shadow/border styling on mobile

### Story 40.2: Wrap Nearby Services in Accordion
- Move NearbyServicesCard inside AccordionItem
- Title: "Nearby" or "Nearby Services"
- Default: collapsed
- Keep tabs functionality inside accordion content
- Remove outer card shadow/border styling on mobile

## Files to Modify

- `apps/v1/components/resort-detail/MobileResortSections.tsx` - Wrap sections in AccordionItem
- `apps/v1/components/resort-detail/LocationMapCard.tsx` - Optional: add prop to hide card styling
- `apps/v1/components/resort-detail/NearbyServicesCard.tsx` - Optional: add prop to hide card styling

## Acceptance Criteria

- [ ] Location section uses accordion pattern on mobile
- [ ] Nearby section uses accordion pattern on mobile
- [ ] All sections have consistent header styling
- [ ] Accordion expand/collapse works correctly
- [ ] Map loads correctly when Location accordion is opened
- [ ] Nearby tabs work correctly inside accordion
- [ ] No visual regression on desktop

## Technical Notes

- The Accordion component already handles the collapsible behavior
- LocationMapCard uses dynamic import (Leaflet) - should work inside accordion
- NearbyServicesCard has internal tab state - should persist inside accordion
- Consider adding a `variant="minimal"` prop to remove card styling when inside accordion
