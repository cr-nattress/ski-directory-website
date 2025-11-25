# Epic 6: Global Event Banner System

## Overview
Implement a global event banner system that displays contextual alerts (snow reports, weather warnings, safety notices, system alerts) across all routes, positioned directly below the header. The banner supports multiple alert types with color-coded styling, slide animations, and dismissible behavior with localStorage persistence.

## Reference Documentation
See detailed implementation blueprint: `apps/v1/docs/GLOBAL-EVENT-BANNER-IMPLEMENTATION-PLAN.md`

## User Stories

### Story 6.1: Define Alert Type System and TypeScript Interfaces
**As a** developer
**I want** well-defined TypeScript interfaces for the alert system
**So that** the codebase has type-safe alert handling throughout

**Acceptance Criteria:**
- [ ] Add AlertType union type: 'info' | 'snow-report' | 'weather' | 'safety' | 'system'
- [ ] Add AlertPriority union type: 'low' | 'medium' | 'high' | 'critical'
- [ ] Add AlertSource union type: 'manual' | 'weather-api' | 'snow-api' | 'nws-api' | 'system'
- [ ] Create EventAlert interface with all required fields
- [ ] Create UseEventBannerResult interface for hook return type
- [ ] Create AlertApiResponse interface for API responses

**Technical Notes:**
```typescript
interface EventAlert {
  id: string;
  type: AlertType;
  priority: AlertPriority;
  source: AlertSource;
  title: string;
  message: string;
  linkText?: string;
  linkUrl?: string;
  resortSlug?: string;  // null = global, specific = resort-only
  startsAt: string;
  expiresAt: string;
  isDismissible: boolean;
  isPersistent: boolean;
  createdAt: string;
  updatedAt: string;
}
```

**Files to Modify:**
- `lib/api/types.ts` - Add all alert type definitions

---

### Story 6.2: Create Alert Service with Mock Data
**As a** developer
**I want** an alert service that provides mock alert data
**So that** the banner can be developed and tested before real API integration

**Acceptance Criteria:**
- [ ] Create alert-service.ts in lib/api/
- [ ] Implement getActiveAlerts() method with simulated network delay
- [ ] Include mock alerts for each type (snow-report, weather, safety, info, system)
- [ ] Filter alerts by expiration date (startsAt, expiresAt)
- [ ] Support optional resortSlug filtering for resort-specific alerts
- [ ] Sort alerts by priority (critical first)

**Mock Data Examples:**
- Snow-report: "Fresh Powder Alert - 12-18" expected tonight" (high priority)
- Weather: "Winter Storm Watch" (medium priority)
- Safety: "Avalanche Warning - backcountry zones" (critical, non-dismissible)

**Files to Create:**
- `lib/api/alert-service.ts`

---

### Story 6.3: Implement localStorage Utilities for Dismissals
**As a** user
**I want** my dismissed alerts to stay dismissed when I refresh the page
**So that** I don't see the same alerts repeatedly

**Acceptance Criteria:**
- [ ] Create getDismissedAlertIds() function
- [ ] Create addDismissedAlertId() function
- [ ] Create clearDismissedAlerts() function (for testing)
- [ ] Use localStorage key: 'skicolorado_dismissed_alerts'
- [ ] Auto-cleanup dismissals older than 7 days
- [ ] Handle SSR safely (check for window)
- [ ] Gracefully handle disabled localStorage

**Technical Notes:**
```typescript
interface DismissedAlert {
  id: string;
  dismissedAt: string;  // ISO date string
}
```

**Files to Modify:**
- `lib/utils.ts` - Add localStorage helper functions

---

### Story 6.4: Create useEventBanner Hook
**As a** developer
**I want** a reusable hook for fetching and managing alerts
**So that** any component can access alert state consistently

**Acceptance Criteria:**
- [ ] Create useEventBanner.ts hook following existing hook patterns
- [ ] Fetch alerts on mount
- [ ] Poll for new alerts every 5 minutes (configurable)
- [ ] Filter out dismissed alerts (except isPersistent ones)
- [ ] Return highest priority alert as activeAlert
- [ ] Expose dismissAlert() function
- [ ] Expose refetch() function
- [ ] Support resortSlug option for resort-specific alerts
- [ ] Handle loading and error states

**Hook Signature:**
```typescript
function useEventBanner(options?: {
  resortSlug?: string;
  pollInterval?: number;
}): UseEventBannerResult
```

**Files to Create:**
- `lib/hooks/useEventBanner.ts`

**Files to Modify:**
- `lib/hooks/index.ts` - Export new hook

---

### Story 6.5: Build EventBanner Component
**As a** user
**I want** to see alert banners with clear visual styling based on alert type
**So that** I can quickly understand the importance and category of each alert

**Acceptance Criteria:**
- [ ] Create EventBanner.tsx component
- [ ] Color-code by alert type:
  - info: blue-50 background
  - snow-report: sky-50 background
  - weather: amber-50 background
  - safety: red-50 background
  - system: gray-100 background
