import type { ExperienceModule, ExperienceContext } from '../platform/types';
import { events } from '../platform/events';

interface SymmetryPuzzle {
  id: string;
  title: string;
  context: string;
  size: number;
  targetCells: string[];
  lockedRule: (row: number, column: number, size: number) => boolean;
  transformation: string;
  explanation: string;
}

interface SymmetryProgress {
  completed: string[];
  attempts: number;
}

const cellId = (row: number, column: number): string => `${row}-${column}`;
const cells = (positions: Array<[number, number]>): string[] => positions.map(([row, column]) => cellId(row, column));

const PUZZLES: SymmetryPuzzle[] = [
  {
    id: 'butterfly',
    title: 'Butterfly Wings',
    context: 'Nature often uses mirrored balance. Complete the missing wing.',
    size: 5,
    targetCells: cells([
      [0, 1], [0, 3],
      [1, 0], [1, 1], [1, 3], [1, 4],
      [2, 1], [2, 2], [2, 3],
      [3, 0], [3, 1], [3, 3], [3, 4],
      [4, 1], [4, 3]
    ]),
    lockedRule: (_row, column, size) => column <= Math.floor(size / 2),
    transformation: 'vertical mirror symmetry',
    explanation: 'The right side matches the left side across an invisible center line. The shape changes sides, but the relationship stays balanced.'
  },
  {
    id: 'courtyard',
    title: 'Courtyard Tile',
    context: 'Art and architecture often build calm by reflecting a design across a line.',
    size: 5,
    targetCells: cells([
      [0, 2],
      [1, 1], [1, 2], [1, 3],
      [2, 0], [2, 2], [2, 4],
      [3, 1], [3, 2], [3, 3],
      [4, 2]
    ]),
    lockedRule: (row, _column, size) => row <= Math.floor(size / 2),
    transformation: 'horizontal mirror symmetry',
    explanation: 'The lower half reflects the upper half. Symmetry creates order without every cell being filled.'
  },
  {
    id: 'turning-wheel',
    title: 'Turning Wheel',
    context: 'Physical systems often keep balance when they rotate. Complete the half-turn pattern.',
    size: 5,
    targetCells: cells([
      [0, 2],
      [1, 2], [1, 3],
      [2, 2],
      [3, 1], [3, 2],
      [4, 2]
    ]),
    lockedRule: (row, column, size) => row * size + column <= Math.floor((size * size) / 2),
    transformation: 'half-turn rotational symmetry',
    explanation: 'Rotate this pattern halfway around and the filled cells land on matching filled cells. The movement changes position, not structure.'
  }
];

const STORAGE_KEY = 'mathematics-symmetry-progress';

function loadProgress(): SymmetryProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as SymmetryProgress;
  } catch { /* ignore */ }
  return { completed: [], attempts: 0 };
}

function saveProgress(progress: SymmetryProgress): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch { /* ignore */ }
}

function firstIncompleteIndex(progress: SymmetryProgress): number {
  const index = PUZZLES.findIndex(puzzle => !progress.completed.includes(puzzle.id));
  return index === -1 ? 0 : index;
}

function buildStartingCells(puzzle: SymmetryPuzzle): Set<string> {
  const target = new Set(puzzle.targetCells);
  const active = new Set<string>();
  for (let row = 0; row < puzzle.size; row += 1) {
    for (let column = 0; column < puzzle.size; column += 1) {
      const id = cellId(row, column);
      if (puzzle.lockedRule(row, column, puzzle.size) && target.has(id)) {
        active.add(id);
      }
    }
  }
  return active;
}

function countDifferences(active: Set<string>, target: Set<string>): number {
  let differences = 0;
  active.forEach(id => {
    if (!target.has(id)) differences += 1;
  });
  target.forEach(id => {
    if (!active.has(id)) differences += 1;
  });
  return differences;
}

