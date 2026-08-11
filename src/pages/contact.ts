import { h } from '../platform/utils';
export function renderContact(): HTMLElement {
  return h('div', { class: 'container' }, [
    h('section', { class: 'hero hero-subpage' }, [
      h('div', { class: 'hero-copy' }, [
        h('p', { class: 'eyebrow' }, ['Hello']),
        h('h1', {}, ['Contact']),
        h('p', { class: 'lead' }, ['We’d love to hear what you discover.']),
      ]),
    ]),
    h('div', { class: 'publication-panel', style: 'padding:1.5rem;' }, [
      h('h2', {}, ['Email']),
      h('p', {}, [h('code', {}, ['ittybittybitesgames@gmail.com'])]),
      h('h2', {}, ['Privacy Requests']),
      h('p', {}, ['To request deletion or information about data associated with advertising/analytics, email us with the subject “Privacy Request”. Because we don’t run user accounts, please describe your request and we’ll respond within 30 days.']),
      h('p', {}, [h('a', { href: '/privacy' }, ['Privacy Policy'])]),
    ]),
  ]);
}
