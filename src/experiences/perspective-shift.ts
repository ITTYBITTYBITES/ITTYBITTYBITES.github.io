import type { ExperienceModule, ExperienceContext } from '../platform/types';
import { events } from '../platform/events';

interface PerspectiveState {
  viewed: string[];
  completed: boolean;
}

const STORAGE_KEY = 'perspective-shift-state';

function loadState(): PerspectiveState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { viewed: [], completed: false };
}

function saveState(state: PerspectiveState): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

interface Perspective {
  id: string;
  label: string;
  color: string;
  details: string[];
}

const SCENE = {
  title: 'The Crossroads',
  setting: 'A quiet intersection at dawn. A single streetlamp flickers. A bench faces a wall covered in layers of posters, paint, and weather. A bicycle leans against the wall. A cup sits on the bench.',
  question: 'What do you see?'
};

const PERSPECTIVES: Perspective[] = [
  {
    id: 'observer',
    label: 'The Observer',
    color: '#3b82f6',
    details: [
      'The streetlamp cycles through three colors before stabilizing — a failing bulb revealing its internal logic.',
      'The posters on the wall are dated: the newest is three weeks old. No one has posted here recently.',
      'The bicycle chain is rusted. It has not moved in days, yet the seat is dry. Someone covers it.',
      'The cup on the bench is ceramic, not disposable. Someone left it intentionally, expecting to return.'
    ]
  },
  {
    id: 'participant',
    label: 'The Participant',
    color: '#22c55e',
    details: [
      'You sat on this bench yesterday. The paint on the wall was different — someone added a new layer overnight.',
      'The streetlamp hums at a frequency that matches your memory of a song you cannot name.',
      'You left the cup. You meant to come back for it. Now you wonder if it is still warm.',
      'The bicycle is not yours, but you know who it belongs to. You have seen them here at this hour before.'
    ]
  },
  {
    id: 'architect',
    label: 'The Architect',
    color: '#a855f7',
    details: [
      'This intersection was designed to slow people down. The bench faces the wall so travelers must choose to stop or turn.',
      'The streetlamp is the original from 1987. It was kept during renovation because the community requested it.',
      'The wall is designated for public expression. The layers of paint are a record of what mattered to people here.',
      'The bicycle and cup are not random. They are evidence of use. This place is alive because people keep returning.'
    ]
  }
];

const perspectiveShift: ExperienceModule = {
  mount(container: HTMLElement, context: ExperienceContext) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'perspective-shift';
    wrapper.style.cssText = 'padding: 1rem; max-width: 640px; margin: 0 auto;';

    let state = loadState();
    let activeId = state.viewed[0] || 'observer';

    const title = document.createElement('h2');
    title.textContent = 'Perspective Shift';

    const desc = document.createElement('p');
    desc.className = 'lead';
    desc.textContent = SCENE.question;

    const sceneCard = document.createElement('div');
    sceneCard.className = 'scene-card';
    sceneCard.style.cssText = 'padding:1rem;border:1px solid ButtonBorder;border-radius:0.5rem;background:ButtonFace;margin:1rem 0;';

    const sceneTitle = document.createElement('h3');
    sceneTitle.textContent = SCENE.title;
    sceneTitle.style.marginTop = '0';

    const sceneText = document.createElement('p');
    sceneText.textContent = SCENE.setting;
    sceneText.style.marginBottom = '0';

    sceneCard.append(sceneTitle, sceneText);

    const lensBar = document.createElement('div');
    lensBar.className = 'lens-bar';
    lensBar.style.cssText = 'display:flex;gap:0.5rem;flex-wrap:wrap;margin:1rem 0;';
    lensBar.setAttribute('role', 'tablist');
    lensBar.setAttribute('aria-label', 'Perspective lenses');

    const detailPanel = document.createElement('div');
    detailPanel.className = 'detail-panel';
    detailPanel.style.cssText = 'padding:1rem;border:1px solid ButtonBorder;border-radius:0.5rem;min-height:8rem;';
    detailPanel.setAttribute('role', 'tabpanel');

    const progressEl = document.createElement('div');
    progressEl.className = 'perspective-progress';
    progressEl.style.cssText = 'margin-top:1rem;font-size:0.875rem;';

    function updateProgress() {
      const count = state.viewed.length;
      const total = PERSPECTIVES.length;
      const pct = Math.round((count / total) * 100);
      progressEl.innerHTML = `Perspectives discovered: <strong>${count}/${total}</strong> (${pct}%)`;
      if (state.completed) {
        progressEl.innerHTML += ' — <span style="color:#22c55e;font-weight:600;">Complete</span>';
      }
    }

    function renderDetails(id: string) {
      activeId = id;
      const p = PERSPECTIVES.find(x => x.id === id)!;
      detailPanel.innerHTML = '';
      detailPanel.style.borderLeft = `4px solid ${p.color}`;

      const header = document.createElement('h3');
      header.textContent = p.label;
      header.style.marginTop = '0';
      header.style.color = p.color;

      const list = document.createElement('ul');
      list.style.paddingLeft = '1.25rem';
      list.style.marginBottom = '0';
      p.details.forEach(d => {
        const li = document.createElement('li');
        li.textContent = d;
        li.style.marginBottom = '0.5rem';
        list.appendChild(li);
      });

      detailPanel.append(header, list);

      if (!state.viewed.includes(id)) {
        state.viewed.push(id);
        if (state.viewed.length >= PERSPECTIVES.length) {
          state.completed = true;
        }
        saveState(state);
        updateProgress();
        events.emit('experience_interaction', {
          experience_id: context.meta.id,
          action: 'perspective_viewed',
          perspective: id,
          total_viewed: state.viewed.length
        });
      }

      lensBar.querySelectorAll('button').forEach(btn => {
        const isActive = btn.dataset.id === id;
        btn.setAttribute('aria-selected', String(isActive));
        btn.style.background = isActive ? p.color : 'ButtonFace';
        btn.style.color = isActive ? '#fff' : 'inherit';
        btn.style.borderColor = isActive ? p.color : 'ButtonBorder';
      });
    }

    PERSPECTIVES.forEach(p => {
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.textContent = p.label;
      btn.dataset.id = p.id;
      btn.setAttribute('role', 'tab');
      btn.style.cssText = 'padding:0.4rem 0.8rem;border-radius:0.25rem;cursor:pointer;';
      btn.addEventListener('click', () => renderDetails(p.id));
      lensBar.appendChild(btn);
    });

    wrapper.append(title, desc, sceneCard, lensBar, detailPanel, progressEl);
    container.appendChild(wrapper);

    renderDetails(activeId);
    updateProgress();

    return () => {
      // state persists intentionally
    };
  }
};

export default perspectiveShift;
