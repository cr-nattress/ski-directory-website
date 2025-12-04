# A-Z Directory Page - Implementation Plan

## Overview

The A-Z Directory page provides skiers with a comprehensive, scannable view of all Colorado ski resorts. Unlike the homepage grid view which emphasizes visual discovery, the A-Z Directory prioritizes **information density** and **quick comparison** — allowing users to rapidly assess resort conditions, stats, and make informed decisions.

---

## User Research: What Skiers Want

### Primary Use Cases

1. **"Where should I go today?"** — Quick snow conditions scan
2. **"Which resort fits my skill level?"** — Terrain comparison
3. **"What's open right now?"** — Real-time status check
4. **"Planning a trip"** — Side-by-side comparison of stats
5. **"Finding a specific resort"** — Alphabetical lookup

### Key Information Skiers Prioritize (In Order)

1. **Current Conditions** — 24h snowfall, base depth, terrain open %
2. **Resort Status** — Open/Closed, lifts operating
3. **Mountain Size** — Skiable acres, vertical drop
4. **Terrain Mix** — Beginner/Intermediate/Advanced/Expert %
5. **Pass Compatibility** — Epic, Ikon, Indy, Local
6. **Distance/Drive Time** — From Denver
7. **Ratings** — Community scores

---

## Design Concepts

### Option A: Condensed Table View (Recommended)

A data-dense table format inspired by financial dashboards and sports stats pages. Perfect for **power users** who want to scan and compare quickly.

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ A-Z Directory                                                    [View: Table ▾]   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ [Sort: A-Z ▾]  [Filter by Pass ▾]  [Status: All ▾]         Showing 12 resorts     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│ ┌────────────────────────────────────────────────────────────────────────────────┐  │
│ │ Resort           │ Status │ 24h Snow │ Base │ Open │ Acres  │ Vert  │ Pass    │  │
│ ├──────────────────┼────────┼──────────┼──────┼──────┼────────┼───────┼─────────┤  │
│ │ A-Basin          │ 🟢 Open│   6"     │ 48"  │ 85%  │ 1,428  │ 2,530 │ Ikon    │  │
│ │ Aspen Snowmass   │ 🟢 Open│  15"     │ 92"  │ 90%  │ 5,527  │ 4,406 │ Ikon    │  │
│ │ Beaver Creek     │ 🟢 Open│  10"     │ 80"  │ 87%  │ 2,082  │ 3,340 │ Epic    │  │
│ │ Breckenridge     │ 🟢 Open│   8"     │ 78"  │ 88%  │ 2,908  │ 3,398 │ Epic    │  │
│ │ Copper Mountain  │ 🟢 Open│   4"     │ 65"  │ 82%  │ 2,490  │ 2,738 │ Ikon    │  │
│ │ Crested Butte    │ 🟢 Open│  18"     │ 88"  │ 92%  │ 1,547  │ 3,062 │ Ikon    │  │
│ │ ...              │        │          │      │      │        │       │         │  │
│ └────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

**Pros:**
- Maximum information density
- Easy column sorting
- Fast scanning
- Familiar pattern for data comparison

**Cons:**
- Less visual appeal
- No imagery
- May feel "spreadsheet-like"

---

### Option B: Expanded Row Cards

A hybrid approach combining card aesthetics with table-like data presentation. Each resort gets a horizontal card with a small image thumbnail.

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │ [IMG] │ Arapahoe Basin                           🟢 OPEN    ⭐ 4.6 (1,234)  │   │
│  │       │ "The Legend" • Ikon Pass                                             │   │
│  │       │                                                                       │   │
│  │       │  ❄️ 6" new   📏 48" base   ⛷️ 85% open   🏔️ 1,428 acres   ↕️ 2,530' │   │
│  │       │                                                                       │   │
│  │       │  [████████░░] Terrain: 10% 🟢 30% 🔵 37% ⚫ 23% ⚫⚫              │   │
│  │       │                                                                       │   │
│  │       │  📍 68 mi from Denver (80 min)                    [View Resort →]   │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │ [IMG] │ Aspen Snowmass                           🟢 OPEN    ⭐ 4.9 (1,876)  │   │
│  │       │ "Four mountains, one unforgettable experience" • Ikon Pass          │   │
│  │       │                                                                       │   │
│  │       │  ❄️ 15" new  📏 92" base   ⛷️ 90% open   🏔️ 5,527 acres   ↕️ 4,406'│   │
│  │       │                                                                       │   │
│  │       │  [████████░░] Terrain: 20% 🟢 36% 🔵 26% ⚫ 18% ⚫⚫              │   │
│  │       │                                                                       │   │
│  │       │  📍 200 mi from Denver (4 hr)                     [View Resort →]   │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

