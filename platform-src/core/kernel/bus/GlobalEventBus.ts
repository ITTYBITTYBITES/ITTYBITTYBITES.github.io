import { EventContract } from '../types/EventContract';

type EventListener = (event: EventContract) => void;

export class GlobalEventBus {
  private static instance: GlobalEventBus;
  private listeners: EventListener[] = [];
  private processedEventIds: Set<string> = new Set();

  private constructor() {}

  static getInstance(): GlobalEventBus {
    if (!GlobalEventBus.instance) {
      GlobalEventBus.instance = new GlobalEventBus();
    }
    return GlobalEventBus.instance;
  }

  emit(event: EventContract): boolean {
    // Idempotency guard at bus level (defense in depth)
    if (this.processedEventIds.has(event.eventId)) {
      return false;
    }
    this.processedEventIds.add(event.eventId);

    // Notify all listeners (Reducer + Bridge will subscribe)
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('[EventBus] Listener error:', err);
      }
    });

    return true;
  }

  subscribe(listener: EventListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  // For testing / reset
  reset(): void {
    this.listeners = [];
    this.processedEventIds.clear();
  }
}
