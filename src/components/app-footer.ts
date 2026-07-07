import { h } from '../platform/utils';

export class AppFooter extends HTMLElement {
  connectedCallback(): void {
    const year = new Date().getFullYear();
    this.appendChild(
      h('footer', { class: 'site-footer' }, [
        h('div', { class: 'container footer-inner' }, [
          h('p', {}, [`Platform foundation — ${year}`]),
          h('p', { class: 'meta' }, ['Built for browser games, applications, and interactive experiences.']),
        ]),
      ])
    );
  }
}
