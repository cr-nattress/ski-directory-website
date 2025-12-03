# Epic 27: Wikidata Enricher

## Overview

Build an automated data enrichment pipeline that reads Wikipedia data from GCS and uses OpenAI's LLM to extract, format, and map structured data to Supabase resort columns. This enables automated population of resort statistics, features, and compelling marketing content.

## Business Value

- **Content Quality**: Generate engaging taglines and descriptions for all resorts
- **Data Completeness**: Fill in missing statistics (acres, lifts, elevation, etc.)
- **SEO Improvement**: Rich, unique descriptions improve search rankings
- **Scalability**: Automated enrichment as new resorts are added
- **Consistency**: Standardized data format across all resorts

## Scope

### In Scope
- Read `wiki-data.json` files from GCS bucket
- Use OpenAI GPT-4o for intelligent data extraction
- Generate catchy taglines (5-10 words)
- Generate detailed descriptions (300-500 words)
- Extract numerical statistics (acres, lifts, runs, elevation, snowfall)
- Extract terrain percentages and feature flags
- Confidence scoring for all extracted values
- Dry run mode (default) for review before applying
- Apply mode to update Supabase
- CLI with filtering, limiting, and verbosity options

### Out of Scope
- Real-time Wikipedia fetching (handled by `wikipedia-updater`)
- Image processing (handled by `wikipedia-updater`)
- User-facing content approval workflow
- Multi-language support

## Dependencies

- `wikipedia-updater` must have run first to create `wiki-data.json` files
- OpenAI API key required
- GCS service account with read access
- Supabase service role key for writes

## Technical Design

See detailed implementation plan: [`apps/updaters/wikidata-enricher/plan.md`](../../apps/updaters/wikidata-enricher/plan.md)

## Success Criteria

