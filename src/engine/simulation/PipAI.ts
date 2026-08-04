/**
 * YearGlass — Pip AI (creature companion)
 *
 * A simple finite state machine for Pip the ladybug. Pip wanders, rests near
 * plants, and reacts when the user is present (measured via a `presence`
 * flag updated by interaction). State transitions emit observable events so
 * the memory engine can record visits.
 */

export type PipState = 'wandering' | 'resting' | 'curious' | 'hidden';

export interface PipObservation {
  x: number;
  y: number;
  state: PipState;
  visited: number;
}

export class PipAI {
  private state: PipState = 'wandering';
  private x = 0.5;
  private y = 0.5;
  private wanderTarget = { x: 0.5, y: 0.5 };
  private stateTimer = 0;
  private visited = 0;
  private presence = false;
  private onVisit: (() => void) | null = null;

  constructor() {
    this.pickWanderTarget();
  }

  setOnVisit(cb: () => void): void {
    this.onVisit = cb;
  }

  setPresence(present: boolean): void {
    this.presence = present;
  }

  /** Advance Pip by `dt` seconds. */
  update(dt: number): void {
    this.stateTimer -= dt;
    if (this.stateTimer <= 0) this.transition();

    const speed = this.presence ? 0.35 : 0.18;
    const dx = this.wanderTarget.x - this.x;
    const dy = this.wanderTarget.y - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 0.01) {
      this.pickWanderTarget();
    } else {
      const step = Math.min(dist, speed * dt);
      this.x += (dx / dist) * step;
      this.y += (dy / dist) * step;
    }
  }

  private transition(): void {
    const roll = Math.random();
    if (this.presence && roll < 0.4) {
      this.state = 'curious';
      this.stateTimer = 2 + Math.random() * 2;
    } else if (roll < 0.75) {
      this.state = 'resting';
      this.stateTimer = 3 + Math.random() * 4;
    } else {
      this.state = 'wandering';
      this.stateTimer = 2 + Math.random() * 3;
      this.pickWanderTarget();
    }
    if (this.state === 'curious' && this.onVisit) {
      this.visited += 1;
      this.onVisit();
    }
  }

  private pickWanderTarget(): void {
    this.wanderTarget = { x: 0.2 + Math.random() * 0.6, y: 0.2 + Math.random() * 0.6 };
  }

  /** Occasionally hide near the glass (visual variety). */
  hide(): void {
    this.state = 'hidden';
    this.stateTimer = 4;
  }

  get observation(): PipObservation {
    return { x: this.x, y: this.y, state: this.state, visited: this.visited };
  }
}
