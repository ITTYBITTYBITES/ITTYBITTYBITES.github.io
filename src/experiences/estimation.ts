import type { ExperienceModule, ExperienceContext } from '../platform/types';
import { events } from '../platform/events';

interface EstimationPrompt {
  id: string;
  title: string;
  question: string;
  min: number;
  max: number;
  step: number;
  start: number;
  actual: number;
  unit: string;
  mentalModel: string;
}

interface EstimationProgress {
  completed: string[];
  attempts: number;
  totalFactor: number;
}

const PROMPTS: EstimationPrompt[] = [
  {
    id: 'field-steps',
    title: 'Crossing a Field',
    question: 'About how many normal walking steps does it take to cross 100 meters?',
    min: 50,
    max: 250,
    step: 5,
    start: 120,
    actual: 125,
    unit: 'steps',
    mentalModel: 'A comfortable adult step is a little under one meter. One hundred meters is roughly one hundred twenty-five steps.'
  },
  {
    id: 'paper-stack',
    title: 'Thin Things Add Up',
    question: 'About how many sheets of copy paper make a stack 1 centimeter tall?',
    min: 20,
    max: 200,
    step: 5,
    start: 80,
    actual: 100,
    unit: 'sheets',
    mentalModel: 'One sheet is about a tenth of a millimeter thick. Ten sheets make about a millimeter; one hundred make about a centimeter.'
  },
  {
    id: 'minutes-week',
    title: 'Time at Human Scale',
    question: 'About how many minutes are in one week?',
    min: 2000,
    max: 20000,
    step: 100,
    start: 8000,
    actual: 10080,
    unit: 'minutes',
    mentalModel: 'A day has 24 hours, each hour has 60 minutes, and a week has 7 days: 24 × 60 × 7 is just over ten thousand.'
  },
  {
    id: 'jar-kernels',
    title: 'A Jar of Small Objects',
    question: 'About how many popcorn kernels fit in a 1-liter jar?',
    min: 100,
    max: 1200,
    step: 25,
    start: 500,
    actual: 650,
    unit: 'kernels',
    mentalModel: 'A liter is roomy, but kernels waste space between them. Estimation balances object size with empty space.'
  },
  {
    id: 'seconds-day',
    title: 'A Day in Seconds',
    question: 'About how many seconds pass in one full day?',
    min: 10000,
    max: 150000,
    step: 1000,
    start: 60000,
    actual: 86400,
    unit: 'seconds',
    mentalModel: 'There are 60 seconds in a minute, 60 minutes in an hour, and 24 hours in a day: 60 × 60 × 24 = 86,400.'
  }
];

const STORAGE_KEY = 'mathematics-estimation-progress';

function loadProgress(): EstimationProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as EstimationProgress;
  } catch { /* ignore */ }
  return { completed: [], attempts: 0, totalFactor: 0 };
}

function saveProgress(progress: EstimationProgress): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch { /* ignore */ }
}

function firstIncompleteIndex(progress: EstimationProgress): number {
  const index = PROMPTS.findIndex(prompt => !progress.completed.includes(prompt.id));
  return index === -1 ? 0 : index;
}

function formatValue(value: number, unit: string): string {
  return `${Math.round(value).toLocaleString()} ${unit}`;
}

function factorOff(guess: number, actual: number): number {
  const high = Math.max(guess, actual);
  const low = Math.max(1, Math.min(guess, actual));
  return high / low;
}

function factorMessage(factor: number): string {
  if (factor <= 1.15) return 'Excellent estimate. You were close enough to guide a real decision.';
  if (factor <= 1.5) return 'Strong estimate. The size of the answer was clear, even without exact calculation.';
  if (factor <= 2.5) return 'Useful estimate. You found the right neighborhood, then the model tightened it.';
  return 'This is why estimation matters: a quick model can catch answers that are off by a large factor.';
}

