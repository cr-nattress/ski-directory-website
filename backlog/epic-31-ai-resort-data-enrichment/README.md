# Epic 31: AI-Powered Resort Data Enrichment

## Overview

Build a comprehensive AI-powered data enrichment pipeline that analyzes all available data for each resort in GCS, uses OpenAI to generate high-quality content and extract structured data, saves results to GCS, and updates Supabase with enriched resort information.

## Business Value

- **Content Quality**: AI-generated taglines and descriptions provide consistent, engaging content
- **Data Completeness**: Automatically populate missing resort statistics from available sources
- **Scalability**: Process hundreds of resorts incrementally without manual intervention
- **Auditability**: JSON output in GCS provides full audit trail of AI decisions

## Technical Context

### Existing Infrastructure

The project already has:
- `apps/updaters/wikidata-enricher/` - Existing OpenAI integration for Wikipedia data extraction
- `apps/updaters/wikipedia-updater/` - Fetches Wikipedia content to GCS
- `apps/updaters/liftie-sync/` - Syncs real-time lift data from Liftie.info

### GCS Folder Structure (per resort)
```
sda-assets-prod/resorts/{state}/{slug}/
├── README.md              # Wikipedia content (markdown)
├── wiki-data.json         # Raw Wikipedia extraction
├── wikipedia/
│   └── primary.jpg        # Hero image
├── liftie/
│   ├── summary.json       # Lift status summary
│   ├── lifts.json         # Individual lift data
│   ├── weather.json       # Weather conditions
│   └── webcams.json       # Webcam feeds
└── ai-enrichment.json     # NEW: AI-generated data (this epic)
```

### Target Supabase Fields

| Field | Type | Source |
|-------|------|--------|
| `tagline` | text | AI-generated |
| `description` | text | AI-generated |
| `terrain.beginner` | integer | AI-extracted (%) |
| `terrain.intermediate` | integer | AI-extracted (%) |
| `terrain.advanced` | integer | AI-extracted (%) |
| `terrain.expert` | integer | AI-extracted (%) |
| `stats.liftsCount` | integer | AI-extracted |
| `stats.verticalDrop` | integer | AI-extracted (ft) |
| `stats.summitElevation` | integer | AI-extracted (ft) |
| `stats.baseElevation` | integer | AI-extracted (ft) |
| `stats.skiableAcres` | integer | AI-extracted |
| `stats.avgAnnualSnowfall` | integer | AI-extracted (inches) |
| `stats.runsCount` | integer | AI-extracted |

## Stories

| Story | Title | Priority | Size |
|-------|-------|----------|------|
| 31.1 | Create AI Enrichment Updater Project Structure | High | M |
| 31.2 | Implement GCS Data Aggregation Service | High | M |
| 31.3 | Design OpenAI Prompt for Resort Data Extraction | High | L |
| 31.4 | Implement OpenAI Integration with Structured Output | High | M |
| 31.5 | Create JSON Schema for AI Enrichment Output | Medium | S |
| 31.6 | Implement GCS Output Writer | Medium | S |
| 31.7 | Create Supabase Update Service | High | M |
| 31.8 | Implement Incremental Processing with Resume Support | Medium | M |
| 31.9 | Add CLI Interface with Filtering Options | Medium | S |
| 31.10 | Add Dry-Run Mode and Logging | Medium | S |
| 31.11 | Create Cost Tracking and Reporting | Low | S |
| 31.12 | Add Confidence Scoring and Threshold Filtering | Medium | M |
| 31.13 | Write Integration Tests | Low | M |
| 31.14 | Create Documentation and Usage Guide | Low | S |

## Dependencies

- OpenAI API key with GPT-4o access
- GCS service account with read/write permissions
- Supabase service role key
- Existing resort data in GCS (from wikipedia-updater)

## Success Criteria

- [ ] All resorts with GCS data are processed
- [ ] AI-generated content meets quality standards
- [ ] Extracted stats have confidence scores ≥ 0.7
- [ ] JSON audit files saved to GCS for each resort
- [ ] Supabase updated with enriched data
- [ ] Pipeline can resume from interruption
- [ ] Cost per resort documented and tracked

## Estimated Effort

**Total**: 3-4 days of development

## References

- [Existing Wikidata Enricher](../../apps/updaters/wikidata-enricher/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [GCS Node.js Client](https://cloud.google.com/storage/docs/reference/libraries)
