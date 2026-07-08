import type { ExperienceModule, ExperienceContext } from '../platform/types';
import { events } from '../platform/events';

interface Seed {
  id: string;
  word: string;
  category: string;
  description: string;
  directions: string[];
}

const SEEDS: Seed[] = [
  {
    id: 'bridge',
    word: 'Bridge',
    category: 'Structure',
    description: 'A connection between two points. What else can a bridge be?',
    directions: [
      'A physical structure spanning a river or road',
      'A metaphor for communication between people',
      'A transition in music between sections',
      'The card game where partners cooperate',
      'A part of a nose or glasses',
      'A connection in a network or circuit',
      'A dental prosthetic',
      'The gap between what is and what could be'
    ]
  },
  {
    id: 'echo',
    word: 'Echo',
    category: 'Sound',
    description: 'A repetition that returns to you changed. What else echoes?',
    directions: [
      'Sound bouncing off a surface',
      'A social media feature',
      'The repetition of history',
      'A medical imaging technique',
      'A mythological figure cursed to repeat others',
      'The way memories return distorted',
      'A design pattern in software',
      'The way culture repeats and transforms'
    ]
  },
  {
    id: 'root',
    word: 'Root',
    category: 'Origin',
    description: 'Where something begins or is anchored. What else has roots?',
    directions: [
      'The underground part of a plant',
      'The source of a mathematical equation',
      'The base form of a word',
      'A cultural origin or heritage',
      'The fundamental cause of a problem',
      'Administrative access in computing',
      'The part of a tooth inside the gum',
      'The starting node of a tree structure'
    ]
  },
  {
    id: 'thread',
    word: 'Thread',
    category: 'Connection',
    description: 'Something thin that connects or runs through. What else is a thread?',
    directions: [
      'Fiber used in sewing',
      'A line of conversation online',
      'A narrative arc through a story',
      'A path through a maze',
      'A strand of DNA',
      'A lightweight process in computing',
      'A thin line of liquid or light',
      'The continuity of an argument'
    ]
  },
  {
    id: 'shadow',
    word: 'Shadow',
    category: 'Absence',
    description: 'What exists where light is blocked. What else casts a shadow?',
    directions: [
      'The dark shape cast by an object',
      'A hidden or unconscious aspect of personality',
      'A faint trace or hint of something',
      'An economy operating outside the law',
      'A government program in competition with private ones',
      'The way past events still influence the present',
      'A follower who copies another',
      'The reduction of a 3D object onto a 2D surface'
    ]
  }
];

const STORAGE_KEY = 'diverge-progress';

function loadProgress(): { seedsExplored: string[]; totalBranches: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { seedsExplored: [], totalBranches: 0 };
}

function saveProgress(p: { seedsExplored: string[]; totalBranches: number }): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

