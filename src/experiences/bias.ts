import type { ExperienceContext, ExperienceModule } from '../platform/types';
import { events } from '../platform/events';

const STORAGE_KEY = 'bias-progress';

interface BiasScenario {
  id: string;
  title: string;
  prompt: string;
  options: string[];
  revealTitle: string;
  revealText: string;
  reflection: string;
}

interface BiasProgress {
  sessionsCompleted: number;
  scenariosSeen: number;
}

const SCENARIOS: BiasScenario[] = [
  {
    id: 'framing',
    title: 'Framing',
    prompt: 'A treatment is described in two ways. Which wording feels safer to you?\n\nProgram A: 90 out of 100 patients survive.\nProgram B: 10 out of 100 patients die.',
    options: [
      'Program A feels safer.',
      'Program B feels safer.',
      'They feel the same.',
    ],
    revealTitle: 'Same numbers. Different feeling.',
    revealText: 'Nothing about the outcome changed. Only the frame changed. “Lives saved” and “lives lost” can steer judgment in different directions even when the math is identical.',
    reflection: 'Framing is not stupidity. It is the mind using wording as a shortcut for risk and value.',
  },
  {
    id: 'anchor',
    title: 'Anchors',
    prompt: 'A used bike was first listed at $1,200 and is now discounted. What feels like a fair sale price?',
    options: [
      '$450',
      '$700',
      '$950',
    ],
    revealTitle: 'The first number quietly pulled on you.',
    revealText: 'Even when we know a starting number is arbitrary, it often becomes an anchor. Judgments drift around the first value we see instead of starting from zero.',
    reflection: 'Anchors save effort. They also make unrelated numbers feel more meaningful than they really are.',
  },
  {
    id: 'pattern',
    title: 'Pattern Recognition',
    prompt: 'A coin has landed heads four times in a row. What feels most likely on the next flip?',
    options: [
      'Heads, because the streak has momentum.',
      'Tails, because the streak is due to end.',
      'They are equally likely.',
    ],
    revealTitle: 'The mind loves a story, even when events are independent.',
    revealText: 'A streak feels meaningful because our brains are built to detect patterns. But independent events do not remember what happened before.',
    reflection: 'Pattern recognition is essential. The trick is noticing when it invents order where none exists.',
  },
  {
    id: 'assumption',
    title: 'Assumptions',
    prompt: 'You receive this message from a coworker: “Need the revised draft by 4.” What story feels most natural?',
    options: [
      'They are being rude.',
      'They are rushed and trying to be brief.',
      'There is not enough information to know yet.',
    ],
    revealTitle: 'Your mind completed the missing context.',
    revealText: 'A short message can feel cold, urgent, efficient, or careless depending on the story we attach to it. The facts are thin; the interpretation fills the gap.',
    reflection: 'Assumptions are speed tools. They help us move fast, but they can harden into certainty before the evidence arrives.',
  },
];

function loadProgress(): BiasProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as BiasProgress;
    }
  } catch {
    // ignore persistence failures
  }
  return { sessionsCompleted: 0, scenariosSeen: 0 };
}

function saveProgress(progress: BiasProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // ignore persistence failures
  }
}

