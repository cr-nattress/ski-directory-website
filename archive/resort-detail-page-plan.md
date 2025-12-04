# Colorado Ski Resort Detail Page - Implementation Plan v1.0
## Synthesizing Airbnb, AllTrails, and Yelp Patterns

---

## 1. Executive Summary

This document defines the complete implementation plan for **individual ski resort detail pages** that users navigate to from the landing page resort cards. The design synthesizes the best UI/UX patterns from:

- **Airbnb** - Gallery + booking card, emotional storytelling, sticky actions
- **AllTrails** - Split hero (narrative + map), top trails list, difficulty-first design
- **Yelp** - Social proof, business info rail, community engagement, reviews

**Design Goals:**
- Help users quickly understand if this resort fits their needs
- Provide comprehensive information without overwhelming
- Enable clear next actions (save, compare, plan trip, find lodging)
- Maintain visual consistency with landing page
- Mobile-first, performance-optimized

**Route Structure:**
- Landing page: `/` (browse all resorts)
- Resort detail: `/colorado/[resort-slug]` (e.g., `/colorado/vail`)

---

## 2. Page Objectives & User Needs

### 2.1 Primary User Questions
When a user lands on a resort detail page, they need to answer:

1. **Is this my kind of mountain?** (Vibe, terrain, difficulty, size)
2. **Can I get here?** (Distance, drive time, access)
3. **What are conditions like?** (Snow, weather, terrain open)
4. **What's the experience?** (Amenities, features, signature runs)
5. **What will it cost?** (Passes, tickets, lodging)
6. **What do others think?** (Reviews, ratings, community reports)
7. **Where do I stay?** (Lodging options, ski-in/out, budget ranges)
8. **What's next?** (Add to trip, compare, book lodging)

### 2.2 Page Actions
**Primary CTAs:**
- Save resort (bookmark for later)
- Add to trip (trip planner)
- Find lodging (Airbnb/VRBO deep links)
- Compare with another resort

**Secondary CTAs:**
- View full trail map
- Check live conditions
- Read reviews
- See events
- Share resort

---

## 3. Layout Structure

### 3.1 Desktop Layout (≥1024px)
```
┌────────────────────────────────────────────────────────────┐
│  Header (from landing page)                                │
├────────────────────────────────────────────────────────────┤
│  Breadcrumb: Colorado > I-70 Corridor > Vail Ski Resort    │
├───────────────────────────────────┬────────────────────────┤
│                                   │                        │
│  LEFT COLUMN (8/12 cols)          │  RIGHT RAIL (4/12 cols)│
│  ════════════════════════          │  ═══════════════════   │
│                                   │                        │
│  Hero Section:                    │  Action Card:          │
│  - Resort name + tagline          │  - Trip dates picker   │
│  - Quick stats row                │  - Group size selector │
│  - Gallery (1 large + 4 small)    │  - Primary CTA         │
│  - "View all 48 photos" CTA       │  - Quick stats         │
│                                   │  - Pass badge          │
│  ─────────────────────────────    │                        │
│                                   │  Info Rail:            │
│  Overview + Map Split:            │  - Website link        │
│  - Short description              │  - Phone number        │
│  - Key feature chips              │  - Address + directions│
│  - Interactive map                │  - Hours/status        │
│                                   │  - Social links        │
│  ─────────────────────────────    │                        │
│                                   │  (Sticky as user       │
│  Mountain Stats Grid              │   scrolls)             │
│  ─────────────────────────────    │                        │
│                                   │                        │
│  On-Mountain Experience           │                        │
│  ─────────────────────────────    │                        │
│                                   │                        │
│  Zones & Signature Runs           │                        │
│  (list + map interaction)         │                        │
│  ─────────────────────────────    │                        │
│                                   │                        │
│  Where to Stay                    │                        │
│  (lodging carousel)               │                        │
│  ─────────────────────────────    │                        │
│                                   │                        │
│  Where to Eat & Après             │                        │
│  (Yelp-style business cards)      │                        │
│  ─────────────────────────────    │                        │
│                                   │                        │
│  Reviews & Community              │                        │
│  (ratings + review list)          │                        │
│  ─────────────────────────────    │                        │
│                                   │                        │
│  Planning Tools                   │                        │
│  (snow forecast, crowd calendar)  │                        │
│                                   │                        │
└───────────────────────────────────┴────────────────────────┘
│  Footer (from landing page)                                │
└────────────────────────────────────────────────────────────┘
```

