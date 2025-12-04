# Ski Links Directory Page - Implementation Plan

## Overview

The Ski Links Directory page is a curated hub of ski-related websites. Unlike the Colorado-specific A–Z resort directory, this page focuses on **external resources**: resort sites, snow reports, webcams, trail maps, trip planning, gear reviews, education, communities, and news.

The goal is to become a **one-stop resource directory** for skiers, reusing the clean, data-forward patterns and design language of the existing site.

---

## User Goals & Use Cases

1. **Trip Planning**
   - "I’m going to X destination; what sites should I check?"
   - Find official resort sites, lodging, and planning tools in one place.

2. **Daily Conditions Check**
   - "Where do I get the fastest and most reliable snow and weather info?"
   - Quickly access snow reports, forecasts, and webcams.

3. **Learning & Gear Research**
   - "I’m new to skiing / buying gear; where do I start?"
   - Discover trusted educational sites, guides, and gear review platforms.

4. **Community & News**
   - "What’s happening in the ski world right now?"
   - Centralize ski forums, communities, and news outlets.

---

## Information Architecture

### Top-Level Sections (By Resource Type)

Organize links into clear, high-level sections:

- **Resort & Mountain Sites**
- **Snow Reports & Weather**
- **Webcams & Trail Maps**
- **Trip Planning & Lodging**
- **Gear & Reviews**
- **Lessons, Safety & Education**
- **Communities & Forums**
- **News & Editorial**

### Cross-Cutting Dimensions (Filters & Tags)

Each link can be filtered/tagged along these axes:

- **Region**
  - `colorado`, `us`, `north-america`, `europe`, `japan`, `global`.
- **Audience**
  - `beginner`, `family`, `backcountry`, `park`.
- **Resource subtype**
  - `official-site`, `forecast`, `conditions`, `live-cam`, `trail-map`, `blog`, `video`, `community`.

---

## Page Route & Metadata

- **Route**: `/ski-links`
- **Metadata title**: `Skiing Websites & Resources Directory | Ski Colorado`
- **Metadata description**:
  - `Curated links to the best ski websites: resorts, snow reports, webcams, trail maps, lodging, gear reviews, communities, and more.`

---

## Page Layout & UX

### High-Level Structure

```text
/ski-links
├── Hero / intro
├── Filter & search bar
└── Sections of link cards grouped by resource type
```

### Hero / Intro

- Short, benefit-focused copy.
  - Example: "Stop googling every trip. Explore the best ski websites in one place."
- Optional stats:
  - `X curated links • Y categories • Last updated MMM YYYY`.
- Simple search input for titles/descriptions/tags.

### Filter & Search Bar

Reuse the visual patterns from `DirectoryFilters`:

- **Search**: text input for `q` (title, description, tags).
- **Dropdowns / Chips**:
  - `Type`: All / Resorts / Snow & Weather / Webcams & Trail Maps / Trip Planning / Gear / Education / Community / News.
  - `Region`: All / Colorado / US / North America / Europe / Japan / Global.
  - `Audience`: All / Beginner / Family / Backcountry / Park & Freestyle.
- **Result count**:
  - "Showing N of M links".

### Content Layout

#### Desktop

- Filters pinned at top.
- Main area groups cards by `type`:
  - Section heading: "Snow Reports & Weather (12)".
  - Under each heading: a responsive grid or list of `SkiLinkCard`s.

#### Mobile

- Filters collapsed/stacked, similar to the A–Z directory.
- Sections stacked vertically; cards are full-width.

### Link Card Design (`SkiLinkCard`)

Each card is a compact, consistent block inspired by `ResortCard` but simplified:

- **Title**: e.g. `OpenSnow`, `OnTheSnow`, `Ikon Pass`.
- **URL preview**: `opensnow.com` styled subtly.
- **Short description**: 1–2 lines.
- **Badges / tags**:
  - Resource type: `Snow Report`, `Forecast`, `Official Resort`, `Community`.
  - Region: `Colorado`, `Global`, etc.
  - Audience: `Beginner`, `Backcountry`, etc.
- **Meta flags**:
  - `Official` vs `Unofficial`.
  - `Free` / `Paid` / `Freemium`.
- **CTA**:
  - "Visit site →" (opens in new tab, with external-link affordance).

