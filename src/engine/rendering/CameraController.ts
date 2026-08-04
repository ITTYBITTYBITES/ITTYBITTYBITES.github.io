/**
 * YearGlass — Camera Controller
 *
 * Smooth zoom transition between the Room view and the Focus Mode (dome
 * centered) view. Handles mobile viewport centering and desktop framing,
 * and tracks a light/intensity value that responds to pointer proximity so
 * the dome subtly "wakes" when the user is near it.
 *
 * Responsive behavior:
 *   - Mobile: dome centered, full-bleed framing.
 *   - Desktop: dome framed at ~45% of the desk area.
 * The camera re-evaluates on resize / orientationchange.
 */

export interface CameraView {
  zoom: number;
  offsetX: number; // in fractional [-1..1]
  offsetY: number;
  focusMode: boolean;
}

const MOBILE_BREAKPOINT = 768;
const IDLE_LIGHT = 0.35;
const ACTIVE_LIGHT = 0.95;

export class CameraController {
  private view: CameraView = { zoom: 1, offsetX: 0, offsetY: 0, focusMode: false };
  private target: CameraView = { ...this.view };
  private light = IDLE_LIGHT;
  private reduced = false;
  private disposed = false;
  private readonly onResize: () => void;

  private readonly viewport: { width: number; height: number } = {
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  };

  constructor() {
    this.refreshViewport();
    this.onResize = () => {
      this.refreshViewport();
      this.computeTargets();
    };
    window.addEventListener('resize', this.onResize, { passive: true });
    window.addEventListener('orientationchange', this.onResize, { passive: true });
  }

  private refreshViewport(): void {
    // Use visual viewport height when available to avoid mobile address-bar
    // layout shifts (dvh / svh fallback handled in CSS).
    if (typeof window !== 'undefined' && window.visualViewport) {
      this.viewport.width = window.visualViewport.width || window.innerWidth;
      this.viewport.height = window.visualViewport.height || window.innerHeight;
    } else {
      this.viewport.width = window.innerWidth;
      this.viewport.height = window.innerHeight;
    }
  }

  private computeTargets(): void {
    const isMobile = this.viewport.width < MOBILE_BREAKPOINT;
    if (isMobile) {
      this.target.zoom = 1.0;
      this.target.offsetX = 0;
      this.target.offsetY = 0;
    } else {
      // Desktop framing: dome at ~45% of the desk area, slightly up.
      this.target.zoom = 1.15;
      this.target.offsetX = 0;
      this.target.offsetY = -0.12;
    }
  }

  /** Recompute the default framing (used at mount). */
  computeDesktop(): void {
    this.refreshViewport();
    this.computeTargets();
  }

  /** Move the camera toward Focus Mode (dome centered). */
  focusOnDome(): void {
    this.target.zoom = 1.65;
    this.target.offsetX = 0;
    this.target.offsetY = 0;
    this.target.focusMode = true;
  }

  /** Return to the default framing. */
  exitFocus(): void {
    this.target.focusMode = false;
    this.computeTargets();
  }

  /** Called each frame; smoothly interpolates toward the target view. */
  update(dt: number): void {
    const k = Math.min(1, dt * 4.5);
    this.view.zoom += (this.target.zoom - this.view.zoom) * k;
    this.view.offsetX += (this.target.offsetX - this.view.offsetX) * k;
    this.view.offsetY += (this.target.offsetY - this.view.offsetY) * k;
    this.view.focusMode = this.target.focusMode;
  }

  /** Pointer-proximity driven lighting (dome wakes near the cursor). */
  setPointer(x: number, y: number): void {
    const dx = x / Math.max(1, this.viewport.width) - 0.5;
    const dy = y / Math.max(1, this.viewport.height) - 0.5;
    const dist = Math.sqrt(dx * dx + dy * dy);
    this.light += (ACTIVE_LIGHT * Math.max(0, 1 - dist * 2) - this.light) * 0.2;
    this.light = Math.max(IDLE_LIGHT, Math.min(ACTIVE_LIGHT, this.light));
  }

  setReducedQuality(reduced: boolean): void {
    this.reduced = reduced;
  }

  get isReduced(): boolean {
    return this.reduced;
  }

  get lightIntensity(): number {
    return this.reduced ? IDLE_LIGHT * 0.7 : this.light;
  }

  get currentView(): CameraView {
    return this.view;
  }

  destroy(): void {
    if (this.disposed) return;
    this.disposed = true;
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('orientationchange', this.onResize);
  }
}
