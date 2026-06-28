import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://127.0.0.1:8765/website/';
const REGISTRY = 'website/games.json';
const OUT = 'docs/qa-game-boot-results.json';
const games = JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));

function classify(result) {
  if (result.httpStatus === 404) return { color: 'Red', status: 'Fix Needed', issue: 'LOAD-404' };
  if (!result.httpOk) return { color: 'Red', status: 'Fix Needed', issue: `LOAD-${result.httpStatus || 'NAV'}` };
  if (result.pageErrors.length) return { color: 'Red', status: 'Fix Needed', issue: 'LOAD-JS' };
  const criticalConsole = result.consoleErrors.filter((msg) => /\b(TypeError|ReferenceError|SyntaxError|Uncaught|is not defined|Cannot read|Cannot set|Failed to load resource.*404)\b/i.test(msg));
  if (criticalConsole.length) return { color: 'Red', status: 'Fix Needed', issue: 'LOAD-JS' };
  const nonCriticalWarnings = result.consoleWarnings.filter((msg) => /cdn\.tailwindcss\.com should not be used in production/i.test(msg));
  if (result.consoleErrors.length || result.consoleWarnings.length !== nonCriticalWarnings.length) return { color: 'Yellow', status: 'Pass', issue: '' };
  return { color: 'Green', status: 'Pass', issue: '' };
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const results = [];

for (const [index, game] of games.entries()) {
  const url = new URL(game.directory_path || `games/${game.id}/index.html`, BASE).toString();
  const page = await context.newPage();
  const pageErrors = [];
  const consoleErrors = [];
  const consoleWarnings = [];
  const failedRequests = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (msg) => {
    const text = msg.text();
    if (msg.type() === 'error') consoleErrors.push(text);
    if (msg.type() === 'warning') consoleWarnings.push(text);
  });
  page.on('requestfailed', (request) => {
    const failure = request.failure()?.errorText || 'request failed';
    const reqUrl = request.url();
    if (!/googletagmanager|googlesyndication|doubleclick|adservice|analytics/i.test(reqUrl)) {
      failedRequests.push(`${failure}: ${reqUrl}`);
    }
  });

  let httpStatus = null;
  let httpOk = false;
  let navError = '';
  let hasCanvas = false;
  let hasBodyText = false;
  try {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 8000 });
    httpStatus = response?.status() || null;
    httpOk = !!response?.ok();
    await page.waitForTimeout(1600);
    hasCanvas = await page.locator('canvas').count().then((count) => count > 0).catch(() => false);
    hasBodyText = await page.evaluate(() => (document.body?.innerText || '').trim().length > 0).catch(() => false);
  } catch (error) {
    navError = error.message;
  }

  const result = {
    index: index + 1,
    id: game.id,
    title: game.title,
    path: game.directory_path || `games/${game.id}/index.html`,
    url,
    httpStatus,
    httpOk,
    navError,
    pageErrors: [...new Set(pageErrors)].slice(0, 6),
    consoleErrors: [...new Set(consoleErrors)].slice(0, 8),
    consoleWarnings: [...new Set(consoleWarnings)].slice(0, 8),
    failedRequests: [...new Set(failedRequests)].slice(0, 6),
    hasCanvas,
    hasBodyText,
  };
  Object.assign(result, classify(result));
  results.push(result);
  console.log(`${String(index + 1).padStart(2, '0')}. ${result.color.padEnd(6)} ${game.id} HTTP=${httpStatus || 'ERR'} errors=${result.pageErrors.length + result.consoleErrors.length}`);
  await page.close();
}

await browser.close();

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), base: BASE, results }, null, 2));

const summary = results.reduce((acc, r) => { acc[r.color] = (acc[r.color] || 0) + 1; return acc; }, {});
console.log('\nSummary:', summary);
console.log(`Wrote ${OUT}`);
