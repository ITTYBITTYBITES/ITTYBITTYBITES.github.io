const KEY = 'sf-app-version';

function foilRegistrations() {
  if (!('serviceWorker' in navigator)) return Promise.resolve([]);
  return navigator.serviceWorker.getRegistrations().then((regs) =>
    regs.filter((reg) => (reg.scope || '').includes('/shattered-foil'))
  );
}

function clearFoilCaches() {
  if (!('caches' in window)) return Promise.resolve();
  return caches.keys().then((keys) =>
    Promise.all(keys.filter((k) => k.startsWith('shattered-foil-')).map((k) => caches.delete(k)))
  );
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
      console.log('[Shattered Foil] New version', data.build, '— refreshing without a manual cache clear');
      localStorage.setItem(KEY, data.build);
      foilRegistrations()
        .then((regs) => Promise.all(regs.map((reg) => reg.unregister())))
        .catch(() => {})
        .then(clearFoilCaches)
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
