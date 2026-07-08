import type { ExperienceModule, ExperienceContext } from '../platform/types';
import { events } from '../platform/events';

interface Species {
  id: string;
  name: string;
  type: 'producer' | 'herbivore' | 'predator' | 'apex';
  icon: string;
  eats: string[];
}

interface EcosystemScenario {
  id: string;
  name: string;
  description: string;
  species: Species[];
  challenge: string;
}

const SCENARIOS: EcosystemScenario[] = [
  {
    id: 'meadow',
    name: 'The Meadow',
    description: 'A grassland ecosystem with grasses, insects, small mammals, and a raptor.',
    challenge: 'Remove one species and observe how the food web responds.',
    species: [
      { id: 'grass', name: 'Wild Grass', type: 'producer', icon: '🌾', eats: [] },
      { id: 'wildflowers', name: 'Wildflowers', type: 'producer', icon: '🌻', eats: [] },
      { id: 'grasshopper', name: 'Grasshopper', type: 'herbivore', icon: '🦗', eats: ['grass', 'wildflowers'] },
      { id: 'rabbit', name: 'Rabbit', type: 'herbivore', icon: '🐇', eats: ['grass', 'wildflowers'] },
      { id: 'mouse', name: 'Field Mouse', type: 'herbivore', icon: '🐭', eats: ['grass', 'wildflowers'] },
      { id: 'snake', name: 'Garter Snake', type: 'predator', icon: '🐍', eats: ['mouse', 'grasshopper'] },
      { id: 'hawk', name: 'Red-tailed Hawk', type: 'apex', icon: '🦅', eats: ['rabbit', 'mouse', 'snake'] }
    ]
  },
  {
    id: 'pond',
    name: 'The Pond',
    description: 'A freshwater pond with algae, insects, fish, and a heron.',
    challenge: 'Remove one species and observe how the food web responds.',
    species: [
      { id: 'algae', name: 'Algae', type: 'producer', icon: '🟢', eats: [] },
      { id: 'lily', name: 'Water Lily', type: 'producer', icon: '🪷', eats: [] },
      { id: 'snail', name: 'Pond Snail', type: 'herbivore', icon: '🐌', eats: ['algae', 'lily'] },
      { id: 'dragonfly', name: 'Dragonfly', type: 'herbivore', icon: '🪰', eats: ['algae'] },
      { id: 'frog', name: 'Frog', type: 'predator', icon: '🐸', eats: ['snail', 'dragonfly'] },
      { id: 'fish', name: 'Bluegill', type: 'predator', icon: '🐟', eats: ['snail', 'dragonfly', 'frog'] },
      { id: 'heron', name: 'Great Blue Heron', type: 'apex', icon: '🦩', eats: ['fish', 'frog'] }
    ]
  },
  {
    id: 'forest',
    name: 'The Forest',
    description: 'A temperate forest with trees, fungi, deer, and a wolf pack.',
    challenge: 'Remove one species and observe how the food web responds.',
    species: [
      { id: 'oak', name: 'Oak Tree', type: 'producer', icon: '🌳', eats: [] },
      { id: 'fern', name: 'Ferns', type: 'producer', icon: '🌿', eats: [] },
      { id: 'fungi', name: 'Mushrooms', type: 'producer', icon: '🍄', eats: [] },
      { id: 'caterpillar', name: 'Caterpillar', type: 'herbivore', icon: '🐛', eats: ['oak', 'fern'] },
      { id: 'deer', name: 'White-tailed Deer', type: 'herbivore', icon: '🦌', eats: ['oak', 'fern'] },
      { id: 'songbird', name: 'Songbird', type: 'predator', icon: '🐦', eats: ['caterpillar', 'fungi'] },
      { id: 'fox', name: 'Red Fox', type: 'predator', icon: '🦊', eats: ['songbird', 'caterpillar'] },
      { id: 'wolf', name: 'Gray Wolf', type: 'apex', icon: '🐺', eats: ['deer', 'fox'] }
    ]
  }
];

const STORAGE_KEY = 'ecosystem-progress';

function loadProgress(): { scenariosExplored: string[]; removals: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { scenariosExplored: [], removals: 0 };
}

function saveProgress(p: { scenariosExplored: string[]; removals: number }): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

