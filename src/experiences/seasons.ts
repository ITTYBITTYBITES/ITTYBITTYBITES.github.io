import type { ExperienceModule, ExperienceContext } from '../platform/types';
import { events } from '../platform/events';

interface Observation {
  id: string;
  category: 'light' | 'temperature' | 'life' | 'sound' | 'water';
  text: string;
}

interface Season {
  id: string;
  name: string;
  color: string;
  overview: string;
  observations: Observation[];
}

const SEASONS: Season[] = [
  {
    id: 'spring',
    name: 'Spring',
    color: '#22c55e',
    overview: 'The landscape wakes. Sap rises. Seeds germinate. Birds return from the south. Days lengthen and the world tilts toward warmth.',
    observations: [
      { id: 'spr-sun', category: 'light', text: 'Sunrise occurs earlier each day. By late spring, dawn arrives almost two hours sooner than at the solstice.' },
      { id: 'spr-rain', category: 'water', text: 'Rain is frequent but gentle. The soil, still cool, absorbs water slowly. Streams run high with snowmelt.' },
      { id: 'spr-bird', category: 'sound', text: 'Songbirds return at dawn. Their chorus peaks in early morning — territorial calls and mating displays.' },
      { id: 'spr-bloom', category: 'life', text: 'Wildflowers bloom in sequence: first snowdrops, then crocuses, then daffodils. Each species waits for the right temperature.' },
      { id: 'spr-insect', category: 'life', text: 'First bees emerge when early flowers open. The pollinator calendar begins — each insect timed to its plant.' }
    ]
  },
  {
    id: 'summer',
    name: 'Summer',
    color: '#eab308',
    overview: 'Full light. Maximum growth. Every organism races to build reserves before the year turns. The landscape hums with energy.',
    observations: [
      { id: 'sum-sun', category: 'light', text: 'The longest day. Sunlight pours in for over sixteen hours. Shadows at noon are at their shortest.' },
      { id: 'sum-heat', category: 'temperature', text: 'Peak temperatures lag behind peak sunlight by weeks. The ground stores heat, releasing it slowly.' },
      { id: 'sum-canopy', category: 'life', text: 'The tree canopy closes overhead. On the forest floor, shade-tolerant plants survive on dappled light.' },
      { id: 'sum-cicada', category: 'sound', text: 'Cicadas sing in the afternoon heat. Their chorus intensifies with temperature — a living thermometer.' },
      { id: 'sum-water', category: 'water', text: 'Streams slow as snowmelt ends. Pools warm. Fish seek deeper, cooler water. The water cycle shifts from runoff to evaporation.' }
    ]
  },
  {
    id: 'autumn',
    name: 'Autumn',
    color: '#f97316',
    overview: 'The landscape begins to withdraw. Chlorophyll breaks down, revealing hidden pigments. Seeds scatter. Animals prepare for scarcity.',
    observations: [
      { id: 'aut-leaf', category: 'life', text: 'Leaves change color as chlorophyll degrades. Carotenoids reveal yellow and orange. Anthocyanins create red — a sunscreen for falling leaves.' },
      { id: 'aut-seed', category: 'life', text: 'Acorns, nuts, and seeds fall. Squirrels cache thousands. Those forgotten become next year\'s forest.' },
      { id: 'aut-bird', category: 'sound', text: 'Migrating birds gather in V-formations. Some species have traveled thousands of miles. Others only hundreds.' },
      { id: 'aut-frost', category: 'temperature', text: 'First frost arrives overnight. Delicate plants wilt. Hardy grasses and evergreens remain.' },
      { id: 'aut-day', category: 'light', text: 'Days shorten rapidly. By late autumn, light retreats almost as fast as it advanced in spring.' }
    ]
  },
  {
    id: 'winter',
    name: 'Winter',
    color: '#3b82f6',
    overview: 'The landscape conserves. Life retreats underground, into bark, into stored energy. Silence is not absence — it is patience.',
    observations: [
      { id: 'win-dormant', category: 'life', text: 'Deciduous trees are bare but alive. Buds hold next spring\'s leaves, sealed against the cold. Evergreens photosynthesize slowly.' },
      { id: 'win-track', category: 'life', text: 'Animal tracks in snow reveal hidden activity. Deer, rabbit, and fox all remain active, conserving energy through reduced movement.' },
      { id: 'win-water', category: 'water', text: 'Streams slow under ice. Water beneath remains at 4°C — the temperature of maximum density. Fish survive in liquid layers below.' },
      { id: 'win-sound', category: 'sound', text: 'Snow absorbs sound. The landscape feels silent, but chickadees and nuthatches call. Owls hunt in the quiet.' },
      { id: 'win-sun', category: 'light', text: 'The shortest day. Sunlight arrives at a low angle, casting long shadows. The earth tilts away, storing its warmth deep.' }
    ]
  }
];

const STORAGE_KEY = 'seasons-progress';

