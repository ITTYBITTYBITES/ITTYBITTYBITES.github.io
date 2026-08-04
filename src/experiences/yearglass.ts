import { initAudio, unlockAudio } from "../core/audio";
import type { ExperienceContext, ExperienceModule } from '../platform/types';
import { clearElement, h } from '../platform/utils';

const yearglass: ExperienceModule = {
  mount(container: HTMLElement, _context: ExperienceContext) {
    initAudio(); unlockAudio();
    const wrapper = h('div', { class: 'yearglass-preview publication-panel', style: 'padding: var(--space-6); max-width: 100%; min-height: 100vh; display: flex; flex-direction: column; justify-content: center;; overflow-x: hidden; font-size: 1rem; line-height: 1.5;' }, [
      h('div', { class: 'hero-copy', style: 'margin-bottom: var(--space-8);' }, [
        h('p', { class: 'eyebrow' }, ['Ambient / Sanctuary']),
        h('h2', {}, ['YearGlass']),
        h('p', { class: 'lead' }, ['A cozy ambient terrarium companion where users nurture a living sanctuary through time, simulation, and observation.']),
        h('p', {}, ['Watch your sanctuary change with daylight, weather, and the quiet presence of small creatures. A calm space you can always return to.']),
        h('p', { style: 'font-size:0.8125rem;opacity:0.7;margin-top:var(--space-2);line-height:1.4;' }, ['Pip the ladybug is already here. The jar holds a small world. Nothing is required — just observation.'])
      ]),
      h('section', { class: 'section overview-section' }, [
        h('h3', {}, ['Experience Overview']),
        h('p', {}, ['YearGlass is a standalone interactive sanctuary. Plants grow, weather shifts, and a starter creature named Pip explores. Photos, naming, and a focus-mode hourglass deepen the attachment over days. No scores, no pressure — just presence.'])
      ]),
      h('section', { class: 'section preview-section' }, [
      h('section', { class: 'section preview-section' }, [
        h('h3', {}, ['Terrarium Focus Mode']),
        h('p', {}, ['Click the dome to observe closely.']),
        h('div', { style: 'margin-top: var(--space-4); display: flex; justify-content: center;' }, [
          h('div', { onclick: 'openDome();', style: 'width: 200px; height: 200px; border-radius: 50%; background: radial-gradient(circle at 30% 20%, rgba(191,160,106,0.35), rgba(26,24,20,0.9)); border: 2px solid #bfa06a; box-shadow: 0 20px 60px rgba(191,160,106,0.25); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.2s ease;' }, ['Dome'])
        ])
      ]),
        h('h3', {}, ['Return Experience']),
        h('p', {}, ['YearGlass remembers. If you return after 1 day: the sanctuary has quietly lived on, plants grown slightly, weather passed. After 1 week: new growth stages, creature patterns more familiar. After longer: the jar feels like a place you have tended over time — memories kept, growth noticed, companionship deepened. No penalties. No guilt. Just gentle continuity.']),
        h('ul', { style: 'margin-top: var(--space-3); padding-left: var(--space-4); font-size: 0.8125rem; opacity: 0.85;' }, [
          h('li', {}, ['1 day away: welcome back message; subtle growth changes.']),
          h('li', {}, ['1 week away: milestone memory; creature behavior patterns visible.']),
          h('li', {}, ['Longer absence: deeper anniversary reflection; photos preserved; sanctuary unchanged but grown.'])
        ])
      ]),
      h('section', { class: 'section preview-section' }, [
        h('h3', {}, ['First Morning']),
        h('p', {}, ['Pip the ladybug is already here, exploring quietly. The jar holds a small world. The notebook holds memories not yet written. The camera waits for a moment worth keeping. Nothing is required — observation is enough. The sanctuary continues whether watched closely or from a distance. It remembers. It grows quietly. It is calm space designed to return to.'])
      ]),
      h('section', { class: 'section preview-section' }, [
        h('h3', {}, ['What to Expect']),
        h('ul', { class: 'suggestion-list', style: 'margin-top: var(--space-4); margin-bottom: var(--space-6); padding-left: var(--space-4);' }, [
          h('li', {}, ['Name your starter creature (Pip the ladybug).']),
          h('li', {}, ['Water plants and watch growth stages unfold over simulated days.']),
          h('li', {}, ['Experience day/night cycles, rain, and gentle weather changes.']),
          h('li', {}, ['Take photos, write observations in the journal, and build memories.']),
          h('li', {}, ['Use the hourglass focus mode for calm, attentive time.'])
        ])
      ]),

      h('section', { class: 'section app-connection-section', style: 'text-align: center; margin-top: var(--space-8); padding-top: var(--space-6); border-top: 1px solid color-mix(in srgb, var(--line-strong) 24%, var(--line) 76%);' }, [
        h('h3', {}, ['Launch YearGlass']),
        h('p', {}, ['Open the sanctuary in a new tab.']),
        h('div', { style: 'margin-top: var(--space-4);' }, [
          h('a', { href: '/yearglass/', target: '_blank', rel: 'noopener noreferrer', class: 'btn primary' }, ['Open Sanctuary'])
        ])
      ])
    ]);
    clearElement(container);
    container.appendChild(wrapper);
  // Simple relationship tracking (Batch 2 — memory enhancement)
  let relationshipClicks = 0;
  let relationshipVisits = 0;
  const relationshipEl = document.createElement('div');
  relationshipEl.style.cssText = 'margin-top:var(--space-3);padding:var(--space-3);background:#1a1814;border:1px solid #bfa06a;border-radius:8px;font-size:0.8125rem;opacity:0.85;line-height:1.5;';
  relationshipEl.innerHTML = '<strong>Relationship Memory:</strong> Pip is still getting to know you. Gentle interactions build familiarity over time.';
  wrapper.appendChild(relationshipEl);

  container.addEventListener('click', () => { initAudio(); unlockAudio();
    relationshipClicks++;
    if (relationshipClicks === 3) {
      relationshipVisits++;
      relationshipEl.innerHTML = '<strong>Companion Memory:</strong> Pip has visited you several times. "You keep returning. I notice." A quiet familiarity is growing.';
      relationshipEl.style.opacity = '1';
      relationshipEl.style.background = '#1f1b14';
    } else if (relationshipClicks >= 8) {
      relationshipVisits++;
      relationshipEl.innerHTML = '<strong>Companion Memory:</strong> Pip spends more time near the orchid. A preference is forming. "This is my place now."';
    }
  }, { once: false, capture: false });

  return () => {};
}
};

export default yearglass;