### 3.2 Mobile Layout (<1024px)
```
┌─────────────────────────────┐
│  Header (minimal)           │
├─────────────────────────────┤
│  Swipeable Gallery          │
│  (full-width, with dots)    │
├─────────────────────────────┤
│  Resort Name                │
│  ★ Rating + Reviews         │
│  Quick stats row            │
├─────────────────────────────┤
│  Sticky Mini Action Bar     │
│  [Save] [Share] [Lodging]   │
├─────────────────────────────┤
│  Tab Navigation             │
│  Overview│Map│Stats│Reviews │
├─────────────────────────────┤
│                             │
│  Content (single column)    │
│  - Overview                 │
│  - Map                      │
│  - Stats                    │
│  - Zones/Runs               │
│  - Lodging                  │
│  - Food & Après             │
│  - Reviews                  │
│  - Planning Tools           │
│                             │
└─────────────────────────────┘
│  Sticky Bottom Bar          │
│  [Plan My Trip] ─────────►  │
└─────────────────────────────┘
```

---

## 4. Component Breakdown

### 4.1 Hero Section

#### 4.1.1 Resort Identity
```typescript
interface ResortHero {
  name: string;              // "Vail Ski Resort"
  tagline: string;           // "Legendary back bowls and upscale village charm"
  quickStats: {
    rating: number;          // 4.8
    reviewCount: number;     // 3,200
    passType: string;        // "Epic Pass"
    sizeCategory: string;    // "Mega Resort"
    terrain: {
      beginner: number;      // 18%
      intermediate: number;  // 29%
      advanced: number;      // 53%
    };
  };
  elevation: {
    base: number;            // 8,150 ft
    summit: number;          // 11,570 ft
  };
}
```

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  Vail Ski Resort                                │  ← H1
│  Legendary back bowls and upscale village charm │  ← Tagline
│                                                 │
│  ★ 4.8 (3,200 reviews) · Epic Pass · Mega      │  ← Quick stats
│  Beginner 18% · Intermediate 29% · Advanced 53%│
│  Base 8,150 ft · Summit 11,570 ft              │
└─────────────────────────────────────────────────┘
```

#### 4.1.2 Photo Gallery (Airbnb Pattern)
```
┌───────────────────┬─────────┬─────────┐
│                   │ Photo 2 │ Photo 3 │
│   Main Hero Photo │         │         │
│   (large)         ├─────────┼─────────┤
│                   │ Photo 4 │ Photo 5 │
└───────────────────┴─────────┴─────────┘
                    [View all 48 photos] →
```

**Behavior:**
- Desktop: Grid layout with hover zoom
- Mobile: Swipeable full-width gallery with dots
- Click: Opens fullscreen lightbox gallery
- Badge overlay: "7" new overnight · 65" base" (live conditions)

**Data Source:** `Resort.heroImage` + additional images from `user_photos` table

---

### 4.2 Action Rail (Right Column - Desktop)

#### 4.2.1 Action Card
```
┌────────────────────────────┐
│  Plan Your Visit           │
│                            │
│  📅 Trip Dates             │
│  ┌──────────────────────┐  │
│  │ Feb 15-18, 2025   ▼ │  │
│  └──────────────────────┘  │
│                            │
│  👥 Group Size             │
│  ┌──────────────────────┐  │
│  │ 2 adults, 1 child ▼ │  │
│  └──────────────────────┘  │
│                            │
│  [Find Lodging & Passes]   │ ← Primary CTA
│                            │
│  Quick Stats:              │
│  • 5,289 skiable acres     │
│  • 31 lifts, 195 runs      │
│  • 7" new snow (24h)       │
│  • 85% terrain open        │
│                            │
│  [Epic Pass]               │ ← Pass badge
└────────────────────────────┘

