import type { ExperienceModule, ExperienceContext } from '../platform/types';
import { events } from '../platform/events';

interface Parameter {
  id: string;
  name: string;
  min: number;
  max: number;
  value: number;
}

interface Objective {
  name: string;
  target: number;
  tolerance: number;
  weight: number;
}

interface Scenario {
  id: string;
  name: string;
  description: string;
  parameters: Parameter[];
  objectives: Objective[];
  calculate: (params: Record<string, number>) => Record<string, number>;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'recipe',
    name: 'Recipe Optimization',
    description: 'Balance ingredients to hit multiple taste targets simultaneously.',
    parameters: [
      { id: 'sweet', name: 'Sweetness', min: 0, max: 10, value: 5 },
      { id: 'sour', name: 'Sourness', min: 0, max: 10, value: 5 },
      { id: 'salty', name: 'Saltiness', min: 0, max: 10, value: 5 },
      { id: 'bitter', name: 'Bitterness', min: 0, max: 10, value: 5 }
    ],
    objectives: [
      { name: 'Overall Appeal', target: 7.5, tolerance: 0.5, weight: 0.4 },
      { name: 'Balance', target: 8, tolerance: 0.5, weight: 0.3 },
      { name: 'Memorability', target: 6, tolerance: 0.5, weight: 0.3 }
    ],
    calculate: (params) => {
      const total = params.sweet + params.sour + params.salty + params.bitter;
      const balance = 10 - Math.abs(params.sweet - params.sour) - Math.abs(params.salty - params.bitter);
      return {
        'Overall Appeal': (params.sweet * 0.3 + params.sour * 0.2 + params.salty * 0.3 + params.bitter * 0.2) * (total / 20),
        'Balance': Math.max(0, Math.min(10, balance)),
        'Memorability': Math.abs(params.sweet - params.sour) * 0.5 + Math.abs(params.salty - params.bitter) * 0.5
      };
    }
  },
  {
    id: 'engine',
    name: 'Engine Tuning',
    description: 'Optimize engine parameters for power and efficiency trade-offs.',
    parameters: [
      { id: 'fuel', name: 'Fuel Mixture', min: 0, max: 10, value: 5 },
      { id: 'timing', name: 'Ignition Timing', min: 0, max: 10, value: 5 },
      { id: 'airflow', name: 'Airflow', min: 0, max: 10, value: 5 },
      { id: 'compression', name: 'Compression', min: 0, max: 10, value: 5 }
    ],
    objectives: [
      { name: 'Power Output', target: 8, tolerance: 0.5, weight: 0.35 },
      { name: 'Fuel Efficiency', target: 7, tolerance: 0.5, weight: 0.35 },
      { name: 'Reliability', target: 8.5, tolerance: 0.5, weight: 0.3 }
    ],
    calculate: (params) => {
      const power = (params.fuel * 0.3 + params.timing * 0.3 + params.airflow * 0.2 + params.compression * 0.2);
      const efficiency = (10 - Math.abs(params.fuel - 5) * 0.3 - Math.abs(params.timing - 5) * 0.3) * (params.airflow / 10);
      const reliability = 10 - (params.compression - 5) * 0.4 - Math.abs(params.fuel - params.airflow) * 0.3;
      return {
        'Power Output': Math.max(0, Math.min(10, power)),
        'Fuel Efficiency': Math.max(0, Math.min(10, efficiency)),
        'Reliability': Math.max(0, Math.min(10, reliability))
      };
    }
  },
  {
    id: 'investment',
    name: 'Portfolio Allocation',
    description: 'Allocate investments to balance return, risk, and liquidity.',
    parameters: [
      { id: 'stocks', name: 'Stocks %', min: 0, max: 100, value: 25 },
      { id: 'bonds', name: 'Bonds %', min: 0, max: 100, value: 25 },
      { id: 'real_estate', name: 'Real Estate %', min: 0, max: 100, value: 25 },
      { id: 'cash', name: 'Cash %', min: 0, max: 100, value: 25 }
    ],
    objectives: [
      { name: 'Expected Return', target: 7, tolerance: 1, weight: 0.4 },
      { name: 'Low Risk', target: 8, tolerance: 1, weight: 0.3 },
      { name: 'Liquidity', target: 7, tolerance: 1, weight: 0.3 }
    ],
    calculate: (params) => {
      const total = params.stocks + params.bonds + params.real_estate + params.cash;
      const normalizedTotal = total === 0 ? 1 : total;
      const stocksPct = params.stocks / normalizedTotal;
      const bondsPct = params.bonds / normalizedTotal;
      const realEstatePct = params.real_estate / normalizedTotal;
      const cashPct = params.cash / normalizedTotal;

      const return_val = stocksPct * 8 + bondsPct * 5 + realEstatePct * 7 + cashPct * 2;
      const risk = 10 - (stocksPct * 6 + bondsPct * 2 + realEstatePct * 5 + cashPct * 0);
      const liquidity = cashPct * 10 + bondsPct * 7 + stocksPct * 6 + realEstatePct * 3;

      return {
        'Expected Return': return_val,
        'Low Risk': risk,
        'Liquidity': liquidity
      };
    }
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing Process',
    description: 'Optimize production for quality, speed, and cost.',
    parameters: [
      { id: 'temperature', name: 'Temperature', min: 0, max: 10, value: 5 },
      { id: 'pressure', name: 'Pressure', min: 0, max: 10, value: 5 },
      { id: 'speed', name: 'Line Speed', min: 0, max: 10, value: 5 },
      { id: 'materials', name: 'Material Grade', min: 0, max: 10, value: 5 }
    ],
    objectives: [
      { name: 'Quality Score', target: 9, tolerance: 0.5, weight: 0.4 },
      { name: 'Throughput', target: 8, tolerance: 1, weight: 0.3 },
      { name: 'Cost Efficiency', target: 7, tolerance: 1, weight: 0.3 }
    ],
    calculate: (params) => {
      const quality = (params.materials * 0.4 + params.temperature * 0.3 + params.pressure * 0.3) * (1 - Math.abs(params.speed - 5) * 0.05);
      const throughput = params.speed * (params.materials / 10) * (1 - Math.abs(params.temperature - 5) * 0.05);
      const cost = (10 - params.materials * 0.5) * (1 - params.speed * 0.05) * (params.pressure / 10);

      return {
        'Quality Score': Math.max(0, Math.min(10, quality)),
        'Throughput': Math.max(0, Math.min(10, throughput)),
        'Cost Efficiency': Math.max(0, Math.min(10, cost))
      };
    }
  }
];

