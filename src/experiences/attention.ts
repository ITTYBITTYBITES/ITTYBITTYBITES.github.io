import type { ExperienceContext, ExperienceModule } from '../platform/types';
import { events } from '../platform/events';

const STORAGE_KEY = 'attention-progress';

type Shape = 'circle' | 'triangle' | 'square' | 'star';
type Color = 'red' | 'blue' | 'green' | 'gold';

interface CardState {
  id: string;
  color: Color;
  shape: Shape;
  target: boolean;
}

interface RoundDefinition {
  id: string;
  prompt: string;
  cards: CardState[];
  changedCardId: string;
  changedTo: Pick<CardState, 'color' | 'shape'>;
  question: string;
  options: string[];
  correctOption: number;
  explanation: string;
}

interface AttentionProgress {
  roundsCompleted: number;
  surprisesNoticed: number;
}

const COLOR_VALUES: Record<Color, string> = {
  red: '#dc2626',
  blue: '#2563eb',
  green: '#16a34a',
  gold: '#ca8a04',
};

const ROUNDS: RoundDefinition[] = [
  {
    id: 'round-1',
    prompt: 'Click every blue circle. Ignore everything else.',
    cards: [
      { id: 'a1', color: 'blue', shape: 'circle', target: true },
      { id: 'a2', color: 'red', shape: 'triangle', target: false },
      { id: 'a3', color: 'green', shape: 'square', target: false },
      { id: 'a4', color: 'gold', shape: 'star', target: false },
      { id: 'a5', color: 'blue', shape: 'star', target: false },
      { id: 'a6', color: 'red', shape: 'circle', target: false },
      { id: 'a7', color: 'blue', shape: 'circle', target: true },
      { id: 'a8', color: 'green', shape: 'triangle', target: false },
      { id: 'a9', color: 'gold', shape: 'square', target: false },
      { id: 'a10', color: 'blue', shape: 'circle', target: true },
      { id: 'a11', color: 'green', shape: 'circle', target: false },
      { id: 'a12', color: 'red', shape: 'star', target: false },
    ],
    changedCardId: 'a9',
    changedTo: { color: 'red', shape: 'square' },
    question: 'While you were hunting blue circles, what changed in the background?',
    options: [
      'A gold square became a red square.',
      'A red triangle became a blue triangle.',
      'Nothing changed at all.',
    ],
    correctOption: 0,
    explanation: 'Your attention acted like a spotlight. It helped you find the targets, but it also filtered out nearby changes that felt unrelated to the task.',
  },
  {
    id: 'round-2',
    prompt: 'Click every green triangle. Stay with the rule.',
    cards: [
      { id: 'b1', color: 'green', shape: 'triangle', target: true },
      { id: 'b2', color: 'blue', shape: 'square', target: false },
      { id: 'b3', color: 'red', shape: 'circle', target: false },
      { id: 'b4', color: 'gold', shape: 'triangle', target: false },
      { id: 'b5', color: 'green', shape: 'star', target: false },
      { id: 'b6', color: 'blue', shape: 'circle', target: false },
      { id: 'b7', color: 'green', shape: 'triangle', target: true },
      { id: 'b8', color: 'red', shape: 'square', target: false },
      { id: 'b9', color: 'gold', shape: 'circle', target: false },
      { id: 'b10', color: 'green', shape: 'triangle', target: true },
      { id: 'b11', color: 'blue', shape: 'star', target: false },
      { id: 'b12', color: 'red', shape: 'triangle', target: false },
    ],
    changedCardId: 'b6',
    changedTo: { color: 'gold', shape: 'circle' },
    question: 'What changed while your attention was locked onto green triangles?',
    options: [
      'A red square became a blue square.',
      'A blue circle became a gold circle.',
      'A green star became a green square.',
    ],
    correctOption: 1,
    explanation: 'Selective attention is useful precisely because it ignores most of the scene. The cost is that changes outside the rule can happen right beside you.',
  },
  {
    id: 'round-3',
    prompt: 'Click every gold star. Move quickly, but keep noticing.',
    cards: [
      { id: 'c1', color: 'gold', shape: 'star', target: true },
      { id: 'c2', color: 'blue', shape: 'triangle', target: false },
      { id: 'c3', color: 'red', shape: 'circle', target: false },
      { id: 'c4', color: 'green', shape: 'square', target: false },
      { id: 'c5', color: 'gold', shape: 'circle', target: false },
      { id: 'c6', color: 'blue', shape: 'star', target: false },
      { id: 'c7', color: 'gold', shape: 'star', target: true },
      { id: 'c8', color: 'red', shape: 'triangle', target: false },
      { id: 'c9', color: 'green', shape: 'star', target: false },
      { id: 'c10', color: 'gold', shape: 'star', target: true },
      { id: 'c11', color: 'blue', shape: 'square', target: false },
      { id: 'c12', color: 'red', shape: 'square', target: false },
    ],
    changedCardId: 'c3',
    changedTo: { color: 'green', shape: 'circle' },
    question: 'One background card changed during the rush. Which one?',
    options: [
      'A red circle became a green circle.',
      'A blue star became a gold star.',
      'A green square became a red square.',
    ],
    correctOption: 0,
    explanation: 'The task did not make you careless. It made you selective. What we notice shapes what we experience because the mind cannot process everything with equal depth at once.',
  },
];

