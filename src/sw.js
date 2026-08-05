declare const self: any;
declare const caches: any;

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event: any) => {
  event.waitUntil(
    caches.keys().then((names: string[]) => Promise.all(
      names.map((name: string) => caches.delete(name))
    )).then(() => self.clients.claim())
  );
});
