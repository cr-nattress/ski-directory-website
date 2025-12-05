# Story 36.8: Add Website Badge to Resort Cards

## Description

Add a website badge/icon to resort cards that links to the resort's official website, providing quick access to official resort information.

## Acceptance Criteria

- [ ] Website badge/icon displayed on resort cards (when website URL available)
- [ ] Clicking badge opens resort website in new tab
- [ ] Badge has appropriate hover state
- [ ] Accessible (proper aria labels)
- [ ] Badge not shown if no website URL in data

## Design Considerations

- Small globe or external link icon
- Positioned consistently (e.g., corner of card or near title)
- Should not interfere with main card click action

## Technical Notes

- Check `website_url` field in resort data
- Use `target="_blank"` with `rel="noopener noreferrer"`
- Add click tracking for analytics

## Effort

Small (1-2 hours)
