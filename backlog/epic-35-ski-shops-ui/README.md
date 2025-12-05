# Epic 35: Ski Shops UI - Mobile-First Resort Detail Integration

## Overview

Display ski shop data on resort detail pages using a mobile-first, action-oriented design. The UI enables visitors to quickly find, call, and navigate to nearby ski shops for rentals, gear, and services.

## Business Value

- **User Experience**: One-tap access to call or get directions to ski shops
- **Mobile Focus**: Optimized for on-the-go users at or traveling to resorts
- **Trip Planning**: Help users find rental shops before arriving
- **Conversion Path**: Drive traffic to local ski shops (future partnership opportunity)

## Design Philosophy: Option E (Hybrid Smart Card)

### Mobile-First Principles

1. **Action-First**: Call and Directions buttons prominent and thumb-friendly
2. **On-Mountain Priority**: Highlight resort-operated shops first
3. **Progressive Disclosure**: Show top 3 shops, expand for more
4. **Touch Targets**: Minimum 44px for all interactive elements
5. **Contextual**: Service badges help users find what they need

### Mobile View (Accordion Section)

```
┌─────────────────────────────────────┐
│ 🎿 Ski Shops                    10  │
│    7 rental • 5 retail • 4 repair   │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 🏔️ ON MOUNTAIN                  │ │
│ │ Vail Mountain Rental            │ │
│ │ Rentals & boot fitting          │ │
│ │  ┌────────────────────────────┐ │ │
│ │  │        📞 Call Now         │ │ │
│ │  └────────────────────────────┘ │ │
│ │  ┌────────────────────────────┐ │ │
│ │  │      🗺️ Get Directions     │ │ │
│ │  └────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Black Tie Ski Rentals    2.6 mi │ │
│ │ 🚗 Delivers to your lodging!    │ │
│ │ [Rental]                        │ │
│ │  📞 Call    🗺️ Directions       │ │
│ └─────────────────────────────────┘ │
│  ┌───────────────────────────────┐  │
│  │      View All 10 Shops →      │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Desktop View (Sidebar Card)

```
┌─────────────────────────────────┐
│ 🎿 Nearby Ski Shops        (10) │
├─────────────────────────────────┤
│ [7 Rental] [5 Retail] [4 Tune] │
├─────────────────────────────────┤
│ 🏔️ Vail Mtn Rental     on-mtn  │
│    📞 970-555-0123              │
│ Black Tie Rentals      2.6 mi  │
│    Delivery available           │
│ Vail Sports            2.3 mi  │
│    Rental • Retail • Repair     │
├─────────────────────────────────┤
│       See All Shops →           │
└─────────────────────────────────┘
```

## Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                      Resort Detail Page                        │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  Mobile:                        Desktop:                      │
│  ┌─────────────────────┐       ┌──────────┬─────────────┐    │
│  │ MobileResortSections │       │ Left Col │ Right Col   │    │
│  │ └─ SkiShopsAccordion │       │          │ SkiShopsCard│    │
│  │    └─ SkiShopsList   │       │          │             │    │
│  │       └─ SkiShopCard │       └──────────┴─────────────┘    │
│  └─────────────────────┘                                      │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│                      Data Fetching                            │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Server: Fetch from GCS ski-shops.json (preferred)        │ │
│  │    OR                                                     │ │
│  │ Client: API route → Supabase resort_ski_shops view       │ │
│  └─────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```

## Stories

| ID | Story | Priority | Effort | Phase |
|----|-------|----------|--------|-------|
| 35.1 | TypeScript types for ski shop UI | High | Small | Setup |
| 35.2 | GCS data fetching service | High | Small | Data |
| 35.3 | SkiShopCard component (mobile-first) | High | Medium | UI |
| 35.4 | SkiShopsList component with expansion | High | Small | UI |
| 35.5 | Mobile accordion integration | High | Medium | Mobile |
| 35.6 | Desktop sidebar card | Medium | Small | Desktop |
| 35.7 | Service filter badges | Low | Small | Enhancement |
| 35.8 | Analytics tracking | Low | Small | Analytics |

## Component Structure

```
apps/v1/
├── components/
│   └── resort-detail/
│       ├── SkiShopCard.tsx          # Individual shop card
│       ├── SkiShopsList.tsx         # List with show more
│       ├── SkiShopsAccordion.tsx    # Mobile accordion section
│       └── SkiShopsCard.tsx         # Desktop sidebar card
├── lib/
│   ├── types/
│   │   └── ski-shop.ts              # TypeScript interfaces
│   └── services/
│       └── ski-shops-service.ts     # GCS/API data fetching
```

## Data Sources

### Option A: GCS (Preferred for Server Components)
- Fetch `ski-shops.json` from GCS using resort's `assetPath`
- URL pattern: `https://storage.googleapis.com/sda-assets-prod/resorts/{assetPath}/ski-shops.json`
- Already generated by ski-shop-enricher (Epic 34)

### Option B: Supabase API (Client Components)
- Use API endpoint from Story 34.12
- Query `resort_ski_shops` junction table with view

## Mobile UX Requirements

| Requirement | Implementation |
|-------------|----------------|
| Touch targets | Min 44px height for buttons |
| Call button | `tel:` link, full-width on mobile |
| Directions | `maps.google.com/?q=` or `maps.apple.com/?q=` |
| Loading state | Skeleton loader matching card size |
| Empty state | "No ski shops found nearby" message |
| Error state | Silent fail, don't break page |

## Success Metrics

| Metric | Target |
|--------|--------|
| Mobile tap rate on Call | Track via analytics |
| Mobile tap rate on Directions | Track via analytics |
| Page load impact | < 100ms additional |
| Component render time | < 50ms |

## Dependencies

- Epic 34: Ski Shop Enricher (completed - data exists in GCS/Supabase)
- Existing MobileResortSections accordion pattern
- Existing SocialMediaCard/LocationMapCard patterns

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| No shops for some resorts | Graceful empty state, don't show section |
| Stale phone/website data | Show "Verify before visiting" disclaimer |
| GCS fetch failure | Fallback to Supabase API or hide section |
| Too many shops cluttering UI | Progressive disclosure (show 3, expand for more) |
