import { marked } from 'marked';
import readme from '../../README.md?raw';
import { events } from '../platform/events';
import type { ExperienceContext, ExperienceMeta, ExperienceModule } from '../platform/types';
import { h } from '../platform/utils';

export const meta: ExperienceMeta = {
  id: 'platform-docs',
  title: 'Platform Documentation',
  description: 'A documentation experience that renders the project README inside an experience host.',
  category: 'documentation',
  tags: ['docs', 'markdown'],
};

export const mount = (container: HTMLElement, context: ExperienceContext): (() => void) => {
  const article = h('article', { class: 'prose' }, []);
  article.innerHTML = marked.parse(readme) as string;

  container.appendChild(
    h('div', { class: 'experience-docs' }, [
      h('p', { class: 'meta' }, ['Rendered from README.md']),
      article,
    ])
  );

  events.emit('experience_started', { experience_id: context.meta.id });

  return () => {
    container.innerHTML = '';
  };
};

const module: ExperienceModule = { meta, mount };
export default module;
