import type { ExperienceModule, ExperienceContext } from '../platform/types';
import { events } from '../platform/events';

interface TimelineEvent {
  id: string;
  text: string;
  evidence: string;
  position: number; // correct position (0-based)
}

const EVENT_SETS: TimelineEvent[][] = [
  [
    { id: 'e1', text: 'A new strain of grain appears in the northern valley, resistant to the blight that destroyed the previous harvest.', evidence: 'Soil samples show the old strain disappeared abruptly. The new strain has genetic markers suggesting deliberate selection, not natural mutation.', position: 0 },
    { id: 'e2', text: 'Trade routes shift eastward as the northern valley becomes a surplus producer.', evidence: 'Merchant ledgers from eastern ports show a sudden increase in grain volume with northern seals. Earlier ledgers show no such trade.', position: 1 },
    { id: 'e3', text: 'A written language develops in the eastern ports to standardize grain contracts.', evidence: 'The earliest surviving documents are all grain contracts. The script shows no prior use for religious or literary texts.', position: 2 },
    { id: 'e4', text: 'The northern valley builds defensive walls, suggesting their surplus made them a target.', evidence: 'The walls are constructed from stone not native to the valley — quarried and transported at enormous cost. This only makes sense if something valuable needed protection.', position: 3 },
    { id: 'e5', text: 'Eastern port cities begin minting standardized metal currency.', evidence: 'The first coins bear grain symbols. Their weight standard matches the grain measure used in the northern valley contracts.', position: 4 },
  ],
  [
    { id: 'e1b', text: 'A mountain pass collapses after an earthquake, cutting off the western trade route.', evidence: 'Geological layers confirm the earthquake date. Trade goods from western sources disappear from eastern markets simultaneously.', position: 0 },
    { id: 'e2b', text: 'Coastal shipbuilders develop a new hull design capable of longer voyages.', evidence: 'The design appears suddenly in shipyard records, with no gradual evolution. It solves a specific problem: carrying heavier cargo across open water.', position: 1 },
    { id: 'e3b', text: 'A new port city is founded on the eastern coast, positioned for trans-oceanic trade.', evidence: 'The city has no agricultural hinterland. Its founding charter explicitly mentions "receipt of western goods by sea."', position: 2 },
    { id: 'e4b', text: 'Navigators begin using star charts to fix position at sea.', evidence: 'The earliest charts are crude but functional. They appear in the same decade as the new port city, suggesting the need drove the innovation.', position: 3 },
    { id: 'e5b', text: 'A cultural exchange occurs as western and eastern artistic styles merge in the new port city.', evidence: 'Pottery from this period shows western forms with eastern glazes — a combination impossible before the trade route shift.', position: 4 },
  ]
];

const STORAGE_KEY = 'chronology-progress';

function loadProgress(): { setIndex: number; completed: number; attempts: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { setIndex: 0, completed: 0, attempts: 0 };
}

function saveProgress(p: { setIndex: number; completed: number; attempts: number }): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

