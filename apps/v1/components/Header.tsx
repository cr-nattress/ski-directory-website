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
          ? 'absolute top-0 left-0 right-0 bg-transparent'
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
              <span>SkiCO</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <a
              href="#"
              className={cn(
                'transition-colors text-sm font-medium',
                isOverlay
                  ? 'text-white hover:text-powder-blue'
                  : 'text-gray-700 hover:text-ski-blue'
              )}
            >
              Login
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className={cn('md:hidden p-2', isOverlay ? 'text-white' : 'text-gray-700')}
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

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 bg-white rounded-lg shadow-lg">
            <div className="flex flex-col space-y-4 px-4">
              <a
                href="#"
                className="text-ski-blue hover:text-powder-blue transition-colors font-medium"
              >
                Login
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
