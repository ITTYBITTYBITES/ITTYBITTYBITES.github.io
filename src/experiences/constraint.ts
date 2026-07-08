import type { ExperienceModule, ExperienceContext } from '../platform/types';
import { events } from '../platform/events';

interface ConstraintChallenge {
  id: string;
  title: string;
  prompt: string;
  rules: string[];
  checkFn: (text: string) => { pass: boolean; feedback: string };
  inspiration: string;
}

const CHALLENGES: ConstraintChallenge[] = [
  {
    id: 'six-word',
    title: 'Six Words',
    prompt: 'Tell a complete story in exactly six words.',
    rules: ['Exactly six words', 'Must tell a story with a beginning, middle, and end'],
    checkFn: (text: string) => {
      const words = text.trim().split(/\s+/).filter(w => w.length > 0);
      if (words.length === 6) return { pass: true, feedback: 'Exactly six words. Every one matters.' };
      if (words.length < 6) return { pass: false, feedback: `${6 - words.length} more word${6 - words.length === 1 ? '' : 's'} needed.` };
      return { pass: false, feedback: `${words.length - 6} word${words.length - 6 === 1 ? '' : 's'} too many. Cut what does not earn its place.` };
    },
    inspiration: 'Hemingway was challenged to write a story in six words. He wrote: "For sale: baby shoes, never worn." The power comes from what is left unsaid.'
  },
  {
    id: 'no-e',
    title: 'The Forbidden Letter',
    prompt: 'Write a sentence describing a landscape without using the letter "e".',
    rules: ['Must describe a landscape or natural scene', 'Cannot use the letter "e" (case insensitive)'],
    checkFn: (text: string) => {
      const hasE = /[eE]/.test(text);
      const words = text.trim().split(/\s+/).filter(w => w.length > 0);
      if (hasE) {
        const eCount = (text.match(/[eE]/g) || []).length;
        return { pass: false, feedback: `Found ${eCount} "e"${eCount === 1 ? '' : 's'}. Rewrite without them.` };
      }
      if (words.length < 3) return { pass: false, feedback: 'Too short to paint a landscape. Add more detail.' };
      return { pass: true, feedback: 'No "e" found. The constraint sharpened your word choices.' };
    },
    inspiration: 'Georges Perec wrote an entire 300-page novel without the letter "e." Constraints force invention — you discover words you would never have chosen otherwise.'
  },
  {
    id: 'monosyllable',
    title: 'Simple Words Only',
    prompt: 'Explain a complex idea using only words with one syllable.',
    rules: ['Every word must be one syllable', 'Must explain something complex (gravity, time, love, etc.)'],
    checkFn: (text: string) => {
      const words = text.trim().split(/\s+/).filter(w => w.length > 0);
      // Approximate syllable check: words > 5 chars or containing common multi-syllable patterns
      const longWords = words.filter(w => w.length > 5 && /[aeiouy].*[aeiouy]/i.test(w));
      if (longWords.length > 0) {
        return { pass: false, feedback: `"${longWords[0]}" may be multiple syllables. Try shorter words.` };
      }
      if (words.length < 5) return { pass: false, feedback: 'Complex ideas need room to breathe. Use more simple words.' };
      return { pass: true, feedback: 'Simple words carrying complex meaning. This is how great teachers explain things.' };
    },
    inspiration: 'The best explainers use simple words for complex ideas. If you cannot explain something simply, you do not understand it well enough.'
  },
  {
    id: 'limited-palette',
    title: 'The Limited Palette',
    prompt: 'Describe an emotion using only colors as metaphors. You may only reference: red, blue, green, yellow, black, white.',
    rules: ['Must describe an emotion', 'May only use color words from the palette: red, blue, green, yellow, black, white', 'At least 3 color references'],
    checkFn: (text: string) => {
      const lower = text.toLowerCase();
      const allowedColors = ['red', 'blue', 'green', 'yellow', 'black', 'white'];
      const forbiddenColors = ['purple', 'orange', 'pink', 'brown', 'gray', 'grey', 'violet', 'indigo'];
      const foundForbidden = forbiddenColors.find(c => lower.includes(c));
      if (foundForbidden) {
        return { pass: false, feedback: `"${foundForbidden}" is not in your palette. Use only: red, blue, green, yellow, black, white.` };
      }
      const usedColors = allowedColors.filter(c => lower.includes(c));
      if (usedColors.length < 3) {
        return { pass: false, feedback: `Used ${usedColors.length} color${usedColors.length === 1 ? '' : 's'}. Use at least 3 from your palette.` };
      }
      return { pass: true, feedback: `Used ${usedColors.length} colors as metaphors. Limitation revealed unexpected connections.` };
    },
    inspiration: 'Painters with limited palettes often produce their most powerful work. When you cannot reach for every color, you discover what each one can truly do.'
  },
  {
    id: 'questions-only',
    title: 'Questions Only',
    prompt: 'Make a point about something you believe — but only using questions.',
    rules: ['Every sentence must end with a question mark', 'Must make a coherent argument or point', 'At least 3 questions'],
    checkFn: (text: string) => {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const questionMarks = (text.match(/\?/g) || []).length;
      const periods = (text.match(/\./g) || []).length;
      if (periods > 0) return { pass: false, feedback: `Found ${periods} statement${periods === 1 ? '' : 's'} (periods). Convert them to questions.` };
      if (questionMarks < 3) return { pass: false, feedback: `${3 - questionMarks} more question${3 - questionMarks === 1 ? '' : 's'} needed to build your argument.` };
      if (sentences.length < 3) return { pass: false, feedback: 'Need more questions to build a coherent point.' };
      return { pass: true, feedback: 'Every sentence is a question, yet a point is made. Socratic method in action.' };
    },
    inspiration: 'Socrates taught by asking questions, not giving answers. The right question is often more powerful than the right answer.'
  }
];