┌────────────────────────────┐
│  Resort Info               │
│                            │
│  🌐 vail.com               │
│  📞 (970) 476-5601         │
│  📍 201 S Frontage Rd      │
│     Vail, CO 81657         │
│     [Get Directions]       │
│  🕐 8:30 AM - 4:00 PM      │
│                            │
│  [Save Resort]             │
│  [Compare Resorts]         │
│  [Share]                   │
└────────────────────────────┘
```

**Behavior:**
- Desktop: Sticky positioning (stays visible on scroll)
- Tablet: Collapses to sticky top bar
- Mobile: Becomes sticky bottom bar with primary CTA

**TypeScript Interface:**
```typescript
interface ActionCard {
  tripDates?: DateRange;
  groupSize: {
    adults: number;
    children: number;
  };
  quickStats: {
    skiableAcres: number;
    liftsCount: number;
    runsCount: number;
    snowfall24h: number;
    terrainOpen: number;
  };
  resortInfo: {
    website: string;
    phone: string;
    address: Address;
    hours: string;
  };
}
```

---

### 4.3 Overview + Map Split (AllTrails Pattern)

```
┌──────────────────────┬─────────────────────┐
│  Overview            │  Interactive Map    │
│                      │                     │
│  Vail offers 5,289   │  [────────────────] │
│  acres of legendary  │  │                │ │
│  terrain including   │  │   Resort Map   │ │
│  the famous Back     │  │   with pins    │ │
│  Bowls and groomed   │  │                │ │
│  front-side runs...  │  [────────────────] │
│                      │                     │
│  Feature Chips:      │  [Open Trail Map]   │
│  🏔️ Big Mountain     │                     │
│  👨‍👩‍👧 Family Friendly │                     │
│  🎿 Terrain Parks    │                     │
│  🍷 Upscale Dining   │                     │
│  🚡 Gondola Access   │                     │
└──────────────────────┴─────────────────────┘
```

**Data Sources:**
- `aggregates.core.description` - Overview text
- `aggregates.ai_meta.tags` - Feature chips
- `map_resources` table - Interactive map layers
- `aggregates.geo.location` - Map center point

---

### 4.4 Mountain Stats Grid

**Layout Pattern (Airbnb Amenities Style):**
```
Mountain Stats
═════════════════════════════════════════

┌─────────────┬─────────────┬─────────────┬─────────────┐
│ 📏          │ ⛰️          │ 🏔️          │ ❄️          │
│ Vertical    │ Summit      │ Skiable     │ Avg Annual  │
│ Drop        │ Elevation   │ Acres       │ Snowfall    │
│ 3,450 ft    │ 11,570 ft   │ 5,289 ac    │ 354"        │
└─────────────┴─────────────┴─────────────┴─────────────┘

┌─────────────┬─────────────┬─────────────┬─────────────┐
│ 🎿          │ 🚡          │ 📐          │ 🏃          │
│ Runs        │ Lifts       │ Longest Run │ Base        │
│ Count       │ Count       │             │ Elevation   │
│ 195         │ 31          │ 4.0 mi      │ 8,150 ft    │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

**TypeScript Interface:**
```typescript
interface MountainStats {
  verticalDrop: number;
  summitElevation: number;
  baseElevation: number;
  skiableAcres: number;
  runsCount: number;
  liftsCount: number;
  avgAnnualSnowfall: number;
  longestRun?: number;
}
```

**Data Source:** `aggregates.stats` + `aggregates.geo.elevation`

---

### 4.5 On-Mountain Experience (Amenities)

**Layout (Icon + Label Grid):**
```
On-Mountain Experience
═══════════════════════════════════════

✓ Terrain Parks (3)        ✓ On-Mountain Dining (11)
✓ Halfpipe                 ✓ Ski School & Lessons
✓ Beginner Learning Area   ✓ Equipment Rentals
✓ Childcare Services       ✓ Ski Patrol
✓ Night Skiing             ✗ Uphill Access
✓ Gondola Access           ✓ WiFi (Base Areas)
```

**Data Source:** `Resort.features` + manual curation

**TypeScript Interface:**
```typescript
interface OnMountainExperience {
  terrainParks: { count: number; has: boolean };
  halfpipe: boolean;
  nightSkiing: boolean;
  learningArea: boolean;
  childcare: boolean;
  onMountainDining: { count: number; has: boolean };
  skiSchool: boolean;
  rentals: boolean;
  uphillAccess: boolean;
  gondola: boolean;
}
```

---

### 4.6 Zones & Signature Runs (AllTrails "Top Trails" Pattern)

**Layout:**
```
Top Zones & Signature Runs
══════════════════════════════════════════════

Left Column (Runs List)        Right Column (Map)
─────────────────────          ────────────────
┌─────────────────────┐        [═══════════════]
│ #1 - Back Bowls     │   →    │ [highlighted] │
│ ⚫⚫ Advanced-Expert │        │  Back Bowls   │
│ 3,000+ acres        │        │     zone      │
│ Legendary powder    │        │               │
│ 7 bowls, blues-dbl  │        [═══════════════]
│ blacks              │
└─────────────────────┘

┌─────────────────────┐
│ #2 - Blue Sky Basin │
│ ⚫⚫ Advanced        │
│ 645 acres           │
│ Tree skiing, glades │
│ Less crowded        │
└─────────────────────┘

┌─────────────────────┐
│ #3 - Front Side     │
│ 🟢🔵 Beginner-Int   │
│ Groomed cruisers    │
│ Family-friendly     │
│ High-speed lifts    │
└─────────────────────┘

[View Full Trail Map] →
```

