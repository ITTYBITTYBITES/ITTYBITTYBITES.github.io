import { analytics } from '../platform/analytics';
import { events } from '../platform/events';
import { getExperienceById, loadExperience } from '../platform/registry';
import type { ExperienceContext, ExperienceModule } from '../platform/types';

/**
 * Mounts and safely tears down an experience module.
 *
 * Usage:
 *   <experience-host data-id="counter" data-query="?debug=1"></experience-host>
 */
export class ExperienceHost extends HTMLElement {
  private cleanup?: (() => void) | undefined;

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

    // Notify the rest of the platform that an experience is opening.
    events.emit('experience_opened', { experience_id: entry.id, category: entry.category });

    try {
      const result = mod.mount(this, context);
      if (typeof result === 'function') {
        this.cleanup = result;
      } else if (mod.unmount) {
        this.cleanup = () => mod.unmount!(this);
      }
    } catch (error) {
      this.renderError(`Experience "${id}" failed to start.`);
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  disconnectedCallback(): void {
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
