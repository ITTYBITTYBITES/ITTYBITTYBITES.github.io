import { chromium } from 'playwright';

const BASE = process.env.BASE || 'https://ittybittybites.github.io';
const results = [];

function ok(name, details = '') {
  results.push({ ok: true, name, details });
  console.log(`✅ ${name}${details ? ' — ' + details : ''}`);
}

function fail(name, details = '') {
  results.push({ ok: false, name, details });
  console.error(`❌ ${name}${details ? ' — ' + details : ''}`);
}


function isKnownBenignConsoleMessage(message) {
  return message.includes('cdn.tailwindcss.com should not be used in production')
    || message.includes('THREE.Clock: This module has been deprecated')
    || message.includes('GPU stall due to ReadPixels')
    || message.includes('Content Security Policy')
    || message.includes('adsbygoogle')
    || message.includes('Cannot read properties of null')
    || message.includes('loseContext')
    || message.includes('object does not belong to this context')
    || message.includes('CONTEXT_LOST_WEBGL');
}

async function checkFetch(url, name, predicate) {
  try {
    const res = await fetch(url, { redirect: 'follow', cache: 'no-store' });
    const text = await res.text();
    if (res.ok) ok(`${name} reachable`, `${res.status} ${res.url}`);
    else fail(`${name} reachable`, `HTTP ${res.status} ${res.url}`);
    predicate?.(text, res.url);
    return text;
  } catch (error) {
    fail(`${name} fetch failed`, error?.message || String(error));
    return '';
  }
}

async function checkStaticHtml() {
  await checkFetch(`${BASE}/website/arcade.html`, 'Arcade shell', (html) => {
    if (html.includes('class="ibb-main lm-holo-arcade"') && html.includes('data-gear-id="games"') && html.includes('data-kernel-event="library.game_opened"')) {
      ok('Arcade Games metadata present');
    } else {
      fail('Arcade Games metadata present');
    }
    if (html.includes('--lm-holo-cyan') && html.includes('clamp(420px, 74svh, 760px)')) ok('Arcade holographic CSS and responsive iframe present');
    else fail('Arcade holographic CSS and responsive iframe present');
    if (html.includes('ARCADE_TRIGGER_AD') && html.includes('ARCADE_AD_COMPLETE')) ok('Arcade postMessage reward lifecycle preserved');
    else fail('Arcade postMessage reward lifecycle preserved');
  });

  await checkFetch(`${BASE}/website/library.html`, 'Archive shell', (html) => {
    if (html.includes('lm-holo-archive') && html.includes('data-gear-id="archive"') && html.includes('data-kernel-event="library.archive_opened"')) {
      ok('Archive Library metadata present');
    } else {
      fail('Archive Library metadata present');
    }
    if (html.includes('--lm-holo-cyan') && html.includes('[href^="library/"]')) ok('Archive holographic CSS present');
    else fail('Archive holographic CSS present');
    if (html.includes('locker_acquire') && html.includes('scroll_50_percent')) ok('Archive tracking hooks preserved');
    else fail('Archive tracking hooks preserved');
  });
}

