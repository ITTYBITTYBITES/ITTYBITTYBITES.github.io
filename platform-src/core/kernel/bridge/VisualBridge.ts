import { EventContract } from '../types/EventContract';
import { PlatformState } from '../state/PlatformState';
import { reduce } from '../reducer/PlatformReducer';

type StateChangeListener = (state: PlatformState) => void;

export class VisualBridge {
  private listeners: StateChangeListener[] = [];
  private currentState: PlatformState;

  constructor(initialState: PlatformState) {
    this.currentState = initialState;
  }

  // Called by the Reducer pipeline
  onStateUpdated(newState: PlatformState): void {
    this.currentState = newState;
    this.notifyListeners();
  }

  subscribe(listener: StateChangeListener): () => void {
    this.listeners.push(listener);
    // Immediately send current state
    listener(this.currentState);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentState);
      } catch (err) {
        console.error('[VisualBridge] Listener error:', err);
      }
    });
  }

  getCurrentState(): PlatformState {
    return this.currentState;
  }
}
