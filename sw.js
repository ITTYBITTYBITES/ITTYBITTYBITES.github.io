/**
 * SELF-DESTRUCTING SERVICE WORKER (PWA Cache Buster)
 * Instantly clears all stored browser caches and unregisters itself
 * to ensure that users are immediately served the latest live production files.
 */

self.addEventListener("install", (event) => {
  console.log("📥 [Service Worker] Installed. Forcing immediate takeover...");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("⚙ [Service Worker] Activated. Wiping stale cache layers...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          console.log(`⚙ [Service Worker] Purging cache: ${name}`);
          return caches.delete(name);
        })
      );
    }).then(() => {
      console.log("⚙ [Service Worker] Unregistering self from client registration...");
      return self.registration.unregister();
    }).then(() => {
      console.log("⚙ [Service Worker] Refreshing active client windows...");
      return self.clients.matchAll();
    }).then((clients) => {
      clients.forEach((client) => {
        if (client.url) {
          client.navigate(client.url); // Force immediate refresh
        }
      });
    })
  );
});

// Pass-through all fetch requests directly to network (no-cache)
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
