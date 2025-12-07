# Story 44.2: Service Worker Implementation

## Description

Create a service worker that handles caching for the app shell, static assets, and provides offline capabilities with appropriate caching strategies.

## Acceptance Criteria

- [ ] `public/service-worker.js` created
- [ ] App shell (HTML, CSS, JS) cached on install
- [ ] Static assets use cache-first strategy
- [ ] Navigation requests use network-first with cache fallback
- [ ] Old caches cleaned up on service worker activation
- [ ] Cache version properly incremented for updates

## Technical Details

### Service Worker: `public/service-worker.js`

```javascript
const CACHE_VERSION = 'ski-directory-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

// Core app shell files to pre-cache
const APP_SHELL = [
  '/',
  '/directory',
  '/ski-links',
  '/social-links',
  '/offline.html',
  '/manifest.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Install event - pre-cache app shell
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Pre-caching app shell');
        return cache.addAll(APP_SHELL);
      })
      .then(() => {
        console.log('[SW] Pre-caching complete');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('ski-directory-') && name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests (except CDN assets)
  if (url.origin !== self.location.origin) {
    // Allow caching of specific CDN resources
    if (!url.hostname.includes('storage.googleapis.com') &&
        !url.hostname.includes('tile.openstreetmap.org')) {
      return;
    }
  }

  // Skip API requests (Supabase)
  if (url.pathname.includes('/rest/v1/') || url.hostname.includes('supabase')) {
    return;
  }

  // Navigation requests - Network first, cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful navigation responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Try cache, fall back to offline page
          return caches.match(request)
            .then((cached) => cached || caches.match('/offline.html'));
        })
    );
    return;
  }

  // Static assets - Cache first, network fallback
  if (isStaticAsset(url.pathname)) {
    event.respondWith(
      caches.match(request)
        .then((cached) => {
          if (cached) {
            return cached;
          }
          return fetch(request).then((response) => {
            if (response.ok) {
              const responseClone = response.clone();
              caches.open(STATIC_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          });
        })
    );
    return;
  }

  // Default - Network first for dynamic content
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// Helper: Check if URL is a static asset
function isStaticAsset(pathname) {
  const staticExtensions = [
    '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg',
    '.woff', '.woff2', '.ttf', '.eot', '.ico', '.webp', '.avif'
  ];
  return staticExtensions.some((ext) => pathname.endsWith(ext));
}

// Handle messages from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
```

### Caching Strategies

| Resource Type | Strategy | Rationale |
|---------------|----------|-----------|
| Navigation (HTML) | Network-first | Always get fresh content, cache as backup |
| Static assets (JS, CSS, images) | Cache-first | Rarely change, fast load from cache |
| API requests (Supabase) | Skip | Let TanStack Query handle data caching |
| Map tiles | Cache-first | Large files, rarely change |

### Cache Size Management

Consider adding cache cleanup for dynamic cache:

```javascript
const MAX_DYNAMIC_ITEMS = 50;

async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    await trimCache(cacheName, maxItems);
  }
}
```

## Tasks

1. [ ] Create `public/service-worker.js` with install handler
2. [ ] Implement cache-first strategy for static assets
3. [ ] Implement network-first strategy for navigation
4. [ ] Add cache cleanup on activate
5. [ ] Add message handler for skip waiting
6. [ ] Test offline behavior with Chrome DevTools
7. [ ] Verify cache is populated correctly

## Effort

5 story points (Medium)

## Notes

- Next.js uses hashed filenames for static assets, so cache-first is safe
- Don't cache Supabase API responses (let TanStack Query handle that)
- Service worker scope is `/` by default when placed in public root
- Consider using Workbox for more advanced caching in future
