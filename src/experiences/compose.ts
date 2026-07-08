import type { ExperienceModule, ExperienceContext } from '../platform/types';
import { events } from '../platform/events';

interface ComposableElement {
  id: string;
  text: string;
  icon: string;
}

interface CompositionScenario {
  id: string;
  title: string;
  instruction: string;
  elements: ComposableElement[];
  correctOrder: string[];
  principle: string;
}

const SCENARIOS: CompositionScenario[] = [
  {
    id: 'narrative',
    title: 'The Story Order',
    instruction: 'Arrange these sentences into a story that makes sense.',
    elements: [
      { id: 's5', text: 'She found what she was looking for — not the answer, but a better question.', icon: '💡' },
      { id: 's1', text: 'The letter arrived on a Tuesday, smelling of woodsmoke.', icon: '✉️' },
      { id: 's4', text: 'The last house on the road had its lights on.', icon: '🏠' },
      { id: 's2', text: 'She read it once, then folded it into her coat pocket without telling anyone.', icon: '📃' },
      { id: 's3', text: 'Three weeks later, she drove north until the road ran out.', icon: '🚗' }
    ],
    correctOrder: ['s1', 's2', 's3', 's4', 's5'],
    principle: 'Narrative follows causation and time. Each event creates the conditions for the next. The question at the end only matters because of everything that came before it.'
  },
  {
    id: 'argument',
    title: 'The Logical Case',
    instruction: 'Arrange these statements into a coherent argument.',
    elements: [
      { id: 'a1', text: 'All complex systems are vulnerable to cascading failure.', icon: '🔗' },
      { id: 'a4', text: 'Therefore, resilient systems need redundancy at every level.', icon: '✅' },
      { id: 'a3', text: 'The internet survives because it routes around damage — no single point of failure.', icon: '🌐' },
      { id: 'a2', text: 'Power grids, supply chains, and financial networks are all complex systems.', icon: '⚡' }
    ],
    correctOrder: ['a1', 'a2', 'a3', 'a4'],
    principle: 'Arguments move from general to specific to conclusion. The premise establishes the rule. The examples show the rule applies. The solution follows from the pattern.'
  },
  {
    id: 'melody',
    title: 'The Musical Phrase',
    instruction: 'Arrange these musical moments into a phrase that resolves.',
    elements: [
      { id: 'm1', text: 'A single note, held. The ear waits.', icon: '🎵' },
      { id: 'm2', text: 'A second note joins, creating tension. A minor third.', icon: '🎶' },
      { id: 'm4', text: 'Resolution. The first note returns, but changed by what came between.', icon: '🎼' },
      { id: 'm3', text: 'A rising motion. The phrase climbs toward something unresolved.', icon: '📈' }
    ],
    correctOrder: ['m1', 'm2', 'm3', 'm4'],
    principle: 'Music creates meaning through tension and release. A phrase establishes, develops, intensifies, and resolves. The ending feels inevitable because of the journey.'
  },
  {
    id: 'recipe',
    title: 'The Process',
    instruction: 'Arrange these steps into the order a chef would follow.',
    elements: [
      { id: 'r1', text: 'Read the recipe completely. Gather every ingredient and tool.', icon: '📋' },
      { id: 'r2', text: 'Preheat the oven. Prep vegetables. Measure spices.', icon: '🔪' },
      { id: 'r3', text: 'Sear the protein. Build the sauce in the same pan.', icon: '🍳' },
      { id: 'r4', text: 'Combine and transfer to the oven. Set the timer.', icon: '⏲️' },
      { id: 'r5', text: 'Rest before serving. Taste and adjust seasoning.', icon: '🍽️' }
    ],
    correctOrder: ['r1', 'r2', 'r3', 'r4', 'r5'],
    principle: 'Processes follow dependency. Each step enables the next. Preparation before action. Action before refinement. A chef who skips prep pays for it later.'
  }
];

const STORAGE_KEY = 'compose-progress';

