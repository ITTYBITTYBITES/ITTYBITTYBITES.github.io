import type { ExperienceModule, ExperienceContext } from '../platform/types';
import { events } from '../platform/events';

interface MemoryStats {
  highestLevel: number;
  totalGames: number;
  totalCorrect: number;
  totalInputs: number;
}

const STORAGE_KEY = 'memory-sequence-stats';

function loadStats(): MemoryStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { highestLevel: 0, totalGames: 0, totalCorrect: 0, totalInputs: 0 };
}

function saveStats(stats: MemoryStats): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stats)); } catch { /* ignore */ }
}

const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#f97316'];
const LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

const memorySequence: ExperienceModule = {
  mount(container: HTMLElement, context: ExperienceContext) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'memory-sequence';
    wrapper.style.cssText = 'padding: 1rem; max-width: 480px; margin: 0 auto; user-select: none;';

    let stats = loadStats();
    let sequence: number[] = [];
    let playerIndex = 0;
    let level = 1;
    let playing = false;
    let inputLocked = true;
    let flashTimeout = 0;

    const title = document.createElement('h2');
    title.textContent = 'Memory Sequence';

    const desc = document.createElement('p');
    desc.className = 'lead';
    desc.textContent = 'Watch the pattern. Repeat it. Each round adds one more step.';

    const board = document.createElement('div');
    board.className = 'memory-board';
    board.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:0.5rem;margin:1rem 0;';
    board.setAttribute('role', 'group');
    board.setAttribute('aria-label', 'Memory sequence grid');

    const cells: HTMLButtonElement[] = [];
    for (let i = 0; i < 6; i++) {
      const cell = document.createElement('button');
      cell.className = 'memory-cell';
      cell.style.cssText = `
        aspect-ratio:1;border:2px solid ButtonBorder;border-radius:0.5rem;
        background:${COLORS[i]}22;color:${COLORS[i]};font-weight:700;font-size:1.25rem;
        cursor:pointer;transition:transform 0.1s,background 0.15s;
      `;
      cell.textContent = LABELS[i];
      cell.setAttribute('aria-label', `Cell ${LABELS[i]}`);
      cell.dataset.index = String(i);
      board.appendChild(cell);
      cells.push(cell);
    }

    const status = document.createElement('div');
    status.className = 'memory-status';
    status.style.cssText = 'min-height:1.5rem;margin:0.5rem 0;font-size:0.95rem;';
    status.textContent = 'Press Start to begin.';

    const controls = document.createElement('div');
    controls.style.cssText = 'display:flex;gap:0.5rem;flex-wrap:wrap;';

    const startBtn = document.createElement('button');
    startBtn.className = 'btn primary';
    startBtn.textContent = 'Start Game';

    const statsEl = document.createElement('div');
    statsEl.className = 'memory-stats';
    statsEl.style.cssText = 'margin-top:0.75rem;padding:0.75rem;border:1px solid ButtonBorder;border-radius:0.25rem;background:ButtonFace;font-size:0.875rem;';

    function renderStats() {
      statsEl.innerHTML = `
        <div style="display:flex;gap:1rem;flex-wrap:wrap;">
          <span>Best level: <strong>${stats.highestLevel}</strong></span>
          <span>Games played: <strong>${stats.totalGames}</strong></span>
          <span>Accuracy: <strong>${stats.totalInputs > 0 ? Math.round((stats.totalCorrect / stats.totalInputs) * 100) : 0}%</strong></span>
        </div>
      `;
    }

    function flashCell(index: number, duration = 350): Promise<void> {
      return new Promise((resolve) => {
        const cell = cells[index];
        cell.style.background = COLORS[index];
        cell.style.color = '#fff';
        cell.style.transform = 'scale(1.08)';
        flashTimeout = window.setTimeout(() => {
          cell.style.background = `${COLORS[index]}22`;
          cell.style.color = COLORS[index];
          cell.style.transform = 'scale(1)';
          flashTimeout = window.setTimeout(resolve, 80);
        }, duration);
      });
    }

    async function playSequence() {
      inputLocked = true;
      status.textContent = `Level ${level} — Watch…`;
      await new Promise(r => setTimeout(r, 600));
      for (const idx of sequence) {
        await flashCell(idx);
        await new Promise(r => setTimeout(r, 120));
      }
      inputLocked = false;
      status.textContent = `Level ${level} — Your turn.`;
      playerIndex = 0;
    }

    function startGame() {
      if (playing) return;
      playing = true;
      level = 1;
      sequence = [Math.floor(Math.random() * 6)];
      stats.totalGames += 1;
      saveStats(stats);
      renderStats();
      startBtn.textContent = 'Game in progress…';
      startBtn.disabled = true;
      playSequence();
    }

    function handleCell(index: number) {
      if (!playing || inputLocked) return;
      flashCell(index, 150);
      stats.totalInputs += 1;
      if (index === sequence[playerIndex]) {
        stats.totalCorrect += 1;
        playerIndex += 1;
        if (playerIndex >= sequence.length) {
          inputLocked = true;
          stats.highestLevel = Math.max(stats.highestLevel, level);
          saveStats(stats);
          renderStats();
          status.textContent = `Level ${level} complete!`;
          events.emit('experience_interaction', {
            experience_id: context.meta.id,
            action: 'level_complete',
            level
          });
          level += 1;
          sequence.push(Math.floor(Math.random() * 6));
          setTimeout(() => playSequence(), 900);
        }
      } else {
        inputLocked = true;
        status.textContent = `Incorrect! You reached level ${level}.`;
        cells[index].style.borderColor = '#ef4444';
        setTimeout(() => { cells[index].style.borderColor = 'ButtonBorder'; }, 400);
        playing = false;
        startBtn.textContent = 'Start Game';
        startBtn.disabled = false;
        saveStats(stats);
        renderStats();
        events.emit('experience_interaction', {
          experience_id: context.meta.id,
          action: 'game_over',
          level_reached: level
        });
      }
    }

    cells.forEach((cell, index) => {
      cell.addEventListener('click', () => handleCell(index));
    });

    board.addEventListener('keydown', (e) => {
      const keyMap: Record<string, number> = { 'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4, 'f': 5 };
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= 6) {
        e.preventDefault();
        handleCell(num - 1);
      } else if (keyMap[e.key.toLowerCase()] !== undefined) {
        e.preventDefault();
        handleCell(keyMap[e.key.toLowerCase()]);
      }
    });

    startBtn.addEventListener('click', startGame);

    controls.appendChild(startBtn);
    wrapper.append(title, desc, board, status, controls, statsEl);
    container.appendChild(wrapper);

    renderStats();

    return () => {
      clearTimeout(flashTimeout);
      playing = false;
    };
  }
};

export default memorySequence;