**Pros:**
- More visually engaging
- Includes imagery
- Easier to read on mobile
- Shows terrain breakdown visually

**Cons:**
- Less compact
- Harder to compare across resorts
- More scrolling required

---

### Option C: Alphabetical Sections with Mini Cards (AllTrails-Inspired)

Group resorts by first letter with compact cards, good for directories with many items.

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                      │
│  ── A ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                      │
│  ┌──────────────────────────────┐  ┌──────────────────────────────────┐            │
│  │ Arapahoe Basin         🟢    │  │ Aspen Snowmass             🟢    │            │
│  │ ❄️ 6" │ 85% │ 1,428ac │ Ikon │  │ ❄️ 15" │ 90% │ 5,527ac │ Ikon  │            │
│  │ ⭐ 4.6 • 68 mi           →  │  │ ⭐ 4.9 • 200 mi            →  │            │
│  └──────────────────────────────┘  └──────────────────────────────────┘            │
│                                                                                      │
│  ── B ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                      │
│  ┌──────────────────────────────┐  ┌──────────────────────────────────┐            │
│  │ Beaver Creek            🟢    │  │ Breckenridge               🟢    │            │
│  │ ❄️ 10" │ 87% │ 2,082ac │ Epic │  │ ❄️ 8" │ 88% │ 2,908ac │ Epic  │            │
│  │ ⭐ 4.8 • 107 mi          →  │  │ ⭐ 4.7 • 85 mi             →  │            │
│  └──────────────────────────────┘  └──────────────────────────────────┘            │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

**Pros:**
- Clear alphabetical organization
- Quick letter navigation
- Balanced visual/data approach

**Cons:**
- Wasted space with few resorts per letter
- Less suitable for Colorado's 12 resorts (better for 50+)

---

## Recommended Approach: Hybrid Table + Cards

Given Colorado's 12 resorts, we recommend a **responsive hybrid design**:

### Desktop: Enhanced Data Table
- Sortable columns
- Inline status indicators
- Hover to reveal quick stats
- Row click navigates to detail page

### Mobile: Condensed List Cards
- Stack vertically
- Priority data visible
- Expandable for more details
- Swipe-friendly

---

## Data Fields to Display

### Primary (Always Visible)

| Field | Source | Display Format |
|-------|--------|----------------|
| Resort Name | `name` | Text link |
| Status | `conditions.status` | 🟢 Open / 🔴 Closed / 🟡 Opening Soon |
| 24h Snowfall | `conditions.snowfall24h` | `X"` or "—" if 0 |
| Base Depth | `conditions.baseDepth` | `X"` |
| Terrain Open | `conditions.terrainOpen` | `X%` with progress bar |
| Skiable Acres | `stats.skiableAcres` | `X,XXX` |
| Vertical Drop | `stats.verticalDrop` | `X,XXX'` |
| Pass | `passAffiliations` | Badge(s) |
| Rating | `rating` + `reviewCount` | `⭐ X.X (N)` |

### Secondary (Expandable/Hover)

| Field | Source | Display Format |
|-------|--------|----------------|
| 72h Snowfall | `conditions.snowfall72h` | `X" (72h)` |
| Lifts Open | `conditions.liftsOpen` / `stats.liftsCount` | `X/Y lifts` |
| Runs | `stats.runsCount` | `X runs` |
| Summit Elevation | `stats.summitElevation` | `XX,XXX'` |
| Base Elevation | `stats.baseElevation` | `X,XXX'` |
| Terrain Mix | `terrain.*` | Mini progress bars |
| Distance | `distanceFromDenver` | `X mi` |
| Drive Time | `driveTimeFromDenver` | `X hr Y min` |
| Annual Snowfall | `stats.avgAnnualSnowfall` | `XXX" avg/yr` |

---

## Sorting Options

| Sort Option | Field | Direction |
|-------------|-------|-----------|
| A-Z (default) | `name` | Ascending |
| Z-A | `name` | Descending |
| Most Snow (24h) | `conditions.snowfall24h` | Descending |
| Deepest Base | `conditions.baseDepth` | Descending |
| Most Terrain Open | `conditions.terrainOpen` | Descending |
| Largest Resort | `stats.skiableAcres` | Descending |
| Most Vertical | `stats.verticalDrop` | Descending |
| Highest Rated | `rating` | Descending |
| Nearest to Denver | `distanceFromDenver` | Ascending |

---

## Filtering Options