function loadProgress(): { completed: string[]; attempts: number; bestOrders: Record<string, number> } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { completed: [], attempts: 0, bestOrders: {} };
}

function saveProgress(p: { completed: string[]; attempts: number; bestOrders: Record<string, number> }): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

const compose: ExperienceModule = {
  mount(container: HTMLElement, context: ExperienceContext) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'compose';
    wrapper.style.cssText = 'padding: 1rem; max-width: 640px; margin: 0 auto;';

    let progress = loadProgress();
    let currentIdx = 0;
    let currentOrder: string[] = [];

    const title = document.createElement('h2');
    title.textContent = 'Compose';

    const desc = document.createElement('p');
    desc.className = 'lead';
    desc.textContent = 'Elements alone are not a work. Arrangement is what creates meaning. Place, order, and relationship transform raw materials into coherence.';

    const stats = document.createElement('div');
    stats.style.cssText = 'font-size: 0.875rem; color: GrayText; margin-bottom: 1rem;';

    const scenarioCard = document.createElement('div');
    scenarioCard.style.cssText = 'padding: 1rem; border: 1px solid ButtonBorder; border-radius: 0.5rem; background: ButtonFace; margin: 1rem 0;';

    const compositionArea = document.createElement('div');
    compositionArea.style.cssText = 'margin: 1rem 0;';

    const feedbackArea = document.createElement('div');
    feedbackArea.style.cssText = 'margin-top: 1rem;';

    const controls = document.createElement('div');
    controls.style.cssText = 'display: flex; gap: 0.5rem; margin-top: 1rem;';

    function updateStats() {
      stats.textContent = `Compositions: ${progress.completed.length}/${SCENARIOS.length} • Attempts: ${progress.attempts}`;
    }

    function renderScenario() {
      const s = SCENARIOS[currentIdx];
      scenarioCard.innerHTML = '';

      const heading = document.createElement('h3');
      heading.style.marginTop = '0';
      heading.textContent = s.title;

      const instruction = document.createElement('p');
      instruction.style.cssText = 'line-height: 1.5; margin-bottom: 0;';
      instruction.textContent = s.instruction;

      scenarioCard.append(heading, instruction);
    }

    function renderComposition() {
      const s = SCENARIOS[currentIdx];
      compositionArea.innerHTML = '';

      // Initialize order if needed (shuffle)
      if (currentOrder.length !== s.elements.length) {
        currentOrder = [...s.elements].sort(() => Math.random() - 0.5).map(e => e.id);
      }

      const instruction = document.createElement('p');
      instruction.style.cssText = 'font-weight: 600; font-size: 0.9rem; margin-bottom: 0.5rem;';
      instruction.textContent = 'Use the ↑ ↓ buttons (or arrow keys) to reorder:';
      compositionArea.appendChild(instruction);

      const list = document.createElement('div');
      list.style.cssText = 'display: flex; flex-direction: column; gap: 0.35rem;';
      list.setAttribute('role', 'list');
      list.setAttribute('aria-label', 'Composable elements in order');

      currentOrder.forEach((elemId, idx) => {
        const elem = s.elements.find(e => e.id === elemId)!;
        const item = document.createElement('div');
        item.className = 'compose-item';
        item.setAttribute('role', 'listitem');
        item.setAttribute('draggable', 'true');
        item.style.cssText = 'padding: 0.6rem 0.75rem; border: 1px solid ButtonBorder; border-radius: 0.35rem; background: canvas; cursor: grab; display: flex; align-items: center; gap: 0.5rem; user-select: none;';

        const num = document.createElement('span');
        num.style.cssText = 'font-weight: 600; color: GrayText; min-width: 1.5rem;';
        num.textContent = `${idx + 1}.`;

        const icon = document.createElement('span');
        icon.style.fontSize = '1.1rem';
        icon.textContent = elem.icon;

        const text = document.createElement('span');
        text.style.cssText = 'flex: 1; line-height: 1.4;';
        text.textContent = elem.text;

        const moveBtns = document.createElement('div');
        moveBtns.style.cssText = 'display: flex; flex-direction: column; gap: 0.2rem; margin-left: auto;';

        const upBtn = document.createElement('button');
        upBtn.textContent = '↑';
        upBtn.style.cssText = 'padding: 0.4rem 0.6rem; font-size: 1rem; min-width: 2.5rem; min-height: 2rem; border: 1px solid ButtonBorder; border-radius: 0.25rem; background: ButtonFace; cursor: pointer;';
        upBtn.setAttribute('aria-label', `Move ${elem.text} up`);
        upBtn.disabled = idx === 0;
        upBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (idx > 0) {
            [currentOrder[idx], currentOrder[idx - 1]] = [currentOrder[idx - 1], currentOrder[idx]];
            renderComposition();
          }
        });

        const downBtn = document.createElement('button');
        downBtn.textContent = '↓';
        downBtn.style.cssText = 'padding: 0.4rem 0.6rem; font-size: 1rem; min-width: 2.5rem; min-height: 2rem; border: 1px solid ButtonBorder; border-radius: 0.25rem; background: ButtonFace; cursor: pointer;';
        downBtn.setAttribute('aria-label', `Move ${elem.text} down`);
        downBtn.disabled = idx === currentOrder.length - 1;
        downBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (idx < currentOrder.length - 1) {
            [currentOrder[idx], currentOrder[idx + 1]] = [currentOrder[idx + 1], currentOrder[idx]];
            renderComposition();
          }
        });

        moveBtns.append(upBtn, downBtn);
        item.append(num, icon, text, moveBtns);

        // Keyboard reordering
        item.setAttribute('tabindex', '0');
        item.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowUp' && idx > 0) {
            e.preventDefault();
            [currentOrder[idx], currentOrder[idx - 1]] = [currentOrder[idx - 1], currentOrder[idx]];
            renderComposition();
            const items = list.querySelectorAll('.compose-item');
            (items[idx - 1] as HTMLElement)?.focus();
          } else if (e.key === 'ArrowDown' && idx < currentOrder.length - 1) {
            e.preventDefault();
            [currentOrder[idx], currentOrder[idx + 1]] = [currentOrder[idx + 1], currentOrder[idx]];
            renderComposition();
            const items = list.querySelectorAll('.compose-item');
            (items[idx + 1] as HTMLElement)?.focus();
          }
        });

        list.appendChild(item);
      });

      compositionArea.appendChild(list);
    }

    function checkComposition() {
      const s = SCENARIOS[currentIdx];
      progress.attempts += 1;
      saveProgress(progress);

      let correct = 0;
      const details: { id: string; correct: boolean; text: string }[] = [];
      currentOrder.forEach((elemId, idx) => {
        const isCorrect = s.correctOrder[idx] === elemId;
        if (isCorrect) correct++;
        const elem = s.elements.find(e => e.id === elemId)!;
        details.push({ id: elemId, correct: isCorrect, text: elem.text });
      });

      const allCorrect = correct === s.elements.length;
      if (allCorrect && !progress.completed.includes(s.id)) {
        progress.completed.push(s.id);
        saveProgress(progress);
      }

      feedbackArea.innerHTML = '';
      const card = document.createElement('div');
      card.style.cssText = `padding: 1rem; border: 1px solid ${allCorrect ? '#22c55e' : '#eab308'}; border-radius: 0.5rem; background: ${allCorrect ? '#22c55e11' : '#eab30811'};`;

      const heading = document.createElement('h4');
      heading.style.cssText = `margin-top: 0; color: ${allCorrect ? '#16a34a' : '#ca8a04'};`;
      heading.textContent = allCorrect ? 'Perfect composition' : `${correct}/${s.elements.length} in correct position`;

      const principle = document.createElement('p');
      principle.style.cssText = 'margin-bottom: 0.5rem; font-style: italic; line-height: 1.5;';
      principle.textContent = s.principle;

      if (!allCorrect) {
        const hint = document.createElement('p');
        hint.style.cssText = 'margin-bottom: 0; font-size: 0.85rem; color: GrayText;';
        hint.textContent = 'Rearrange and try again, or check the correct order below.';
        card.append(heading, principle, hint);
      } else {
        card.append(heading, principle);
      }

      feedbackArea.appendChild(card);

      // Show correct order if not all correct
      if (!allCorrect) {
        const correctOrder = document.createElement('div');
        correctOrder.style.cssText = 'margin-top: 0.75rem; padding: 0.75rem; border: 1px solid ButtonBorder; border-radius: 0.5rem; background: ButtonFace;';
        const coTitle = document.createElement('p');
        coTitle.style.cssText = 'font-weight: 600; font-size: 0.85rem; margin-bottom: 0.5rem;';
        coTitle.textContent = 'Correct order:';
        correctOrder.appendChild(coTitle);

        s.correctOrder.forEach((elemId, idx) => {
          const elem = s.elements.find(e => e.id === elemId)!;
          const line = document.createElement('div');
          line.style.cssText = 'font-size: 0.85rem; margin-bottom: 0.25rem;';
          line.textContent = `${idx + 1}. ${elem.icon} ${elem.text}`;
          correctOrder.appendChild(line);
        });
        feedbackArea.appendChild(correctOrder);
      }

      controls.innerHTML = '';
      const nextBtn = document.createElement('button');
      nextBtn.className = 'btn primary';
      nextBtn.textContent = currentIdx < SCENARIOS.length - 1 ? 'Next Composition →' : 'Review';
      nextBtn.addEventListener('click', () => {
        currentIdx = (currentIdx + 1) % SCENARIOS.length;
        currentOrder = [];
        feedbackArea.innerHTML = '';
        controls.innerHTML = '';
        render();
      });
      controls.appendChild(nextBtn);

      if (!allCorrect) {
        const retryBtn = document.createElement('button');
        retryBtn.className = 'btn';
        retryBtn.textContent = 'Try again';
        retryBtn.addEventListener('click', () => {
          feedbackArea.innerHTML = '';
          controls.innerHTML = '';
        });
        controls.appendChild(retryBtn);

        const shuffleBtn = document.createElement('button');
        shuffleBtn.className = 'btn';
        shuffleBtn.textContent = 'Shuffle';
        shuffleBtn.addEventListener('click', () => {
          currentOrder = [...SCENARIOS[currentIdx].elements].sort(() => Math.random() - 0.5).map(e => e.id);
          renderComposition();
        });
        controls.appendChild(shuffleBtn);
      }

      updateStats();

      events.emit('experience_interaction', {
        experience_id: context.meta.id,
        action: allCorrect ? 'composed_correctly' : 'composed_incorrectly',
        scenario: SCENARIOS[currentIdx].id,
        correct: correct,
        total: s.elements.length
      });
    }

    function render() {
      updateStats();
      renderScenario();
      renderComposition();
      feedbackArea.innerHTML = '';

      // Check button
      const checkBtn = document.createElement('button');
      checkBtn.className = 'btn primary';
      checkBtn.textContent = 'Check arrangement';
      checkBtn.style.marginTop = '0.5rem';
      checkBtn.addEventListener('click', checkComposition);

      const shuffleBtn = document.createElement('button');
      shuffleBtn.className = 'btn';
      shuffleBtn.textContent = 'Shuffle';
      shuffleBtn.style.marginTop = '0.5rem';
      shuffleBtn.addEventListener('click', () => {
        currentOrder = [...SCENARIOS[currentIdx].elements].sort(() => Math.random() - 0.5).map(e => e.id);
        renderComposition();
      });

      const btnRow = document.createElement('div');
      btnRow.style.cssText = 'display: flex; gap: 0.5rem; margin-top: 0.5rem;';
      btnRow.append(checkBtn, shuffleBtn);

      compositionArea.appendChild(btnRow);
    }

    wrapper.append(title, desc, stats, scenarioCard, compositionArea, feedbackArea, controls);
    container.appendChild(wrapper);

    render();

    return () => {};
  }
};

export default compose;
