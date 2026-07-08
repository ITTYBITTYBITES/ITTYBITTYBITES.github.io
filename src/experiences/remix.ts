import type { ExperienceModule, ExperienceContext } from '../platform/types';
import { events } from '../platform/events';

interface Element {
  id: string;
  name: string;
  domain: string;
}

interface RemixScenario {
  id: string;
  title: string;
  prompt: string;
  elements: Element[];
  validCombos: { a: string; b: string; result: string; explanation: string }[];
}

const SCENARIOS: RemixScenario[] = [
  {
    id: 'instruments',
    title: 'Sound Collision',
    prompt: 'Combine elements from different musical traditions to discover new genres.',
    elements: [
      { id: 'blues', name: 'Blues Scale', domain: 'African-American' },
      { id: 'classical', name: 'Orchestra', domain: 'European Classical' },
      { id: 'electronic', name: 'Synthesizer', domain: 'Electronic' },
      { id: 'tablas', name: 'Tabla Rhythm', domain: 'Indian' },
      { id: 'jazz', name: 'Jazz Improvisation', domain: 'African-American' },
      { id: 'folk', name: 'Folk Melody', domain: 'Celtic' }
    ],
    validCombos: [
      { a: 'blues', b: 'classical', result: 'Third Stream', explanation: 'Blues harmony meets orchestral texture — George Gershwin, Duke Ellington.' },
      { a: 'electronic', b: 'tablas', result: 'Asian Underground', explanation: 'Electronic beats fused with Indian percussion — Talvin Singh, Nitin Sawhney.' },
      { a: 'jazz', b: 'folk', result: 'Celtic Jazz', explanation: 'Improvisation meets traditional melody — Altan, Planxty.' },
      { a: 'blues', b: 'electronic', result: 'Electro-Blues', explanation: 'Raw emotion processed through digital tools — Gary Clark Jr.' },
      { a: 'classical', b: 'electronic', result: 'Neoclassical Electronic', explanation: 'Orchestral composition with synthesized sound — Ólafur Arnalds.' },
      { a: 'tablas', b: 'jazz', result: 'Indo-Jazz Fusion', explanation: 'Indian rhythm meets jazz harmony — John McLaughlin, Shakti.' }
    ]
  },
  {
    id: 'tools',
    title: 'Tool Hybrid',
    prompt: 'Combine tools from different fields to invent something new.',
    elements: [
      { id: 'lens', name: 'Magnifying Lens', domain: 'Science' },
      { id: 'brush', name: 'Paintbrush', domain: 'Art' },
      { id: 'code', name: 'Algorithm', domain: 'Computing' },
      { id: 'map', name: 'Map', domain: 'Navigation' },
      { id: 'body', name: 'Human Body', domain: 'Biology' },
      { id: 'story', name: 'Narrative', domain: 'Literature' }
    ],
    validCombos: [
      { a: 'lens', b: 'body', result: 'Medical Imaging', explanation: 'Looking inside the human body — MRI, X-ray, endoscopy.' },
      { a: 'code', b: 'map', result: 'GPS Navigation', explanation: 'Algorithms applied to spatial data — Google Maps, autonomous vehicles.' },
      { a: 'brush', b: 'code', result: 'Generative Art', explanation: 'Algorithms creating visual art — Processing, p5.js.' },
      { a: 'story', b: 'code', result: 'Interactive Fiction', explanation: 'Narrative powered by logic — video games, hypertext.' },
      { a: 'body', b: 'code', result: 'Wearable Technology', explanation: 'Computing integrated with the body — fitness trackers, prosthetics.' },
      { a: 'story', b: 'body', result: 'Embodied Performance', explanation: 'Physical movement as narrative — dance, theater, performance art.' }
    ]
  },
  {
    id: 'structures',
    title: 'Form Mashup',
    prompt: 'Combine structural patterns from different domains to create new forms.',
    elements: [
      { id: 'spiral', name: 'Spiral', domain: 'Nature' },
      { id: 'grid', name: 'Grid', domain: 'Urban Planning' },
      { id: 'branch', name: 'Branching Tree', domain: 'Nature' },
      { id: 'arch', name: 'Arch', domain: 'Architecture' },
      { id: 'wave', name: 'Wave', domain: 'Physics' },
      { id: 'web', name: 'Web/Network', domain: 'Technology' }
    ],
    validCombos: [
      { a: 'spiral', b: 'arch', result: 'Spiral Architecture', explanation: 'Buildings that coil — Guggenheim Museum, spiral ramps in parking structures.' },
      { a: 'grid', b: 'web', result: 'Distributed Networks', explanation: 'Decentralized grids — the internet, mesh networks.' },
      { a: 'branch', b: 'web', result: 'Fractal Networks', explanation: 'Hierarchical yet interconnected — neural networks, organizational charts.' },
      { a: 'wave', b: 'grid', result: 'Parametric Design', explanation: 'Waves imposed on grids — Zaha Hadid architecture, acoustic panels.' },
      { a: 'spiral', b: 'wave', result: 'Fibonacci Design', explanation: 'Natural spirals meet wave patterns — nautilus shells, hurricane design.' },
      { a: 'arch', b: 'branch', result: 'Organic Structure', explanation: 'Buildings that grow like trees — Sagrada Familia, bio-mimetic design.' }
    ]
  }
];

