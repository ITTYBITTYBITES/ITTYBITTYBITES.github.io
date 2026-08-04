import fs from 'fs';
const swPath = 'dist/sw.js';
if (fs.existsSync(swPath)) {
  let content = fs.readFileSync(swPath, 'utf8');
  // Inject skipWaiting and clients.claim
  if (!content.includes('skipWaiting')) {
    content += '\nself.addEventListener("install", event => { self.skipWaiting(); });';
  }
  if (!content.includes('clients.claim')) {
    content += '\nself.addEventListener("activate", event => { event.waitUntil(self.clients.claim()); });';
  }
  fs.writeFileSync(swPath, content);
  console.log('Service worker lifecycle hooks added.');
}
