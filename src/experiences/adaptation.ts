import type { ExperienceModule, ExperienceContext } from '../platform/types';
import { events } from '../platform/events';

interface Trait {
  id: string;
  name: string;
  description: string;
}

interface Environment {
  id: string;
  name: string;
  pressure: string;
  favors: string[];
  neutral: string[];
  penalizes: string[];
}

const TRAITS: Trait[] = [
  { id: 'thick-fur', name: 'Thick Fur', description: 'Insulation against cold' },
  { id: 'thin-fur', name: 'Thin Fur', description: 'Allows heat to escape' },
  { id: 'long-legs', name: 'Long Legs', description: 'Speed and stride' },
  { id: 'short-legs', name: 'Short Legs', description: 'Low center of gravity' },
  { id: 'sharp-teeth', name: 'Sharp Teeth', description: 'Carnivorous diet' },
  { id: 'flat-teeth', name: 'Flat Teeth', description: 'Can grind plants' },
  { id: 'keen-eyes', name: 'Keen Eyes', description: 'Long-distance vision' },
  { id: 'camouflage', name: 'Camouflage', description: 'Blends with surroundings' },
  { id: 'burrowing', name: 'Burrowing', description: 'Can dig and shelter underground' },
  { id: 'climbing', name: 'Climbing', description: 'Can scale trees and rocks' }
];

const ENVIRONMENTS: Environment[] = [
  {
    id: 'arctic',
    name: 'Arctic Tundra',
    pressure: 'Extreme cold, limited food, open terrain with no cover.',
    favors: ['thick-fur', 'burrowing', 'short-legs'],
    neutral: ['camouflage', 'flat-teeth'],
    penalizes: ['thin-fur', 'climbing', 'long-legs']
  },
  {
    id: 'desert',
    name: 'Arid Desert',
    pressure: 'Scorching heat, scarce water, exposed terrain.',
    favors: ['thin-fur', 'burrowing', 'keen-eyes'],
    neutral: ['short-legs', 'long-legs'],
    penalizes: ['thick-fur', 'camouflage', 'climbing']
  },
  {
    id: 'forest',
    name: 'Dense Forest',
    pressure: 'Competition for food, predators above and below, complex terrain.',
    favors: ['climbing', 'keen-eyes', 'camouflage'],
    neutral: ['flat-teeth', 'sharp-teeth'],
    penalizes: ['long-legs', 'thin-fur', 'short-legs']
  },
  {
    id: 'grassland',
    name: 'Open Grassland',
    pressure: 'Predators can see you from far away. Speed is essential.',
    favors: ['long-legs', 'camouflage', 'keen-eyes'],
    neutral: ['flat-teeth', 'thick-fur'],
    penalizes: ['climbing', 'burrowing', 'short-legs']
  },
  {
    id: 'volcanic',
    name: 'Volcanic Island',
    pressure: 'New terrain. No established food chains. Only generalists survive.',
    favors: ['sharp-teeth', 'flat-teeth', 'burrowing'],
    neutral: ['camouflage', 'short-legs'],
    penalizes: ['thick-fur', 'thin-fur', 'long-legs']
  }
];

const STORAGE_KEY = 'adaptation-stats';

function loadStats(): { gamesPlayed: number; bestScore: number; totalGenerations: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { gamesPlayed: 0, bestScore: 0, totalGenerations: 0 };
}

function saveStats(s: { gamesPlayed: number; bestScore: number; totalGenerations: number }): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

function scoreCreature(selectedTraits: string[], env: Environment): { score: number; maxScore: number; verdict: string; details: string[] } {
  let score = 0;
  const details: string[] = [];
  const maxScore = selectedTraits.length;

  selectedTraits.forEach(tid => {
    const trait = TRAITS.find(t => t.id === tid)!;
    if (env.favors.includes(tid)) {
      score += 1;
      details.push(`${trait.name}: well-adapted to ${env.name}`);
    } else if (env.neutral.includes(tid)) {
      score += 0.5;
      details.push(`${trait.name}: neither helps nor hurts`);
    } else {
      score += 0;
      details.push(`${trait.name}: poorly suited to ${env.name}`);
    }
  });

  const ratio = score / maxScore;
  let verdict: string;
  if (ratio >= 0.8) verdict = 'Thriving — your lineage flourishes.';
  else if (ratio >= 0.6) verdict = 'Surviving — the population holds steady.';
  else if (ratio >= 0.4) verdict = 'Struggling — numbers decline.';
  else verdict = 'Extinct — the environment did not favor your traits.';

  return { score, maxScore, verdict, details };
}

