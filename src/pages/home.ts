import { h } from '../platform/utils';

export function renderHome(): HTMLElement {
  return h('div', { class: 'container' }, [
    h('section', { class: 'hero' }, [
      h('h1', {}, ['Platform']),
      h('p', { class: 'lead' }, [
        'A foundation for creating meaningful digital experiences.',
      ]),
      h('div', { class: 'cta-row' }, [
        h('a', { class: 'btn', href: '/experiences' }, ['Browse experiences']),
      ]),
    ]),
    h('section', { class: 'section' }, [
      h('h2', {}, ['What this platform offers']),
      h('ul', {}, [
        h('li', {}, ['Small, meaningful interactions that combine into rich experiences']),
        h('li', {}, ['Experiences that connect through collections and stories']),
        h('li', {}, ['Discovery that feels helpful, not manipulative']),
        h('li', {}, ['A consistent shell that lets creators focus on what matters']),
      ]),
    ]),
  ]);
}
