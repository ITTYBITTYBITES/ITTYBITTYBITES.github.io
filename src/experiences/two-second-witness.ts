import type { ExperienceContext, ExperienceModule } from '../platform/types';
import { clearElement, h } from '../platform/utils';

const twoSecondWitness: ExperienceModule = {
  mount(container: HTMLElement, _context: ExperienceContext) {
    const wrapper = h('div', { class: 'two-second-witness-preview publication-panel', style: 'padding: var(--space-6);' }, [
      h('div', { class: 'hero-copy', style: 'margin-bottom: var(--space-8);' }, [
        h('p', { class: 'eyebrow' }, ['Upcoming App']),
        h('h2', {}, ['Two Second Witness']),
        h('p', { class: 'lead' }, ['Your memory is not a recording. It is a reconstruction.']),
        h('p', {}, ['Two Second Witness challenges your attention, perception, and memory through rapid visual experiments designed to reveal what your mind captures, misses, and rebuilds.']),
      ]),

      h('section', { class: 'section overview-section' }, [
        h('h3', {}, ['Experience Overview']),
        h('p', {}, ['See a scene for just two seconds, then answer specific questions about what you saw. Designed for curiosity, fun, and endless replayability.']),
      ]),

      h('section', { class: 'section preview-section' }, [
        h('h3', {}, ['Gameplay Preview']),
        h('div', { class: 'placeholder-preview', style: 'background: color-mix(in srgb, var(--line-strong) 40%, transparent); height: 300px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-md); margin-top: var(--space-4); margin-bottom: var(--space-6);' }, [
          h('p', { class: 'meta' }, ['[ Gameplay Screenshots / Video ]'])
        ])
      ]),

      h('section', { class: 'section collection-preview-section' }, [
        h('h3', {}, ['Challenge Types']),
        h('ul', { class: 'suggestion-list', style: 'margin-top: var(--space-4); margin-bottom: var(--space-6); padding-left: var(--space-4);' }, [
          h('li', { style: 'margin-bottom: var(--space-2); list-style-type: disc;' }, [h('strong', {}, ['Flashword: ']), 'Quick recognition of scrambled or fleeting words.']),
          h('li', { style: 'margin-bottom: var(--space-2); list-style-type: disc;' }, [h('strong', {}, ['Memory Challenges: ']), 'Test your recall of details after a brief glance.']),
          h('li', { style: 'margin-bottom: var(--space-2); list-style-type: disc;' }, [h('strong', {}, ['Observation Challenges: ']), 'Spot subtle changes or out-of-place elements.']),
          h('li', { style: 'margin-bottom: var(--space-2); list-style-type: disc;' }, ['Future additions coming soon...'])
        ])
      ]),

      h('section', { class: 'section play-download-section', style: 'margin-top: var(--space-8); padding-top: var(--space-6); border-top: 1px solid color-mix(in srgb, var(--line-strong) 24%, var(--line) 76%);' }, [
        h('h3', {}, ['Play & Download']),
        h('p', { class: 'lead', style: 'margin-top: var(--space-2);' }, ['Two Second Witness lives on the ITTYBITTYBITES platform — both as a browser preview and as a native mobile app.']),
        h('div', { class: 'play-download-grid', style: 'display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-6); margin-top: var(--space-6);' }, [
          h('div', { class: 'play-card', style: 'border: 1px solid color-mix(in srgb, var(--line-strong) 24%, var(--line) 76%); border-radius: var(--radius-md); padding: var(--space-6);' }, [
            h('h4', { style: 'margin-top: 0;' }, ['Play in Your Browser']),
            h('p', {}, ['A lightweight browser edition of Two Second Witness is planned for the ITTYBITTYBITES platform. It will offer a quick way to experience the core observation challenge directly from your browser.']),
            h('div', { style: 'margin-top: var(--space-4);' }, [
              h('button', { class: 'btn primary disabled', disabled: true }, ['Coming Soon'])
            ])
          ]),
          h('div', { class: 'play-card', style: 'border: 1px solid color-mix(in srgb, var(--line-strong) 24%, var(--line) 76%); border-radius: var(--radius-md); padding: var(--space-6);' }, [
            h('h4', { style: 'margin-top: 0;' }, ['Mobile App']),
            h('p', {}, ['Experience the full native version of Two Second Witness on your mobile device. The Android release is currently being prepared, with additional platforms planned for the future.']),
            h('div', { style: 'margin-top: var(--space-4);' }, [
              h('button', { class: 'btn primary disabled', disabled: true, title: 'Disabled until the app is published.' }, ['Google Play'])
            ]),
            h('p', { class: 'meta', style: 'margin-top: var(--space-2);' }, ['Disabled until the app is published.']),
            h('div', { class: 'store-badges', style: 'margin-top: var(--space-4); min-height: 56px; display: flex; align-items: center; gap: var(--space-3);' }, [
              h('p', { class: 'meta' }, ['Google Play and App Store badges coming soon.'])
            ])
          ])
        ])
      ])
    ]);

    clearElement(container);
    container.appendChild(wrapper);

    return () => {
      // cleanup
    };
  }
};

export default twoSecondWitness;
