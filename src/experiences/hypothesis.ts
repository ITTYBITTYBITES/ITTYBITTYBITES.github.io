import type { ExperienceModule, ExperienceContext } from '../platform/types';
import { events } from '../platform/events';

interface Scenario {
  id: number;
  observations: string[];
  hypothesisOptions: string[];
  correctIndex: number;
  followUp: string[];
  explanation: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 1,
    observations: [
      'Plants near the south window grow faster than plants near the north window.',
      'Both sets of plants receive the same amount of water.',
      'Both sets are the same species, planted at the same time.'
    ],
    hypothesisOptions: [
      'The south-window plants grow faster because they receive more light.',
      'The south-window plants grow faster because the room is warmer on that side.',
      'The south-window plants grow faster because of a difference in soil quality.'
    ],
    correctIndex: 0,
    followUp: [
      'You move half the north-window plants to the south window. They begin growing faster within a week.',
      'You measure temperature on both sides: identical.',
      'You swap soil between locations: no change in growth rate.'
    ],
    explanation: 'The follow-up tests isolate light as the cause. Temperature and soil were controlled and ruled out. The hypothesis that light is the difference is supported.'
  },
  {
    id: 2,
    observations: [
      'A metal spoon in hot soup becomes too hot to touch.',
      'A wooden spoon in the same soup stays comfortable.',
      'Both spoons were at room temperature before entering the soup.'
    ],
    hypothesisOptions: [
      'Metal conducts heat better than wood, so it transfers thermal energy to your hand faster.',
      'The metal spoon is thinner than the wooden spoon, so it heats up more quickly.',
      'The metal spoon is somehow closer to the heat source at the bottom of the pot.'
    ],
    correctIndex: 0,
    followUp: [
      'You use metal and wooden spoons of identical thickness. The metal spoon still becomes too hot.',
      'You suspend both spoons above the soup without touching it. The metal spoon still becomes warmer from the rising steam.',
      'You measure the temperature of both spoons with a thermometer after 30 seconds: metal is significantly hotter.'
    ],
    explanation: 'Metal conducts thermal energy more efficiently than wood. Even without direct contact with the hottest part of the soup, and even with identical thickness, the metal spoon transfers heat faster.'
  },
  {
    id: 3,
    observations: [
      'Seeds planted in spring sprout within two weeks.',
      'The same seeds planted in winter show no growth after two months.',
      'Both plantings receive the same soil, water, and depth.'
    ],
    hypothesisOptions: [
      'Seeds need warmth to germinate, and spring provides it.',
      'Seeds need longer daylight hours, which spring provides.',
      'Seeds need to sense the presence of other growing plants nearby.'
    ],
    correctIndex: 0,
    followUp: [
      'You plant winter seeds in a heated greenhouse with artificial light matching spring day length. They sprout.',
      'You plant winter seeds outdoors with only a heating lamp. They still do not sprout as well.',
      'You plant spring seeds in a cooled room with natural spring daylight. They sprout slower.'
    ],
    explanation: 'Temperature is the primary trigger. While light matters, warmth is the dominant factor for germination in this scenario.'
  }
];

const STORAGE_KEY = 'hypothesis-progress';

function loadProgress(): { scenarioIndex: number; correct: number; total: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { scenarioIndex: 0, correct: 0, total: 0 };
}

function saveProgress(p: { scenarioIndex: number; correct: number; total: number }): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

