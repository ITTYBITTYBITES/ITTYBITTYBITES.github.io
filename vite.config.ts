import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

function serveIsolatedSubSites() {
  const roots = [{ prefix: '/shattered-foil', dir: path.resolve('public/shattered-foil') }];

  const serve = (req, res, next) => {
    const url = (req.url || '').split('?')[0];
    for (const site of roots) {
      if (url === site.prefix || url.startsWith(`${site.prefix}/`)) {
        let rel = url.slice(site.prefix.length) || '/';
        if (rel === '/') rel = '/index.html';
        const file = path.join(site.dir, rel);
        if (fs.existsSync(file) && fs.statSync(file).isFile()) {
          const ext = path.extname(file);
          const types = {
            '.html': 'text/html; charset=utf-8',
            '.js': 'text/javascript; charset=utf-8',
            '.json': 'application/json; charset=utf-8',
            '.css': 'text/css; charset=utf-8',
          };
          res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
          res.setHeader('Cache-Control', 'no-store');
          fs.createReadStream(file).pipe(res);
          return;
        }
        const fallback = path.join(site.dir, '404.html');
        if (fs.existsSync(fallback)) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          fs.createReadStream(fallback).pipe(res);
          return;
        }
      }
    }
    next();
  };

  return {
    name: 'serve-isolated-subsites',
    configureServer(server) {
      server.middlewares.use(serve);
    },
    configurePreviewServer(server) {
      server.middlewares.use(serve);
    },
  };
}

export default defineConfig({
  base: '/',
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2020',
    rollupOptions: {
      input: {
        main: 'index.html',
        yearglass: 'yearglass.html',
        shatteredFoil: 'shattered-foil.html',
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  plugins: [
    serveIsolatedSubSites(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'ITTYBITTYBITES',
        short_name: 'ITTYBITTYBITES',
        description:
          'Interactive collections worth returning to. Explore meaningful experiences across science, nature, history, and more.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          {
            name: 'Experiences',
            short_name: 'Experiences',
            description: 'Browse all experiences',
            url: '/experiences',
            icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }],
          },
          {
            name: 'Collections',
            short_name: 'Collections',
            description: 'Browse curated collections',
            url: '/collections',
            icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }],
          },
        ],
        categories: ['education', 'entertainment', 'books'],
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2,webmanifest}'],
        globIgnores: ['**/shattered-foil/**', '**/yearglass/**', '**/experience/yearglass/**'],
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [
          /^\/prosumer-matrix/,
          /^\/.well-known/,
          /^\/api/,
          /^\/yearglass-sanctuary/,
          /^\/yearglass/,
          /^\/experience\/yearglass/,
          /^\/shattered-foil/,
          /^\/shattered-foil\.html/,
          /^\/ITTYBITTYBITES-Shattered-Foil/,
        ],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages',
              expiration: { maxEntries: 50 },
            },
          },
          {
            urlPattern: ({ request }) =>
              ['style', 'script', 'worker', 'image'].includes(request.destination),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'assets',
              expiration: { maxEntries: 200 },
            },
          },
        ],
      },
    }),
  ],
});
