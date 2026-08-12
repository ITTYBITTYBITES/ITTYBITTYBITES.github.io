const KEY = 'sf-app-version';

function allRegistrations() {
  if (!('serviceWorker' in navigator)) return Promise.resolve([]);
  return navigator.serviceWorker.getRegistrations();
}

function clearAllCaches() {
  if (!('caches' in window)) return Promise.resolve();
  return caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
}

function hardRefresh() {
  const url = new URL(window.location.href);
  url.searchParams.set('v', String(Date.now()));
  window.location.replace(url.pathname + url.search + url.hash);
}

fetch('/shattered-foil/app-version.json?t=' + Date.now(), { cache: 'no-store' })
  .then((r) => r.json())
  .then((data) => {
    const stored = localStorage.getItem(KEY);
    if (stored && stored !== data.build) {
      console.log('[Shattered Foil] New version', data.build, '— purging all workers/caches and refreshing');
      localStorage.setItem(KEY, data.build);
      allRegistrations()
        .then((regs) => Promise.all(regs.map((reg) => reg.unregister())))
        .catch(() => {})
        .then(clearAllCaches)
        .then(hardRefresh);
    } else {
      localStorage.setItem(KEY, data.build);
    }
  })
  .catch(() => {});

if ('serviceWorker' in navigator) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}
