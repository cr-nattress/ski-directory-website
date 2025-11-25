# Epic 5: Social Media Links Card

## Overview
Create a social media card component that displays links to the resort's social media profiles across various platforms.

## User Stories

### Story 5.1: Design Social Media Card Component
**As a** user viewing a resort detail page
**I want** to see links to the resort's social media profiles
**So that** I can follow them and stay updated on conditions and events

**Acceptance Criteria:**
- [ ] Card matches existing design system
- [ ] Social media icons are clearly visible
- [ ] Card has appropriate title (e.g., "Follow Us", "Connect")
- [ ] Responsive layout on all devices

**Design Requirements:**
- Display icons for: YouTube, Facebook, Instagram, TikTok, X (Twitter)
- Icons should be branded colors or monochrome with hover effects
- Clean grid or row layout
- Links open in new tabs

---

### Story 5.2: Add Social Media Data to Resort Model
**As a** developer
**I want** to extend the resort data model to include social media links
**So that** each resort can have its social profiles displayed

**Acceptance Criteria:**
- [ ] Add socialMedia object to Resort type
- [ ] Include fields for all platforms: youtube, facebook, instagram, tiktok, x (twitter)
- [ ] All fields are optional (some resorts may not use all platforms)
- [ ] Update TypeScript types

**Technical Notes:**
```typescript
socialMedia?: {
  youtube?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  x?: string;
}
```

---

### Story 5.3: Update Mock Data with Social Links
**As a** content manager
**I want** resort social media links added to mock data
**So that** the feature can be tested and demonstrated

**Acceptance Criteria:**
- [ ] Add social media links for major resorts (Vail, Breckenridge, etc.)
- [ ] Links are valid URLs
- [ ] Mix of resorts with different platform combinations
- [ ] At least 5 resorts have complete social data

**Research Notes:**
- Look up official social media accounts for each resort
- Verify account handles/URLs are correct
- Some resorts may not have all platforms

---

### Story 5.4: Implement Social Media Icon Links
**As a** user
**I want** to click on social media icons
**So that** I can visit the resort's social profiles

**Acceptance Criteria:**
- [ ] All available social links are displayed
- [ ] Icons use proper branding/styling
- [ ] Links open in new tab (target="_blank")
- [ ] Icons have hover effects
- [ ] Only show icons for platforms the resort uses
- [ ] Accessibility: proper aria labels

**Technical Notes:**
- Use lucide-react icons or react-icons
- Icons: Youtube, Facebook, Instagram, Music (TikTok), Twitter/X
- Add rel="noopener noreferrer" for security
- Consider using official brand colors

---

### Story 5.5: Add Conditional Rendering and Empty State
**As a** developer
**I want** to handle resorts without social media gracefully
**So that** the page doesn't show empty cards

**Acceptance Criteria:**
- [ ] Card only appears if resort has at least one social link
- [ ] Individual icons only show if URL exists
- [ ] No broken links or undefined URLs
- [ ] Clean layout regardless of number of platforms

**Technical Notes:**
- Filter out null/undefined social links
- Hide entire card if no social media present
- Use optional chaining for safety
