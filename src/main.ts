import './style.css';

import { AppFooter } from './components/app-footer';
import { AppHeader } from './components/app-header';
import './components/audio-toggle';
import { ExperienceHost } from './components/experience-host';
import { SkipLink } from './components/skip-link';
import { initAnalytics } from './platform/analytics';
import { registerPWA } from './platform/pwa';
import { initRouter, registerRoute } from './platform/router';
import { initViewportStabilizer } from './platform/viewport';
import { renderCollections } from './pages/collections';
import { renderIndex } from './pages/experience-index';
import { renderExperience } from './pages/experience';
import { renderHome } from './pages/home';
import { renderLibrary } from './pages/library';

function defineElement(name: string, constructor: CustomElementConstructor): void {
  if (!customElements.get(name)) {
    customElements.define(name, constructor);
  }
}

function registerElements(): void {
  defineElement('skip-link', SkipLink);
  defineElement('app-header', AppHeader);
  defineElement('app-footer', AppFooter);
  defineElement('experience-host', ExperienceHost);
}

function registerRoutes(): void {
  registerRoute('/', '', renderHome);
  registerRoute('/experiences', 'Experiences', renderIndex);
  registerRoute('/collections', 'Collections', renderCollections);
  registerRoute('/library', 'Library', renderLibrary);
  registerRoute('/experience/:id', 'Experience', renderExperience);
}

function boot(): void {
  registerElements();
  registerRoutes();
  initAnalytics();

  const app = document.getElementById('app');
  if (!app) {
    throw new Error('ITTYBITTYBITES boot failed: missing #app root.');
  }

  app.innerHTML = '';

  const skipLink = document.createElement('skip-link');
  const header = document.createElement('app-header');
  const main = document.createElement('main');
  const footer = document.createElement('app-footer');

  main.id = 'main';
  main.className = 'site-main';
  main.setAttribute('tabindex', '-1');

  app.append(skipLink, header, main, footer);
  initRouter(main);

  // Stabilize mobile viewport height (svh/dvh) to fix address-bar clipping.
  initViewportStabilizer();

  void registerPWA();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
