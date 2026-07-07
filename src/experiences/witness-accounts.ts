import type { ExperienceModule, ExperienceContext } from '../platform/types';
import { events } from '../platform/events';

interface Witness {
  id: string;
  label: string;
  color: string;
  details: string[];
  knows: string[];
  doesNotKnow: string[];
}

const SCENE = {
  title: 'The Treaty of Grey Waters',
  setting: 'Two delegations meet on a neutral island to end a war that has lasted twelve years. A document is prepared. Oaths are spoken. But what each person sees depends on what they have lost, what they hope for, and what they fear.',
  question: 'What did each witness actually see?'
};

const WITNESSES: Witness[] = [
  {
    id: 'commander',
    label: 'The Commander',
    color: '#3b82f6',
    details: [
      'The opposing delegation arrived with forty guards, not the twenty agreed upon. This was noted but not challenged — a show of force that succeeded without violence.',
      'The treaty terms include a clause about river access that was not in the original draft. Someone added it during the night. The commander suspects his own side.',
      'A young soldier on the opposing side kept his hand on his sword throughout the ceremony. The commander recognized the gesture — he did the same at his first treaty, years ago.',
      'The food served at the meal was from his own city\'s kitchens. He found this significant: control of the table means control of the narrative.'
    ],
    knows: ['troop numbers', 'draft changes', 'military gestures', 'symbolic control'],
    doesNotKnow: ['civilian suffering', 'economic costs', 'family separations']
  },
  {
    id: 'scribe',
    label: 'The Scribe',
    color: '#a855f7',
    details: [
      'The treaty document has twelve articles, but the spoken oaths only mention ten. Two articles were added after the oaths were composed. The scribe wrote them but was not asked to explain them.',
      'Both delegations brought their own ink. The northern ink is darker and fades slower. In two hundred years, historians will think the northern amendments were original.',
      'A child wandered onto the island during the ceremony. No one stopped her. She watched the entire proceedings from behind a rock and was never identified.',
      'The scribe noticed that both leaders used the same phrase — "for the sake of those not yet born" — but neither acknowledged the other had said it first.'
    ],
    knows: ['document details', 'material evidence', 'unobserved observers', 'shared language'],
    doesNotKnow: ['military strategy', 'political maneuvering', 'personal grievances']
  },
  {
    id: 'healer',
    label: 'The Healer',
    color: '#22c55e',
    details: [
      'Three people fainted during the ceremony. Two from exhaustion, one from seeing a brother on the opposing delegation for the first time in six years. The healers treated all three without asking which side they were on.',
      'The island soil is still disturbed from mass graves dug early in the war. Flowers grow thick there now. No one mentioned this during the ceremony, but everyone walked around that patch of ground.',
      'An old woman from the nearby village brought bread for both delegations. She had lost two sons, one on each side. The bread was accepted by both.',
      'The healer noticed that both leaders had the same tremor in their hands — visible only when they thought no one was watching.'
    ],
    knows: ['human cost', 'unspoken memories', 'civilian bridges', 'shared vulnerability'],
    doesNotKnow: ['tactical details', 'document changes', 'power dynamics']
  }
];

const STORAGE_KEY = 'witness-accounts-progress';

function loadState(): { viewed: string[]; completed: boolean } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { viewed: [], completed: false };
}

function saveState(state: { viewed: string[]; completed: boolean }): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

