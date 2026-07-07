import { h } from '../platform/utils';

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Experiences', href: '/experiences' },
  { label: 'Collections', href: '/collections' },
];

export class AppHeader extends HTMLElement {
  connectedCallback(): void {
    this.render();
  }

  private render(): void {
    const currentPath = window.location.pathname;

    const navList = h('ul', { class: 'nav-list', role: 'menubar' },
      navItems.map((item) => {
        const isActive = currentPath === item.href || (item.href !== '/' && currentPath.startsWith(item.href));
        const link = h('a', { href: item.href, role: 'menuitem', 'aria-current': isActive ? 'page' : undefined }, [item.label]);
        return h('li', { role: 'none' }, [link]);
      })
    );

    const toggle = h('button', {
      class: 'nav-toggle',
      type: 'button',
      'aria-label': 'Toggle navigation',
      'aria-expanded': 'false',
    }, ['Menu']);

    toggle.addEventListener('click', () => {
      const open = navList.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    const nav = h('nav', { class: 'site-nav', 'aria-label': 'Primary' }, [toggle, navList]);

    const home = h('a', { class: 'brand', href: '/' }, ['Platform']);

    this.appendChild(h('header', { class: 'site-header' }, [
      h('div', { class: 'container header-inner' }, [home, nav]),
    ]));
  }
}
