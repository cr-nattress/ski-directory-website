# Epic 34: Ski Shop Enricher - OpenAI-Powered Ski Shop Discovery

## Overview

Build an updater application that uses OpenAI to discover and catalog ski shops within a configurable radius of each ski resort. The enriched data enables users to find nearby ski shops for rentals, gear purchases, and services when planning ski trips.

## Business Value

- **User Experience**: Help users find ski rentals and gear shops near their destination
- **Content Richness**: Add valuable location data that differentiates our directory
- **SEO Benefit**: More content and internal linking opportunities
- **Future Revenue**: Potential for ski shop partnerships/advertising

## Technical Approach

1. **OpenAI GPT-4 Turbo** for discovering ski shops based on resort location
2. **Supabase** for storing ski shop data and resort associations
3. **Node.js/TypeScript** updater app with CLI interface
4. **PostGIS** for geographic distance calculations

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Ski Shop Enricher App                     │
├─────────────────────────────────────────────────────────────┤
│  Supabase ──▶ Enricher Engine ──▶ OpenAI GPT-4 Turbo        │
│     │              │                      │                  │
│     │              ▼                      │                  │
│     │        Response Parser ◀────────────┘                  │
│     │              │                                         │
│     │              ▼                                         │
│     │         GCS Storage ──▶ ski-shops.json                 │
│     │              │                                         │
│     ▼              ▼                                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ ski_shops │ resort_ski_shops │ enrichment_logs       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Stories

| ID | Story | Priority | Effort | Phase |
|----|-------|----------|--------|-------|
| 34.1 | Create Supabase database schema | High | Medium | Setup |
| 34.2 | Set up Node.js/TypeScript project | High | Small | Setup |
| 34.3 | Implement OpenAI service with prompts | High | Medium | Core |
| 34.4 | Build response parser and validator | High | Medium | Core |
| 34.5 | Implement ski shop upsert logic | High | Medium | Core |
| 34.6 | Create resort-shop linking with distance | High | Small | Core |
| 34.7 | Add enrichment logging and monitoring | Medium | Small | Core |
| 34.8 | Build CLI interface | Medium | Small | CLI |
| 34.9 | Test with sample resorts | High | Small | Testing |
| 34.10 | Run full enrichment for all resorts | Medium | Medium | Execution |
| 34.11 | Create Supabase view for querying | Medium | Small | Integration |
| 34.12 | Add API endpoint for resort ski shops | Low | Small | Integration |
| 34.13 | Save ski shop JSON to GCS before Supabase | High | Medium | Core |

## Database Tables

### `ski_shops`
- Core ski shop information (name, address, coordinates, website, etc.)
- Shop type and services offered
- Source tracking and verification status

### `resort_ski_shops`
- Junction table linking resorts to nearby shops
- Stores calculated distance and drive time
- Flags for on-mountain and preferred shops

### `ski_shop_enrichment_logs`
- Audit trail for enrichment runs
- Request/response tracking
- Cost and token usage monitoring

## Cost Estimates

| Item | Estimate |
|------|----------|
| OpenAI per resort | ~$0.05 |
| Total for 200 resorts | ~$10.00 |
| Supabase storage | Minimal |

## Success Metrics

| Metric | Target |
|--------|--------|
| Resorts with ski shops | > 90% |
| Average shops per resort | 3-5 |
| Data accuracy rate | > 85% |
| API cost per full run | < $15 |
| Full enrichment time | < 2 hours |

## Dependencies

- OpenAI API key with GPT-4 access
- Supabase project with PostGIS enabled
- Node.js 18+ runtime

## Reference

- Detailed implementation plan: `apps/updaters/ski-shop-enricher/SKI_SHOP_PLAN.md`

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| OpenAI hallucinated data | Manual verification flag, cross-reference option |
| Rate limiting | Configurable delays, batch processing |
| Duplicate shops | Slug-based deduplication, fuzzy matching |
| Stale data | Re-enrichment capability, last_enriched_at tracking |
