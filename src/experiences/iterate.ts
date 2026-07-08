import type { ExperienceModule, ExperienceContext } from '../platform/types';
import { events } from '../platform/events';

interface IterationScenario {
  id: string;
  title: string;
  description: string;
  initialGrid: boolean[][];
  ruleDescription: string;
  targetMessage: string;
  maxRounds: number;
}

// Simple cellular automaton-like puzzles where each round applies rules
// The user modifies the initial state to reach a target after N rounds
const SCENARIOS: IterationScenario[] = [
  {
    id: 'simple-growth',
    title: 'The Seed Pattern',
    description: 'Place seeds on the grid. Each round, living cells spread to their neighbors. Reach the target pattern in 4 rounds.',
    initialGrid: [
      [false, false, false, false, false],
      [false, false, false, false, false],
      [false, false, false, false, false],
      [false, false, false, false, false],
      [false, false, false, false, false]
    ],
    ruleDescription: 'Each round: empty cells adjacent to 2+ living cells become alive. Living cells survive if they have 1-3 living neighbors.',
    targetMessage: 'Fill the center 3x3 square',
    maxRounds: 4
  },
  {
    id: 'erosion',
    title: 'Worn Away',
    description: 'Start with a full grid. Watch how the edges erode. Place initial blocks to create a specific shape after 3 rounds.',
    initialGrid: [
      [true, true, true, true, true],
      [true, true, true, true, true],
      [true, true, true, true, true],
      [true, true, true, true, true],
      [true, true, true, true, true]
    ],
    ruleDescription: 'Each round: living cells with 4+ living neighbors survive. Others erode (become empty).',
    targetMessage: 'End with a plus/cross shape',
    maxRounds: 3
  },
  {
    id: 'wave',
    title: 'The Ripple',
    description: 'Start with one cell alive. It creates a pattern through iteration. Observe how simple rules create complexity.',
    initialGrid: [
      [false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false],
      [false, false, false, true,  false, false, false],
      [false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false]
    ],
    ruleDescription: 'Each round: empty cells adjacent to exactly 1 living cell become alive. Living cells die after 1 round.',
    targetMessage: 'Watch the wave expand',
    maxRounds: 5
  }
];

const STORAGE_KEY = 'iterate-progress';

function loadProgress(): { scenariosExplored: string[]; totalRounds: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { scenariosExplored: [], totalRounds: 0 };
}

function saveProgress(p: { scenariosExplored: string[]; totalRounds: number }): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

