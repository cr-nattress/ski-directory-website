# Story 30.20: Add README Badges for CI Status

## Description

Add status badges to the README.md showing CI build status, code coverage (when available), and other relevant project health indicators.

## Acceptance Criteria

- [ ] CI build status badge added
- [ ] Badge links to Actions workflow
- [ ] Badges display correctly on GitHub
- [ ] Badge placement follows best practices (after title, before description)
- [ ] Future badge placeholders documented

## Technical Details

### Badge Placement

Per GITHUB.md, badges should appear after the project title:

```markdown
# Ski Resort Directory

![CI](https://github.com/USERNAME/state-ski-resort-directory/actions/workflows/ci.yml/badge.svg)
![CodeQL](https://github.com/USERNAME/state-ski-resort-directory/actions/workflows/codeql.yml/badge.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.1-black?logo=next.js)
...
```

### GitHub Actions Badges

```markdown
<!-- CI Status -->
![CI](https://github.com/USERNAME/state-ski-resort-directory/actions/workflows/ci.yml/badge.svg)

<!-- CodeQL Security -->
![CodeQL](https://github.com/USERNAME/state-ski-resort-directory/actions/workflows/codeql.yml/badge.svg)
```

### Alternative: shields.io Dynamic Badges

```markdown
<!-- With branch specification -->
![CI](https://img.shields.io/github/actions/workflow/status/USERNAME/state-ski-resort-directory/ci.yml?branch=master&label=CI)

<!-- With custom styling -->
![Build](https://img.shields.io/github/actions/workflow/status/USERNAME/state-ski-resort-directory/ci.yml?style=flat-square)
```

### Future Badges (When Available)

```markdown
<!-- Code Coverage (requires coverage reporting) -->
![Coverage](https://img.shields.io/codecov/c/github/USERNAME/state-ski-resort-directory)

<!-- Dependencies -->
![Dependencies](https://img.shields.io/librariesio/github/USERNAME/state-ski-resort-directory)

<!-- Last Commit -->
![Last Commit](https://img.shields.io/github/last-commit/USERNAME/state-ski-resort-directory)

<!-- License -->
![License](https://img.shields.io/github/license/USERNAME/state-ski-resort-directory)
```

### Current README Badges

The README already has technology badges:
```markdown
![Next.js](https://img.shields.io/badge/Next.js-14.1-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwindcss)
![Leaflet](https://img.shields.io/badge/Leaflet-Maps-199900?logo=leaflet)
```

### Proposed Badge Order

1. **CI/Build Status** (dynamic - shows current state)
2. **Security Scanning** (dynamic - shows security health)
3. **License** (static - legal info)
4. **Technology Stack** (static - existing badges)

## Tasks

- [ ] Wait for CI workflow to be created (Story 30.6)
- [ ] Add CI status badge to README
- [ ] Add CodeQL badge after Story 30.16
- [ ] Update badge URLs with correct username/repo
- [ ] Verify badges render correctly
- [ ] Consider adding license badge after Story 30.2

## Effort

**Size:** S (Small - < 1 hour)

## Dependencies

- Story 30.6 (CI Workflow) for CI badge
- Story 30.16 (CodeQL) for security badge
- Story 30.2 (LICENSE) for license badge

## References

- [GITHUB.md - README.md: your project's front door](../../GITHUB.md#readmemd-your-projects-front-door)
- [shields.io](https://shields.io/)
- [GitHub Actions Badges](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/adding-a-workflow-status-badge)
