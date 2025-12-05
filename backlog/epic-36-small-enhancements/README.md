# Epic 36: Small Enhancements

## Overview

A collection of small, independent enhancements and improvements to the ski resort directory. This epic serves as a container for minor features, bug fixes, and quality-of-life improvements that don't warrant their own dedicated epic.

## Business Value

- **Incremental Improvement**: Continuous small improvements enhance overall user experience
- **Technical Debt**: Address minor issues before they accumulate
- **Quick Wins**: Deliver value without large planning overhead
- **User Feedback**: Rapid response to user-reported issues and suggestions

## Scope

This epic includes:
- Minor UI/UX improvements
- Small bug fixes
- Performance optimizations
- Accessibility enhancements
- Content updates
- Developer experience improvements

## Stories

| ID | Story | Priority | Effort | Status |
|----|-------|----------|--------|--------|
| 36.1 | Collapsible Ski Links sections | Medium | Small | Done |
| 36.2 | Replace Map bottom menu with Social | Medium | Small | Done |
| 36.3 | Rename "Ski Links" to "Links" | Low | Small | Done |
| 36.4 | Rename "A-Z Resort Directory" to "Resorts" | Low | Small | Done |
| 36.5 | Rename "Directory" to "Resorts" in menu | Low | Small | Done |
| 36.6 | Compact filter display on directory | Medium | Medium | Pending |
| 36.7 | Remove star rating from directory | Low | Small | Done |
| 36.8 | Add website badge to resort cards | Medium | Small | Done |
| 36.9 | Deep research: Performance optimization | High | Large | Done |
| 36.10 | Deep research: PWA feasibility | Medium | Large | Done |
| 36.11 | Compact mobile categories on dashboard | Medium | Medium | Pending |
| 36.12 | Add regions category for resorts | Low | Medium-Large | Pending |
| 36.13 | Add website link to dashboard cards | Medium | Small | Pending |
| 36.14 | Dashboard cards filter/sorting investigation | Medium | Medium | Pending |
| 36.15 | Decrease mobile logo size by 10% | Low | Small | Done |
| 36.16 | Deep research: Monetization strategies | High | Large | Done |
| 36.17 | Website metadata export for research | Medium | Medium | Pending |

## Guidelines

### What Belongs Here
- Changes that can be completed in 1-4 hours
- Self-contained improvements with no dependencies
- Bug fixes that don't require architectural changes
- UI polish and refinements

### What Doesn't Belong Here
- Features requiring database schema changes
- Multi-component refactoring
- New major features
- Changes requiring extensive testing infrastructure

## Adding Stories

To add a new story:
1. Create a file in `stories/` directory: `story-36.X-short-description.md`
2. Update the Stories table above
3. Follow the standard story template

## Completion Criteria

Stories in this epic are considered complete when:
- Code changes are implemented and tested
- No regressions introduced
- PR merged to master branch
