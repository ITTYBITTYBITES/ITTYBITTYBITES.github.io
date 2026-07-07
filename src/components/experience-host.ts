import { analytics } from '../platform/analytics';
import { events } from '../platform/events';
import { getExperienceById, loadExperience, getExperiencesInCollection } from '../platform/registry';
import { startSession, endSession, recordInteraction, markExperienceCompleted, updateCollectionProgress, checkCollectionCompletion } from '../platform/lifecycle';
import type { ExperienceContext, ExperienceModule } from '../platform/types';

/**
 * Mounts and safely tears down an experience module.
 *
 * Usage:
 *   <experience-host data-id="counter" ></experience-host>
 */
export class ExperienceHost extends HTMLElement {
  private cleanup?: (() => void) | undefined;
  private sessionStarted = false;

  async connectedCallback(): Promise<void> {
    const id = this.dataset.id;
    if (!id) {
      this.renderError('Missing experience id.');
      return;
    }

    const entry = getExperienceById(id);
    if (!entry) {
      this.renderError(`Experience "${id}" not found.`);
      return;
    }

    let mod: ExperienceModule;
    try {
      mod = await loadExperience(entry);
    } catch (error) {
      this.renderError(`Failed to load experience "${id}".`);
      // eslint-disable-next-line no-console
      console.error(error);
      return;
    }

    const query = new URLSearchParams(this.dataset.query ?? '');
    const context: ExperienceContext = {
      meta: entry,
      params: { id },
      query,
      analytics,
    };

    // Start session tracking
    startSession(entry.id);
    this.sessionStarted = true;

    // Notify the rest of the platform that an experience is opening.
    events.emit('experience_opened', { experience_id: entry.id, category: entry.category });

    // Bridge interaction events to lifecycle
    const interactionHandler = (e: CustomEvent) => {
      const detail = e.detail || {};
      if (detail.experience_id === entry.id) {
        recordInteraction(entry.id);
        if (detail.action === 'completed' || detail.action === 'collection_complete' || detail.action === 'game_over' || detail.action === 'perspective_viewed') {
          // Some experiences self-report completion
          if (detail.action === 'completed' || (detail.perspective_total_viewed && detail.perspective_total_viewed >= 3)) {
            markExperienceCompleted(entry.id);
          }
        }
        if (entry.collection) {
          updateCollectionProgress(entry.collection, entry.id, entry.category);
          // Check if collection is now fully complete
          const colExps = getExperiencesInCollection(entry.collection);
          const wasCompleted = checkCollectionCompletion(entry.collection, colExps.map(e => e.id));
          if (wasCompleted) {
            events.emit('collection_completed', { collection_id: entry.collection });
          }
        }
      }
    };
    events.on('experience_interaction', interactionHandler as any);

    try {
      const result = mod.mount(this, context);
      if (typeof result === 'function') {
        this.cleanup = () => {
          result();
          events.off('experience_interaction', interactionHandler as any);
        };
      } else if (mod.unmount) {
        this.cleanup = () => {
          mod.unmount!(this);
          events.off('experience_interaction', interactionHandler as any);
        };
      } else {
        this.cleanup = () => {
          events.off('experience_interaction', interactionHandler as any);
        };
      }
    } catch (error) {
      this.renderError(`Experience "${id}" failed to start.`);
      // eslint-disable-next-line no-console
      console.error(error);
      events.off('experience_interaction', interactionHandler as any);
    }
  }

  disconnectedCallback(): void {
    if (this.sessionStarted) {
      const id = this.dataset.id;
      if (id) {
        endSession(id);
      }
    }
    if (typeof this.cleanup === 'function') {
      try {
        this.cleanup();
      } catch {
        // ignore teardown errors
      }
    }
  }

  private renderError(message: string): void {
    this.textContent = message;
    this.setAttribute('role', 'alert');
  }
}
