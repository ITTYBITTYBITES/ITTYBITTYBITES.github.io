const KEY = 'yearglass-app-version';
fetch('/app-version.json', { cache: 'no-store' })
  .then(r => r.json())
  .then(data => {
    const stored = localStorage.getItem(KEY);
    if (stored && stored !== data.build) {
      console.log('New version detected:', data.build, '— purging cache and refreshing');
      localStorage.setItem(KEY, data.build);

      function doReload() { window.location.reload(); }

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations()
          .then(regs => Promise.all(regs.map(r => r.unregister())))
          .catch(() => {})
          .then(() => {
            if ('caches' in window) {
              caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))).catch(() => {}).then(doReload);
            } else {
              doReload();
            }
          });
      } else if ('caches' in window) {
        caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))).catch(() => {}).then(doReload);
      } else {
        doReload();
      }
    } else {
      localStorage.setItem(KEY, data.build);
    }
  })
  .catch(() => {});
