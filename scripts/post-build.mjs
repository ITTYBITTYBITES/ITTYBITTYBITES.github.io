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

  fs.writeFileSync('dist/404.html', html);
  console.log('Created 404 fallback from dist/index.html');
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
