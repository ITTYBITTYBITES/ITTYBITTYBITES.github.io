/**
 * Lightweight client-side router for the platform shell.
 *
 * Uses the History API. GitHub Pages is configured to serve `index.html` for
 * unknown paths, so deep links work after the 404 fallback is triggered.
 */

import { analytics } from './analytics';
import { config } from './config';
import { clearElement, focusMainContent, h } from './utils';

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
  routes.push({ pattern, title, handler });
}

export function initRouter(target: HTMLElement): void {
  outlet = target;

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
    // If pushState fails (e.g., file:// protocol), just update the pathname directly
    // or fallback to window.location.assign if completely failing
    if (window.location.protocol === 'file:') {
      // In local file testing, we might want to just render directly to simulate SPA
      // But we can't change the URL easily without hash. We'll just render the new path.
      // This allows the UI to work locally.
    } else {
      console.error(e);
    }
  }
  // If we are on file://, window.location.pathname won't match the new path,
  // so we must pass the explicitly requested path to render!
  const targetPath = window.location.protocol === 'file:' ? path : window.location.pathname;
  render(targetPath, false);
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

async function render(path: string, replaceState: boolean): Promise<void> {
  if (!outlet) return;

  const matched = matchRoute(path);
  const query = new URLSearchParams(window.location.search);

  if (!matched) {
    const page = await notFoundPage();
    replaceOutlet(page, 'Not Found', replaceState);
    return;
  }

  const { route, params } = matched;
  const page = await route.handler({ params, query });
  const title = route.title ? `${route.title} — ${config.siteTitle}` : config.siteTitle;
  replaceOutlet(page, title, replaceState);
}

function replaceOutlet(page: HTMLElement, title: string, replaceState: boolean): void {
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
