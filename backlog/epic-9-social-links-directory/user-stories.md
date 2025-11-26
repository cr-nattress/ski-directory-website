# Epic 9: Social Media Links Directory Page

## Overview

Create a comprehensive Social Media Links Directory page that serves as a curated hub of ski-related social media profiles, channels, and communities. While the Ski Links Directory focuses on websites and tools, this page is about **people, brands, and communities** on platforms like YouTube, Instagram, TikTok, Facebook, Reddit, X/Twitter, Discord, and forums.

The goal is to become the **go-to starting point** for skiers who want to discover the best ski content creators, official resort accounts, gear reviewers, instructional channels, and online communities.

**Reference:** [Full Implementation Plan](../../apps/v1/SOCIAL_LINK_DIR_PLAN.md)

---

## User Goals & Use Cases

1. **Learn & Improve** - Find YouTube channels for technique, coaching, and skill progression
2. **Trip Inspiration & Stoke** - Discover creators posting POV runs, powder days, and destination content
3. **Local & Resort-Specific Feeds** - Surface resort- and region-specific social accounts
4. **Gear & Tech Deep Dives** - Find honest gear reviewers across platforms
5. **Community & Conversation** - Highlight subreddits, Facebook groups, Discords, and forums
6. **Official Communications** - Centralize official resort and brand social handles

---

## User Stories

### Story 9.1: Create SocialLink Types and Initial Data File

**As a** developer
**I want** typed data structures and initial mock data for social links
**So that** the application has a consistent data model for the social media directory

**Acceptance Criteria:**
- [ ] Create `lib/mock-data/social-links-types.ts` with TypeScript types:
  - `SocialPlatform`: 'youtube' | 'instagram' | 'tiktok' | 'facebook' | 'reddit' | 'twitter' | 'discord' | 'forum'
  - `SocialRegion`: 'colorado' | 'us' | 'north-america' | 'europe' | 'japan' | 'global'
  - `SocialTopic`: 'instruction' | 'trip-vlog' | 'gear' | 'resort-official' | 'news' | 'meme' | 'backcountry' | 'safety' | 'race' | 'park' | 'family' | 'beginner-focus' | 'community'
  - `SkillLevel`: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  - `ContentFormat`: 'short-form' | 'long-form' | 'live' | 'community'
  - `SocialLink` interface with all required fields
- [ ] Create `lib/mock-data/social-links.ts` with initial dataset of 100+ curated social accounts
- [ ] Links cover diverse categories: YouTube channels, Instagram accounts, TikTok creators, Reddit communities, Facebook groups, Discord servers
- [ ] Each link has proper metadata: name, platform, handle, URL, description, topics, regions, skillLevels, formats, isOfficial, isCommunity, metricsLabel, priority
- [ ] Export utility functions: `getSocialLinks()`, `getSocialLinksByPlatform()`, `getSocialLinksByTopic()`, `filterSocialLinks()`

**Technical Notes:**
- Follow existing patterns from `ski-links.ts`
- Priority field (1-10) determines display order within categories
- `metricsLabel` is editorial text (e.g., "250K+ subs"), not live data

**Estimated Effort:** Large (due to curating 100+ quality social accounts)

---

### Story 9.2: Create Social Links Page Route and Layout

**As a** user
**I want** to navigate to a dedicated Social Media Links Directory page
**So that** I can browse all ski-related social accounts in one place

**Acceptance Criteria:**
- [ ] Create `/social-links` route at `app/social-links/page.tsx`
- [ ] Page uses `PageWrapper` with solid header variant
- [ ] Page has a hero section with title and benefit-focused copy
- [ ] Hero displays stats: "X curated channels • Y platforms"
- [ ] Page is statically generated at build time
- [ ] Proper SEO metadata: title, description, Open Graph tags

**Technical Notes:**
- Server component for initial data fetch
- Pass data to client components for interactive filtering

**Estimated Effort:** Small

---

### Story 9.3: Build SocialLinksHero Component

