# Epic 41: UI Module Reorganization

## Overview

Reorganize the `apps/v1` codebase from a flat component structure into clearly separated feature modules to improve maintainability, discoverability, and scalability.

## Goals

- Clear separation of concerns between feature modules
- Co-located components and hooks per domain
- Reusable UI primitives in a design system layer
- Easier onboarding and code navigation
- Foundation for future code splitting

## Success Criteria

- All pages render correctly after each story
- `npm run build` passes with no errors
- No circular dependencies
- All existing functionality preserved
- Each module can be reasoned about independently

## Dependencies

- Reference: `apps/v1/docs/MODULE-REORGANIZATION-PLAN.md`

## User Stories

### Phase 1: Infrastructure Setup

- [Story 1.1](./stories/story-1.1-create-directory-structure.md) - Create module directory structure
- [Story 1.2](./stories/story-1.2-add-path-aliases.md) - Add TypeScript path aliases

### Phase 2: Shared Infrastructure

- [Story 2.1](./stories/story-2.1-migrate-types.md) - Migrate shared types to `shared/types/`
- [Story 2.2](./stories/story-2.2-migrate-utils.md) - Migrate utility functions to `shared/utils/`
- [Story 2.3](./stories/story-2.3-migrate-config.md) - Migrate configuration to `shared/config/`
- [Story 2.4](./stories/story-2.4-migrate-shared-hooks.md) - Migrate cross-cutting hooks to `shared/hooks/`

### Phase 3: UI Primitives

- [Story 3.1](./stories/story-3.1-migrate-skeleton.md) - Migrate Skeleton component to `ui/primitives/`
- [Story 3.2](./stories/story-3.2-migrate-accordion.md) - Migrate Accordion component to `ui/primitives/`
- [Story 3.3](./stories/story-3.3-migrate-breadcrumb.md) - Migrate Breadcrumb to `ui/layout/`
- [Story 3.4](./stories/story-3.4-migrate-resort-image.md) - Migrate ResortImage to `ui/media/`
- [Story 3.5](./stories/story-3.5-migrate-platform-icon.md) - Migrate PlatformIcon to `ui/media/`
- [Story 3.6](./stories/story-3.6-create-badge-component.md) - Create unified Badge component in `ui/primitives/`

### Phase 4: UI Layout Components

- [Story 4.1](./stories/story-4.1-migrate-header.md) - Migrate Header to `ui/layout/`
- [Story 4.2](./stories/story-4.2-migrate-footer.md) - Migrate Footer to `ui/layout/`
- [Story 4.3](./stories/story-4.3-migrate-page-wrapper.md) - Migrate PageWrapper to `ui/layout/`
- [Story 4.4](./stories/story-4.4-migrate-mobile-bottom-nav.md) - Migrate MobileBottomNav to `ui/layout/`

### Phase 5: UI Feedback Components

- [Story 5.1](./stories/story-5.1-migrate-loading-more.md) - Migrate LoadingMore to `ui/feedback/`
- [Story 5.2](./stories/story-5.2-migrate-error-boundary.md) - Migrate ErrorBoundary to `ui/feedback/`
- [Story 5.3](./stories/story-5.3-migrate-pull-to-refresh.md) - Migrate PullToRefreshIndicator to `ui/feedback/`
- [Story 5.4](./stories/story-5.4-migrate-skeletons.md) - Migrate skeleton components to `ui/primitives/skeletons/`

### Phase 6: Links Module

- [Story 6.1](./stories/story-6.1-create-links-module.md) - Create Links module structure
- [Story 6.2](./stories/story-6.2-migrate-links-hero.md) - Migrate LinksHero component
- [Story 6.3](./stories/story-6.3-migrate-links-filters.md) - Migrate LinksFilters component
- [Story 6.4](./stories/story-6.4-migrate-links-list.md) - Migrate LinksList and LinkCard components
- [Story 6.5](./stories/story-6.5-migrate-links-content.md) - Migrate LinksContent component
- [Story 6.6](./stories/story-6.6-create-links-page-view.md) - Create LinksPageView and update route

### Phase 7: Social Module

- [Story 7.1](./stories/story-7.1-create-social-module.md) - Create Social module structure
- [Story 7.2](./stories/story-7.2-migrate-social-hero.md) - Migrate SocialHero component
- [Story 7.3](./stories/story-7.3-migrate-social-filters.md) - Migrate SocialFilters component
- [Story 7.4](./stories/story-7.4-migrate-social-list.md) - Migrate SocialList and SocialCard components
- [Story 7.5](./stories/story-7.5-migrate-social-content.md) - Migrate SocialContent component
- [Story 7.6](./stories/story-7.6-create-social-page-view.md) - Create SocialPageView and update route

