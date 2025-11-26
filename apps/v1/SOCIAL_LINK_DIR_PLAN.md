# Social Media Links Directory Page - Implementation Plan

## Overview

The Social Media Links Directory page is an exhaustive, curated hub of ski-related social media profiles and channels. While the Ski Links Directory focuses on websites and tools, this page is about **people, brands, and communities** on platforms like **YouTube, Instagram, TikTok, Facebook, Reddit, X/Twitter**, and others.

The goal is to become the **go-to starting point** for skiers who want:

- The best YouTube channels for technique, trip reports, and gear.
- Instagram/TikTok accounts for stoke, photography, and short-form tips.
- Reddit and forum communities for deep discussion.
- Official resort and brand social feeds.

This page should reuse the clean, data-forward, mobile-first patterns from the existing site while acknowledging that social media is:

- Highly personality-driven.
- Frequently updated and time-sensitive.
- Best consumed via quick scanning and rich media cues (avatars, platform icons).

---

## User Goals & Use Cases

1. **Learn & Improve**
   - "What are the best YouTube channels to learn carving, moguls, park, or backcountry skills?"
   - Quickly find high-quality instructional and analysis content.

2. **Trip Inspiration & Stoke**
   - "I want to follow accounts that post great POV runs, powder days, and destination inspiration."
   - Discover creators and brands posting visually compelling skiing content.

3. **Local & Resort-Specific Feeds**
   - "I mostly ski at Resort X; what are the best local Instagram/TikTok/Reddit accounts to follow?"
   - Surface resort- and region-specific feeds.

4. **Gear & Tech Deep Dives**
   - "Who breaks down ski gear honestly across YouTube, Instagram, or Reddit?"
   - Find reviewers and gear nerds worth following.

5. **Community & Conversation**
   - "Where do skiers actually hang out online to ask questions and share info?"
   - Highlight subreddits, Facebook groups, Discords, and forums.

6. **Official Communications**
   - "I want official updates from resorts, brands, and passes."
   - Centralize official resort and brand social handles.

---

## Information Architecture

Design the directory around two axes:

1. **Platform (primary organizing dimension)**
2. **Topic / Role (what the account is about)**

### Top-Level Sections (By Topic / Role)

Each section can contain links across multiple platforms, grouped or filtered by platform:

- **Instruction & Technique**
  - Ski schools, instructors, coaching channels, form breakdowns.
- **Trip Reports & Vlogs**
  - POV skiing, resort walkthroughs, travel vlogs.
- **Gear & Reviews**
  - Bootfitters, ski/board review channels, tech breakdowns.
- **Resort & Region Feeds**
  - Official resort accounts and strong local community accounts.
- **Backcountry & Safety**
  - Avalanche centers, guides, education channels.
- **News, Commentary & Culture**
  - Ski news, opinion, memes, culture commentary.
- **Communities & Groups**
  - Subreddits, Facebook groups, forums, Discords.

### Platform Dimension

Supported platforms (initial list):

- **YouTube**
- **Instagram**
- **TikTok**
- **Facebook** (pages, groups)
- **Reddit** (subreddits)
- **X / Twitter** (optional for v1)
- **Discord / Forums** (as a generic "Community" type)

### Cross-Cutting Dimensions (Filters & Tags)

- **Platform**
  - `youtube`, `instagram`, `tiktok`, `facebook`, `reddit`, `twitter`, `discord`, `forum`.

- **Region**
  - `colorado`, `us`, `north-america`, `europe`, `japan`, `global`.

- **Focus / Topic**
  - `instruction`, `trip-vlog`, `gear`, `resort-official`, `news`, `meme`, `backcountry`, `safety`, `race`, `park`, `family`, `beginner`.

- **Audience Level**
  - `beginner`, `intermediate`, `advanced`, `expert`.

- **Format Emphasis**
  - `short-form`, `long-form`, `live`, `community`.

---

## Page Route & Metadata

- **Route**: `/social-links`
- **Metadata title**: `Ski Social Media Channels & Communities Directory | Ski Colorado`
- **Metadata description**:
  - `Discover the best ski YouTube channels, Instagram accounts, TikToks, Facebook groups, subreddits, and more—all curated in one social media directory for skiers.`