**As a** user
**I want** to see an engaging introduction to the social media directory
**So that** I understand the value of the page immediately

**Acceptance Criteria:**
- [ ] Create `components/social-links/SocialLinksHero.tsx`
- [ ] Displays compelling headline (e.g., "Find the best ski YouTube channels, Instagram feeds, TikToks, and communities in one place.")
- [ ] Shows channel count and platform count stats
- [ ] Clean, minimal design consistent with existing hero patterns
- [ ] Responsive layout for mobile and desktop

**Technical Notes:**
- Accept props for dynamic stats
- Consider adding platform icons in the hero

**Estimated Effort:** Small

---

### Story 9.4: Build SocialLinkCard Component

**As a** user
**I want** to see social account information in a visually distinct card format
**So that** I can quickly identify platform, creator, and content type

**Acceptance Criteria:**
- [ ] Create `components/social-links/SocialLinkCard.tsx`
- [ ] Card displays platform icon with platform-specific color accent
- [ ] Shows: Channel/account name, Handle/URL preview, Short description (1-2 lines)
- [ ] Shows badges for: Topic (Instruction, Gear, etc.), Region, Skill level
- [ ] Shows metrics label if available (e.g., "250K+ subs")
- [ ] Shows "Official" badge for resort/brand official accounts
- [ ] Shows "Community" badge for subreddits, FB groups, forums
- [ ] Platform-specific CTA: "Open on YouTube →", "View on Instagram →", etc.
- [ ] External link opens in new tab with proper accessibility
- [ ] Hover state for desktop

