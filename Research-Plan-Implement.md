# Research → Plan → Implement: Coding Agent Guide

A concise, actionable plan to turn this repository’s research into working software. This guide defines scope, contracts, and step-by-step tasks for the coding agent building the apps: the public web directory and the background data updater.

References:
- React/Next.js standards: `research/coding/react.md`
- Supabase schema: `apps/v1/supabase/migrations/*.sql`
- Import scratchpad: `import/open-resorts.md`

---

## 1) Objectives and scope (V1)

- Public directory of ski resorts with search, state pages, resort detail pages, and map pins.
- Read-only from Supabase (anonymous) for public data; service-role writes only for background updater.
- Real-time/near-real-time conditions via Liftie into `resort_conditions` surfaced in the UI.
- Strong SSR-first Next.js (App Router) with Server Components by default.

V1 definition of done:
- Home, State, Resort Detail, and Map experiences are functional and performant.
- Basic search by name/city/tagline works and is cached.
- Conditions displayed where available (lifts %, temp, icons, webcams flag).
- Deployed preview with environment configuration and documented runbook.

---

## 2) Data model contracts (read-only for web UI)

Use the following Postgres/Supabase views and columns exactly as the data contracts for the UI:

- `resorts_list` (listing cards)
  - id, slug, name, tagline
  - country, state, state_name
  - status, is_active, is_open
  - lat, lng, nearest_city
  - skiable_acres, vertical_drop, lifts_count
  - asset_path, major_city_name, distance_from_major_city, drive_time_to_major_city
  - pass_affiliations (TEXT[])

- `resorts_map_pins` or `resort_map_pins` (map rendering)
  - id, slug, name, latitude, longitude
  - nearest_city, country_code, state_code
  - pass_affiliations, rating, status, is_active, is_lost, is_open
  - terrain_open_percent, snowfall_24h

- `resorts_full` (detail pages)
  - Adds: description, website_url, terrain, features, stats, tags, lat/lng, admin joins, etc.

- `resorts_ranked` (home/featured ordering)
  - All of `resorts_full` plus `ranking_score` (numeric) for ordering.

- `resorts_with_conditions` (detail + conditions)
  - Join of `resorts` with `resort_conditions` including:
    - lifts_open, lifts_total, lifts_percentage, weather_high, weather_condition, weather_text, weather_icon[], has_webcams, has_lifts, has_weather, conditions_updated_at, liftie_timestamp.

Search contract:
- Full-text search uses `resorts.fts` (tsvector) that includes `name`, `tagline`, `description`, `nearest_city` (see migration 001).
- For best DX, add a small SQL function later (optional): `search_resorts(q text)` returning `(id, rank)`; initially, you can query `resorts` with text search and then hydrate from `resorts_list`.

RLS and keys:
- `resort_conditions` has RLS enabled with public SELECT and service role ALL (see migration 002). Reads are safe via anon; writes must use service role (server-only).

---

## 3) Application architecture (Next.js App Router)

Follow `research/coding/react.md` for structure and patterns. High-level plan:

- Server Components by default; Client Components only for interactivity (filters, map UI, URL state).
- Data fetching in Server Components or route handlers; never fetch your own API from Server Components.
- Caching: use Next fetch caching with `revalidate` for listings; detail pages can have slightly shorter revalidation if conditions are shown.

Suggested directories (if not existing yet):
- `apps/v1/web/app`    App Router routes
- `apps/v1/web/components`    UI components
- `apps/v1/web/lib`    Supabase client wrappers, DAL, utilities

Supabase clients:
- Anonymous client for read-only queries exposed in Server Components.
- Service-role client only inside Route Handlers or Server Actions for the updater (never in Client Components).

---

## 4) Pages and data wiring

1. Home (`/`)
   - Data: Top N from `resorts_ranked` (order by `ranking_score` DESC).
   - UI: Featured grid + quick search input + link to states.
   - Cache: `revalidate = 3600` (adjust as needed).

2. State listing (`/us/[state]` and similar)
   - Data: `resorts_list` filtered by `state` (or `state_code` in map pins).
   - UI: List + map preview; filters for pass affiliations and open status.
   - Cache: `revalidate = 1800`.