function loadProgress(): AttentionProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as AttentionProgress;
    }
  } catch {
    // ignore persistence failures
  }
  return { roundsCompleted: 0, surprisesNoticed: 0 };
}

function saveProgress(progress: AttentionProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // ignore persistence failures
  }
}

function describeCard(card: Pick<CardState, 'color' | 'shape'>): string {
  return `${card.color} ${card.shape}`;
}

function getVisibleCard(round: RoundDefinition, card: CardState, mutationApplied: boolean): CardState {
  if (!mutationApplied || card.id !== round.changedCardId) {
    return card;
  }
  return {
    ...card,
    color: round.changedTo.color,
    shape: round.changedTo.shape,
  };
}

function createShapeSwatch(shape: Shape, color: string): HTMLSpanElement {
  const swatch = document.createElement('span');
  swatch.setAttribute('aria-hidden', 'true');
  swatch.style.display = 'inline-block';
  swatch.style.width = '1.8rem';
  swatch.style.height = '1.8rem';
  swatch.style.background = color;

  if (shape === 'circle') {
    swatch.style.borderRadius = '999px';
  } else if (shape === 'square') {
    swatch.style.borderRadius = '0.3rem';
  } else if (shape === 'triangle') {
    swatch.style.clipPath = 'polygon(50% 6%, 94% 88%, 6% 88%)';
  } else {
    swatch.style.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 92%, 50% 71%, 21% 92%, 32% 57%, 2% 35%, 39% 35%)';
  }

  return swatch;
}