function computeEffects(scenario: EcosystemScenario, removedId: string): { affected: string[]; explanation: string } {
  const species = scenario.species;
  const remaining = species.filter(s => s.id !== removedId);
  const removed = species.find(s => s.id === removedId)!;
  const affected = new Set<string>();

  // Find species that eat the removed one
  remaining.forEach(s => {
    if (s.eats.includes(removedId)) {
      affected.add(s.id);
    }
  });

  // Find prey of removed that now benefit (less predation)
  remaining.forEach(s => {
    if (removed.eats.includes(s.id)) {
      affected.add(s.id);
    }
  });

  // Second-order: species affected by changes in affected species
  const firstOrder = new Set(affected);
  remaining.forEach(s => {
    for (const fid of firstOrder) {
      if (s.eats.includes(fid) || removed.eats.includes(s.id)) {
        if (s.id !== removedId) affected.add(s.id);
      }
    }
  });

  let explanation = '';
  const eaters = remaining.filter(s => s.eats.includes(removedId));
  const prey = remaining.filter(s => removed.eats.includes(s.id));

  if (removed.type === 'producer') {
    explanation = `Without ${removed.name}, the herbivores that depend on it lose a food source. `;
    if (prey.length > 0) {
      explanation += `${prey.map(p => p.name).join(', ')} must compete harder for remaining plants.`;
    }
  } else if (removed.type === 'apex') {
    explanation = `Without ${removed.name}, the predator population loses its check. `;
    if (prey.length > 0) {
      explanation += `${prey.map(p => p.name).join(', ')} populations may surge, putting pressure on their prey.`;
    }
  } else {
    explanation = `Removing ${removed.name} creates a gap in the food web. `;
    if (eaters.length > 0) {
      explanation += `${eaters.map(e => e.name).join(', ')} lose a food source. `;
    }
    if (prey.length > 0) {
      explanation += `${prey.map(p => p.name).join(', ')} face less predation and may grow.`;
    }
  }

  return { affected: Array.from(affected), explanation };
}

