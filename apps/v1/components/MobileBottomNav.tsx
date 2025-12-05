'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, List, Users, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  matchPaths?: string[];
}

const navItems: NavItem[] = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/directory', label: 'Resorts', icon: List, matchPaths: ['/directory'] },
  { href: '/social-links', label: 'Social', icon: Users, matchPaths: ['/social-links'] },
  { href: '/ski-links', label: 'Links', icon: Link2 },
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
              <Icon className={cn('w-5 h-5 mb-1', active && 'stroke-[2.5]')} aria-hidden="true" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
