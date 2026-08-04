/**
 * Mobile viewport stabilization.
 *
 * Fixes 100vh clipping on mobile browsers (address-bar layout shifts) by:
 *   - exposing a CSS custom property `--vh` (and `--svh`/`--dvh`) reflecting
 *     the dynamic viewport height on every resize/orientationchange, and
 *   - listening to the visual viewport when available.
 *
 * Call `initViewportStabilizer()` once from the platform entry. It returns a
 * dispose function for cleanup.
 */

function setCssVar(name: string, value: number): void {
  document.documentElement.style.setProperty(name, `${value}px`);
}

function measure(): void {
  const w = window.innerWidth || document.documentElement.clientWidth || 1;
  let h = window.innerHeight;
  if (window.visualViewport && window.visualViewport.height > 0) {
    h = window.visualViewport.height;
  }
  const sH = h;
  const dH = Math.max(h, document.documentElement.clientHeight || h);
  setCssVar('--vh', h * 0.01);
  setCssVar('--svh', sH * 0.01);
  setCssVar('--dvh', dH * 0.01);
  setCssVar('--viewport-width', w);
  setCssVar('--viewport-height', h);
}

export function initViewportStabilizer(): () => void {
  if (typeof window === 'undefined') return () => undefined;

  let rafPending = false;
  const schedule = () => {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;
      measure();
    });
  };

  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('orientationchange', schedule, { passive: true });
  window.addEventListener('scroll', schedule, { passive: true, capture: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', schedule);
    window.visualViewport.addEventListener('scroll', schedule);
  }

  measure();

  return () => {
    window.removeEventListener('resize', schedule);
    window.removeEventListener('orientationchange', schedule);
    window.removeEventListener('scroll', schedule, { capture: true } as EventListenerOptions);
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', schedule);
      window.visualViewport.removeEventListener('scroll', schedule);
    }
  };
}
