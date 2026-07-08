import type { ExperienceModule, ExperienceContext } from '../platform/types';
import { events } from '../platform/events';

interface LandscapeZone {
  id: string;
  name: string;
  icon: string;
  elevation: string;
  description: string;
  waterState: string;
  actions: { label: string; consequence: string; downstream: string }[];
}

const ZONES: LandscapeZone[] = [
  {
    id: 'mountain',
    name: 'Mountain Summit',
    icon: '🏔️',
    elevation: '3,000m',
    description: 'Snow accumulates in winter, melts in spring. This is where the river begins — as trickles joining in rocky channels.',
    waterState: 'Snow and ice → meltwater streams',
    actions: [
      { label: 'Forest logging at the tree line', consequence: 'Without tree roots, rain hits bare soil. Erosion increases.', downstream: 'Sediment enters the stream, making it turbid.' },
      { label: 'Protected watershed area', consequence: 'Old-growth forest holds soil and filters water.', downstream: 'Clean water flows downhill slowly, recharged by roots.' },
      { label: 'Mining operation upstream', consequence: 'Heavy metals leach into meltwater.', downstream: 'Toxic water carries dissolved minerals into lower zones.' }
    ]
  },
  {
    id: 'highland',
    name: 'Highland Valley',
    icon: '🏞️',
    elevation: '1,500m',
    description: 'The stream has become a river. It cuts through rock, creating rapids and pools. Towns cluster near its banks.',
    waterState: 'Fast-flowing river with rocky substrate',
    actions: [
      { label: 'A dam is built for hydroelectricity', consequence: 'Water is stored in a reservoir. Flow downstream is controlled.', downstream: 'Reduced flow and altered temperature reach lower zones.' },
      { label: 'Town discharges treated wastewater', consequence: 'Even treated water adds nutrients and chemicals.', downstream: 'Nutrient levels rise. Algae may bloom in slower water.' },
      { label: 'Riparian buffer zone maintained', consequence: 'Vegetation along banks filters runoff and shades the river.', downstream: 'Water remains cool and clean. Fish populations thrive.' }
    ]
  },
  {
    id: 'farmland',
    name: 'Agricultural Plains',
    icon: '🌾',
    elevation: '300m',
    description: 'The river slows. It meanders across flat land used for farming. Irrigation channels divert water into fields.',
    waterState: 'Slow meandering river through flat terrain',
    actions: [
      { label: 'Fertilizer applied to upstream fields', consequence: 'Rain washes excess nitrogen and phosphorus into the river.', downstream: 'Nutrient loading causes algal blooms downstream. Dead zones form.' },
      { label: 'Wetlands preserved alongside the river', consequence: 'Wetlands act as natural filters, absorbing excess nutrients.', downstream: 'Water quality improves. Flood risk decreases.' },
      { label: 'Irrigation diverts 40% of river flow', consequence: 'Fields are watered but the river shrinks.', downstream: 'Lower zones receive less water. Salinity concentrates.' }
    ]
  },
  {
    id: 'delta',
    name: 'River Delta',
    icon: '🏖️',
    elevation: '5m',
    description: 'The river splits into channels as it reaches the sea. Sediment builds new land. This is where the water\'s journey ends — and begins again.',
    waterState: 'Fresh water meets salt water in branching channels',
    actions: []
  }
];

const STORAGE_KEY = 'watershed-progress';

