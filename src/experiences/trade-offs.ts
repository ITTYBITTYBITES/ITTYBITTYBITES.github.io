import type { ExperienceModule, ExperienceContext } from '../platform/types';
import { events } from '../platform/events';

interface Metric {
  name: string;
  value: number;
  target: number;
  weight: number;
}

interface Decision {
  id: string;
  description: string;
  effects: Record<string, number>;
}

interface Scenario {
  id: string;
  title: string;
  description: string;
  metrics: Metric[];
  decisions: Decision[];
}

const SCENARIOS: Scenario[] = [
  {
    id: 'product',
    title: 'Product Development',
    description: 'Balance quality, speed, and cost for a new product launch.',
    metrics: [
      { name: 'Quality', value: 50, target: 75, weight: 0.4 },
      { name: 'Speed', value: 50, target: 75, weight: 0.35 },
      { name: 'Cost', value: 50, target: 75, weight: 0.25 }
    ],
    decisions: [
      {
        id: 'd1',
        description: 'Invest in premium materials',
        effects: { Quality: 15, Speed: -10, Cost: -20 }
      },
      {
        id: 'd2',
        description: 'Hire more engineers',
        effects: { Quality: 5, Speed: 20, Cost: -25 }
      },
      {
        id: 'd3',
        description: 'Cut testing phase short',
        effects: { Quality: -20, Speed: 15, Cost: 10 }
      },
      {
        id: 'd4',
        description: 'Use automated testing',
        effects: { Quality: 10, Speed: 10, Cost: -15 }
      },
      {
        id: 'd5',
        description: 'Outsource non-core features',
        effects: { Quality: -5, Speed: 15, Cost: 5 }
      }
    ]
  },
  {
    id: 'team',
    title: 'Team Management',
    description: 'Balance productivity, morale, and innovation in your team.',
    metrics: [
      { name: 'Productivity', value: 50, target: 75, weight: 0.4 },
      { name: 'Morale', value: 50, target: 75, weight: 0.35 },
      { name: 'Innovation', value: 50, target: 75, weight: 0.25 }
    ],
    decisions: [
      {
        id: 'd1',
        description: 'Increase meeting frequency',
        effects: { Productivity: -10, Morale: -5, Innovation: 10 }
      },
      {
        id: 'd2',
        description: 'Implement strict deadlines',
        effects: { Productivity: 15, Morale: -15, Innovation: -10 }
      },
      {
        id: 'd3',
        description: 'Allow 20% innovation time',
        effects: { Productivity: -10, Morale: 15, Innovation: 20 }
      },
      {
        id: 'd4',
        description: 'Offer performance bonuses',
        effects: { Productivity: 10, Morale: 5, Innovation: -5 }
      },
      {
        id: 'd5',
        description: 'Reduce team size',
        effects: { Productivity: 5, Morale: -20, Innovation: -10 }
      }
    ]
  },
  {
    id: 'learning',
    title: 'Learning Platform',
    description: 'Balance depth, accessibility, and engagement for an educational platform.',
    metrics: [
      { name: 'Depth', value: 50, target: 75, weight: 0.4 },
      { name: 'Accessibility', value: 50, target: 75, weight: 0.35 },
      { name: 'Engagement', value: 50, target: 75, weight: 0.25 }
    ],
    decisions: [
      {
        id: 'd1',
        description: 'Add advanced topics',
        effects: { Depth: 20, Accessibility: -15, Engagement: -5 }
      },
      {
        id: 'd2',
        description: 'Create video tutorials',
        effects: { Depth: 5, Accessibility: 15, Engagement: 15 }
      },
      {
        id: 'd3',
        description: 'Implement gamification',
        effects: { Depth: -10, Accessibility: 5, Engagement: 25 }
      },
      {
        id: 'd4',
        description: 'Add interactive exercises',
        effects: { Depth: 10, Accessibility: 10, Engagement: 10 }
      },
      {
        id: 'd5',
        description: 'Simplify user interface',
        effects: { Depth: -15, Accessibility: 20, Engagement: 5 }
      }
    ]
  },
  {
    id: 'sustainability',
    title: 'Sustainability Initiative',
    description: 'Balance environmental impact, economic viability, and social responsibility.',
    metrics: [
      { name: 'Environment', value: 50, target: 75, weight: 0.4 },
      { name: 'Economy', value: 50, target: 75, weight: 0.35 },
      { name: 'Social', value: 50, target: 75, weight: 0.25 }
    ],
    decisions: [
      {
        id: 'd1',
        description: 'Switch to renewable energy',
        effects: { Environment: 25, Economy: -20, Social: 10 }
      },
      {
        id: 'd2',
        description: 'Implement recycling program',
        effects: { Environment: 15, Economy: -5, Social: 15 }
      },
      {
        id: 'd3',
        description: 'Increase wages for workers',
        effects: { Environment: 0, Economy: -15, Social: 25 }
      },
      {
        id: 'd4',
        description: 'Automate processes',
        effects: { Environment: 10, Economy: 15, Social: -10 }
      },
      {
        id: 'd5',
        description: 'Source local materials',
        effects: { Environment: 20, Economy: -10, Social: 15 }
      }
    ]
  }
];

