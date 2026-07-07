import { events } from '../platform/events';
import type { ExperienceContext, ExperienceMeta, ExperienceModule } from '../platform/types';
import { h } from '../platform/utils';

export const meta: ExperienceMeta = {
  id: 'counter',
  title: 'Counter',
  description: 'A minimal interactive utility demonstrating state, events, and analytics integration.',
  category: 'utility',
  tags: ['sample', 'interaction', 'state'],
};

export const mount = (container: HTMLElement, context: ExperienceContext): (() => void) => {
  let count = 0;
  let started = false;

  const display = h('output', { class: 'counter-value', 'aria-live': 'polite' }, ['0']);
  const increment = h('button', { type: 'button', class: 'btn' }, ['Increment']);
  const reset = h('button', { type: 'button', class: 'btn' }, ['Reset']);

  const update = (): void => {
    display.textContent = String(count);
  };

  increment.addEventListener('click', () => {
    if (!started) {
      started = true;
      events.emit('experience_started', { experience_id: context.meta.id });
    }
    count += 1;
    update();
    context.analytics.track('counter_incremented', { experience_id: context.meta.id, count });
    if (count === 10) {
      events.emit('experience_completed', { experience_id: context.meta.id, count });
    }
  });

  reset.addEventListener('click', () => {
    count = 0;
    started = false;
    update();
  });

  container.appendChild(
    h('div', { class: 'experience-counter' }, [
      h('p', {}, ['Click the button to increment the counter.']),
      h('div', { class: 'counter-controls' }, [increment, reset]),
      display,
    ])
  );

  return () => {
    container.innerHTML = '';
  };
};

const module: ExperienceModule = { meta, mount };
export default module;
