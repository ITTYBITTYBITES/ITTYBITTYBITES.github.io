/**
 * Liquid Memory Chamber Arrival & Telemetry Shell v1.0
 *
 * Standardized arrival script bundled into kernel-chamber.js.
 * Handles portal arrival marking, chamber departure markers,
 * gesture-driven swipe-to-exit portal navigation back to the Hub,
 * and Legacy-Bridge shell wrapping for older static content.
 */
import { LiquidMemoryTelemetry } from './core/telemetry/LiquidMemoryTelemetry';
import { Registry } from './registry/Registry';

function resolveHomeHref(): string {
  const navHome = document.querySelector('nav a[href*="index.html"]')?.getAttribute('href');
  if (navHome) return navHome;
  const depth = (window.location.pathname.match(/\//g) || []).length;
  if (depth > 2) return '../../index.html';
  if (depth > 1) return '../index.html';
  return './index.html';
}

function injectLegacyBridge(title: string, homeHref: string): void {
  if (document.getElementById('lm-legacy-bridge-header')) return;

  const header = document.createElement('header');
  header.id = 'lm-legacy-bridge-header';
  header.style.cssText =
    'position:sticky;top:0;z-index:9999;background:rgba(0,16,28,0.85);backdrop-filter:blur(12px);border-bottom:1px solid rgba(0,255,255,0.46);padding:12px 24px;display:flex;justify-content:space-between;align-items:center;color:#bfffff;font-family:monospace;box-shadow:0 0 20px rgba(0,255,255,0.15);';
  header.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;">
      <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#00ffff;box-shadow:0 0 10px #00ffff;"></span>
      <strong style="font-size:14px;letter-spacing:1px;text-transform:uppercase;">LM // ARCHIVE VAULT // ${title}</strong>
    </div>
    <div style="display:flex;gap:16px;">
      <a href="${homeHref}" style="color:#00ffff;text-decoration:none;border:1px solid rgba(0,255,255,0.4);padding:6px 12px;border-radius:6px;font-size:12px;font-weight:bold;">&lt;&lt; MASTER PORTAL</a>
    </div>
  `;

  const footer = document.createElement('footer');
  footer.id = 'lm-legacy-bridge-footer';
  footer.style.cssText =
    'margin-top:60px;background:rgba(0,8,16,0.9);border-top:1px solid rgba(0,255,255,0.25);padding:24px;text-align:center;color:#6b8c96;font-family:monospace;font-size:12px;';
  footer.innerHTML = `
    <p>LIQUID MEMORY // LEGACY PUBLICATION VAULT</p>
    <p style="margin-top:8px;"><a href="${homeHref}" style="color:#00ffff;text-decoration:none;">Return to Holographic Hub</a></p>
  `;

  if (document.body) {
    document.body.insertBefore(header, document.body.firstChild);
    document.body.appendChild(footer);
  }
}

function initChamberShell(): void {
  const host = document.querySelector('main[data-gear-id], body[data-gear-id], main[data-kernel-event]') || document.body;
  const gearId = host?.getAttribute('data-gear-id') || 'games';
  const kernelEvent = host?.getAttribute('data-kernel-event') || 'library.game_opened';
  
  // Resolve registry node
  const pathname = window.location.pathname;
  const slug = pathname.split('/').pop()?.replace('.html', '') || '';
  const node = Registry.lookup(slug) || Registry.lookup(kernelEvent) || Registry.lookup(gearId);
  const chamberTitle = node?.title || (gearId === 'archive' ? 'Old Memory Vault' : 'Arcade Genesis');

  const homeHref = resolveHomeHref();

  // If this is legacy static content or an article page, wrap it in Legacy Bridge
  if (node?.isLegacyStatic || pathname.includes('/articles/') || document.body?.classList.contains('legacy-article')) {
    injectLegacyBridge(chamberTitle, homeHref);
  }

  // Mark portal arrival
  LiquidMemoryTelemetry.markPortalArrival(chamberTitle);

  // Bind departure telemetry
  const storeDeparture = (reason: string) => {
    LiquidMemoryTelemetry.storeChamberDeparture(chamberTitle, kernelEvent, pathname, reason);
  };

  window.addEventListener('pagehide', () => storeDeparture('pagehide'), { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') storeDeparture('visibility-hidden');
  }, { passive: true });

  // Bind swipe-to-exit gesture
  let pointerId: number | null = null;
  let startX = 0;
  let startY = 0;
  let deltaX = 0;
  let deltaY = 0;

  const onPointerDown = (e: PointerEvent) => {
    if (pointerId !== null || e.button > 0 || e.pointerType !== 'touch') return;
    pointerId = e.pointerId;
    startX = e.clientX;
    startY = e.clientY;
    deltaX = 0;
    deltaY = 0;
  };

  const onPointerMove = (e: PointerEvent) => {
    if (pointerId !== e.pointerId) return;
    deltaX = e.clientX - startX;
    deltaY = e.clientY - startY;
  };

  const onPointerUp = (e: PointerEvent) => {
    if (pointerId !== e.pointerId) return;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    pointerId = null;
    if (absX >= 70 && absX > absY * 1.2) {
      storeDeparture('portal-swipe-exit');
      window.location.assign(homeHref);
    }
  };

  document.addEventListener('pointerdown', onPointerDown, { passive: true });
  document.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('pointerup', onPointerUp, { passive: true });
  document.addEventListener('pointercancel', () => { pointerId = null; }, { passive: true });

  (window as any).LiquidMemoryChamber = {
    version: '1.0.0',
    telemetry: LiquidMemoryTelemetry,
    registry: Registry,
  };
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initChamberShell);
else initChamberShell();