### Phase 8: Directory Module

- [Story 8.1](./stories/story-8.1-create-directory-module.md) - Create Directory module structure
- [Story 8.2](./stories/story-8.2-migrate-directory-hero.md) - Migrate DirectoryHero component
- [Story 8.3](./stories/story-8.3-migrate-directory-filters.md) - Migrate DirectoryFilters component
- [Story 8.4](./stories/story-8.4-migrate-directory-table.md) - Migrate DirectoryTable component
- [Story 8.5](./stories/story-8.5-migrate-directory-list.md) - Migrate DirectoryList component
- [Story 8.6](./stories/story-8.6-migrate-directory-content.md) - Migrate DirectoryContent component
- [Story 8.7](./stories/story-8.7-create-directory-page-view.md) - Create DirectoryPageView and update route

### Phase 9: Dashboard Module - Foundation

- [Story 9.1](./stories/story-9.1-create-dashboard-module.md) - Create Dashboard module structure
- [Story 9.2](./stories/story-9.2-migrate-view-toggle.md) - Migrate ViewToggle component
- [Story 9.3](./stories/story-9.3-migrate-category-chips.md) - Migrate CategoryChips component
- [Story 9.4](./stories/story-9.4-migrate-event-banner.md) - Migrate EventBanner component
- [Story 9.5](./stories/story-9.5-migrate-search-modal.md) - Migrate SearchModal component

### Phase 10: Dashboard Module - Discovery

- [Story 10.1](./stories/story-10.1-migrate-discovery-sections.md) - Migrate DiscoverySections component
- [Story 10.2](./stories/story-10.2-migrate-resort-row.md) - Migrate ResortRow component
- [Story 10.3](./stories/story-10.3-migrate-resort-row-card.md) - Migrate ResortRowCard component

### Phase 11: Dashboard Module - Core Components

- [Story 11.1](./stories/story-11.1-migrate-resort-card.md) - Migrate ResortCard component
- [Story 11.2](./stories/story-11.2-migrate-resort-grid.md) - Migrate ResortGrid component
- [Story 11.3](./stories/story-11.3-migrate-resort-section.md) - Migrate ResortSection component
- [Story 11.4](./stories/story-11.4-migrate-intelligent-resort-section.md) - Migrate IntelligentResortSection component
- [Story 11.5](./stories/story-11.5-migrate-content-section.md) - Migrate ContentSection component

### Phase 12: Dashboard Module - Map Components

- [Story 12.1](./stories/story-12.1-migrate-resort-map-view.md) - Migrate ResortMapView component
- [Story 12.2](./stories/story-12.2-migrate-resort-map-wrapper.md) - Migrate ResortMapViewWrapper component

### Phase 13: Dashboard Module - Completion

- [Story 13.1](./stories/story-13.1-migrate-hero.md) - Migrate Hero component
- [Story 13.2](./stories/story-13.2-migrate-dashboard-hooks.md) - Migrate dashboard-specific hooks
- [Story 13.3](./stories/story-13.3-create-dashboard-page-view.md) - Create DashboardPageView and update route

### Phase 14: Resort Detail Module - Structure

- [Story 14.1](./stories/story-14.1-create-resort-detail-module.md) - Create Resort Detail module structure
- [Story 14.2](./stories/story-14.2-migrate-resort-hero.md) - Migrate ResortHero component
- [Story 14.3](./stories/story-14.3-migrate-resort-header-stats.md) - Migrate ResortHeaderStats component
- [Story 14.4](./stories/story-14.4-migrate-mobile-resort-sections.md) - Migrate MobileResortSections component

### Phase 15: Resort Detail Module - Conditions

- [Story 15.1](./stories/story-15.1-migrate-conditions-section.md) - Migrate ConditionsSection component
- [Story 15.2](./stories/story-15.2-migrate-live-conditions.md) - Migrate LiveConditions component
- [Story 15.3](./stories/story-15.3-migrate-lift-status-list.md) - Migrate LiftStatusList component
- [Story 15.4](./stories/story-15.4-migrate-weather-forecast.md) - Migrate WeatherForecastCard component

### Phase 16: Resort Detail Module - Location

