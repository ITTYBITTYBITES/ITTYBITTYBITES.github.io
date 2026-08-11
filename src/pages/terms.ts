import { h } from '../platform/utils';
export function renderTerms(): HTMLElement {
  return h('div', { class: 'container' }, [
    h('section', { class: 'hero hero-subpage' }, [
      h('div', { class: 'hero-copy' }, [
        h('p', { class: 'eyebrow' }, ['Legal']),
        h('h1', {}, ['Terms & Conditions']),
        h('p', { class: 'lead' }, ['Please read these terms before using ITTYBITTYBITES.']),
        h('p', { class: 'hero-supporting' }, ['Last updated: 11 August 2026']),
      ]),
    ]),
    h('div', { class: 'publication-panel', style: 'padding:1.5rem;' }, [
      h('h2', {}, ['Acceptance']),
      h('p', {}, ['By accessing ittybittybites.github.io you agree to these Terms and our Privacy Policy. If you do not agree, please discontinue use.']),
      h('h2', {}, ['Content']),
      h('p', {}, ['All interactive experiences, text, illustrations, and software are owned by ITTYBITTYBITES and provided for personal, non-commercial, educational use. You may not copy, scrape, or redistribute substantial portions without permission.']),
      h('h2', {}, ['Disclaimer']),
      h('p', {}, ['Experiences are provided “as is” for exploration and learning. We make no guarantees of accuracy or availability.']),
      h('h2', {}, ['Advertising']),
      h('p', {}, ['The site may show advertisements via Google AdSense. Ad content is provided by Google and advertisers, not by ITTYBITTYBITES.']),
      h('h2', {}, ['Contact']),
      h('p', {}, ['Questions? Email ', h('code', {}, ['ittybittybitesgames@gmail.com'])]),
    ]),
  ]);
}
