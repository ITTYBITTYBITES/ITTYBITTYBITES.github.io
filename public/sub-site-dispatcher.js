/* Isolated GitHub Pages sub-sites — run BEFORE the library SPA boots.
   Canonical Shattered Foil URL is /shattered-foil/ (not shattered-foil.html). */
(function () {
  var path = location.pathname || '';
  function go(url) {
    if (location.pathname === url) return;
    location.replace(url);
  }

  if (path === '/prosumer-matrix' || path.indexOf('/prosumer-matrix/') === 0) {
    go('https://ittybittybites.github.io/prosumer-matrix/');
    return;
  }
  if (
    path === '/yearglass-sanctuary' ||
    path.indexOf('/yearglass-sanctuary/') === 0 ||
    path === '/yearglass' ||
    path === '/yearglass/' ||
    path.indexOf('/experience/yearglass') === 0
  ) {
    go('https://ittybittybites.github.io/yearglass-sanctuary/');
    return;
  }
  if (path === '/shattered-foil.html' || path === '/shattered-foil' || path.indexOf('/ITTYBITTYBITES-Shattered-Foil') === 0) {
    go('/shattered-foil/');
  }
})();
