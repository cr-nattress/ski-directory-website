# Epic 15: National Resort Data Migration to GCP Cloud Storage

## Quick Reference

| Metric | Value |
|--------|-------|
| Total Stories | 20 |
| US States | 12 |
| Canadian Provinces | 4 |
| Total Resorts | ~74 active |
| Estimated Effort | Medium |

## Story Index

### Phase 1: US Western Region
| Story | State | Resorts | Priority | Status |
|-------|-------|---------|----------|--------|
| [15.1](stories/story-15.1-colorado.md) | Colorado | 76 | High | Pending |
| [15.2](stories/story-15.2-california.md) | California | 26 | High | Pending |
| 15.3 | Utah | 6 | High | Pending |
| 15.4 | Alaska | 11 | Medium | Pending |
| 15.5 | Arizona | 3 | Medium | Pending |
| 15.6 | Idaho | 1 | Medium | Pending |
| 15.7 | Montana | 1 | Medium | Pending |
| 15.8 | Nevada | 1 | Medium | Pending |
| 15.9 | New Mexico | 1 | Medium | Pending |
| 15.10 | Wyoming | 1 | Medium | Pending |

### Phase 2: US Eastern Region
| Story | State | Resorts | Priority | Status |
|-------|-------|---------|----------|--------|
| 15.11 | Vermont | 5 | High | Pending |
| 15.12 | Alabama | 1 | Low | Pending |

### Phase 3: Canada
| Story | Province | Resorts | Priority | Status |
|-------|----------|---------|----------|--------|
| [15.13](stories/story-15.13-british-columbia.md) | British Columbia | 5 | High | Pending |
| 15.14 | Alberta | 2 | High | Pending |
| 15.15 | Ontario | 1 | Medium | Pending |
| 15.16 | Quebec | 1 | Medium | Pending |

### Phase 4: Infrastructure
| Story | Description | Priority | Status |
|-------|-------------|----------|--------|
| [15.17](stories/story-15.17-migration-script.md) | Migration Script | High | Pending |
| 15.18 | Region Index | Medium | Pending |
| 15.19 | App Integration | Medium | Pending |
| 15.20 | Verification | High | Pending |

## GCS URL Pattern

```
https://storage.googleapis.com/sda-assets-prod/regions/{country}/{state}/region.json
https://storage.googleapis.com/sda-assets-prod/regions/{country}/{state}/resorts.json
https://storage.googleapis.com/sda-assets-prod/regions/{country}/{state}/resorts/{slug}.json
```

## Getting Started

1. **Prerequisites**: Complete Epic 13 (GCP Setup) and Epic 14 (Initial Migration)
2. **Start with**: Story 15.17 (Migration Script)
3. **Then migrate**: Story 15.1 (Colorado) to validate the script
4. **Continue with**: High-priority states/provinces

## Dependencies

```
Epic 13: GCP Infrastructure ✅ Complete
Epic 14: Initial Asset Migration ✅ Complete
```

## Files

- [epic-15-overview.md](epic-15-overview.md) - Full epic documentation
- [stories/](stories/) - Individual story files

## Commands

```bash
# After migration script is built:
npx migrate-regions --state colorado --country us
npx migrate-regions --all
```
