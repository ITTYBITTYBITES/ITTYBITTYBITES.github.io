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
import { renderPrivacy } from './pages/privacy';
import { renderTerms } from './pages/terms';
import { renderContact } from './pages/contact';

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
  // Consent banner is plain element registered lazily below
  if (!customElements.get('consent-banner')) {
    import('./components/consent-banner').then(mod => {
      if (!customElements.get('consent-banner')) customElements.define('consent-banner', mod.ConsentBanner);
    });
  }
}

function registerRoutes(): void {
  registerRoute('/', '', renderHome);
  registerRoute('/experiences', 'Experiences', renderIndex);
  registerRoute('/collections', 'Collections', renderCollections);
  registerRoute('/library', 'Library', renderLibrary);
  registerRoute('/experience/:id', 'Experience', renderExperience);
  registerRoute('/privacy', 'Privacy Policy', renderPrivacy);
  registerRoute('/terms', 'Terms', renderTerms);
  registerRoute('/contact', 'Contact', renderContact);
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

  // Ads: init after DOM so consent banner can show
  import('./platform/ads').then(({ initAds }) => initAds());
  // Mount consent banner (will self-hide if already decided)
  setTimeout(() => {
    if (!document.querySelector('consent-banner')) {
      const banner = document.createElement('consent-banner');
      document.body.appendChild(banner);
    }
  }, 800);

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
