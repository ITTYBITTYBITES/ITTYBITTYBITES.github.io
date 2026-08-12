import fs from 'fs';
import path from 'path';

// 1. Service Worker lifecycle hooks
const swPath = 'dist/sw.js';
if (fs.existsSync(swPath)) {
  let content = fs.readFileSync(swPath, 'utf8');
  if (!content.includes('skipWaiting')) {
    content += '\nself.addEventListener("install", event => { self.skipWaiting(); });';
  }
  if (!content.includes('clients.claim')) {
    content += '\nself.addEventListener("activate", event => { event.waitUntil(self.clients.claim()); });';
  }
  fs.writeFileSync(swPath, content);
  console.log('Service worker lifecycle hooks added.');
}

// 2. Generate SPA route copies so GitHub Pages returns 200 OK directly
const distIndex = 'dist/index.html';
if (fs.existsSync(distIndex)) {
  const html = fs.readFileSync(distIndex, 'utf8');

  const routesToCopy = [
    'dist/experiences',
    'dist/collections',
    'dist/library',
  ];

  for (const routeDir of routesToCopy) {
    fs.mkdirSync(routeDir, { recursive: true });
    fs.writeFileSync(path.join(routeDir, 'index.html'), html);
    console.log(`Created SPA route fallback: ${routeDir}/index.html`);
  }

  const dispatcher = `<script>
(function(){
  var path = location.pathname || '';
  var sites = [
    { prefix: '/prosumer-matrix', dest: 'https://ittybittybites.github.io/prosumer-matrix/' },
    { prefix: '/yearglass-sanctuary', dest: 'https://ittybittybites.github.io/yearglass-sanctuary/' },
    { prefix: '/yearglass', dest: 'https://ittybittybites.github.io/yearglass-sanctuary/' },
    { prefix: '/experience/yearglass', dest: '/yearglass/' },
    { prefix: '/ITTYBITTYBITES-Shattered-Foil', dest: '/shattered-foil/' },
    { prefix: '/shattered-foil.html', dest: '/shattered-foil/' }
  ];
  for (var i = 0; i < sites.length; i++) {
    var prefix = sites[i].prefix;
    if (path === prefix || path.indexOf(prefix + '/') === 0) {
      var dest = sites[i].dest;
      if (dest.charAt(0) === '/' && (path === dest || path === dest.replace(/\\/$/, ''))) return;
      location.replace(dest);
      return;
    }
  }
})();
</script>`;

  const injected = html.includes('<head>')
    ? html.replace('<head>', `<head>${dispatcher}`)
    : dispatcher + html;
  fs.writeFileSync('dist/404.html', injected);
  console.log('Created 404 fallback from dist/index.html with isolated sub-site dispatcher');
}

// 3. Generate standalone redirects for legacy /yearglass routes
const redirectHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="refresh" content="0; url=https://ittybittybites.github.io/yearglass-sanctuary/" />
  <title>Redirecting to YearGlass Sanctuary...</title>
  <script>
    window.location.replace("https://ittybittybites.github.io/yearglass-sanctuary/");
  </script>
</head>
<body>
  <p>Redirecting to <a href="https://ittybittybites.github.io/yearglass-sanctuary/">YearGlass Sanctuary</a>...</p>
</body>
</html>`;

const redirectDirs = [
  'dist/yearglass',
  'dist/experience/yearglass',
];

for (const dir of redirectDirs) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), redirectHtml);
  console.log(`Created standalone redirect: ${dir}/index.html`);
}

fs.writeFileSync('dist/yearglass.html', redirectHtml);
console.log('Created standalone redirect: dist/yearglass.html');

// 4. Shattered Foil lives only in public/shattered-foil/ (canonical).
// shattered-foil.html is a yearglass.html-style alias that redirects there.
const foilRedirect = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="refresh" content="0; url=/shattered-foil/" />
  <title>Redirecting to Shattered Foil...</title>
  <script>window.location.replace("/shattered-foil/");</script>
</head>
<body>
  <p>Redirecting to <a href="/shattered-foil/">Shattered Foil</a>...</p>
</body>
</html>`;
fs.writeFileSync('dist/shattered-foil.html', foilRedirect);
if (!fs.existsSync('dist/shattered-foil/index.html') && fs.existsSync('public/shattered-foil/index.html')) {
  fs.mkdirSync('dist/shattered-foil', { recursive: true });
  fs.cpSync('public/shattered-foil', 'dist/shattered-foil', { recursive: true });
}
console.log('Ensured Shattered Foil alias /shattered-foil.html → /shattered-foil/');