const bias: ExperienceModule = {
  mount(container: HTMLElement, context: ExperienceContext) {
    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'bias-experience';
    wrapper.style.cssText = 'padding: 1rem; max-width: 700px; margin: 0 auto;';

    const progress = loadProgress();
    let scenarioIndex = 0;
    let revealed = false;
    let chosenOption = -1;
    let finished = false;

    const title = document.createElement('h2');
    title.textContent = 'Bias';

    const desc = document.createElement('p');
    desc.className = 'lead';
    desc.textContent = 'Make a fast call. Then inspect the shortcut that made the call feel natural.';

    const stats = document.createElement('div');
    stats.style.cssText = 'font-size: 0.875rem; color: GrayText; margin-bottom: 1rem;';

    const scenarioCard = document.createElement('div');
    scenarioCard.style.cssText = 'padding: 1rem; border: 1px solid ButtonBorder; border-radius: 0.75rem; background: ButtonFace; margin-bottom: 1rem;';

    const optionsArea = document.createElement('div');
    optionsArea.style.cssText = 'display: grid; gap: 0.5rem; margin: 1rem 0;';

    const revealArea = document.createElement('div');
    revealArea.style.cssText = 'margin-top: 1rem;';

    function updateStats(): void {
      stats.textContent = `Scenarios explored: ${progress.scenariosSeen} • Full sessions: ${progress.sessionsCompleted}`;
    }

    function currentScenario(): BiasScenario {
      return SCENARIOS[scenarioIndex];
    }

    function renderScenario(): void {
      if (finished) {
        renderSummary();
        return;
      }

      const scenario = currentScenario();
      scenarioCard.innerHTML = '';
      optionsArea.innerHTML = '';
      revealArea.innerHTML = '';

      const label = document.createElement('div');
      label.style.cssText = 'font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.06em; color: GrayText; margin-bottom: 0.5rem;';
      label.textContent = `Scenario ${scenarioIndex + 1} of ${SCENARIOS.length}`;

      const heading = document.createElement('h3');
      heading.style.marginTop = '0';
      heading.textContent = scenario.title;

      const prompt = document.createElement('p');
      prompt.style.cssText = 'margin-bottom: 0; line-height: 1.6; white-space: pre-line;';
      prompt.textContent = scenario.prompt;

      scenarioCard.append(label, heading, prompt);

      scenario.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn';
        button.style.cssText = 'text-align: left; justify-content: flex-start; white-space: normal;';
        button.textContent = option;
        if (revealed && chosenOption === index) {
          button.style.borderColor = '#2563eb';
          button.style.background = '#2563eb11';
        }
        button.disabled = revealed;
        button.addEventListener('click', () => handleChoice(index));
        optionsArea.appendChild(button);
      });
    }

    function handleChoice(index: number): void {
      const scenario = currentScenario();
      revealed = true;
      chosenOption = index;
      progress.scenariosSeen += 1;
      saveProgress(progress);
      updateStats();
      renderScenario();

      const panel = document.createElement('div');
      panel.style.cssText = 'padding: 1rem; border: 1px solid #7c3aed; border-radius: 0.75rem; background: #7c3aed11;';

      const heading = document.createElement('h4');
      heading.style.cssText = 'margin-top: 0; color: #6d28d9;';
      heading.textContent = scenario.revealTitle;

      const body = document.createElement('p');
      body.style.marginBottom = '0.5rem';
      body.textContent = scenario.revealText;

      const reflection = document.createElement('p');
      reflection.style.cssText = 'margin-bottom: 0; font-size: 0.9rem; color: GrayText;';
      reflection.textContent = scenario.reflection;

      const next = document.createElement('button');
      next.type = 'button';
      next.className = 'btn primary';
      next.style.marginTop = '0.75rem';
      next.textContent = scenarioIndex < SCENARIOS.length - 1 ? 'Next Shortcut →' : 'See the Pattern';
      next.addEventListener('click', () => {
        if (scenarioIndex < SCENARIOS.length - 1) {
          scenarioIndex += 1;
          revealed = false;
          chosenOption = -1;
          renderScenario();
        } else {
          finished = true;
          progress.sessionsCompleted += 1;
          saveProgress(progress);
          updateStats();
          renderSummary();
        }
      });

      panel.append(heading, body, reflection, next);
      revealArea.appendChild(panel);

      events.emit('experience_interaction', {
        experience_id: context.meta.id,
        action: 'shortcut_explored',
        scenario: scenario.id,
        choice: index,
      });
    }

    function renderSummary(): void {
      scenarioCard.innerHTML = '';
      optionsArea.innerHTML = '';
      revealArea.innerHTML = '';

      const summary = document.createElement('div');
      summary.style.cssText = 'padding: 1rem; border: 1px solid #16a34a; border-radius: 0.75rem; background: #16a34a11;';

      const heading = document.createElement('h3');
      heading.style.cssText = 'margin-top: 0; color: #166534;';
      heading.textContent = 'Shortcuts are part of thinking, not a flaw in it.';

      const text = document.createElement('p');
      text.textContent = 'The mind frames, anchors, predicts, and completes stories because speed matters. Curiosity begins when you notice the shortcut before it hardens into certainty.';

      const note = document.createElement('p');
      note.style.cssText = 'margin-bottom: 0; font-size: 0.9rem; color: GrayText;';
      note.textContent = 'Return to these scenarios after different days or moods. The same facts can feel different depending on which shortcut arrives first.';

      const restart = document.createElement('button');
      restart.type = 'button';
      restart.className = 'btn primary';
      restart.style.marginTop = '0.75rem';
      restart.textContent = 'Explore the shortcuts again';
      restart.addEventListener('click', () => {
        scenarioIndex = 0;
        revealed = false;
        chosenOption = -1;
        finished = false;
        renderScenario();
      });

      summary.append(heading, text, note, restart);
      revealArea.appendChild(summary);

      events.emit('experience_interaction', {
        experience_id: context.meta.id,
        action: 'session_complete',
        total_scenarios: SCENARIOS.length,
      });
    }

    updateStats();
    wrapper.append(title, desc, stats, scenarioCard, optionsArea, revealArea);
    container.appendChild(wrapper);
    renderScenario();

    return () => {
      // state persists intentionally
    };
  },
};

export default bias;