const attention: ExperienceModule = {
  mount(container: HTMLElement, context: ExperienceContext) {
    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'attention-experience';
    wrapper.style.cssText = 'padding: 1rem; max-width: 720px; margin: 0 auto;';

    const progress = loadProgress();
    let roundIndex = 0;
    let clickedTargets = new Set<string>();
    let mutationApplied = false;
    let questionAnswered = false;
    let finishedSession = false;

    const title = document.createElement('h2');
    title.textContent = 'Attention';

    const desc = document.createElement('p');
    desc.className = 'lead';
    desc.textContent = 'Focus on the rule. Then test what slipped past while your mind was filtering the scene.';

    const stats = document.createElement('div');
    stats.style.cssText = 'font-size: 0.875rem; color: GrayText; margin-bottom: 1rem;';

    const roundCard = document.createElement('div');
    roundCard.style.cssText = 'padding: 1rem; border: 1px solid ButtonBorder; border-radius: 0.75rem; background: ButtonFace; margin-bottom: 1rem;';

    const status = document.createElement('div');
    status.style.cssText = 'margin: 0.75rem 0; font-size: 0.95rem; min-height: 1.5rem;';

    const grid = document.createElement('div');
    grid.style.cssText = 'display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.75rem; margin: 1rem 0;';

    const questionArea = document.createElement('div');
    questionArea.style.cssText = 'margin-top: 1rem;';

    const summaryArea = document.createElement('div');
    summaryArea.style.cssText = 'margin-top: 1rem;';

    function updateStats(): void {
      stats.textContent = `Lifetime rounds: ${progress.roundsCompleted} • Surprise changes noticed: ${progress.surprisesNoticed}`;
    }

    function currentRound(): RoundDefinition {
      return ROUNDS[roundIndex];
    }

    function resetRoundState(): void {
      clickedTargets = new Set<string>();
      mutationApplied = false;
      questionAnswered = false;
      questionArea.innerHTML = '';
      summaryArea.innerHTML = '';
      status.style.color = 'inherit';
    }

    function renderRound(): void {
      if (finishedSession) {
        renderSummary();
        return;
      }

      const round = currentRound();
      const totalTargets = round.cards.filter((card) => card.target).length;

      roundCard.innerHTML = '';
      const roundTitle = document.createElement('h3');
      roundTitle.style.marginTop = '0';
      roundTitle.textContent = `Round ${roundIndex + 1} of ${ROUNDS.length}`;

      const prompt = document.createElement('p');
      prompt.style.cssText = 'margin-bottom: 0; line-height: 1.5;';
      prompt.textContent = round.prompt;

      roundCard.append(roundTitle, prompt);

      if (clickedTargets.size < totalTargets) {
        status.textContent = `Targets found: ${clickedTargets.size}/${totalTargets}.`; 
      } else if (!questionAnswered) {
        status.textContent = 'Targets found. Now answer from memory.';
      }

      grid.innerHTML = '';
      round.cards.forEach((card) => {
        const visible = getVisibleCard(round, card, mutationApplied);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn';
        button.style.cssText = 'min-height: 5.5rem; padding: 0.75rem; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 0.35rem;';
        button.setAttribute('aria-label', describeCard(visible));

        const symbol = createShapeSwatch(visible.shape, COLOR_VALUES[visible.color]);

        const label = document.createElement('span');
        label.textContent = describeCard(visible);
        label.style.cssText = 'font-size: 0.8rem; text-transform: capitalize;';

        button.append(symbol, label);

        if (clickedTargets.has(card.id)) {
          button.disabled = true;
          button.style.borderColor = '#16a34a';
          button.style.background = '#16a34a11';
        }

        button.addEventListener('click', () => handleCardClick(card));
        grid.appendChild(button);
      });

      renderQuestionIfReady();
    }

    function handleCardClick(card: CardState): void {
      if (finishedSession || questionAnswered || clickedTargets.has(card.id)) {
        return;
      }

      if (!card.target) {
        status.textContent = 'That card does not match the current focus rule.';
        status.style.color = '#b45309';
        events.emit('experience_interaction', {
          experience_id: context.meta.id,
          action: 'non_target_selected',
          round: currentRound().id,
          card: card.id,
        });
        return;
      }

      clickedTargets.add(card.id);
      status.style.color = 'inherit';

      if (!mutationApplied && clickedTargets.size >= 2) {
        mutationApplied = true;
      }

      events.emit('experience_interaction', {
        experience_id: context.meta.id,
        action: 'target_selected',
        round: currentRound().id,
        found: clickedTargets.size,
      });

      renderRound();
    }

    function renderQuestionIfReady(): void {
      const round = currentRound();
      const totalTargets = round.cards.filter((card) => card.target).length;
      if (clickedTargets.size < totalTargets || questionAnswered) {
        return;
      }

      questionArea.innerHTML = '';
      const heading = document.createElement('h4');
      heading.textContent = round.question;
      heading.style.marginBottom = '0.75rem';

      const options = document.createElement('div');
      options.style.cssText = 'display: grid; gap: 0.5rem;';
      round.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn';
        button.style.cssText = 'text-align: left; justify-content: flex-start; white-space: normal;';
        button.textContent = option;
        button.addEventListener('click', () => handleAnswer(index));
        options.appendChild(button);
      });

      questionArea.append(heading, options);
    }

    function handleAnswer(index: number): void {
      const round = currentRound();
      const correct = index === round.correctOption;
      questionAnswered = true;
      progress.roundsCompleted += 1;
      if (correct) {
        progress.surprisesNoticed += 1;
      }
      saveProgress(progress);
      updateStats();

      questionArea.innerHTML = '';
      const result = document.createElement('div');
      result.style.cssText = `padding: 1rem; border: 1px solid ${correct ? '#16a34a' : '#b45309'}; border-radius: 0.75rem; background: ${correct ? '#16a34a11' : '#b4530911'};`;

      const resultTitle = document.createElement('h4');
      resultTitle.style.cssText = `margin-top: 0; color: ${correct ? '#166534' : '#92400e'};`;
      resultTitle.textContent = correct ? 'You caught the background change.' : 'The change slipped past your focus.';

      const explanation = document.createElement('p');
      explanation.style.marginBottom = '0.5rem';
      explanation.textContent = round.explanation;

      const answerLine = document.createElement('p');
      answerLine.style.cssText = 'margin-bottom: 0; font-size: 0.9rem; color: GrayText;';
      answerLine.textContent = `The hidden change was: ${round.options[round.correctOption]}`;

      const nextButton = document.createElement('button');
      nextButton.type = 'button';
      nextButton.className = 'btn primary';
      nextButton.style.marginTop = '0.75rem';
      nextButton.textContent = roundIndex < ROUNDS.length - 1 ? 'Next Round' : 'See What This Means';
      nextButton.addEventListener('click', () => {
        if (roundIndex < ROUNDS.length - 1) {
          roundIndex += 1;
          resetRoundState();
          renderRound();
        } else {
          finishedSession = true;
          renderSummary();
        }
      });

      result.append(resultTitle, explanation, answerLine, nextButton);
      questionArea.appendChild(result);

      events.emit('experience_interaction', {
        experience_id: context.meta.id,
        action: 'surprise_answered',
        round: round.id,
        correct,
      });
    }

    function renderSummary(): void {
      roundCard.innerHTML = '';
      grid.innerHTML = '';
      questionArea.innerHTML = '';
      status.textContent = '';

      const noticedThisSession = progress.surprisesNoticed;
      const completion = document.createElement('div');
      completion.style.cssText = 'padding: 1rem; border: 1px solid #2563eb; border-radius: 0.75rem; background: #2563eb11;';

      const heading = document.createElement('h3');
      heading.style.cssText = 'margin-top: 0; color: #1d4ed8;';
      heading.textContent = 'Attention is a filter, not a recording.';

      const text = document.createElement('p');
      text.textContent = 'You can focus well or notice widely, but not both with equal depth at the same time. What attention highlights becomes your experience. Everything else fades toward the edge.';

      const note = document.createElement('p');
      note.style.cssText = 'margin-bottom: 0; font-size: 0.9rem; color: GrayText;';
      note.textContent = `Lifetime noticed changes: ${noticedThisSession}. Return and see whether your spotlight moves differently next time.`;

      const restart = document.createElement('button');
      restart.type = 'button';
      restart.className = 'btn primary';
      restart.style.marginTop = '0.75rem';
      restart.textContent = 'Run the focus test again';
      restart.addEventListener('click', () => {
        roundIndex = 0;
        finishedSession = false;
        resetRoundState();
        renderRound();
      });

      completion.append(heading, text, note, restart);
      summaryArea.innerHTML = '';
      summaryArea.appendChild(completion);

      events.emit('experience_interaction', {
        experience_id: context.meta.id,
        action: 'session_complete',
        total_rounds: ROUNDS.length,
      });
    }

    updateStats();
    wrapper.append(title, desc, stats, roundCard, status, grid, questionArea, summaryArea);
    container.appendChild(wrapper);
    renderRound();

    return () => {
      // state persists intentionally
    };
  },
};

export default attention;