const hypothesis: ExperienceModule = {
  mount(container: HTMLElement, context: ExperienceContext) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'hypothesis';
    wrapper.style.cssText = 'padding: 1rem; max-width: 640px; margin: 0 auto;';

    let progress = loadProgress();
    let current = SCENARIOS[progress.scenarioIndex % SCENARIOS.length];
    let selected = -1;
    let revealed = false;

    const title = document.createElement('h2');
    title.textContent = 'Hypothesis';

    const desc = document.createElement('p');
    desc.className = 'lead';
    desc.textContent = 'Observe. Guess. Test. Revise. Form a hypothesis and watch how evidence treats it.';

    const stats = document.createElement('div');
    stats.className = 'hypothesis-stats';
    stats.style.cssText = 'font-size: 0.875rem; color: GrayText; margin-bottom: 1rem;';
    updateStats();

    const obsCard = document.createElement('div');
    obsCard.style.cssText = 'padding: 1rem; border: 1px solid ButtonBorder; border-radius: 0.5rem; background: ButtonFace; margin: 1rem 0;';

    const obsTitle = document.createElement('h3');
    obsTitle.textContent = 'Observations';
    obsTitle.style.fontSize = '1rem';
    obsTitle.style.marginTop = '0';

    const obsList = document.createElement('ul');
    current.observations.forEach(o => {
      const li = document.createElement('li');
      li.textContent = o;
      li.style.marginBottom = '0.5rem';
      obsList.appendChild(li);
    });

    obsCard.append(obsTitle, obsList);

    const question = document.createElement('p');
    question.style.fontWeight = '600';
    question.style.marginTop = '1.5rem';
    question.textContent = 'Which hypothesis best explains these observations?';

    const options = document.createElement('div');
    options.style.cssText = 'display: flex; flex-direction: column; gap: 0.75rem; margin: 1rem 0;';

    current.hypothesisOptions.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.style.cssText = 'text-align: left; padding: 0.75rem 1rem;';
      btn.textContent = opt;
      btn.addEventListener('click', () => {
        if (revealed) return;
        selected = idx;
        revealed = true;
        renderOptions();
        showResult();
        progress.total += 1;
        if (idx === current.correctIndex) progress.correct += 1;
        saveProgress(progress);
        updateStats();
        events.emit('experience_interaction', {
          experience_id: context.meta.id,
          action: idx === current.correctIndex ? 'correct_hypothesis' : 'incorrect_hypothesis',
          scenario_id: current.id
        });
      });
      options.appendChild(btn);
    });

    const resultArea = document.createElement('div');
    resultArea.style.cssText = 'margin-top: 1rem;';

    const controls = document.createElement('div');
    controls.style.cssText = 'display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem;';

    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn primary';
    nextBtn.textContent = 'Next Scenario';
    nextBtn.style.display = 'none';
    nextBtn.addEventListener('click', () => {
      progress.scenarioIndex = (progress.scenarioIndex + 1) % SCENARIOS.length;
      saveProgress(progress);
      hypothesis.mount(container, context);
    });

    controls.appendChild(nextBtn);
    wrapper.append(title, desc, stats, obsCard, question, options, resultArea, controls);
    container.appendChild(wrapper);

    function renderOptions() {
      Array.from(options.children).forEach((btn, idx) => {
        const b = btn as HTMLElement;
        if (idx === current.correctIndex) {
          b.style.borderColor = '#22c55e';
          b.style.background = '#22c55e11';
        } else if (idx === selected && idx !== current.correctIndex) {
          b.style.borderColor = '#ef4444';
          b.style.background = '#ef444411';
        }
        b.style.opacity = '0.7';
      });
      (options.children[current.correctIndex] as HTMLElement).style.opacity = '1';
    }

    function showResult() {
      const isCorrect = selected === current.correctIndex;
      const followUpList = current.followUp.map(f => `<li style="margin-bottom:0.5rem;">${f}</li>`).join('');
      resultArea.innerHTML = `
        <div style="padding: 1rem; border: 1px solid ${isCorrect ? '#22c55e' : '#ef4444'}; border-radius: 0.5rem; background: ${isCorrect ? '#22c55e11' : '#ef444411'};">
          <h4 style="margin-top:0;">${isCorrect ? 'Well reasoned' : 'Not quite'}</h4>
          <p style="margin-bottom:0.5rem;"><strong>Follow-up tests:</strong></p>
          <ul style="margin-bottom:1rem;">${followUpList}</ul>
          <p style="margin-bottom:0; font-size:0.9rem; color:GrayText;">${current.explanation}</p>
        </div>
      `;
      nextBtn.style.display = 'inline-flex';
    }

    function updateStats() {
      const accuracy = progress.total > 0 ? Math.round((progress.correct / progress.total) * 100) : 0;
      stats.textContent = `Scenarios: ${progress.scenarioIndex + 1}/${SCENARIOS.length} • Accuracy: ${accuracy}%`;
    }

    return () => {};
  }
};

export default hypothesis;
