'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  variant?: 'overlay' | 'solid';
}

export function Header({ variant = 'overlay' }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isOverlay = variant === 'overlay';

  return (
    <header
      className={cn(
        'z-50',
        isOverlay
          ? 'bg-black/20 backdrop-blur-sm'
          : 'relative bg-white border-b border-gray-200'
      )}
    >
      <nav className="container-custom py-1.5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center"
            >
              <Image
                src="/images/logo.png"
                alt="Ski Directory logo"
                width={215}
                height={54}
                priority
                unoptimized
              />
            </Link>
          </div>

          {/* Menu button */}
          <button
            className={cn('p-2', isOverlay ? 'text-white' : 'text-gray-700')}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="navigation-menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" aria-hidden="true" />
            ) : (
              <Menu className="w-6 h-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Dropdown menu */}
        {mobileMenuOpen && (
          <nav
            id="navigation-menu"
            className="absolute right-4 top-14 w-48 py-2 bg-white rounded-lg shadow-lg border border-gray-200"
            aria-label="Main navigation"
          >
            <Link
              href="/directory"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Directory
            </Link>
            <Link
              href="/ski-links"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Ski Links
            </Link>
            <Link
              href="/social-links"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Social Media
            </Link>
          </nav>
        )}
      </nav>
    </header>
  );
}
