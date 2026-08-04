declare const self: any;
declare const caches: any;
self.addEventListener('install', (event: any) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event: any) => {
  event.waitUntil(
    caches.keys().then((names: string[]) => Promise.all(
      names.map((name: string) => {
        if (name !== 'yearglass-cache-v1') {
          return caches.delete(name);
        }
        return Promise.resolve();
      })
    )).then(() => self.clients.claim())
  );
});
