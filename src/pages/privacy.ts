import { h } from '../platform/utils';
import { getConsent, setConsent } from '../platform/ads';

export function renderPrivacy(): HTMLElement {
  const current = getConsent();

  const consentControls = h('div', { class: 'publication-panel', style: 'padding:1.25rem;margin:1.5rem 0;' }, [
    h('h3', {}, ['Cookie & Ads Consent']),
    h('p', { class: 'muted' }, [`Current choice: ${current ?? 'not yet chosen (banner will appear)'}`]),
    h('div', { class: 'cta-row', style: 'margin-top:1rem;' }, [
      (() => {
        const btn = h('button', { class: `btn ${current==='accepted'?'primary':''}`, type: 'button' }, ['Accept personalized ads']);
        btn.addEventListener('click', () => { setConsent('accepted'); location.reload(); });
        return btn;
      })(),
      (() => {
        const btn = h('button', { class: `btn ${current==='rejected'?'primary':''}`, type: 'button' }, ['Reject — show non-personalized only']);
        btn.addEventListener('click', () => { setConsent('rejected'); location.reload(); });
        return btn;
      })(),
      (() => {
        const btn = h('button', { class: 'btn subtle', type: 'button' }, ['Reset choice']);
        btn.addEventListener('click', () => { setConsent(null); location.reload(); });
        return btn;
      })(),
    ]),
    h('p', { class: 'muted', style: 'margin-top:.8rem;font-size:.85rem;' }, ['You can also manage Google ad personalization at ', h('a', { href: 'https://adssettings.google.com', target: '_blank', rel: 'noopener' }, ['adssettings.google.com']), '.'])
  ]);

  return h('div', { class: 'container' }, [
    h('section', { class: 'hero hero-subpage' }, [
      h('div', { class: 'hero-copy' }, [
        h('p', { class: 'eyebrow' }, ['Policy']),
        h('h1', {}, ['Privacy Policy']),
        h('p', { class: 'lead' }, ['How ITTYBITTYBITES handles data on the web.']),
        h('p', { class: 'hero-supporting' }, ['Last updated: 11 August 2026']),
      ]),
    ]),
    consentControls,
    h('div', { class: 'publication-panel', style: 'padding:1.5rem;' }, [
      h('h2', {}, ['Summary']),
      h('ul', {}, [
        h('li', {}, ['Your experience progress is stored locally in your browser (localStorage/IndexedDB) — we do not run accounts or servers for it.']),
        h('li', {}, ['With your consent, we show ads via Google AdSense and measure visits via Google Analytics 4.']),
        h('li', {}, ['We do not collect your name, email, or precise location. You can withdraw consent anytime on this page.']),
      ]),
      h('h2', {}, ['Information We Store']),
      h('p', {}, ['Game progress, favorites, and settings are saved only in your browser storage. Clearing site data or using “Reset Progress” in Collections deletes it.']),
      h('h2', {}, ['Cookies & Advertising']),
      h('p', {}, ['Google AdSense may use cookies and your advertising identifier to serve ads and measure performance. See ', h('a', { href: 'https://policies.google.com/privacy', target: '_blank', rel: 'noopener' }, ["Google's Privacy Policy"]), ' and ', h('a', { href: 'https://policies.google.com/technologies/ads', target: '_blank', rel: 'noopener' }, ['How Google uses data']), '.']),
      h('p', {}, ['If you choose “Reject”, we request non-personalized ads only and avoid ad personalization signals (restricted_data_processing is enabled in Analytics).']),
      h('h2', {}, ['Analytics']),
      h('p', {}, ['When enabled, Google Analytics 4 collects anonymous page views and experience events (e.g., “experience_completed”) to help us improve the library. No personal identifiers are sent. You can block analytics with a browser extension or by rejecting consent above.']),
      h('h2', {}, ['Your Rights (GDPR / CCPA)']),
      h('p', {}, ['Depending on your region you may have rights to access, correct, or delete data, and to withdraw consent. Use the controls above, clear browser storage, or email us.']),
      h('h2', {}, ['Contact']),
      h('p', {}, ['Questions? Email ', h('code', {}, ['ittybittybitesgames@gmail.com']), ' — Developer: ITTYBITTYBITES']),
      h('h2', {}, ['Changes']),
      h('p', {}, ['We may update this Policy. Material changes will be posted here with a new “Last updated” date.']),
      h('p', { style: 'margin-top:1.5rem;' }, [h('a', { href: '/terms' }, ['Terms & Conditions']), ' • ', h('a', { href: '/contact' }, ['Contact'])]),
    ]),
  ]);
}
