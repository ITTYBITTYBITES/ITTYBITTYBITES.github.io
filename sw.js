/**
 * ITTYBITTYBITES HUB SERVICE WORKER (Phase 9 - PWA Lifecycle)
 * Implements a robust Stale-While-Revalidate caching strategy.
 * Ensures instant offline boots and silent background updates.
 */

const CACHE_NAME = "ibb-cache-v9.0.0";

const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./styles.css",
  "./manifest.json",
  "./scripts/engine.js",
  "./scripts/telemetry.js",
  "./scripts/audio_manager.js",
  "./scripts/ad_manager.js",
  "./scripts/spatial_controller.js",
  "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
  "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/renderers/CSS3DRenderer.js",
  "https://cdnjs.cloudflare.com/ajax/libs/tween.js/18.6.4/tween.umd.js"
];

// 1. Install Event: Populate Cache Storage with core shell assets
self.addEventListener("install", (event) => {
  console.log(`📥 [Service Worker] Installing version: ${CACHE_NAME}`);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("📥 [Service Worker] Pre-caching core platform shell assets.");
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => {
      // Force immediate takeover
      return self.skipWaiting();
    })
  );
});

// 2. Activate Event: Clean up stale caches from previous builds
self.addEventListener("activate", (event) => {
  console.log("⚙ [Service Worker] Activating and taking control of active tabs.");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log(`⚙ [Service Worker] Deleting obsolete cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take immediate client control
      return self.clients.claim();
    })
  );
});

// 3. Fetch Event: Execute high-fidelity Stale-While-Revalidate caching strategy
self.addEventListener("fetch", (event) => {
  // Avoid intercepting third-party metrics/AdSense calls directly (must fetch fresh)
  if (
    event.request.url.includes("pagead") || 
    event.request.url.includes("googlesyndication") ||
    event.request.url.includes("adsterra")
  ) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        // Run network query in background to update cache (revalidate)
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // Only cache valid GET responses
          if (event.request.method === "GET" && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch((err) => {
          console.warn(`⚠️ [Service Worker] Network request failed for: ${event.request.url}`, err);
        });

        // Return cached version instantly (fast load) or fallback to network if missing
        return cachedResponse || fetchPromise;
      });
    })
  );
});
