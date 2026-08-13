const KEY = 'sf-app-version';
const RELOAD_FLAG = 'sf-reloading-for';

function allRegistrations() {
  if (!('serviceWorker' in navigator)) return Promise.resolve([]);
  return navigator.serviceWorker.getRegistrations();
}

function clearAllCaches() {
  if (!('caches' in window)) return Promise.resolve();
  return caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
}

function pageBuild() {
  return document.documentElement.getAttribute('data-sf-build') || '';
}

function versionUrl() {
  try {
    return new URL('app-version.json', window.location.href).href + '?t=' + Date.now();
  } catch (e) {
    return '/shattered-foil/app-version.json?t=' + Date.now();
  }
}

function hardRefresh(build) {
  const url = new URL(window.location.href);
  url.searchParams.set('v', build || String(Date.now()));
  window.location.replace(url.pathname + url.search + url.hash);
}

function nukeAndReload(build) {
  if (sessionStorage.getItem(RELOAD_FLAG) === build) {
    localStorage.setItem(KEY, build);
    return;
  }
  sessionStorage.setItem(RELOAD_FLAG, build);
  localStorage.setItem(KEY, build);
  allRegistrations()
    .then((regs) => Promise.all(regs.map((reg) => reg.unregister())))
    .catch(function () {})
    .then(clearAllCaches)
    .then(function () { hardRefresh(build); });
}

fetch(versionUrl(), { cache: 'no-store' })
  .then((r) => r.json())
  .then((data) => {
    const build = data && data.build;
    if (!build) return;
    const stored = localStorage.getItem(KEY);
    const htmlBuild = pageBuild();
    const staleStorage = stored && stored !== build;
    const staleHtml = htmlBuild && htmlBuild !== build;
    if (staleStorage || staleHtml) {
      console.log('[Shattered Foil] New version', build, '— purging workers/caches and refreshing');
      nukeAndReload(build);
      return;
    }
    localStorage.setItem(KEY, build);
    sessionStorage.removeItem(RELOAD_FLAG);
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(new URL('sw.js', window.location.href).href, { scope: './' }).catch(function () {});
    }
  })
  .catch(function () {});

if ('serviceWorker' in navigator) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}