**Interaction:**
- Hover over zone card → highlight on map
- Click zone card → expand details + map zoom
- Click map zone → scroll to card

**Data Sources:**
- Manual curation of "signature zones" per resort
- `trails` table for run details
- `map_resources` for zone boundaries

**TypeScript Interface:**
```typescript
interface Zone {
  id: string;
  rank: number;
  name: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'mixed';
  acres?: number;
  description: string;
  features: string[];  // ['Tree skiing', 'Powder', 'Groomed']
  mapBounds?: GeoBounds;
}
```

---

### 4.7 Where to Stay (Lodging Integration)

**Layout (Horizontal Carousel):**
```
Where to Stay
═════════════════════════════════════════════════

← [─────────] [─────────] [─────────] [─────────] →

┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
│ [Image]           │ │ [Image]           │ │ [Image]           │
│                   │ │                   │ │                   │
│ Ski-In/Ski-Out    │ │ Budget Hotels     │ │ Airbnb Condos     │
│ Condos            │ │                   │ │                   │
│                   │ │                   │ │                   │
│ From $450/night   │ │ From $120/night   │ │ From $200/night   │
│ 38 stays          │ │ 15 properties     │ │ 127 stays         │
│                   │ │                   │ │                   │
│ [View Options] →  │ │ [View Options] →  │ │ [View Options] →  │
└───────────────────┘ └───────────────────┘ └───────────────────┘
```

**Card Types:**
1. **Ski-in/Ski-out Properties** (premium)
2. **Budget Hotels** (<$150/night)
3. **Airbnb/VRBO Homes** (groups/families)
4. **Luxury Resorts** (>$400/night)
5. **Base Area Condos** (walking distance)

**CTAs:**
- "View on Airbnb" → deep link: `airbnb.com/s/vail-colorado?checkin=...`
- "View on VRBO" → deep link: `vrbo.com/search?destination=vail...`
- "All Lodging Options" → internal `/colorado/vail/lodging` page

**Data Sources:**
- `places` table (type: `lodging_*`)
- `lodging_channels` table for Airbnb/VRBO links
- `aggregate_lodging_links` for search deep links

**TypeScript Interface:**
```typescript
interface LodgingCategory {
  title: string;
  description: string;
  priceRange: {
    from: number;
    currency: string;
  };
  propertyCount: number;
  deepLink: string;
  image: string;
}
```

---

### 4.8 Where to Eat & Après (Yelp Pattern)

**Layout:**
```
Where to Eat & Après
═════════════════════════════════════════════════

Category Filters:
[🍕 Pizza] [🍔 Burgers] [☕ Coffee] [🍷 Fine Dining] [🍺 Bars] [🌮 Mexican]

┌─────────────────────────────────────────────────┐
│ [Photo]  Sweet Basil                            │
│          ★★★★★ 4.6 (2,340 reviews)              │
│          $$$$ · American · Fine Dining           │
│          0.2 mi from Gondola 1                   │
│          [View on Yelp] →                        │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ [Photo]  Los Amigos                             │
│          ★★★★☆ 4.3 (890 reviews)                │
│          $$ · Mexican · Casual                   │
│          0.4 mi from base                        │
│          [View Menu] →                           │
└─────────────────────────────────────────────────┘

[View All Restaurants & Bars (45)] →
```

**Data Sources:**
- `places` table (type: `apres`, `restaurant`)
- `place_aggregates` for distance from resort
- Optional: Yelp API integration for real ratings

**TypeScript Interface:**
```typescript
interface Dining {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  priceLevel: '$' | '$$' | '$$$' | '$$$$';
  category: string[];  // ['American', 'Fine Dining']
  distanceFromBase: number;  // km
  photo: string;
  externalUrl?: string;  // Yelp, Google Maps
}
```

---

### 4.9 Reviews & Community (Yelp + Airbnb Hybrid)

