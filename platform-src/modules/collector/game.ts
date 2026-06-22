import { GlobalEventBus } from '../../core/kernel/bus/GlobalEventBus';
import { GamePlugin } from '../types/GamePlugin';
import { createResourceGainedEvent } from './mappers';

export class ResourceCollector implements GamePlugin {
  readonly id = 'resource-collector';
  readonly source = 'resource-collector';

  private bus!: GlobalEventBus;
  private resources: Record<string, number> = {
    wood: 0,
    stone: 0,
    gold: 0,
  };
  private intervalId: number | null = null;

  initialize(bus: GlobalEventBus): void {
    this.bus = bus;
    console.log(`[ResourceCollector] Initialized`);
  }

  // === Game Actions ===

  collect(resource: 'wood' | 'stone' | 'gold', amount: number = 1): void {
    this.resources[resource] = (this.resources[resource] || 0) + amount;

    // Map internal state change to a platform event
    const event = createResourceGainedEvent(resource, amount);
    this.bus.emit(event);

    console.log(`[ResourceCollector] Collected ${amount} ${resource}`);
  }

  // === Lifecycle Management ===

  onStart(): void {
    if (this.intervalId) return;

    // Auto-collect wood every 2 seconds (demo idle behavior)
    this.intervalId = window.setInterval(() => {
      this.collect('wood', 1);
    }, 2000);

    console.log('[ResourceCollector] Collection loop started');
  }

  onPause(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[ResourceCollector] Collection loop paused');
    }
  }

  destroy(): void {
    this.onPause();
    console.log('[ResourceCollector] Destroyed');
  }

  // Debug helper
  getInternalResources() {
    return { ...this.resources };
  }
}
