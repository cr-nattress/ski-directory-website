'use client';

import { useState } from 'react';
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
      <nav className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <a
              href="/"
              className={cn(
                'font-display text-2xl font-bold flex items-center gap-2',
                isOverlay ? 'text-white' : 'text-ski-blue'
              )}
            >
              <span>⛷️</span>
              <span>Ski Directory</span>
            </a>
          </div>

          {/* Menu button */}
          <button
            className={cn('p-2', isOverlay ? 'text-white' : 'text-gray-700')}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Dropdown menu */}
        {mobileMenuOpen && (
          <div className="absolute right-4 top-14 w-48 py-2 bg-white rounded-lg shadow-lg border border-gray-200">
            <a
              href="/directory"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors font-medium"
            >
              Directory
            </a>
            <a
              href="/weather"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors font-medium"
            >
              Weather
            </a>
            <a
              href="/articles"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors font-medium"
            >
              Articles
            </a>
            <a
              href="/ski-links"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors font-medium"
            >
              Ski Links
            </a>
            <a
              href="/social-links"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors font-medium"
            >
              Social Media
            </a>
            <a
              href="/shops"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors font-medium"
            >
              Shops
            </a>
            <div className="border-t border-gray-200 my-1"></div>
            <a
              href="#"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors font-medium"
            >
              Login
            </a>
          </div>
        )}
      </nav>
    </header>
  );
}
