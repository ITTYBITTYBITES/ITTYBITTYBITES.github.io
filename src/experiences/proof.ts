import type { ExperienceModule, ExperienceContext } from '../platform/types';
import { events } from '../platform/events';

interface ProofStep {
  id: string;
  text: string;
}

interface CounterexampleTest {
  value: number;
  result: string;
  breaksClaim: boolean;
}

interface ProofProgress {
  examplesTested: number;
  counterexamplesFound: number;
  completed: boolean;
}

const ODD_SUM_EXAMPLES: Array<[number, number]> = [
  [3, 5],
  [7, 11],
  [13, 1],
  [21, 9],
  [101, 33]
];

const COUNTEREXAMPLE_TESTS: CounterexampleTest[] = [
  { value: 5, result: '5 is prime, so this example supports the claim.', breaksClaim: false },
  { value: 15, result: '15 ends in 5, but 15 = 3 × 5. The claim breaks.', breaksClaim: true },
  { value: 25, result: '25 ends in 5, but 25 = 5 × 5. Another counterexample.', breaksClaim: true }
];

const PROOF_STEPS: ProofStep[] = [
  {
    id: 'pairs-extra',
    text: 'An odd number can be seen as complete pairs with one extra object left over.'
  },
  {
    id: 'two-odds',
    text: 'Adding two odd numbers means combining two groups that each have one extra object.'
  },
  {
    id: 'extras-pair',
    text: 'The two extra objects join together to make one more complete pair.'
  },
  {
    id: 'therefore-even',
    text: 'Everything is now in complete pairs, so the sum must be even.'
  }
];

const SHUFFLED_STEP_IDS = ['extras-pair', 'pairs-extra', 'therefore-even', 'two-odds'];
const CORRECT_ORDER = ['pairs-extra', 'two-odds', 'extras-pair', 'therefore-even'];
const STORAGE_KEY = 'mathematics-proof-progress';

function loadProgress(): ProofProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ProofProgress;
  } catch { /* ignore */ }
  return { examplesTested: 0, counterexamplesFound: 0, completed: false };
}

function saveProgress(progress: ProofProgress): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch { /* ignore */ }
}

function stepById(id: string): ProofStep {
  const step = PROOF_STEPS.find(item => item.id === id);
  if (!step) throw new Error(`Missing proof step: ${id}`);
  return step;
}