const adaptation: ExperienceModule = {
  mount(container: HTMLElement, context: ExperienceContext) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'adaptation';
    wrapper.style.cssText = 'padding: 1rem; max-width: 640px; margin: 0 auto;';

    let stats = loadStats();
    let currentRound = 0;
    let selectedTraits: string[] = [];
    let gameScore = 0;
    let rounds: Environment[] = [];

    const title = document.createElement('h2');
    title.textContent = 'Adaptation';

    const desc = document.createElement('p');
    desc.className = 'lead';
    desc.textContent = 'The environment shifts. Choose traits for each generation. Those that adapt survive.';

    const statsEl = document.createElement('div');
    statsEl.style.cssText = 'font-size: 0.875rem; color: GrayText; margin-bottom: 1rem;';

    const gameArea = document.createElement('div');
    gameArea.style.cssText = 'margin: 1rem 0;';

    function renderStats() {
      statsEl.textContent = `Games: ${stats.gamesPlayed} • Best score: ${stats.bestScore}/5 • Generations survived: ${stats.totalGenerations}`;
    }

    function renderStart() {
      gameArea.innerHTML = '';

      const card = document.createElement('div');
      card.style.cssText = 'padding: 1.5rem; border: 1px solid ButtonBorder; border-radius: 0.5rem; background: ButtonFace; text-align: center;';

      const p = document.createElement('p');
      p.style.cssText = 'line-height: 1.6; margin-bottom: 1rem;';
      p.textContent = 'You will face five different environments. Each round, select traits for your creature. The environment decides which traits are favored. Survive as many rounds as possible.';

      const btn = document.createElement('button');
      btn.className = 'btn primary';
      btn.textContent = 'Begin Evolution';
      btn.addEventListener('click', () => {
        currentRound = 0;
        gameScore = 0;
        // Pick 5 random environments
        const shuffled = [...ENVIRONMENTS].sort(() => Math.random() - 0.5);
        rounds = shuffled.slice(0, 5);
        renderRound();
      });

      card.append(p, btn);
      gameArea.appendChild(card);
    }

    function renderRound() {
      const env = rounds[currentRound];
      gameArea.innerHTML = '';
      selectedTraits = [];

      const roundHeader = document.createElement('div');
      roundHeader.style.cssText = 'padding: 1rem; border: 2px solid ' + getEnvColor(currentRound) + '; border-radius: 0.5rem; background: ButtonFace; margin-bottom: 1rem;';

      const roundLabel = document.createElement('div');
      roundLabel.style.cssText = 'font-size: 0.85rem; color: GrayText; margin-bottom: 0.5rem;';
      roundLabel.textContent = `Generation ${currentRound + 1} of 5`;

      const envTitle = document.createElement('h3');
      envTitle.style.marginTop = '0';
      envTitle.textContent = env.name;

      const envPressure = document.createElement('p');
      envPressure.style.cssText = 'line-height: 1.5; margin-bottom: 0;';
      envPressure.textContent = env.pressure;

      roundHeader.append(roundLabel, envTitle, envPressure);
      gameArea.appendChild(roundHeader);

      const traitHeader = document.createElement('p');
      traitHeader.style.cssText = 'font-weight: 600; margin: 1rem 0 0.5rem;';
      traitHeader.textContent = 'Select 2 traits for this generation:';

      const traitGrid = document.createElement('div');
      traitGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 0.5rem; margin-bottom: 1rem;';

      const buttons: HTMLButtonElement[] = [];

      TRAITS.forEach(trait => {
        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.style.cssText = 'text-align: left; padding: 0.5rem 0.75rem;';
        btn.innerHTML = `<strong>${trait.name}</strong><br><span style="font-size: 0.8rem; color: GrayText;">${trait.description}</span>`;
        btn.addEventListener('click', () => {
          if (selectedTraits.includes(trait.id)) {
            selectedTraits = selectedTraits.filter(t => t !== trait.id);
            btn.style.borderColor = 'ButtonBorder';
            btn.style.background = 'ButtonFace';
          } else if (selectedTraits.length < 2) {
            selectedTraits.push(trait.id);
            btn.style.borderColor = getEnvColor(currentRound);
            btn.style.background = getEnvColor(currentRound) + '22';
          }
          updateConfirm();
        });
        traitGrid.appendChild(btn);
        buttons.push(btn);
      });

      const confirmBtn = document.createElement('button');
      confirmBtn.className = 'btn primary';
      confirmBtn.textContent = 'Lock in traits';
      confirmBtn.style.display = 'none';
      confirmBtn.addEventListener('click', () => {
        const result = scoreCreature(selectedTraits, env);
        gameScore += result.score >= result.maxScore * 0.6 ? 1 : 0;
        stats.totalGenerations += 1;
        saveStats(stats);
        renderResult(result);

        events.emit('experience_interaction', {
          experience_id: context.meta.id,
          action: 'generation_complete',
          round: currentRound,
          environment: env.id,
          traits: selectedTraits,
          score: result.score,
          verdict: result.verdict
        });
      });

      const confirmArea = document.createElement('div');
      confirmArea.style.cssText = 'margin-top: 0.5rem;';

      function updateConfirm() {
        confirmBtn.style.display = selectedTraits.length === 2 ? 'inline-flex' : 'none';
        const hint = confirmArea.querySelector('.trait-hint') as HTMLElement;
        if (hint) {
          hint.textContent = selectedTraits.length === 0
            ? 'Choose 2 traits'
            : selectedTraits.length === 1
              ? 'Choose 1 more trait'
              : 'Ready to adapt!';
        }
      }

      const traitHint = document.createElement('p');
      traitHint.className = 'trait-hint';
      traitHint.style.cssText = 'font-size: 0.85rem; color: GrayText;';
      traitHint.textContent = 'Choose 2 traits';
      confirmArea.appendChild(traitHint);

      gameArea.append(traitHeader, traitGrid, confirmArea, confirmBtn);
    }

    function renderResult(result: { score: number; maxScore: number; verdict: string; details: string[] }) {
      gameArea.innerHTML = '';

      const card = document.createElement('div');
      const isSurviving = result.score >= result.maxScore * 0.6;
      card.style.cssText = `padding: 1rem; border: 2px solid ${isSurviving ? '#22c55e' : '#ef4444'}; border-radius: 0.5rem; background: ${isSurviving ? '#22c55e11' : '#ef444411'}; margin-bottom: 1rem;`;

      const verdict = document.createElement('h3');
      verdict.style.cssText = `margin-top: 0; color: ${isSurviving ? '#16a34a' : '#dc2626'};`;
      verdict.textContent = result.verdict;

      const scoreLine = document.createElement('p');
      scoreLine.style.cssText = 'font-size: 0.9rem; margin-bottom: 0.75rem;';
      scoreLine.textContent = `Adaptation score: ${result.score}/${result.maxScore}`;

      const detailsList = document.createElement('ul');
      detailsList.style.cssText = 'padding-left: 1.25rem; margin-bottom: 0;';
      result.details.forEach(d => {
        const li = document.createElement('li');
        li.textContent = d;
        li.style.marginBottom = '0.35rem';
        detailsList.appendChild(li);
      });

      card.append(verdict, scoreLine, detailsList);
      gameArea.appendChild(card);

      const nextBtn = document.createElement('button');
      nextBtn.className = 'btn primary';
      nextBtn.textContent = currentRound < 4 ? 'Next Environment' : 'See Results';
      nextBtn.addEventListener('click', () => {
        currentRound += 1;
        if (currentRound >= 5) {
          renderGameOver();
        } else {
          renderRound();
        }
      });

      gameArea.appendChild(nextBtn);
    }

    function renderGameOver() {
      stats.gamesPlayed += 1;
      stats.bestScore = Math.max(stats.bestScore, gameScore);
      saveStats(stats);
      renderStats();

      gameArea.innerHTML = '';

      const card = document.createElement('div');
      card.style.cssText = 'padding: 1.5rem; border: 2px solid ButtonBorder; border-radius: 0.5rem; background: ButtonFace; text-align: center;';

      const heading = document.createElement('h3');
      heading.style.marginTop = '0';
      heading.textContent = 'Evolution Complete';

      const scoreP = document.createElement('p');
      scoreP.style.cssText = 'font-size: 1.25rem; font-weight: 600;';
      scoreP.textContent = `You survived ${gameScore} of 5 environments.`;

      const msg = document.createElement('p');
      msg.style.cssText = 'line-height: 1.6; color: GrayText; margin-bottom: 1rem;';
      if (gameScore >= 4) {
        msg.textContent = 'Remarkable adaptability. Your lineage endured almost every challenge.';
      } else if (gameScore >= 2) {
        msg.textContent = 'A mixed record. Some environments favored your traits; others did not. This is how evolution works.';
      } else {
        msg.textContent = 'The environment was unforgiving. Most lineages do not survive change. The ones that do are shaped by it.';
      }

      const restartBtn = document.createElement('button');
      restartBtn.className = 'btn primary';
      restartBtn.textContent = 'Evolve Again';
      restartBtn.addEventListener('click', () => {
        currentRound = 0;
        gameScore = 0;
        const shuffled = [...ENVIRONMENTS].sort(() => Math.random() - 0.5);
        rounds = shuffled.slice(0, 5);
        renderRound();
      });

      card.append(heading, scoreP, msg, restartBtn);
      gameArea.appendChild(card);

      events.emit('experience_interaction', {
        experience_id: context.meta.id,
        action: 'game_complete',
        score: gameScore,
        total_games: stats.gamesPlayed
      });
    }

    function getEnvColor(idx: number): string {
      const colors = ['#22c55e', '#eab308', '#f97316', '#3b82f6', '#a855f7'];
      return colors[idx % colors.length];
    }

    wrapper.append(title, desc, statsEl, gameArea);
    container.appendChild(wrapper);

    renderStats();
    renderStart();

    return () => {};
  }
};

export default adaptation;
