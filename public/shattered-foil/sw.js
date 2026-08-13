// ============================================================================
// Shattered Foil — scoped service worker
// Scope: /shattered-foil/ only.
// HTML + app-version.json are network-first so deploys show up without
// the user clearing cache.
// ============================================================================

const CACHE_VERSION = 'sf-20260813-v37';
const STATIC_CACHE = `shattered-foil-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `shattered-foil-dynamic-${CACHE_VERSION}`;
const SCOPE_PREFIX = '/shattered-foil';

function inScope(url) {
  try {
    const parsed = new URL(url);
    if (parsed.origin !== self.location.origin) return false;
    return parsed.pathname === SCOPE_PREFIX || parsed.pathname.startsWith(`${SCOPE_PREFIX}/`);
  } catch {
    return false;
  }
}

function isVersionFile(url) {
  return url.pathname.endsWith('/app-version.json');
}

function isDocument(request, url) {
  return request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('/');
}

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name.startsWith('shattered-foil-') && name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (!inScope(request.url)) return;

  const url = new URL(request.url);

  // Never cache the version file or the checker — they are the update signal.
  if (isVersionFile(url) || url.pathname.endsWith('/version-check.js')) {
    event.respondWith(fetch(new Request(request, { cache: 'no-store' })));
    return;
  }

  // Documents: network-first so a refresh always sees the latest HTML.
  if (isDocument(request, url)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/shattered-foil/index.html')))
    );
    return;
  }

  // Other assets: stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);

      return cached || network;
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CACHE_CLEAR') {
    event.waitUntil(
      caches.keys().then((names) =>
        Promise.all(names.filter((name) => name.startsWith('shattered-foil-')).map((name) => caches.delete(name)))
      )
    );
  }
});