**Platform Colors:**
- YouTube: Red (#FF0000)
- Instagram: Gradient pink/purple
- TikTok: Black/cyan
- Facebook: Blue (#1877F2)
- Reddit: Orange (#FF4500)
- Twitter/X: Black
- Discord: Purple (#5865F2)

**Technical Notes:**
- Use Lucide icons or custom SVG for platform logos
- Ensure color contrast meets WCAG AA

**Estimated Effort:** Medium

---

### Story 9.5: Build SocialLinksFilters Component

**As a** user
**I want** to filter and search the social media directory
**So that** I can find specific types of accounts quickly

**Acceptance Criteria:**
- [ ] Create `components/social-links/SocialLinksFilters.tsx`
- [ ] Search input for text search (name, handle, description)
- [ ] Platform dropdown: All / YouTube / Instagram / TikTok / Facebook / Reddit / Twitter / Discord / Forum
- [ ] Topic dropdown: All / Instruction / Trip Vlogs / Gear / Resort Official / Backcountry / News / Communities
- [ ] Region dropdown: All / Colorado / US / North America / Europe / Japan / Global
- [ ] Shows result count: "Showing N of M channels"
- [ ] Responsive layout (stacks on mobile)
- [ ] Filter state persists in URL query params

**Technical Notes:**
- Reuse visual patterns from `SkiLinksFilters`
- Use `useSearchParams` and `useRouter` for URL state

**Estimated Effort:** Medium

---

### Story 9.6: Build SocialLinksList Component

**As a** user
**I want** to see social accounts grouped by topic with section headings
**So that** I can browse related accounts together

**Acceptance Criteria:**
- [ ] Create `components/social-links/SocialLinksList.tsx`
- [ ] Groups cards by topic (Instruction, Gear, Resort Official, etc.)
- [ ] Section heading shows topic name and count (e.g., "Instruction & Technique (25)")
- [ ] Each section has a topic-specific icon
- [ ] Responsive grid layout: 3 columns on desktop, 2 on tablet, 1 on mobile
- [ ] Empty state if no accounts match filters

**Topic Icons:**
- Instruction: GraduationCap
- Trip Vlogs: Video
- Gear: ShoppingBag
- Resort Official: Mountain
- Backcountry: Compass
- News: Newspaper
- Communities: Users

**Technical Notes:**
- Use CSS Grid for responsive layout
- Topics sorted by predefined order, not alphabetically

**Estimated Effort:** Medium

---

### Story 9.7: Build SocialLinksContent Client Component

**As a** developer
**I want** a central client component that manages filter state and data
**So that** filtering and display logic are cleanly organized

**Acceptance Criteria:**
- [ ] Create `components/social-links/SocialLinksContent.tsx` as client component
- [ ] Manages state for: platform, topic, region, search query
- [ ] Uses `useMemo` to compute filtered and sorted links
- [ ] Groups links by topic for section display
- [ ] Passes filtered data to `SocialLinksList`
- [ ] Syncs filter state with URL query params
- [ ] Handles empty filter results gracefully

**Technical Notes:**
- Follow pattern from `SkiLinksContent.tsx`
- Primary sort by priority, secondary by name A-Z

**Estimated Effort:** Medium

---

### Story 9.8: Add Navigation Links to Header and Footer

**As a** user
**I want** to access the Social Media Directory from the main navigation
**So that** I can easily find the page

**Acceptance Criteria:**
- [ ] Add "Social" or "Social Media" link to Header dropdown menu
- [ ] Position after "Ski Links" in menu order
- [ ] Link navigates to `/social-links`
- [ ] Add "Social Media Directory" to Footer under Resources column
- [ ] Current page indicator when on social-links page (optional)

**Technical Notes:**
- Update `Header.tsx` dropdown menu items
- Update `Footer.tsx` Resources section

**Estimated Effort:** Small

---

### Story 9.9: Implement Keyboard Navigation and Accessibility

**As a** user who relies on keyboard navigation or screen readers
**I want** the social media directory to be fully accessible
**So that** I can use it regardless of my abilities

**Acceptance Criteria:**
- [ ] All filter controls are keyboard accessible
- [ ] External links have `aria-label` indicating platform and "opens in new tab"
- [ ] Platform icons have accessible text (`aria-label`)
- [ ] Focus states are visible on all interactive elements
- [ ] Tab order is logical
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Screen reader announces filter results count on change

**Technical Notes:**
- Test with keyboard-only navigation
- Use `role="status"` and `aria-live` for dynamic content updates

**Estimated Effort:** Small

---

### Story 9.10: SEO and Meta Tags

**As a** search engine
**I want** the social links page to have proper meta tags
**So that** it ranks well and provides rich previews

**Acceptance Criteria:**
- [ ] Page has unique title: "Ski Social Media Channels & Communities Directory | Ski Colorado"
- [ ] Page has meta description summarizing the directory
- [ ] Open Graph tags for social sharing
- [ ] Canonical URL set correctly
- [ ] Page is included in sitemap (future)

**Technical Notes:**
- Use Next.js `generateMetadata` function

**Estimated Effort:** Small

---

### Story 9.11: Add Platform Icon Components (Enhancement)

**As a** user
**I want** to see recognizable platform icons for each social account
**So that** I can quickly identify which platform an account is on

**Acceptance Criteria:**
- [ ] Create platform icon component or utility
- [ ] Icons for: YouTube, Instagram, TikTok, Facebook, Reddit, Twitter/X, Discord
- [ ] Icons use official brand colors
- [ ] Icons displayed in cards and optionally in filters
- [ ] Icons are accessible (decorative, hidden from screen readers with visible text alternative)

**Technical Notes:**
- Use Lucide icons where available or custom SVGs
- Consider using react-icons package if needed

**Estimated Effort:** Small

---

### Story 9.12: Add Skill Level Filter (Enhancement)

**As a** user
**I want** to filter social accounts by skill level
**So that** I can find content appropriate for my skiing ability

**Acceptance Criteria:**
- [ ] Add Skill Level dropdown to filters
- [ ] Options: All / Beginner / Intermediate / Advanced / Expert
- [ ] Filter applies to accounts that match any of their `skillLevels`
- [ ] Works in combination with other filters
- [ ] Filter state persists in URL query params

**Technical Notes:**
- Many accounts may have multiple skill levels
- Consider showing skill level badges on cards

**Estimated Effort:** Small

---

## Story Summary

| Story | Title | Effort | Priority |
|-------|-------|--------|----------|
| 9.1 | Create SocialLink Types and Initial Data File | Large | P0 |
| 9.2 | Create Social Links Page Route and Layout | Small | P0 |
| 9.3 | Build SocialLinksHero Component | Small | P0 |
| 9.4 | Build SocialLinkCard Component | Medium | P0 |
| 9.5 | Build SocialLinksFilters Component | Medium | P0 |
| 9.6 | Build SocialLinksList Component | Medium | P0 |
| 9.7 | Build SocialLinksContent Client Component | Medium | P0 |
| 9.8 | Add Navigation Links to Header and Footer | Small | P0 |
| 9.9 | Implement Keyboard Navigation and Accessibility | Small | P1 |
| 9.10 | SEO and Meta Tags | Small | P1 |
| 9.11 | Add Platform Icon Components | Small | P1 |
| 9.12 | Add Skill Level Filter | Small | P2 |

**Total Stories:** 12
**Effort Breakdown:** Small: 7, Medium: 4, Large: 1

---

## Implementation Order

### Phase 1: Foundation (Stories 9.1, 9.2, 9.3)
Create data model, initial dataset of 100+ social accounts, and basic page structure.

### Phase 2: Core Components (Stories 9.4, 9.5, 9.6, 9.7)
Build the main UI components for displaying and filtering social accounts.

### Phase 3: Integration (Story 9.8)
Add navigation links to make the page discoverable.

### Phase 4: Polish (Stories 9.9, 9.10, 9.11)
Accessibility improvements, SEO, and visual enhancements.

### Phase 5: Enhancements (Story 9.12)
Additional filtering capabilities.

---

## Dependencies

- Existing design system (colors, fonts, spacing)
- Existing PageWrapper, Header, Footer components
- Existing filter patterns from Ski Links Directory
- Lucide React icons (or alternative icon library)

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Data storage | In-memory mock data | Phase 1; CMS/DB later |
| State management | URL query params | Shareable links, browser back works |
| Data fetching | Static generation | No real-time data yet |
| Filtering/sorting | Client-side | Moderate dataset (~100 accounts) |
| Metrics display | Editorial text | No live API calls for follower counts |

---

## Initial Social Account Categories (100+ Accounts)

The initial dataset should include diverse accounts across all platforms and topics:

### Instruction & Technique (~20 accounts)
- YouTube: Stomp It Tutorials, Elate Media, Deb Armstrong, PSIA-AASI
- Instagram: Technique coaches, ski schools
- TikTok: Quick tip creators

### Trip Reports & Vlogs (~20 accounts)
- YouTube: Cody Townsend, Teton Gravity Research, ski vloggers
- Instagram: POV skiing, travel photographers
- TikTok: Resort walkthroughs, powder day clips

### Gear & Reviews (~15 accounts)
- YouTube: Blister, Ski Essentials, boot fitter channels
- Instagram: Gear photographers, brand accounts
- Reddit: r/skigear

### Resort & Region Feeds (~15 accounts)
- Official resort Instagram/Facebook/Twitter accounts
- Local photographer accounts
- Regional ski club pages

### Backcountry & Safety (~10 accounts)
- YouTube: Avalanche education, touring vlogs
- Instagram: Avalanche centers, guides
- Reddit: r/Backcountry

### News, Commentary & Culture (~10 accounts)
- YouTube: Ski news channels
- Instagram: Meme accounts, culture commentary
- Twitter: Industry news accounts

### Communities & Groups (~15 accounts)
- Reddit: r/skiing, r/COsnow, r/Backcountry, r/icecoast
- Facebook: Regional ski groups
- Discord: Ski communities
- Forums: TGR, Newschoolers

---

## Out of Scope (Future Epics)

- User-submitted social accounts
- Live follower/subscriber count updates
- Embedded video previews
- Account verification system
- Integration with resort detail pages
- Admin interface for managing accounts
- Analytics on link clicks
