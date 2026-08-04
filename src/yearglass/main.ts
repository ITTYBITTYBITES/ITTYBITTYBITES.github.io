/**
 * YearGlass — Sanctuary bootstrap entry.
 *
 * Wires the engine subsystems (WebGL2 glass renderer, procedural audio,
 * camera/viewport, IndexedDB memory engine) into the /yearglass/ page, with
 * a graceful DOM overlay for the intro ("I was here waiting for you.") and a
 * fallback so a WebGL failure never white-screens the sanctuary.
 */

import { SimulationEngine } from "../engine/simulation/SimulationEngine";

window.onerror = (msg, src, line) => {
  console.error('Global error:', msg, src, line);
  document.body.insertAdjacentHTML(
    'beforeend',
    '<div style="position:fixed;inset:0;z-index:99999;background:#0d0d0e;color:#bfa06a;display:flex;align-items:center;justify-content:center;font-family:system-ui;padding:2rem;text-align:center;"><div><h2>The sanctuary is sleeping.</h2><p>Something went wrong.</p><button onclick="location.reload()" style="padding:0.75rem 1.5rem;background:#bfa06a;color:#0d0d0e;border:none;border-radius:8px;font-weight:700;cursor:pointer;">Clear Cache & Reload</button></div></div>'
  );
};

fetch('app-version.json', { cache: 'no-store' })
  .then((r) => r.json())
  .then((data) => {
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

function ensureMount(): HTMLElement {
  let root = document.getElementById('yearglass-mount');
  if (!root) {
    root = document.createElement('div');
    root.id = 'yearglass-mount';
    root.style.cssText =
      'position:fixed;inset:0;overflow:hidden;background:#0d0d0e;color:#f0ede8;';
    const app = document.getElementById('root');
    (app || document.body).appendChild(root);
  }
  return root;
}

async function bootSanctuary(): Promise<void> {
  const mount = ensureMount();

  // Intro overlay kept intact ("I was here waiting for you."), dismissed by tap.
  const intro = document.createElement('div');
  intro.className = 'yearglass-intro';
  intro.style.cssText =
    'position:absolute;inset:0;z-index:20;display:flex;align-items:center;justify-content:center;' +
    'flex-direction:column;gap:1.25rem;cursor:pointer;background:rgba(10,12,10,0.55);' +
    'backdrop-filter:blur(2px);text-align:center;padding:2rem;';
  intro.innerHTML =
    '<p style="font-size:clamp(1.1rem,4vw,1.6rem);opacity:0.92;max-width:28rem;">I was here waiting for you.</p>' +
    '<p style="opacity:0.6;font-size:0.9rem;">tap anywhere to enter your sanctuary</p>';
  mount.appendChild(intro);

  const engine = new SimulationEngine({
    onMemory: (message) => console.log('[YearGlass memory]', message),
    onPipObserved: (visited) => console.log('[YearGlass] Pip visit #' + visited),
  });

  let started = false;
  const start = async () => {
    if (started) return;
    started = true;
    intro.style.transition = 'opacity 0.6s ease';
    intro.style.opacity = '0';
    setTimeout(() => intro.remove(), 650);
    engine.focusDome();
    try {
      await engine.mount(mount);
    } catch (err) {
      // Never let a mount failure escape as an unhandled rejection — the
      // frame loop and intro teardown must keep working either way.
      console.error('[YearGlass] mount failed:', err);
    }
  };

  intro.addEventListener('click', start, { once: true });
  intro.addEventListener('touchstart', start, { passive: true, once: true });

  // Keep intro presentable but don't block keyboard users.
  intro.setAttribute('tabindex', '0');
  intro.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      start();
    }
  });

  // Expose for debugging.
  (window as unknown as { __yearglass?: unknown }).__yearglass = engine;
}

console.log('YearGlass — Enterprise Sanctuary Engine');
// bootSanctuary is async — a try/catch alone would miss rejected promises,
// so attach an explicit catch to keep init failures from stalling the loop.
bootSanctuary().catch((e) => {
  console.error('Engine init failed:', e);
});

window.addEventListener('error', (e: any) => {
  if (
    e.message &&
    (e.message.includes('Loading chunk') ||
      e.message.includes('Importing a module script failed'))
  ) {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) registration.unregister();
        window.location.reload();
      });
    } else {
      window.location.reload();
    }
  }
});
