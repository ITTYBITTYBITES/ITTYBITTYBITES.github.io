import type { ExperienceModule, ExperienceContext } from '../platform/types';
import { events } from '../platform/events';

const COLS = 38;
const ROWS = 20;
const CELL = 13; // px per cell, canvas sized responsively

type Grid = boolean[][];

function makeGrid(cols: number, rows: number): Grid {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => false));
}

function stepGrid(g: Grid): Grid {
  const rows = g.length;
  const cols = g[0].length;
  const next = makeGrid(cols, rows);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const ny = (y + dy + rows) % rows;
          const nx = (x + dx + cols) % cols;
          if (g[ny][nx]) n++;
        }
      }
      next[y][x] = g[y][x] ? (n === 2 || n === 3) : (n === 3);
    }
  }
  return next;
}

function countAlive(g: Grid): number {
  let c = 0;
  for (const row of g) for (const cell of row) if (cell) c++;
  return c;
}

function addPattern(g: Grid, pattern: Array<[number, number]>, cx: number, cy: number): void {
  for (const [dx, dy] of pattern) {
    const x = (cx + dx + g[0].length) % g[0].length;
    const y = (cy + dy + g.length) % g.length;
    g[y][x] = true;
  }
}

const GLIDER: Array<[number, number]> = [[0,-1],[0,0],[0,1],[-1,1],[1,0]];
const BLINKER: Array<[number, number]> = [[-1,0],[0,0],[1,0]];
const R_PENTOMINO: Array<[number, number]> = [[0,-1],[1,-1],[-1,0],[0,0],[0,1]];

