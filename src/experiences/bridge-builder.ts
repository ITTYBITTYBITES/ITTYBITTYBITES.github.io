import type { ExperienceModule, ExperienceContext } from '../platform/types';
import { events } from '../platform/events';

interface Material {
  id: string;
  name: string;
  cost: number;
  strength: number;
  weight: number;
  color: string;
}

interface Challenge {
  id: string;
  name: string;
  span: number;
  load: number;
  budget: number;
  description: string;
}

interface BridgeDesign {
  material: Material;
  archHeight: number;
  supportCount: number;
}

const MATERIALS: Material[] = [
  { id: 'wood', name: 'Wood', cost: 10, strength: 30, weight: 20, color: '#8B4513' },
  { id: 'stone', name: 'Stone', cost: 25, strength: 70, weight: 80, color: '#696969' },
  { id: 'steel', name: 'Steel', cost: 50, strength: 100, weight: 40, color: '#708090' },
  { id: 'concrete', name: 'Concrete', cost: 35, strength: 60, weight: 100, color: '#A9A9A9' }
];

const CHALLENGES: Challenge[] = [
  {
    id: 'creek',
    name: 'Forest Creek',
    span: 10,
    load: 50,
    budget: 1000,
    description: 'A small creek in the woods. Hikers need to cross safely.'
  },
  {
    id: 'road',
    name: 'Country Road',
    span: 20,
    load: 200,
    budget: 3000,
    description: 'A country road needs a bridge for cars and light trucks.'
  },
  {
    id: 'highway',
    name: 'Highway Overpass',
    span: 30,
    load: 500,
    budget: 8000,
    description: 'A busy highway requires a sturdy overpass for heavy traffic.'
  },
  {
    id: 'railway',
    name: 'Railway Bridge',
    span: 25,
    load: 400,
    budget: 6000,
    description: 'Trains need a bridge that can handle dynamic loads and vibration.'
  },
  {
    id: 'suspension',
    name: 'River Crossing',
    span: 50,
    load: 300,
    budget: 10000,
    description: 'A wide river needs a long-span bridge for vehicles and pedestrians.'
  }
];

const STORAGE_KEY = 'bridge-builder-progress';

function loadProgress(): { completed: string[]; totalSpent: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { completed: [], totalSpent: 0 };
}

function saveProgress(p: { completed: string[]; totalSpent: number }): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

function calculateBridgePerformance(design: BridgeDesign, challenge: Challenge): {
  strength: number;
  cost: number;
  weight: number;
  success: boolean;
  message: string;
} {
  const baseStrength = design.material.strength;
  const archBonus = design.archHeight * 0.5;
  const supportBonus = design.supportCount * 10;
  const totalStrength = baseStrength + archBonus + supportBonus;

  const baseCost = design.material.cost;
  const archCost = design.archHeight * 20;
  const supportCost = design.supportCount * 50;
  const spanMultiplier = challenge.span / 10;
  const totalCost = (baseCost + archCost + supportCost) * spanMultiplier;

  const baseWeight = design.material.weight;
  const archWeight = design.archHeight * 15;
  const supportWeight = design.supportCount * 30;
  const totalWeight = baseWeight + archWeight + supportWeight;

  const strengthRatio = totalStrength / challenge.load;
  const success = strengthRatio >= 1.0 && totalCost <= challenge.budget;

  let message = '';
  if (!success) {
    if (strengthRatio < 1.0) {
      message = 'The bridge cannot support the required load. It needs more strength.';
    } else if (totalCost > challenge.budget) {
      message = 'The bridge exceeds the budget. Find a more economical solution.';
    }
  } else {
    const efficiency = (strengthRatio * challenge.budget) / totalCost;
    if (efficiency > 2.0) {
      message = 'Excellent! A strong, economical design.';
    } else if (efficiency > 1.5) {
      message = 'Good work. A solid compromise between strength and cost.';
    } else {
      message = 'It works, but could be more efficient.';
    }
  }

  return { strength: totalStrength, cost: totalCost, weight: totalWeight, success, message };
}