1. Successfully process 90%+ of resorts with wiki data
2. Generate taglines with avg confidence > 0.85
3. Generate descriptions with avg confidence > 0.80
4. Extract statistics with avg confidence > 0.85
5. No data regression (don't overwrite good data with bad)
6. Dry run output is clear and reviewable
7. Cost per full run < $30

---

## User Stories

### Story 27.1: Project Setup
**As a** developer
**I want** a properly configured TypeScript project
**So that** I can build the wikidata enricher

**Acceptance Criteria:**
- [ ] Create `apps/updaters/wikidata-enricher/` directory structure
- [ ] Initialize package.json with dependencies
- [ ] Configure tsconfig.json
- [ ] Create .env.example with all required variables
- [ ] Create config.ts for environment loading
- [ ] Add npm scripts: `dev`, `build`, `start`

**Estimated Effort:** 2 hours

---

### Story 27.2: GCS Read Operations
**As a** developer
**I want** to read wiki-data.json files from GCS
**So that** I can process Wikipedia data for each resort

**Acceptance Criteria:**
- [ ] List all resorts from Supabase
- [ ] Check GCS for existence of wiki-data.json
- [ ] Download and parse wiki-data.json files
- [ ] Handle missing files gracefully
- [ ] Support filtering by resort slug/name

**Estimated Effort:** 3 hours

---

### Story 27.3: OpenAI Integration
**As a** developer
**I want** to send wiki data to OpenAI for extraction
**So that** I can get structured data with confidence scores

**Acceptance Criteria:**
- [ ] Initialize OpenAI client
- [ ] Create extraction prompt template
- [ ] Handle API rate limits and retries
- [ ] Parse JSON response with validation
- [ ] Track token usage and cost

**Estimated Effort:** 4 hours

---

### Story 27.4: Content Generation (Tagline & Description)
**As a** marketing team
**I want** compelling taglines and descriptions generated
**So that** each resort has unique, engaging content

**Acceptance Criteria:**
- [ ] Generate 5-10 word taglines unique to each resort
- [ ] Generate 300-500 word descriptions with:
  - Resort history and heritage
  - Terrain features and signature runs
  - Village atmosphere
  - Target audience appeal
- [ ] Include confidence scores
- [ ] Avoid generic/boilerplate content

**Estimated Effort:** 4 hours

---

### Story 27.5: Statistics Extraction
**As a** data team
**I want** numerical statistics extracted from wiki data
**So that** resort profiles have complete information

**Acceptance Criteria:**
- [ ] Extract and normalize:
  - Skiable acres (number)
  - Lift count (number)
  - Run count (number)
  - Vertical drop (feet)
  - Base elevation (feet)
  - Summit elevation (feet)
  - Annual snowfall (inches)
- [ ] Handle unit conversions (meters → feet, cm → inches)
- [ ] Confidence scoring for each value

**Estimated Effort:** 3 hours

---

### Story 27.6: Terrain & Features Extraction
**As a** data team
**I want** terrain percentages and feature flags extracted
**So that** resort profiles show complete amenities

**Acceptance Criteria:**
- [ ] Extract terrain percentages (beginner/intermediate/advanced/expert)
- [ ] Extract boolean features:
  - Has terrain park
  - Has halfpipe
  - Has night skiing
  - Has backcountry access
- [ ] Confidence scoring for each value

**Estimated Effort:** 2 hours

---

### Story 27.7: Mapping & Validation
**As a** data team
**I want** extracted data validated before updates
**So that** bad data doesn't corrupt the database

**Acceptance Criteria:**
- [ ] Apply minimum confidence thresholds
- [ ] Option to skip fields with existing values
- [ ] Validate data types and ranges
- [ ] Transform values to match Supabase schema
- [ ] Generate update payloads

**Estimated Effort:** 3 hours

---

### Story 27.8: Dry Run Output
**As a** data reviewer
**I want** to preview changes before applying
**So that** I can verify the extraction quality

**Acceptance Criteria:**
- [ ] Display generated tagline with confidence
- [ ] Display generated description with confidence
- [ ] Show proposed statistics changes (old → new)
- [ ] Show skipped fields (low confidence, already exists)
- [ ] Clear, readable console formatting

**Estimated Effort:** 2 hours

---

### Story 27.9: Supabase Updates
**As a** data team
**I want** to apply approved changes to Supabase
**So that** resort profiles are enriched

**Acceptance Criteria:**
- [ ] `--apply` flag to enable writes
- [ ] Update resort records with extracted data
- [ ] Log all applied changes
- [ ] Handle update errors gracefully
- [ ] Track success/failure counts

**Estimated Effort:** 2 hours

---

### Story 27.10: CLI & Reporting
**As a** operator
**I want** a full-featured CLI
**So that** I can run enrichment with various options

**Acceptance Criteria:**
- [ ] `--filter <name>` - Process single resort
- [ ] `--limit <n>` - Process first N resorts
- [ ] `--skip-existing` - Skip resorts with data
- [ ] `--min-confidence <n>` - Set confidence threshold
- [ ] `--apply` - Enable Supabase writes
- [ ] `--verbose` - Show detailed output
- [ ] Generate summary report with stats

**Estimated Effort:** 3 hours

---

## Total Estimated Effort

| Story | Effort |
|-------|--------|
| 27.1 Project Setup | 2 hours |
| 27.2 GCS Read Operations | 3 hours |
| 27.3 OpenAI Integration | 4 hours |
| 27.4 Content Generation | 4 hours |
| 27.5 Statistics Extraction | 3 hours |
| 27.6 Terrain & Features | 2 hours |
| 27.7 Mapping & Validation | 3 hours |
| 27.8 Dry Run Output | 2 hours |
| 27.9 Supabase Updates | 2 hours |
| 27.10 CLI & Reporting | 3 hours |
| **Total** | **28 hours** |

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| OpenAI API costs exceed budget | Medium | Monitor token usage, use GPT-4o-mini for initial pass |
| Low extraction accuracy | High | Tune prompts, add manual review for low confidence |
| Rate limiting from OpenAI | Low | Implement exponential backoff, batch processing |
| Wiki data quality varies | Medium | Confidence scoring, skip low-quality sources |

## Definition of Done

- [ ] All user stories completed and tested
- [ ] Dry run successfully processes all resorts with wiki data
- [ ] Sample of 20 resorts reviewed for quality
- [ ] README.md with usage instructions
- [ ] Cost tracking implemented
- [ ] No TypeScript errors or warnings