const proof: ExperienceModule = {
  mount(container: HTMLElement, context: ExperienceContext) {
    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'proof';
    wrapper.style.cssText = 'padding: 1rem; max-width: 680px; margin: 0 auto;';

    let progress = loadProgress();
    let exampleIndex = 0;
    let exampleResults: string[] = [];
    let selectedSteps: string[] = [];
    let testedCounterexamples = new Set<number>();

    const title = document.createElement('h2');
    title.textContent = 'Proof';

    const lead = document.createElement('p');
    lead.className = 'lead';
    lead.textContent = 'Examples can make an idea believable. Proof explains why every possible case must work.';

    const stats = document.createElement('div');
    stats.style.cssText = 'font-size: 0.875rem; color: GrayText; margin-bottom: 1rem;';

    const examplesCard = document.createElement('section');
    examplesCard.style.cssText = 'padding: 1rem; border: 1px solid ButtonBorder; border-radius: 0.5rem; background: ButtonFace; margin: 1rem 0;';

    const counterexampleCard = document.createElement('section');
    counterexampleCard.style.cssText = 'padding: 1rem; border: 1px solid ButtonBorder; border-radius: 0.5rem; background: ButtonFace; margin: 1rem 0;';

    const proofCard = document.createElement('section');
    proofCard.style.cssText = 'padding: 1rem; border: 1px solid ButtonBorder; border-radius: 0.5rem; background: ButtonFace; margin: 1rem 0;';

    const resultArea = document.createElement('div');
    resultArea.style.cssText = 'margin-top: 1rem;';
    resultArea.setAttribute('aria-live', 'polite');

    function updateStats(): void {
      stats.textContent = `Examples tested: ${progress.examplesTested} • Counterexamples found: ${progress.counterexamplesFound} • Proof ${progress.completed ? 'complete' : 'in progress'}`;
    }

    function renderExamples(): void {
      examplesCard.innerHTML = '';

      const heading = document.createElement('h3');
      heading.style.marginTop = '0';
      heading.textContent = '1. It appears true';

      const claim = document.createElement('p');
      claim.style.cssText = 'font-weight: 600;';
      claim.textContent = 'Claim: Odd number + odd number always makes an even number.';

      const explanation = document.createElement('p');
      explanation.style.cssText = 'line-height: 1.5;';
      explanation.textContent = 'Start the way mathematicians often start: test a few cases and look for a pattern.';

      const testButton = document.createElement('button');
      testButton.className = 'btn primary';
      testButton.textContent = 'Test an example';
      testButton.disabled = exampleResults.length === ODD_SUM_EXAMPLES.length;
      testButton.addEventListener('click', testExample);

      const list = document.createElement('div');
      list.style.cssText = 'display: grid; gap: 0.4rem; margin-top: 0.75rem;';
      exampleResults.forEach(line => {
        const item = document.createElement('div');
        item.style.cssText = 'padding: 0.5rem; border: 1px solid ButtonBorder; border-radius: 0.35rem; background: canvas;';
        item.textContent = line;
        list.appendChild(item);
      });

      const note = document.createElement('p');
      note.style.cssText = 'margin: 0.75rem 0 0; color: GrayText;';
      note.textContent = exampleResults.length >= 3
        ? 'Many examples support the claim. But examples only show that it appears true. They do not cover every odd number.'
        : 'One example is evidence, not certainty. Try a few.';

      examplesCard.append(heading, claim, explanation, testButton, list, note);
    }

    function testExample(): void {
      const pair = ODD_SUM_EXAMPLES[exampleIndex % ODD_SUM_EXAMPLES.length];
      const sum = pair[0] + pair[1];
      exampleResults.push(`${pair[0]} + ${pair[1]} = ${sum}, which is even.`);
      exampleIndex += 1;
      progress.examplesTested += 1;
      saveProgress(progress);
      updateStats();
      renderExamples();
      events.emit('experience_interaction', {
        experience_id: context.meta.id,
        action: 'proof_example_tested',
        a: pair[0],
        b: pair[1],
        sum
      });
    }

    function renderCounterexamples(): void {
      counterexampleCard.innerHTML = '';

      const heading = document.createElement('h3');
      heading.style.marginTop = '0';
      heading.textContent = '2. One counterexample can break a claim';

      const claim = document.createElement('p');
      claim.style.cssText = 'font-weight: 600;';
      claim.textContent = 'Claim: Every number ending in 5 is prime.';

      const explanation = document.createElement('p');
      explanation.style.cssText = 'line-height: 1.5;';
      explanation.textContent = 'This claim starts with a tempting example. Test more cases and watch what happens.';

      const buttonRow = document.createElement('div');
      buttonRow.style.cssText = 'display: flex; gap: 0.5rem; flex-wrap: wrap;';

      COUNTEREXAMPLE_TESTS.forEach(test => {
        const button = document.createElement('button');
        button.className = 'btn';
        button.textContent = `Test ${test.value}`;
        button.disabled = testedCounterexamples.has(test.value);
        button.addEventListener('click', () => testCounterexample(test));
        buttonRow.appendChild(button);
      });

      const note = document.createElement('p');
      note.style.cssText = 'margin: 0.75rem 0 0; color: GrayText;';
      note.textContent = testedCounterexamples.size === 0
        ? 'A universal claim means every case must work.'
        : 'A single broken case is enough to show that a universal claim is false.';

      counterexampleCard.append(heading, claim, explanation, buttonRow, note);
    }

    function testCounterexample(test: CounterexampleTest): void {
      testedCounterexamples.add(test.value);
      if (test.breaksClaim) {
        progress.counterexamplesFound += 1;
      }
      saveProgress(progress);
      updateStats();
      renderCounterexamples();

      resultArea.innerHTML = '';
      const card = document.createElement('div');
      card.style.cssText = `padding: 1rem; border: 2px solid ${test.breaksClaim ? '#22c55e' : '#3b82f6'}; border-radius: 0.5rem; background: ${test.breaksClaim ? '#22c55e11' : '#3b82f611'};`;
      card.textContent = test.result;
      resultArea.appendChild(card);

      events.emit('experience_interaction', {
        experience_id: context.meta.id,
        action: test.breaksClaim ? 'counterexample_found' : 'supporting_example_found',
        value: test.value
      });
    }

    function renderProofBuilder(): void {
      proofCard.innerHTML = '';

      const heading = document.createElement('h3');
      heading.style.marginTop = '0';
      heading.textContent = '3. Build the reason it must be true';

      const instruction = document.createElement('p');
      instruction.style.cssText = 'line-height: 1.5;';
      instruction.textContent = 'Put the reasoning steps in order to prove why odd + odd must always be even.';

      const layout = document.createElement('div');
      layout.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;';

      const available = document.createElement('div');
      const availableTitle = document.createElement('h4');
      availableTitle.style.marginTop = '0';
      availableTitle.textContent = 'Available steps';
      const availableList = document.createElement('div');
      availableList.style.cssText = 'display: grid; gap: 0.5rem;';

      SHUFFLED_STEP_IDS.filter(id => !selectedSteps.includes(id)).forEach(id => {
        const step = stepById(id);
        const button = document.createElement('button');
        button.className = 'btn';
        button.style.cssText = 'text-align: left; padding: 0.75rem; line-height: 1.4;';
        button.textContent = step.text;
        button.addEventListener('click', () => {
          selectedSteps.push(step.id);
          resultArea.innerHTML = '';
          renderProofBuilder();
        });
        availableList.appendChild(button);
      });
      available.append(availableTitle, availableList);

      const argument = document.createElement('div');
      const argumentTitle = document.createElement('h4');
      argumentTitle.style.marginTop = '0';
      argumentTitle.textContent = 'Your argument';
      const argumentList = document.createElement('ol');
      argumentList.style.cssText = 'display: grid; gap: 0.5rem; padding-left: 1.25rem;';

      selectedSteps.forEach(id => {
        const step = stepById(id);
        const item = document.createElement('li');
        item.style.cssText = 'padding: 0.6rem; border: 1px solid ButtonBorder; border-radius: 0.35rem; background: canvas; line-height: 1.4;';
        item.textContent = step.text;
        argumentList.appendChild(item);
      });
      argument.append(argumentTitle, argumentList);

      layout.append(available, argument);

      const buttonRow = document.createElement('div');
      buttonRow.style.cssText = 'display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem;';

      const checkButton = document.createElement('button');
      checkButton.className = 'btn primary';
      checkButton.textContent = 'Check Proof';
      checkButton.addEventListener('click', checkProof);

      const resetButton = document.createElement('button');
      resetButton.className = 'btn';
      resetButton.textContent = 'Start Over';
      resetButton.addEventListener('click', () => {
        selectedSteps = [];
        resultArea.innerHTML = '';
        renderProofBuilder();
      });

      buttonRow.append(checkButton, resetButton);
      proofCard.append(heading, instruction, layout, buttonRow);
    }

    function checkProof(): void {
      resultArea.innerHTML = '';
      const completeLength = selectedSteps.length === CORRECT_ORDER.length;
      const correct = completeLength && selectedSteps.every((id, index) => id === CORRECT_ORDER[index]);

      const card = document.createElement('div');
      card.style.cssText = `padding: 1rem; border: 2px solid ${correct ? '#22c55e' : '#eab308'}; border-radius: 0.5rem; background: ${correct ? '#22c55e11' : '#eab30811'};`;

      const heading = document.createElement('h4');
      heading.style.cssText = `margin-top: 0; color: ${correct ? '#16a34a' : '#ca8a04'};`;
      heading.textContent = correct ? 'It must be true' : 'The logic is not complete yet';

      const message = document.createElement('p');
      message.style.cssText = 'margin-bottom: 0;';
      if (correct) {
        message.textContent = 'You did not check every odd number one by one. You explained the structure shared by all odd numbers. That is proof.';
        progress.completed = true;
        saveProgress(progress);
        updateStats();
        events.emit('experience_interaction', {
          experience_id: context.meta.id,
          action: 'completed',
          proof: 'odd_plus_odd_even'
        });
      } else if (!completeLength) {
        message.textContent = 'Use every step. Proof needs a chain with no missing links.';
      } else {
        message.textContent = 'Try a different order. A proof is not just true statements; it is true statements connected in the right way.';
      }

      card.append(heading, message);
      resultArea.appendChild(card);

      events.emit('experience_interaction', {
        experience_id: context.meta.id,
        action: correct ? 'proof_completed' : 'proof_checked',
        selected_steps: selectedSteps.join(',')
      });
    }

    wrapper.append(title, lead, stats, examplesCard, counterexampleCard, proofCard, resultArea);
    container.appendChild(wrapper);

    updateStats();
    renderExamples();
    renderCounterexamples();
    renderProofBuilder();

    return () => {};
  }
};

export default proof;
