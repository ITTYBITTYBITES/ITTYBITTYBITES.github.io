import { SimulationEngine } from './engine/simulation/SimulationEngine';

window.onerror = (msg, src, line) => {
  console.error('Global error:', msg, src, line);
  document.body.insertAdjacentHTML('beforeend', '<div style="position:fixed;inset:0;z-index:99999;background:#0d0d0e;color:#bfa06a;display:flex;align-items:center;justify-content:center;font-family:system-ui;padding:2rem;text-align:center;"><div><h2>The sanctuary is sleeping.</h2><p>Something went wrong.</p><button onclick="location.reload()" style="padding:0.75rem 1.5rem;background:#bfa06a;color:#0d0d0e;border:none;border-radius:8px;font-weight:700;cursor:pointer;">Clear Cache & Reload</button></div></div>');
};

fetch('app-version.json', { cache: 'no-store' })
  .then(r => r.json())
  .then(data => {
    const key = 'yearglass-app-version';
    const stored = localStorage.getItem(key);
    if (stored && stored !== data.build) {
      console.log('New version:', data.build, '— reloading');
      localStorage.setItem(key, data.build);
      window.location.reload();
    } else {
      localStorage.setItem(key, data.build);
    }
  })
  .catch(() => {});

console.log('YearGlass — Enterprise Sanctuary Engine');
try {
  const engine = new SimulationEngine();
  engine.startFirstLaunch();
} catch (e) {
  console.error('Engine init failed:', e);
}
