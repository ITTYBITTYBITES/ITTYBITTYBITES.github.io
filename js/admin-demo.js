/* Public, client-side prototype only. No credentials, saving, publishing,
   analytics, or network requests. Text is inserted as text, never HTML. */
(() => {
  'use strict';
  const samples = {
    ministry: { title: 'Aligned With Heaven Inc.', description: 'Bringing the God of Abraham, Isaac, Jacob and His Son, Jesus — Yeshua — into the passions of people, both lost and found.', kicker: 'ALIGNED WITH HEAVEN' },
    book: { title: 'The Reality of Death: Are You Ready?', description: 'A practical and spiritual guide to prepare your heart, your life, and your legacy.', kicker: 'THE REALITY OF DEATH' }
  };
  const drafts = { ministry: {...samples.ministry}, book: {...samples.book} };
  const select = document.getElementById('site-select');
  const title = document.getElementById('draft-title');
  const description = document.getElementById('draft-description');
  const status = document.getElementById('editor-status');
  const topTitle = document.getElementById('top-title');
  let currentSite = 'ministry';

  function openPanel(name) {
    const panel = document.getElementById('panel-' + name);
    if (!panel) return;
    document.querySelectorAll('.panel').forEach((element) => { element.hidden = element !== panel; });
    document.querySelectorAll('.nav-button').forEach((button) => {
      const active = button.dataset.panel === name;
      button.classList.toggle('active', active);
      if (active) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    topTitle.textContent = {overview: 'Overview', content: 'Edit content', analytics: 'Analytics'}[name] || 'Overview';
    const heading = panel.querySelector('h1');
    if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({preventScroll:true}); }
  }
  function rememberInputs() {
    drafts[currentSite].title = title.value;
    drafts[currentSite].description = description.value;
  }
  function renderPreview() {
    const draft = drafts[currentSite];
    document.getElementById('preview-kicker').textContent = draft.kicker;
    document.getElementById('preview-title').textContent = draft.title;
    document.getElementById('preview-description').textContent = draft.description;
  }
  function switchSite(site) {
    if (!drafts[site]) return;
    rememberInputs();
    currentSite = site;
    select.value = site;
    title.value = drafts[site].title;
    description.value = drafts[site].description;
    renderPreview();
    status.textContent = 'This is a visual preview only. Nothing is saved, sent, or published.';
  }
  title.value = drafts.ministry.title;
  description.value = drafts.ministry.description;
  renderPreview();
  document.querySelectorAll('[data-panel]').forEach((button) => button.addEventListener('click', () => openPanel(button.dataset.panel)));
  document.querySelectorAll('[data-go]').forEach((button) => button.addEventListener('click', () => openPanel(button.dataset.go)));
  document.querySelectorAll('[data-edit-site]').forEach((button) => button.addEventListener('click', () => { switchSite(button.dataset.editSite); openPanel('content'); }));
  select.addEventListener('change', () => switchSite(select.value));
  document.getElementById('preview-button').addEventListener('click', () => {
    rememberInputs(); renderPreview();
    status.textContent = 'Preview updated on this page only. Nothing was saved or published.';
  });
  document.getElementById('reset-button').addEventListener('click', () => {
    drafts[currentSite] = {...samples[currentSite]};
    title.value = drafts[currentSite].title;
    description.value = drafts[currentSite].description;
    renderPreview();
    status.textContent = 'Sample text restored. No live content was changed.';
  });
})();
