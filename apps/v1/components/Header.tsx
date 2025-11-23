'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-transparent">
      <nav className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="text-white font-display text-2xl font-bold">
              ⛷️ SkiCO
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <a
              href="#"
              className="text-white hover:text-powder-blue transition-colors text-sm font-medium"
            >
              Login
            </a>
            <a
              href="#"
              className="bg-white text-ski-blue px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
            >
              List Your Property
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white p-2"
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
              <a
                href="#"
                className="bg-ski-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
              >
                List Your Property
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