const STORAGE_KEY = 'remix-progress';

function loadProgress(): { combosFound: string[]; scenariosCompleted: string[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { combosFound: [], scenariosCompleted: [] };
}

function saveProgress(p: { combosFound: string[]; scenariosCompleted: string[] }): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

const remix: ExperienceModule = {
  mount(container: HTMLElement, context: ExperienceContext) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'remix';
    wrapper.style.cssText = 'padding: 1rem; max-width: 640px; margin: 0 auto;';

    let progress = loadProgress();
    let currentScenarioIdx = 0;
    let selectedElements: string[] = [];
    let foundInSession: string[] = [];

    const title = document.createElement('h2');
    title.textContent = 'Remix';

    const desc = document.createElement('p');
    desc.className = 'lead';
    desc.textContent = 'Nothing comes from nothing. Combine existing elements in new ways. Innovation is often recombination.';

    const stats = document.createElement('div');
    stats.style.cssText = 'font-size: 0.875rem; color: GrayText; margin-bottom: 1rem;';

    const scenarioTabs = document.createElement('div');
    scenarioTabs.style.cssText = 'display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem;';
    scenarioTabs.setAttribute('role', 'tablist');

    const promptCard = document.createElement('div');
    promptCard.style.cssText = 'padding: 1rem; border: 1px solid ButtonBorder; border-radius: 0.5rem; background: ButtonFace; margin: 1rem 0;';

    const elementsArea = document.createElement('div');
    elementsArea.style.cssText = 'margin: 1rem 0;';

    const combineBtn = document.createElement('button');
    combineBtn.className = 'btn primary';
    combineBtn.textContent = 'Combine';
    combineBtn.style.display = 'none';
    combineBtn.style.marginTop = '0.5rem';

    const resultsArea = document.createElement('div');
    resultsArea.style.cssText = 'margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem;';

    const allResultsArea = document.createElement('div');
    allResultsArea.style.cssText = 'margin-top: 1rem;';

    const controls = document.createElement('div');
    controls.style.cssText = 'display: flex; gap: 0.5rem; margin-top: 1rem;';

    function updateStats() {
      const totalCombos = SCENARIOS.reduce((sum, s) => sum + s.validCombos.length, 0);
      stats.textContent = `Combinations found: ${progress.combosFound.length}/${totalCombos} • Scenarios: ${progress.scenariosCompleted.length}/${SCENARIOS.length}`;
    }

    function renderTabs() {
      scenarioTabs.innerHTML = '';
      SCENARIOS.forEach((s, idx) => {
        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.textContent = s.title;
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-selected', String(idx === currentScenarioIdx));
        const completed = progress.scenariosCompleted.includes(s.id);
        if (idx === currentScenarioIdx) {
          btn.style.background = 'AccentColor';
          btn.style.color = 'AccentColorText';
        } else if (completed) {
          btn.style.borderColor = '#22c55e';
        }
        btn.addEventListener('click', () => {
          currentScenarioIdx = idx;
          selectedElements = [];
          foundInSession = [];
          render();
        });
        scenarioTabs.appendChild(btn);
      });
    }

    function renderPrompt() {
      const scenario = SCENARIOS[currentScenarioIdx];
      promptCard.innerHTML = '';

      const heading = document.createElement('h3');
      heading.style.marginTop = '0';
      heading.textContent = scenario.title;

      const prompt = document.createElement('p');
      prompt.style.cssText = 'margin-bottom: 0; line-height: 1.5;';
      prompt.textContent = scenario.prompt;

      promptCard.append(heading, prompt);
    }

    function renderElements() {
      const scenario = SCENARIOS[currentScenarioIdx];
      elementsArea.innerHTML = '';

      const instruction = document.createElement('p');
      instruction.style.cssText = 'font-weight: 600; font-size: 0.9rem; margin-bottom: 0.5rem;';
      instruction.textContent = 'Select two elements to combine:';
      elementsArea.appendChild(instruction);

      const grid = document.createElement('div');
      grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 0.5rem;';

      scenario.elements.forEach(el => {
        const btn = document.createElement('button');
        btn.className = 'btn';
        const isSelected = selectedElements.includes(el.id);
        btn.style.cssText = `padding: 0.75rem 0.5rem; text-align: center; border: 2px solid ${isSelected ? 'AccentColor' : 'ButtonBorder'}; background: ${isSelected ? 'AccentColor' + '22' : 'ButtonFace'};`;
        btn.innerHTML = `<div style="font-size: 0.95rem; font-weight: 600;">${el.name}</div><div style="font-size: 0.7rem; color: GrayText; margin-top: 0.25rem;">${el.domain}</div>`;
        btn.setAttribute('aria-label', `${el.name} from ${el.domain}${isSelected ? ' (selected)' : ''}`);

        btn.addEventListener('click', () => {
          if (isSelected) {
            selectedElements = selectedElements.filter(e => e !== el.id);
          } else if (selectedElements.length < 2) {
            selectedElements.push(el.id);
          } else {
            selectedElements = [el.id];
          }
          renderElements();
          updateCombine();
        });

        grid.appendChild(btn);
      });

      elementsArea.appendChild(grid);
    }

    function updateCombine() {
      if (selectedElements.length === 2) {
        combineBtn.style.display = 'inline-flex';
      } else {
        combineBtn.style.display = 'none';
      }
    }

    function tryCombine() {
      if (selectedElements.length !== 2) return;

      const scenario = SCENARIOS[currentScenarioIdx];
      const [a, b] = selectedElements;
      const combo = scenario.validCombos.find(c =>
        (c.a === a && c.b === b) || (c.a === b && c.b === a)
      );

      const comboKey = `${scenario.id}:${[a, b].sort().join('+')}`;

      if (combo) {
        const card = document.createElement('div');
        card.style.cssText = 'padding: 1rem; border: 1px solid #22c55e; border-radius: 0.5rem; background: #22c55e11;';

        const heading = document.createElement('h4');
        heading.style.cssText = 'margin-top: 0; color: #16a34a;';
        heading.textContent = `New form: ${combo.result}`;

        const expl = document.createElement('p');
        expl.style.cssText = 'margin-bottom: 0;';
        expl.textContent = combo.explanation;

        card.append(heading, expl);
        resultsArea.appendChild(card);

        if (!progress.combosFound.includes(comboKey)) {
          progress.combosFound.push(comboKey);
          foundInSession.push(comboKey);

          // Check if scenario complete
          if (foundInSession.length >= scenario.validCombos.length) {
            if (!progress.scenariosCompleted.includes(scenario.id)) {
              progress.scenariosCompleted.push(scenario.id);
            }
          }
          saveProgress(progress);
          updateStats();
          renderTabs();
          renderAllResults();
        }

        events.emit('experience_interaction', {
          experience_id: context.meta.id,
          action: 'combination_found',
          scenario: scenario.id,
          result: combo.result
        });
      } else {
        const card = document.createElement('div');
        card.style.cssText = 'padding: 0.75rem; border: 1px solid #eab308; border-radius: 0.5rem; background: #eab30811;';
        card.innerHTML = `<p style="margin-bottom:0;font-size:0.9rem;">No established form emerged from this combination. Try different elements — or this combination may be truly original.</p>`;
        resultsArea.appendChild(card);
      }

      selectedElements = [];
      renderElements();
      updateCombine();
    }

    function renderAllResults() {
      const scenario = SCENARIOS[currentScenarioIdx];
      allResultsArea.innerHTML = '';

      const totalCombos = scenario.validCombos.length;
      const foundHere = progress.combosFound.filter(k => k.startsWith(scenario.id + ':')).length;

      const progressEl = document.createElement('p');
      progressEl.style.cssText = 'font-size: 0.85rem; color: GrayText;';
      progressEl.textContent = `Combinations found in this scenario: ${foundHere}/${totalCombos}`;
      if (foundHere >= totalCombos) {
        progressEl.textContent += ' — Complete!';
        progressEl.style.color = '#22c55e';
        progressEl.style.fontWeight = '600';
      }
      allResultsArea.appendChild(progressEl);

      // Show found combinations
      scenario.validCombos.forEach(combo => {
        const comboKey = `${scenario.id}:${[combo.a, combo.b].sort().join('+')}`;
        if (progress.combosFound.includes(comboKey)) {
          const el1 = scenario.elements.find(e => e.id === combo.a)!;
          const el2 = scenario.elements.find(e => e.id === combo.b)!;
          const tag = document.createElement('span');
          tag.style.cssText = 'display: inline-block; padding: 0.25rem 0.5rem; margin: 0.15rem; border: 1px solid #22c55e; border-radius: 999px; font-size: 0.8rem; color: #22c55e;';
          tag.textContent = `${el1.name} + ${el2.name} → ${combo.result}`;
          allResultsArea.appendChild(tag);
        }
      });
    }

    function render() {
      updateStats();
      renderTabs();
      renderPrompt();
      renderElements();
      updateCombine();
      resultsArea.innerHTML = '';
      renderAllResults();
      controls.innerHTML = '';
    }

    combineBtn.addEventListener('click', tryCombine);

    wrapper.append(title, desc, stats, scenarioTabs, promptCard, elementsArea, combineBtn, resultsArea, allResultsArea, controls);
    container.appendChild(wrapper);

    render();

    return () => {};
  }
};

export default remix;
