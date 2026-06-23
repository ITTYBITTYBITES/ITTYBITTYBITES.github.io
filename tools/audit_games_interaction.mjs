import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://127.0.0.1:8765/website/';
const OUT = 'docs/qa-game-interaction-results.json';
const games = JSON.parse(fs.readFileSync('website/games.json', 'utf8'));

const profiles = [
  { name: 'desktop', viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false },
  { name: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
];

async function safeClickFirst(page, selectors) {
  for (const selector of selectors) {
    const locator = page.locator(selector).first();
    try {
      if (await locator.count()) {
        const box = await locator.boundingBox();
        if (box && box.width > 4 && box.height > 4) {
          await locator.click({ timeout: 1200, force: true });
          return selector;
        }
      }
    } catch {}
  }
  return '';
}

async function audit(game, profile, browser) {
  const context = await browser.newContext(profile);
  const page = await context.newPage();
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  const pathPart = game.directory_path || `games/${game.id}/index.html`;
  const url = new URL(pathPart, BASE).toString();
  let startedBy = '';
  let navOk = false;
  let before = null;
  let after = null;
  let navError = '';
  try {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    navOk = !!response?.ok();
    await page.waitForTimeout(700);
    before = await page.evaluate(() => ({ text: document.body.innerText.slice(0, 500), canvases: document.querySelectorAll('canvas').length }));

    startedBy = await safeClickFirst(page, [
      'button:has-text("Start")', 'button:has-text("Play")', 'button:has-text("Engage")', 'button:has-text("Begin")',
      'button:has-text("Restart")', 'button:has-text("Launch")', 'button', '[role="button"]', 'canvas'
    ]);

    await page.keyboard.press('Space').catch(() => {});
    await page.keyboard.press('ArrowLeft').catch(() => {});
    await page.keyboard.press('ArrowRight').catch(() => {});
    await page.keyboard.press('ArrowUp').catch(() => {});
    if (profile.hasTouch) {
      await page.touchscreen.tap(profile.viewport.width / 2, profile.viewport.height / 2).catch(() => {});
      await page.mouse.move(profile.viewport.width * 0.35, profile.viewport.height * 0.55).catch(() => {});
      await page.mouse.down().catch(() => {});
      await page.mouse.move(profile.viewport.width * 0.65, profile.viewport.height * 0.55, { steps: 8 }).catch(() => {});
      await page.mouse.up().catch(() => {});
    } else {
      await page.mouse.click(profile.viewport.width / 2, profile.viewport.height / 2).catch(() => {});
      await page.mouse.move(profile.viewport.width * 0.7, profile.viewport.height * 0.5).catch(() => {});
    }
    await page.waitForTimeout(700);
    after = await page.evaluate(() => ({ text: document.body.innerText.slice(0, 500), canvases: document.querySelectorAll('canvas').length }));
  } catch (error) {
    navError = error.message;
  }
  await page.close({ runBeforeUnload: false }).catch(() => {});
  await context.close().catch(() => {});
  const criticalErrors = [...pageErrors, ...consoleErrors].filter((msg) => !/favicon|googlesyndication|doubleclick|tailwind/i.test(msg));
  return { profile: profile.name, navOk, navError, startedBy, pageErrors, consoleErrors, criticalErrors, before, after, pass: navOk && criticalErrors.length === 0 };
}

const browser = await chromium.launch({ headless: true });
const results = [];
for (const [index, game] of games.entries()) {
  const checks = [];
  for (const profile of profiles) checks.push(await audit(game, profile, browser));
  const pass = checks.every((c) => c.pass);
  results.push({ index: index + 1, id: game.id, title: game.title, path: game.directory_path, pass, checks });
  console.log(`${String(index + 1).padStart(2, '0')}. ${pass ? 'PASS ' : 'CHECK'} ${game.id} desktop=${checks[0].pass ? 'ok' : 'check'} mobile=${checks[1].pass ? 'ok' : 'check'} start=${checks.map(c=>c.startedBy||'none').join('/')}`);
}
await browser.close();
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), base: BASE, results }, null, 2));
console.log('\nSummary:', { total: results.length, pass: results.filter(r => r.pass).length, needsReview: results.filter(r => !r.pass).length });
console.log(`Wrote ${OUT}`);
