import type { ExperienceModule, ExperienceContext } from '../platform/types';
import { events } from '../platform/events';

interface ScaleLevel {
  order: number;
  label: string;
  size: string;
  example: string;
  description: string;
}

const LEVELS: ScaleLevel[] = [
  { order: -10, label: 'Subatomic', size: '10⁻¹⁰ m', example: 'Atomic nucleus', description: 'At this scale, quantum mechanics dominates. Particles do not have definite positions. Probability clouds replace solid objects.' },
  { order: -7, label: 'Cellular', size: '10⁻⁷ m', example: 'Living cell', description: 'Cells are the smallest units of life. Thousands of chemical reactions happen simultaneously in a space smaller than a grain of sand.' },
  { order: -4, label: 'Human', size: '10⁻⁴ m', example: 'Your hand', description: 'This is the scale our senses evolved for. Gravity feels constant. Objects have definite edges. Cause and effect feel immediate.' },
  { order: -1, label: 'Terrestrial', size: '10⁻¹ m', example: 'A mountain', description: 'At this scale, tectonic forces shape the landscape over millions of years. What looks permanent to us is actually in slow motion.' },
  { order: 2, label: 'Planetary', size: '10² m', example: 'Earth', description: 'Gravity holds a sphere of rock and metal together. The same physics that keeps you grounded also keeps an entire planet in orbit.' },
  { order: 5, label: 'Stellar', size: '10⁵ m', example: 'The Sun', description: 'Nuclear fusion at the core produces enough energy to power a solar system. The Sun converts 4 million tons of mass into energy every second.' },
  { order: 8, label: 'Galactic', size: '10⁸ m', example: 'Milky Way', description: 'A galaxy is not a solid object. It is a dance of hundreds of billions of stars, held together by gravity, separated by vast emptiness.' },
  { order: 11, label: 'Cosmic', size: '10¹¹ m', example: 'Observable universe', description: 'At the largest scale, the universe is expanding. Distances between galaxies grow. The fabric of space itself stretches.' }
];

const STORAGE_KEY = 'scale-progress';

function loadProgress(): { unlocked: number[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { unlocked: [0] };
}

function saveProgress(p: { unlocked: number[] }): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

const scale: ExperienceModule = {
  mount(container: HTMLElement, context: ExperienceContext) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'scale';
    wrapper.style.cssText = 'padding: 1rem; max-width: 640px; margin: 0 auto;';

    let progress = loadProgress();
    let currentIndex = progress.unlocked[progress.unlocked.length - 1];

    const title = document.createElement('h2');
    title.textContent = 'Scale';

    const desc = document.createElement('p');
    desc.className = 'lead';
    desc.textContent = 'Navigate from the quantum to the cosmic. The same laws behave differently at different magnitudes.';

    const progressEl = document.createElement('div');
    progressEl.style.cssText = 'font-size: 0.875rem; color: GrayText; margin-bottom: 1rem;';
    updateProgressDisplay();

    const levelCard = document.createElement('div');
    levelCard.style.cssText = 'padding: 1.5rem; border: 1px solid ButtonBorder; border-radius: 0.5rem; background: ButtonFace; margin: 1rem 0;';

    const scaleBar = document.createElement('div');
    scaleBar.style.cssText = 'display: flex; gap: 0.25rem; flex-wrap: wrap; margin: 1rem 0;';
    scaleBar.setAttribute('role', 'tablist');

    const detailPanel = document.createElement('div');
    detailPanel.style.cssText = 'margin-top: 1rem;';

    function renderLevel(index: number) {
      currentIndex = index;
      const level = LEVELS[index];
      levelCard.innerHTML = '';

      const header = document.createElement('div');
      header.style.cssText = 'display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 0.5rem;';

      const label = document.createElement('h3');
      label.textContent = level.label;
      label.style.margin = '0';

      const size = document.createElement('span');
      size.style.cssText = 'font-family: monospace; font-size: 0.9rem; color: GrayText;';
      size.textContent = level.size;

      header.append(label, size);

      const example = document.createElement('p');
      example.style.cssText = 'font-weight: 600; margin: 0.75rem 0 0.25rem;';
      example.textContent = level.example;

      const description = document.createElement('p');
      description.style.cssText = 'margin-bottom: 0; line-height: 1.6;';
      description.textContent = level.description;

      levelCard.append(header, example, description);

      if (!progress.unlocked.includes(index)) {
        progress.unlocked.push(index);
        saveProgress(progress);
        updateProgressDisplay();
        events.emit('experience_interaction', {
          experience_id: context.meta.id,
          action: 'level_unlocked',
          level: index,
          total_unlocked: progress.unlocked.length
        });
      }

      if (progress.unlocked.length === LEVELS.length) {
        events.emit('experience_interaction', {
          experience_id: context.meta.id,
          action: 'completed',
          total_levels: LEVELS.length
        });
      }

      updateScaleBar();
    }

    function updateScaleBar() {
      scaleBar.innerHTML = '';
      LEVELS.forEach((l, idx) => {
        const isUnlocked = progress.unlocked.includes(idx);
        const isActive = idx === currentIndex;
        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.style.cssText = `padding: 0.3rem 0.6rem; font-size: 0.8rem; border-radius: 0.25rem; cursor: ${isUnlocked ? 'pointer' : 'not-allowed'}; opacity: ${isUnlocked ? 1 : 0.4};`;
        btn.textContent = l.label;
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-selected', String(isActive));
        if (isActive) {
          btn.style.background = 'AccentColor';
          btn.style.color = 'AccentColorText';
        }
        if (isUnlocked) {
          btn.addEventListener('click', () => renderLevel(idx));
        }
        scaleBar.appendChild(btn);
      });
    }

    function updateProgressDisplay() {
      const pct = Math.round((progress.unlocked.length / LEVELS.length) * 100);
      progressEl.innerHTML = `Scales explored: <strong>${progress.unlocked.length}/${LEVELS.length}</strong> (${pct}%)`;
      if (progress.unlocked.length === LEVELS.length) {
        progressEl.innerHTML += ' — <span style="color:#22c55e;font-weight:600;">Complete</span>';
      }
    }

    const navControls = document.createElement('div');
    navControls.style.cssText = 'display: flex; gap: 0.5rem; margin-top: 1rem;';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'btn subtle';
    prevBtn.textContent = '← Smaller';
    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) renderLevel(currentIndex - 1);
    });

    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn subtle';
    nextBtn.textContent = 'Larger →';
    nextBtn.addEventListener('click', () => {
      if (currentIndex < LEVELS.length - 1) renderLevel(currentIndex + 1);
    });

    navControls.append(prevBtn, nextBtn);

    wrapper.append(title, desc, progressEl, scaleBar, levelCard, navControls);
    container.appendChild(wrapper);

    renderLevel(currentIndex);

    return () => {};
  }
};

export default scale;
