import type { ExperienceModule, ExperienceContext } from '../platform/types';
import { events } from '../platform/events';

interface Outcome {
  id: string;
  label: string;
  weight: number;
  color: string;
}

interface ChanceExperiment {
  id: string;
  title: string;
  setup: string;
  question: string;
  outcomes: Outcome[];
  expectedInsight: string;
}

interface ProbabilityProgress {
  completed: string[];
  runs: number;
}

const EXPERIMENTS: ChanceExperiment[] = [
  {
    id: 'spinner',
    title: 'Uneven Spinner',
    setup: 'A spinner has 3 blue sections and 1 gold section.',
    question: 'Before spinning, which color do you expect to appear most often?',
    outcomes: [
      { id: 'blue', label: 'Blue', weight: 3, color: '#2563eb' },
      { id: 'gold', label: 'Gold', weight: 1, color: '#ca8a04' }
    ],
    expectedInsight: 'Blue has three of the four equal sections, so it is expected about 75% of the time.'
  },
  {
    id: 'bag',
    title: 'Bag of Tiles',
    setup: 'A bag holds 5 green tiles, 3 purple tiles, and 2 red tiles.',
    question: 'If you draw one tile, replace it, and repeat, which color should win over time?',
    outcomes: [
      { id: 'green', label: 'Green', weight: 5, color: '#16a34a' },
      { id: 'purple', label: 'Purple', weight: 3, color: '#7c3aed' },
      { id: 'red', label: 'Red', weight: 2, color: '#dc2626' }
    ],
    expectedInsight: 'Green has the largest share of the bag: 5 out of 10 tiles. It should lead in the long run, though not every short run.'
  },
  {
    id: 'die',
    title: 'Grouped Die Rolls',
    setup: 'A fair die has six faces. Group them as low (1-2), middle (3-4), and high (5-6).',
    question: 'Which group should appear most often?',
    outcomes: [
      { id: 'low', label: 'Low', weight: 2, color: '#0f766e' },
      { id: 'middle', label: 'Middle', weight: 2, color: '#4f46e5' },
      { id: 'high', label: 'High', weight: 2, color: '#be123c' }
    ],
    expectedInsight: 'Each group has two faces, so no group has an advantage. Equal chances do not mean equal results every time.'
  }
];

const TRIAL_OPTIONS = [20, 100, 500];
const STORAGE_KEY = 'mathematics-probability-progress';

function loadProgress(): ProbabilityProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ProbabilityProgress;
  } catch { /* ignore */ }
  return { completed: [], runs: 0 };
}

function saveProgress(progress: ProbabilityProgress): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch { /* ignore */ }
}

function firstIncompleteIndex(progress: ProbabilityProgress): number {
  const index = EXPERIMENTS.findIndex(experiment => !progress.completed.includes(experiment.id));
  return index === -1 ? 0 : index;
}

function expectedWinners(experiment: ChanceExperiment): string[] {
  const maxWeight = Math.max(...experiment.outcomes.map(outcome => outcome.weight));
  return experiment.outcomes.filter(outcome => outcome.weight === maxWeight).map(outcome => outcome.id);
}

function pickOutcome(experiment: ChanceExperiment): Outcome {
  const total = experiment.outcomes.reduce((sum, outcome) => sum + outcome.weight, 0);
  let target = Math.random() * total;
  for (const outcome of experiment.outcomes) {
    target -= outcome.weight;
    if (target <= 0) return outcome;
  }
  return experiment.outcomes[experiment.outcomes.length - 1];
}

