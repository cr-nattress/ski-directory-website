/**
 * Ski Directory Service Worker
 *
 * Provides offline support and caching for the PWA.
 * Caching strategies:
 * - App shell: Pre-cached on install
 * - Static assets: Cache-first
 * - Navigation: Network-first with cache fallback
 * - API requests: Skipped (handled by TanStack Query)
 */

const CACHE_VERSION = 'ski-directory-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

// Core app shell files to pre-cache
const APP_SHELL = [
  '/',
  '/directory',
  '/links',
  '/social',
  '/offline.html',
  '/manifest.webmanifest',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
];

// Install event - pre-cache app shell
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker v1...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Pre-caching app shell');
        // Use addAll with error handling for individual failures
        return Promise.allSettled(
          APP_SHELL.map((url) =>
            cache.add(url).catch((err) => {
              console.warn(`[SW] Failed to cache: ${url}`, err);
            })
          )
        );
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
            .filter((name) => {
              // Delete old version caches
              return name.startsWith('ski-directory-') &&
                     name !== STATIC_CACHE &&
                     name !== DYNAMIC_CACHE;
            })
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

// Fetch event - handle requests with appropriate caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Skip API requests (Supabase) - let TanStack Query handle caching
  if (url.hostname.includes('supabase') ||
      url.pathname.includes('/rest/v1/')) {
    return;
  }

  // Skip analytics and external tracking
  if (url.hostname.includes('google-analytics') ||
      url.hostname.includes('googletagmanager')) {
    return;
  }

  // Handle cross-origin requests (only cache specific CDNs)
  if (url.origin !== self.location.origin) {
    // Allow caching of map tiles and GCS images
    if (url.hostname.includes('tile.openstreetmap.org') ||
        url.hostname.includes('storage.googleapis.com')) {
      event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
    }
    return;
  }

  // Navigation requests - Network first, cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets - Cache first
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Default - Network first for dynamic content
  event.respondWith(networkFirst(request));
});

/**
 * Cache-first strategy
 * Returns cached response if available, otherwise fetches from network
 */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.warn('[SW] Fetch failed:', request.url, error);
    // Return a simple offline response for failed requests
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

/**
 * Network-first strategy
 * Fetches from network, falls back to cache, then offline page
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      // Cache successful responses
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);

    // Try to return cached version
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // For navigation requests, return offline page
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/offline.html');
      if (offlinePage) {
        return offlinePage;
      }
    }

    // Return generic offline response
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

/**
 * Check if URL is a static asset
 */
function isStaticAsset(pathname) {
  const staticExtensions = [
    '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg',
    '.woff', '.woff2', '.ttf', '.eot', '.ico', '.webp', '.avif',
    '.json', '.webmanifest'
  ];
  return staticExtensions.some((ext) => pathname.endsWith(ext));
}

/**
 * Handle messages from client
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Skip waiting requested');
    self.skipWaiting();
  }
});

/**
 * Periodic cache cleanup (trim old entries)
 */
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    console.log(`[SW] Trimming ${cacheName}, removing oldest entries`);
    // Remove oldest entries (FIFO)
    const toDelete = keys.slice(0, keys.length - maxItems);
    await Promise.all(toDelete.map((key) => cache.delete(key)));
  }
}

// Trim dynamic cache periodically (max 100 entries)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'TRIM_CACHE') {
    trimCache(DYNAMIC_CACHE, 100);
  }
});