| Filter | Options |
|--------|---------|
| Pass Type | All, Epic, Ikon, Indy, Local |
| Status | All, Open Only, Closed |
| Resort Size | All, Large (2500+ acres), Medium, Small |
| Distance | All, Under 2 hrs, Under 3 hrs |

---

## Component Architecture

```
app/directory/
├── page.tsx                    # A-Z Directory page (Server Component)
└── components/
    ├── DirectoryTable.tsx      # Desktop table view (Client)
    ├── DirectoryList.tsx       # Mobile list view (Client)
    ├── DirectoryFilters.tsx    # Filter/sort controls (Client)
    ├── DirectoryRow.tsx        # Single resort row
    ├── DirectoryCard.tsx       # Mobile card variant
    ├── StatusBadge.tsx         # Open/Closed indicator
    ├── SnowfallCell.tsx        # Snowfall with icon
    ├── TerrainMiniBar.tsx      # Compact terrain breakdown
    └── PassBadges.tsx          # Epic/Ikon/etc badges
```

---

## Technical Implementation

### Route Structure

```
/directory          # A-Z Directory page
/directory?sort=snow&pass=epic    # With query params
```

### Data Fetching

```typescript
// app/directory/page.tsx
import { getAllResorts } from '@/lib/mock-data';

export default function DirectoryPage() {
  const resorts = getAllResorts().filter(r => r.isActive);

  return (
    <PageWrapper headerVariant="solid">
      <DirectoryHero />
      <DirectoryContent resorts={resorts} />
      <Footer />
    </PageWrapper>
  );
}
```

### Client-Side Sorting/Filtering

```typescript
// components/DirectoryContent.tsx
'use client';

export function DirectoryContent({ resorts }: { resorts: Resort[] }) {
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [filters, setFilters] = useState<FilterState>({});

  const sortedResorts = useMemo(() => {
    return sortResorts(filterResorts(resorts, filters), sortBy);
  }, [resorts, sortBy, filters]);

  return (
    <>
      <DirectoryFilters
        sortBy={sortBy}
        onSortChange={setSortBy}
        filters={filters}
        onFilterChange={setFilters}
      />
      {/* Responsive view switching */}
      <div className="hidden lg:block">
        <DirectoryTable resorts={sortedResorts} />
      </div>
      <div className="lg:hidden">
        <DirectoryList resorts={sortedResorts} />
      </div>
    </>
  );
}
```

---

## Visual Design Specifications

### Color Coding

