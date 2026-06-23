import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://127.0.0.1:8765/website/';
const games = JSON.parse(fs.readFileSync('website/games.json', 'utf8'));
const OUT = 'docs/qa-game-responsive-results.json';

const profiles = [
  { name: 'desktop-1280x800', viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false },
  { name: 'mobile-390x844', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
];

function summarizeLayout(layout) {
  const issues = [];
  if (layout.bodyScrollWidth > layout.innerWidth + 4) issues.push('horizontal-overflow');
  if (layout.bodyScrollHeight > layout.innerHeight * 2.8) issues.push('excessive-vertical-scroll');
  if (layout.canvasCount > 0 && !layout.anyCanvasVisible) issues.push('canvas-not-visible');
  if (!layout.hasVisibleContent) issues.push('no-visible-content');
  return issues;
}

async function auditProfile(browser, profile, game) {
  const context = await browser.newContext(profile);
  const page = await context.newPage();
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

  const url = new URL(game.directory_path || `games/${game.id}/index.html`, BASE).toString();
  let httpStatus = null;
  let httpOk = false;
  let navError = '';
  let layout = null;
  try {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    httpStatus = response?.status() || null;
    httpOk = !!response?.ok();
    await page.waitForTimeout(1000);

    // Generic low-risk interaction probe: click/tap center, send common keys.
    await page.mouse.click(profile.viewport.width / 2, profile.viewport.height / 2).catch(() => {});
    await page.keyboard.press('Space').catch(() => {});
    await page.keyboard.press('ArrowLeft').catch(() => {});
    await page.keyboard.press('ArrowRight').catch(() => {});
    await page.waitForTimeout(600);

    layout = await page.evaluate(() => {
      const canvases = [...document.querySelectorAll('canvas')].map((canvas) => {
        const r = canvas.getBoundingClientRect();
        return { width: r.width, height: r.height, left: r.left, top: r.top, visible: r.width > 20 && r.height > 20 && r.bottom > 0 && r.right > 0 && r.left < innerWidth && r.top < innerHeight };
      });
      const visibleContent = [...document.body.querySelectorAll('*')].some((el) => {
        const r = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        return r.width > 20 && r.height > 20 && r.bottom > 0 && r.right > 0 && r.left < innerWidth && r.top < innerHeight && style.visibility !== 'hidden' && style.display !== 'none';
      });
      return {
        innerWidth,
        innerHeight,
        bodyScrollWidth: document.documentElement.scrollWidth,
        bodyScrollHeight: document.documentElement.scrollHeight,
        canvasCount: canvases.length,
        anyCanvasVisible: canvases.some(c => c.visible),
        canvases,
        hasVisibleContent: visibleContent,
      };
    });
  } catch (err) {
    navError = err.message;
  }
  await context.close();

  const layoutIssues = layout ? summarizeLayout(layout) : ['no-layout-captured'];
  return { profile: profile.name, url, httpStatus, httpOk, navError, pageErrors: [...new Set(pageErrors)], consoleErrors: [...new Set(consoleErrors)], layout, layoutIssues };
}

const browser = await chromium.launch({ headless: true });
const results = [];
for (const [index, game] of games.entries()) {
  const profileResults = [];
  for (const profile of profiles) profileResults.push(await auditProfile(browser, profile, game));
  const critical = profileResults.flatMap(r => [...r.pageErrors, ...r.consoleErrors, ...r.layoutIssues.filter(i => !['excessive-vertical-scroll'].includes(i))]);
  const responsivePass = profileResults.every(r => r.httpOk && r.layoutIssues.length === 0 && r.pageErrors.length === 0 && r.consoleErrors.length === 0);
  const mobileBootPass = profileResults.find(r => r.profile.startsWith('mobile'))?.httpOk && !profileResults.find(r => r.profile.startsWith('mobile'))?.pageErrors.length;
  results.push({ index: index + 1, id: game.id, title: game.title, path: game.directory_path, responsivePass, mobileBootPass, criticalCount: critical.length, profiles: profileResults });
  console.log(`${String(index + 1).padStart(2, '0')}. ${game.id} responsive=${responsivePass ? 'PASS' : 'CHECK'} mobileBoot=${mobileBootPass ? 'PASS' : 'CHECK'} critical=${critical.length}`);
}
await browser.close();

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), base: BASE, profiles: profiles.map(p => p.name), results }, null, 2));
const summary = {
  total: results.length,
  responsivePass: results.filter(r => r.responsivePass).length,
  mobileBootPass: results.filter(r => r.mobileBootPass).length,
  needsReview: results.filter(r => !r.responsivePass || !r.mobileBootPass).length,
};
console.log('\nSummary:', summary);
console.log(`Wrote ${OUT}`);