const symmetry: ExperienceModule = {
  mount(container: HTMLElement, context: ExperienceContext) {
    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'symmetry';
    wrapper.style.cssText = 'padding: 1rem; max-width: 640px; margin: 0 auto;';

    let progress = loadProgress();
    let currentIndex = firstIncompleteIndex(progress);
    let activeCells = buildStartingCells(PUZZLES[currentIndex]);

    const title = document.createElement('h2');
    title.textContent = 'Symmetry';

    const lead = document.createElement('p');
    lead.className = 'lead';
    lead.textContent = 'Complete the balance. Symmetry means something can move, flip, or turn while an important structure stays the same.';

    const stats = document.createElement('div');
    stats.style.cssText = 'font-size: 0.875rem; color: GrayText; margin-bottom: 1rem;';

    const puzzleCard = document.createElement('div');
    puzzleCard.style.cssText = 'padding: 1rem; border: 1px solid ButtonBorder; border-radius: 0.5rem; background: ButtonFace; margin: 1rem 0;';

    const grid = document.createElement('div');
    grid.style.cssText = 'display: grid; gap: 0.35rem; margin: 1rem auto; width: min(100%, 330px);';
    grid.setAttribute('role', 'grid');
    grid.setAttribute('aria-label', 'Symmetry pattern grid');

    const resultArea = document.createElement('div');
    resultArea.style.cssText = 'margin-top: 1rem;';
    resultArea.setAttribute('aria-live', 'polite');

    const controls = document.createElement('div');
    controls.style.cssText = 'display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem;';

    function updateStats(): void {
      stats.textContent = `Balanced patterns: ${progress.completed.length}/${PUZZLES.length} • Checks: ${progress.attempts}`;
    }

    function renderPuzzle(): void {
      const puzzle = PUZZLES[currentIndex];
      activeCells = buildStartingCells(puzzle);
      puzzleCard.innerHTML = '';
      resultArea.innerHTML = '';
      controls.innerHTML = '';

      const heading = document.createElement('h3');
      heading.style.marginTop = '0';
      heading.textContent = puzzle.title;

      const contextText = document.createElement('p');
      contextText.style.cssText = 'line-height: 1.5; margin-bottom: 0.5rem;';
      contextText.textContent = puzzle.context;

      const hint = document.createElement('p');
      hint.style.cssText = 'font-size: 0.9rem; color: GrayText; margin-bottom: 0;';
      hint.textContent = 'Locked cells show the given structure. Toggle the open cells to complete the symmetry.';

      puzzleCard.append(heading, contextText, hint);
      renderGrid();
      renderControls();
    }

    function renderGrid(): void {
      const puzzle = PUZZLES[currentIndex];
      const target = new Set(puzzle.targetCells);
      grid.innerHTML = '';
      grid.style.gridTemplateColumns = `repeat(${puzzle.size}, minmax(38px, 1fr))`;

      for (let row = 0; row < puzzle.size; row += 1) {
        for (let column = 0; column < puzzle.size; column += 1) {
          const id = cellId(row, column);
          const locked = puzzle.lockedRule(row, column, puzzle.size);
          const active = activeCells.has(id);
          const button = document.createElement('button');
          button.type = 'button';
          button.disabled = locked;
          button.setAttribute('role', 'gridcell');
          button.setAttribute('aria-label', `Row ${row + 1}, column ${column + 1}, ${active ? 'filled' : 'empty'}${locked ? ', locked clue' : ', editable'}`);
          button.style.cssText = [
            'aspect-ratio: 1 / 1',
            'border-radius: 0.35rem',
            `border: 2px solid ${locked ? '#64748b' : 'ButtonBorder'}`,
            `background: ${active ? (locked ? '#64748b' : 'AccentColor') : 'ButtonFace'}`,
            `color: ${active ? (locked ? '#ffffff' : 'AccentColorText') : 'ButtonText'}`,
            `opacity: ${locked && !target.has(id) ? 0.45 : 1}`,
            `cursor: ${locked ? 'not-allowed' : 'pointer'}`
          ].join(';');
          button.textContent = '';
          if (!locked) {
            button.addEventListener('click', () => {
              if (activeCells.has(id)) {
                activeCells.delete(id);
              } else {
                activeCells.add(id);
              }
              resultArea.innerHTML = '';
              renderGrid();
              events.emit('experience_interaction', {
                experience_id: context.meta.id,
                action: 'symmetry_cell_toggled',
                puzzle: puzzle.id,
                cell: id
              });
            });
          }
          grid.appendChild(button);
        }
      }
    }

    function renderControls(): void {
      controls.innerHTML = '';

      const checkButton = document.createElement('button');
      checkButton.className = 'btn primary';
      checkButton.textContent = 'Check Symmetry';
      checkButton.addEventListener('click', checkSymmetry);

      const resetButton = document.createElement('button');
      resetButton.className = 'btn';
      resetButton.textContent = 'Reset Pattern';
      resetButton.addEventListener('click', () => {
        activeCells = buildStartingCells(PUZZLES[currentIndex]);
        resultArea.innerHTML = '';
        renderGrid();
      });

      controls.append(checkButton, resetButton);
    }

    function checkSymmetry(): void {
      const puzzle = PUZZLES[currentIndex];
      const target = new Set(puzzle.targetCells);
      const differences = countDifferences(activeCells, target);
      const complete = differences === 0;

      progress.attempts += 1;
      if (complete && !progress.completed.includes(puzzle.id)) {
        progress.completed.push(puzzle.id);
      }
      saveProgress(progress);
      updateStats();

      resultArea.innerHTML = '';
      const card = document.createElement('div');
      card.style.cssText = `padding: 1rem; border: 2px solid ${complete ? '#22c55e' : '#eab308'}; border-radius: 0.5rem; background: ${complete ? '#22c55e11' : '#eab30811'};`;

      const heading = document.createElement('h4');
      heading.style.cssText = `margin-top: 0; color: ${complete ? '#16a34a' : '#ca8a04'};`;
      heading.textContent = complete ? 'Symmetry revealed' : `${differences} cell${differences === 1 ? '' : 's'} still break the balance`;

      const explanation = document.createElement('p');
      explanation.style.cssText = 'margin-bottom: 0.5rem;';
      explanation.innerHTML = complete
        ? `<strong>${puzzle.transformation}:</strong> ${puzzle.explanation}`
        : 'Keep looking for the invisible transformation. Which open cells would match the locked structure?';

      const invariant = document.createElement('p');
      invariant.style.cssText = 'margin-bottom: 0; color: GrayText;';
      invariant.textContent = complete
        ? 'The formal idea is invariance: something changes, but an important relationship stays unchanged.'
        : 'Symmetry is a way of seeing order before naming it.';

      card.append(heading, explanation, invariant);
      resultArea.appendChild(card);

      events.emit('experience_interaction', {
        experience_id: context.meta.id,
        action: complete ? 'symmetry_completed' : 'symmetry_checked',
        puzzle: puzzle.id,
        differences
      });

      if (complete) {
        controls.innerHTML = '';
        const nextButton = document.createElement('button');
        nextButton.className = 'btn primary';
        nextButton.textContent = progress.completed.length === PUZZLES.length ? 'Review Symmetry' : 'Next Symmetry';
        nextButton.addEventListener('click', () => {
          currentIndex = progress.completed.length === PUZZLES.length
            ? 0
            : (currentIndex + 1) % PUZZLES.length;
          while (progress.completed.length < PUZZLES.length && progress.completed.includes(PUZZLES[currentIndex].id)) {
            currentIndex = (currentIndex + 1) % PUZZLES.length;
          }
          renderPuzzle();
        });
        controls.appendChild(nextButton);

        if (progress.completed.length === PUZZLES.length) {
          events.emit('experience_interaction', {
            experience_id: context.meta.id,
            action: 'completed',
            total_symmetries: PUZZLES.length
          });
        }
      }
    }

    wrapper.append(title, lead, stats, puzzleCard, grid, resultArea, controls);
    container.appendChild(wrapper);

    updateStats();
    renderPuzzle();

    return () => {};
  }
};

export default symmetry;
