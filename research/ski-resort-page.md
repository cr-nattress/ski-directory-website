1. Airbnb listing detail page – UI/UX patterns

Using your screenshot as reference.

1.1 Layout structure

Two-column desktop layout

Left (≈70%): Media + core narrative.

Large primary photo with a 2x2 grid of secondary photos.

“Show all photos” CTA bottom-right.

Right (≈30%): Action rail.

Booking card (dates, guests, price breakdown, CTA button).

Pill like “Prices include all fees”.

Mobile

Photos become a swipeable gallery.

Booking card usually collapses into a sticky bottom or top bar CTA (“Reserve”).

Takeaway: Strong separation of experience story (left) and transaction (right).

1.2 Above-the-fold information

Immediately under the global nav:

Listing title: “Close to Coors Field + Kitchen. Bar. Playroom.”

Gallery dominates the view.

Under gallery:

Listing type + location: “Room in hotel in Denver, Colorado”.

Capacity + key facts: “2 guests · 1 bedroom · 1 bed · 1 private bath”.

Rating + count: “★ 5.0 · 4 reviews”.

Host info row with avatar: “Hosted by The Catbird Hotel”.

UX notes

Title is marketing copy – emotional/experiential first, specifics second.

Quick stats line compresses what a user cares about most into a single scan line.

Host block builds trust and frames the relationship (“you’re staying with a real person / brand”).

1.3 Booking card (right rail)

Price with context: “$208 for 2 nights”.

Date pickers (check-in/out).

Guest selector.

Primary CTA: “Reserve”.

Sub-copy: fees, cancellation notes, etc.

UX patterns

Persistent action: Card stays visible on scroll (or returns via sticky header) → constant “book” affordance.

Low cognitive load: Very few inputs required to see a concrete price.

1.4 Sectioning below the fold (not in screenshot but important)

Typical order:

“Where you’ll sleep” – little card(s) for bedrooms.

“What this place offers” – amenities grid with icons.

“Where you’ll be” – map.

Description/story.

Reviews with filters.

Host profile & house rules.

Patterns

Top-loaded with practical info (beds, amenities) before long text.

Icons everywhere to reduce reading.

Chunking: each concept in its own card/section with strong headings.

2. AllTrails “Best trails in Vail” page – UI/UX patterns

From your screenshot.

2.1 Split hero: narrative vs geospatial

Left column

Title: “Best trails in Vail”.

Rating + review count under title.

Photo collage (3–4 images) with “All photos” CTA.

Short descriptive paragraph.

Right column

Large interactive map with trail pins.

Zoom controls, mapbox attribution.

UX patterns

Dual mental models: Text/photos for “vibe”, map for geographic reasoning.

Title + rating at top set expectation: you’re looking at a curated collection, not just raw data.

2.2 “Top trails” list

Section header "Top trails".

First trail card example:

#1 – Booth Falls

Rating + difficulty badge (“Hard”).

Distance, elevation, estimated time.

Short summary text.

Bookmark icon.

Cards are in a vertical list; map on the right mirrors selected trail.

UX patterns

Trail cards ≈ product cards: a fixed template of critical stats.

Difficulty + time front-and-center: core user constraints.

Map selection and list selection are synchronized → strong spatial orientation.

3. Yelp business page – UI/UX patterns

From the Nosu Ramen screenshot.

3.1 Hero band: identity + social proof + CTAs

Large photo collage (4 images) with arrows + “See all 257 photos”.

Overlaid (left side):

Business name: “Nosu Ramen”.

Star rating + review count.

Claimed badge, price tier, categories.

Status pill (“Closed · 5:00 PM – 10:00 PM”).

Below hero, above the fold:

Big red CTAs:

“Write a review”.

“Add photos/videos”.

“Share”.

“Save”.

Right column: “Order takeout or delivery” button highlighted.

UX patterns

Two primary action types:

Consumer action: “Order / Call / Get directions”.

Community action: “Review / Add photos”.

Color hierarchy: Brand red used sparingly for ONLY the most important actions.

3.2 Right info rail

Website (external link).

Phone (tap-to-call).

Address + “Get directions”.

“Message the business”.

“Suggest an edit”.

Very transactional: every element is a direct way to interact with the business.

3.3 Content below the fold

“Do you recommend this business? Yes / No / Maybe” (quick NPS-style interaction).