- [Story 16.1](./stories/story-16.1-migrate-location-card.md) - Migrate LocationCard component
- [Story 16.2](./stories/story-16.2-migrate-location-map-card.md) - Migrate LocationMapCard component
- [Story 16.3](./stories/story-16.3-migrate-trail-map-card.md) - Migrate TrailMapCard component

### Phase 17: Resort Detail Module - Media

- [Story 17.1](./stories/story-17.1-migrate-photo-gallery.md) - Migrate PhotoGallery component
- [Story 17.2](./stories/story-17.2-migrate-webcam-gallery.md) - Migrate WebcamGallery component

### Phase 18: Resort Detail Module - Dining

- [Story 18.1](./stories/story-18.1-migrate-dining-venue-card.md) - Migrate DiningVenueCard component
- [Story 18.2](./stories/story-18.2-migrate-dining-venues-list.md) - Migrate DiningVenuesList component
- [Story 18.3](./stories/story-18.3-migrate-dining-venues-card.md) - Migrate DiningVenuesCard component
- [Story 18.4](./stories/story-18.4-migrate-dining-venues-accordion.md) - Migrate DiningVenuesAccordion component

### Phase 19: Resort Detail Module - Shops

- [Story 19.1](./stories/story-19.1-migrate-ski-shop-card.md) - Migrate SkiShopCard component
- [Story 19.2](./stories/story-19.2-migrate-ski-shops-list.md) - Migrate SkiShopsList component
- [Story 19.3](./stories/story-19.3-migrate-ski-shops-card.md) - Migrate SkiShopsCard component
- [Story 19.4](./stories/story-19.4-migrate-ski-shops-accordion.md) - Migrate SkiShopsAccordion component

### Phase 20: Resort Detail Module - Related & Services

- [Story 20.1](./stories/story-20.1-migrate-nearby-services-card.md) - Migrate NearbyServicesCard component
- [Story 20.2](./stories/story-20.2-migrate-social-media-card.md) - Migrate SocialMediaCard component
- [Story 20.3](./stories/story-20.3-migrate-related-resorts.md) - Migrate RelatedResorts component
- [Story 20.4](./stories/story-20.4-migrate-related-resorts-section.md) - Migrate RelatedResortsSection component
- [Story 20.5](./stories/story-20.5-migrate-related-resorts-accordion.md) - Migrate RelatedResortsAccordion component

### Phase 21: Resort Detail Module - Completion

- [Story 21.1](./stories/story-21.1-migrate-resort-detail-hooks.md) - Migrate resort-detail-specific hooks
- [Story 21.2](./stories/story-21.2-migrate-resort-detail.md) - Migrate ResortDetail component
- [Story 21.3](./stories/story-21.3-create-resort-detail-page-view.md) - Create ResortDetailPageView and update route

### Phase 22: Services Layer

- [Story 22.1](./stories/story-22.1-migrate-resort-service.md) - Migrate resort-service to `services/`
- [Story 22.2](./stories/story-22.2-migrate-supabase-services.md) - Migrate Supabase services to `services/`
- [Story 22.3](./stories/story-22.3-migrate-themed-resorts-service.md) - Migrate themed-resorts-service to `services/`

### Phase 23: Schema & Analytics

- [Story 23.1](./stories/story-23.1-migrate-schema-components.md) - Migrate schema components to `shared/schema/`
- [Story 23.2](./stories/story-23.2-migrate-analytics.md) - Migrate analytics to `shared/analytics/`
- [Story 23.3](./stories/story-23.3-migrate-system-components.md) - Migrate FeatureFlag, GoogleAnalytics, WebVitals

### Phase 24: Cleanup

- [Story 24.1](./stories/story-24.1-remove-temporary-reexports.md) - Remove temporary re-export files
- [Story 24.2](./stories/story-24.2-delete-empty-directories.md) - Delete empty component directories
- [Story 24.3](./stories/story-24.3-final-verification.md) - Final build verification and testing
- [Story 24.4](./stories/story-24.4-update-documentation.md) - Update documentation

## Testing Strategy

After each story:
1. Run `npm run build` to verify no compilation errors
2. Start dev server and manually test affected pages
3. Check browser console for errors
4. Verify all functionality still works

## Notes

- Stories are intentionally small to allow for incremental testing
- Each story should be completable in 15-30 minutes
- If a story causes issues, it's easy to revert
- Keep old files as re-exports during transition to avoid breaking imports
