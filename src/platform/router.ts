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
    const anchor = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href]');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('//') || href.startsWith('#')) return;
    if (anchor.target === '_blank') return;

    event.preventDefault();
    navigate(href);
  });

  window.addEventListener('popstate', () => {
    render(window.location.pathname, false);
  });

  render(window.location.pathname, false);
}

export function navigate(path: string): void {
  window.history.pushState({}, '', path);
  render(window.location.pathname, false);
}

function matchRoute(path: string): { route: Route; params: Record<string, string> } | null {
  const cleanPath = path.replace(/\/$/, '') || '/';
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
    window.history.replaceState({}, '', window.location.pathname + window.location.search);
  }
  analytics.pageView(title);
  focusMainContent(outlet);
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