---

## Page Layout & UX

### High-Level Structure

```text
/social-links
├── Hero / intro
├── Filter & search bar
└── Sections of social cards grouped by topic/role
```

### Hero / Intro

- Short, benefit-driven copy:
  - "Find the best ski YouTube channels, Instagram feeds, TikToks, and communities in one place."
- Optional stats:
  - `X curated channels • Y platforms • Last updated MMM YYYY`.
- Optionally highlight a small set of **featured creators**.

### Filter & Search Bar

Visually parallel to `DirectoryFilters` and `SkiLinksFilters`:

- **Search**: text input `q` for channel/handle/description tags.
- **Dropdowns / Chips**:
  - `Platform`: All / YouTube / Instagram / TikTok / Facebook / Reddit / Twitter / Community.
  - `Topic`: All / Instruction / Trip Vlogs / Gear / Resort / Backcountry / News / Communities.
  - `Region`: All / Colorado / US / North America / Europe / Japan / Global.
  - Optional `Skill Level`: All / Beginner / Intermediate / Advanced / Expert.
- **Result count**:
  - "Showing N of M channels".

### Content Layout

#### Desktop

- Filters pinned at top.
- **Main area** grouped by topic/role:
  - Section heading: `Instruction & Technique (25)`.
  - Under each heading: grid or list of `SocialLinkCard`s.
  - Within a section, support **platform sub-filter** or small platform pills (YouTube, Instagram, etc.).

#### Mobile

- Filters collapsed into a scrollable row or section.
- Sections stacked vertically.
- Cards full-width, optimized for quick scroll and recognizable platform icons.

### Social Link Card Design (`SocialLinkCard`)

Each card should be recognizable and scannable at a glance:

- **Platform indicator** (icon + color accent):
  - YouTube, Instagram, TikTok, Facebook, Reddit, etc.
- **Channel/account name**
  - e.g. `Stomp It Tutorials`, `Snowbrains`, `r/skiing`.
- **Handle or URL snippet**
  - `youtube.com/@stompittutorials`, `instagram.com/snowbrains`.
- **Short description**
  - 1–2 lines describing what the account does and why it’s good.
- **Badges / tags**
  - Topic: `Instruction`, `Gear`, `Trip Vlogs`, `Resort Official`, `Meme`, `News`.
  - Region: `Colorado`, `Global`, etc.
  - Audience level: `Beginner`, `Advanced`, `Backcountry`.
- **Metrics (optional, non-binding)**
  - Subscriber/follower count (if curated manually and not auto-updated), e.g. `250K+ subs`.
- **CTA**
  - "Open on YouTube →", "View on Instagram →", etc., opening in a new tab.

---

## Data Model

### TypeScript Types

```ts
export type SocialPlatform =
  | 'youtube'
  | 'instagram'
  | 'tiktok'
  | 'facebook'
  | 'reddit'
  | 'twitter'
  | 'discord'
  | 'forum';

export type SocialRegion =
  | 'colorado'
  | 'us'
  | 'north-america'
  | 'europe'
  | 'japan'
  | 'global';

export type SocialTopic =
  | 'instruction'
  | 'trip-vlog'
  | 'gear'
  | 'resort-official'
  | 'news'
  | 'meme'
  | 'backcountry'
  | 'safety'
  | 'race'
  | 'park'
  | 'family'
  | 'beginner-focus'
  | 'community';

export type SkillLevel =
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'expert';

export type ContentFormat =
  | 'short-form'
  | 'long-form'
  | 'live'
  | 'community';

export interface SocialLink {
  id: string;
  name: string; // Channel/account/group name
  platform: SocialPlatform;
  handle: string; // e.g. "@stompittutorials", "r/skiing"
  url: string;
  description: string;
  topics: SocialTopic[];
  regions: SocialRegion[];
  skillLevels: SkillLevel[];
  formats: ContentFormat[];
  isOfficial: boolean; // resort/brand official vs independent creator
  isCommunity: boolean; // true for subreddits, FB groups, forums, Discords
  metricsLabel?: string; // human-readable follower/subscriber count
  priority: number; // lower = more prominent
  relatedResortIds?: string[]; // tie into resort data in future
}
```

