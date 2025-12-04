
# Ski Resort Scraper + Supabase URL Registry + GCS Asset Layout

This document summarizes the unified design for tracking ski-resort-related scraping targets in Supabase and storing all extracted unstructured content in Google Cloud Storage (GCS) under the existing **SDA Assets** schema.

---

## 1. High-Level Architecture

### **Supabase Purpose**
Supabase acts as a structured **URL registry + scraper job queue**, storing:
- Resort → URL relationships  
- URL metadata (type, role, priority)  
- Scrape status  
- Minimal content indicators (has_text, has_images, etc.)

Supabase **does NOT store**:
- Raw HTML  
- Text contents  
- Images  
- JSON manifests  
- Any unstructured content  

### **Google Cloud Storage Purpose**
GCS stores all actual scraped assets following the existing SDA schema:

```
sda-assets-prod/
  resorts/{country}/{state}/{slug}/
    resort.json
    assets.json
    images/
    logos/
    trailmaps/
    docs/
    data/
    originals/
```

All scraping output (HTML, text, images, maps, metadata) is written directly into these folders.

---

## 2. Existing GCS Schema (Authoritative)

### **resort.json**
- Structured resort metadata  
- Enforced by `schemas/resort.schema.json`  
- Contains: id, slug, country, state, stats, features, pass affiliations, website, description, tags, etc.

### **assets.json**
Stores discovered images/files in a typed manifest:

- `images: AssetImage[]`
- `files: AssetFile[]`

Images may contain:
- url, alt, width, height, format, isHeroImage, isCardImage, priority

Files may contain:
- url, type (MIME), label, category (`trailmap`, `document`, `data`), year

### **Subfolders**
- `images/` – processed imagery (hero, card, scenic)
- `trailmaps/` – trail map images (current + historical)
- `logos/` – logo variants
- `docs/` – PDFs, supporting documents
- `data/` – JSON or structured exports
- `originals/` – raw source dumps from scrapers

### **Regional and Country Indexes**
- `resorts/{country}/{state}/resorts.json`
- `resorts/{country}/{state}/region.json`
- `resorts/{country}/index.json`
- `resorts/index.json`

Used for listing, aggregation, and metadata rollups.

---

## 3. Supabase Schema (URL Registry)

Supabase stores **only URLs and scrape status**, not asset content.

### **URL Source Types**
```
official | encyclopedia | social_official | ski_portal |
travel_review | regional_tourism | ugc_video | community_forum | other
```

### **Page Roles**
```
home | mountain_overview | trail_map | lift_tickets | conditions |
experience | events | lodging | dining | contact | policies |
profile | photo_gallery | video_feed | reviews | search_results | generic
```

### **Scrape Status**
```
pending | in_progress | success | error | disabled
```

---

## 4. Table: `resort_urls`

```sql
create table if not exists resort_urls (
  id                  uuid primary key default gen_random_uuid(),
  resort_id           uuid not null references resorts(id) on delete cascade,

  url                 text not null,
  source_type         url_source_type not null,
  source_name         text not null,
  page_role           url_page_role not null,
  description         text,

  is_primary          boolean not null default false,
  priority            integer not null default 100,
  scrape_frequency_days integer not null default 7,

  scrape_status       url_scrape_status not null default 'pending',
  last_scraped_at     timestamptz,
  last_http_status    integer,
  last_error          text,

  has_text            boolean,
  has_images          boolean,
  last_content_hash   text,
  next_scrape_after   timestamptz,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  unique (resort_id, url)
);
```

This table is the **scraper job queue**.

---

## 5. How Scraping Works

1. **Query Supabase for URLs that need work**
   - `pending`, `error`, or `next_scrape_after <= now()`

2. **Scrape the HTML**
   - Extract text, images, metadata  
   - Normalize text (for hashing + LLM)

3. **Write scraped outputs to GCS**
   - Use the resort's existing GCS prefix:
     ```
     resorts/{country}/{state}/{slug}/
     ```
   - Save discovered content into:
     - `images/`
     - `trailmaps/`
     - `logos/`
     - `docs/`
     - `originals/`
     - Update `assets.json` accordingly

4. **Update `resort_urls` row**
   - Mark success or error
   - Set `has_text`, `has_images`
   - Set `next_scrape_after = now() + scrape_frequency_days`

5. **Optional: Update `resort.json`**
   - If scraping yielded new stats, descriptions, or properties

---

## 6. What Goes in Supabase vs. GCS

| Item | Supabase | GCS |
|------|----------|-----|
| URL list | ✅ | ❌ |
| Source type | ✅ | ❌ |
| Page role | ✅ | ❌ |
| Scrape lifecycle (pending/success/error) | ✅ | ❌ |
| Raw HTML | ❌ | ✅ (`originals/`) |
| Extracted text | ❌ | ❌ or `data/` |
| Images | ❌ | ✅ (`images/`, `trailmaps/`, etc.) |
| Updated `assets.json` | ❌ | ✅ |
| Updated `resort.json` | ❌ | ✅ |

Supabase stores **metadata about targets**,  
GCS stores **all scraped assets**.

---

## 7. Example: Montage Mountain

### Supabase `resort_urls` entries (abbrev.)

| url | source_type | page_role | priority |
|-----|-------------|-----------|----------|
| https://montagemountainresorts.com/ | official | home | 10 |
| https://montagemountainresorts.com/trails/ | official | trail_map | 20 |
| https://en.wikipedia.org/wiki/Montage_Mountain | encyclopedia | generic | 15 |
| https://instagram.com/montagemtnpa | social_official | profile | 60 |
| https://www.onthesnow.com/... | ski_portal | mountain_overview | 80 |
| https://www.tripadvisor.com/... | travel_review | reviews | 90 |

### GCS Target Layout
```
resorts/us/pa/montage-mountain/
  resort.json
  assets.json
  images/
  trailmaps/
  originals/
  ...
```

---

## 8. Summary

Supabase = **lightweight URL + job metadata registry**  
GCS = **the authoritative home for all scraped assets and structured metadata**

This architecture cleanly fits into your existing SDA asset schema, avoids duplication, and allows cheap scalable scraping without inflating the database.

---

Generated README for Ski Resort Scraper Integration.