const STORAGE_KEY = 'optimization-progress';

function loadProgress(): { completed: string[]; bestScores: Record<string, number> } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { completed: [], bestScores: {} };
}

function saveProgress(p: { completed: string[]; bestScores: Record<string, number> }): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

function calculateScore(results: Record<string, number>, objectives: Objective[]): number {
  let totalScore = 0;
  let totalWeight = 0;

  objectives.forEach(obj => {
    const value = results[obj.name] || 0;
    const distance = Math.abs(value - obj.target);
    const score = distance <= obj.tolerance ? 10 : Math.max(0, 10 - (distance - obj.tolerance) * 2);
    totalScore += score * obj.weight;
    totalWeight += obj.weight;
  });

  return totalWeight > 0 ? totalScore / totalWeight : 0;
}

const optimization: ExperienceModule = {
  mount(container: HTMLElement, context: ExperienceContext) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'optimization';
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

    const title = document.createElement('h2');
    title.textContent = 'Optimization';

    const desc = document.createElement('p');
    desc.className = 'lead';
    desc.textContent = 'Adjust parameters to hit multiple targets simultaneously. The best solution balances competing objectives.';

    const stats = document.createElement('div');
    stats.style.cssText = 'font-size: 0.875rem; color: GrayText; margin-bottom: 1rem;';

    const scenarioCard = document.createElement('div');
    scenarioCard.style.cssText = 'padding: 1rem; border: 2px solid ButtonBorder; border-radius: 0.5rem; background: ButtonFace; margin: 1rem 0;';

    const parameterArea = document.createElement('div');
    parameterArea.style.cssText = 'margin: 1rem 0;';

    const resultArea = document.createElement('div');
    resultArea.style.cssText = 'margin: 1rem 0; padding: 1rem; border: 1px solid ButtonBorder; border-radius: 0.5rem; background: ButtonFace;';

    const feedbackArea = document.createElement('div');
    feedbackArea.style.cssText = 'margin-top: 1rem;';

    const controls = document.createElement('div');
    controls.style.cssText = 'display: flex; gap: 0.5rem; margin-top: 1rem;';

    function updateStats() {
      stats.textContent = `Scenarios optimized: ${progress.completed.length}/${SCENARIOS.length}`;
    }

    function renderScenario() {
      const scenario = SCENARIOS[currentScenarioIdx];
      scenarioCard.innerHTML = '';

      const name = document.createElement('h3');
      name.style.marginTop = '0';
      name.textContent = scenario.name;

      const description = document.createElement('p');
      description.style.cssText = 'line-height: 1.5; margin-bottom: 0;';
      description.textContent = scenario.description;

      scenarioCard.append(name, description);
    }

    function renderParameters() {
      const scenario = SCENARIOS[currentScenarioIdx];
      parameterArea.innerHTML = '';

      const heading = document.createElement('h4');
      heading.style.cssText = 'margin-bottom: 0.75rem;';
      heading.textContent = 'Adjust Parameters';

      parameterArea.appendChild(heading);

      scenario.parameters.forEach(param => {
        const section = document.createElement('div');
        section.style.cssText = 'margin-bottom: 1rem;';

        const label = document.createElement('label');
        label.style.cssText = 'display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-weight: 600;';
        label.innerHTML = `<span>${param.name}</span><span>${param.value}</span>`;

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = String(param.min);
        slider.max = String(param.max);
        slider.value = String(param.value);
        slider.style.cssText = 'width: 100%;';

        slider.addEventListener('input', () => {
          param.value = parseFloat(slider.value);
          label.innerHTML = `<span>${param.name}</span><span>${param.value}</span>`;
          updateResults();
        });

        section.append(label, slider);
        parameterArea.appendChild(section);
      });
    }

    function updateResults() {
      const scenario = SCENARIOS[currentScenarioIdx];
      const params: Record<string, number> = {};
      scenario.parameters.forEach(p => {
        params[p.id] = p.value;
      });

      const results = scenario.calculate(params);
      const score = calculateScore(results, scenario.objectives);

      resultArea.innerHTML = '';

      const heading = document.createElement('h4');
      heading.style.cssText = 'margin-bottom: 0.75rem;';
      heading.textContent = 'Current Performance';

      resultArea.appendChild(heading);

      const metricsGrid = document.createElement('div');
      metricsGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.75rem; margin-bottom: 1rem;';

      scenario.objectives.forEach(obj => {
        const value = results[obj.name] || 0;
        const distance = Math.abs(value - obj.target);
        const achieved = distance <= obj.tolerance;

        const metric = document.createElement('div');
        metric.style.cssText = 'padding: 0.75rem; border: 1px solid ButtonBorder; border-radius: 0.25rem; text-align: center;';

        const metricName = document.createElement('div');
        metricName.style.cssText = 'font-size: 0.75rem; color: GrayText; margin-bottom: 0.25rem;';
        metricName.textContent = obj.name;

        const metricValue = document.createElement('div');
        metricValue.style.cssText = `font-size: 1.5rem; font-weight: 600; color: ${achieved ? '#16a34a' : 'inherit'};`;
        metricValue.textContent = value.toFixed(1);

        const metricTarget = document.createElement('div');
        metricTarget.style.cssText = 'font-size: 0.75rem; color: GrayText;';
        metricTarget.textContent = `target: ${obj.target}`;

        metric.append(metricName, metricValue, metricTarget);
        metricsGrid.appendChild(metric);
      });

      const scoreSection = document.createElement('div');
      scoreSection.style.cssText = 'padding: 0.75rem; border: 2px solid ButtonBorder; border-radius: 0.5rem; text-align: center;';

      const scoreLabel = document.createElement('div');
      scoreLabel.style.cssText = 'font-size: 0.875rem; color: GrayText; margin-bottom: 0.25rem;';
      scoreLabel.textContent = 'Overall Score';

      const scoreValue = document.createElement('div');
      scoreValue.style.cssText = 'font-size: 2rem; font-weight: 700;';
      scoreValue.textContent = score.toFixed(1);

      const scoreMax = document.createElement('div');
      scoreMax.style.cssText = 'font-size: 0.75rem; color: GrayText;';
      scoreMax.textContent = 'out of 10';

      scoreSection.append(scoreLabel, scoreValue, scoreMax);

      resultArea.append(metricsGrid, scoreSection);

      // Store current score for submission
      resultArea.dataset.score = String(score);
    }

    function submitSolution() {
      const scenario = SCENARIOS[currentScenarioIdx];
      const score = parseFloat(resultArea.dataset.score || '0');
      const bestScore = progress.bestScores[scenario.id] || 0;

      if (score > bestScore) {
        progress.bestScores[scenario.id] = score;
      }

      if (score >= 7 && !progress.completed.includes(scenario.id)) {
        progress.completed.push(scenario.id);
        saveProgress(progress);
        updateStats();

        events.emit('experience_interaction', {
          experience_id: context.meta.id,
          action: 'scenario_optimized',
          scenario: scenario.id,
          score: score
        });

        feedbackArea.innerHTML = '';
        const success = document.createElement('div');
        success.style.cssText = 'padding: 1rem; border: 2px solid #22c55e; border-radius: 0.5rem; background: #22c55e11;';

        const heading = document.createElement('h4');
        heading.style.cssText = 'margin-top: 0; color: #16a34a;';
        heading.textContent = '✓ Solution Accepted';

        const message = document.createElement('p');
        message.style.cssText = 'margin-bottom: 0;';
        message.textContent = `Score: ${score.toFixed(1)}/10. This configuration meets the requirements.`;

        success.append(heading, message);
        feedbackArea.appendChild(success);

        controls.innerHTML = '';
        if (progress.completed.length < SCENARIOS.length) {
          const nextBtn = document.createElement('button');
          nextBtn.className = 'btn primary';
          nextBtn.textContent = 'Next Scenario →';
          nextBtn.addEventListener('click', () => {
            currentScenarioIdx = (currentScenarioIdx + 1) % SCENARIOS.length;
            feedbackArea.innerHTML = '';
            controls.innerHTML = '';
            render();
          });
          controls.appendChild(nextBtn);
        }
      } else {
        feedbackArea.innerHTML = '';
        const feedback = document.createElement('div');
        feedback.style.cssText = 'padding: 1rem; border: 2px solid #eab308; border-radius: 0.5rem; background: #eab30811;';

        const heading = document.createElement('h4');
        heading.style.cssText = 'margin-top: 0; color: #ca8a04;';
        heading.textContent = score < 7 ? 'Not Yet Optimal' : 'Already Completed';

        const message = document.createElement('p');
        message.style.cssText = 'margin-bottom: 0;';
        message.textContent = score < 7
          ? `Score: ${score.toFixed(1)}/10. Need at least 7.0 to pass. Keep adjusting parameters.`
          : `You've already solved this scenario with a score of ${bestScore.toFixed(1)}. Try to beat your record!`;

        feedback.append(heading, message);
        feedbackArea.appendChild(feedback);
      }
    }

    function render() {
      updateStats();
      renderScenario();
      renderParameters();
      updateResults();

      const submitBtn = document.createElement('button');
      submitBtn.className = 'btn primary';
      submitBtn.textContent = 'Submit Solution';
      submitBtn.style.marginTop = '0.75rem';
      submitBtn.style.width = '100%';
      submitBtn.addEventListener('click', submitSolution);

      resultArea.appendChild(submitBtn);
    }

    wrapper.append(title, desc, stats, scenarioCard, parameterArea, resultArea, feedbackArea, controls);
    container.appendChild(wrapper);

    render();

    return () => {};
  }
};

export default optimization;
