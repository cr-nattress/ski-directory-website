# Story 44.3: Service Worker Registration

## Description

Create a client-side component to register the service worker and handle updates gracefully.

## Acceptance Criteria

- [ ] Service worker registered on app load (browser only)
- [ ] Registration only happens in production
- [ ] Update detection and user notification
- [ ] Proper error handling for registration failures
- [ ] No hydration mismatches

## Technical Details

### Component: `components/ServiceWorkerRegistration.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';

export function ServiceWorkerRegistration() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Only register in production and in browser
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'production') {
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

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content available
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

    // Register after load to not block initial render
    if (document.readyState === 'complete') {
      registerSW();
    } else {
      window.addEventListener('load', registerSW);
      return () => window.removeEventListener('load', registerSW);
    }
  }, []);

  // Handle page refresh for update
  const handleUpdate = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-24 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-ski-blue text-white p-4 rounded-lg shadow-lg z-50">
      <p className="text-sm font-medium mb-2">A new version is available!</p>
      <button
        onClick={handleUpdate}
        className="w-full bg-white text-ski-blue font-medium py-2 px-4 rounded hover:bg-gray-100 transition-colors"
      >
        Update Now
      </button>
    </div>
  );
}
```

### Integration in Layout: `app/layout.tsx`

```tsx
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* ... existing content ... */}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
```

### Development Mode Behavior

In development:
- Service worker is NOT registered
- Console logs indicate SW is skipped
- No caching interference with hot reload

### Debugging Helpers

Add a utility for development:

```tsx
// lib/pwa-utils.ts
export function unregisterServiceWorkers() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister();
        console.log('[SW] Unregistered:', registration.scope);
      });
    });
  }
}

export function clearAllCaches() {
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((name) => {
        caches.delete(name);
        console.log('[SW] Cache deleted:', name);
      });
    });
  }
}
```

## Tasks

1. [ ] Create `components/ServiceWorkerRegistration.tsx`
2. [ ] Add component to `app/layout.tsx`
3. [ ] Create `lib/pwa-utils.ts` for debugging
4. [ ] Test registration in production build
5. [ ] Test update notification flow
6. [ ] Verify no hydration errors

## Testing Commands

```bash
# Build and run production locally
npm run build && npm start

# In Chrome DevTools:
# Application > Service Workers > Check status
# Application > Cache Storage > View cached items
```

## Effort

2 story points (Small)

## Notes

- Use `'use client'` directive - this must be a client component
- Register after `load` event to not block initial render
- Update check interval can be adjusted based on deploy frequency
- The update toast appears above mobile nav (bottom-24)