**Layout:**
```
Rider Reviews
═════════════════════════════════════════════════

Overall Rating: ★ 4.8 out of 5 (3,200 reviews)

Rating Breakdown:
★★★★★ ████████████████████ 72%
★★★★☆ ██████ 18%
★★★☆☆ ██ 6%
★★☆☆☆ █ 3%
★☆☆☆☆ █ 1%

─────────────────────────────────────────────────

Filter Reviews:
[All] [Powder Days] [Family] [Beginner] [Expert] [Value] [Crowds]

Sort by: [Most Helpful ▼] [Newest] [Highest Rated]

─────────────────────────────────────────────────

┌─────────────────────────────────────────────────┐
│ 👤 Sarah M. · Denver, CO                        │
│ ★★★★★ 5.0                                       │
│ Visited: Feb 10-12, 2025 · Family Trip          │
│                                                 │
│ Tags: Great Grooming · Family Friendly · Powder│
│                                                 │
│ "The Back Bowls lived up to the hype! We had   │
│  fresh powder and amazing conditions. The kids  │
│  loved the bunny slopes and ski school was      │
│  excellent. A bit pricey but worth it..."       │
│                                                 │
│ Helpful? [👍 42] [👎 2]                         │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ 👤 Jake R. · Austin, TX                         │
│ ★★★★☆ 4.0                                       │
│ Visited: Jan 15-18, 2025 · Solo Trip            │
│                                                 │
│ Tags: Crowded · Expensive · Good Snow           │
│                                                 │
│ "Terrain is world-class but lift lines were    │
│  brutal on the weekend. Hit Blue Sky Basin for  │
│  fewer crowds. Food options are expensive but   │
│  high quality..."                               │
│                                                 │
│ Helpful? [👍 28] [👎 5]                         │
└─────────────────────────────────────────────────┘

[Load More Reviews]
```

**AI-Generated Summary (Above Reviews):**
```
┌─────────────────────────────────────────────────┐
│ Review Highlights                               │
│                                                 │
│ 👍 People love:                                 │
│   • World-class terrain and legendary back bowls│
│   • Excellent grooming and snow quality         │
│   • Family-friendly amenities and ski school    │
│   • Upscale dining and après options            │
│                                                 │
│ ⚠️ Watch out for:                               │
│   • Weekend crowds and lift lines               │
│   • High prices (tickets, food, lodging)        │
│   • Parking can be challenging                  │
│   • Weather can be variable                     │
└─────────────────────────────────────────────────┘
```

**Data Sources:**
- `user_reviews` table
- AI-generated summary from `aggregates.ai_meta.summaries`

**TypeScript Interface:**
```typescript
interface Review {
  id: string;
  userId: string;
  userName: string;
  userLocation?: string;
  ratingOverall: number;
  visitDate: Date;
  tripType: 'solo' | 'couple' | 'family' | 'group';
  tags: string[];
  title?: string;
  body: string;
  helpfulCount: number;
  notHelpfulCount: number;
  createdAt: Date;
}

interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  highlights: {
    positives: string[];
    negatives: string[];
  };
}
```

---

### 4.10 Planning Tools

**Layout (Cards):**
```
Planning Tools
═════════════════════════════════════════════════

┌─────────────────┬─────────────────┬─────────────────┐
│ ❄️ Snow Forecast│ 📊 Crowd Calendar│ 💰 Price Trends │
│                 │                 │                 │
│ Next 5 Days:    │ Upcoming Week:  │ Ticket Prices:  │
│ Sat: 3-5"       │ ████████ Busy   │ Feb 15: $209    │
│ Sun: 1-2"       │ ██████ Moderate │ Feb 16: $189    │
│ Mon: 0"         │ ████ Quiet      │ Feb 17: $189    │
│ Tue: 0-1"       │ ██ Very Quiet   │ Weekday avg:    │
│ Wed: 2-4"       │ ████ Quiet      │ $159            │
│                 │                 │                 │
│ [Full Forecast] │ [Full Calendar] │ [Price History] │
└─────────────────┴─────────────────┴─────────────────┘

┌─────────────────────────────────────────────────┐
│ 🤖 AI Trip Planner                              │
│                                                 │
│ Not sure if Vail is right for you?              │
│ Let our AI help you plan the perfect trip.      │
│                                                 │
│ [Generate Custom Trip Plan] →                   │
└─────────────────────────────────────────────────┘
```

**Data Sources:**
- `snow_conditions` table (historical + forecast)
- Manual crowd calendar data
- `ticket_prices` table
- AI planner links to dedicated app