const probability: ExperienceModule = {
  mount(container: HTMLElement, context: ExperienceContext) {
    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'probability';
    wrapper.style.cssText = 'padding: 1rem; max-width: 640px; margin: 0 auto;';

    let progress = loadProgress();
    let currentIndex = firstIncompleteIndex(progress);
    let selectedOutcome = '';
    let trialCount = TRIAL_OPTIONS[1];

    const title = document.createElement('h2');
    title.textContent = 'Probability';

    const lead = document.createElement('p');
    lead.className = 'lead';
    lead.textContent = 'Make a prediction, run chance many times, and compare your intuition with the pattern that appears across trials.';

    const stats = document.createElement('div');
    stats.style.cssText = 'font-size: 0.875rem; color: GrayText; margin-bottom: 1rem;';

    const experimentCard = document.createElement('div');
    experimentCard.style.cssText = 'padding: 1rem; border: 1px solid ButtonBorder; border-radius: 0.5rem; background: ButtonFace; margin: 1rem 0;';

    const predictionArea = document.createElement('div');
    predictionArea.style.cssText = 'margin: 1rem 0;';

    const trialArea = document.createElement('div');
    trialArea.style.cssText = 'margin: 1rem 0;';

    const resultArea = document.createElement('div');
    resultArea.style.cssText = 'margin-top: 1rem;';
    resultArea.setAttribute('aria-live', 'polite');

    const controls = document.createElement('div');
    controls.style.cssText = 'display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem;';

    function updateStats(): void {
      stats.textContent = `Experiments run: ${progress.completed.length}/${EXPERIMENTS.length} • Total runs: ${progress.runs}`;
    }

    function renderExperiment(): void {
      const experiment = EXPERIMENTS[currentIndex];
      selectedOutcome = '';
      experimentCard.innerHTML = '';
      predictionArea.innerHTML = '';
      trialArea.innerHTML = '';
      resultArea.innerHTML = '';
      controls.innerHTML = '';

      const heading = document.createElement('h3');
      heading.style.marginTop = '0';
      heading.textContent = experiment.title;

      const setup = document.createElement('p');
      setup.style.cssText = 'line-height: 1.5; margin-bottom: 0.5rem;';
      setup.textContent = experiment.setup;

      const question = document.createElement('p');
      question.style.cssText = 'font-weight: 600; margin-bottom: 0;';
      question.textContent = experiment.question;

      experimentCard.append(heading, setup, question);
      renderPredictionButtons();
      renderTrialButtons();
    }

    function renderPredictionButtons(): void {
      const experiment = EXPERIMENTS[currentIndex];
      predictionArea.innerHTML = '';

      const label = document.createElement('p');
      label.style.cssText = 'font-weight: 600; margin-bottom: 0.5rem;';
      label.textContent = 'Your prediction';
      predictionArea.appendChild(label);

      const grid = document.createElement('div');
      grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.5rem;';

      experiment.outcomes.forEach(outcome => {
        const button = document.createElement('button');
        button.className = 'btn';
        const selected = selectedOutcome === outcome.id;
        button.style.cssText = `justify-content: center; padding: 0.75rem; border: 2px solid ${selected ? outcome.color : 'ButtonBorder'}; background: ${selected ? `${outcome.color}22` : 'ButtonFace'};`;
        button.textContent = outcome.label;
        button.setAttribute('aria-pressed', String(selected));
        button.addEventListener('click', () => {
          selectedOutcome = outcome.id;
          renderPredictionButtons();
        });
        grid.appendChild(button);
      });

      predictionArea.appendChild(grid);
    }

    function renderTrialButtons(): void {
      trialArea.innerHTML = '';

      const label = document.createElement('p');
      label.style.cssText = 'font-weight: 600; margin-bottom: 0.5rem;';
      label.textContent = 'How many trials should the experiment run?';
      trialArea.appendChild(label);

      const row = document.createElement('div');
      row.style.cssText = 'display: flex; gap: 0.5rem; flex-wrap: wrap;';

      TRIAL_OPTIONS.forEach(option => {
        const button = document.createElement('button');
        button.className = 'btn';
        button.textContent = `${option} trials`;
        button.setAttribute('aria-pressed', String(option === trialCount));
        if (option === trialCount) {
          button.style.background = 'AccentColor';
          button.style.color = 'AccentColorText';
        }
        button.addEventListener('click', () => {
          trialCount = option;
          renderTrialButtons();
        });
        row.appendChild(button);
      });

      const runButton = document.createElement('button');
      runButton.className = 'btn primary';
      runButton.textContent = 'Run Experiment';
      runButton.addEventListener('click', runExperiment);
      row.appendChild(runButton);

      trialArea.appendChild(row);
    }

    function runExperiment(): void {
      const experiment = EXPERIMENTS[currentIndex];
      if (!selectedOutcome) {
        resultArea.innerHTML = '<div style="padding: 1rem; border: 1px solid #eab308; border-radius: 0.5rem; background: #eab30811;">Choose a prediction first. Probability is most useful when it can check an expectation.</div>';
        return;
      }

      const counts: Record<string, number> = {};
      experiment.outcomes.forEach(outcome => { counts[outcome.id] = 0; });
      for (let trial = 0; trial < trialCount; trial += 1) {
        const outcome = pickOutcome(experiment);
        counts[outcome.id] += 1;
      }

      progress.runs += 1;
      if (!progress.completed.includes(experiment.id)) {
        progress.completed.push(experiment.id);
      }
      saveProgress(progress);
      updateStats();
      renderResults(counts);

      const winners = expectedWinners(experiment);
      events.emit('experience_interaction', {
        experience_id: context.meta.id,
        action: 'probability_experiment_run',
        experiment: experiment.id,
        trials: trialCount,
        prediction: selectedOutcome,
        expected: winners.join(',')
      });

      if (progress.completed.length === EXPERIMENTS.length) {
        events.emit('experience_interaction', {
          experience_id: context.meta.id,
          action: 'completed',
          total_experiments: EXPERIMENTS.length
        });
      }
    }

    function renderResults(counts: Record<string, number>): void {
      const experiment = EXPERIMENTS[currentIndex];
      const totalWeight = experiment.outcomes.reduce((sum, outcome) => sum + outcome.weight, 0);
      const winners = expectedWinners(experiment);
      const predictionMatched = winners.includes(selectedOutcome);

      resultArea.innerHTML = '';
      const card = document.createElement('div');
      card.style.cssText = 'padding: 1rem; border: 2px solid #3b82f6; border-radius: 0.5rem; background: #3b82f611;';

      const heading = document.createElement('h4');
      heading.style.marginTop = '0';
      heading.textContent = predictionMatched ? 'Your prediction matched the expected outcome' : 'The experiment reveals a different expectation';

      const insight = document.createElement('p');
      insight.style.cssText = 'margin-bottom: 0.75rem;';
      insight.textContent = experiment.expectedInsight;

      const bars = document.createElement('div');
      bars.style.cssText = 'display: grid; gap: 0.75rem;';

      experiment.outcomes.forEach(outcome => {
        const count = counts[outcome.id] || 0;
        const observedPercent = (count / trialCount) * 100;
        const expectedPercent = (outcome.weight / totalWeight) * 100;

        const row = document.createElement('div');
        row.style.cssText = 'display: grid; gap: 0.25rem;';

        const rowHeader = document.createElement('div');
        rowHeader.style.cssText = 'display: flex; justify-content: space-between; gap: 0.5rem; font-size: 0.9rem;';
        rowHeader.innerHTML = `<strong>${outcome.label}</strong><span>${count}/${trialCount} (${observedPercent.toFixed(1)}%) • expected ${expectedPercent.toFixed(1)}%</span>`;

        const track = document.createElement('div');
        track.style.cssText = 'height: 0.75rem; background: ButtonFace; border: 1px solid ButtonBorder; border-radius: 999px; overflow: hidden;';

        const fill = document.createElement('div');
        fill.style.cssText = `height: 100%; width: ${observedPercent}%; background: ${outcome.color};`;
        track.appendChild(fill);

        row.append(rowHeader, track);
        bars.appendChild(row);
      });

      const note = document.createElement('p');
      note.style.cssText = 'margin: 0.75rem 0 0; color: GrayText;';
      note.textContent = trialCount < 100
        ? 'Short runs can wobble. Probability does not remove randomness; it helps you reason through it.'
        : 'As trials grow, the results usually move closer to the expected pattern. This is why repeated evidence matters.';

      card.append(heading, insight, bars, note);
      resultArea.appendChild(card);

      controls.innerHTML = '';
      const rerunButton = document.createElement('button');
      rerunButton.className = 'btn';
      rerunButton.textContent = 'Run Again';
      rerunButton.addEventListener('click', runExperiment);

      const nextButton = document.createElement('button');
      nextButton.className = 'btn primary';
      nextButton.textContent = progress.completed.length === EXPERIMENTS.length ? 'Review Experiments' : 'Next Experiment →';
      nextButton.addEventListener('click', () => {
        currentIndex = progress.completed.length === EXPERIMENTS.length
          ? 0
          : (currentIndex + 1) % EXPERIMENTS.length;
        while (progress.completed.length < EXPERIMENTS.length && progress.completed.includes(EXPERIMENTS[currentIndex].id)) {
          currentIndex = (currentIndex + 1) % EXPERIMENTS.length;
        }
        renderExperiment();
      });

      controls.append(rerunButton, nextButton);
    }

    wrapper.append(title, lead, stats, experimentCard, predictionArea, trialArea, resultArea, controls);
    container.appendChild(wrapper);

    updateStats();
    renderExperiment();

    return () => {};
  }
};

export default probability;