const iterate: ExperienceModule = {
  mount(container: HTMLElement, context: ExperienceContext) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'iterate';
    wrapper.style.cssText = 'padding: 1rem; max-width: 640px; margin: 0 auto;';

    let progress = loadProgress();
    let currentIdx = 0;
    let currentGrid: boolean[][] = [];
    let round = 0;
    let isEditing = true;

    const title = document.createElement('h2');
    title.textContent = 'Iterate';

    const desc = document.createElement('p');
    desc.className = 'lead';
    desc.textContent = 'The first version is never the final version. Start rough. Refine through rounds. Watch the work reveal itself.';

    const stats = document.createElement('div');
    stats.style.cssText = 'font-size: 0.875rem; color: GrayText; margin-bottom: 1rem;';

    const scenarioCard = document.createElement('div');
    scenarioCard.style.cssText = 'padding: 1rem; border: 1px solid ButtonBorder; border-radius: 0.5rem; background: ButtonFace; margin: 1rem 0;';

    const gridArea = document.createElement('div');
    gridArea.style.cssText = 'margin: 1rem 0; display: flex; justify-content: center;';

    const roundInfo = document.createElement('div');
    roundInfo.style.cssText = 'text-align: center; margin: 0.5rem 0;';

    const controls = document.createElement('div');
    controls.style.cssText = 'display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; margin-top: 1rem;';

    const insightArea = document.createElement('div');
    insightArea.style.cssText = 'margin-top: 1rem;';

    function updateStats() {
      stats.textContent = `Scenarios explored: ${progress.scenariosExplored.length}/${SCENARIOS.length} • Rounds observed: ${progress.totalRounds}`;
    }

    function applyRules(grid: boolean[][]): boolean[][] {
      const scenario = SCENARIOS[currentIdx];
      const rows = grid.length;
      const cols = grid[0].length;
      const newGrid: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));

      if (scenario.id === 'simple-growth') {
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const neighbors = countNeighbors(grid, r, c);
            if (grid[r][c]) {
              // Survive with 1-3 neighbors
              newGrid[r][c] = neighbors >= 1 && neighbors <= 3;
            } else {
              // Birth with 2+ neighbors
              newGrid[r][c] = neighbors >= 2;
            }
          }
        }
      } else if (scenario.id === 'erosion') {
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (grid[r][c]) {
              const neighbors = countNeighbors(grid, r, c);
              // Survive only with 4+ neighbors
              newGrid[r][c] = neighbors >= 4;
            }
          }
        }
      } else if (scenario.id === 'wave') {
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const neighbors = countNeighbors(grid, r, c);
            if (grid[r][c]) {
              // Die after 1 round
              newGrid[r][c] = false;
            } else {
              // Birth with exactly 1 neighbor
              newGrid[r][c] = neighbors === 1;
            }
          }
        }
      }

      return newGrid;
    }

    function countNeighbors(grid: boolean[][], row: number, col: number): number {
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const r = row + dr;
          const c = col + dc;
          if (r >= 0 && r < grid.length && c >= 0 && c < grid[0].length) {
            if (grid[r][c]) count++;
          }
        }
      }
      return count;
    }

    function renderGrid() {
      gridArea.innerHTML = '';
      const rows = currentGrid.length;
      const cols = currentGrid[0].length;
      const cellSize = Math.min(40, Math.floor(300 / Math.max(rows, cols)));

      const table = document.createElement('div');
      table.style.cssText = `display: grid; grid-template-columns: repeat(${cols}, ${cellSize}px); gap: 2px;`;
      table.setAttribute('role', 'grid');
      table.setAttribute('aria-label', 'Iteration grid');

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cell = document.createElement('button');
          cell.setAttribute('role', 'gridcell');
          const alive = currentGrid[r][c];
          cell.style.cssText = `width: ${cellSize}px; height: ${cellSize}px; border: 1px solid ButtonBorder; border-radius: 2px; background: ${alive ? 'AccentColor' : 'ButtonFace'}; cursor: ${isEditing ? 'pointer' : 'default'}; transition: background 0.2s;`;
          cell.setAttribute('aria-label', `Cell ${r + 1},${c + 1}: ${alive ? 'alive' : 'empty'}`);

          if (isEditing) {
            cell.addEventListener('click', () => {
              currentGrid[r][c] = !currentGrid[r][c];
              renderGrid();
            });
          }

          table.appendChild(cell);
        }
      }

      gridArea.appendChild(table);
    }

    function renderScenario() {
      const scenario = SCENARIOS[currentIdx];
      scenarioCard.innerHTML = '';

      const heading = document.createElement('h3');
      heading.style.marginTop = '0';
      heading.textContent = scenario.title;

      const description = document.createElement('p');
      description.style.cssText = 'line-height: 1.5; margin-bottom: 0.5rem;';
      description.textContent = scenario.description;

      const rule = document.createElement('p');
      rule.style.cssText = 'font-size: 0.85rem; color: GrayText; font-style: italic; margin-bottom: 0.5rem;';
      rule.textContent = `Rule: ${scenario.ruleDescription}`;

      const target = document.createElement('p');
      target.style.cssText = 'font-size: 0.85rem; margin-bottom: 0;';
      target.innerHTML = `Target: <strong>${scenario.targetMessage}</strong>`;

      scenarioCard.append(heading, description, rule, target);
    }

    function renderRoundInfo() {
      const scenario = SCENARIOS[currentIdx];
      roundInfo.innerHTML = '';

      if (isEditing) {
        roundInfo.textContent = 'Edit the initial state, then iterate.';
        roundInfo.style.cssText = 'text-align: center; margin: 0.5rem 0; color: GrayText;';
      } else {
        roundInfo.textContent = `Round ${round}/${scenario.maxRounds}`;
        roundInfo.style.cssText = 'text-align: center; margin: 0.5rem 0; font-weight: 600; font-size: 1.1rem;';
        if (round >= scenario.maxRounds) {
          roundInfo.textContent += ' — Final state';
        }
      }
    }

    function renderControls() {
      const scenario = SCENARIOS[currentIdx];
      controls.innerHTML = '';

      if (isEditing) {
        const iterateBtn = document.createElement('button');
        iterateBtn.className = 'btn primary';
        iterateBtn.textContent = 'Begin iteration →';
        iterateBtn.addEventListener('click', () => {
          isEditing = false;
          round = 0;
          render();
          // Auto-advance
          setTimeout(() => step(), 500);
        });
        controls.appendChild(iterateBtn);

        const resetBtn = document.createElement('button');
        resetBtn.className = 'btn';
        resetBtn.textContent = 'Reset';
        resetBtn.addEventListener('click', () => {
          currentGrid = scenario.initialGrid.map(row => [...row]);
          isEditing = true;
          round = 0;
          render();
        });
        controls.appendChild(resetBtn);
      } else if (round < scenario.maxRounds) {
        const stepBtn = document.createElement('button');
        stepBtn.className = 'btn primary';
        stepBtn.textContent = `Next round (${round + 1}/${scenario.maxRounds})`;
        stepBtn.addEventListener('click', () => step());
        controls.appendChild(stepBtn);

        const autoBtn = document.createElement('button');
        autoBtn.className = 'btn';
        autoBtn.textContent = 'Run all remaining';
        autoBtn.addEventListener('click', async () => {
          while (round < scenario.maxRounds) {
            step();
            await new Promise(r => setTimeout(r, 600));
          }
        });
        controls.appendChild(autoBtn);

        const editBtn = document.createElement('button');
        editBtn.className = 'btn';
        editBtn.textContent = '← Edit initial state';
        editBtn.addEventListener('click', () => {
          currentGrid = scenario.initialGrid.map(row => [...row]);
          isEditing = true;
          round = 0;
          render();
        });
        controls.appendChild(editBtn);
      } else {
        // Completed
        if (!progress.scenariosExplored.includes(scenario.id)) {
          progress.scenariosExplored.push(scenario.id);
          saveProgress(progress);
          updateStats();

          events.emit('experience_interaction', {
            experience_id: context.meta.id,
            action: 'iteration_complete',
            scenario: scenario.id,
            rounds: scenario.maxRounds
          });
        }

        renderInsight(scenario);

        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn primary';
        nextBtn.textContent = currentIdx < SCENARIOS.length - 1 ? 'Next Pattern →' : 'Try Again';
        nextBtn.addEventListener('click', () => {
          currentIdx = (currentIdx + 1) % SCENARIOS.length;
          currentGrid = [];
          round = 0;
          isEditing = true;
          insightArea.innerHTML = '';
          render();
        });
        controls.appendChild(nextBtn);

        const restartBtn = document.createElement('button');
        restartBtn.className = 'btn';
        restartBtn.textContent = 'Edit and re-run';
        restartBtn.addEventListener('click', () => {
          currentGrid = scenario.initialGrid.map(row => [...row]);
          isEditing = true;
          round = 0;
          insightArea.innerHTML = '';
          render();
        });
        controls.appendChild(restartBtn);
      }
    }

    function step() {
      if (round >= SCENARIOS[currentIdx].maxRounds) return;
      currentGrid = applyRules(currentGrid);
      round++;
      progress.totalRounds++;
      saveProgress(progress);
      updateStats();
      renderGrid();
      renderRoundInfo();
      renderControls();

      // Count alive cells for display
      const alive = currentGrid.flat().filter(Boolean).length;
      const total = currentGrid.flat().length;
      roundInfo.textContent = `Round ${round}/${SCENARIOS[currentIdx].maxRounds} — ${alive}/${total} cells alive`;
      if (round >= SCENARIOS[currentIdx].maxRounds) {
        roundInfo.textContent += ' — Final state';
      }
    }

    function renderInsight(scenario: IterationScenario) {
      insightArea.innerHTML = '';
      let insight = '';

      if (scenario.id === 'simple-growth') {
        insight = 'Simple rules create complex patterns. Growth spreads from seeds, but the shape depends on placement. A single cell in the wrong position changes everything. This is how cities grow, how ideas spread, how populations expand.';
      } else if (scenario.id === 'erosion') {
        insight = 'What starts solid becomes shaped by what surrounds it. The center survives because it is protected. The edges disappear because they are exposed. This is how mountains erode, how languages simplify, how organizations shed bureaucracy.';
      } else {
        insight = 'A single point creates a wave that expands outward. Each iteration carries the pattern forward, but the origin is forgotten. This is how ripples move through water, how information spreads, how influence extends beyond its source.';
      }

      const card = document.createElement('div');
      card.style.cssText = 'padding: 1rem; border-left: 3px solid AccentColor; margin-top: 0.5rem;';

      const heading = document.createElement('h4');
      heading.style.cssText = 'margin-top: 0;';
      heading.textContent = 'What iteration reveals';

      const text = document.createElement('p');
      text.style.cssText = 'line-height: 1.6; margin-bottom: 0;';
      text.textContent = insight;

      card.append(heading, text);
      insightArea.appendChild(card);
    }

    function render() {
      updateStats();
      if (currentGrid.length === 0) {
        currentGrid = SCENARIOS[currentIdx].initialGrid.map(row => [...row]);
      }
      renderScenario();
      renderGrid();
      renderRoundInfo();
      renderControls();
    }

    wrapper.append(title, desc, stats, scenarioCard, gridArea, roundInfo, controls, insightArea);
    container.appendChild(wrapper);

    render();

    return () => {};
  }
};

export default iterate;
