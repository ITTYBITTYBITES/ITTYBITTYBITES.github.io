import './style.css';

import { AppFooter } from './components/app-footer';
import { AppHeader } from './components/app-header';
import { ExperienceHost } from './components/experience-host';
import { SkipLink } from './components/skip-link';
import { initAnalytics } from './platform/analytics';
import { renderExperience } from './pages/experience';
import { renderIndex } from './pages/experience-index';
import { renderHome } from './pages/home';
import { renderCollections } from './pages/collections';
import { renderLibrary } from './pages/library';
import { registerPWA } from './platform/pwa';
import { initRouter, registerRoute } from './platform/router';
import { initFeedback } from './platform/feedback';
import { audio } from './platform/audio';

if (!customElements.get('skip-link')) customElements.define('skip-link', SkipLink);
if (!customElements.get('app-header')) customElements.define('app-header', AppHeader);
if (!customElements.get('app-footer')) customElements.define('app-footer', AppFooter);
if (!customElements.get('experience-host')) customElements.define('experience-host', ExperienceHost);

const app = document.querySelector<HTMLDivElement>('#app');

if (app) {
  app.innerHTML = `
    <skip-link></skip-link>
    <app-header></app-header>
    <main id="main" class="app-main" tabindex="-1"></main>
    <app-footer></app-footer>
  `;
}

const main = document.getElementById('main');

if (!main) {
  throw new Error('Application outlet (#main) is missing.');
}

registerRoute('/', 'Home', async () => renderHome());
registerRoute('/experiences', 'Experiences', async (args) => renderIndex(args));
registerRoute('/collections', 'Collections', async () => renderCollections());
registerRoute('/library', 'Library', async () => renderLibrary());
registerRoute('/experience/:id', 'Experience', async (args) => renderExperience(args));

initAnalytics();
initFeedback();

// Ensure audio engine is ready for first gesture — do not autoplay
void audio.unlock().catch(() => {});

initRouter(main);
void registerPWA();
