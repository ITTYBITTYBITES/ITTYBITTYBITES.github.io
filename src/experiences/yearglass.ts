import type { ExperienceContext, ExperienceModule } from '../platform/types';
import { clearElement, h } from '../platform/utils';

const yearglass: ExperienceModule = {
  mount(container: HTMLElement, _context: ExperienceContext) {
    const wrapper = h('div', { class: 'yearglass-preview publication-panel', style: 'padding: var(--space-6);' }, [
      h('div', { class: 'hero-copy', style: 'margin-bottom: var(--space-8);' }, [
        h('p', { class: 'eyebrow' }, ['Ambient / Sanctuary']),
        h('h2', {}, ['YearGlass']),
        h('p', { class: 'lead' }, ['A cozy ambient terrarium companion where users nurture a living sanctuary through time, simulation, and observation.']),
        h('p', {}, ['Watch your sanctuary change with daylight, weather, and the quiet presence of small creatures. A calm space designed to return to.'])
      ]),
      h('section', { class: 'section overview-section' }, [
        h('h3', {}, ['Experience Overview']),
        h('p', {}, ['YearGlass is a standalone interactive sanctuary. Plants grow, weather shifts, and a starter creature named Pip explores. Photos, naming, and a focus-mode hourglass deepen the attachment over days. No scores, no pressure — just presence.'])
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
        h('p', {}, ['Open the sanctuary in a new experience.']),
        h('div', { style: 'margin-top: var(--space-4);' }, [
          h('a', { href: '/yearglass/', class: 'btn primary' }, ['Open Sanctuary'])
        ])
      ])
    ]);

    clearElement(container);
    container.appendChild(wrapper);
    return () => {};
  }
};

export default yearglass;
