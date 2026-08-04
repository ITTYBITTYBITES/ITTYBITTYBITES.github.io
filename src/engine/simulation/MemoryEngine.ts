/**
 * YearGlass — Event-Sourced Memory Engine
 *
 * Tracks sanctuary "memories" (journal entries, ecosystem changes, creature
 * visits, growth milestones) as an ordered event log. Every event is appended
 * to memory and persisted through the SaveEngine (IndexedDB). Events are
 * reduced into summaries on demand and can be replayed after a reload so the
 * world feels continuous.
 */

import { SaveEngine } from '../storage/SaveEngine';

export type MemoryEventType =
  | 'first-launch'
  | 'creature-visit'
  | 'growth-milestone'
  | 'journal'
  | 'weather-change'
  | 'focus-complete';

export interface MemoryEvent {
  id: string;
  type: MemoryEventType;
  at: number; // epoch ms
  day: number; // sanctuary day number
  message: string;
  meta?: Record<string, unknown>;
}

const LOG_KEY = 'memory-log';
const STATE_KEY = 'memory-state';

interface MemoryState {
  day: number;
  lastSave: number;
}

export class MemoryEngine {
  private readonly events: MemoryEvent[] = [];
  private readonly save: SaveEngine;
  private state: MemoryState = { day: 1, lastSave: 0 };
  private ready = false;

  constructor(save: SaveEngine) {
    this.save = save;
  }

  async init(): Promise<void> {
    const [log, state] = await Promise.all([
      this.save.get<MemoryEvent[]>(LOG_KEY),
      this.save.get<MemoryState>(STATE_KEY),
    ]);
    if (Array.isArray(log)) this.events.push(...log);
    if (state) this.state = { ...this.state, ...state };
    this.ready = true;
  }

  async record(
    type: MemoryEventType,
    message: string,
    meta?: Record<string, unknown>
  ): Promise<MemoryEvent> {
    const event: MemoryEvent = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      at: Date.now(),
      day: this.state.day,
      message,
      meta,
    };
    this.events.push(event);
    this.state.lastSave = Date.now();
    await this.save.put(LOG_KEY, this.events);
    await this.save.put(STATE_KEY, this.state);
    return event;
  }

  /** Advance the sanctuary day and persist the milestone. */
  async advanceDay(): Promise<void> {
    this.state.day += 1;
    this.state.lastSave = Date.now();
    await this.save.put(STATE_KEY, this.state);
  }

  get currentDay(): number {
    return this.state.day;
  }

  get isReady(): boolean {
    return this.ready;
  }

  allEvents(): MemoryEvent[] {
    return [...this.events];
  }

  eventsByType(type: MemoryEventType): MemoryEvent[] {
    return this.events.filter((e) => e.type === type);
  }

  recent(count = 10): MemoryEvent[] {
    return this.events.slice(-count).reverse();
  }

  /** Reduce the event log into a lightweight narrative summary. */
  summarize(): string {
    const total = this.events.length;
    const creatures = this.eventsByType('creature-visit').length;
    const milestones = this.eventsByType('growth-milestone').length;
    const journals = this.eventsByType('journal').length;
    const parts = [
      `${this.state.day} day${this.state.day === 1 ? '' : 's'} in the sanctuary`,
      `${total} memory${total === 1 ? '' : 'ies'}`,
      `${milestones} growth milestone${milestones === 1 ? '' : 's'}`,
    ];
    if (creatures > 0) parts.push(`${creatures} creature visit${creatures === 1 ? '' : 's'}`);
    if (journals > 0) parts.push(`${journals} journal entr${journals === 1 ? 'y' : 'ies'}`);
    return parts.join(' · ');
  }

  /**
   * Rebuild in-memory aggregates after a reload so event listeners can be
   * re-attached without data loss.
   */
  replay(callback: (event: MemoryEvent) => void): void {
    for (const event of this.events) {
      callback(event);
    }
  }

  async clear(): Promise<void> {
    this.events.length = 0;
    this.state = { day: 1, lastSave: 0 };
    await this.save.put(LOG_KEY, this.events);
    await this.save.put(STATE_KEY, this.state);
  }
}
