# Story 36.18: Add Ski Shops to Resort Location Map

## Description

Display nearby ski shops as markers on the resort detail page location map. When a user clicks on a ski shop marker, show a popover with the shop's details including name, services, phone number, and a clickable website icon.

## Acceptance Criteria

- [ ] Ski shop markers displayed on the resort location map
- [ ] Distinct marker icon/color to differentiate from resort marker
- [ ] Clickable markers open a popover with shop details
- [ ] Popover displays:
  - Shop name (bold/prominent)
  - Services offered (rentals, repairs, retail, etc.)
  - Phone number (clickable tel: link on mobile)
  - Website icon (opens in new tab when clicked)
- [ ] Only shops with coordinates are displayed
- [ ] Graceful handling when resort has no nearby ski shops
- [ ] Popover dismisses when clicking elsewhere on the map

## Design Considerations

- Use a different marker color/icon for ski shops (e.g., shopping bag icon or distinct color)
- Popover should be compact but readable
- Website icon should use Globe or ExternalLink from lucide-react
- Phone number should be tappable on mobile devices
- Consider showing distance from resort if available

## Technical Notes

- Ski shop data is already available in `resort.nearby.skiShops` from Supabase
- ResortLocationMap component will need to accept ski shop data as props
- Use Leaflet popup or custom popover component for marker click
- Ski shop data structure includes: name, address, phone, website, services, coordinates

## Data Source

Ski shop data is populated via the `ski-shop-enricher` updater service which uses Google Places API to find nearby ski shops within 1 mile of each resort.

## Effort

Medium (3-4 hours)