const ecosystem: ExperienceModule = {
  mount(container: HTMLElement, context: ExperienceContext) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'ecosystem';
    wrapper.style.cssText = 'padding: 1rem; max-width: 640px; margin: 0 auto;';

    let progress = loadProgress();
    let currentScenarioIdx = 0;
    // Find first unexplored scenario
    for (let i = 0; i < SCENARIOS.length; i++) {
      if (!progress.scenariosExplored.includes(SCENARIOS[i].id)) {
        currentScenarioIdx = i;
        break;
      }
    }

    let removedId: string | null = null;
    let effects: { affected: string[]; explanation: string } | null = null;

    const title = document.createElement('h2');
    title.textContent = 'Ecosystem';

    const desc = document.createElement('p');
    desc.className = 'lead';
    desc.textContent = 'Build a food web. Remove a species. Watch the ripple effects spread through every connection.';

    const stats = document.createElement('div');
    stats.style.cssText = 'font-size: 0.875rem; color: GrayText; margin-bottom: 1rem;';

    const scenarioTabs = document.createElement('div');
    scenarioTabs.style.cssText = 'display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem;';
    scenarioTabs.setAttribute('role', 'tablist');

    const webArea = document.createElement('div');
    webArea.style.cssText = 'padding: 1rem; border: 1px solid ButtonBorder; border-radius: 0.5rem; background: ButtonFace; margin: 1rem 0;';

    const challengeEl = document.createElement('p');
    challengeEl.style.cssText = 'font-weight: 600; margin: 1rem 0 0.5rem;';

    const instruction = document.createElement('p');
    instruction.style.cssText = 'font-size: 0.9rem; color: GrayText; margin-bottom: 1rem;';
    instruction.textContent = 'Click any species to remove it from the ecosystem and see what happens.';

    const effectsArea = document.createElement('div');
    effectsArea.style.cssText = 'margin-top: 1rem;';

    const resetBtn = document.createElement('button');
    resetBtn.className = 'btn';
    resetBtn.textContent = 'Restore species';
    resetBtn.style.display = 'none';
    resetBtn.addEventListener('click', () => {
      removedId = null;
      effects = null;
      renderWeb();
      effectsArea.innerHTML = '';
      resetBtn.style.display = 'none';
    });

    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn primary';
    nextBtn.textContent = 'Next Ecosystem →';
    nextBtn.style.display = 'none';
    nextBtn.addEventListener('click', () => {
      currentScenarioIdx = (currentScenarioIdx + 1) % SCENARIOS.length;
      removedId = null;
      effects = null;
      renderScenario();
    });

    function updateStats() {
      stats.textContent = `Ecosystems explored: ${progress.scenariosExplored.length}/${SCENARIOS.length} • Removals tested: ${progress.removals}`;
    }

    function renderScenarioTabs() {
      scenarioTabs.innerHTML = '';
      SCENARIOS.forEach((s, idx) => {
        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.textContent = s.name;
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-selected', String(idx === currentScenarioIdx));
        const explored = progress.scenariosExplored.includes(s.id);
        if (explored) {
          btn.style.borderColor = '#22c55e';
        }
        if (idx === currentScenarioIdx) {
          btn.style.background = 'AccentColor';
          btn.style.color = 'AccentColorText';
        }
        btn.addEventListener('click', () => {
          currentScenarioIdx = idx;
          removedId = null;
          effects = null;
          renderScenario();
        });
        scenarioTabs.appendChild(btn);
      });
    }

    function renderWeb() {
      const scenario = SCENARIOS[currentScenarioIdx];
      webArea.innerHTML = '';

      const webTitle = document.createElement('h3');
      webTitle.textContent = scenario.name;
      webTitle.style.marginTop = '0';
      webArea.appendChild(webTitle);

      // Group by type
      const groups: { type: string; label: string; species: Species[] }[] = [
        { type: 'producer', label: 'Producers', species: scenario.species.filter(s => s.type === 'producer') },
        { type: 'herbivore', label: 'Herbivores', species: scenario.species.filter(s => s.type === 'herbivore') },
        { type: 'predator', label: 'Predators', species: scenario.species.filter(s => s.type === 'predator') },
        { type: 'apex', label: 'Apex', species: scenario.species.filter(s => s.type === 'apex') }
      ];

      const grid = document.createElement('div');
      grid.style.cssText = 'display: flex; flex-direction: column; gap: 0.75rem;';

      groups.forEach(group => {
        if (group.species.length === 0) return;
        const row = document.createElement('div');
        row.style.cssText = 'display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;';
        const label = document.createElement('span');
        label.style.cssText = 'font-size: 0.75rem; color: GrayText; min-width: 70px; text-transform: uppercase; letter-spacing: 0.05em;';
        label.textContent = group.label;
        row.appendChild(label);

        group.species.forEach(sp => {
          const btn = document.createElement('button');
          const isRemoved = removedId === sp.id;
          const isAffected = effects && effects.affected.includes(sp.id);
          btn.style.cssText = `padding: 0.5rem 0.75rem; border: 2px solid ${isRemoved ? '#ef4444' : isAffected ? '#eab308' : 'ButtonBorder'}; border-radius: 0.5rem; background: ${isRemoved ? '#ef444422' : isAffected ? '#eab30822' : 'ButtonFace'}; cursor: pointer; font-size: 0.9rem; opacity: ${isRemoved ? 0.5 : 1};`;
          btn.textContent = `${sp.icon} ${sp.name}`;
          btn.setAttribute('aria-label', `${sp.name} (${group.label})${isRemoved ? ' - removed' : isAffected ? ' - affected' : ''}`);
          if (!isRemoved) {
            btn.addEventListener('click', () => {
              removedId = sp.id;
              effects = computeEffects(scenario, sp.id);
              progress.removals += 1;
              if (!progress.scenariosExplored.includes(scenario.id)) {
                progress.scenariosExplored.push(scenario.id);
              }
              saveProgress(progress);
              updateStats();
              renderWeb();
              renderEffects();
              renderScenarioTabs();

              if (progress.scenariosExplored.length >= SCENARIOS.length) {
                nextBtn.style.display = 'none';
              } else {
                nextBtn.style.display = 'inline-flex';
              }
              resetBtn.style.display = 'inline-flex';

              events.emit('experience_interaction', {
                experience_id: context.meta.id,
                action: 'species_removed',
                ecosystem: scenario.id,
                species: sp.id,
                affected_count: effects!.affected.length
              });
            });
          }
          row.appendChild(btn);
        });

        grid.appendChild(row);
      });

      webArea.appendChild(grid);
      challengeEl.textContent = scenario.challenge;
    }

    function renderEffects() {
      effectsArea.innerHTML = '';
      if (!effects || !removedId) return;

      const scenario = SCENARIOS[currentScenarioIdx];
      const removed = scenario.species.find(s => s.id === removedId)!;

      const card = document.createElement('div');
      card.style.cssText = 'padding: 1rem; border: 1px solid #eab308; border-radius: 0.5rem; background: #eab30811;';

      const heading = document.createElement('h4');
      heading.style.marginTop = '0';
      heading.textContent = `${removed.icon} ${removed.name} removed`;

      const expl = document.createElement('p');
      expl.textContent = effects.explanation;
      expl.style.marginBottom = '0.5rem';

      const affectedNames = effects.affected.map(id => {
        const sp = scenario.species.find(s => s.id === id);
        return sp ? `${sp.icon} ${sp.name}` : id;
      });

      const affectedList = document.createElement('p');
      affectedList.style.cssText = 'font-size: 0.85rem; color: GrayText; margin-bottom: 0;';
      affectedList.textContent = `Affected species: ${affectedNames.join(', ')}`;

      card.append(heading, expl, affectedList);
      effectsArea.appendChild(card);
    }

    function renderScenario() {
      renderScenarioTabs();
      renderWeb();
      if (effects) renderEffects();
      else effectsArea.innerHTML = '';
      updateStats();
      resetBtn.style.display = removedId ? 'inline-flex' : 'none';
      const allExplored = progress.scenariosExplored.length >= SCENARIOS.length;
      nextBtn.style.display = (removedId && !allExplored) ? 'inline-flex' : 'none';
    }

    wrapper.append(title, desc, stats, scenarioTabs, webArea, challengeEl, instruction, effectsArea, resetBtn, nextBtn);
    container.appendChild(wrapper);

    renderScenario();

    return () => {};
  }
};

export default ecosystem;
