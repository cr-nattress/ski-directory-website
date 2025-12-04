# Story 32.10: Improve Mobile Footer Layout

## Priority: Low

## Context

The footer (`components/Footer.tsx`) uses a 1-column layout on mobile which works but isn't optimized for the smaller viewport. Link sections could use a 2-column grid, touch targets need improvement, and less-important links could be collapsed.

## Current State

**Location:** `apps/v1/components/Footer.tsx`

**Current Behavior:**
- 1 column on mobile, 4 columns on md+
- All links visible on all viewports
- Social icons are 20px (below 44px minimum)
- Standard spacing throughout

## Requirements

1. Use 2-column grid for link sections on mobile
2. Increase social icon touch targets to 44px
3. Add more vertical spacing between sections
4. Consider collapsing less-important links with "View All" pattern
5. Ensure brand section remains full-width
6. Keep copyright and social row properly aligned

## Implementation

### 1. Updated Footer Structure

```tsx
// components/Footer.tsx
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-bg-dark text-white py-12">
      <div className="container-custom">
        {/* Brand Section - Always full width */}
        <div className="mb-8">
          <Link
            href="/"
            className="font-display text-2xl font-bold mb-4 block hover:text-gray-200 transition-colors"
          >
            ⛷️ Ski Directory
          </Link>
          <p className="text-gray-400 text-sm max-w-xs">
            Your complete guide to ski resorts across North America.
          </p>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-8">
          {/* Resorts Column */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide">
              Resorts
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/directory"
                  className="text-gray-400 hover:text-white transition-colors inline-block py-1"
                >
                  A-Z Directory
                </Link>
              </li>
              <li>
                <Link
                  href="/directory?state=colorado"
                  className="text-gray-400 hover:text-white transition-colors inline-block py-1"
                >
                  Colorado
                </Link>
              </li>
              <li>
                <Link
                  href="/directory?state=utah"
                  className="text-gray-400 hover:text-white transition-colors inline-block py-1"
                >
                  Utah
                </Link>
              </li>
              {/* Show more states on desktop */}
              <li className="hidden md:block">
                <Link
                  href="/directory?state=california"
                  className="text-gray-400 hover:text-white transition-colors inline-block py-1"
                >
                  California
                </Link>
              </li>
            </ul>
          </div>

          {/* Passes Column */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide">
              By Pass
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/directory?pass=epic"
                  className="text-gray-400 hover:text-white transition-colors inline-block py-1"
                >
                  Epic Pass
                </Link>
              </li>
              <li>
                <Link
                  href="/directory?pass=ikon"
                  className="text-gray-400 hover:text-white transition-colors inline-block py-1"
                >
                  Ikon Pass
                </Link>
              </li>
              <li>
                <Link
                  href="/directory?pass=indy"
                  className="text-gray-400 hover:text-white transition-colors inline-block py-1"
                >
                  Indy Pass
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Column - Hidden on mobile */}
          <div className="hidden md:block">
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide">
              Resources
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/ski-links"
                  className="text-gray-400 hover:text-white transition-colors inline-block py-1"
                >
                  Ski Links
                </Link>
              </li>
              <li>
                <Link
                  href="/social-links"
                  className="text-gray-400 hover:text-white transition-colors inline-block py-1"
                >
                  Social Media
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Mobile: Resources as horizontal list */}
        <div className="md:hidden flex flex-wrap gap-4 mb-8 text-sm">
          <Link
            href="/ski-links"
            className="text-gray-400 hover:text-white transition-colors py-1"
          >
            Ski Links
          </Link>
          <span className="text-gray-600">·</span>
          <Link
            href="/social-links"
            className="text-gray-400 hover:text-white transition-colors py-1"
          >
            Social Media
          </Link>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-gray-400 text-sm">
              © 2025 Ski Directory. All rights reserved.
            </p>

            {/* Social Icons - With proper touch targets */}
            <div className="flex items-center gap-2">
              <SocialLink
                href="https://instagram.com/skidirectory"
                label="Instagram"
                icon={<InstagramIcon />}
              />
              <SocialLink
                href="https://twitter.com/skidirectory"
                label="Twitter"
                icon={<TwitterIcon />}
              />
              <SocialLink
                href="https://facebook.com/skidirectory"
                label="Facebook"
                icon={<FacebookIcon />}
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Social link component with proper touch target
function SocialLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800"
      aria-label={label}
    >
      {icon}
    </a>
  );
}

// Icon components remain same size visually
function InstagramIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      {/* ... existing path ... */}
    </svg>
  );
}
```

## Design Specifications

### Mobile Layout
- **Brand section:** Full width, mb-8
- **Links grid:** 2 columns, gap-8
- **Column headers:** text-sm, uppercase, tracking-wide
- **Link spacing:** space-y-3 with py-1 on links
- **Resources:** Horizontal inline list on mobile

### Social Icons
- **Touch target:** 44x44px minimum
- **Icon size:** 20px (w-5 h-5) - unchanged
- **Hover state:** bg-gray-800 rounded-full
- **Gap between icons:** gap-2 (8px)

### Spacing
- **Section margin:** mb-8 between major sections
- **Border top:** border-t border-gray-800
- **Padding top:** pt-8 for bottom section

## Acceptance Criteria

- [ ] Link sections use 2-column grid on mobile
- [ ] Social icons meet 44px touch target minimum
- [ ] Resources section simplified on mobile
- [ ] Brand section remains full-width
- [ ] Visual hierarchy improved with section headers
- [ ] Adequate spacing between all elements
- [ ] Desktop layout unchanged or improved
- [ ] All links still accessible on mobile

## Testing

1. View on mobile (< 768px) - verify 2-column grid
2. Tap social icons - verify easy to tap
3. View on tablet - verify transition to 3-column
4. View on desktop - verify full 3-column layout
5. Test all links navigate correctly
6. Verify adequate spacing for readability

## Effort: Small (< 2 hours)