---

## 5. Technical Implementation

### 5.1 Route Structure

**File Structure:**
```
app/
  colorado/
    [slug]/
      page.tsx          ← Resort detail page
      loading.tsx       ← Loading skeleton
      error.tsx         ← Error boundary
      opengraph-image.tsx ← OG image generation
```

**Dynamic Route:**
```typescript
// app/colorado/[slug]/page.tsx
interface ResortPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

export default async function ResortDetailPage({
  params,
}: ResortPageProps) {
  const resort = await getResortBySlug(params.slug);

  if (!resort) {
    notFound();
  }

  return <ResortDetail resort={resort} />;
}

// Generate static params for all resorts
export async function generateStaticParams() {
  const resorts = await getAllResorts();
  return resorts.map((resort) => ({
    slug: resort.slug,
  }));
}
```

### 5.2 Component Architecture

**Top-Level Component:**
```typescript
// components/resort-detail/ResortDetail.tsx
export function ResortDetail({ resort }: { resort: Resort }) {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <Breadcrumb
        items={[
          { label: 'Colorado', href: '/' },
          { label: resort.name, href: `/colorado/${resort.slug}` }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-8">
            <ResortHero resort={resort} />
            <OverviewMapSplit resort={resort} />
            <MountainStats resort={resort} />
            <OnMountainExperience resort={resort} />
            <ZonesAndRuns resort={resort} />
            <LodgingCarousel resort={resort} />
            <DiningSection resort={resort} />
            <ReviewsSection resort={resort} />
            <PlanningTools resort={resort} />
          </div>

          {/* Right Column (Sticky) */}
          <div className="lg:col-span-4">
            <StickyActionRail resort={resort} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
```

### 5.3 Data Fetching Strategy

**Server Components (Default):**
```typescript
// lib/data/resort-queries.ts
export async function getResortBySlug(slug: string): Promise<Resort | null> {
  // In MVP: Use mock data
  return mockResorts.find(r => r.slug === slug) || null;

  // Future: Query Supabase
  // const { data } = await supabase
  //   .from('aggregates')
  //   .select('*')
  //   .eq('slug', slug)
  //   .eq('level', 'resort')
  //   .single();
  // return data;
}

export async function getResortReviews(resortId: string) {
  // Future: Query reviews
}

export async function getResortLodging(resortId: string) {
  // Future: Query places + lodging_channels
}
```

**Client Components (Interactive Elements):**
```typescript
'use client'

import { useState } from 'react';

export function ZonesAndRuns({ resort }: { resort: Resort }) {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <ZoneList
        zones={resort.zones}
        selectedZone={selectedZone}
        onSelectZone={setSelectedZone}
      />
      <InteractiveMap
        zones={resort.zones}
        highlightedZone={selectedZone}
      />
    </div>
  );
}
```

### 5.4 SEO & Metadata

**Dynamic Metadata:**
```typescript
// app/colorado/[slug]/page.tsx
import { Metadata } from 'next';

export async function generateMetadata({
  params,
}: ResortPageProps): Promise<Metadata> {
  const resort = await getResortBySlug(params.slug);

  if (!resort) {
    return {
      title: 'Resort Not Found',
    };
  }

  return {
    title: `${resort.name} - Colorado Ski Directory`,
    description: resort.description,
    openGraph: {
      title: resort.name,
      description: resort.tagline,
      images: [resort.heroImage],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: resort.name,
      description: resort.tagline,
      images: [resort.heroImage],
    },
  };
}
```

