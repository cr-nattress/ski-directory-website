# Story 32.2: Add Sticky Mobile Bottom Navigation Bar

## Priority: High

## Context

Mobile users currently must scroll to the header or footer for navigation. A fixed bottom navigation bar provides thumb-friendly access to key actions, following the pattern used by most modern mobile apps.

## Current State

- No bottom navigation exists
- Header is the only navigation access point
- Users must scroll to top for navigation on long pages

## Requirements

1. Create a fixed bottom navigation bar for mobile viewports
2. Include 4-5 key navigation items with icons and labels
3. Hide on tablet/desktop viewports (`md:` and above)
4. Handle iOS safe area insets for notched devices
5. Highlight active route
6. Include subtle top border/shadow for visual separation

## Implementation

### New Component: `MobileBottomNav.tsx`

```tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, List, Map, Search, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  matchPaths?: string[]; // Additional paths to highlight this item
}

const navItems: NavItem[] = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/directory', label: 'Directory', icon: List, matchPaths: ['/directory'] },
  { href: '/?view=map', label: 'Map', icon: Map },
  { href: '/search', label: 'Search', icon: Search },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  const isActive = (item: NavItem) => {
    if (pathname === item.href) return true;
    if (item.matchPaths?.some(p => pathname.startsWith(p))) return true;
    return false;
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center min-w-[64px] min-h-[44px] px-3 py-2 transition-colors',
                active
                  ? 'text-ski-blue'
                  : 'text-gray-500 hover:text-gray-700'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className={cn('w-5 h-5 mb-1', active && 'stroke-[2.5]')} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

### Integration in Root Layout

```tsx
// app/layout.tsx
import { MobileBottomNav } from '@/components/MobileBottomNav';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <MobileBottomNav />
      </body>
    </html>
  );
}
```

### Add Bottom Padding to Main Content

```tsx
// Prevent content from being hidden behind bottom nav
<main className="pb-20 md:pb-0">
  {children}
</main>
```

### Optional: Hide on Scroll Down

```tsx
// Advanced: Hide nav when scrolling down, show when scrolling up
const [isVisible, setIsVisible] = useState(true);
const [lastScrollY, setLastScrollY] = useState(0);

useEffect(() => {
  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    setIsVisible(currentScrollY < lastScrollY || currentScrollY < 100);
    setLastScrollY(currentScrollY);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  return () => window.removeEventListener('scroll', handleScroll);
}, [lastScrollY]);
```

## Design Specifications

- **Height:** 64px (plus safe area)
- **Background:** White with subtle shadow
- **Active state:** `ski-blue` color with bolder icon
- **Inactive state:** Gray-500 with hover to gray-700
- **Icon size:** 20px (w-5 h-5)
- **Label size:** 12px (text-xs)
- **Touch target:** Minimum 44px height, 64px width

## Acceptance Criteria

- [ ] Bottom nav visible on mobile viewports (<768px)
- [ ] Hidden on tablet/desktop viewports (≥768px)
- [ ] Shows 4-5 navigation items with icons and labels
- [ ] Active route is highlighted
- [ ] Respects iOS safe area insets
- [ ] Touch targets meet 44px minimum
- [ ] Main content has padding to avoid overlap
- [ ] Accessible: proper ARIA labels and landmarks

## Testing

1. View on mobile viewport - nav should appear
2. View on desktop - nav should be hidden
3. Tap each nav item - verify navigation works
4. Check active state updates on route change
5. Test on iPhone simulator - verify safe area padding
6. Test with VoiceOver - verify all items announced

## Effort: Medium (2-4 hours)
