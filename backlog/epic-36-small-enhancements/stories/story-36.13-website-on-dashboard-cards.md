# Story 36.13: Add Website Link to Dashboard Cards

## Description

Add the resort's official website link to the dashboard/home page resort cards for quick access.

## Acceptance Criteria

- [ ] Website link/icon displayed on dashboard resort cards
- [ ] Only shown when website URL is available
- [ ] Opens in new tab
- [ ] Does not interfere with main card click action
- [ ] Visually consistent with other card elements

## Design Considerations

- Small globe or external link icon
- Position: bottom right corner or near resort name
- Stop event propagation to prevent card navigation

## Technical Notes

- Similar implementation to Story 36.8 but for dashboard cards
- Check if dashboard uses same card component as directory

## Effort

Small (1-2 hours)
