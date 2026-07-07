/**
 * Internal event bus for decoupled platform and experience communication.
 */

export type PlatformEventName =
  | 'experience_opened'
  | 'experience_started'
  | 'experience_completed'
  | 'project_viewed'
  | 'search_used'
  | 'download_started'
  | string;

export interface PlatformEventDetail {
  [key: string]: unknown;
}

class PlatformEventBus extends EventTarget {
  /**
   * Emit an internal event. Any listener and the analytics service can observe it.
   */
  emit(name: PlatformEventName, detail: PlatformEventDetail = {}): void {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: false }));
  }

  /** Subscribe to an internal event. */
  on(name: PlatformEventName, handler: (event: CustomEvent<PlatformEventDetail>) => void): void {
    this.addEventListener(name, handler as EventListener);
  }

  /** Unsubscribe from an internal event. */
  off(name: PlatformEventName, handler: (event: CustomEvent<PlatformEventDetail>) => void): void {
    this.removeEventListener(name, handler as EventListener);
  }
}

export const events = new PlatformEventBus();
