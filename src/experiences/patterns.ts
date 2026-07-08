import type { ExperienceModule, ExperienceContext } from '../platform/types';
import { events } from '../platform/events';

interface PatternChallenge {
  id: string;
  name: string;
  sequence: number[];
  options: number[];
  answer: number;
  rule: string;
  insight: string;
}

interface PatternProgress {
  solved: string[];
  attempts: number;
}

const CHALLENGES: PatternChallenge[] = [
  {
    id: 'even-steps',
    name: 'A steady beat',
    sequence: [2, 4, 6, 8],
    options: [9, 10, 12, 16],
    answer: 10,
    rule: 'Add 2 each time.',
    insight: 'A pattern can be a rhythm: the same change repeated again and again.'
  },
  {
    id: 'doubling',
    name: 'Growing faster',
    sequence: [1, 2, 4, 8],
    options: [10, 12, 16, 18],
    answer: 16,
    rule: 'Double the previous number.',
    insight: 'Some patterns do not grow by equal steps. They grow by a relationship.'
  },
  {
    id: 'squares',
    name: 'Hidden shapes',
    sequence: [1, 4, 9, 16, 25],
    options: [30, 36, 40, 49],
    answer: 36,
    rule: 'Count square arrangements: 1×1, 2×2, 3×3, and so on.',
    insight: 'A number pattern may come from a shape you cannot see at first.'
  },
  {
    id: 'growing-gaps',
    name: 'The gaps have a pattern',
    sequence: [2, 5, 10, 17, 26],
    options: [35, 36, 37, 40],
    answer: 37,
    rule: 'The jumps are 3, 5, 7, 9, then 11.',
    insight: 'Sometimes the pattern is not in the numbers themselves. It is in the differences between them.'
  },
  {
    id: 'fibonacci',
    name: 'Memory in the pattern',
    sequence: [1, 1, 2, 3, 5],
    options: [6, 7, 8, 10],
    answer: 8,
    rule: 'Add the previous two numbers.',
    insight: 'A rule can use more than the last step. The sequence remembers where it has been.'
  }
];

const STORAGE_KEY = 'mathematics-patterns-progress';

function loadProgress(): PatternProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PatternProgress;
  } catch { /* ignore */ }
  return { solved: [], attempts: 0 };
}

function saveProgress(progress: PatternProgress): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch { /* ignore */ }
}

function firstUnsolvedIndex(progress: PatternProgress): number {
  const index = CHALLENGES.findIndex(challenge => !progress.solved.includes(challenge.id));
  return index === -1 ? 0 : index;
}

