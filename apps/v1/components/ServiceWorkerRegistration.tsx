'use client';

import { useEffect, useState } from 'react';

/**
 * Service Worker Registration Component
 *
 * Registers the service worker in production and handles updates.
 * Shows a toast notification when a new version is available.
 */
export function ServiceWorkerRegistration() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Only register in production and in browser
    if (typeof window === 'undefined') {
      return;
    }

    // Skip in development to avoid caching issues with hot reload
    if (process.env.NODE_ENV !== 'production') {
      console.log('[SW] Skipping registration in development');
      return;
    }

    if (!('serviceWorker' in navigator)) {
      console.log('[SW] Service workers not supported');
      return;
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/',
        });

        console.log('[SW] Service worker registered:', registration.scope);

        // Check for updates on registration
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content available, show update notification
              console.log('[SW] New version available');
              setUpdateAvailable(true);
            }
          });
        });

        // Check for updates periodically (every hour)
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);

      } catch (error) {
        console.error('[SW] Registration failed:', error);
      }
    };

    // Register after page load to not block initial render
    if (document.readyState === 'complete') {
      registerSW();
    } else {
      window.addEventListener('load', registerSW);
      return () => window.removeEventListener('load', registerSW);
    }
  }, []);

  // Handle applying the update
  const handleUpdate = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Tell the new service worker to skip waiting
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });

      // Reload the page to use the new version
      window.location.reload();
    }
  };

  // Don't render anything if no update available
  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="fixed bottom-24 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-ski-blue text-white p-4 rounded-lg shadow-lg z-50 animate-slide-up">
      <p className="text-sm font-medium mb-2">
        A new version is available!
      </p>
      <button
        onClick={handleUpdate}
        className="w-full bg-white text-ski-blue font-medium py-2 px-4 rounded hover:bg-gray-100 transition-colors"
      >
        Update Now
      </button>
    </div>
  );
}
