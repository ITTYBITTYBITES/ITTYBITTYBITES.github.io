import type { ExperienceModule, ExperienceContext } from '../platform/types';
import { events } from '../platform/events';

interface SystemState {
  value: number;
  target: number;
  velocity: number;
}

interface Challenge {
  id: string;
  name: string;
  target: number;
  initial: number;
  disturbance: number;
  description: string;
  tolerance: number;
}

const CHALLENGES: Challenge[] = [
  {
    id: 'thermostat',
    name: 'Room Temperature',
    target: 22,
    initial: 15,
    disturbance: 0.5,
    description: 'Heat a room to 22°C. The room loses heat to the outside.',
    tolerance: 0.5
  },
  {
    id: 'cruise',
    name: 'Cruise Control',
    target: 100,
    initial: 0,
    disturbance: 2,
    description: 'Accelerate a car to 100 km/h. Hills and wind create resistance.',
    tolerance: 2
  },
  {
    id: 'water',
    name: 'Water Level',
    target: 50,
    initial: 0,
    disturbance: 1,
    description: 'Fill a tank to 50L. Water leaks from the bottom.',
    tolerance: 1
  },
  {
    id: 'balance',
    name: 'Inverted Pendulum',
    target: 0,
    initial: 10,
    disturbance: 0.3,
    description: 'Balance a pole upright. Gravity pulls it down.',
    tolerance: 0.5
  },
  {
    id: 'inventory',
    name: 'Inventory Control',
    target: 100,
    initial: 30,
    disturbance: 5,
    description: 'Maintain inventory at 100 units. Customers buy 5 units per cycle.',
    tolerance: 10
  }
];

const STORAGE_KEY = 'feedback-loop-progress';

function loadProgress(): { stabilized: string[]; attempts: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { stabilized: [], attempts: 0 };
}

function saveProgress(p: { stabilized: string[]; attempts: number }): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

