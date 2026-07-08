import { h } from '../platform/utils';

export class AppFooter extends HTMLElement {
  connectedCallback(): void {
    const year = new Date().getFullYear();
    this.appendChild(
      h('footer', { class: 'site-footer' }, [
        h('div', { class: 'container footer-inner' }, [
          h('p', {}, [`© ${year} ITTYBITTYBITES`]),
          h('p', { class: 'meta' }, ['Interactive collections worth returning to.']),
        ]),
      ])
    );
  }
}