“Menu” with “Popular dishes” cards (image + price).

Reviews list with filters and sorting.

UX patterns

Progressive engagement: Nudge for low-friction quick feedback before asking for a full review.

Cardification of menu items similar to product cards.

4. Cross-platform synthesis for a Ski Resort / Destination Detail Page

Let’s combine the best of all three for your ski-resort detail view, and keep it aligned with the landing page we already defined (hero + filter chips + card grid, mobile-first, modern/minimal).

I’ll talk desktop first, then mobile adjustments.

4.1 Page objectives

Your resort detail page should help users:

Understand the vibe quickly (Is this my kind of mountain?)

Evaluate fit (terrain, difficulty, travel logistics, cost).

Take action (add to trip, compare, jump to lodging/short-term rentals, check snow, buy passes).

That maps directly to:

Airbnb → “vibe + logistics + book”.

AllTrails → “terrain specifics + map”.

Yelp → “community sentiment + quick contact/actions”.

5. Recommended layout & IA for the resort detail page
5.1 Global structure

Desktop

12-column grid, max-width ~1200–1280px.

Left 8 columns: Story, stats, reviews, deep content.

Right 4 columns: “Action rail”.

Mobile

Single column stack.

Critical CTA(s) as sticky bottom bar (e.g., Save · Add to Trip · Lodging).

This keeps it visually compatible with your landing page grid and card system.

5.2 Hero band
5.2.1 Elements (inspired by Airbnb + Yelp)

Top of content area:

Resort name (big H1): Vail Ski Resort.

Sub-headline tagline: short, emotional:
“Legendary back bowls, polished village, high-end vibes.”

Quick stat row:

★ 4.8 (3,200 reviews)

“Epic Pass · Mega resort”

“Beginner 18% · Intermediate 29% · Advanced 53%”

Elevation: “Base 8,150 ft · Top 11,570 ft”

Media

Left: large main image (hero shot) + 3 smaller thumbnails (Airbnb-style).
Overlay button: “View 48 photos & videos”.

Optional: badge overlay for live conditions: “7” new overnight · 65” base”.

Right action rail (hero level)

Date picker: “Trip dates” (with “I’m flexible” option).