const chronology: ExperienceModule = {
  mount(container: HTMLElement, context: ExperienceContext) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'chronology';
    wrapper.style.cssText = 'padding: 1rem; max-width: 640px; margin: 0 auto;';

    let progress = loadProgress();
    let currentSet = [...EVENT_SETS[progress.setIndex % EVENT_SETS.length]];
    let userOrder: TimelineEvent[] = shuffleArray([...currentSet]);
    let submitted = false;

    const title = document.createElement('h2');
    title.textContent = 'Chronology';

    const desc = document.createElement('p');
    desc.className = 'lead';
    desc.textContent = 'These events have no dates. Rebuild their order from evidence and logical relationships.';

    const stats = document.createElement('div');
    stats.className = 'chronology-stats';
    stats.style.cssText = 'font-size: 0.875rem; color: GrayText; margin-bottom: 1rem;';
    stats.textContent = `Sets completed: ${progress.completed} • Attempts: ${progress.attempts}`;

    const eventList = document.createElement('ol');
    eventList.className = 'event-list';
    eventList.style.cssText = 'list-style: none; padding: 0; margin: 1rem 0; display: flex; flex-direction: column; gap: 0.75rem;';
    eventList.setAttribute('role', 'list');

    function renderEvents() {
      eventList.innerHTML = '';
      userOrder.forEach((evt, idx) => {
        const li = document.createElement('li');
        li.className = 'event-item';
        li.style.cssText = 'padding: 1rem; border: 1px solid ButtonBorder; border-radius: 0.5rem; background: canvas; cursor: pointer; transition: background 0.1s;';
        li.dataset.id = evt.id;
        li.setAttribute('role', 'listitem');
        li.setAttribute('tabindex', '0');

        if (submitted) {
          const isCorrect = evt.position === idx;
          li.style.borderColor = isCorrect ? '#22c55e' : '#ef4444';
          li.style.background = isCorrect ? '#22c55e11' : '#ef444411';
        }

        const header = document.createElement('div');
        header.style.cssText = 'font-weight: 600; margin-bottom: 0.5rem;';
        header.textContent = `${idx + 1}. ${evt.text}`;

        const evidence = document.createElement('div');
        evidence.style.cssText = 'font-size: 0.85rem; color: GrayText; font-style: italic;';
        evidence.textContent = `Evidence: ${evt.evidence}`;

        li.append(header, evidence);

        if (!submitted) {
          li.addEventListener('click', () => handleMove(idx));
          li.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp' && idx > 0) {
              e.preventDefault();
              swap(idx, idx - 1);
            } else if (e.key === 'ArrowDown' && idx < userOrder.length - 1) {
              e.preventDefault();
              swap(idx, idx + 1);
            }
          });
        }

        eventList.appendChild(li);
      });
    }

    function handleMove(idx: number) {
      // Find where this item should go based on a simple heuristic
      // For the interaction, we'll use a "move up/down" approach
      // Clicking an item moves it up one position (or to bottom if at top)
      if (idx === 0) {
        // Move to bottom
        const item = userOrder.shift()!;
        userOrder.push(item);
      } else {
        // Swap with item above
        swap(idx, idx - 1);
      }
    }

    function swap(i: number, j: number) {
      [userOrder[i], userOrder[j]] = [userOrder[j], userOrder[i]];
      renderEvents();
      events.emit('experience_interaction', {
        experience_id: context.meta.id,
        action: 'reordered',
        sequence: userOrder.map(e => e.id)
      });
    }

    const controls = document.createElement('div');
    controls.style.cssText = 'display: flex; gap: 0.5rem; flex-wrap: wrap; margin: 1rem 0;';

    const submitBtn = document.createElement('button');
    submitBtn.className = 'btn primary';
    submitBtn.textContent = 'Check Sequence';
    submitBtn.addEventListener('click', handleSubmit);

    const resetBtn = document.createElement('button');
    resetBtn.className = 'btn subtle';
    resetBtn.textContent = 'Shuffle';
    resetBtn.addEventListener('click', () => {
      userOrder = shuffleArray([...currentSet]);
      submitted = false;
      renderEvents();
      resultArea.innerHTML = '';
      submitBtn.style.display = 'inline-flex';
      nextBtn.style.display = 'none';
    });

    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn';
    nextBtn.textContent = 'Next Set';
    nextBtn.style.display = 'none';
    nextBtn.addEventListener('click', () => {
      progress.setIndex = (progress.setIndex + 1) % EVENT_SETS.length;
      saveProgress(progress);
      chronology.mount(container, context);
    });

    controls.append(submitBtn, resetBtn, nextBtn);

    const resultArea = document.createElement('div');
    resultArea.className = 'chronology-result';
    resultArea.style.cssText = 'margin-top: 1rem;';

    wrapper.append(title, desc, stats, eventList, controls, resultArea);
    container.appendChild(wrapper);

    renderEvents();

    function handleSubmit() {
      if (submitted) return;
      submitted = true;
      progress.attempts += 1;

      const correctCount = userOrder.filter((e, i) => e.position === i).length;
      const allCorrect = correctCount === userOrder.length;

      if (allCorrect) {
        progress.completed += 1;
      }
      saveProgress(progress);
      stats.textContent = `Sets completed: ${progress.completed} • Attempts: ${progress.attempts}`;

      renderEvents();

      resultArea.innerHTML = `
        <div style="padding: 1rem; border: 1px solid ButtonBorder; border-radius: 0.5rem; background: ${allCorrect ? '#22c55e11' : '#eab30811'};">
          <h4 style="margin-top:0;">${allCorrect ? 'Correct sequence!' : `${correctCount}/${userOrder.length} in correct position`}</h4>
          <p style="margin-bottom:0; font-size:0.9rem;">
            ${allCorrect
              ? 'You rebuilt the timeline from evidence alone. The logical relationships between events — cause, consequence, necessity — are what historians actually use.'
              : 'Some events are out of place. Look at the evidence: which event must have happened before another? Which consequence required a prior cause?'}
          </p>
        </div>
      `;

      submitBtn.style.display = 'none';
      nextBtn.style.display = 'inline-flex';

      events.emit('experience_interaction', {
        experience_id: context.meta.id,
        action: allCorrect ? 'completed' : 'attempted',
        correct: correctCount,
        total: userOrder.length
      });
    }

    return () => {
      // persistence handled in handlers
    };
  }
};

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default chronology;