const STORAGE_KEY = 'constraint-progress';

function loadProgress(): { completed: string[]; attempts: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { completed: [], attempts: 0 };
}

function saveProgress(p: { completed: string[]; attempts: number }): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

const constraint: ExperienceModule = {
  mount(container: HTMLElement, context: ExperienceContext) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'constraint';
    wrapper.style.cssText = 'padding: 1rem; max-width: 640px; margin: 0 auto;';

    let progress = loadProgress();
    let currentIdx = 0;
    // Find first uncompleted
    for (let i = 0; i < CHALLENGES.length; i++) {
      if (!progress.completed.includes(CHALLENGES[i].id)) {
        currentIdx = i;
        break;
      }
    }

    const title = document.createElement('h2');
    title.textContent = 'Constraint';

    const desc = document.createElement('p');
    desc.className = 'lead';
    desc.textContent = 'Limits do not kill creativity. They focus it. Build something meaningful when most options are closed.';

    const stats = document.createElement('div');
    stats.style.cssText = 'font-size: 0.875rem; color: GrayText; margin-bottom: 1rem;';

    const challengeCard = document.createElement('div');
    challengeCard.style.cssText = 'padding: 1rem; border: 1px solid ButtonBorder; border-radius: 0.5rem; background: ButtonFace; margin: 1rem 0;';

    const rulesArea = document.createElement('div');
    rulesArea.style.cssText = 'margin: 0.75rem 0;';

    const inputArea = document.createElement('div');
    inputArea.style.cssText = 'margin: 1rem 0;';

    const feedbackArea = document.createElement('div');
    feedbackArea.style.cssText = 'margin-top: 1rem;';

    const inspirationArea = document.createElement('div');
    inspirationArea.style.cssText = 'margin-top: 1rem;';

    const controls = document.createElement('div');
    controls.style.cssText = 'display: flex; gap: 0.5rem; margin-top: 1rem;';

    function updateStats() {
      stats.textContent = `Challenges: ${progress.completed.length}/${CHALLENGES.length} • Attempts: ${progress.attempts}`;
    }

    function renderChallenge() {
      const ch = CHALLENGES[currentIdx];
      challengeCard.innerHTML = '';

      const chTitle = document.createElement('h3');
      chTitle.style.marginTop = '0';
      chTitle.textContent = ch.title;

      const prompt = document.createElement('p');
      prompt.style.cssText = 'font-size: 1.05rem; line-height: 1.5; margin-bottom: 0;';
      prompt.textContent = ch.prompt;

      challengeCard.append(chTitle, prompt);
    }

    function renderRules() {
      const ch = CHALLENGES[currentIdx];
      rulesArea.innerHTML = '';

      const header = document.createElement('p');
      header.style.cssText = 'font-weight: 600; font-size: 0.9rem; margin-bottom: 0.35rem;';
      header.textContent = 'Rules:';
      rulesArea.appendChild(header);

      const list = document.createElement('ul');
      list.style.cssText = 'padding-left: 1.25rem; margin-bottom: 0;';
      ch.rules.forEach(rule => {
        const li = document.createElement('li');
        li.textContent = rule;
        li.style.marginBottom = '0.25rem';
        list.appendChild(li);
      });
      rulesArea.appendChild(list);
    }

    function renderInput() {
      inputArea.innerHTML = '';
      const ch = CHALLENGES[currentIdx];

      const textarea = document.createElement('textarea');
      textarea.style.cssText = 'width: 100%; min-height: 100px; padding: 0.75rem; border: 1px solid ButtonBorder; border-radius: 0.5rem; font-family: inherit; font-size: 1rem; resize: vertical; box-sizing: border-box;';
      textarea.placeholder = 'Write your response here...';
      textarea.setAttribute('aria-label', 'Your creative response');

      const charCount = document.createElement('div');
      charCount.style.cssText = 'font-size: 0.8rem; color: GrayText; text-align: right; margin-top: 0.25rem;';
      charCount.textContent = '0 characters';

      textarea.addEventListener('input', () => {
        const len = textarea.value.length;
        const words = textarea.value.trim().split(/\s+/).filter(w => w.length > 0).length;
        charCount.textContent = `${len} character${len === 1 ? '' : 's'} • ${words} word${words === 1 ? '' : 's'}`;
      });

      const submitBtn = document.createElement('button');
      submitBtn.className = 'btn primary';
      submitBtn.textContent = 'Check my work';
      submitBtn.style.marginTop = '0.5rem';

      submitBtn.addEventListener('click', () => {
        const text = textarea.value.trim();
        if (!text) return;
        progress.attempts += 1;
        saveProgress(progress);

        const result = ch.checkFn(text);
        if (result.pass && !progress.completed.includes(ch.id)) {
          progress.completed.push(ch.id);
          saveProgress(progress);
        }
        updateStats();
        renderFeedback(result);

        events.emit('experience_interaction', {
          experience_id: context.meta.id,
          action: result.pass ? 'constraint_passed' : 'constraint_failed',
          challenge: ch.id,
          attempts: progress.attempts
        });
      });

      inputArea.append(textarea, charCount, submitBtn);
    }

    function renderFeedback(result: { pass: boolean; feedback: string }) {
      feedbackArea.innerHTML = '';

      const card = document.createElement('div');
      card.style.cssText = `padding: 1rem; border: 1px solid ${result.pass ? '#22c55e' : '#eab308'}; border-radius: 0.5rem; background: ${result.pass ? '#22c55e11' : '#eab30811'};`;

      const heading = document.createElement('h4');
      heading.style.cssText = `margin-top: 0; color: ${result.pass ? '#16a34a' : '#ca8a04'};`;
      heading.textContent = result.pass ? 'Constraint satisfied' : 'Not yet';

      const feedback = document.createElement('p');
      feedback.style.cssText = 'margin-bottom: 0;';
      feedback.textContent = result.feedback;

      card.append(heading, feedback);
      feedbackArea.appendChild(card);

      // Show inspiration
      inspirationArea.innerHTML = '';
      const inspCard = document.createElement('div');
      inspCard.style.cssText = 'padding: 0.75rem; border-left: 3px solid GrayText; margin-top: 1rem; font-size: 0.9rem; color: GrayText;';
      const inspText = document.createElement('p');
      inspText.style.cssText = 'margin-bottom: 0; font-style: italic;';
      inspText.textContent = CHALLENGES[currentIdx].inspiration;
      inspCard.appendChild(inspText);
      inspirationArea.appendChild(inspCard);

      // Next button
      controls.innerHTML = '';
      const nextBtn = document.createElement('button');
      nextBtn.className = 'btn primary';
      nextBtn.textContent = currentIdx < CHALLENGES.length - 1 ? 'Next Challenge →' : 'Review completed';
      nextBtn.addEventListener('click', () => {
        currentIdx = (currentIdx + 1) % CHALLENGES.length;
        feedbackArea.innerHTML = '';
        inspirationArea.innerHTML = '';
        render();
      });
      controls.appendChild(nextBtn);

      // Retry button if failed
      if (!result.pass) {
        const retryBtn = document.createElement('button');
        retryBtn.className = 'btn';
        retryBtn.textContent = 'Try again';
        retryBtn.addEventListener('click', () => {
          feedbackArea.innerHTML = '';
          inspirationArea.innerHTML = '';
          controls.innerHTML = '';
          renderInput();
        });
        controls.appendChild(retryBtn);
      }
    }

    function render() {
      updateStats();
      renderChallenge();
      renderRules();
      renderInput();
      feedbackArea.innerHTML = '';
      inspirationArea.innerHTML = '';
      controls.innerHTML = '';
    }

    wrapper.append(title, desc, stats, challengeCard, rulesArea, inputArea, feedbackArea, inspirationArea, controls);
    container.appendChild(wrapper);

    render();

    return () => {};
  }
};

export default constraint;