const bridgeBuilder: ExperienceModule = {
  mount(container: HTMLElement, context: ExperienceContext) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'bridge-builder';
    wrapper.style.cssText = 'padding: 1rem; max-width: 640px; margin: 0 auto;';

    let progress = loadProgress();
    let currentChallengeIdx = 0;
    // Find first uncompleted challenge
    for (let i = 0; i < CHALLENGES.length; i++) {
      if (!progress.completed.includes(CHALLENGES[i].id)) {
        currentChallengeIdx = i;
        break;
      }
    }

    let currentDesign: BridgeDesign = {
      material: MATERIALS[0],
      archHeight: 2,
      supportCount: 2
    };

    const title = document.createElement('h2');
    title.textContent = 'Bridge Builder';

    const desc = document.createElement('p');
    desc.className = 'lead';
    desc.textContent = 'Build bridges that work. Balance strength, cost, and materials. Every design is a compromise.';

    const stats = document.createElement('div');
    stats.style.cssText = 'font-size: 0.875rem; color: GrayText; margin-bottom: 1rem;';

    const challengeCard = document.createElement('div');
    challengeCard.style.cssText = 'padding: 1rem; border: 2px solid ButtonBorder; border-radius: 0.5rem; background: ButtonFace; margin: 1rem 0;';

    const designArea = document.createElement('div');
    designArea.style.cssText = 'margin: 1rem 0;';

    const previewArea = document.createElement('div');
    previewArea.style.cssText = 'margin: 1rem 0; padding: 1rem; border: 1px solid ButtonBorder; border-radius: 0.5rem; background: ButtonFace;';

    const resultArea = document.createElement('div');
    resultArea.style.cssText = 'margin-top: 1rem;';

    const controls = document.createElement('div');
    controls.style.cssText = 'display: flex; gap: 0.5rem; margin-top: 1rem;';

    function updateStats() {
      stats.textContent = `Bridges built: ${progress.completed.length}/${CHALLENGES.length} • Total spent: $${progress.totalSpent.toLocaleString()}`;
    }

    function renderChallenge() {
      const challenge = CHALLENGES[currentChallengeIdx];
      challengeCard.innerHTML = '';

      const name = document.createElement('h3');
      name.style.marginTop = '0';
      name.textContent = challenge.name;

      const description = document.createElement('p');
      description.style.cssText = 'line-height: 1.5; margin-bottom: 0.5rem;';
      description.textContent = challenge.description;

      const requirements = document.createElement('div');
      requirements.style.cssText = 'display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 0.75rem; font-size: 0.9rem;';

      const span = document.createElement('span');
      span.innerHTML = `<strong>Span:</strong> ${challenge.span}m`;

      const load = document.createElement('span');
      load.innerHTML = `<strong>Load:</strong> ${challenge.load} tons`;

      const budget = document.createElement('span');
      budget.innerHTML = `<strong>Budget:</strong> $${challenge.budget.toLocaleString()}`;

      requirements.append(span, load, budget);
      challengeCard.append(name, description, requirements);
    }

    function renderDesign() {
      designArea.innerHTML = '';

      const heading = document.createElement('h4');
      heading.style.cssText = 'margin-bottom: 0.5rem;';
      heading.textContent = 'Design Your Bridge';

      // Material selection
      const materialSection = document.createElement('div');
      materialSection.style.cssText = 'margin-bottom: 1rem;';

      const materialLabel = document.createElement('label');
      materialLabel.style.cssText = 'display: block; margin-bottom: 0.5rem; font-weight: 600;';
      materialLabel.textContent = 'Material:';

      const materialGrid = document.createElement('div');
      materialGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.5rem;';

      MATERIALS.forEach(material => {
        const btn = document.createElement('button');
        btn.className = 'btn';
        const isSelected = currentDesign.material.id === material.id;
        btn.style.cssText = `padding: 0.75rem; border: 2px solid ${isSelected ? material.color : 'ButtonBorder'}; background: ${isSelected ? material.color + '22' : 'ButtonFace'};`;

        const name = document.createElement('div');
        name.style.cssText = `font-weight: 600; color: ${material.color};`;
        name.textContent = material.name;

        const stats = document.createElement('div');
        stats.style.cssText = 'font-size: 0.75rem; color: GrayText; margin-top: 0.25rem;';
        stats.innerHTML = `Str: ${material.strength} | $${material.cost}`;

        btn.append(name, stats);
        btn.addEventListener('click', () => {
          currentDesign.material = material;
          renderDesign();
          updatePreview();
        });

        materialGrid.appendChild(btn);
      });

      materialSection.append(materialLabel, materialGrid);

      // Arch height
      const archSection = document.createElement('div');
      archSection.style.cssText = 'margin-bottom: 1rem;';

      const archLabel = document.createElement('label');
      archLabel.style.cssText = 'display: block; margin-bottom: 0.5rem; font-weight: 600;';
      archLabel.textContent = `Arch Height: ${currentDesign.archHeight}m`;

      const archSlider = document.createElement('input');
      archSlider.type = 'range';
      archSlider.min = '0';
      archSlider.max = '10';
      archSlider.value = String(currentDesign.archHeight);
      archSlider.style.cssText = 'width: 100%;';
      archSlider.addEventListener('input', () => {
        currentDesign.archHeight = parseInt(archSlider.value);
        archLabel.textContent = `Arch Height: ${currentDesign.archHeight}m`;
        updatePreview();
      });

      archSection.append(archLabel, archSlider);

      // Support count
      const supportSection = document.createElement('div');
      supportSection.style.cssText = 'margin-bottom: 1rem;';

      const supportLabel = document.createElement('label');
      supportLabel.style.cssText = 'display: block; margin-bottom: 0.5rem; font-weight: 600;';
      supportLabel.textContent = `Supports: ${currentDesign.supportCount}`;

      const supportSlider = document.createElement('input');
      supportSlider.type = 'range';
      supportSlider.min = '0';
      supportSlider.max = '6';
      supportSlider.value = String(currentDesign.supportCount);
      supportSlider.style.cssText = 'width: 100%;';
      supportSlider.addEventListener('input', () => {
        currentDesign.supportCount = parseInt(supportSlider.value);
        supportLabel.textContent = `Supports: ${currentDesign.supportCount}`;
        updatePreview();
      });

      supportSection.append(supportLabel, supportSlider);

      designArea.append(heading, materialSection, archSection, supportSection);
    }

    function updatePreview() {
      const challenge = CHALLENGES[currentChallengeIdx];
      const perf = calculateBridgePerformance(currentDesign, challenge);

      previewArea.innerHTML = '';

      const heading = document.createElement('h4');
      heading.style.cssText = 'margin-bottom: 0.5rem;';
      heading.textContent = 'Bridge Analysis';

      const metrics = document.createElement('div');
      metrics.style.cssText = 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 1rem;';

      const strength = document.createElement('div');
      strength.style.cssText = 'padding: 0.75rem; border: 1px solid ButtonBorder; border-radius: 0.25rem; text-align: center;';
      strength.innerHTML = `<div style="font-size: 0.75rem; color: GrayText;">Strength</div><div style="font-size: 1.25rem; font-weight: 600;">${Math.round(perf.strength)}</div><div style="font-size: 0.75rem;">need ${challenge.load}</div>`;

      const cost = document.createElement('div');
      cost.style.cssText = 'padding: 0.75rem; border: 1px solid ButtonBorder; border-radius: 0.25rem; text-align: center;';
      cost.innerHTML = `<div style="font-size: 0.75rem; color: GrayText;">Cost</div><div style="font-size: 1.25rem; font-weight: 600;">$${Math.round(perf.cost).toLocaleString()}</div><div style="font-size: 0.75rem;">budget $${challenge.budget.toLocaleString()}</div>`;

      const weight = document.createElement('div');
      weight.style.cssText = 'padding: 0.75rem; border: 1px solid ButtonBorder; border-radius: 0.25rem; text-align: center;';
      weight.innerHTML = `<div style="font-size: 0.75rem; color: GrayText;">Weight</div><div style="font-size: 1.25rem; font-weight: 600;">${Math.round(perf.weight)} tons</div>`;

      metrics.append(strength, cost, weight);

      const testBtn = document.createElement('button');
      testBtn.className = 'btn primary';
      testBtn.textContent = 'Test Bridge';
      testBtn.style.width = '100%';
      testBtn.addEventListener('click', testBridge);

      previewArea.append(heading, metrics, testBtn);
    }

    function testBridge() {
      const challenge = CHALLENGES[currentChallengeIdx];
      const perf = calculateBridgePerformance(currentDesign, challenge);

      resultArea.innerHTML = '';

      const card = document.createElement('div');
      card.style.cssText = `padding: 1rem; border: 2px solid ${perf.success ? '#22c55e' : '#ef4444'}; border-radius: 0.5rem; background: ${perf.success ? '#22c55e11' : '#ef444411'};`;

      const heading = document.createElement('h4');
      heading.style.cssText = `margin-top: 0; color: ${perf.success ? '#16a34a' : '#dc2626'};`;
      heading.textContent = perf.success ? 'Bridge holds' : 'Bridge fails';

      const message = document.createElement('p');
      message.style.cssText = 'margin-bottom: 0;';
      message.textContent = perf.message;

      card.append(heading, message);
      resultArea.appendChild(card);

      if (perf.success && !progress.completed.includes(challenge.id)) {
        progress.completed.push(challenge.id);
        progress.totalSpent += Math.round(perf.cost);
        saveProgress(progress);
        updateStats();

        events.emit('experience_interaction', {
          experience_id: context.meta.id,
          action: 'bridge_completed',
          challenge: challenge.id,
          cost: Math.round(perf.cost),
          strength: Math.round(perf.strength)
        });
      }

      controls.innerHTML = '';
      if (progress.completed.length < CHALLENGES.length) {
        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn';
        nextBtn.textContent = 'Next Challenge';
        nextBtn.addEventListener('click', () => {
          currentChallengeIdx = (currentChallengeIdx + 1) % CHALLENGES.length;
          resultArea.innerHTML = '';
          controls.innerHTML = '';
          render();
        });
        controls.appendChild(nextBtn);
      }
    }

    function render() {
      updateStats();
      renderChallenge();
      renderDesign();
      updatePreview();
    }

    wrapper.append(title, desc, stats, challengeCard, designArea, previewArea, resultArea, controls);
    container.appendChild(wrapper);

    render();

    return () => {};
  }
};

export default bridgeBuilder;