| Element | Color | Tailwind Class |
|---------|-------|----------------|
| Status: Open | Green | `text-success-green` / `bg-green-100` |
| Status: Closed | Red | `text-red-600` / `bg-red-100` |
| Status: Opening Soon | Yellow | `text-yellow-600` / `bg-yellow-100` |
| Fresh Snow (>6") | Blue highlight | `bg-powder-blue/10` |
| Epic Pass | Red | `bg-epic-red` |
| Ikon Pass | Orange | `bg-ikon-orange` |
| Indy Pass | Purple | `bg-purple-600` |

### Typography

| Element | Style |
|---------|-------|
| Page Title | `font-display text-3xl font-bold` |
| Resort Name | `font-semibold text-ski-blue hover:underline` |
| Stats | `text-sm text-gray-700 tabular-nums` |
| Labels | `text-xs text-gray-500 uppercase tracking-wide` |

### Spacing

| Element | Value |
|---------|-------|
| Table row height | `h-14` (56px) |
| Cell padding | `px-4 py-3` |
| Card gap | `gap-4` |
| Section padding | `py-8` |

---

## Accessibility Considerations

1. **Table semantics** — Use proper `<table>`, `<thead>`, `<tbody>`, `<th scope>` elements
2. **Sort indicators** — Announce sort direction to screen readers
3. **Status icons** — Include `aria-label` for status badges
4. **Keyboard navigation** — Tab through rows, Enter to navigate
5. **Color contrast** — Ensure 4.5:1 ratio for all text
6. **Mobile touch targets** — Minimum 44x44px tap areas

---

## Performance Optimizations

1. **Static generation** — Pre-render at build time
2. **Client-side sorting** — No server round-trips for sort/filter
3. **Virtualization** — Consider for 50+ resorts (not needed for 12)
4. **Image lazy loading** — Only for expanded card view
5. **URL state** — Preserve sort/filter in query params for sharing

---

## Future Enhancements

### Phase 2
- [ ] Column visibility toggle (show/hide columns)
- [ ] Comparison mode (select 2-3 resorts to compare side-by-side)
- [ ] Export to CSV/PDF
- [ ] Saved filter presets

### Phase 3
- [ ] Real-time data updates (WebSocket for conditions)
- [ ] Historical snow data sparklines
- [ ] Weather forecast previews on hover
- [ ] Integration with trip planner

---

## Implementation Checklist

### Phase 1: Core Implementation

- [ ] Create `/directory` route and page structure
- [ ] Build `DirectoryTable` component (desktop)
- [ ] Build `DirectoryList` component (mobile)
- [ ] Implement sorting functionality
- [ ] Implement filtering functionality
- [ ] Add status badges and visual indicators
- [ ] Style with existing design system
- [ ] Add navigation link in header menu
- [ ] Test responsive behavior
- [ ] Accessibility audit

### Estimated Complexity

| Component | Complexity | Est. Lines |
|-----------|------------|------------|
| DirectoryTable | Medium | ~150 |
| DirectoryList | Medium | ~120 |
| DirectoryFilters | Low | ~80 |
| Page + Layout | Low | ~60 |
| **Total** | **Medium** | **~400** |

---

## Mockup Preview

### Desktop Table View

```
╔═══════════════════════════════════════════════════════════════════════════════════════╗
║  ⛷️ Ski Colorado                                         [Weather] [Articles] [≡]    ║
╠═══════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                        ║
║  A-Z Resort Directory                                                                  ║
║  ─────────────────────────────────────────────────────────────────────────────────    ║
║  Compare all 12 Colorado ski resorts at a glance                                      ║
║                                                                                        ║
║  ┌─────────────────────────────────────────────────────────────────────────────────┐  ║
║  │ Sort: [Name ▼]    Pass: [All ▼]    Status: [All ▼]         12 resorts shown    │  ║
║  └─────────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                        ║
║  ┌──────────────────┬────────┬────────┬───────┬────────┬─────────┬───────┬─────────┐  ║
║  │ Resort         ▲ │ Status │ 24h ❄️ │ Base  │ Open   │ Acres   │ Vert  │ Pass    │  ║
║  ├──────────────────┼────────┼────────┼───────┼────────┼─────────┼───────┼─────────┤  ║
║  │ Arapahoe Basin   │ 🟢     │  6"    │  48"  │ ██░ 85%│  1,428  │ 2,530'│ [Ikon]  │  ║
║  │ Aspen Snowmass   │ 🟢     │  15"   │  92"  │ ███ 90%│  5,527  │ 4,406'│ [Ikon]  │  ║
║  │ Beaver Creek     │ 🟢     │  10"   │  80"  │ ██░ 87%│  2,082  │ 3,340'│ [Epic]  │  ║
║  │ Breckenridge     │ 🟢     │  8"    │  78"  │ ██░ 88%│  2,908  │ 3,398'│ [Epic]  │  ║
║  │ Copper Mountain  │ 🟢     │  4"    │  65"  │ ██░ 82%│  2,490  │ 2,738'│ [Ikon]  │  ║
║  │ Crested Butte    │ 🟢     │  18"   │  88"  │ ███ 92%│  1,547  │ 3,062'│ [Ikon]  │  ║
║  │ Keystone         │ 🟢     │  5"    │  58"  │ ██░ 80%│  3,148  │ 3,128'│ [Epic]  │  ║
║  │ Loveland         │ 🟢     │  7"    │  55"  │ ██░ 78%│  1,800  │ 2,210'│ [Indy]  │  ║
║  │ Steamboat        │ 🟢     │  14"   │  82"  │ ██░ 89%│  2,965  │ 3,668'│ [Ikon]  │  ║
║  │ Telluride        │ 🟢     │  12"   │  75"  │ ██░ 85%│  2,000  │ 4,425'│ [Ikon]  │  ║
║  │ Vail             │ 🟢     │  12"   │  85"  │ ███ 95%│  5,289  │ 3,450'│ [Epic]  │  ║
║  │ Winter Park      │ 🟢     │  9"    │  70"  │ ██░ 84%│  3,081  │ 3,060'│ [Ikon]  │  ║
║  └──────────────────┴────────┴────────┴───────┴────────┴─────────┴───────┴─────────┘  ║
║                                                                                        ║
║  💡 Click any resort name to view full details, weather forecast, and trail map       ║
║                                                                                        ║
╚═══════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Conclusion

The A-Z Directory page fills a critical gap in the Ski Colorado experience by providing:

1. **Quick comparison** of all resorts in one view
2. **Real-time conditions** scanning for same-day decisions
3. **Sortable data** for finding the best resort by any metric
4. **Pass filtering** for Epic/Ikon/Indy holders
5. **Mobile-optimized** view for on-the-go checking

This page will become the go-to resource for Colorado skiers planning their next powder day.

---

*Document Version: 1.0*
*Created: November 2024*
*Author: Claude Code*
