import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf-8');
}

describe('Isolated GitHub Pages sub-sites', () => {
  it('keeps existing yearglass public folder and redirect', () => {
    assert.ok(fs.existsSync(path.join(ROOT, 'public/yearglass/index.html')));
    assert.ok(read('public/yearglass/index.html').includes('yearglass-sanctuary'));
    assert.ok(fs.existsSync(path.join(ROOT, 'yearglass.html')));
  });

  it('publishes a Shattered Foil test page at /shattered-foil/', () => {
    const index = read('public/shattered-foil/index.html');
    assert.ok(index.includes('Solitaire: Shattered Foil'));
    assert.ok(index.includes('version-check.js'));
    assert.ok(fs.existsSync(path.join(ROOT, 'public/shattered-foil/404.html')));
    assert.ok(fs.existsSync(path.join(ROOT, 'public/shattered-foil/sw.js')));
    assert.ok(fs.existsSync(path.join(ROOT, 'public/shattered-foil/app-version.json')));
    assert.ok(fs.existsSync(path.join(ROOT, 'public/shattered-foil/version-check.js')));
    const alias = read('shattered-foil.html');
    assert.ok(alias.includes('/shattered-foil/'), 'shattered-foil.html is only an alias, like yearglass.html');
    assert.ok(!alias.includes('Artisan Card Lounge'), 'do not duplicate the test page into the alias file');
  });

  it('scopes the Shattered Foil worker and version key away from the root PWA', () => {
    const sw = read('public/shattered-foil/sw.js');
    assert.ok(sw.includes("SCOPE_PREFIX = '/shattered-foil'"));
    assert.ok(sw.includes('shattered-foil-static-'));
    assert.ok(!sw.includes("cache.addAll(['/', '/index.html']"));

    const versionCheck = read('public/shattered-foil/version-check.js');
    assert.ok(versionCheck.includes("KEY = 'sf-app-version'"));
    assert.ok(versionCheck.includes("startsWith('shattered-foil-')"));
  });

  it('root PWA denylist and custom SW skip every isolated sub-site', () => {
    const vite = read('vite.config.ts');
    [
      '/prosumer-matrix',
      '/yearglass-sanctuary',
      '/yearglass',
      '/experience\\/yearglass',
      '/shattered-foil',
    ].forEach((prefix) => {
      assert.ok(vite.includes(prefix), `vite denylist missing ${prefix}`);
    });
    assert.ok(vite.includes("globIgnores"));
    assert.ok(vite.includes("'**/shattered-foil/**'"));

    const rootSw = read('src/sw.js');
    assert.ok(rootSw.includes("'/prosumer-matrix'"));
    assert.ok(rootSw.includes("'/yearglass-sanctuary'"));
    assert.ok(rootSw.includes("'/shattered-foil'"));
    assert.ok(rootSw.includes('ittybittybites-static-v2'));
  });

  it('404 post-build dispatcher preserves sub-sites instead of dumping them into the SPA', () => {
    const postBuild = read('scripts/post-build.mjs');
    assert.ok(postBuild.includes('/shattered-foil'));
    assert.ok(postBuild.includes('/prosumer-matrix'));
    assert.ok(postBuild.includes('/yearglass-sanctuary'));
    assert.ok(postBuild.includes('shattered-foil.html'));

    const rootIndex = read('index.html');
    assert.ok(rootIndex.includes('/shattered-foil/'), 'SPA 404 must jump to the canonical folder');
    assert.ok(fs.existsSync(path.join(ROOT, 'public/404.html')));
    assert.ok(read('public/404.html').includes('/shattered-foil/'));
    assert.ok(read('public/shattered-foil/sw.js').includes('network-first') || read('public/shattered-foil/sw.js').includes('Network-first') || read('public/shattered-foil/sw.js').includes('network-first so'));
    assert.ok(read('public/shattered-foil/version-check.js').includes('cache: \'no-store\''));
  });

  it('SPA router hard-navigates to isolated sub-sites', () => {
    const router = read('src/platform/router.ts');
    assert.ok(router.includes('/yearglass-sanctuary'));
    assert.ok(router.includes('/prosumer-matrix'));
    assert.ok(router.includes('/shattered-foil'));
  });
});
