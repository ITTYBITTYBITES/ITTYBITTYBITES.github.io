/**
 * YearGlass — Render Pipeline
 *
 * Runs the requestAnimationFrame loop at 60 FPS while the user is active,
 * then reactively throttles down to ~12 FPS after `IDLE_THROTTLE_MS` of no
 * interaction to save battery / reduce heat. Any user gesture restores 60 FPS.
 * Textures and event listeners are released on destroy() to avoid leaks.
 */

import { TerrariumScene } from './TerrariumScene';
import { CameraController } from './CameraController';

const HIGH_FPS = 1000 / 60;
const IDLE_FPS = 1000 / 12;
const IDLE_THROTTLE_MS = 30_000;

type FrameCallback = (dtSeconds: number) => void;

export class RenderPipeline {
  private readonly scene: TerrariumScene;
  private readonly camera: CameraController;
  private readonly onFrame: FrameCallback;

  private rafId = 0;
  private throttleId = 0;
  private lastFrame = 0;
  private lastInteraction = 0;
  private running = false;
  private disposed = false;
  private idle = false;
  private readonly listeners: Array<() => void> = [];

  private readonly onPointer = (ev: Event) => {
    this.lastInteraction = performance.now();
    if (this.idle) this.setIdle(false);

    // Feed pointer/touch position into the camera so the dome lighting
    // wakes up near the cursor.
    const point = RenderPipeline.eventPoint(ev);
    if (point) this.camera.setPointer(point.x, point.y);
  };

  /** Extract client coordinates from pointer, mouse, touch, or wheel events. */
  private static eventPoint(ev: Event): { x: number; y: number } | null {
    const mouse = ev as Partial<MouseEvent>;
    if (typeof mouse.clientX === 'number' && typeof mouse.clientY === 'number') {
      return { x: mouse.clientX, y: mouse.clientY };
    }
    const touch = ev as TouchEvent;
    if (typeof TouchEvent !== 'undefined' && ev instanceof TouchEvent && touch.touches.length > 0) {
      const first = touch.touches[0];
      return { x: first.clientX, y: first.clientY };
    }
    return null;
  }

  constructor(
    container: HTMLElement,
    camera: CameraController,
    onFrame: FrameCallback
  ) {
    this.scene = new TerrariumScene(container);
    this.camera = camera;
    this.onFrame = onFrame;
    this.lastInteraction = performance.now();
  }

  start(): void {
    if (this.running) return;
    this.running = true;

    const gestureTarget = this.scene.domElement;
    const register = (target: EventTarget, type: string) => {
      target.addEventListener(type, this.onPointer, { passive: true });
      this.listeners.push(() => target.removeEventListener(type, this.onPointer));
    };
    register(gestureTarget, 'pointerdown');
    register(gestureTarget, 'pointermove');
    register(gestureTarget, 'touchstart');
    register(gestureTarget, 'wheel');

    this.lastFrame = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  private readonly tick = (now: number): void => {
    if (this.disposed || !this.running) return;

    const idleSince = now - this.lastInteraction;
    if (idleSince > IDLE_THROTTLE_MS && !this.idle) this.setIdle(true);

    const dt = Math.min(0.1, (now - this.lastFrame) / 1000);
    this.lastFrame = now;

    this.camera.update(dt);
    this.scene.update(dt, this.camera.lightIntensity);
    this.onFrame(dt);

    const frameMs = this.idle ? IDLE_FPS : HIGH_FPS;
    this.throttleId = window.setTimeout(() => {
      this.throttleId = 0;
      if (this.disposed || !this.running) return;
      this.rafId = requestAnimationFrame(this.tick);
    }, Math.max(0, frameMs - (performance.now() - now)));
  };

  private setIdle(idle: boolean): void {
    this.idle = idle;
    if (idle) {
      this.camera.setReducedQuality(true);
    } else {
      this.camera.setReducedQuality(false);
      this.lastInteraction = performance.now();
    }
  }

  get isIdle(): boolean {
    return this.idle;
  }

  /** Force the pipeline back to full FPS (e.g. on intro dismiss). */
  wake(): void {
    this.lastInteraction = performance.now();
    if (this.idle) this.setIdle(false);
  }

  destroy(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.running = false;
    cancelAnimationFrame(this.rafId);
    // The FPS throttle is a setTimeout — cancelAnimationFrame cannot cancel
    // it, so it needs its own clear or the loop resurrects after teardown.
    if (this.throttleId) {
      window.clearTimeout(this.throttleId);
      this.throttleId = 0;
    }
    for (const remove of this.listeners) {
      try {
        remove();
      } catch {
        /* ignore */
      }
    }
    this.listeners.length = 0;
    this.scene.destroy();
  }
}
