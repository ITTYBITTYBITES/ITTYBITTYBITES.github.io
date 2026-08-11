import { h } from '../platform/utils';

export class AppFooter extends HTMLElement {
  connectedCallback(): void {
    const year = new Date().getFullYear();
    this.appendChild(
      h('footer', { class: 'site-footer' }, [
        h('div', { class: 'container footer-inner' }, [
          h('div', { style: 'display:flex;flex-wrap:wrap;gap:.6rem 1rem;align-items:center;' }, [
            h('p', {}, [`© ${year} ITTYBITTYBITES`]),
            h('a', { href: '/privacy', style: 'font-size:.85rem;color:var(--muted);text-decoration:underline;' }, ['Privacy']),
            h('a', { href: '/terms', style: 'font-size:.85rem;color:var(--muted);text-decoration:underline;' }, ['Terms']),
            h('a', { href: '/contact', style: 'font-size:.85rem;color:var(--muted);text-decoration:underline;' }, ['Contact']),
          ]),
          h('p', { class: 'meta' }, ['Interactive collections worth returning to.']),
        ]),
      ])
    );
  }
}
