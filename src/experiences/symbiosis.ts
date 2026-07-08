import type { ExperienceModule, ExperienceContext } from '../platform/types';
import { events } from '../platform/events';

type RelationshipType = 'mutualism' | 'commensalism' | 'parasitism';

interface SymbiosisPair {
  id: string;
  organism1: string;
  organism2: string;
  type: RelationshipType;
  description: string;
  explanation: string;
}

const PAIRS: SymbiosisPair[] = [
  {
    id: 'clownfish-anemone',
    organism1: 'Clownfish',
    organism2: 'Sea Anemone',
    type: 'mutualism',
    description: 'The clownfish lives among the anemone\'s stinging tentacles. Both benefit.',
    explanation: 'The clownfish gains protection from predators (anemone stings do not affect it). The anemone gains nutrients from clownfish waste and gets cleaned of parasites.'
  },
  {
    id: 'bee-flower',
    organism1: 'Bee',
    organism2: 'Flowering Plant',
    type: 'mutualism',
    description: 'The bee visits the flower, collecting nectar. The flower is pollinated.',
    explanation: 'The bee receives food (nectar and pollen). The flower receives pollination — its pollen transferred to other flowers, enabling reproduction. Neither could thrive without the other.'
  },
  {
    id: 'remora-shark',
    organism1: 'Remora',
    organism2: 'Shark',
    type: 'commensalism',
    description: 'The remora attaches to the shark and feeds on scraps. The shark is unaffected.',
    explanation: 'The remora gets free transportation and leftover food. The shark neither benefits nor is harmed. It barely notices the remora\'s presence.'
  },
  {
    id: 'tick-deer',
    organism1: 'Tick',
    organism2: 'Deer',
    type: 'parasitism',
    description: 'The tick feeds on the deer\'s blood. The deer loses nutrients and may contract disease.',
    explanation: 'The tick benefits by receiving a blood meal. The deer is harmed — losing nutrients, suffering irritation, and risking disease transmission. This is parasitism: one benefits at the other\'s expense.'
  },
  {
    id: 'bird-nest-tree',
    organism1: 'Bird',
    organism2: 'Tree',
    type: 'commensalism',
    description: 'A bird builds its nest in a tree branch. The tree is not affected.',
    explanation: 'The bird gains shelter and a safe place to raise young. The tree is neither helped nor harmed by the nest. The tree would stand the same whether the bird nested there or not.'
  },
  {
    id: 'tapeworm-human',
    organism1: 'Tapeworm',
    organism2: 'Human',
    type: 'parasitism',
    description: 'The tapeworm lives inside the human intestine, absorbing nutrients.',
    explanation: 'The tapeworm benefits by receiving a constant food supply and a protected environment. The human is harmed — losing nutrients, suffering digestive problems, and risking long-term damage.'
  },
  {
    id: 'lichen',
    organism1: 'Fungus',
    organism2: 'Alga',
    type: 'mutualism',
    description: 'Fungus and alga grow together as lichen on rocks and bark. They form a single visible organism.',
    explanation: 'The fungus provides structure, water retention, and protection. The alga provides food through photosynthesis. Together they survive in places neither could alone.'
  },
  {
    id: 'barnacle-whale',
    organism1: 'Barnacle',
    organism2: 'Whale',
    type: 'commensalism',
    description: 'Barnacles attach to a whale\'s skin, filtering food from water as the whale swims.',
    explanation: 'The barnacle gains transport through nutrient-rich waters. The whale is largely unaffected — the barnacles cause minor drag but no significant harm.'
  },
  {
    id: 'cordyceps-ant',
    organism1: 'Cordyceps Fungus',
    organism2: 'Ant',
    type: 'parasitism',
    description: 'The fungus infects an ant, takes over its behavior, and grows a fruiting body from its body.',
    explanation: 'The fungus benefits by using the ant as a host to reproduce. The ant is killed — manipulated into climbing to a high point before the fungus consumes it from within.'
  },
  {
    id: 'oxpecker-zebra',
    organism1: 'Oxpecker',
    organism2: 'Zebra',
    type: 'mutualism',
    description: 'The oxpecker bird rides on the zebra, eating ticks and other parasites.',
    explanation: 'The oxpecker gets food. The zebra gets parasites removed. Both benefit from the arrangement — though some studies suggest the oxpecker may also drink blood from wounds, making it slightly parasitic.'
  }
];

