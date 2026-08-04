/**
 * YearGlass — Simulation Engine
 *
 * Owns the full sanctuary loop: growth, creature AI, memory/event sourcing,
 * and persistence. It mounts the render pipeline (WebGL2 glass + camera +
 * scene) into a container, drives per-frame updates, and tears everything
 * down on destroy() to avoid leaks.
 */

import { AudioEngine } from '../audio/AudioEngine';
import { RenderPipeline } from '../rendering/RenderPipeline';
import { CameraController } from '../rendering/CameraController';
import { RoomScene } from '../rendering/RoomScene';
import { SaveEngine } from '../storage/SaveEngine';
import { MemoryEngine } from './MemoryEngine';
import { GrowthSystem } from './GrowthSystem';
import { PipAI } from './PipAI';

const DAY_MS = 90_000; // simulate one sanctuary day every 90s of wall time

export interface SimulationHooks {
  onMemory?: (message: string) => void;
  onReady?: () => void;
  onPipObserved?: (visited: number) => void;
}

export class SimulationEngine {
  private readonly audio = new AudioEngine();
  private readonly save = new SaveEngine();
  private readonly memory = new MemoryEngine(this.save);
  private readonly growth = new GrowthSystem();
  private readonly pip = new PipAI();
  private readonly camera = new CameraController();
  private room: RoomScene | null = null;
  private pipeline: RenderPipeline | null = null;

  private readonly hooks: SimulationHooks;
  private readonly clock = { dayStart: Date.now(), lampOn: true };
  private started = false;
  private destroyed = false;

  constructor(hooks: SimulationHooks = {}) {
    this.hooks = hooks;
    this.pip.setOnVisit(() => {
      const visits = this.pip.observation.visited;
      void this.memory.record('creature-visit', 'Pip came to say hello.').then((ev) => {
        this.hooks.onMemory?.(ev.message);
        this.hooks.onPipObserved?.(visits);
      });
    });
  }

  /** Bootstrap: seed the world, wire memory, then begin rendering. */
  async mount(container: HTMLElement): Promise<void> {
    if (this.started) return;
    this.started = true;

    // Storage init can fail (private mode, blocked IDB); the sanctuary must
    // still run on in-memory state, so never let this reject the mount.
    try {
      await this.memory.init();
    } catch (err) {
      console.warn('[YearGlass] memory init failed — continuing in-memory:', err);
    }
    this.seedWorld();

    this.room = new RoomScene(container);
    this.room.setLamp(this.clock.lampOn);
    this.room.setTimeOfDay(7.5);
    this.memory.replay((ev) => {
      if (ev.type === 'growth-milestone') this.hooks.onMemory?.(ev.message);
    });

    this.camera.computeDesktop();

    this.pipeline = new RenderPipeline(container, this.camera, (dt) => {
      this.frame(dt);
    });
    this.pipeline.start();

    // AudioContext creation/resume only happens inside a genuine user
    // gesture (autoplay policy); the gesture callback also starts the
    // ambient bed. Calling unlock() here — outside a gesture — gets blocked.
    this.audio.installGestureUnlock();

    const firstDay = this.memory.currentDay;
    void this.memory
      .record('first-launch', `Day ${firstDay}: the sanctuary began.`)
      .then((ev) => this.hooks.onMemory?.(ev.message));
    this.hooks.onReady?.();
  }

  private seedWorld(): void {
    // Seed a few plants if this is a fresh sanctuary.
    if (this.memory.isReady && this.memory.allEvents().length === 0) {
      this.growth.addPlant('moss', 0.35, 0.6);
      this.growth.addPlant('fern', 0.55, 0.68);
      this.growth.addPlant('orchid', 0.5, 0.52);
      this.growth.addPlant('vine', 0.68, 0.6);
    } else if (this.growth.plantCount() === 0) {
      // Restore a baseline after reload so the dome is never empty.
      this.growth.addPlant('moss', 0.35, 0.6);
      this.growth.addPlant('orchid', 0.5, 0.52);
    }
  }

  private readonly frame = (dt: number): void => {
    if (this.destroyed) return;

    this.pip.setPresence(true); // pipeline wakes on interaction
    this.pip.update(dt);

    const elapsed = Date.now() - this.clock.dayStart;
    if (elapsed >= DAY_MS) {
      this.clock.dayStart = Date.now();
      void this.advanceDay();
    }
  };

  private async advanceDay(): Promise<void> {
    const milestones = this.growth.tickDay();
    for (const m of milestones) {
      const species = m.species;
      await this.memory.record(
        'growth-milestone',
        `The ${species} reached a new stage of growth.`,
        { species, growth: m.growth }
      );
    }
    const day = this.memory.currentDay;
    this.hooks.onMemory?.(`The sanctuary enters day ${day + 1}.`);
    await this.memory.advanceDay();
  }

  /** User tapped the dome: focus the camera + play a shimmer. */
  focusDome(): void {
    this.camera.focusOnDome();
    this.pipeline?.wake();
    this.audio.play('shimmer');
  }

  exitFocus(): void {
    this.camera.exitFocus();
  }

  /** Public accessors for diagnostics / UI. */
  getMemorySummary(): string {
    return this.memory.summarize();
  }

  getPip(): { x: number; y: number; state: string; visited: number } {
    return { ...this.pip.observation, state: this.pip.observation.state };
  }

  getDay(): number {
    return this.memory.currentDay;
  }

  setLamp(on: boolean): void {
    this.clock.lampOn = on;
    this.room?.setLamp(on);
  }

  async destroy(): Promise<void> {
    if (this.destroyed) return;
    this.destroyed = true;
    this.audio.destroy();
    this.pipeline?.destroy();
    this.room?.destroy();
    this.camera.destroy();
    this.save.close();
  }
}