const estimation: ExperienceModule = {
  mount(container: HTMLElement, context: ExperienceContext) {
    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'estimation';
    wrapper.style.cssText = 'padding: 1rem; max-width: 640px; margin: 0 auto;';

    let progress = loadProgress();
    let currentIndex = firstIncompleteIndex(progress);
    let currentGuess = PROMPTS[currentIndex].start;
    let revealed = false;

    const title = document.createElement('h2');
    title.textContent = 'Estimation';

    const lead = document.createElement('p');
    lead.className = 'lead';
    lead.textContent = 'Make a useful guess before exact calculation. Approximate reasoning is not a shortcut around math — it is math beginning early.';

    const stats = document.createElement('div');
    stats.style.cssText = 'font-size: 0.875rem; color: GrayText; margin-bottom: 1rem;';

    const promptCard = document.createElement('div');
    promptCard.style.cssText = 'padding: 1rem; border: 1px solid ButtonBorder; border-radius: 0.5rem; background: ButtonFace; margin: 1rem 0;';

    const estimateArea = document.createElement('div');
    estimateArea.style.cssText = 'margin: 1rem 0;';

    const resultArea = document.createElement('div');
    resultArea.style.cssText = 'margin-top: 1rem;';
    resultArea.setAttribute('aria-live', 'polite');

    const controls = document.createElement('div');
    controls.style.cssText = 'display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem;';

    function updateStats(): void {
      const averageFactor = progress.attempts > 0 ? (progress.totalFactor / progress.attempts).toFixed(2) : '—';
      stats.textContent = `Estimates revealed: ${progress.completed.length}/${PROMPTS.length} • Average factor off: ${averageFactor}`;
    }

    function renderPrompt(): void {
      const prompt = PROMPTS[currentIndex];
      currentGuess = prompt.start;
      revealed = false;
      promptCard.innerHTML = '';
      estimateArea.innerHTML = '';
      resultArea.innerHTML = '';
      controls.innerHTML = '';

      const heading = document.createElement('h3');
      heading.style.marginTop = '0';
      heading.textContent = prompt.title;

      const question = document.createElement('p');
      question.style.cssText = 'line-height: 1.5; margin-bottom: 0;';
      question.textContent = prompt.question;

      promptCard.append(heading, question);

      const valueDisplay = document.createElement('div');
      valueDisplay.style.cssText = 'font-size: 2rem; font-weight: 700; text-align: center; margin: 0.75rem 0;';
      valueDisplay.textContent = formatValue(currentGuess, prompt.unit);

      const sliderLabel = document.createElement('label');
      sliderLabel.style.cssText = 'display: block; font-weight: 600; margin-bottom: 0.5rem;';
      sliderLabel.textContent = 'Your estimate';

      const slider = document.createElement('input');
      slider.type = 'range';
      slider.min = String(prompt.min);
      slider.max = String(prompt.max);
      slider.step = String(prompt.step);
      slider.value = String(currentGuess);
      slider.style.cssText = 'width: 100%;';
      slider.setAttribute('aria-label', `Estimate in ${prompt.unit}`);
      slider.addEventListener('input', () => {
        currentGuess = Number(slider.value);
        valueDisplay.textContent = formatValue(currentGuess, prompt.unit);
      });

      const range = document.createElement('div');
      range.style.cssText = 'display: flex; justify-content: space-between; font-size: 0.8rem; color: GrayText; margin-top: 0.25rem;';
      range.innerHTML = `<span>${formatValue(prompt.min, prompt.unit)}</span><span>${formatValue(prompt.max, prompt.unit)}</span>`;

      const revealButton = document.createElement('button');
      revealButton.className = 'btn primary';
      revealButton.textContent = 'Compare with reality';
      revealButton.style.cssText = 'width: 100%; justify-content: center; margin-top: 1rem;';
      revealButton.addEventListener('click', () => revealEstimate(slider, revealButton));

      estimateArea.append(sliderLabel, valueDisplay, slider, range, revealButton);
    }

    function revealEstimate(slider: HTMLInputElement, revealButton: HTMLButtonElement): void {
      if (revealed) return;
      revealed = true;
      const prompt = PROMPTS[currentIndex];
      const factor = factorOff(currentGuess, prompt.actual);

      progress.attempts += 1;
      progress.totalFactor += factor;
      if (!progress.completed.includes(prompt.id)) {
        progress.completed.push(prompt.id);
      }
      saveProgress(progress);
      updateStats();

      slider.disabled = true;
      revealButton.disabled = true;

      resultArea.innerHTML = '';
      const card = document.createElement('div');
      card.style.cssText = 'padding: 1rem; border: 2px solid #3b82f6; border-radius: 0.5rem; background: #3b82f611;';

      const heading = document.createElement('h4');
      heading.style.marginTop = '0';
      heading.textContent = 'Reality check';

      const comparison = document.createElement('p');
      comparison.style.cssText = 'font-size: 1.05rem; margin-bottom: 0.5rem;';
      comparison.innerHTML = `Your estimate: <strong>${formatValue(currentGuess, prompt.unit)}</strong><br>Reference value: <strong>${formatValue(prompt.actual, prompt.unit)}</strong><br>Factor off: <strong>${factor.toFixed(2)}×</strong>`;

      const message = document.createElement('p');
      message.style.cssText = 'margin-bottom: 0.5rem;';
      message.textContent = factorMessage(factor);

      const model = document.createElement('p');
      model.style.cssText = 'margin-bottom: 0; color: GrayText;';
      model.textContent = prompt.mentalModel;

      card.append(heading, comparison, message, model);
      resultArea.appendChild(card);

      const nextButton = document.createElement('button');
      nextButton.className = 'btn primary';
      nextButton.textContent = progress.completed.length === PROMPTS.length ? 'Review Estimates' : 'Next Estimate';
      nextButton.addEventListener('click', () => {
        currentIndex = progress.completed.length === PROMPTS.length
          ? 0
          : (currentIndex + 1) % PROMPTS.length;
        while (progress.completed.length < PROMPTS.length && progress.completed.includes(PROMPTS[currentIndex].id)) {
          currentIndex = (currentIndex + 1) % PROMPTS.length;
        }
        renderPrompt();
      });
      controls.appendChild(nextButton);

      events.emit('experience_interaction', {
        experience_id: context.meta.id,
        action: 'estimate_revealed',
        prompt: prompt.id,
        guess: currentGuess,
        actual: prompt.actual,
        factor: Number(factor.toFixed(2))
      });

      if (progress.completed.length === PROMPTS.length) {
        events.emit('experience_interaction', {
          experience_id: context.meta.id,
          action: 'completed',
          total_estimates: PROMPTS.length
        });
      }
    }

    wrapper.append(title, lead, stats, promptCard, estimateArea, resultArea, controls);
    container.appendChild(wrapper);

    updateStats();
    renderPrompt();

    return () => {};
  }
};

export default estimation;