---

## Data Model

### TypeScript Types

```ts
export type SkiLinkType =
  | 'resort'
  | 'snow-weather'
  | 'webcam-trailmap'
  | 'trip-planning'
  | 'gear-reviews'
  | 'education'
  | 'community'
  | 'news';

export type SkiLinkRegion =
  | 'colorado'
  | 'us'
  | 'north-america'
  | 'europe'
  | 'japan'
  | 'global';

export type SkiLinkAudience =
  | 'beginner'
  | 'family'
  | 'backcountry'
  | 'park';

export interface SkiLink {
  id: string;
  title: string;
  url: string;
  description: string;
  type: SkiLinkType;
  regions: SkiLinkRegion[];
  audience: SkiLinkAudience[];
  tags: string[];
  isOfficial: boolean;
  isPaid?: boolean;
  priority: number; // lower number = higher placement
  relatedResortIds?: string[]; // tie into resort data in future
}
```

### Storage Strategy

- **Phase 1**: In-memory, type-safe mock data, similar to `mockResorts`.
  - File: `lib/mock-data/ski-links.ts`.
  - Export `SkiLink` types and a `skiLinks: SkiLink[]` array.
- **Phase 2+**: Optionally move to Supabase or another backend to allow editing links without code changes.

---

## Filtering, Sorting & Grouping Logic

- **Filtering**
  - By `type` (section), `regions`, `audience`.
  - Text search `q` against `title`, `description`, and `tags`.
- **Sorting**
  - Primary: `priority` ascending.
  - Secondary: `title` A–Z.
- **Grouping for display**
  - Group by `type` to render sections with headings and card lists.

Implementation mirrors `DirectoryContent`:

- Client component:
  - `useState` for `type`, `region`, `audience`, `q`.
  - `useMemo` to compute filtered, sorted, grouped data.

---

## Route & Component Architecture

```text
app/ski-links/
├── page.tsx                     # Server component route

components/ski-links/
├── SkiLinksHero.tsx             # Intro + summary
├── SkiLinksContent.tsx          # State, filtering, and layout
├── SkiLinksFilters.tsx          # Filter/search controls
├── SkiLinksList.tsx             # Grouped sections + lists
└── SkiLinkCard.tsx              # Individual link card UI

lib/mock-data/
└── ski-links.ts                 # SkiLink types + mock data
```

- `page.tsx` imports `skiLinks` and passes to `SkiLinksContent`.
- `SkiLinksContent` is a client component managing filters and grouping.

---

## Navigation & Integration Points

- **Header**
  - Add `Ski Links Directory` link pointing to `/ski-links` in `Header.tsx`.
- **Footer**
  - Under a "Resources" or "Directories" column, add link to `/ski-links`.
- **Future cross-linking**
  - From individual resort detail pages, surface relevant `SkiLink` entries (official site, webcams, etc.) using `relatedResortIds`.

---

## Accessibility Considerations

- External links clearly indicated (icon + `aria-label` like "opens in a new tab").
- Descriptive link text ("Visit OpenSnow" instead of "Click here").
- Sufficient color contrast for tags and badges.
- Keyboard focus styles preserved on cards and CTAs.

---

## Implementation Phases

### Phase 1 – Core MVP

- Create `/ski-links` route and basic page structure.
- Implement `SkiLink` types and mock data file.
- Build `SkiLinksHero`, `SkiLinksContent`, and `SkiLinkCard` with simple list layout.
- Add basic filters (Type, Region, Search).
- Add header/footer navigation links.

### Phase 2 – UX Enhancements

- Add `Audience` filter and richer tags.
- Improve card visual design (icons, badges, hover states).
- Highlight search terms in titles/descriptions.
- Preserve filter/search state in URL query params.

### Phase 3 – Deep Integration & CMS

- Connect `SkiLink` entries to resort detail pages.
- Move link data to database/CMS for easier editorial updates.
- Add admin tooling for adding/editing/removing links.

---

## Summary

The Ski Links Directory page will extend the existing Ski Colorado experience from a **resort-focused directory** to a **web-wide resource hub**, while preserving your established UI patterns: clean filters, scannable cards, and mobile-first design. This plan defines the IA, UX, data model, and phased implementation needed to build and evolve the page.
