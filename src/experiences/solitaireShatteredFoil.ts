import type { ExperienceContext, ExperienceModule } from '../platform/types';
import { clearElement, h } from '../platform/utils';

const solitaireShatteredFoil: ExperienceModule = {
  mount(container: HTMLElement, _context: ExperienceContext) {
    const wrapper = h('div', { class: 'shattered-foil-preview publication-panel', style: 'padding: var(--space-6); max-width: 860px; margin: 0 auto;' }, [
      
      // 1. HERO HEADER & BRAND COPY
      h('div', { class: 'hero-copy', style: 'margin-bottom: var(--space-8);' }, [
        h('p', { class: 'eyebrow', style: 'color: #C86432; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; font-size: 0.85rem;' }, ['Artisan Card Lounge']),
        h('h2', { style: 'font-family: Georgia, serif; font-size: 2.2rem; margin-top: var(--space-2); margin-bottom: var(--space-2);' }, ['Solitaire: Shattered Foil Edition']),
        h('p', { class: 'lead', style: 'font-size: 1.25rem; font-style: italic; color: #C86432; margin-bottom: var(--space-4);' }, ['“Fragments of beauty, brought together.”']),
        h('p', { style: 'line-height: 1.6; margin-bottom: var(--space-3);' }, [
          'Shattered Foil is a solitaire experience inspired by the art of stained glass. Its identity comes from the contrast between fragments and wholeness: individual pieces of colored glass, separated by delicate copper foil, becoming something greater when brought together.'
        ]),
        h('p', { style: 'line-height: 1.6;' }, [
          'The name reflects that transformation. “Shattered” represents the beauty of fragmented glass, while “Foil” references the Tiffany copper-foil technique used to assemble stained-glass pieces. Every deal represents scattered fragments; every completed foundation pile represents a finished work of art.'
        ])
      ]),

      // 2. EXPERIENCE OVERVIEW
      h('section', { class: 'section overview-section', style: 'margin-bottom: var(--space-8);' }, [
        h('h3', { style: 'font-family: Georgia, serif; border-bottom: 1px solid color-mix(in srgb, var(--line-strong) 30%, transparent); padding-bottom: var(--space-2); margin-bottom: var(--space-4);' }, ['Experience Overview']),
        h('p', { style: 'line-height: 1.6; margin-bottom: var(--space-4);' }, [
          'Combining the timeless rules of classic solitaire with the visual language of handcrafted glasswork—color, light, contrast, and tactile copper solder seams. Cards are rendered as translucent glass panes (Ruby, Cobalt, Amber, and Emerald) that cast vibrant colored light caustics across a dark cathedral workbench.'
        ]),
        h('div', { style: 'display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-4); margin-top: var(--space-4);' }, [
          h('div', { style: 'background: color-mix(in srgb, var(--line-strong) 15%, transparent); padding: var(--space-4); border-radius: var(--radius-md); border: 1px solid color-mix(in srgb, #C86432 35%, transparent);' }, [
            h('h4', { style: 'color: #C86432; margin-bottom: var(--space-1); font-size: 1rem;' }, ['Tactile Glass Physics']),
            h('p', { style: 'font-size: 0.9rem; color: var(--text-muted);' }, ['Dynamic Z-elevation, velocity-based drag tilt, and acoustic glass & copper solder audio foley.'])
          ]),
          h('div', { style: 'background: color-mix(in srgb, var(--line-strong) 15%, transparent); padding: var(--space-4); border-radius: var(--radius-md); border: 1px solid color-mix(in srgb, #C86432 35%, transparent);' }, [
            h('h4', { style: 'color: #C86432; margin-bottom: var(--space-1); font-size: 1rem;' }, ['The Glass Atelier']),
            h('p', { style: 'font-size: 0.9rem; color: var(--text-muted);' }, ['24 handcrafted stained-glass deck themes with real-time GLSL holographic foil and light dispersion.'])
          ]),
          h('div', { style: 'background: color-mix(in srgb, var(--line-strong) 15%, transparent); padding: var(--space-4); border-radius: var(--radius-md); border: 1px solid color-mix(in srgb, #C86432 35%, transparent);' }, [
            h('h4', { style: 'color: #C86432; margin-bottom: var(--space-1); font-size: 1rem;' }, ['Player-First Model']),
            h('p', { style: 'font-size: 0.9rem; color: var(--text-muted);' }, ['Zero paywalls. Rent-to-own 3-stamp unlocks, 24hr studio passes, and non-intrusive bottom banners.'])
          ])
        ])
      ]),

      // 3. GAMEPLAY PREVIEW
      h('section', { class: 'section preview-section', style: 'margin-bottom: var(--space-8);' }, [
        h('h3', { style: 'font-family: Georgia, serif; border-bottom: 1px solid color-mix(in srgb, var(--line-strong) 30%, transparent); padding-bottom: var(--space-2); margin-bottom: var(--space-4);' }, ['Visual & Tabletop Preview']),
        h('div', { class: 'placeholder-preview', style: 'background: radial-gradient(circle at 50% 35%, #16202E 0%, #0A0E14 100%); height: 320px; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: var(--radius-md); border: 1.5px solid rgba(200, 100, 50, 0.4); margin-top: var(--space-4); margin-bottom: var(--space-6); text-align: center; padding: var(--space-4);' }, [
          h('div', { style: 'font-size: 42px; margin-bottom: var(--space-2);' }, ['🪟✨']),
          h('p', { style: 'font-family: Georgia, serif; font-size: 1.25rem; font-weight: 700; color: #F08E58; margin-bottom: var(--space-1);' }, ['Stained Glass & Copper Foil Tabletop']),
          h('p', { class: 'meta', style: 'font-size: 0.85rem; color: #8E98A8; max-width: 420px;' }, ['7 Tableau Columns • 4 Lead-Solder Foundation Frames • Real-Time Light Caustics • Unlimited Undo'])
        ])
      ]),

      // 4. GAME MODES & HISTORICAL ORIGINS
      h('section', { class: 'section collection-preview-section', style: 'margin-bottom: var(--space-8);' }, [
        h('h3', { style: 'font-family: Georgia, serif; border-bottom: 1px solid color-mix(in srgb, var(--line-strong) 30%, transparent); padding-bottom: var(--space-2); margin-bottom: var(--space-4);' }, ['Included Game Modes & Historical Lineage']),
        h('ul', { class: 'suggestion-list', style: 'margin-top: var(--space-4); margin-bottom: var(--space-6); padding-left: var(--space-4); line-height: 1.6;' }, [
          h('li', { style: 'margin-bottom: var(--space-3); list-style-type: disc;' }, [
            h('strong', { style: 'color: #C86432;' }, ['Klondike (The True Classic, 1896): ']),
            'The quintessential solitaire game born in the Canadian Yukon Gold Rush and immortalized in Windows 3.0. Features 7 cascading columns and standard Draw 1 / Draw 3 rules.'
          ]),
          h('li', { style: 'margin-bottom: var(--space-3); list-style-type: disc;' }, [
            h('strong', { style: 'color: #C86432;' }, ['Spider Solitaire (1949): ']),
            'A deep tactical sequence builder using two full decks (104 cards) across 10 columns. Supports 1-Suit (Casual), 2-Suit (Intermediate), and 4-Suit (Grandmaster) configurations.'
          ]),
          h('li', { style: 'margin-bottom: var(--space-3); list-style-type: disc;' }, [
            h('strong', { style: 'color: #C86432;' }, ['FreeCell (1978): ']),
            'Paul Alfille’s revolutionary open-card puzzle featuring 4 open holding cells and 8 cascade columns. Nearly 100% mathematically solvable through pure forward foresight.'
          ]),
          h('li', { style: 'margin-bottom: var(--space-3); list-style-type: disc;' }, [
            h('strong', { style: 'color: #C86432;' }, ['TriPeaks Mosaic (Arcade): ']),
            'A fast-paced sequence challenge clearing 3 overlapping pyramid peaks with ascending and descending rank streak multipliers.'
          ]),
          h('li', { style: 'margin-bottom: var(--space-3); list-style-type: disc;' }, [
            h('strong', { style: 'color: #C86432;' }, ['Pyramid Alignment (Classical): ']),
            'An ancient pairing past-time challenging players to dismantle a 28-card triangle by pairing cards that sum to 13.'
          ])
        ])
      ]),

      // 5. ATELIER COLLECTIONS
      h('section', { class: 'section collection-preview-section', style: 'margin-bottom: var(--space-8);' }, [
        h('h3', { style: 'font-family: Georgia, serif; border-bottom: 1px solid color-mix(in srgb, var(--line-strong) 30%, transparent); padding-bottom: var(--space-2); margin-bottom: var(--space-4);' }, ['The 24 Stained Glass Collections']),
        h('p', { style: 'margin-bottom: var(--space-3); color: var(--text-muted);' }, ['Craft and collect bespoke glass themes through daily challenge streaks and rent-to-own solder stamps:']),
        h('ul', { style: 'padding-left: var(--space-4); line-height: 1.6;' }, [
          h('li', { style: 'margin-bottom: var(--space-2); list-style-type: circle;' }, [h('strong', {}, ['Cathedral Gothic: ']), 'Notre-Dame Rose Window, Chartres Azure, Basilica Red']),
          h('li', { style: 'margin-bottom: var(--space-2); list-style-type: circle;' }, [h('strong', {}, ['Tiffany Art Nouveau: ']), 'Dragonfly & Waterlily, Wisteria Blossom, Favrile Amber']),
          h('li', { style: 'margin-bottom: var(--space-2); list-style-type: circle;' }, [h('strong', {}, ['Venetian Murano: ']), 'Millefiori Mosaic, Aventurine Glint, Latticino Spiral']),
          h('li', { style: 'margin-bottom: var(--space-2); list-style-type: circle;' }, [h('strong', {}, ['Modern Prism: ']), 'Bauhaus Geometric, Dichroic Rainbow, Celestial Nebula'])
        ])
      ]),

      // 6. COMING SOON / APP CONNECTION
      h('section', { class: 'section app-connection-section', style: 'text-align: center; margin-top: var(--space-8); padding-top: var(--space-6); border-top: 1px solid color-mix(in srgb, var(--line-strong) 24%, var(--line) 76%);' }, [
        h('h3', { style: 'font-family: Georgia, serif;' }, ['Experience Shattered Foil']),
        h('p', { class: 'meta', style: 'color: var(--text-muted); margin-top: var(--space-1);' }, ['Play directly on the web or install as a standalone lightweight web app.']),
        h('div', { style: 'margin-top: var(--space-4); display: flex; justify-content: center; gap: var(--space-3);' }, [
          h('button', { class: 'btn primary', style: 'background: linear-gradient(135deg, #C86432, #7A3617); color: #FFF; border: none; padding: 10px 24px; border-radius: 20px; font-weight: 700; cursor: pointer;' }, ['Play Klondike Solitaire']),
          h('button', { class: 'btn secondary', style: 'background: transparent; border: 1px solid #C86432; color: #F08E58; padding: 10px 20px; border-radius: 20px; font-weight: 600; cursor: pointer;' }, ['Explore Game Lore & Modes'])
        ]),
        h('div', { class: 'placeholder-app-store', style: 'margin-top: var(--space-6); background: color-mix(in srgb, var(--line-strong) 15%, transparent); height: 90px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-md); border: 1px dashed rgba(200, 100, 50, 0.3);' }, [
          h('p', { class: 'meta', style: 'font-size: 0.85rem; color: #8E98A8;' }, ['[ Responsive Scoped PWA • Offline-Ready • Instant TTI < 400ms ]'])
        ])
      ])

    ]);

    clearElement(container);
    container.appendChild(wrapper);

    return () => {
      // Cleanup handlers when navigating away
    };
  }
};

export default solitaireShatteredFoil;