const patterns: ExperienceModule = {
  mount(container: HTMLElement, context: ExperienceContext) {
    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'patterns';
    wrapper.style.cssText = 'padding: 1rem; max-width: 640px; margin: 0 auto;';

    let progress = loadProgress();
    let currentIndex = firstUnsolvedIndex(progress);
    let answered = false;

    const title = document.createElement('h2');
    title.textContent = 'Patterns';

    const lead = document.createElement('p');
    lead.className = 'lead';
    lead.textContent = 'Look for structure. Choose what comes next. Then ask why that answer fits.';

    const stats = document.createElement('div');
    stats.style.cssText = 'font-size: 0.875rem; color: GrayText; margin-bottom: 1rem;';

    const challengeCard = document.createElement('div');
    challengeCard.style.cssText = 'padding: 1rem; border: 1px solid ButtonBorder; border-radius: 0.5rem; background: ButtonFace; margin: 1rem 0;';

    const sequenceRow = document.createElement('div');
    sequenceRow.style.cssText = 'display: flex; gap: 0.5rem; flex-wrap: wrap; margin: 1rem 0; align-items: center;';
    sequenceRow.setAttribute('aria-label', 'Number sequence');

    const optionsArea = document.createElement('div');
    optionsArea.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(90px, 1fr)); gap: 0.5rem; margin: 1rem 0;';

    const resultArea = document.createElement('div');
    resultArea.style.cssText = 'margin-top: 1rem;';
    resultArea.setAttribute('aria-live', 'polite');

    const controls = document.createElement('div');
    controls.style.cssText = 'display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem;';

    function updateStats(): void {
      stats.textContent = `Patterns solved: ${progress.solved.length}/${CHALLENGES.length} • Attempts: ${progress.attempts}`;
    }

    function renderSequence(challenge: PatternChallenge): void {
      sequenceRow.innerHTML = '';
      [...challenge.sequence, NaN].forEach((value, index) => {
        const tile = document.createElement('div');
        tile.style.cssText = 'min-width: 3rem; padding: 0.75rem; border: 1px solid ButtonBorder; border-radius: 0.35rem; text-align: center; font-weight: 700; font-size: 1.2rem; background: canvas;';
        tile.textContent = Number.isNaN(value) ? '?' : String(value);
        tile.setAttribute('aria-label', Number.isNaN(value) ? 'unknown next value' : `sequence value ${index + 1}: ${value}`);
        sequenceRow.appendChild(tile);
      });
    }

    function renderChallenge(): void {
      const challenge = CHALLENGES[currentIndex];
      answered = false;
      challengeCard.innerHTML = '';
      optionsArea.innerHTML = '';
      resultArea.innerHTML = '';
      controls.innerHTML = '';

      const heading = document.createElement('h3');
      heading.style.marginTop = '0';
      heading.textContent = challenge.name;

      const prompt = document.createElement('p');
      prompt.style.cssText = 'margin-bottom: 0; line-height: 1.5;';
      prompt.textContent = 'What comes next, and what rule would make it reasonable?';

      challengeCard.append(heading, prompt, sequenceRow);
      renderSequence(challenge);

      challenge.options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'btn';
        button.textContent = String(option);
        button.setAttribute('aria-label', `Choose ${option} as the next value`);
        button.style.cssText = 'justify-content: center; font-size: 1.05rem; padding: 0.75rem;';
        button.addEventListener('click', () => chooseOption(option));
        optionsArea.appendChild(button);
      });
    }

    function chooseOption(option: number): void {
      if (answered) return;
      const challenge = CHALLENGES[currentIndex];
      answered = true;
      progress.attempts += 1;

      const correct = option === challenge.answer;
      if (correct && !progress.solved.includes(challenge.id)) {
        progress.solved.push(challenge.id);
      }
      saveProgress(progress);
      updateStats();

      resultArea.innerHTML = '';
      const card = document.createElement('div');
      card.style.cssText = `padding: 1rem; border: 2px solid ${correct ? '#22c55e' : '#eab308'}; border-radius: 0.5rem; background: ${correct ? '#22c55e11' : '#eab30811'};`;

      const resultTitle = document.createElement('h4');
      resultTitle.style.cssText = `margin-top: 0; color: ${correct ? '#16a34a' : '#ca8a04'};`;
      resultTitle.textContent = correct ? 'Pattern found' : 'A different rule is hiding here';

      const rule = document.createElement('p');
      rule.style.cssText = 'margin-bottom: 0.5rem;';
      rule.innerHTML = `<strong>Rule:</strong> ${challenge.rule}`;

      const insight = document.createElement('p');
      insight.style.cssText = 'margin-bottom: 0; color: GrayText;';
      insight.textContent = challenge.insight;

      card.append(resultTitle, rule, insight);
      resultArea.appendChild(card);

      Array.from(optionsArea.children).forEach(child => {
        const button = child as HTMLButtonElement;
        button.disabled = true;
        if (button.textContent === String(challenge.answer)) {
          button.style.borderColor = '#22c55e';
          button.style.background = '#22c55e11';
        }
      });

      const nextButton = document.createElement('button');
      nextButton.className = 'btn primary';
      nextButton.textContent = progress.solved.length === CHALLENGES.length ? 'Review Patterns' : 'Next Pattern';
      nextButton.addEventListener('click', () => {
        currentIndex = progress.solved.length === CHALLENGES.length
          ? 0
          : (currentIndex + 1) % CHALLENGES.length;
        while (progress.solved.length < CHALLENGES.length && progress.solved.includes(CHALLENGES[currentIndex].id)) {
          currentIndex = (currentIndex + 1) % CHALLENGES.length;
        }
        renderChallenge();
      });
      controls.appendChild(nextButton);

      events.emit('experience_interaction', {
        experience_id: context.meta.id,
        action: correct ? 'pattern_solved' : 'pattern_attempted',
        challenge: challenge.id,
        selected: option,
        answer: challenge.answer
      });

      if (progress.solved.length === CHALLENGES.length) {
        events.emit('experience_interaction', {
          experience_id: context.meta.id,
          action: 'completed',
          total_patterns: CHALLENGES.length
        });
      }
    }

    wrapper.append(title, lead, stats, challengeCard, optionsArea, resultArea, controls);
    container.appendChild(wrapper);

    updateStats();
    renderChallenge();

    return () => {};
  }
};

export default patterns;
