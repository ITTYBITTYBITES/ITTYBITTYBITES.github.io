// ============================================================================
// Root Site Service Worker (ITTYBITTYBITES.github.io)
// ============================================================================
// This service worker handles caching for the root site.
// IMPORTANT: Isolated sub-sites (/prosumer-matrix, /yearglass-sanctuary,
// /yearglass, /shattered-foil) manage their own workers and caches.
// ============================================================================

const CACHE_NAME = 'ittybittybites-root-v2';
const STATIC_CACHE = 'ittybittybites-static-v2';
const DYNAMIC_CACHE = 'ittybittybites-dynamic-v2';

const EXTERNAL_SCOPES = [
  '/prosumer-matrix',
  '/yearglass-sanctuary',
  '/yearglass',
  '/experience/yearglass',
  '/shattered-foil',
  '/ITTYBITTYBITES-Shattered-Foil',
];

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/sw.js'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[RootSite SW] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[RootSite SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[RootSite SW] Install complete');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[RootSite SW] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => {
            console.log(`[RootSite SW] Deleting old cache: ${name}`);
            return caches.delete(name);
          })
      );
    })
    .then(() => {
      console.log('[RootSite SW] Activate complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Only handle requests for this site
  if (!url.origin.includes('ittybittybites.github.io')) {
    return;
  }
  
  // Skip API calls, external resources, etc.
  if (url.pathname.startsWith('/api/') ||
      url.hostname !== 'ittybittybites.github.io') {
    return;
  }
  
  // CRITICAL: Skip isolated sub-sites so each can keep its own worker + cache.
  if (EXTERNAL_SCOPES.some((scope) => url.pathname === scope || url.pathname.startsWith(`${scope}/`))) {
    console.log('[RootSite SW] Skipping isolated sub-site request:', url.pathname);
    return;
  }
  
  // For root site paths, use cache-first strategy with network update
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached version while fetching fresh version in background
          fetch(request).then((response) => {
            if (response.ok) {
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
          }).catch(() => {});
          return cachedResponse;
        }
        
        // No cache, fetch from network
        return fetch(request)
          .then((response) => {
            // Cache successful responses
            if (response.ok) {
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/');
            }
            return new Response('Offline', { status: 503 });
          });
      })
  );
});

// Message handler for cache clearing
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_CLEAR') {
    console.log('[RootSite SW] Clearing caches...');
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          console.log(`[RootSite SW] Deleting: ${name}`);
          return caches.delete(name);
        })
      );
    });
  }
});