const diverge: ExperienceModule = {
  mount(container: HTMLElement, context: ExperienceContext) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'diverge';
    wrapper.style.cssText = 'padding: 1rem; max-width: 640px; margin: 0 auto;';

    let progress = loadProgress();
    let currentSeedIdx = 0;
    // Find first unexplored seed
    for (let i = 0; i < SEEDS.length; i++) {
      if (!progress.seedsExplored.includes(SEEDS[i].id)) {
        currentSeedIdx = i;
        break;
      }
    }
    let revealedDirections: string[] = [];
    let userBranches: string[] = [];

    const title = document.createElement('h2');
    title.textContent = 'Diverge';

    const desc = document.createElement('p');
    desc.className = 'lead';
    desc.textContent = 'Start from one point. Explore many directions. The first act of creation is generating possibilities.';

    const stats = document.createElement('div');
    stats.style.cssText = 'font-size: 0.875rem; color: GrayText; margin-bottom: 1rem;';

    const seedCard = document.createElement('div');
    seedCard.style.cssText = 'padding: 1.5rem; border: 2px solid AccentColor; border-radius: 0.5rem; background: ButtonFace; margin: 1rem 0; text-align: center;';

    const directionsArea = document.createElement('div');
    directionsArea.style.cssText = 'margin: 1rem 0;';

    const ownBranchesArea = document.createElement('div');
    ownBranchesArea.style.cssText = 'margin-top: 1rem;';

    const controls = document.createElement('div');
    controls.style.cssText = 'display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem;';

    function updateStats() {
      stats.textContent = `Seeds explored: ${progress.seedsExplored.length}/${SEEDS.length} • Total branches: ${progress.totalBranches}`;
    }

    function renderSeed() {
      const seed = SEEDS[currentSeedIdx];
      seedCard.innerHTML = '';

      const word = document.createElement('div');
      word.style.cssText = 'font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;';
      word.textContent = seed.word;

      const category = document.createElement('div');
      category.style.cssText = 'font-size: 0.85rem; color: GrayText; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem;';
      category.textContent = seed.category;

      const description = document.createElement('p');
      description.style.cssText = 'margin-bottom: 0; font-size: 1rem; line-height: 1.5;';
      description.textContent = seed.description;

      seedCard.append(word, category, description);
    }

    function renderDirections() {
      directionsArea.innerHTML = '';
      const seed = SEEDS[currentSeedIdx];

      const header = document.createElement('p');
      header.style.cssText = 'font-weight: 600; margin-bottom: 0.5rem;';
      header.textContent = 'Possible directions (tap to reveal):';
      directionsArea.appendChild(header);

      seed.directions.forEach((dir, idx) => {
        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.style.cssText = 'text-align: left; padding: 0.5rem 0.75rem; width: 100%; margin-bottom: 0.35rem;';

        if (revealedDirections.includes(dir)) {
          btn.textContent = dir;
          btn.style.borderColor = '#22c55e';
          btn.style.background = '#22c55e11';
        } else {
          btn.textContent = `Direction ${idx + 1} — tap to explore`;
          btn.style.fontStyle = 'italic';
          btn.style.color = 'GrayText';
          btn.addEventListener('click', () => {
            if (!revealedDirections.includes(dir)) {
              revealedDirections.push(dir);
              progress.totalBranches += 1;
              if (!progress.seedsExplored.includes(seed.id)) {
                progress.seedsExplored.push(seed.id);
              }
              saveProgress(progress);
              updateStats();
              renderDirections();

              events.emit('experience_interaction', {
                experience_id: context.meta.id,
                action: 'branch_explored',
                seed: seed.id,
                direction: dir,
                total_branches: progress.totalBranches
              });
            }
          });
        }

        directionsArea.appendChild(btn);
      });

      const count = document.createElement('p');
      count.style.cssText = 'font-size: 0.85rem; color: GrayText; margin-top: 0.5rem;';
      count.textContent = `${revealedDirections.length}/${seed.directions.length} directions revealed`;
      if (revealedDirections.length >= seed.directions.length) {
        count.textContent += ' — Complete!';
        count.style.color = '#22c55e';
        count.style.fontWeight = '600';
      }
      directionsArea.appendChild(count);
    }

    function renderOwnBranches() {
      ownBranchesArea.innerHTML = '';

      const header = document.createElement('p');
      header.style.cssText = 'font-weight: 600; margin-bottom: 0.5rem;';
      header.textContent = 'Your own branches (write your own):';
      ownBranchesArea.appendChild(header);

      const inputRow = document.createElement('div');
      inputRow.style.cssText = 'display: flex; gap: 0.5rem; margin-bottom: 0.5rem;';

      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Add your own direction...';
      input.style.cssText = 'flex: 1; padding: 0.5rem; border: 1px solid ButtonBorder; border-radius: 0.25rem;';
      input.setAttribute('aria-label', 'Add your own branch');

      const addBtn = document.createElement('button');
      addBtn.className = 'btn';
      addBtn.textContent = 'Add';
      addBtn.addEventListener('click', () => {
        const val = input.value.trim();
        if (val && !userBranches.includes(val)) {
          userBranches.push(val);
          progress.totalBranches += 1;
          saveProgress(progress);
          updateStats();
          renderOwnBranches();
          input.value = '';

          events.emit('experience_interaction', {
            experience_id: context.meta.id,
            action: 'own_branch_added',
            seed: SEEDS[currentSeedIdx].id,
            total_branches: progress.totalBranches
          });
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addBtn.click();
      });

      inputRow.append(input, addBtn);
      ownBranchesArea.appendChild(inputRow);

      userBranches.forEach(branch => {
        const tag = document.createElement('span');
        tag.style.cssText = 'display: inline-block; padding: 0.25rem 0.5rem; margin: 0.15rem; border: 1px solid #3b82f6; border-radius: 999px; font-size: 0.85rem; color: #3b82f6;';
        tag.textContent = branch;
        ownBranchesArea.appendChild(tag);
      });
    }

    function renderControls() {
      controls.innerHTML = '';
      const seed = SEEDS[currentSeedIdx];

      if (revealedDirections.length >= seed.directions.length || userBranches.length > 0) {
        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn primary';
        nextBtn.textContent = currentSeedIdx < SEEDS.length - 1 ? 'Next Seed →' : 'Try Again';
        nextBtn.addEventListener('click', () => {
          currentSeedIdx = (currentSeedIdx + 1) % SEEDS.length;
          revealedDirections = [];
          userBranches = [];
          render();
        });
        controls.appendChild(nextBtn);
      }
    }

    function render() {
      updateStats();
      renderSeed();
      renderDirections();
      renderOwnBranches();
      renderControls();
    }

    wrapper.append(title, desc, stats, seedCard, directionsArea, ownBranchesArea, controls);
    container.appendChild(wrapper);

    render();

    return () => {};
  }
};

export default diverge;