const PatternGarden: ExperienceModule = {
  mount(container: HTMLElement, context: ExperienceContext) {
    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'pattern-garden';
    wrapper.style.cssText = 'padding: 1rem; max-width: 640px; margin: 0 auto;';

    let grid: Grid = makeGrid(COLS, ROWS);
    let running = false;
    let intervalId: number | null = null;
    let generation = 0;
    let brushMode: 'draw' | 'erase' = 'draw';

    const title = document.createElement('h2');
    title.textContent = 'Pattern Garden';
    title.style.marginBottom = '0.5rem';

    const desc = document.createElement('p');
    desc.className = 'lead';
    desc.textContent = 'Draw a seed. Press Run. Watch simple rules grow into surprising order. A single rule — neighbors, birth, survival — produces everything from gliders to still lifes.';
    desc.style.marginBottom = '0.75rem';

    const canvasWrap = document.createElement('div');
    canvasWrap.style.cssText = 'position: relative; width: 100%; overflow-x: auto; margin: 1rem 0;';

    const canvas = document.createElement('canvas');
    canvas.width = COLS * CELL;
    canvas.height = ROWS * CELL;
    canvas.style.cssText = 'display: block; border: 1px solid ButtonBorder; border-radius: 0.375rem; background: canvas; touch-action: none; cursor: crosshair; max-width: 100%; height: auto;';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'Pattern garden grid. Tap or drag cells to toggle them, then press Run to watch the pattern grow under simple rules.');
    const ctx = canvas.getContext('2d')!;

    canvasWrap.appendChild(canvas);

    const controls = document.createElement('div');
    controls.style.cssText = 'display: flex; gap: 0.5rem; flex-wrap: wrap; margin: 0.5rem 0;';

    const runBtn = document.createElement('button');
    runBtn.className = 'btn primary';
    runBtn.textContent = '▶ Run';

    const stepBtn = document.createElement('button');
    stepBtn.className = 'btn';
    stepBtn.textContent = 'Step';

    const clearBtn = document.createElement('button');
    clearBtn.className = 'btn subtle';
    clearBtn.textContent = 'Clear';

    const seedingRow = document.createElement('div');
    seedingRow.style.cssText = 'display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem;';

    const seedLabel = document.createElement('span');
    seedLabel.className = 'muted';
    seedLabel.style.cssText = 'font-size: 0.85rem; align-self: center; margin-right: 0.25rem;';
    seedLabel.textContent = 'Plant a seed:';

    const seeds = [
      { name: 'Glider', pattern: GLIDER },
      { name: 'Blinker', pattern: BLINKER },
      { name: 'R-Pentomino', pattern: R_PENTOMINO },
    ];
    const seedBtns: HTMLButtonElement[] = [];
    seeds.forEach(s => {
      const b = document.createElement('button');
      b.className = 'btn subtle';
      b.style.fontSize = '0.85rem';
      b.style.padding = '0.3rem 0.6rem';
      b.style.minHeight = '2rem';
      b.textContent = s.name;
      b.addEventListener('click', () => {
        addPattern(grid, s.pattern, Math.floor(COLS / 2), Math.floor(ROWS / 2));
        generation = 0;
        draw();
        updateStatus();
      });
      seedBtns.push(b);
    });

    seedingRow.append(seedLabel, ...seedBtns);

    const status = document.createElement('div');
    status.style.cssText = 'font-size: 0.85rem; color: GrayText; margin-top: 0.5rem; display: flex; gap: 1rem; flex-wrap: wrap;';

    const speedRow = document.createElement('div');
    speedRow.style.cssText = 'margin-top: 0.5rem; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; font-size: 0.85rem; color: GrayText;';
    const speedLabel = document.createElement('label');
    speedLabel.textContent = 'Speed:';
    const speed = document.createElement('input');
    speed.type = 'range';
    speed.min = '60';
    speed.max = '400';
    speed.step = '20';
    speed.value = '160';
    speed.style.width = '140px';
    speed.setAttribute('aria-label', 'Simulation speed in milliseconds per generation');

    speedRow.append(speedLabel, speed);

    const hint = document.createElement('p');
    hint.style.cssText = 'font-size: 0.85rem; color: GrayText; margin-top: 0.75rem; margin-bottom: 0; max-width: 60ch;';
    hint.textContent = 'Rule: a live cell with 2 or 3 live neighbors stays alive; a dead cell with exactly 3 live neighbors is born. Everything else is empty. That single sentence is enough to generate gliders, oscillators, and whole ecosystems.';

    controls.append(runBtn, stepBtn, clearBtn);

    let lastSpeed = 160;
    speed.addEventListener('input', () => {
      lastSpeed = parseInt(speed.value, 10);
      if (running) {
        if (intervalId) clearInterval(intervalId);
        intervalId = window.setInterval(tick, lastSpeed);
      }
    });

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // grid lines
      ctx.strokeStyle = 'rgba(128,128,128,0.18)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x * CELL + 0.5, 0);
        ctx.lineTo(x * CELL + 0.5, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * CELL + 0.5);
        ctx.lineTo(canvas.width, y * CELL + 0.5);
        ctx.stroke();
      }
      // cells
      const alive = countAlive(grid);
      const fill = getComputedStyle(document.documentElement).getPropertyValue('color-scheme').includes('dark') ? '#a7f3d0' : '#065f46';
      ctx.fillStyle = fill;
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          if (grid[y][x]) {
            ctx.fillRect(x * CELL + 2, y * CELL + 2, CELL - 4, CELL - 4);
          }
        }
      }
      // If empty, show gentle prompt
      if (alive === 0 && !running) {
        ctx.fillStyle = 'rgba(128,128,128,0.55)';
        ctx.font = '14px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Click or drag to plant cells — or use a seed below', canvas.width / 2, canvas.height / 2);
      }
    }

    function updateStatus() {
      const alive = countAlive(grid);
      status.innerHTML = `<span>Generation: <strong>${generation}</strong></span><span>Alive: <strong>${alive}</strong></span><span>${running ? 'Running' : 'Paused'}</span>`;
    }

    function tick() {
      const before = countAlive(grid);
      grid = stepGrid(grid);
      generation++;
      draw();
      const after = countAlive(grid);
      updateStatus();
      events.emit('experience_interaction', {
        experience_id: context.meta.id,
        action: 'generation_step',
        generation,
        alive: after
      });
      // Auto-pause if everything dies or stabilizes to nothing
      if (after === 0 && running) {
        stop();
      }
      if (before !== 0 && before === after && running && generation > 4) {
        // could be stable — let it keep running but it's fine
      }
    }

    function start() {
      if (running) return;
      running = true;
      runBtn.textContent = '⏸ Pause';
      intervalId = window.setInterval(tick, lastSpeed);
      updateStatus();
    }

    function stop() {
      running = false;
      runBtn.textContent = '▶ Run';
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      updateStatus();
    }

    runBtn.addEventListener('click', () => {
      if (running) stop(); else start();
    });

    stepBtn.addEventListener('click', () => {
      if (running) stop();
      tick();
    });

    clearBtn.addEventListener('click', () => {
      stop();
      grid = makeGrid(COLS, ROWS);
      generation = 0;
      draw();
      updateStatus();
    });

    // Pointer painting
    let painting = false;
    function cellFromEvent(clientX: number, clientY: number): [number, number] | null {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = Math.floor(((clientX - rect.left) * scaleX) / CELL);
      const y = Math.floor(((clientY - rect.top) * scaleY) / CELL);
      if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return null;
      return [x, y];
    }

    function paint(clientX: number, clientY: number, forceMode?: 'draw' | 'erase') {
      const cell = cellFromEvent(clientX, clientY);
      if (!cell) return;
      const [x, y] = cell;
      const mode = forceMode ?? brushMode;
      grid[y][x] = mode === 'draw';
      draw();
    }

    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      canvas.setPointerCapture(e.pointerId);
      painting = true;
      const cell = cellFromEvent(e.clientX, e.clientY);
      if (cell) {
        const [x, y] = cell;
        brushMode = grid[y][x] ? 'erase' : 'draw';
        grid[y][x] = !grid[y][x];
        draw();
        updateStatus();
      }
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!painting) return;
      paint(e.clientX, e.clientY);
    });
    canvas.addEventListener('pointerup', () => {
      painting = false;
    });
    canvas.addEventListener('pointercancel', () => {
      painting = false;
    });

    wrapper.append(title, desc, canvasWrap, controls, seedingRow, speedRow, status, hint);

    container.appendChild(wrapper);

    draw();
    updateStatus();

    // Plant a gentle starting seed so first-time users see something
    setTimeout(() => {
      if (countAlive(grid) === 0) {
        addPattern(grid, GLIDER, 6, 10);
        draw();
        updateStatus();
      }
    }, 100);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }
};

export default PatternGarden;
