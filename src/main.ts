import './style.css';

import { AppFooter } from './components/app-footer';
import { AppHeader } from './components/app-header';
import { ExperienceHost } from './components/experience-host';
import { SkipLink } from './components/skip-link';
import { initAnalytics } from './platform/analytics';
import { renderExperience } from './pages/experience';
import { renderIndex } from './pages/experience-index';
import { renderHome } from './pages/home';
import { registerPWA } from './platform/pwa';
import { initRouter, registerRoute } from './platform/router';

customElements.define('skip-link', SkipLink);
customElements.define('app-header', AppHeader);
customElements.define('app-footer', AppFooter);
customElements.define('experience-host', ExperienceHost);

const app = document.querySelector<HTMLDivElement>('#app');
if (app) {
  app.innerHTML = `
    <skip-link></skip-link>
    <app-header></app-header>
    <main id="main" class="app-main" tabindex="-1" aria-live="polite" aria-atomic="true"></main>
    <app-footer></app-footer>
  `;
}

const main = document.getElementById('main');
if (!main) {
  throw new Error('Application outlet (#main) is missing.');
}

registerRoute('/', 'Home', async () => renderHome());
registerRoute('/experiences', 'Experiences', async () => renderIndex());
registerRoute('/experience/:id', 'Experience', async (args) => renderExperience(args));

initAnalytics();
initRouter(main);
void registerPWA();
