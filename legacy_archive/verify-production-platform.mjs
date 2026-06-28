import { chromium } from 'playwright';

const BASE = process.env.BASE || 'https://ittybittybites.github.io/website/platform/';
const results = [];
function ok(name, details = '') { results.push({ ok: true, name, details }); console.log(`✅ ${name}${details ? ' — ' + details : ''}`); }
function fail(name, details = '') { results.push({ ok: false, name, details }); console.error(`❌ ${name}${details ? ' — ' + details : ''}`); }

async function checkAssetPaths() {
  const res = await fetch(BASE + 'index.html', { redirect: 'follow' });
  if (!res.ok) throw new Error(`index.html HTTP ${res.status}`);
  const html = await res.text();
  ok('Platform index reachable', `${res.status}`);

  const refs = [];
  for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const ref = match[1];
    if (ref.startsWith('http') || ref.startsWith('mailto:') || ref.startsWith('#')) continue;
    refs.push(ref);
  }
  if (!refs.length) fail('Asset reference discovery', 'No relative assets discovered');
  else ok('Asset reference discovery', `${refs.length} relative references`);

  for (const ref of refs) {
    const url = new URL(ref, BASE).toString();
    const assetRes = await fetch(url, { redirect: 'follow' });
    if (assetRes.ok) ok(`Asset loads: ${ref}`, `${assetRes.status}`);
    else fail(`Asset loads: ${ref}`, `HTTP ${assetRes.status}`);
  }
}

async function checkBrowserStateAndEvents() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const consoleMessages = [];
  const pageErrors = [];
  page.on('console', msg => consoleMessages.push(`${msg.type()}: ${msg.text()}`));
  page.on('pageerror', err => pageErrors.push(err.message));

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector('#btn-level-5', { timeout: 10000 });
  ok('Browser loads platform UI', await page.title());

  await page.click('#btn-level-5');
  await page.waitForTimeout(400);
  let storage = await page.evaluate(() => ({
    state: localStorage.getItem('platform_state'),
    log: localStorage.getItem('platform_event_log'),
    status: document.getElementById('status')?.textContent || '',
    visualText: document.getElementById('visual-root')?.textContent || '',
  }));
  if (storage.state && storage.state.includes('"level":5')) ok('State persistence after Level Up', 'level 5 saved');
  else fail('State persistence after Level Up', storage.state || 'missing platform_state');
  if (storage.log && storage.log.includes('milestone.level_up')) ok('Event log records Level Up', 'milestone.level_up present');
  else fail('Event log records Level Up', storage.log || 'missing platform_event_log');

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('#visual-root', { timeout: 10000 });
  storage = await page.evaluate(() => ({
    state: localStorage.getItem('platform_state'),
    status: document.getElementById('status')?.textContent || '',
    visualText: document.getElementById('visual-root')?.textContent || '',
  }));
  if (storage.status.includes('Rehydrated') && storage.visualText.includes('Level 5')) ok('State rehydrates after refresh', storage.status);
  else fail('State rehydrates after refresh', `${storage.status} / ${storage.visualText.slice(0, 120)}`);

  await page.click('#btn-spend');
  await page.waitForTimeout(500);
  const reward = await page.evaluate(() => ({
    bodyText: document.body.textContent || '',
    log: localStorage.getItem('platform_event_log') || '',
  }));
  if (reward.log.includes('system.reward_offered')) ok('Reward event fires in production', 'system.reward_offered present');
  else fail('Reward event fires in production', 'system.reward_offered missing');
  if (reward.bodyText.includes('Reward Available')) ok('RewardBanner renders in production', 'visible reward banner text found');
  else fail('RewardBanner renders in production', 'Reward Available text missing');

  if (pageErrors.length === 0) ok('No browser page errors');
  else fail('No browser page errors', pageErrors.join(' | '));

  await page.click('#btn-clear');
  await page.waitForTimeout(250);
  await browser.close();
}

async function checkEscapeValve() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const targetUrl = 'https://ittybittybites.github.io/website/arcade.html';
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('.play-game', { timeout: 30000 });

  await page.locator('.play-game').first().click();
  await page.waitForTimeout(800);

  const returnDot = page.locator('#lm-spatial-return');
  if (await returnDot.count() > 0) ok('Escape Valve: Spatial Return dot exists on loaded node');
  else fail('Escape Valve: Spatial Return dot missing on loaded node');

  await returnDot.click();
  await page.waitForTimeout(1000);
  if (page.url().includes('index.html') || page.url().endsWith('/website/')) ok('Escape Valve: Spatial Return dot successfully returns home');
  else fail('Escape Valve: Spatial Return navigation failed', page.url());

  await browser.close();
}

try {
  await checkAssetPaths();
  await checkBrowserStateAndEvents();
  await checkEscapeValve();
} catch (err) {
  fail('Verification runner crashed', err?.stack || err?.message || String(err));
}

const failures = results.filter(r => !r.ok);
console.log('\n--- SUMMARY ---');
console.log(JSON.stringify({ total: results.length, passed: results.length - failures.length, failed: failures.length, failures }, null, 2));
process.exit(failures.length ? 1 : 0);