Group selector: “Riders” (# adults / # kids).

Primary CTA:

If integrated booking: Plan my trip (opens planner).

If directory-only: Explore lodging & passes.

Secondary actions:

“Save resort”.

“Compare with another mountain”.

“Share”.

Why

This mirrors Airbnb’s “gallery left, booking right”.

Yelp’s hero pattern: identity + rating + crucial tags up top.

All within your existing design language from the landing page (same typography, chips, etc.).

5.3 Map + trail context (AllTrails influence)

Directly below the hero:

5.3.1 Split section

Left: Short “Overview” paragraph + key chips.

Text: 2–3 lines max.

Chips: Family-friendly, Big-mountain terrain, Nightlife, Car-free access.

Right: Interactive map.

Resort outline, base areas, major lifts, parking, nearby town pin.

CTA button overlay: “Open full trail & lift map”.

This mirrors AllTrails’ “best trails in Vail” layout: narrative & photos on one side, geographical orientation on the other.

5.4 Resort stats & amenities (Airbnb “What this place offers” + AllTrails trail stats)
5.4.1 “Mountain stats” section

Use card or grid layout with icons:

Vertical drop

Top elevation

Skiable acres

Number of runs

Number of lifts

Average annual snowfall

Longest run length

Each stat is:

Icon

Label

Value

Optional tooltip for definition.

5.4.2 “On-mountain experience” section

Similar to Airbnb amenities grid:

Terrain parks

Learning / beginner area

On-mountain dining

Ski school

Childcare

Rental & tuning

Night skiing / night riding

Uphill access policies

Use the same chip/icon styling as landing page filters for visual continuity.

5.5 “Zones & signature runs” (AllTrails “Top trails” list)

AllTrails shows a ranked “Top trails” list with stats; you can do the same with zones or iconic runs:

Layout

Section title: “Top zones & signature runs”.

Left: vertical list of cards.

Right: map that highlights corresponding area.

Each card might include:

#1 – Back Bowls

Difficulty band: Intermediate–Advanced.

Short description.

Key stats: lifts serving, vertical, typical aspect (N/E/W).

Tags: Powder, Tree skiing, No night skiing.

Card click:

Highlights its footprint on the map.

Option to drill into a dedicated “zone detail” view later.

This takes the AllTrails UX almost directly and just swaps “trail” → “zone/run”.

5.6 Lodging, food & short-term rentals (Airbnb + Yelp hybrid)

Given your “linking to Airbnb/VRBO” goal, this is a big one.

5.6.1 “Where to stay”

Horizontal carousel of cards:

Slope-side condos

Budget hotels

Ski-in/ski-out Airbnb picks

Each card shows:

Representative photo.

Range price per night.

Number of options (e.g., “38 stays”).

CTA: “View options” → either external link (Airbnb/VRBO) or internal listing page.

5.6.2 “Where to eat & après”

Borrow Yelp:

Row of category filters: Ramen, Bars, Coffee, Pizza, Breakfast, Fine dining.

Each business card:

Photo thumbnail.

Name.

Rating & review count.

Price tier.

Distance from base (“0.3 mi from Gondola 1”).

CTA View on Yelp / View menu.

This gives Yelp-style decision power but stays in your aesthetic.

5.7 Reviews & community tips (Yelp + Airbnb)
5.7.1 “Rider reviews”

Use Yelp’s structure, Airbnb’s tone:

Overall score + distribution bar chart (e.g., ★ 4.6 with 5-to-1 star breakdown).

Filter chips:

Powder days, Family trip, Solo, Snowboarder, Beginner, Expert.

Sort options:

Most helpful, Newest, Snow quality, Crowds, Value.

Each review card:

Avatar + username (or “Verified visitor”).

Visit date & type (“Feb 2025 · 4-day trip”).

Star rating.

Highlight tags: Crowded, Great grooming, Expensive food.

Short text (truncate with “Read more”).

5.7.2 “At-a-glance summary” (AI-assisted later)

Like Yelp’s “review highlights”:

“People love:” bullet list.

“Watch out for:” bullet list.

This can be an AI-generated summary behind the scenes; UI-wise it’s just a short, scannable block before the full review list.

5.8 Planning tools (your secret sauce)

Use your app’s AI/agent focus without overcomplicating UI.

A “Planning tools” section/cards:

Snow & weather card (compact 5-day snow forecast + link to full weather view).

“Crowd calendar” card (busy/quiet meter for each month or upcoming weekend).

“Ticket price trends” card (if you’re tracking dynamic pricing).

CTA: Generate a custom trip plan (opens your agent workflow).

Keep it low-friction: one big button, minimal fields initially.

6. Interaction details & micro-UX
6.1 Sticky mini-header (Airbnb pattern)

When user scrolls past hero:

Replace big header with a compact sticky bar containing:

Resort name (shortened, e.g., “Vail”).

Star rating.

Today’s snow metric: “3” new today”.

Primary CTA button: Add to trip or Plan my trip.

This ensures there’s always a clear next step, like Airbnb’s sticky price bar.

6.2 Section navigation

Horizontal tab bar that simply anchor-scrolls:

Overview · Terrain · Lodging & Food · Map · Reviews · Planning.

On mobile, this becomes a scrollable chip bar under the hero image.

6.3 Map interactions (AllTrails pattern)

Hovering over a zone card highlights the corresponding region on the map.

Clicking a map pin scrolls the page to that card’s section.

Maintain zoom & pan state as user scrolls to reduce “map reset” annoyance.

7. Keeping it consistent with your landing page

From what we’ve already done for the landing page:

Reuse:

Color palette & typography.

Card shadows, border radius, padding.

Filter chip style (rounded chips with icons).

Information hierarchy:

Landing page: hero → filters → resort cards.

Detail page: hero → map/overview → stats → zones → lodging/food → reviews → planning.

Mobile-first:

Assume one-handed use.

Prioritize “Save” and “Add to trip” over long scrolling.

Make maps and galleries swipe-friendly.

Think of the detail page as “one level deeper using the same design DNA” rather than a totally new layout.

8. Guardrails: what not to do

Don’t dump every stat above the fold; keep the first screen emotionally simple (photos, rating, 2–3 key stats, big CTA).

Don’t scatter CTAs everywhere; follow:

1–2 primaries (Plan/Add to trip).

Everything else secondary or in contextual sections.

Don’t over-nest content; people should never be more than one click from:

Map.

Lodging.

Terrain overview.

Reviews.