import type { ExperienceModule, ExperienceContext } from '../platform/types';
import { events } from '../platform/events';

interface DiffSpot {
  id: number;
  textA: string;
  textB: string;
  explanation: string;
}

interface AccountData {
  title: string;
  source: string;
  date: string;
  text: string;
  diffs: DiffSpot[];
}

const SCENARIO: AccountData = {
  title: 'The Harbor Incident',
  source: 'Two eyewitness accounts, 1847',
  date: 'March 14, 1847',
  text: '',
  diffs: [
    {
      id: 1,
      textA: 'a crowd of roughly twenty gathered',
      textB: 'a large mob of over fifty people assembled',
      explanation: 'Account A minimizes the scale; Account B amplifies it. Both may be inaccurate — crowd size is notoriously difficult to estimate.'
    },
    {
      id: 2,
      textA: 'the merchant refused to lower his prices, insisting the shortage was not his fault',
      textB: 'the merchant laughed at the crowd and raised his prices further',
      explanation: 'Account A portrays the merchant as defensive but reasonable. Account B portrays him as provocative. The difference changes who seems responsible.'
    },
    {
      id: 3,
      textA: 'someone threw a stone, though no one could say who',
      textB: 'the merchant threw the first stone at a child',
      explanation: 'Account A assigns blame to an anonymous actor. Account B directly accuses the merchant. This fundamentally changes the moral reading of the event.'
    },
    {
      id: 4,
      textA: 'the watch arrived within minutes and restored order without injury',
      textB: 'the watch arrived late, after several people had been beaten',
      explanation: 'Account A suggests effective authority. Account B suggests failed authority. Both cannot be fully true.'
    },
    {
      id: 5,
      textA: 'the matter was settled by morning with a negotiated price agreement',
      textB: 'the merchant fled town that night and was never seen again',
      explanation: 'Account A implies resolution. Account B implies escalation. These are incompatible outcomes.'
    }
  ]
};

const ACCOUNT_A = `On the morning of March 14, a crowd of roughly twenty gathered outside the harbor warehouse. Grain prices had risen for three weeks. The merchant refused to lower his prices, insisting the shortage was not his fault. Voices grew loud. Someone threw a stone, though no one could say who. The watch arrived within minutes and restored order without injury. By afternoon the crowd dispersed. The matter was settled by morning with a negotiated price agreement.`;

const ACCOUNT_B = `Before dawn on March 14, a large mob of over fifty people assembled at the harbor. They had no grain for bread. The merchant laughed at the crowd and raised his prices further. A rock shattered his window. The merchant threw the first stone at a child. The watch arrived late, after several people had been beaten. By nightfall the warehouse was empty. The merchant fled town that night and was never seen again.`;

const STORAGE_KEY = 'dueling-accounts-progress';

function loadProgress(): { found: number[]; attempts: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { found: [], attempts: 0 };
}

function saveProgress(p: { found: number[]; attempts: number }): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

