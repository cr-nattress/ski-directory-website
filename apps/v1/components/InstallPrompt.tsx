'use client';

import { useEffect, useState } from 'react';
import { X, Download, Smartphone } from 'lucide-react';

/**
 * BeforeInstallPrompt event interface
 * This event is fired when the browser determines the app can be installed
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'pwa-install-dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Install Prompt Component
 *
 * Shows a prompt to install the PWA after user engagement.
 * - On Chrome/Edge: Uses beforeinstallprompt event
 * - On iOS Safari: Shows manual installation instructions
 */
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Skip if not in browser
    if (typeof window === 'undefined') return;

    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    // Check if recently dismissed
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed && Date.now() - parseInt(dismissed) < DISMISS_DURATION) {
      return;
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window);
    setIsIOS(isIOSDevice);

    // Listen for beforeinstallprompt (Chrome, Edge, etc.)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show after user has engaged (30 seconds)
      setTimeout(() => {
        setShowPrompt(true);
      }, 30000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // For iOS, show manual instructions after longer engagement (60 seconds)
    if (isIOSDevice) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 60000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  // Handle install button click
  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('[PWA] User accepted install');
    } else {
      console.log('[PWA] User dismissed install');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  // Handle dismiss button click
  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setShowPrompt(false);
  };

  // Don't render if prompt shouldn't be shown
  if (!showPrompt) return null;

  // iOS-specific instructions (no programmatic install available)
  if (isIOS) {
    return (
      <div className="fixed bottom-24 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-xl shadow-2xl p-4 z-50 border border-gray-100">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-ski-blue rounded-xl flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 pr-6">
            <h3 className="font-semibold text-gray-900 mb-1">
              Install Ski Directory
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Add to your home screen for quick access!
            </p>
            <div className="text-sm text-gray-500 space-y-1">
              <p className="flex items-center gap-2">
                <span>1. Tap the</span>
                <svg className="w-5 h-5 inline" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 5l-1.42 1.42-1.59-1.59V16h-2V4.83L9.42 6.42 8 5l4-4 4 4z"/>
                  <path d="M20 10v11c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V10c0-1.1.9-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .9 2 2z"/>
                </svg>
                <span>Share button</span>
              </p>
              <p>2. Scroll and tap &quot;Add to Home Screen&quot;</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't show Chrome/Edge prompt if no deferred prompt available
  if (!deferredPrompt) return null;

  // Chrome/Edge install prompt
  return (
    <div className="fixed bottom-24 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-xl shadow-2xl p-4 z-50 border border-gray-100">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-12 h-12 bg-ski-blue rounded-xl flex items-center justify-center">
          <Download className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 pr-6">
          <h3 className="font-semibold text-gray-900 mb-1">
            Install Ski Directory
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Get quick access from your home screen with offline support!
          </p>
          <button
            onClick={handleInstall}
            className="w-full bg-ski-blue text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Install App
          </button>
        </div>
      </div>
    </div>
  );
}
