import type { ExperienceModule, ExperienceContext } from '../platform/types';
import { events } from '../platform/events';

interface Experiment {
  id: number;
  question: string;
  setup: string;
  variables: { name: string; levels: string[]; isCause: boolean }[];
  explanation: string;
}

const EXPERIMENTS: Experiment[] = [
  {
    id: 1,
    question: 'Why do some bean plants grow taller than others?',
    setup: 'You have four groups of identical bean plants. You want to know which factor causes the height difference.',
    variables: [
      { name: 'Amount of water', levels: ['50ml daily', '100ml daily'], isCause: true },
      { name: 'Pot color', levels: ['Red', 'Blue'], isCause: false },
      { name: 'Music played', levels: ['Classical', 'None'], isCause: false },
      { name: 'Soil type', levels: ['Clay', 'Sand'], isCause: false }
    ],
    explanation: 'To find the true cause, you must change only one variable at a time while holding all others constant. Water is the most plausible cause because it directly affects plant physiology. Pot color and music have no known biological mechanism for plant growth. Soil type could matter, but if all plants started in identical soil, it is not the variable causing the current difference.'
  },
  {
    id: 2,
    question: 'Why do ice cubes melt faster on some days?',
    setup: 'You leave identical ice cubes in identical cups on the kitchen counter. Some days they last an hour. Other days they melt in twenty minutes.',
    variables: [
      { name: 'Room temperature', levels: ['20°C', '30°C'], isCause: true },
      { name: 'Cup material', levels: ['Glass', 'Plastic'], isCause: false },
      { name: 'Day of week', levels: ['Monday', 'Friday'], isCause: false },
      { name: 'Ice cube color', levels: ['Clear', 'Cloudy'], isCause: false }
    ],
    explanation: 'Room temperature is the dominant factor. The cup material could have a small effect, but if you are using the same cups, it cannot explain day-to-day variation. The day of the week has no physical connection to melting rate. Ice cube color might affect absorption of radiant heat slightly, but room temperature dominates by orders of magnitude.'
  }
];

const STORAGE_KEY = 'controlled-progress';

function loadProgress(): { expIndex: number; correct: number; total: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { expIndex: 0, correct: 0, total: 0 };
}

function saveProgress(p: { expIndex: number; correct: number; total: number }): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

const controlled: ExperienceModule = {
  mount(container: HTMLElement, context: ExperienceContext) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'controlled';
    wrapper.style.cssText = 'padding: 1rem; max-width: 640px; margin: 0 auto;';

    let progress = loadProgress();
    let current = EXPERIMENTS[progress.expIndex % EXPERIMENTS.length];
    let selectedVars = new Set<number>();
    let submitted = false;

    const title = document.createElement('h2');
    title.textContent = 'Controlled';

    const desc = document.createElement('p');
    desc.className = 'lead';
    desc.textContent = 'Change one thing at a time. Everything else must stay constant. Only then can you know what caused what.';

    const stats = document.createElement('div');
    stats.className = 'controlled-stats';
    stats.style.cssText = 'font-size: 0.875rem; color: GrayText; margin-bottom: 1rem;';
    updateStats();

    const question = document.createElement('h3');
    question.textContent = current.question;
    question.style.fontSize = '1.1rem';

    const setup = document.createElement('p');
    setup.textContent = current.setup;
    setup.style.fontStyle = 'italic';
    setup.style.color = 'GrayText';

    const instruction = document.createElement('p');
    instruction.style.fontWeight = '600';
    instruction.style.marginTop = '1.5rem';
    instruction.textContent = 'Select the ONE variable you would change to test the cause. Hold all others constant.';

    const varList = document.createElement('div');
    varList.style.cssText = 'display: flex; flex-direction: column; gap: 0.75rem; margin: 1rem 0;';

    current.variables.forEach((v, idx) => {
      const row = document.createElement('button');
      row.className = 'btn';
      row.style.cssText = 'text-align: left; padding: 0.75rem 1rem; flex-direction: column; align-items: flex-start; gap: 0.25rem;';
      row.innerHTML = `<strong>${v.name}</strong><span style="font-size:0.85rem;color:GrayText;">Levels: ${v.levels.join(' vs ')}</span>`;
      row.addEventListener('click', () => {
        if (submitted) return;
        selectedVars.clear();
        selectedVars.add(idx);
        Array.from(varList.children).forEach((child, i) => {
          (child as HTMLElement).style.borderColor = i === idx ? 'AccentColor' : 'ButtonBorder';
        });
      });
      varList.appendChild(row);
    });

    const resultArea = document.createElement('div');
    resultArea.style.cssText = 'margin-top: 1rem;';

    const controls = document.createElement('div');
    controls.style.cssText = 'display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem;';

    const submitBtn = document.createElement('button');
    submitBtn.className = 'btn primary';
    submitBtn.textContent = 'Test Your Design';
    submitBtn.addEventListener('click', () => {
      if (submitted || selectedVars.size === 0) return;
      submitted = true;
      const selectedIdx = Array.from(selectedVars)[0];
      const isCorrect = current.variables[selectedIdx].isCause;
      progress.total += 1;
      if (isCorrect) progress.correct += 1;
      saveProgress(progress);
      updateStats();

      Array.from(varList.children).forEach((child, idx) => {
        const c = child as HTMLElement;
        if (current.variables[idx].isCause) {
          c.style.borderColor = '#22c55e';
          c.style.background = '#22c55e11';
        } else if (idx === selectedIdx) {
          c.style.borderColor = '#ef4444';
          c.style.background = '#ef444411';
        }
      });

      resultArea.innerHTML = `
        <div style="padding: 1rem; border: 1px solid ${isCorrect ? '#22c55e' : '#ef4444'}; border-radius: 0.5rem; background: ${isCorrect ? '#22c55e11' : '#ef444411'};">
          <h4 style="margin-top:0;">${isCorrect ? 'Correct isolation' : 'Not the best choice'}</h4>
          <p style="margin-bottom:0; font-size:0.9rem;">${current.explanation}</p>
        </div>
      `;
      submitBtn.style.display = 'none';
      nextBtn.style.display = 'inline-flex';

      events.emit('experience_interaction', {
        experience_id: context.meta.id,
        action: isCorrect ? 'correct_isolation' : 'incorrect_isolation',
        experiment_id: current.id
      });
    });

    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn';
    nextBtn.textContent = 'Next Experiment';
    nextBtn.style.display = 'none';
    nextBtn.addEventListener('click', () => {
      progress.expIndex = (progress.expIndex + 1) % EXPERIMENTS.length;
      saveProgress(progress);
      controlled.mount(container, context);
    });

    controls.append(submitBtn, nextBtn);
    wrapper.append(title, desc, stats, question, setup, instruction, varList, resultArea, controls);
    container.appendChild(wrapper);

    function updateStats() {
      const accuracy = progress.total > 0 ? Math.round((progress.correct / progress.total) * 100) : 0;
      stats.textContent = `Experiments: ${progress.expIndex + 1}/${EXPERIMENTS.length} • Accuracy: ${accuracy}%`;
    }

    return () => {};
  }
};

export default controlled;