const STORAGE_KEY = 'trade-offs-progress';

function loadProgress(): { completed: string[]; totalDecisions: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { completed: [], totalDecisions: 0 };
}

function saveProgress(p: { completed: string[]; totalDecisions: number }): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

function calculateScore(metrics: Metric[]): number {
  let totalScore = 0;
  let totalWeight = 0;

  metrics.forEach(m => {
    const distance = Math.abs(m.value - m.target);
    const score = Math.max(0, 100 - distance);
    totalScore += score * m.weight;
    totalWeight += m.weight;
  });

  return totalWeight > 0 ? totalScore / totalWeight : 0;
}

const tradeOffs: ExperienceModule = {
  mount(container: HTMLElement, context: ExperienceContext) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'trade-offs';
    wrapper.style.cssText = 'padding: 1rem; max-width: 640px; margin: 0 auto;';

    let progress = loadProgress();
    let currentScenarioIdx = 0;
    // Find first uncompleted scenario
    for (let i = 0; i < SCENARIOS.length; i++) {
      if (!progress.completed.includes(SCENARIOS[i].id)) {
        currentScenarioIdx = i;
        break;
      }
    }

    let currentMetrics: Metric[] = [];
    let decisionsMade: string[] = [];
    let decisionsRemaining = 3;

    const title = document.createElement('h2');
    title.textContent = 'Trade-offs';

    const desc = document.createElement('p');
    desc.className = 'lead';
    desc.textContent = 'Make decisions. Improve one metric. Sacrifice another. There is no free lunch.';

    const stats = document.createElement('div');
    stats.style.cssText = 'font-size: 0.875rem; color: GrayText; margin-bottom: 1rem;';

    const scenarioCard = document.createElement('div');
    scenarioCard.style.cssText = 'padding: 1rem; border: 2px solid ButtonBorder; border-radius: 0.5rem; background: ButtonFace; margin: 1rem 0;';

    const metricsArea = document.createElement('div');
    metricsArea.style.cssText = 'margin: 1rem 0;';

    const decisionsArea = document.createElement('div');
    decisionsArea.style.cssText = 'margin: 1rem 0;';

    const resultArea = document.createElement('div');
    resultArea.style.cssText = 'margin-top: 1rem;';

    const controls = document.createElement('div');
    controls.style.cssText = 'display: flex; gap: 0.5rem; margin-top: 1rem;';

    function updateStats() {
      stats.textContent = `Scenarios completed: ${progress.completed.length}/${SCENARIOS.length} • Decisions made: ${progress.totalDecisions}`;
    }

    function renderScenario() {
      const scenario = SCENARIOS[currentScenarioIdx];
      currentMetrics = scenario.metrics.map(m => ({ ...m }));
      decisionsMade = [];
      decisionsRemaining = 3;

      scenarioCard.innerHTML = '';

      const scenarioTitle = document.createElement('h3');
      scenarioTitle.style.marginTop = '0';
      scenarioTitle.textContent = scenario.title;

      const description = document.createElement('p');
      description.style.cssText = 'line-height: 1.5; margin-bottom: 0;';
      description.textContent = scenario.description;

      scenarioCard.append(scenarioTitle, description);
    }

    function renderMetrics() {
      metricsArea.innerHTML = '';

      const heading = document.createElement('h4');
      heading.style.cssText = 'margin-bottom: 0.75rem;';
      heading.textContent = `Current State (${decisionsRemaining} decisions remaining)`;

      metricsArea.appendChild(heading);

      const metricsGrid = document.createElement('div');
      metricsGrid.style.cssText = 'display: grid; gap: 0.75rem;';

      currentMetrics.forEach(m => {
        const metric = document.createElement('div');
        metric.style.cssText = 'padding: 0.75rem; border: 1px solid ButtonBorder; border-radius: 0.25rem;';

        const header = document.createElement('div');
        header.style.cssText = 'display: flex; justify-content: space-between; margin-bottom: 0.5rem;';

        const name = document.createElement('span');
        name.style.cssText = 'font-weight: 600;';
        name.textContent = m.name;

        const value = document.createElement('span');
        const distance = Math.abs(m.value - m.target);
        const achieved = distance <= 10;
        value.style.cssText = `font-weight: 600; color: ${achieved ? '#16a34a' : 'inherit'};`;
        value.textContent = `${m.value}/100`;

        header.append(name, value);

        const bar = document.createElement('div');
        bar.style.cssText = 'height: 8px; background: ButtonBorder; border-radius: 4px; overflow: hidden; position: relative;';

        const fill = document.createElement('div');
        fill.style.cssText = `height: 100%; background: ${achieved ? '#22c55e' : 'AccentColor'}; width: ${m.value}%; transition: width 0.3s;`;
        bar.appendChild(fill);

        const target = document.createElement('div');
        target.style.cssText = `position: absolute; left: ${m.target}%; top: 0; bottom: 0; width: 2px; background: #eab308;`;
        bar.style.position = 'relative';
        bar.appendChild(target);

        const targetLabel = document.createElement('div');
        targetLabel.style.cssText = 'font-size: 0.75rem; color: GrayText; margin-top: 0.25rem;';
        targetLabel.textContent = `Target: ${m.target}`;

        metric.append(header, bar, targetLabel);
        metricsGrid.appendChild(metric);
      });

      metricsArea.appendChild(metricsGrid);
    }

    function renderDecisions() {
      decisionsArea.innerHTML = '';

      if (decisionsRemaining === 0) {
        const heading = document.createElement('h4');
        heading.style.cssText = 'margin-bottom: 0.75rem;';
        heading.textContent = 'All Decisions Made';

        decisionsArea.appendChild(heading);

        const message = document.createElement('p');
        message.style.cssText = 'color: GrayText; font-style: italic;';
        message.textContent = 'Review your trade-offs and submit when ready.';

        decisionsArea.appendChild(message);
        return;
      }

      const heading = document.createElement('h4');
      heading.style.cssText = 'margin-bottom: 0.75rem;';
      heading.textContent = `Make a Decision (${decisionsRemaining} remaining)`;

      decisionsArea.appendChild(heading);

      const scenario = SCENARIOS[currentScenarioIdx];
      const availableDecisions = scenario.decisions.filter(d => !decisionsMade.includes(d.id));

      const decisionList = document.createElement('div');
      decisionList.style.cssText = 'display: grid; gap: 0.5rem;';

      availableDecisions.forEach(decision => {
        const decisionItem = document.createElement('button');
        decisionItem.className = 'btn';
        decisionItem.style.cssText = 'text-align: left; padding: 0.75rem;';

        const description = document.createElement('div');
        description.style.cssText = 'font-weight: 600; margin-bottom: 0.25rem;';
        description.textContent = decision.description;

        const effects = document.createElement('div');
        effects.style.cssText = 'font-size: 0.85rem; color: GrayText;';

        const effectTexts: string[] = [];
        Object.entries(decision.effects).forEach(([metric, change]) => {
          const color = change > 0 ? '#16a34a' : change < 0 ? '#dc2626' : 'GrayText';
          const sign = change > 0 ? '+' : '';
          effectTexts.push(`<span style="color: ${color};">${metric}: ${sign}${change}</span>`);
        });
        effects.innerHTML = effectTexts.join(' • ');

        decisionItem.append(description, effects);

        decisionItem.addEventListener('click', () => {
          decisionsMade.push(decision.id);
          decisionsRemaining--;
          progress.totalDecisions++;

          Object.entries(decision.effects).forEach(([metric, change]) => {
            const m = currentMetrics.find(m => m.name === metric);
            if (m) {
              m.value = Math.max(0, Math.min(100, m.value + change));
            }
          });

          saveProgress(progress);
          updateStats();
          renderMetrics();
          renderDecisions();

          events.emit('experience_interaction', {
            experience_id: context.meta.id,
            action: 'decision_made',
            scenario: currentScenarioIdx,
            decision: decision.id
          });
        });

        decisionList.appendChild(decisionItem);
      });

      decisionsArea.appendChild(decisionList);
    }

    function submitResults() {
      const score = calculateScore(currentMetrics);

      resultArea.innerHTML = '';

      const result = document.createElement('div');
      result.style.cssText = `padding: 1rem; border: 2px solid ${score >= 70 ? '#22c55e' : '#eab308'}; border-radius: 0.5rem; background: ${score >= 70 ? '#22c55e11' : '#eab30811'};`;

      const heading = document.createElement('h4');
      heading.style.cssText = `margin-top: 0; color: ${score >= 70 ? '#16a34a' : '#ca8a04'};`;
      heading.textContent = score >= 70 ? '✓ Balanced Outcome' : 'Trade-offs Made';

      const message = document.createElement('p');
      message.style.cssText = 'margin-bottom: 0.5rem;';
      if (score >= 70) {
        message.textContent = 'You found a good balance between competing objectives.';
      } else if (score >= 50) {
        message.textContent = 'Every decision had consequences. Some metrics improved while others suffered.';
      } else {
        message.textContent = 'The trade-offs were harsh. Consider which objectives matter most next time.';
      }

      const scoreDisplay = document.createElement('div');
      scoreDisplay.style.cssText = 'font-size: 1.5rem; font-weight: 700; text-align: center; margin: 0.5rem 0;';
      scoreDisplay.textContent = `Score: ${Math.round(score)}/100`;

      result.append(heading, message, scoreDisplay);
      resultArea.appendChild(result);

      if (!progress.completed.includes(SCENARIOS[currentScenarioIdx].id)) {
        progress.completed.push(SCENARIOS[currentScenarioIdx].id);
        saveProgress(progress);
        updateStats();
      }

      controls.innerHTML = '';
      if (progress.completed.length < SCENARIOS.length) {
        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn primary';
        nextBtn.textContent = 'Next Scenario →';
        nextBtn.addEventListener('click', () => {
          currentScenarioIdx = (currentScenarioIdx + 1) % SCENARIOS.length;
          resultArea.innerHTML = '';
          controls.innerHTML = '';
          render();
        });
        controls.appendChild(nextBtn);
      }
    }

    function render() {
      updateStats();
      renderScenario();
      renderMetrics();
      renderDecisions();
    }

    wrapper.append(title, desc, stats, scenarioCard, metricsArea, decisionsArea, resultArea, controls);
    container.appendChild(wrapper);

    // Submit button
    const submitBtn = document.createElement('button');
    submitBtn.className = 'btn primary';
    submitBtn.textContent = 'Submit Results';
    submitBtn.style.marginTop = '1rem';
    submitBtn.addEventListener('click', submitResults);
    controls.appendChild(submitBtn);

    render();

    return () => {};
  }
};

export default tradeOffs;