- [ ] Display appropriate icon per type (Snowflake, Cloud, AlertTriangle, Info, Bell)
- [ ] Show title and message
- [ ] Show optional link with proper styling
- [ ] Show dismiss button for isDismissible alerts
- [ ] Implement slide-down/up animations (300ms)
- [ ] Use container-custom for consistent width
- [ ] Proper aria attributes (role="alert", aria-live="polite")
- [ ] Mobile responsive (text truncates appropriately)

**Files to Create:**
- `components/EventBanner.tsx`

---

### Story 6.6: Build PageWrapper Component
**As a** developer
**I want** a wrapper component that includes Header + EventBanner
**So that** all pages can easily add the banner without code duplication

**Acceptance Criteria:**
- [ ] Create PageWrapper.tsx component
- [ ] Include Header with configurable variant prop
- [ ] Include EventBanner with active alert from useEventBanner
- [ ] Support optional resortSlug prop for resort-specific alerts
- [ ] Support optional children prop for additional content

**Component Signature:**
```tsx
interface PageWrapperProps {
  headerVariant?: 'overlay' | 'solid';
  resortSlug?: string;
  children?: React.ReactNode;
}
```

**Files to Create:**
- `components/PageWrapper.tsx`

---

### Story 6.7: Add Animation Utilities to Tailwind
**As a** developer
**I want** reusable slide animations defined in Tailwind
**So that** the banner animations are consistent and performant

**Acceptance Criteria:**
- [ ] Add slideDown keyframe animation
- [ ] Add slideUp keyframe animation
- [ ] Add animate-slide-down utility class
- [ ] Add animate-slide-up utility class
- [ ] Animations should be 300ms ease-out

**Files to Modify:**
- `app/globals.css` - Add @keyframes definitions
- `tailwind.config.ts` - Add animation and keyframes to theme.extend

---

### Story 6.8: Integrate Banner on Dashboard Page
**As a** user visiting the homepage
**I want** to see relevant alerts displayed below the header
**So that** I'm informed about conditions before browsing resorts

**Acceptance Criteria:**
- [ ] Replace Header import with PageWrapper in app/page.tsx
- [ ] Banner appears below header when alerts are active
- [ ] Banner can be dismissed
- [ ] Dismissed state persists on refresh
- [ ] Page layout is not affected when no alerts are present

**Files to Modify:**
- `app/page.tsx` - Replace Header with PageWrapper

---

### Story 6.9: Integrate Banner on Resort Detail Pages
**As a** user viewing a resort detail page
**I want** to see both global alerts and resort-specific alerts
**So that** I get relevant information for my selected resort

**Acceptance Criteria:**
- [ ] Replace Header import with PageWrapper in ResortDetail.tsx
- [ ] Pass resortSlug prop to PageWrapper
- [ ] Global alerts show on all resort pages
- [ ] Resort-specific alerts only show on matching resort pages
- [ ] Banner integrates cleanly with existing layout

**Files to Modify:**
- `components/resort-detail/ResortDetail.tsx` - Replace Header with PageWrapper

---

### Story 6.10: Test and Verify All Alert Types
**As a** QA tester
**I want** to verify all alert types display correctly
**So that** users have a consistent experience across alert types

**Acceptance Criteria:**
- [ ] Verify info alert (blue styling, Info icon)
- [ ] Verify snow-report alert (sky styling, Snowflake icon)
- [ ] Verify weather alert (amber styling, Cloud icon)
- [ ] Verify safety alert (red styling, AlertTriangle icon)
- [ ] Verify system alert (gray styling, Bell icon)
- [ ] Verify critical priority alerts show first
- [ ] Verify non-dismissible alerts have no X button
- [ ] Verify isPersistent alerts reappear after dismiss
- [ ] Verify expired alerts don't show
- [ ] Verify no layout shift when banner appears/disappears

**Testing Notes:**
- Modify mock data in alert-service.ts to test different scenarios
- Use clearDismissedAlerts() utility to reset dismiss state
- Test on mobile viewport sizes

---

## Dependencies

**Internal Dependencies:**
- Existing Header component
- Existing Tailwind configuration
- Existing hooks pattern (lib/hooks/)
- Existing API types pattern (lib/api/types.ts)
- cn() utility from lib/utils.ts

**External Dependencies:**
- lucide-react icons (already installed)

## Technical Architecture Notes

**Design Decision: PageWrapper vs layout.tsx**

The PageWrapper approach was chosen over modifying layout.tsx because:
1. layout.tsx is a Server Component - converting to Client Component breaks Next.js optimization
2. PageWrapper provides clean separation of concerns
3. Easy to extend with additional layout elements in the future
4. No changes required to Next.js app structure

**Priority Sorting Logic:**
When multiple alerts are active, the highest priority one is displayed:
- critical: 4 (highest)
- high: 3
- medium: 2
- low: 1 (lowest)

**localStorage Key Structure:**
```json
{
  "skicolorado_dismissed_alerts": [
    { "id": "alert-snow-001", "dismissedAt": "2024-11-24T10:30:00Z" },
    { "id": "alert-weather-001", "dismissedAt": "2024-11-23T15:00:00Z" }
  ]
}
```

## Future Enhancements (Out of Scope)

1. Real API Integration (weather, snow, NWS)
2. Admin dashboard for creating alerts
3. Alert stacking/carousel for multiple alerts
4. User notification preferences
5. Push notifications