3. Resort detail (`/resort/[slug]`)
   - Data: prefer `resorts_with_conditions` by `slug` for a single row; fallback to `resorts_full` when conditions missing.
   - UI: Hero (name, tagline), stats/terrain/features, conditions (lifts %, weather), passes, nearest city, map.
   - Cache: `revalidate = 600` to keep conditions reasonably fresh.

4. Map (`/map` or embedded in pages)
   - Data: `resorts_map_pins` (or `resort_map_pins`).
   - UI: Clustered pins, hover card with name/open status, filter by pass.
   - Cache: `revalidate = 1800`.

5. Search
   - Phase 1: Server text search over `resorts` using `fts`; hydrate results with `resorts_list` for card fields.
   - Phase 2 (optional): SQL function `search_resorts(q)` for ranking + pagination.

---

## 5) Data access layer (DAL) patterns

Implement small, typed server utilities under `lib/dal`:
- `getFeaturedResorts(limit)` → `resorts_ranked`
- `getResortsByState(state)` → `resorts_list`
- `getResortBySlug(slug)` → `resorts_with_conditions` (fallback `resorts_full`)
- `getMapPins(filters)` → `resorts_map_pins`
- `searchResorts(query)` → `resorts` (fts) → hydrate from `resorts_list`

Security:
- For any write or background tasks, require server context and service role. See `research/coding/react.md` “Security best practices”.

Caching:
- Use fetch cache with `next: { revalidate: <seconds> }` and tag-based revalidation for pages that change due to conditions updates.

---

## 6) Background updater (conditions)

Goal: Periodically fetch Liftie (and NOAA text) and upsert into `resort_conditions`.

Inputs/outputs:
- Input: Liftie identifiers (`liftie_id`), mapped per resort.
- Output: Upserts to `resort_conditions` by `resort_id` with `lifts_*`, `weather_*`, `webcams`, flags, and timestamps.

Constraints:
- Use Supabase service role key (server-only). Never expose to client.
- Respect rate limits; stagger updates.
- Keep `updated_at` maintained via trigger (already created in migration 002).

Deployment options (choose one):
- Cron job hitting a protected Route Handler in the web app.
- Separate serverless function or Supabase Edge Function that runs on schedule.

---

## 7) Environment configuration

Required variables (names may vary based on your client setup):
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` for public reads.
- `SUPABASE_SERVICE_ROLE_KEY` for updater writes (server-only, never in client).
- Any Liftie/NOAA endpoints or keys as needed (server-only).

Follow the type-safe env pattern from `research/coding/react.md`.

---

## 8) Milestones and acceptance criteria

- M1: Database ready
  - Apply migrations 001 and 002.
  - Views selectable and return rows.

- M2: Web app scaffold
  - Next.js App Router project with base layout, typed env, Supabase anon client.

- M3: State listing
  - `/us/[state]` renders from `resorts_list`, shows count, cards, and basic filters.

- M4: Resort detail
  - `/resort/[slug]` renders from `resorts_with_conditions` or `resorts_full` with graceful fallback.

- M5: Home and featured
  - `/` shows featured by `ranking_score` and quick search.

- M6: Map
  - Map view powered by `resorts_map_pins`, clustering and hover cards.

- M7: Search
  - Server text search backed by `resorts.fts`; returns accurate, ordered results.

- M8: Conditions updater
  - Scheduled job upserts to `resort_conditions`; UI reflects `lifts_percentage` and weather high.

---

## 9) Implementation notes and gotchas

- Server Components by default; put `'use client'` only where necessary.
- Do not fetch your own API from Server Components; query Supabase directly on the server.
- Prefer view contracts; they stabilize UI needs and allow SQL iteration without UI changes.
- Use `state_slug`/`state_code` from views to avoid free-text matching.
- Handle `is_lost`/`is_active`/`is_open` explicitly in UI badges.

---

## 10) Open questions for product/ops

- Confirm desired URL structure (e.g., `/us/co`, `/resort/arapahoe-basin`).
- Confirm map provider and clustering library.
- Decide initial `revalidate` intervals for each page.
- Provide Liftie id mapping per resort (or source of truth).

---

## 11) How this guide connects to research files

- Build and review code against: `research/coding/react.md` for architecture, caching, security, forms, and state.
- Schema truth lives in: `apps/v1/supabase/migrations/*.sql` — treat the created views as UI contracts.
- Temporary data like `import/open-resorts.md` can seed content or drive updater mapping.