const duelingAccounts: ExperienceModule = {
  mount(container: HTMLElement, context: ExperienceContext) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'dueling-accounts';
    wrapper.style.cssText = 'padding: 1rem; max-width: 800px; margin: 0 auto;';

    let progress = loadProgress();
    let foundThisRound = new Set<number>();

    const title = document.createElement('h2');
    title.textContent = SCENARIO.title;

    const meta = document.createElement('p');
    meta.className = 'meta';
    meta.textContent = `${SCENARIO.source} • ${SCENARIO.date}`;

    const instruction = document.createElement('p');
    instruction.className = 'lead';
    instruction.textContent = 'Read both accounts. Click on phrases that differ in meaningful ways. Ask yourself: what changes when the storyteller changes?';

    const columns = document.createElement('div');
    columns.className = 'account-columns';
    columns.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin: 1.5rem 0;';

    const colA = renderAccountColumn('Account A', ACCOUNT_A, 'a');
    const colB = renderAccountColumn('Account B', ACCOUNT_B, 'b');
    columns.append(colA, colB);

    const status = document.createElement('div');
    status.className = 'account-status';
    status.style.cssText = 'min-height: 2rem; margin: 1rem 0; font-size: 0.95rem;';
    updateStatus();

    const revealBtn = document.createElement('button');
    revealBtn.className = 'btn subtle';
    revealBtn.textContent = 'Reveal all differences';
    revealBtn.addEventListener('click', () => {
      SCENARIO.diffs.forEach(d => {
        foundThisRound.add(d.id);
        highlightDiff(d.id, true);
      });
      updateStatus();
      saveProgress({ found: Array.from(foundThisRound), attempts: progress.attempts + 1 });
      events.emit('experience_interaction', {
        experience_id: context.meta.id,
        action: 'revealed_all',
        found: foundThisRound.size
      });
    });

    const explanationPanel = document.createElement('div');
    explanationPanel.className = 'explanation-panel';
    explanationPanel.style.cssText = 'margin-top: 1rem; padding: 1rem; border: 1px solid ButtonBorder; border-radius: 0.5rem; background: ButtonFace; display: none;';

    wrapper.append(title, meta, instruction, columns, status, revealBtn, explanationPanel);
    container.appendChild(wrapper);

    function renderAccountColumn(label: string, text: string, side: 'a' | 'b') {
      const box = document.createElement('div');
      box.className = 'account-box';
      box.style.cssText = 'padding: 1rem; border: 1px solid ButtonBorder; border-radius: 0.5rem; background: canvas;';

      const lbl = document.createElement('div');
      lbl.className = 'meta';
      lbl.style.marginBottom = '0.75rem';
      lbl.textContent = label;

      const content = document.createElement('div');
      content.className = 'account-text';
      content.style.cssText = 'line-height: 1.7; font-size: 0.95rem;';

      // Build text with clickable diff spans
      let html = text;
      SCENARIO.diffs.forEach(d => {
        const searchText = side === 'a' ? d.textA : d.textB;
        const escaped = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(`(${escaped})`, 'g');
        html = html.replace(re, `<span class="diff-span" data-id="${d.id}" tabindex="0" role="button" style="cursor:pointer;border-bottom:2px dashed #888;padding-bottom:1px;">$1</span>`);
      });
      content.innerHTML = html;

      content.querySelectorAll('.diff-span').forEach(span => {
        const id = Number((span as HTMLElement).dataset.id);
        span.addEventListener('click', () => handleDiffClick(id));
        span.addEventListener('keydown', (e: Event) => {
          const ke = e as KeyboardEvent;
          if (ke.key === 'Enter' || ke.key === ' ') {
            e.preventDefault();
            handleDiffClick(id);
          }
        });
      });

      box.append(lbl, content);
      return box;
    }

    function handleDiffClick(id: number) {
      if (foundThisRound.has(id)) return;
      foundThisRound.add(id);
      highlightDiff(id, false);
      updateStatus();
      saveProgress({ found: Array.from(new Set([...progress.found, ...Array.from(foundThisRound)])), attempts: progress.attempts + 1 });

      const diff = SCENARIO.diffs.find(d => d.id === id)!;
      showExplanation(diff);

      events.emit('experience_interaction', {
        experience_id: context.meta.id,
        action: 'diff_found',
        diff_id: id,
        total_found: foundThisRound.size
      });

      if (foundThisRound.size === SCENARIO.diffs.length) {
        events.emit('experience_interaction', {
          experience_id: context.meta.id,
          action: 'completed',
          total_diffs: SCENARIO.diffs.length
        });
      }
    }

    function highlightDiff(id: number, isReveal: boolean) {
      const color = isReveal ? '#ef4444' : '#22c55e';
      document.querySelectorAll(`.diff-span[data-id="${id}"]`).forEach(el => {
        (el as HTMLElement).style.borderBottom = `2px solid ${color}`;
        (el as HTMLElement).style.background = isReveal ? '#ef444411' : '#22c55e11';
      });
    }

    function updateStatus() {
      const total = SCENARIO.diffs.length;
      const found = foundThisRound.size;
      status.textContent = `Differences found: ${found}/${total}`;
      if (found === total) {
        status.textContent += ' — All found!';
        status.style.color = '#16a34a';
      }
    }

    function showExplanation(diff: DiffSpot) {
      explanationPanel.style.display = 'block';
      explanationPanel.innerHTML = `
        <h4 style="margin-top:0;font-size:1rem;">Difference ${diff.id}</h4>
        <p style="margin-bottom:0.5rem;"><strong>Account A:</strong> ${diff.textA}</p>
        <p style="margin-bottom:0.5rem;"><strong>Account B:</strong> ${diff.textB}</p>
        <p style="margin-bottom:0;color:GrayText;font-size:0.9rem;">${diff.explanation}</p>
      `;
    }

    return () => {
      // persistence handled in click handlers
    };
  }
};

export default duelingAccounts;