### Storage Strategy

- **Phase 1 (Static mock data)**
  - File: `lib/mock-data/social-links.ts`.
  - Export `SocialLink` types and a `socialLinks: SocialLink[]` array.

- **Phase 2+ (Dynamic data)**
  - Optionally move to Supabase/DB or CMS to make it easier to update channels and groups without code changes.
  - Consider an admin UI to add/edit/remove entries.

> Note: Do **not** rely on real-time follower counts in v1; treat `metricsLabel` as editorial text updated occasionally.

---

## Filtering, Sorting & Grouping Logic

- **Filtering**
  - By `platform`, `topics`, `regions`, `skillLevels`, and text search `q`.
- **Sorting**
  - Primary: `priority` ascending (hand-curated ordering).
  - Secondary: `name` A–Z.
- **Grouping**
  - Primary grouping by `topics` (e.g. Instruction, Gear, Communities).
  - Within each topic group, allow filter by `platform`.

Implementation mirrors the pattern used in `DirectoryContent` and the Ski Links directory:

- `SocialLinksContent` (client component):
  - `useState` for filter inputs (`platform`, `topic`, `region`, `skillLevel`, `q`).
  - `useMemo` to compute filtered, sorted, grouped `SocialLink` collections.

---

## Route & Component Architecture

```text
app/social-links/
├── page.tsx                       # Server component route

components/social-links/
├── SocialLinksHero.tsx            # Intro + featured counts
├── SocialLinksContent.tsx         # State, filtering, grouping, layout
├── SocialLinksFilters.tsx         # Filter/search controls
├── SocialLinksList.tsx            # Grouped sections + lists
└── SocialLinkCard.tsx             # Individual social card UI

lib/mock-data/
└── social-links.ts                # SocialLink types + mock data
```

- `page.tsx` imports `socialLinks` and passes to `SocialLinksContent`.
- `SocialLinksContent` is a client component managing filters and view state.

---

## Navigation & Integration Points

- **Header**
  - Add `Social Media Directory` link pointing to `/social-links` in `Header.tsx`.
- **Footer**
  - Under a "Resources" or "Directories" column, add link to `/social-links`.
- **Cross-linking with other pages**
  - From resort detail pages, surface resort-specific social accounts using `relatedResortIds` and `platform = instagram/facebook/twitter`.
  - From the Ski Links Directory, optionally link to "Social Media" section for each site/brand.

---

## Accessibility Considerations

- Platform icons should be accompanied by accessible text (e.g. `aria-label="YouTube"`).
- External links clearly indicated (icon and `aria-label` such as "opens in a new tab").
- Provide clear focus states on cards and CTAs.
- Ensure color contrast meets WCAG 2.1 AA for all badges and text.

---

## Implementation Phases

### Phase 1 – Core MVP

- Create `/social-links` route and hero + list layout.
- Implement `SocialLink` types and `social-links.ts` mock data.
- Build `SocialLinksHero`, `SocialLinksContent`, `SocialLinksFilters`, and `SocialLinkCard`.
- Support basic filters: `platform`, `topic`, `region`, and simple text search.
- Add header/footer navigation links.

### Phase 2 – UX Enhancements

- Add `skillLevels` and `formats` filters.
- Improve visual differentiation by platform (color accents, logos, badges).
- Add featured sections (e.g. "Editor’s Picks" or "Essential Channels for Beginners").
- Persist filters/search in URL query params.

### Phase 3 – Deep Integration & CMS

- Integrate with resort detail pages via `relatedResortIds`.
- Move data into CMS/DB for easier curation.
- Add an internal admin UI for managing social entries.
- Consider user suggestions for channels/groups (with moderation flow).

---

## Summary

The Social Media Links Directory extends the site from a **resort and resource directory** into a **people and communities directory**, helping skiers discover the best ski-related channels, accounts, and groups across major platforms.

By mirroring the patterns from the Ski Links Directory and A–Z resort directory (filters, cards, responsive design, type-safe mock data), this page can be implemented incrementally while remaining consistent with the existing UI/UX and technical stack.
