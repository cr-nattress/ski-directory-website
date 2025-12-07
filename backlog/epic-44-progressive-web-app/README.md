# Epic 44: Progressive Web App (PWA) Implementation

## Overview

Transform the Ski Directory into a Progressive Web App with installable behavior, offline capabilities, and app-like experience.

## Business Value

- **Installable:** Users can add the app to their home screen for quick access
- **Offline Access:** Core app shell and cached resort data available without network
- **App-Like Experience:** Full-screen standalone mode, splash screens, native feel
- **Improved Performance:** Service worker caching reduces network requests

## Technical Context

### Current State (Phase 1 Analysis)

| Aspect | Status |
|--------|--------|
| Framework | Next.js 14 App Router |
| Static Assets | `apps/v1/public/` |
| PWA Files | None (no manifest, service worker) |
| Netlify Config | None |
| Icons | Only logo.png exists |

### Target State

- Web App Manifest with proper icons
- Service worker with smart caching strategies
- Netlify headers for proper SW/manifest caching
- Offline fallback page
- Lighthouse PWA audit passing

### Theme Colors (from Tailwind config)

- Primary: `#1E40AF` (ski-blue)
- Background: `#F9FAFB` (bg-light)
- Accent: `#60A5FA` (powder-blue)

## User Stories

| Story | Title | Points | Priority |
|-------|-------|--------|----------|
| 44.1 | Web App Manifest & Icons | 3 | P0 |
| 44.2 | Service Worker Implementation | 5 | P0 |
| 44.3 | Service Worker Registration | 2 | P0 |
| 44.4 | Netlify Cache Headers | 2 | P0 |
| 44.5 | Offline Fallback Page | 2 | P1 |
| 44.6 | Install Prompt UX | 3 | P1 |
| 44.7 | Lighthouse PWA Audit & Fixes | 2 | P1 |

## Implementation Phases

### Phase 1: Core PWA (Stories 44.1-44.4)
Minimum viable PWA that passes basic installability criteria.

### Phase 2: Enhanced Experience (Stories 44.5-44.7)
Offline fallback, install prompts, and polish.

### Phase 3: Future Enhancements (Not in scope)
- Push notifications for snow alerts
- Background sync for favorites
- Periodic data updates

## Dependencies

- None (greenfield PWA implementation)

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| iOS Safari limitations | Test on iOS, document known limitations |
| Service worker caching stale content | Implement proper cache versioning and update flow |
| Bundle size increase | Keep SW minimal, lazy-load where possible |

## Definition of Done

- [ ] Lighthouse PWA audit score > 90
- [ ] App installable on Chrome, Edge, Safari
- [ ] Core pages work offline (app shell)
- [ ] Service worker updates properly on new deploys
- [ ] No regressions in existing functionality

## Files to Create/Modify

### New Files
- `public/manifest.webmanifest`
- `public/service-worker.js`
- `public/icons/` (multiple sizes)
- `public/offline.html`
- `public/_headers` (Netlify)
- `components/ServiceWorkerRegistration.tsx`
- `components/InstallPrompt.tsx`

### Modified Files
- `app/layout.tsx` (add manifest link, SW registration)
- `next.config.js` (possibly add SW headers)
