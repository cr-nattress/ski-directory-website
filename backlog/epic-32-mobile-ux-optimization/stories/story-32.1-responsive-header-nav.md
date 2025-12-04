# Story 32.1: Implement Responsive Header with Desktop Navigation

## Priority: High

## Context

The current header (`components/Header.tsx`) always displays a hamburger menu regardless of screen size. Desktop users should see inline horizontal navigation links, while mobile users retain the hamburger menu pattern.

## Current State

**Location:** `apps/v1/components/Header.tsx:42-55`

**Current Behavior:**
- Hamburger menu button visible on all screen sizes
- No horizontal navigation for desktop viewports
- Dropdown menu appears on toggle for all users

## Requirements

1. Show horizontal nav links on `md:` breakpoint and above
2. Show hamburger menu only on `< md:` screens
3. Maintain existing dropdown functionality for mobile
4. Preserve overlay/solid variant styling for both patterns
5. Ensure smooth transition at breakpoint boundary

## Implementation

### Updated Header Structure

```tsx
export function Header({ variant = 'overlay' }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isOverlay = variant === 'overlay';

  const navLinkClasses = cn(
    'font-medium transition-colors',
    isOverlay
      ? 'text-white/90 hover:text-white'
      : 'text-gray-700 hover:text-gray-900'
  );

  return (
    <header className={cn('z-50', isOverlay ? '...' : '...')}>
      <nav className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className={cn('font-display text-2xl font-bold...', ...)}>
              <span>⛷️</span>
              <span>Ski Directory</span>
            </Link>
          </div>

          {/* Desktop Navigation - hidden on mobile */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/directory" className={navLinkClasses}>
              Directory
            </Link>
            <Link href="/ski-links" className={navLinkClasses}>
              Ski Links
            </Link>
            <Link href="/social-links" className={navLinkClasses}>
              Social Media
            </Link>
          </div>

          {/* Mobile Menu Button - hidden on desktop */}
          <button
            className={cn('md:hidden p-2', isOverlay ? 'text-white' : 'text-gray-700')}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="navigation-menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown - only rendered when open */}
        {mobileMenuOpen && (
          <nav id="navigation-menu" className="md:hidden absolute ...">
            {/* existing dropdown content */}
          </nav>
        )}
      </nav>
    </header>
  );
}
```

### Key Changes

1. Add `hidden md:flex` to desktop nav container
2. Add `md:hidden` to mobile menu button
3. Add `md:hidden` to dropdown menu container
4. Create shared `navLinkClasses` for consistent styling
5. Apply appropriate colors based on variant

## Acceptance Criteria

- [ ] Desktop (≥768px): Horizontal nav links visible, hamburger hidden
- [ ] Mobile (<768px): Hamburger visible, horizontal nav hidden
- [ ] Dropdown menu only appears on mobile when hamburger clicked
- [ ] Both overlay and solid variants work correctly
- [ ] Smooth visual transition when resizing browser
- [ ] Accessibility: Focus states visible on all nav links
- [ ] No layout shift at breakpoint boundary

## Testing

1. Resize browser across 768px breakpoint
2. Test both overlay (home page) and solid (inner pages) variants
3. Verify dropdown only works on mobile viewport
4. Test keyboard navigation through desktop links
5. Verify screen reader announces navigation correctly

## Effort: Small (< 2 hours)