const feedbackLoop: ExperienceModule = {
  mount(container: HTMLElement, context: ExperienceContext) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'feedback-loop';
    wrapper.style.cssText = 'padding: 1rem; max-width: 640px; margin: 0 auto;';

    let progress = loadProgress();
    let currentChallengeIdx = 0;
    // Find first unstabilized challenge
    for (let i = 0; i < CHALLENGES.length; i++) {
      if (!progress.stabilized.includes(CHALLENGES[i].id)) {
        currentChallengeIdx = i;
        break;
      }
    }

    let gain = 0.5;
    let damping = 0.3;
    let running = false;
    let animationId = 0;
    let history: number[] = [];
    let stableCount = 0;

    const title = document.createElement('h2');
    title.textContent = 'Feedback Loop';

    const desc = document.createElement('p');
    desc.className = 'lead';
    desc.textContent = 'Stabilize a system by tuning feedback. Too much correction causes oscillation. Too little lets drift grow.';

    const stats = document.createElement('div');
    stats.style.cssText = 'font-size: 0.875rem; color: GrayText; margin-bottom: 1rem;';

    const challengeCard = document.createElement('div');
    challengeCard.style.cssText = 'padding: 1rem; border: 2px solid ButtonBorder; border-radius: 0.5rem; background: ButtonFace; margin: 1rem 0;';

    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 200;
    canvas.style.cssText = 'width: 100%; max-width: 600px; height: auto; border: 1px solid ButtonBorder; border-radius: 0.5rem; background: ButtonFace;';

    const controls = document.createElement('div');
    controls.style.cssText = 'margin: 1rem 0;';

    const statusArea = document.createElement('div');
    statusArea.style.cssText = 'margin: 1rem 0; padding: 0.75rem; border-radius: 0.5rem; font-weight: 600; text-align: center;';

    const actionButtons = document.createElement('div');
    actionButtons.style.cssText = 'display: flex; gap: 0.5rem; margin-top: 1rem;';

    function updateStats() {
      stats.textContent = `Systems stabilized: ${progress.stabilized.length}/${CHALLENGES.length} • Attempts: ${progress.attempts}`;
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

      const target = document.createElement('div');
      target.style.cssText = 'font-size: 0.9rem; margin-top: 0.75rem;';
      target.innerHTML = `<strong>Target:</strong> ${challenge.target} • <strong>Start:</strong> ${challenge.initial}`;

      challengeCard.append(name, description, target);
    }

    function renderControls() {
      controls.innerHTML = '';

      const gainSection = document.createElement('div');
      gainSection.style.cssText = 'margin-bottom: 1rem;';

      const gainLabel = document.createElement('label');
      gainLabel.style.cssText = 'display: block; margin-bottom: 0.5rem; font-weight: 600;';
      gainLabel.textContent = `Feedback Gain: ${gain.toFixed(2)}`;

      const gainSlider = document.createElement('input');
      gainSlider.type = 'range';
      gainSlider.min = '0';
      gainSlider.max = '2';
      gainSlider.step = '0.05';
      gainSlider.value = String(gain);
      gainSlider.style.cssText = 'width: 100%;';
      gainSlider.addEventListener('input', () => {
        gain = parseFloat(gainSlider.value);
        gainLabel.textContent = `Feedback Gain: ${gain.toFixed(2)}`;
      });

      gainSection.append(gainLabel, gainSlider);

      const dampingSection = document.createElement('div');
      dampingSection.style.cssText = 'margin-bottom: 1rem;';

      const dampingLabel = document.createElement('label');
      dampingLabel.style.cssText = 'display: block; margin-bottom: 0.5rem; font-weight: 600;';
      dampingLabel.textContent = `Damping: ${damping.toFixed(2)}`;

      const dampingSlider = document.createElement('input');
      dampingSlider.type = 'range';
      dampingSlider.min = '0';
      dampingSlider.max = '1';
      dampingSlider.step = '0.05';
      dampingSlider.value = String(damping);
      dampingSlider.style.cssText = 'width: 100%;';
      dampingSlider.addEventListener('input', () => {
        damping = parseFloat(dampingSlider.value);
        dampingLabel.textContent = `Damping: ${damping.toFixed(2)}`;
      });

      dampingSection.append(dampingLabel, dampingSlider);

      controls.append(gainSection, dampingSection);
    }

    function simulate(state: SystemState, challenge: Challenge): SystemState {
      const error = challenge.target - state.value;
      const correction = error * gain;
      const disturbance = (Math.random() - 0.5) * challenge.disturbance;
      const dampingForce = -state.velocity * damping;

      const newVelocity = state.velocity + correction + disturbance + dampingForce;
      const newValue = state.value + newVelocity * 0.1;

      return { value: newValue, target: challenge.target, velocity: newVelocity };
    }

    function drawGraph(challenge: Challenge) {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = getComputedStyle(canvas).getPropertyValue('background-color') || '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw target line
      const targetY = canvas.height - ((challenge.target / (challenge.target * 2)) * canvas.height);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, targetY);
      ctx.lineTo(canvas.width, targetY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw history
      if (history.length > 0) {
        ctx.strokeStyle = 'AccentColor';
        ctx.lineWidth = 2;
        ctx.beginPath();

        const maxVal = Math.max(challenge.target * 2, ...history.map(Math.abs));
        history.forEach((val, idx) => {
          const x = (idx / 200) * canvas.width;
          const y = canvas.height - ((val / maxVal) * canvas.height * 0.8 + canvas.height * 0.1);
          if (idx === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
      }
    }

    function startSimulation() {
      const challenge = CHALLENGES[currentChallengeIdx];
      let state: SystemState = { value: challenge.initial, target: challenge.target, velocity: 0 };
      history = [state.value];
      stableCount = 0;
      running = true;

      function step() {
        if (!running) return;

        state = simulate(state, challenge);
        history.push(state.value);
        if (history.length > 200) history.shift();

        const withinTolerance = Math.abs(state.value - challenge.target) < challenge.tolerance;
        if (withinTolerance) {
          stableCount++;
        } else {
          stableCount = 0;
        }

        drawGraph(challenge);

        if (stableCount >= 50) {
          running = false;
          showStabilized();
        } else {
          animationId = requestAnimationFrame(step);
        }
      }

      step();
    }

    function showStabilized() {
      const challenge = CHALLENGES[currentChallengeIdx];
      statusArea.style.cssText = 'margin: 1rem 0; padding: 0.75rem; border-radius: 0.5rem; font-weight: 600; text-align: center; background: #22c55e11; color: #16a34a; border: 2px solid #22c55e;';
      statusArea.textContent = `System stabilized at ${challenge.target}`;

      if (!progress.stabilized.includes(challenge.id)) {
        progress.stabilized.push(challenge.id);
        saveProgress(progress);
        updateStats();

        events.emit('experience_interaction', {
          experience_id: context.meta.id,
          action: 'system_stabilized',
          challenge: challenge.id,
          gain: gain,
          damping: damping
        });
      }

      actionButtons.innerHTML = '';
      if (progress.stabilized.length < CHALLENGES.length) {
        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn';
        nextBtn.textContent = 'Next System';
        nextBtn.addEventListener('click', () => {
          currentChallengeIdx = (currentChallengeIdx + 1) % CHALLENGES.length;
          statusArea.style.cssText = 'margin: 1rem 0; padding: 0.75rem; border-radius: 0.5rem; font-weight: 600; text-align: center;';
          render();
        });
        actionButtons.appendChild(nextBtn);
      }
    }

    function render() {
      updateStats();
      renderChallenge();
      renderControls();

      history = [];
      statusArea.style.cssText = 'margin: 1rem 0; padding: 0.75rem; border-radius: 0.5rem; font-weight: 600; text-align: center;';
      statusArea.textContent = 'Adjust parameters and run the simulation';

      actionButtons.innerHTML = '';
      const runBtn = document.createElement('button');
      runBtn.className = 'btn primary';
      runBtn.textContent = 'Run Simulation';
      runBtn.style.flex = '1';
      runBtn.addEventListener('click', () => {
        progress.attempts++;
        saveProgress(progress);
        updateStats();
        startSimulation();
      });
      actionButtons.appendChild(runBtn);

      drawGraph(CHALLENGES[currentChallengeIdx]);
    }

    wrapper.append(title, desc, stats, challengeCard, canvas, controls, statusArea, actionButtons);
    container.appendChild(wrapper);

    render();

    return () => {
      running = false;
      cancelAnimationFrame(animationId);
    };
  }
};

export default feedbackLoop;
