/**
 * Small DOM and platform helpers.
 */

import { config } from './config';

/** Resolve a public asset path against the configured base URL. */
export function assetUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const base = config.baseUrl.endsWith('/') ? config.baseUrl.slice(0, -1) : config.baseUrl;
  return `${base}${normalized}`;
}

/** Create an element with attributes and children in one call. */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number | boolean | undefined> = {},
  children: Array<Node | string> = []
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === false || value == null) continue;
    if (value === true) {
      el.setAttribute(key, '');
    } else {
      el.setAttribute(key, String(value));
    }
  }
  for (const child of children) {
    el.append(child);
  }
  return el;
}

/** Remove all children from an element. */
export function clearElement(el: HTMLElement): void {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

/** Move focus to the first heading inside a container for route announcements. */
export function focusMainContent(container: HTMLElement): void {
  const heading = container.querySelector<HTMLElement>('h1');
  if (heading) {
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }
}

/** Debounce a function. */
export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timer: number | undefined;
  return (...args: Parameters<T>) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), wait);
  };
}
