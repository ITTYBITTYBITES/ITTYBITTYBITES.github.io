import { PlatformState } from '../state/PlatformState';
import { EventContract } from '../types/EventContract';
import { reduce } from '../reducer/PlatformReducer';

const STORAGE_KEY_STATE = 'platform_state';
const STORAGE_KEY_EVENT_LOG = 'platform_event_log';

export class PlatformPersistor {
  private eventLog: EventContract[] = [];

  /**
   * Saves the current state snapshot to localStorage.
   * Also persists the current event log.
   */
  save(state: PlatformState): void {
    try {
      // Save current state snapshot
      const stateToSave = {
        ...state,
        // Convert Set to array for JSON serialization
        processedEventIds: Array.from(state.processedEventIds),
      };
      localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(stateToSave));

      // Save event log
      localStorage.setItem(STORAGE_KEY_EVENT_LOG, JSON.stringify(this.eventLog));

      console.log('[Persistor] State and event log saved to localStorage');
    } catch (err) {
      console.error('[Persistor] Failed to save state:', err);
    }
  }

  /**
   * Loads the last saved state snapshot (if available).
   */
  load(): PlatformState | null {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY_STATE);
      if (!savedState) return null;

      const parsed = JSON.parse(savedState);

      // Restore Set from array
      parsed.processedEventIds = new Set(parsed.processedEventIds || []);

      console.log('[Persistor] Loaded state snapshot from localStorage');
      return parsed as PlatformState;
    } catch (err) {
      console.error('[Persistor] Failed to load state:', err);
      return null;
    }
  }

  /**
   * Appends a validated event to the in-memory event log.
   * This should only be called for events that passed the reducer.
   */
  logEvent(event: EventContract): void {
    this.eventLog.push(event);
  }

  /**
   * Rehydrates the full state by replaying every event in the log
   * through the pure PlatformReducer.
   */
  rehydrate(): PlatformState | null {
    try {
      const savedLog = localStorage.getItem(STORAGE_KEY_EVENT_LOG);
      if (!savedLog) return null;

      const events: EventContract[] = JSON.parse(savedLog);
      if (events.length === 0) return null;

      console.log(`[Persistor] Rehydrating from ${events.length} events...`);

      // Start from initial state and fold all events
      let state = reduce(undefined as any, events[0]); // first event

      for (let i = 1; i < events.length; i++) {
        state = reduce(state, events[i]);
      }

      // Restore the event log in memory
      this.eventLog = [...events];

      console.log('[Persistor] Rehydration complete');
      return state;
    } catch (err) {
      console.error('[Persistor] Rehydration failed:', err);
      return null;
    }
  }

  /**
   * Clears all persisted data (useful for testing/reset)
   */
  clear(): void {
    localStorage.removeItem(STORAGE_KEY_STATE);
    localStorage.removeItem(STORAGE_KEY_EVENT_LOG);
    this.eventLog = [];
    console.log('[Persistor] All persisted data cleared');
  }

  /**
   * Returns the current event log (for debugging / export)
   */
  getEventLog(): EventContract[] {
    return [...this.eventLog];
  }
}
