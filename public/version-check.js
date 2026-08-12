const KEY = 'ittybittybites-app-version';
const LEGACY_KEY = 'yearglass-app-version';

fetch('/app-version.json?t=' + Date.now(), { cache: 'no-store' })
  .then((r) => r.json())
  .then((data) => {
    const stored = localStorage.getItem(KEY) || localStorage.getItem(LEGACY_KEY);
    if (stored && stored !== data.build) {
      console.log('New version detected:', data.build, '— purging stale workers/caches and refreshing');
      localStorage.setItem(KEY, data.build);
      localStorage.removeItem(LEGACY_KEY);

      function doReload() {
        window.location.reload();
      }

      const clearCaches = () => {
        if (!('caches' in window)) return Promise.resolve();
        return caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
      };

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .getRegistrations()
          .then((regs) => Promise.all(regs.map((r) => r.unregister())))
          .catch(() => {})
          .then(clearCaches)
          .then(doReload);
      } else {
        clearCaches().then(doReload);
      }
    } else {
      localStorage.setItem(KEY, data.build);
      localStorage.removeItem(LEGACY_KEY);
    }
  })
  .catch(() => {});

function openDome() {
  try { if (window.initAudio) window.initAudio(); if (window.unlockAudio) window.unlockAudio(); } catch (e) {}
  try {
    const d = document.createElement('div');
    d.innerHTML = '<div style=text-align:center;padding:2rem;color:#f0ede8;background:linear-gradient(135deg,#0d0d0e,#1a1814);position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.8s ease><h2>The Dome Opens</h2><p>Observe carefully.</p><p id=obsTimer>00:00</p><button onclick="this.closest(\'div\').parentElement.remove()" style=padding:0.75rem 1.5rem;border-radius:8px;border:1px solid #bfa06a;background:#bfa06a;color:#0d0d0e;font-weight:700;cursor:pointer;>Return</button></div>';
    d.style.cssText = 'position:fixed;inset:0;z-index:9999;background:linear-gradient(135deg,#0d0d0e,#1a1814);animation:fadeIn 0.8s ease;';
    document.body.appendChild(d);
    let s = 0;
    setInterval(function () {
      s++;
      var m = Math.floor(s / 60).toString().padStart(2, '0');
      var sec = (s % 60).toString().padStart(2, '0');
      var t = document.getElementById('obsTimer');
      if (t) t.textContent = m + ':' + sec;
    }, 1000);
  } catch (e) {}
}
