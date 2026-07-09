/**
 * Lightweight client-side router for the platform shell.
 *
 * Uses the History API. GitHub Pages is configured to serve `index.html` for
 * unknown paths, so deep links work after the 404 fallback is triggered.
 */

import { analytics } from './analytics';
import { config } from './config';
import { clearElement, focusMainContent, h, updateMetaTags } from './utils';

export interface RouteParams {
  params: Record<string, string>;
  query: URLSearchParams;
}

export type RouteHandler = (args: RouteParams) => Promise<HTMLElement> | HTMLElement;

interface Route {
  pattern: string;
  title: string;
  handler: RouteHandler;
}

const routes: Route[] = [];
let outlet: HTMLElement | null = null;

export function registerRoute(pattern: string, title: string, handler: RouteHandler): void {
  if (!routes.some(r => r.pattern === pattern)) {
    routes.push({ pattern, title, handler });
  }
}

let routerInitialized = false;

export function initRouter(target: HTMLElement): void {
  outlet = target;

  if (routerInitialized) return;
  routerInitialized = true;

  document.body.addEventListener('click', (event) => {
    let target = event.target as Node | null;
    if (target && target.nodeType === Node.TEXT_NODE) {
      target = target.parentNode;
    }
    const element = target as Element;
    if (!element || typeof element.closest !== 'function') return;

    const anchor = element.closest<HTMLAnchorElement>('a[href]');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('//') || href.startsWith('#')) return;
    if (anchor.target === '_blank') return;

    // Allow native behavior for modifier keys (e.g. open in new tab)
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (event.defaultPrevented) return;

    event.preventDefault();
    navigate(href);
  });

  window.addEventListener('popstate', () => {
    render(window.location.pathname, false);
  });

  render(window.location.pathname, false);
}

export function navigate(path: string): void {
  try {
    window.history.pushState({}, '', path);
  } catch (e) {
    if (window.location.protocol === 'file:') {
    } else {
      console.error(e);
    }
  }
  const targetPath = window.location.protocol === 'file:' ? path : window.location.pathname;
  render(targetPath, false, true);
}

function matchRoute(path: string): { route: Route; params: Record<string, string> } | null {
  const cleanPath = path.split('?')[0].split('#')[0].replace(/\/$/, '') || '/';
  for (const route of routes) {
    const { regex, keys } = patternToRegex(route.pattern);
    const match = cleanPath.match(regex);
    if (!match) continue;
    const params: Record<string, string> = {};
    keys.forEach((key, index) => {
      params[key] = match[index + 1] ?? '';
    });
    return { route, params };
  }
  return null;
}

function patternToRegex(pattern: string): { regex: RegExp; keys: string[] } {
  const keys: string[] = [];
  if (pattern === '/' || pattern === '') {
    return { regex: /^\/?$/, keys: [] };
  }
  let regexSource = pattern.replace(/\/$/, '');
  regexSource = regexSource.replace(/:([^/]+)/g, (_, key) => {
    keys.push(key);
    return '([^/]+)';
  });
  return { regex: new RegExp(`^${regexSource}$`), keys };
}

async function render(path: string, replaceState: boolean, isPush = false): Promise<void> {
  if (!outlet) return;

  const matched = matchRoute(path);
  const query = new URLSearchParams(window.location.search);

  if (!matched) {
    const page = await notFoundPage();
    replaceOutlet(page, 'Not Found', replaceState, isPush);
    return;
  }

  const { route, params } = matched;
  const page = await route.handler({ params, query });
  const title = route.title ? `${route.title} — ${config.siteTitle}` : config.siteTitle;
  replaceOutlet(page, title, replaceState, isPush);
}

function replaceOutlet(page: HTMLElement, title: string, replaceState: boolean, isPush = false): void {
  if (!outlet) return;
  clearElement(outlet);
  outlet.appendChild(page);
  if (replaceState) {
    try {
      window.history.replaceState({}, '', window.location.pathname + window.location.search + window.location.hash);
    } catch (e) {
      // Ignore replaceState errors in file:// protocol
    }
  }
  
  updateMetaTags(title);
  analytics.pageView(title);
  focusMainContent(outlet);

  // If there's a hash, scroll to it after a brief layout yield
  if (window.location.hash) {
    setTimeout(() => {
      const target = document.getElementById(window.location.hash.slice(1));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  } else if (isPush) {
    // Forward navigation without hash: scroll to top
    window.scrollTo(0, 0);
  } else {
    // Popstate or initial load without hash: ensure viewport is at top if current scroll is out of bounds
    setTimeout(() => {
      if (window.scrollY > document.documentElement.scrollHeight) {
        window.scrollTo(0, 0);
      }
    }, 50);
  }
}

function notFoundPage(): HTMLElement {
  return h('div', { class: 'container' }, [
    h('h1', {}, ['Page not found']),
    h('p', {}, [
      'The requested route does not exist. ',
      h('a', { href: '/' }, ['Return home']),
    ]),
  ]);
}