function loadProgress(): { observed: string[]; seasonsViewed: string[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { observed: [], seasonsViewed: [] };
}

function saveProgress(p: { observed: string[]; seasonsViewed: string[] }): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

const categories = [
  { id: 'light', label: 'Light' },
  { id: 'temperature', label: 'Temperature' },
  { id: 'life', label: 'Living Things' },
  { id: 'sound', label: 'Sound' },
  { id: 'water', label: 'Water' }
];

const seasons: ExperienceModule = {
  mount(container: HTMLElement, context: ExperienceContext) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'seasons';
    wrapper.style.cssText = 'padding: 1rem; max-width: 640px; margin: 0 auto;';

    let progress = loadProgress();
    let activeSeasonIdx = 0;

    const title = document.createElement('h2');
    title.textContent = 'Seasons';

    const desc = document.createElement('p');
    desc.className = 'lead';
    desc.textContent = 'One landscape. Four seasons. Discover what changes, what persists, and what cycles back.';

    const statsEl = document.createElement('div');
    statsEl.style.cssText = 'font-size: 0.875rem; color: GrayText; margin-bottom: 1rem;';

    const seasonTabs = document.createElement('div');
    seasonTabs.style.cssText = 'display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem;';
    seasonTabs.setAttribute('role', 'tablist');
    seasonTabs.setAttribute('aria-label', 'Seasons');

    const overviewCard = document.createElement('div');
    overviewCard.style.cssText = 'padding: 1rem; border: 1px solid ButtonBorder; border-radius: 0.5rem; background: ButtonFace; margin: 1rem 0;';

    const observationsGrid = document.createElement('div');
    observationsGrid.style.cssText = 'display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1rem;';

    const completionMsg = document.createElement('div');
    completionMsg.style.cssText = 'margin-top: 1rem; font-size: 0.9rem;';

    function updateStats() {
      const totalObs = SEASONS.reduce((sum, s) => sum + s.observations.length, 0);
      const pct = Math.round((progress.observed.length / totalObs) * 100);
      statsEl.textContent = `Observations: ${progress.observed.length}/${totalObs} (${pct}%) • Seasons visited: ${progress.seasonsViewed.length}/4`;
    }

    function renderTabs() {
      seasonTabs.innerHTML = '';
      SEASONS.forEach((s, idx) => {
        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.textContent = s.name;
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-selected', String(idx === activeSeasonIdx));
        const viewed = progress.seasonsViewed.includes(s.id);
        if (idx === activeSeasonIdx) {
          btn.style.background = s.color;
          btn.style.color = '#fff';
          btn.style.borderColor = s.color;
        } else if (viewed) {
          btn.style.borderColor = s.color;
        }
        btn.addEventListener('click', () => {
          activeSeasonIdx = idx;
          render();
        });
        seasonTabs.appendChild(btn);
      });
    }

    function renderOverview() {
      const s = SEASONS[activeSeasonIdx];
      overviewCard.innerHTML = '';
      overviewCard.style.borderLeft = `4px solid ${s.color}`;

      const heading = document.createElement('h3');
      heading.style.marginTop = '0';
      heading.textContent = s.name;

      const text = document.createElement('p');
      text.style.cssText = 'line-height: 1.6; margin-bottom: 0;';
      text.textContent = s.overview;

      overviewCard.append(heading, text);
    }

    function renderObservations() {
      const s = SEASONS[activeSeasonIdx];
      observationsGrid.innerHTML = '';

      // Track season as viewed
      if (!progress.seasonsViewed.includes(s.id)) {
        progress.seasonsViewed.push(s.id);
        saveProgress(progress);
      }

      categories.forEach(cat => {
        const obs = s.observations.find(o => o.category === cat.id);
        if (!obs) return;

        const card = document.createElement('div');
        const isObserved = progress.observed.includes(obs.id);
        card.style.cssText = `padding: 0.75rem; border: 1px solid ${isObserved ? s.color : 'ButtonBorder'}; border-radius: 0.5rem; background: ${isObserved ? s.color + '11' : 'canvas'}; cursor: pointer;`;

        const header = document.createElement('div');
        header.style.cssText = 'display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;';

        const catLabel = document.createElement('span');
        catLabel.style.cssText = `font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: ${s.color};`;
        catLabel.textContent = cat.label;

        header.appendChild(catLabel);
        card.appendChild(header);

        if (isObserved) {
          const textEl = document.createElement('p');
          textEl.style.cssText = 'margin-bottom: 0; line-height: 1.5; font-size: 0.9rem;';
          textEl.textContent = obs.text;
          card.appendChild(textEl);
        } else {
          const hint = document.createElement('p');
          hint.style.cssText = 'margin-bottom: 0; color: GrayText; font-style: italic; font-size: 0.9rem;';
          hint.textContent = `Tap to observe ${cat.label.toLowerCase()}...`;
          card.appendChild(hint);
        }

        card.addEventListener('click', () => {
          if (!progress.observed.includes(obs.id)) {
            progress.observed.push(obs.id);
            saveProgress(progress);
            renderObservations();
            updateStats();
            renderTabs();
            checkCompletion();

            events.emit('experience_interaction', {
              experience_id: context.meta.id,
              action: 'observation_made',
              season: s.id,
              category: cat.id,
              total_observed: progress.observed.length
            });
          }
        });

        observationsGrid.appendChild(card);
      });
    }

    function checkCompletion() {
      const totalObs = SEASONS.reduce((sum, s) => sum + s.observations.length, 0);
      if (progress.observed.length >= totalObs) {
        completionMsg.innerHTML = '<div style="padding: 1rem; border: 1px solid #22c55e; border-radius: 0.5rem; background: #22c55e11;"><strong style="color: #16a34a;">All observations made.</strong> You have seen one landscape through an entire year. Return and you will notice details that were always there.</div>';
      } else {
        completionMsg.innerHTML = '';
      }
    }

    function render() {
      renderTabs();
      renderOverview();
      renderObservations();
      updateStats();
      checkCompletion();
    }

    wrapper.append(title, desc, statsEl, seasonTabs, overviewCard, observationsGrid, completionMsg);
    container.appendChild(wrapper);

    render();

    return () => {};
  }
};

export default seasons;