function loadProgress(): { zonesVisited: string[]; choicesMade: { zone: string; choice: number }[]; outcomes: string[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { zonesVisited: [], choicesMade: [], outcomes: [] };
}

function saveProgress(p: { zonesVisited: string[]; choicesMade: { zone: string; choice: number }[]; outcomes: string[] }): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

// Compute delta summary based on all upstream choices
function computeDeltaSummary(choices: { zone: string; choice: number }[]): string {
  const issues: string[] = [];
  const positives: string[] = [];

  choices.forEach(c => {
    if (c.zone === 'mountain') {
      if (c.choice === 0) issues.push('Sediment from logging clouds the water');
      if (c.choice === 1) positives.push('Forest filtering keeps water clean');
      if (c.choice === 2) issues.push('Heavy metals from mining poison the water');
    }
    if (c.zone === 'highland') {
      if (c.choice === 0) issues.push('Dam reduces flow and alters temperature');
      if (c.choice === 1) issues.push('Nutrients from wastewater fuel algal growth');
      if (c.choice === 2) positives.push('Buffer zones maintain water quality');
    }
    if (c.zone === 'farmland') {
      if (c.choice === 0) issues.push('Fertilizer runoff creates dead zones');
      if (c.choice === 1) positives.push('Wetlands filter excess nutrients');
      if (c.choice === 2) issues.push('Water diversion leaves the delta thirsty');
    }
  });

  if (positives.length >= 2 && issues.length === 0) {
    return 'The delta thrives. Clean water arrives in steady flow. Fish spawn in the channels. Birds nest in the marshes. The ecosystem is healthy because decisions upstream protected it.';
  }
  if (issues.length >= 2 && positives.length === 0) {
    return 'The delta struggles. The water that arrives is warm, low, and loaded with pollutants. Fish die. Algae bloom. The marshes shrink. Every decision upstream compounded into a crisis here.';
  }
  if (issues.length > positives.length) {
    return 'The delta bears the weight of upstream decisions. Some problems are mitigated, but the cumulative effects are visible — stressed ecosystems, reduced biodiversity, degraded water quality.';
  }
  if (positives.length > issues.length) {
    return 'The delta is resilient. Despite some upstream pressures, protective decisions have buffered the worst effects. The ecosystem functions, though not at full health.';
  }
  return 'The delta reflects a mixed legacy. Some upstream choices helped; others harmed. The water carries the consequences of every decision made along its path.';
}

const watershed: ExperienceModule = {
  mount(container: HTMLElement, context: ExperienceContext) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'watershed';
    wrapper.style.cssText = 'padding: 1rem; max-width: 640px; margin: 0 auto;';

    let progress = loadProgress();
    let currentZoneIdx = 0;
    let choiceMade = false;
    let currentChoice = -1;

    const title = document.createElement('h2');
    title.textContent = 'Watershed';

    const desc = document.createElement('p');
    desc.className = 'lead';
    desc.textContent = 'Follow water from mountain to sea. Every decision upstream shapes what arrives downstream.';

    const stats = document.createElement('div');
    stats.style.cssText = 'font-size: 0.875rem; color: GrayText; margin-bottom: 1rem;';

    const flowTracker = document.createElement('div');
    flowTracker.style.cssText = 'display: flex; align-items: center; gap: 0.25rem; flex-wrap: wrap; margin-bottom: 1rem; font-size: 0.85rem;';

    const zoneCard = document.createElement('div');
    zoneCard.style.cssText = 'padding: 1rem; border: 1px solid ButtonBorder; border-radius: 0.5rem; background: ButtonFace; margin: 1rem 0;';

    const actionsArea = document.createElement('div');
    actionsArea.style.cssText = 'margin: 1rem 0;';

    const consequenceArea = document.createElement('div');
    consequenceArea.style.cssText = 'margin-top: 1rem;';

    const navArea = document.createElement('div');
    navArea.style.cssText = 'display: flex; gap: 0.5rem; margin-top: 1rem;';

    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn primary';
    nextBtn.textContent = 'Follow the water →';
    nextBtn.style.display = 'none';
    nextBtn.addEventListener('click', () => {
      currentZoneIdx += 1;
      choiceMade = false;
      currentChoice = -1;
      render();
    });

    function updateStats() {
      stats.textContent = `Zones explored: ${progress.zonesVisited.length}/${ZONES.length} • Decisions made: ${progress.choicesMade.length}`;
    }

    function renderFlowTracker() {
      flowTracker.innerHTML = '';
      ZONES.forEach((z, idx) => {
        const visited = progress.zonesVisited.includes(z.id);
        const isCurrent = idx === currentZoneIdx;
        const el = document.createElement('span');
        el.style.cssText = `padding: 0.25rem 0.5rem; border-radius: 999px; font-size: 0.8rem; border: 1px solid ${isCurrent ? 'AccentColor' : visited ? '#22c55e' : 'ButtonBorder'}; background: ${isCurrent ? 'AccentColor' : visited ? '#22c55e22' : 'ButtonFace'}; color: ${isCurrent ? 'AccentColorText' : 'inherit'};`;
        el.textContent = `${z.icon} ${z.name}`;
        flowTracker.appendChild(el);

        if (idx < ZONES.length - 1) {
          const arrow = document.createElement('span');
          arrow.style.cssText = `color: ${visited ? '#22c55e' : 'GrayText'};`;
          arrow.textContent = '→';
          flowTracker.appendChild(arrow);
        }
      });
    }

    function renderZone() {
      const zone = ZONES[currentZoneIdx];
      zoneCard.innerHTML = '';

      // Track zone as visited
      if (!progress.zonesVisited.includes(zone.id)) {
        progress.zonesVisited.push(zone.id);
        saveProgress(progress);
      }

      const header = document.createElement('div');
      header.style.cssText = 'display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem;';

      const nameEl = document.createElement('h3');
      nameEl.style.margin = '0';
      nameEl.textContent = `${zone.icon} ${zone.name}`;

      const elevation = document.createElement('span');
      elevation.style.cssText = 'font-family: monospace; font-size: 0.85rem; color: GrayText;';
      elevation.textContent = `↑ ${zone.elevation}`;

      header.append(nameEl, elevation);

      const descP = document.createElement('p');
      descP.style.cssText = 'line-height: 1.6; margin-bottom: 0.5rem;';
      descP.textContent = zone.description;

      const waterP = document.createElement('p');
      waterP.style.cssText = 'font-size: 0.85rem; color: GrayText; margin-bottom: 0;';
      waterP.textContent = `Water: ${zone.waterState}`;

      zoneCard.append(header, descP, waterP);
    }

    function renderDelta() {
      const zone = ZONES[ZONES.length - 1]; // Delta zone
      zoneCard.innerHTML = '';

      const nameEl = document.createElement('h3');
      nameEl.style.marginTop = '0';
      nameEl.textContent = `${zone.icon} ${zone.name}`;

      const descP = document.createElement('p');
      descP.style.cssText = 'line-height: 1.6; margin-bottom: 0.5rem;';
      descP.textContent = zone.description;

      const waterP = document.createElement('p');
      waterP.style.cssText = 'font-size: 0.85rem; color: GrayText; margin-bottom: 0;';
      waterP.textContent = `Water: ${zone.waterState}`;

      zoneCard.append(nameEl, descP, waterP);

      // Show upstream choices summary
      actionsArea.innerHTML = '';
      const choicesHeader = document.createElement('h4');
      choicesHeader.style.cssText = 'margin-top: 1rem;';
      choicesHeader.textContent = 'What arrived here:';
      actionsArea.appendChild(choicesHeader);

      if (progress.choicesMade.length === 0) {
        const noChoices = document.createElement('p');
        noChoices.style.cssText = 'color: GrayText; font-style: italic;';
        noChoices.textContent = 'No decisions were made upstream. The water arrived as it always has.';
        actionsArea.appendChild(noChoices);
      } else {
        const list = document.createElement('ul');
        list.style.cssText = 'padding-left: 1.25rem;';
        progress.choicesMade.forEach(c => {
          const zone = ZONES.find(z => z.id === c.zone)!;
          const action = zone.actions[c.choice];
          if (action) {
            const li = document.createElement('li');
            li.style.cssText = 'margin-bottom: 0.35rem; font-size: 0.9rem;';
            li.innerHTML = `<strong>${zone.icon} ${zone.name}:</strong> ${action.label} — ${action.downstream}`;
            list.appendChild(li);
          }
        });
        actionsArea.appendChild(list);
      }

      // Show delta outcome
      consequenceArea.innerHTML = '';
      const summary = computeDeltaSummary(progress.choicesMade);
      const summaryCard = document.createElement('div');
      summaryCard.style.cssText = 'padding: 1rem; border: 1px solid ButtonBorder; border-radius: 0.5rem; background: ButtonFace; margin-top: 1rem;';
      const sumTitle = document.createElement('h4');
      sumTitle.style.marginTop = '0';
      sumTitle.textContent = 'The Delta\'s Condition';
      const sumText = document.createElement('p');
      sumText.style.cssText = 'line-height: 1.6; margin-bottom: 0;';
      sumText.textContent = summary;
      summaryCard.append(sumTitle, sumText);
      consequenceArea.appendChild(summaryCard);

      // Reset button
      const resetBtn = document.createElement('button');
      resetBtn.className = 'btn';
      resetBtn.textContent = 'Trace the water again';
      resetBtn.style.marginTop = '1rem';
      resetBtn.addEventListener('click', () => {
        currentZoneIdx = 0;
        choiceMade = false;
        currentChoice = -1;
        render();
      });
      consequenceArea.appendChild(resetBtn);
    }

    function renderActions() {
      actionsArea.innerHTML = '';
      consequenceArea.innerHTML = '';
      const zone = ZONES[currentZoneIdx];

      if (zone.id === 'delta') {
        renderDelta();
        nextBtn.style.display = 'none';
        return;
      }

      const heading = document.createElement('p');
      heading.style.cssText = 'font-weight: 600; margin-bottom: 0.5rem;';
      heading.textContent = 'What happens in this zone:';
      actionsArea.appendChild(heading);

      zone.actions.forEach((action, idx) => {
        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.style.cssText = 'text-align: left; padding: 0.75rem 1rem; width: 100%; margin-bottom: 0.5rem;';

        if (choiceMade && idx === currentChoice) {
          btn.style.borderColor = '#3b82f6';
          btn.style.background = '#3b82f611';
        } else if (choiceMade) {
          btn.style.opacity = '0.5';
        }

        btn.innerHTML = `<strong>${action.label}</strong>`;

        if (!choiceMade) {
          btn.addEventListener('click', () => {
            choiceMade = true;
            currentChoice = idx;
            progress.choicesMade.push({ zone: zone.id, choice: idx });
            progress.outcomes.push(action.downstream);
            saveProgress(progress);
            updateStats();
            render();

            events.emit('experience_interaction', {
              experience_id: context.meta.id,
              action: 'decision_made',
              zone: zone.id,
              choice: idx
            });
          });
        }

        actionsArea.appendChild(btn);
      });

      if (choiceMade && currentChoice >= 0) {
        const action = zone.actions[currentChoice];
        const card = document.createElement('div');
        card.style.cssText = 'padding: 1rem; border: 1px solid #3b82f6; border-radius: 0.5rem; background: #3b82f611;';

        const consequence = document.createElement('p');
        consequence.style.cssText = 'margin-bottom: 0.5rem;';
        consequence.innerHTML = `<strong>Consequence:</strong> ${action.consequence}`;

        const downstream = document.createElement('p');
        downstream.style.cssText = 'margin-bottom: 0; font-size: 0.9rem; color: GrayText;';
        downstream.innerHTML = `<strong>Downstream effect:</strong> ${action.downstream}`;

        card.append(consequence, downstream);
        consequenceArea.appendChild(card);

        if (currentZoneIdx < ZONES.length - 1) {
          nextBtn.style.display = 'inline-flex';
        }
      }
    }

    function render() {
      updateStats();
      renderFlowTracker();

      if (currentZoneIdx >= ZONES.length) {
        currentZoneIdx = ZONES.length - 1;
      }

      if (ZONES[currentZoneIdx].id === 'delta') {
        renderDelta();
        nextBtn.style.display = 'none';
      } else {
        renderZone();
        renderActions();
      }
    }

    wrapper.append(title, desc, stats, flowTracker, zoneCard, actionsArea, consequenceArea, navArea, nextBtn);
    container.appendChild(wrapper);

    render();

    return () => {};
  }
};

export default watershed;