**Structured Data (JSON-LD):**
```typescript
export function ResortStructuredData({ resort }: { resort: Resort }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SkiResort",
    "name": resort.name,
    "description": resort.description,
    "image": resort.heroImage,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": resort.nearestCity,
      "addressRegion": "CO",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": resort.location.lat,
      "longitude": resort.location.lng
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": resort.rating,
      "reviewCount": resort.reviewCount
    },
    "url": `https://skidirectory.com/colorado/${resort.slug}`
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
```

---

## 6. Mobile Optimizations

### 6.1 Sticky Mini Header
```typescript
export function StickyMiniHeader({ resort }: { resort: Resort }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="font-semibold">{resort.name}</span>
          <span className="text-sm text-gray-600">
            ★ {resort.rating} · {resort.conditions.snowfall24h}" new
          </span>
        </div>
        <button className="btn-primary">
          Plan Trip
        </button>
      </div>
    </div>
  );
}
```

### 6.2 Mobile Gallery
```typescript
export function MobileGallery({ images }: { images: string[] }) {
  return (
    <div className="relative w-full h-64 sm:hidden">
      <Swiper
        modules={[Pagination]}
        pagination={{ clickable: true }}
        className="h-full"
      >
        {images.map((image, idx) => (
          <SwiperSlide key={idx}>
            <img
              src={image}
              alt={`Resort photo ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
```

### 6.3 Sticky Bottom Action Bar (Mobile)
```typescript
export function MobileActionBar({ resort }: { resort: Resort }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-4 sm:hidden">
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2">
          <button className="btn-icon">
            <HeartIcon />
          </button>
          <button className="btn-icon">
            <ShareIcon />
          </button>
        </div>
        <button className="btn-primary flex-1">
          Plan My Trip
        </button>
      </div>
    </div>
  );
}
```

---

## 7. Design Consistency with Landing Page

### 7.1 Reuse Existing Components
- **Header** - Same header from landing page
- **Footer** - Same footer from landing page
- **Card shadows** - Same `shadow-md` and `rounded-lg`
- **Typography** - Same Inter/Poppins fonts, same heading sizes
- **Color palette** - Reuse ski-blue, powder-blue, epic-red, ikon-orange
- **Spacing** - Same gap values (16px, 24px, 40px, 80px)

### 7.2 Visual Hierarchy
**Landing Page:**
```
Hero → Category Chips → Resort Cards Grid → Content → Footer
```

**Resort Detail Page:**
```
Hero → Overview/Map → Stats → Zones → Lodging → Reviews → Planning → Footer
```

Both follow: **Emotional first → Practical second → Deep content third**

### 7.3 Pass Badges
Reuse the same badge components from resort cards:
```typescript
<PassBadge type="epic" />
<PassBadge type="ikon" />
<PassBadge type="indy" />
<PassBadge type="local" />
```

---

## 8. Performance Optimizations

### 8.1 Image Optimization
```typescript
import Image from 'next/image';

<Image
  src={resort.heroImage}
  alt={resort.name}
  width={800}
  height={600}
  priority  // For hero image
  quality={85}
  className="rounded-lg"
/>
```

### 8.2 Code Splitting
```typescript
// Lazy load heavy components
const InteractiveMap = dynamic(() => import('./InteractiveMap'), {
  loading: () => <MapSkeleton />,
  ssr: false
});

const ReviewsList = dynamic(() => import('./ReviewsList'), {
  loading: () => <ReviewsSkeleton />
});
```

### 8.3 Static Generation
```typescript
// Pre-render all resort pages at build time
export const dynamicParams = false;

export async function generateStaticParams() {
  const resorts = await getAllResorts();
  return resorts.map(resort => ({ slug: resort.slug }));
}
```

### 8.4 Loading States
```typescript
// app/colorado/[slug]/loading.tsx
export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-96 bg-gray-200 rounded mb-8" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-32 bg-gray-200 rounded" />
          <div className="h-32 bg-gray-200 rounded" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}
```

---

## 9. Development Roadmap

### Phase 1: Core Layout & Hero (Week 1)
- [ ] Set up dynamic route `/colorado/[slug]`
- [ ] Create ResortDetail main component
- [ ] Build ResortHero component (name, tagline, stats)
- [ ] Build photo gallery (desktop grid, mobile swipe)
- [ ] Implement breadcrumb navigation
- [ ] Add ResortStructuredData for SEO

### Phase 2: Action Rail & Info (Week 1)
- [ ] Build ActionCard component (sticky on desktop)
- [ ] Add trip date picker
- [ ] Add group size selector
- [ ] Build ResortInfo component (contact, hours)
- [ ] Implement mobile sticky action bar

### Phase 3: Content Sections (Week 2)
- [ ] Build OverviewMapSplit component
- [ ] Create MountainStats grid
- [ ] Build OnMountainExperience amenities list
- [ ] Add feature chips (reuse from landing page)

### Phase 4: Zones & Terrain (Week 2)
- [ ] Create ZonesAndRuns component
- [ ] Build zone card list
- [ ] Integrate interactive map (Mapbox/Leaflet)
- [ ] Implement hover/click zone highlighting
- [ ] Add "View Full Trail Map" CTA

### Phase 5: Lodging & Dining (Week 3)
- [ ] Build LodgingCarousel component
- [ ] Create lodging category cards
- [ ] Implement Airbnb/VRBO deep links
- [ ] Build DiningSection with category filters
- [ ] Add Yelp-style business cards

### Phase 6: Reviews & Community (Week 3)
- [ ] Build ReviewsSection component
- [ ] Add rating distribution chart
- [ ] Implement review filter chips
- [ ] Create review card component
- [ ] Add AI-generated review summary

### Phase 7: Planning Tools (Week 4)
- [ ] Build PlanningTools section
- [ ] Add snow forecast card
- [ ] Add crowd calendar card
- [ ] Add price trends card
- [ ] Link to AI trip planner

### Phase 8: Mobile Polish (Week 4)
- [ ] Implement StickyMiniHeader
- [ ] Build mobile tab navigation
- [ ] Optimize mobile gallery
- [ ] Test touch interactions
- [ ] Add mobile-specific CTAs

### Phase 9: Performance & SEO (Week 5)
- [ ] Optimize images (WebP, lazy loading)
- [ ] Implement code splitting
- [ ] Add loading skeletons
- [ ] Generate static pages for all resorts
- [ ] Test Core Web Vitals
- [ ] Add OG images
- [ ] Test structured data

---

## 10. Success Metrics

### User Engagement
- **Time on page**: >2 minutes average
- **Scroll depth**: >70% reach "Where to Stay"
- **Click-through rate**:
  - 30%+ click "Find Lodging"
  - 20%+ click "Save Resort"
  - 15%+ click "View Trail Map"
- **Bounce rate**: <40%

### Performance
- **LCP**: <2.5s
- **FID**: <100ms
- **CLS**: <0.1
- **Mobile page load**: <3s on 3G

### Conversion
- **Lodging clicks**: 10%+ of visitors
- **Review submissions**: 5+ per resort per month
- **Social shares**: 50+ per resort per month

---

## 11. Future Enhancements

### Phase 2 Features (Post-MVP)
- [ ] Live webcam integration
- [ ] Real-time lift/trail status
- [ ] Historical snow charts
- [ ] User photo gallery (Instagram-style)
- [ ] Compare side-by-side (2-3 resorts)
- [ ] Personalized recommendations
- [ ] Trip itinerary builder
- [ ] Pass purchase deep links
- [ ] Ticket price alerts
- [ ] Events calendar

### Advanced Features
- [ ] AR trail map viewer
- [ ] Voice-activated AI assistant
- [ ] Virtual reality preview
- [ ] Live chat with locals
- [ ] Community forum per resort
- [ ] Ride-tracking integration (Slopes, Ski Tracks)

---

## 12. Key Differentiators vs Competitors

### vs OnTheSnow
✅ **Better UX** - Cleaner design, simpler navigation
✅ **Lodging integration** - Deep links to Airbnb/VRBO
✅ **AI tools** - Personalized recommendations
✅ **Modern tech** - Fast, responsive, mobile-first

### vs SkiResort.info
✅ **Better photos** - High-quality imagery
✅ **Social proof** - User reviews and ratings
✅ **Trip planning** - Integrated lodging + passes
✅ **Community** - User-generated content

### vs Resort Websites
✅ **Neutral** - Unbiased comparisons
✅ **Comprehensive** - All resorts in one place
✅ **Discovery** - Find resorts you didn't know about
✅ **Tools** - Pass optimizer, trip budgeter

---

## 13. Conclusion

This resort detail page design combines the best of **Airbnb** (emotional storytelling + action rail), **AllTrails** (terrain details + map), and **Yelp** (social proof + practical info) to create the most comprehensive and user-friendly ski resort detail page ever built.

**Key Principles:**
1. **Emotional first, practical second** - Hero and photos grab attention, stats follow
2. **Progressive disclosure** - Don't overwhelm, reveal details as needed
3. **Clear next actions** - Always provide obvious CTAs
4. **Visual consistency** - Maintains landing page design DNA
5. **Mobile-first** - Optimized for on-the-go planning
6. **Performance** - Fast, responsive, accessible

**Next Step:** Start building Phase 1 (Core Layout & Hero) using the existing Next.js project structure.

---

**Document Version:** 1.0
**Created:** 2025-11-23
**Author:** AI Planning Assistant
**Status:** Ready for Development
**Related Docs:**
- `colorado-landing-page-plan.md` (v2.0)
- `full-ski-directory-architecture.md`
- `ski-directory-data-model.md`
- `ski-resort-page.md` (UI/UX analysis)
