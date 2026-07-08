import type { ExperienceContext, ExperienceModule } from '../platform/types';
import { events } from '../platform/events';

const STORAGE_KEY = 'memory-progress';
const STUDY_SECONDS = 12;

interface MemoryQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctOption: number;
  note: string;
}

interface MemoryScene {
  id: string;
  title: string;
  setup: string;
  facts: string[];
  questions: MemoryQuestion[];
}

interface MemoryProgress {
  sceneIndex: number;
  sessionsCompleted: number;
  bestAccuracy: number;
}

type ConfidenceLevel = 'low' | 'medium' | 'high';

const CONFIDENCE_VALUE: Record<ConfidenceLevel, number> = {
  low: 33,
  medium: 66,
  high: 100,
};

const SCENES: MemoryScene[] = [
  {
    id: 'kitchen',
    title: 'Rainy Kitchen',
    setup: 'Study the details. The scene will disappear, and you will answer from memory.',
    facts: [
      'A red umbrella leans beside the back door.',
      'Two lemons sit next to a chipped blue mug.',
      'A paper receipt with the number 47 is pinned to the fridge.',
      'The wall clock reads 8:15.',
      'Rain comes through an open window above the sink.',
      'A brown dog is sleeping on a striped rug.',
    ],
    questions: [
      {
        id: 'umbrella',
        prompt: 'What color was the umbrella?',
        options: ['Red', 'Green', 'Yellow'],
        correctOption: 0,
        note: 'Distinct details are easier to retain, but only if they were truly noticed during observation.',
      },
      {
        id: 'lemons',
        prompt: 'How many lemons were on the counter?',
        options: ['One', 'Two', 'Three'],
        correctOption: 1,
        note: 'Quantity is often reconstructed from the gist of a scene instead of replayed exactly.',
      },
      {
        id: 'clock',
        prompt: 'What time was on the clock?',
        options: ['8:15', '9:15', '7:45'],
        correctOption: 0,
        note: 'Specific numbers feel easy to remember, but they blur quickly once attention moves on.',
      },
      {
        id: 'cat',
        prompt: 'Was there a cat on the rug?',
        options: ['Yes', 'No'],
        correctOption: 1,
        note: 'This was a lure. Questions can smuggle in details that were never present and still feel familiar.',
      },
    ],
  },
  {
    id: 'station',
    title: 'Morning Station',
    setup: 'Observe first. Later, rely on recall instead of rereading.',
    facts: [
      'A cyclist in a yellow jacket holds a folded map.',
      'Platform 3 is marked on a hanging sign.',
      'A coffee cup is balanced on a silver bench.',
      'A child drags a green suitcase with one broken wheel.',
      'A departure board shows the word DELAYED in orange.',
      'Three pigeons stand near the ticket machine.',
    ],
    questions: [
      {
        id: 'jacket',
        prompt: 'What color was the cyclist’s jacket?',
        options: ['Yellow', 'Blue', 'Gray'],
        correctOption: 0,
        note: 'Color feels concrete, but confidence can rise even when the stored detail is vague.',
      },
      {
        id: 'platform',
        prompt: 'Which platform number was shown?',
        options: ['2', '3', '5'],
        correctOption: 1,
        note: 'Numbers are especially vulnerable to substitution when memory rebuilds instead of replays.',
      },
      {
        id: 'pigeons',
        prompt: 'How many pigeons were near the ticket machine?',
        options: ['Two', 'Three', 'Four'],
        correctOption: 1,
        note: 'Counts often come back as a feeling of “a few” unless attention locked onto them directly.',
      },
      {
        id: 'newspaper',
        prompt: 'Was anyone reading a newspaper?',
        options: ['Yes', 'No'],
        correctOption: 1,
        note: 'Another lure. Eyewitness memory is vulnerable to suggestions that fit the scene even when they never happened.',
      },
    ],
  },
];

function loadProgress(): MemoryProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as MemoryProgress;
    }
  } catch {
    // ignore persistence failures
  }
  return { sceneIndex: 0, sessionsCompleted: 0, bestAccuracy: 0 };
}

function saveProgress(progress: MemoryProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // ignore persistence failures
  }
}