const STORAGE_KEY = 'symbiosis-progress';

function loadProgress(): { completed: string[]; correct: number; total: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if ( raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { completed: [], correct: 0, total: 0 };
}

function saveProgress(p: { completed: string[]; correct: number; total: number }): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

const relationshipInfo: Record<RelationshipType, { label: string; color: string; definition: string }> = {
  mutualism: { label: 'Mutualism', color: '#22c55e', definition: 'Both species benefit from the relationship.' },
  commensalism: { label: 'Commensalism', color: '#3b82f6', definition: 'One species benefits; the other is unaffected.' },
  parasitism: { label: 'Parasitism', color: '#ef4444', definition: 'One species benefits at the expense of the other.' }
};

const symbiosis: ExperienceModule = {
  mount(container: HTMLElement, context: ExperienceContext) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'symbiosis';
    wrapper.style.cssText = 'padding: 1rem; max-width: 640px; margin: 0 auto;';

    let progress = loadProgress();
    let currentIdx = 0;
    // Find first uncompleted pair
    for (let i = 0; i < PAIRS.length; i++) {
      if (!progress.completed.includes(PAIRS[i].id)) {
        currentIdx = i;
        break;
      }
    }

    let selected: RelationshipType | null = null;
    let revealed = false;

    const title = document.createElement('h2');
    title.textContent = 'Symbiosis';

    const desc = document.createElement('p');
    desc.className = 'lead';
    desc.textContent = 'Two species. One relationship. Is it mutualism, commensalism, or parasitism?';

    const stats = document.createElement('div');
    stats.style.cssText = 'font-size: 0.875rem; color: GrayText; margin-bottom: 1rem;';

    const legend = document.createElement('div');
    legend.style.cssText = 'display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem; font-size: 0.85rem;';

    const pairCard = document.createElement('div');
    pairCard.style.cssText = 'padding: 1rem; border: 1px solid ButtonBorder; border-radius: 0.5rem; background: ButtonFace; margin: 1rem 0;';

    const choicesArea = document.createElement('div');
    choicesArea.style.cssText = 'display: flex; gap: 0.5rem; flex-wrap: wrap; margin: 1rem 0;';

    const resultArea = document.createElement('div');
    resultArea.style.cssText = 'margin-top: 1rem;';

    const controls = document.createElement('div');
    controls.style.cssText = 'display: flex; gap: 0.5rem; margin-top: 1rem;';

    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn primary';
    nextBtn.textContent = 'Next Pair';
    nextBtn.style.display = 'none';
    nextBtn.addEventListener('click', () => {
      currentIdx = (currentIdx + 1) % PAIRS.length;
      selected = null;
      revealed = false;
      render();
    });

    function updateStats() {
      const accuracy = progress.total > 0 ? Math.round((progress.correct / progress.total) * 100) : 0;
      stats.textContent = `Pairs: ${progress.completed.length}/${PAIRS.length} • Accuracy: ${accuracy}%`;
    }

    function renderLegend() {
      legend.innerHTML = '';
      (Object.entries(relationshipInfo) as [RelationshipType, typeof relationshipInfo[RelationshipType]][]).forEach(([, info]) => {
        const el = document.createElement('span');
        el.style.cssText = `padding: 0.25rem 0.5rem; border: 1px solid ${info.color}; border-radius: 0.25rem; color: ${info.color}; font-size: 0.8rem;`;
        el.textContent = info.label;
        legend.appendChild(el);
      });
    }

    function renderPair() {
      const pair = PAIRS[currentIdx];
      pairCard.innerHTML = '';

      const organisms = document.createElement('div');
      organisms.style.cssText = 'display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1rem;';

      const org1 = document.createElement('span');
      org1.style.cssText = 'padding: 0.35rem 0.6rem; border: 1px solid ButtonBorder; border-radius: 999px; background: canvas; font-size: 0.85rem;';
      org1.textContent = pair.organism1;

      const vs = document.createElement('span');
      vs.style.cssText = 'font-weight: 600; color: GrayText;';
      vs.textContent = '&';

      const org2 = document.createElement('span');
      org2.style.cssText = 'padding: 0.35rem 0.6rem; border: 1px solid ButtonBorder; border-radius: 999px; background: canvas; font-size: 0.85rem;';
      org2.textContent = pair.organism2;

      organisms.append(org1, vs, org2);

      const names = document.createElement('p');
      names.style.cssText = 'font-weight: 600; margin-bottom: 0.5rem;';
      names.textContent = `${pair.organism1} + ${pair.organism2}`;

      const description = document.createElement('p');
      description.style.cssText = 'line-height: 1.5; margin-bottom: 0;';
      description.textContent = pair.description;

      pairCard.append(organisms, names, description);
    }

    function renderChoices() {
      choicesArea.innerHTML = '';
      (Object.entries(relationshipInfo) as [RelationshipType, typeof relationshipInfo[RelationshipType]][]).forEach(([type, info]) => {
        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.style.cssText = `padding: 0.5rem 1rem; border: 2px solid ${revealed && type === PAIRS[currentIdx].type ? info.color : 'ButtonBorder'};`;
        btn.textContent = info.label;

        if (revealed) {
          if (type === PAIRS[currentIdx].type) {
            btn.style.background = info.color + '22';
            btn.style.borderColor = info.color;
          } else if (type === selected && type !== PAIRS[currentIdx].type) {
            btn.style.background = '#ef444422';
            btn.style.borderColor = '#ef4444';
          }
          btn.style.opacity = '0.7';
          btn.disabled = true;
        } else {
          btn.addEventListener('click', () => {
            selected = type;
            revealed = true;
            progress.total += 1;
            if (type === PAIRS[currentIdx].type) {
              progress.correct += 1;
            }
            if (!progress.completed.includes(PAIRS[currentIdx].id)) {
              progress.completed.push(PAIRS[currentIdx].id);
            }
            saveProgress(progress);
            updateStats();
            render();

            events.emit('experience_interaction', {
              experience_id: context.meta.id,
              action: type === PAIRS[currentIdx].type ? 'correct' : 'incorrect',
              pair: PAIRS[currentIdx].id,
              correct_type: PAIRS[currentIdx].type,
              selected: type
            });
          });
        }

        choicesArea.appendChild(btn);
      });
    }

    function renderResult() {
      resultArea.innerHTML = '';
      if (!revealed) return;

      const pair = PAIRS[currentIdx];
      const info = relationshipInfo[pair.type];
      const isCorrect = selected === pair.type;

      const card = document.createElement('div');
      card.style.cssText = `padding: 1rem; border: 1px solid ${info.color}; border-radius: 0.5rem; background: ${info.color}11;`;

      const heading = document.createElement('h4');
      heading.style.cssText = `margin-top: 0; color: ${info.color};`;
      heading.textContent = isCorrect ? `Correct — ${info.label}` : `Not quite — this is ${info.label}`;

      const def = document.createElement('p');
      def.style.cssText = 'font-style: italic; margin-bottom: 0.5rem;';
      def.textContent = info.definition;

      const expl = document.createElement('p');
      expl.style.cssText = 'margin-bottom: 0; line-height: 1.5; font-size: 0.9rem;';
      expl.textContent = pair.explanation;

      card.append(heading, def, expl);
      resultArea.appendChild(card);

      nextBtn.style.display = 'inline-flex';
    }

    function render() {
      updateStats();
      renderLegend();
      renderPair();
      renderChoices();
      renderResult();
    }

    wrapper.append(title, desc, stats, legend, pairCard, choicesArea, resultArea, controls, nextBtn);
    container.appendChild(wrapper);

    render();

    return () => {};
  }
};

export default symbiosis;
