import type { ExperienceModule, ExperienceContext } from '../platform/types';
import { events } from '../platform/events';

interface Rule {
  id: number;
  type: string;
  value: number;
}

const PatternGarden: ExperienceModule = {
  mount(container: HTMLElement, context: ExperienceContext) {
    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'pattern-garden';
    wrapper.style.cssText = 'padding: 1rem; font-family: system-ui; max-width: 620px;';

    let rules: Rule[] = [];
    let running = false;
    let interval: any = null;

    const title = document.createElement('h2');
    title.textContent = 'Pattern Garden';
    title.style.marginBottom = '0.5rem';

    const desc = document.createElement('p');
    desc.textContent = 'Define simple rules. Watch emergent patterns grow.';
    desc.style.fontSize = '0.9rem';
    desc.style.opacity = '0.8';

    const canvas = document.createElement('canvas');
    canvas.width = 520;
    canvas.height = 260;
    canvas.style.border = '1px solid #ccc';
    canvas.style.borderRadius = '6px';
    canvas.style.background = '#f8f8f8';
    canvas.style.display = 'block';
    canvas.style.margin = '1rem 0';

    const ctx = canvas.getContext('2d')!;

    const controls = document.createElement('div');
    controls.style.display = 'flex';
    controls.style.gap = '8px';
    controls.style.flexWrap = 'wrap';

    const addRuleBtn = document.createElement('button');
    addRuleBtn.textContent = '+ Add Rule';
    addRuleBtn.onclick = () => {
      rules.push({ id: Date.now(), type: 'grow', value: Math.random() * 2 + 0.5 });
      render();
    };

    const runBtn = document.createElement('button');
    runBtn.textContent = '▶ Run';
    runBtn.onclick = () => {
      if (running) {
        clearInterval(interval);
        running = false;
        runBtn.textContent = '▶ Run';
      } else {
        running = true;
        runBtn.textContent = '⏸ Pause';
        interval = setInterval(step, 180);
      }
    };

    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset';
    resetBtn.onclick = () => {
      if (running) {
        clearInterval(interval);
        running = false;
        runBtn.textContent = '▶ Run';
      }
      rules = [];
      render();
    };

    const status = document.createElement('div');
    status.style.fontSize = '0.8rem';
    status.style.marginTop = '0.5rem';
    status.style.opacity = '0.7';

    controls.append(addRuleBtn, runBtn, resetBtn);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#222';
      ctx.font = '13px monospace';

      const cellSize = 12;
      const cols = Math.floor(canvas.width / cellSize);
      const rows = Math.floor(canvas.height / cellSize);

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          let active = (x + y) % 3 === 0;
          rules.forEach((r) => {
            if (r.type === 'grow') {
              active = active || ((x * r.value + y) % 5 < 1.5);
            }
          });
          if (active) {
            ctx.fillRect(x * cellSize + 1, y * cellSize + 1, cellSize - 2, cellSize - 2);
          }
        }
      }

      ctx.fillStyle = '#666';
      ctx.fillText(`${rules.length} rule${rules.length === 1 ? '' : 's'} • ${running ? 'running' : 'paused'}`, 10, canvas.height - 8);
      status.textContent = `${rules.length} rules active`;
    };

    const step = () => {
      rules = rules.map(r => ({
        ...r,
        value: Math.max(0.3, Math.min(3, r.value + (Math.random() - 0.5) * 0.2))
      }));
      render();
      events.emit('experience_interaction', {
        experience_id: context.meta.id,
        action: 'pattern_step',
        rules: rules.length
      });
    };

    setTimeout(() => {
      if (rules.length === 0) {
        rules = [
          { id: 1, type: 'grow', value: 1.2 },
          { id: 2, type: 'grow', value: 0.8 }
        ];
        render();
      }
    }, 120);

    wrapper.append(title, desc, canvas, controls, status);
    container.appendChild(wrapper);

    setTimeout(render, 50);

    return () => {
      if (interval) clearInterval(interval);
      container.innerHTML = '';
    };
  }
};

export default PatternGarden;