const memoryExperience: ExperienceModule = {
  mount(container: HTMLElement, context: ExperienceContext) {
    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'memory-experience';
    wrapper.style.cssText = 'padding: 1rem; max-width: 760px; margin: 0 auto;';

    const progress = loadProgress();
    const scene = SCENES[progress.sceneIndex % SCENES.length];
    const answers: Record<string, number> = {};
    const confidence: Record<string, ConfidenceLevel> = {};
    let timeLeft = STUDY_SECONDS;
    let studyTimer = 0;
    let studyActive = false;

    const title = document.createElement('h2');
    title.textContent = 'Memory';

    const desc = document.createElement('p');
    desc.className = 'lead';
    desc.textContent = 'Observe the scene. Then answer from memory and compare confidence with accuracy.';

    const stats = document.createElement('div');
    stats.style.cssText = 'font-size: 0.875rem; color: GrayText; margin-bottom: 1rem;';

    const stage = document.createElement('div');
    stage.style.cssText = 'margin-top: 1rem;';

    function updateStats(): void {
      stats.textContent = `Sessions completed: ${progress.sessionsCompleted} • Best accuracy: ${progress.bestAccuracy}%`;
    }

    function clearStudyTimer(): void {
      if (studyTimer) {
        window.clearInterval(studyTimer);
        studyTimer = 0;
      }
    }

    function renderIntro(): void {
      stage.innerHTML = '';
      const card = document.createElement('div');
      card.style.cssText = 'padding: 1rem; border: 1px solid ButtonBorder; border-radius: 0.75rem; background: ButtonFace;';

      const heading = document.createElement('h3');
      heading.style.marginTop = '0';
      heading.textContent = scene.title;

      const setup = document.createElement('p');
      setup.style.marginBottom = '0.5rem';
      setup.textContent = scene.setup;

      const note = document.createElement('p');
      note.style.cssText = 'margin-bottom: 0; font-size: 0.9rem; color: GrayText;';
      note.textContent = `You will have ${STUDY_SECONDS} seconds to study before recall begins.`;

      const start = document.createElement('button');
      start.type = 'button';
      start.className = 'btn primary';
      start.style.marginTop = '0.75rem';
      start.textContent = 'Study the scene';
      start.addEventListener('click', startStudy);

      card.append(heading, setup, note, start);
      stage.appendChild(card);
    }

    function startStudy(): void {
      studyActive = true;
      timeLeft = STUDY_SECONDS;
      renderStudy();
      clearStudyTimer();
      studyTimer = window.setInterval(() => {
        timeLeft -= 1;
        if (timeLeft <= 0) {
          clearStudyTimer();
          startQuiz();
          return;
        }
        renderStudy();
      }, 1000);

      events.emit('experience_interaction', {
        experience_id: context.meta.id,
        action: 'study_started',
        scene: scene.id,
      });
    }

    function renderStudy(): void {
      stage.innerHTML = '';
      const card = document.createElement('div');
      card.style.cssText = 'padding: 1rem; border: 1px solid #2563eb; border-radius: 0.75rem; background: #2563eb11;';

      const heading = document.createElement('h3');
      heading.style.cssText = 'margin-top: 0; color: #1d4ed8;';
      heading.textContent = scene.title;

      const timer = document.createElement('div');
      timer.style.cssText = 'font-weight: 700; margin-bottom: 0.75rem;';
      timer.textContent = `Study time remaining: ${timeLeft}s`;

      const list = document.createElement('ul');
      list.style.cssText = 'padding-left: 1.25rem; margin-bottom: 0; line-height: 1.6;';
      scene.facts.forEach((fact) => {
        const item = document.createElement('li');
        item.textContent = fact;
        list.appendChild(item);
      });

      const earlyButton = document.createElement('button');
      earlyButton.type = 'button';
      earlyButton.className = 'btn';
      earlyButton.style.marginTop = '0.75rem';
      earlyButton.textContent = 'Begin recall now';
      earlyButton.addEventListener('click', startQuiz);

      card.append(heading, timer, list, earlyButton);
      stage.appendChild(card);
    }

    function startQuiz(): void {
      clearStudyTimer();
      studyActive = false;
      renderQuiz();
    }

    function renderQuiz(): void {
      stage.innerHTML = '';
      const form = document.createElement('form');
      form.style.cssText = 'display: grid; gap: 1rem;';

      const intro = document.createElement('div');
      intro.style.cssText = 'padding: 1rem; border: 1px solid ButtonBorder; border-radius: 0.75rem; background: ButtonFace;';
      intro.innerHTML = '<h3 style="margin-top:0;">Recall the scene</h3><p style="margin-bottom:0;">Choose an answer and rate your confidence for each question.</p>';
      form.appendChild(intro);

      scene.questions.forEach((question) => {
        const fieldset = document.createElement('fieldset');
        fieldset.style.cssText = 'border: 1px solid ButtonBorder; border-radius: 0.75rem; padding: 1rem;';

        const legend = document.createElement('legend');
        legend.style.cssText = 'padding: 0 0.25rem; font-weight: 600;';
        legend.textContent = question.prompt;
        fieldset.appendChild(legend);

        const optionGroup = document.createElement('div');
        optionGroup.style.cssText = 'display: grid; gap: 0.5rem; margin-top: 0.5rem;';
        question.options.forEach((option, index) => {
          const label = document.createElement('label');
          label.style.cssText = 'display: flex; gap: 0.5rem; align-items: center;';
          const input = document.createElement('input');
          input.type = 'radio';
          input.name = `answer-${question.id}`;
          input.value = String(index);
          input.addEventListener('change', () => {
            answers[question.id] = index;
          });
          const text = document.createElement('span');
          text.textContent = option;
          label.append(input, text);
          optionGroup.appendChild(label);
        });
        fieldset.appendChild(optionGroup);

        const confidenceLabel = document.createElement('label');
        confidenceLabel.style.cssText = 'display: block; margin-top: 0.75rem; font-size: 0.9rem;';
        confidenceLabel.textContent = 'Confidence';

        const select = document.createElement('select');
        select.style.cssText = 'margin-top: 0.35rem; width: 100%; max-width: 12rem;';
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = 'Choose one';
        select.appendChild(placeholder);
        (['low', 'medium', 'high'] as ConfidenceLevel[]).forEach((level) => {
          const option = document.createElement('option');
          option.value = level;
          option.textContent = level[0].toUpperCase() + level.slice(1);
          select.appendChild(option);
        });
        select.addEventListener('change', () => {
          const value = select.value as ConfidenceLevel | '';
          if (value) {
            confidence[question.id] = value;
          }
        });
        confidenceLabel.appendChild(document.createElement('br'));
        confidenceLabel.appendChild(select);
        fieldset.appendChild(confidenceLabel);

        form.appendChild(fieldset);
      });

      const submit = document.createElement('button');
      submit.type = 'submit';
      submit.className = 'btn primary';
      submit.textContent = 'Compare memory with reality';
      submit.style.width = 'fit-content';
      form.appendChild(submit);

      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const allAnswered = scene.questions.every((question) => answers[question.id] !== undefined && confidence[question.id] !== undefined);
        if (!allAnswered) {
          alert('Please answer every question and choose a confidence level before continuing.');
          return;
        }
        renderResults();
      });

      stage.appendChild(form);
    }

    function renderResults(): void {
      stage.innerHTML = '';
      const correctCount = scene.questions.filter((question) => answers[question.id] === question.correctOption).length;
      const accuracy = Math.round((correctCount / scene.questions.length) * 100);
      const averageConfidence = Math.round(
        scene.questions.reduce((sum, question) => sum + CONFIDENCE_VALUE[confidence[question.id]], 0) / scene.questions.length,
      );

      progress.sessionsCompleted += 1;
      progress.bestAccuracy = Math.max(progress.bestAccuracy, accuracy);
      progress.sceneIndex = (progress.sceneIndex + 1) % SCENES.length;
      saveProgress(progress);
      updateStats();

      const summary = document.createElement('div');
      summary.style.cssText = 'padding: 1rem; border: 1px solid #16a34a; border-radius: 0.75rem; background: #16a34a11;';

      const heading = document.createElement('h3');
      heading.style.cssText = 'margin-top: 0; color: #166534;';
      heading.textContent = 'Memory rebuilt the scene.';

      const topline = document.createElement('p');
      topline.textContent = `Accuracy: ${accuracy}% • Average confidence: ${averageConfidence}%`;

      const explanation = document.createElement('p');
      explanation.style.marginBottom = '0';
      explanation.textContent = 'Memory keeps the gist, then reconstructs details when asked. That is why confidence and accuracy can drift apart — especially when questions suggest details that fit the scene.';

      stage.appendChild(summary);
      summary.append(heading, topline, explanation);

      const breakdown = document.createElement('div');
      breakdown.style.cssText = 'display: grid; gap: 0.75rem; margin-top: 1rem;';

      scene.questions.forEach((question) => {
        const correct = answers[question.id] === question.correctOption;
        const card = document.createElement('div');
        card.style.cssText = `padding: 1rem; border: 1px solid ${correct ? '#16a34a' : '#b45309'}; border-radius: 0.75rem; background: ${correct ? '#16a34a11' : '#b4530911'};`;

        const prompt = document.createElement('h4');
        prompt.style.cssText = 'margin-top: 0; margin-bottom: 0.5rem;';
        prompt.textContent = question.prompt;

        const answerLine = document.createElement('p');
        answerLine.style.marginBottom = '0.35rem';
        answerLine.textContent = `You chose: ${question.options[answers[question.id]]} (${confidence[question.id]} confidence)`;

        const truth = document.createElement('p');
        truth.style.marginBottom = '0.35rem';
        truth.textContent = `Correct detail: ${question.options[question.correctOption]}`;

        const note = document.createElement('p');
        note.style.cssText = 'margin-bottom: 0; font-size: 0.9rem; color: GrayText;';
        note.textContent = question.note;

        card.append(prompt, answerLine, truth, note);
        breakdown.appendChild(card);
      });
      stage.appendChild(breakdown);

      const restart = document.createElement('button');
      restart.type = 'button';
      restart.className = 'btn primary';
      restart.style.marginTop = '1rem';
      restart.textContent = 'Try another scene';
      restart.addEventListener('click', () => {
        memoryExperience.mount(container, context);
      });
      stage.appendChild(restart);

      events.emit('experience_interaction', {
        experience_id: context.meta.id,
        action: 'memory_scored',
        scene: scene.id,
        accuracy,
        confidence: averageConfidence,
      });
    }

    updateStats();
    wrapper.append(title, desc, stats, stage);
    container.appendChild(wrapper);
    renderIntro();

    return () => {
      clearStudyTimer();
      if (studyActive) {
        studyActive = false;
      }
    };
  },
};

export default memoryExperience;