const witnessAccounts: ExperienceModule = {
  mount(container: HTMLElement, context: ExperienceContext) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'witness-accounts';
    wrapper.style.cssText = 'padding: 1rem; max-width: 640px; margin: 0 auto;';

    let state = loadState();
    let activeId = state.viewed[0] || 'commander';

    const title = document.createElement('h2');
    title.textContent = 'Witness Accounts';

    const desc = document.createElement('p');
    desc.className = 'lead';
    desc.textContent = SCENE.question;

    const sceneCard = document.createElement('div');
    sceneCard.className = 'scene-card';
    sceneCard.style.cssText = 'padding: 1rem; border: 1px solid ButtonBorder; border-radius: 0.5rem; background: ButtonFace; margin: 1rem 0;';

    const sceneTitle = document.createElement('h3');
    sceneTitle.textContent = SCENE.title;
    sceneTitle.style.marginTop = '0';

    const sceneText = document.createElement('p');
    sceneText.textContent = SCENE.setting;
    sceneText.style.marginBottom = '0';

    sceneCard.append(sceneTitle, sceneText);

    const lensBar = document.createElement('div');
    lensBar.className = 'lens-bar';
    lensBar.style.cssText = 'display: flex; gap: 0.5rem; flex-wrap: wrap; margin: 1rem 0;';
    lensBar.setAttribute('role', 'tablist');
    lensBar.setAttribute('aria-label', 'Witness perspectives');

    const detailPanel = document.createElement('div');
    detailPanel.className = 'detail-panel';
    detailPanel.style.cssText = 'padding: 1rem; border: 1px solid ButtonBorder; border-radius: 0.5rem; min-height: 8rem;';
    detailPanel.setAttribute('role', 'tabpanel');

    const progressEl = document.createElement('div');
    progressEl.className = 'witness-progress';
    progressEl.style.cssText = 'margin-top: 1rem; font-size: 0.875rem;';

    const insightPanel = document.createElement('div');
    insightPanel.style.cssText = 'margin-top: 1rem; padding: 1rem; border: 1px solid ButtonBorder; border-radius: 0.5rem; background: ButtonFace; display: none;';

    function updateProgress() {
      const count = state.viewed.length;
      const total = WITNESSES.length;
      const pct = Math.round((count / total) * 100);
      progressEl.innerHTML = `Perspectives explored: <strong>${count}/${total}</strong> (${pct}%)`;
      if (state.completed) {
        progressEl.innerHTML += ' — <span style="color:#22c55e;font-weight:600;">Complete</span>';
      }
    }

    function renderDetails(id: string) {
      activeId = id;
      const w = WITNESSES.find(x => x.id === id)!;
      detailPanel.innerHTML = '';
      detailPanel.style.borderLeft = `4px solid ${w.color}`;

      const header = document.createElement('h3');
      header.textContent = w.label;
      header.style.marginTop = '0';
      header.style.color = w.color;

      const list = document.createElement('ul');
      list.style.paddingLeft = '1.25rem';
      list.style.marginBottom = '0';
      w.details.forEach(d => {
        const li = document.createElement('li');
        li.textContent = d;
        li.style.marginBottom = '0.5rem';
        list.appendChild(li);
      });

      detailPanel.append(header, list);

      if (!state.viewed.includes(id)) {
        state.viewed.push(id);
        if (state.viewed.length >= WITNESSES.length) {
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
        btn.style.background = isActive ? w.color : 'ButtonFace';
        btn.style.color = isActive ? '#fff' : 'inherit';
        btn.style.borderColor = isActive ? w.color : 'ButtonBorder';
      });

      // Show insight panel when all viewed
      if (state.completed) {
        insightPanel.style.display = 'block';
        insightPanel.innerHTML = `
          <h4 style="margin-top:0;">What no single witness saw</h4>
          <p style="margin-bottom:0.5rem;">The Commander knew about power but missed the human cost.</p>
          <p style="margin-bottom:0.5rem;">The Scribe knew about documents but missed the living witnesses.</p>
          <p style="margin-bottom:0.5rem;">The Healer knew about suffering but missed the strategic calculations.</p>
          <p style="margin-bottom:0;font-size:0.85rem;color:GrayText;">History is not the sum of what everyone saw. It is the reconstruction of what no one saw fully.</p>
        `;
      }
    }

    WITNESSES.forEach(w => {
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.textContent = w.label;
      btn.dataset.id = w.id;
      btn.setAttribute('role', 'tab');
      btn.style.cssText = 'padding: 0.4rem 0.8rem; border-radius: 0.25rem; cursor: pointer;';
      btn.addEventListener('click', () => renderDetails(w.id));
      lensBar.appendChild(btn);
    });

    wrapper.append(title, desc, sceneCard, lensBar, detailPanel, progressEl, insightPanel);
    container.appendChild(wrapper);

    renderDetails(activeId);
    updateProgress();

    return () => {
      // state persists intentionally
    };
  }
};

export default witnessAccounts;
