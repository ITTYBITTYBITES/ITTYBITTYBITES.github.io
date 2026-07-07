import { h } from '../platform/utils';

export function renderHome(): HTMLElement {
  return h('div', { class: 'container' }, [
    h('section', { class: 'hero' }, [
      h('h1', {}, ['Platform']),
      h('p', { class: 'lead' }, [
        'A modular foundation for browser games, applications, interactive experiences, utilities, experiments, documentation, and media.',
      ]),
      h('div', { class: 'cta-row' }, [
        h('a', { class: 'btn', href: '/experiences' }, ['Browse experiences']),
        h('a', { class: 'btn', href: '/docs' }, ['Read the docs']),
      ]),
    ]),
    h('section', { class: 'section' }, [
      h('h2', {}, ['What this foundation provides']),
      h('ul', {}, [
        h('li', {}, ['A client-side router and page shell']),
        h('li', {}, ['A registry for adding experiences without changing the platform']),
        h('li', {}, ['Centralized analytics and an internal event bus']),
        h('li', {}, ['Progressive Web App support with offline caching']),
        h('li', {}, ['Accessibility primitives and responsive layout defaults']),
      ]),
    ]),
  ]);
}