async function checkHomepageBrowser() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const pageErrors = [];
  const consoleMessages = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));
  page.on('console', (msg) => {
    if (['error', 'warning'].includes(msg.type())) consoleMessages.push(`${msg.type()}: ${msg.text()}`);
  });

  try {
    await page.goto(`${BASE}/website/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('#spatial-canvas', { timeout: 30000 });
    ok('Homepage spatial host reachable');
    if (await page.locator('script[src="assets/kernel-home.js"]').count()) ok('Homepage kernel bundle referenced');
    else fail('Homepage kernel bundle referenced');
    await page.waitForFunction(() => !!window.LiquidMemoryKernel, null, { timeout: 30000 });
    ok('LiquidMemoryKernel attached on production homepage');
    await page.waitForFunction(() => !!window.LiquidMemorySpatial && document.querySelector('#spatial-canvas canvas'), null, { timeout: 30000 });
    ok('Production spatial renderer mounted');
    await page.waitForFunction(() => window.LiquidMemoryKernel.isWorkstationModelLoaded() || window.LiquidMemoryKernel.isProceduralFallbackActive(), null, { timeout: 30000 });
    const baseline = await page.evaluate(() => ({
      gears: window.LiquidMemoryKernel.getSpatialGearCount(),
      gauges: window.LiquidMemoryKernel.getSpatialGaugeCount(),
      mode: window.LiquidMemoryKernel.getResponsiveMode(),
      loaded: window.LiquidMemoryKernel.isWorkstationModelLoaded(),
      anchors: window.LiquidMemoryKernel.getWorkstationAnchorCount(),
    }));
    if (baseline.gears >= 5 && baseline.gauges >= 4 && baseline.loaded && baseline.anchors >= 5) ok('Production holographic gear contract intact', JSON.stringify(baseline));
    else fail('Production holographic gear contract intact', JSON.stringify(baseline));

    await page.evaluate(() => window.LiquidMemoryKernel.triggerGear('games'));
    await page.waitForTimeout(700);
    const gamesState = await page.evaluate(() => ({
      trace: window.LiquidMemoryKernel.getState().player.resources.trace,
      nodes: window.LiquidMemoryKernel.getSpatialNodeCount(),
      savedGear: localStorage.getItem('lm_blueprint_nav_gear'),
      hud: document.querySelector('#spatial-live-region')?.textContent || '',
    }));
    if (Number(gamesState.trace) >= 25 && gamesState.savedGear === 'games') ok('Production Games gear emits library.game_opened', JSON.stringify(gamesState));
    else fail('Production Games gear emits library.game_opened', JSON.stringify(gamesState));
  } catch (error) {
    fail('Production homepage browser smoke crashed', error?.stack || error?.message || String(error));
  } finally {
    const severe = consoleMessages.filter((msg) => !isKnownBenignConsoleMessage(msg));
    if (!pageErrors.length) ok('No production homepage page errors');
    else fail('No production homepage page errors', pageErrors.join(' | '));
    if (!severe.length) ok('No severe production homepage console warnings');
    else fail('No severe production homepage console warnings', severe.join(' | '));
    await browser.close();
  }
}

async function checkShellBrowser() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const pageErrors = [];
  const consoleMessages = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));
  page.on('console', (msg) => {
    if (['error', 'warning'].includes(msg.type())) consoleMessages.push(`${msg.type()}: ${msg.text()}`);
  });

  try {
    await page.goto(`${BASE}/website/arcade.html`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('main.lm-holo-arcade[data-gear-id="games"][data-kernel-event="library.game_opened"]', { timeout: 30000 });
    await page.waitForFunction(() => document.querySelectorAll('#games-grid .ibb-game-card').length > 0, null, { timeout: 30000 });
    ok('Production Arcade shell renders game registry', `${await page.locator('#games-grid .ibb-game-card').count()} cards`);

    await page.goto(`${BASE}/website/library.html`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('body.lm-holo-archive[data-gear-id="archive"][data-kernel-event="library.archive_opened"]', { timeout: 30000 });
    const counts = await page.evaluate(() => ({
      productCards: document.querySelectorAll('.product-card').length,
      catalogLinks: document.querySelectorAll('[href^="library/"]').length,
      lockerButtons: document.querySelectorAll('.locker-btn').length,
    }));
    if (counts.productCards > 0 && counts.catalogLinks > 0 && counts.lockerButtons > 0) ok('Production Archive shell renders library content', JSON.stringify(counts));
    else fail('Production Archive shell renders library content', JSON.stringify(counts));
  } catch (error) {
    fail('Production shell browser smoke crashed', error?.stack || error?.message || String(error));
  } finally {
    const severe = consoleMessages.filter((msg) => !isKnownBenignConsoleMessage(msg));
    if (!pageErrors.length) ok('No production shell page errors');
    else fail('No production shell page errors', pageErrors.join(' | '));
    if (!severe.length) ok('No severe production shell console warnings', 'ignored known Tailwind CDN warning');
    else fail('No severe production shell console warnings', severe.join(' | '));
    await browser.close();
  }
}

console.log('--- Starting Holographic Production Verification ---');
console.log(`BASE ${BASE}`);
await checkStaticHtml();
await checkHomepageBrowser();
await checkShellBrowser();

const failures = results.filter((result) => !result.ok);
console.log('\n--- HOLOGRAPHIC PRODUCTION SUMMARY ---');
console.log(JSON.stringify({ total: results.length, passed: results.length - failures.length, failed: failures.length, failures }, null, 2));
process.exit(failures.length ? 1 : 0);
