import type { ExperienceModule, ExperienceContext } from '../platform/types';
import { events } from '../platform/events';

interface Dataset {
  id: number;
  description: string;
  data: number[];
  hasTrend: boolean;
  trendDirection: 'up' | 'down' | 'none';
  explanation: string;
}

function generateData(hasTrend: boolean, direction: 'up' | 'down'): number[] {
  const points: number[] = [];
  let base = 50;
  for (let i = 0; i < 20; i++) {
    const noise = (Math.random() - 0.5) * 30;
    if (hasTrend) {
      base += direction === 'up' ? 1.5 : -1.5;
    }
    points.push(Math.round(base + noise));
  }
  return points;
}

const DATASETS: Dataset[] = [
  {
    id: 1,
    description: 'Daily rainfall (mm) over 20 days in a coastal town.',
    data: [],
    hasTrend: true,
    trendDirection: 'up',
    explanation: 'There is a real upward trend. The town is entering its rainy season, and total precipitation is increasing even though individual days vary widely.'
  },
  {
    id: 2,
    description: 'Test scores of 20 students who all studied the same material.',
    data: [],
    hasTrend: false,
    trendDirection: 'none',
    explanation: 'No real trend exists. The variation is natural — some students perform better than others for many reasons. Seeing a pattern here would be imagining order where there is only noise.'
  },
  {
    id: 3,
    description: 'Average daily temperature over 20 days in early autumn.',
    data: [],
    hasTrend: true,
    trendDirection: 'down',
    explanation: 'There is a real downward trend. Autumn cooling is gradual but consistent. The day-to-day noise makes it harder to see, but the underlying pattern is real.'
  }
];

// Generate data on first use
DATASETS.forEach(d => {
  d.data = generateData(d.hasTrend, (d.hasTrend ? d.trendDirection : 'up') as 'up' | 'down');
});

const STORAGE_KEY = 'signal-in-data-progress';

function loadProgress(): { datasetIndex: number; correct: number; total: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { datasetIndex: 0, correct: 0, total: 0 };
}

function saveProgress(p: { datasetIndex: number; correct: number; total: number }): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

const signalInData: ExperienceModule = {
  mount(container: HTMLElement, context: ExperienceContext) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'signal-in-data';
    wrapper.style.cssText = 'padding: 1rem; max-width: 640px; margin: 0 auto;';

    let progress = loadProgress();
    let current = DATASETS[progress.datasetIndex % DATASETS.length];
    let guessedTrend: 'up' | 'down' | 'none' | null = null;
    let submitted = false;

    const title = document.createElement('h2');
    title.textContent = 'Signal in Data';

    const desc = document.createElement('p');
    desc.className = 'lead';
    desc.textContent = 'Data is noisy. The pattern you see might be real, or it might be a trick of randomness. Learn to tell the difference.';

    const stats = document.createElement('div');
    stats.className = 'signal-stats';
    stats.style.cssText = 'font-size: 0.875rem; color: GrayText; margin-bottom: 1rem;';
    updateStats();

    const dataDesc = document.createElement('p');
    dataDesc.style.fontStyle = 'italic';
    dataDesc.textContent = current.description;

    const canvas = document.createElement('canvas');
    canvas.width = 560;
    canvas.height = 240;
    canvas.style.cssText = 'width:100%;max-width:560px;height:auto;border:1px solid ButtonBorder;border-radius:0.25rem;background:canvas;display:block;margin:1rem 0;';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', `Chart showing ${current.description}`);

    const ctx = canvas.getContext('2d')!;
    drawChart(ctx, current.data);

    const question = document.createElement('p');
    question.style.fontWeight = '600';
    question.textContent = 'What trend do you see?';

    const choices = document.createElement('div');
    choices.style.cssText = 'display: flex; gap: 0.5rem; flex-wrap: wrap; margin: 1rem 0;';

    const trendOptions: { label: string; value: 'up' | 'down' | 'none' }[] = [
      { label: 'Upward trend', value: 'up' },
      { label: 'Downward trend', value: 'down' },
      { label: 'No clear trend', value: 'none' }
    ];

    trendOptions.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.textContent = opt.label;
      btn.addEventListener('click', () => {
        if (submitted) return;
        guessedTrend = opt.value;
        Array.from(choices.children).forEach(c => {
          (c as HTMLElement).style.borderColor = 'ButtonBorder';
        });
        btn.style.borderColor = 'AccentColor';
      });
      choices.appendChild(btn);
    });

    const resultArea = document.createElement('div');
    resultArea.style.cssText = 'margin-top: 1rem;';

    const controls = document.createElement('div');
    controls.style.cssText = 'display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem;';

    const submitBtn = document.createElement('button');
    submitBtn.className = 'btn primary';
    submitBtn.textContent = 'Submit Judgment';
    submitBtn.addEventListener('click', () => {
      if (submitted || !guessedTrend) return;
      submitted = true;
      const isCorrect = guessedTrend === current.trendDirection;
      progress.total += 1;
      if (isCorrect) progress.correct += 1;
      saveProgress(progress);
      updateStats();

      resultArea.innerHTML = `
        <div style="padding: 1rem; border: 1px solid ${isCorrect ? '#22c55e' : '#ef4444'}; border-radius: 0.5rem; background: ${isCorrect ? '#22c55e11' : '#ef444411'};">
          <h4 style="margin-top:0;">${isCorrect ? 'Correct judgment' : 'Missed the signal'}</h4>
          <p style="margin-bottom:0; font-size:0.9rem;">${current.explanation}</p>
        </div>
      `;
      submitBtn.style.display = 'none';
      nextBtn.style.display = 'inline-flex';

      events.emit('experience_interaction', {
        experience_id: context.meta.id,
        action: isCorrect ? 'correct_signal' : 'missed_signal',
        dataset_id: current.id
      });
    });

    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn';
    nextBtn.textContent = 'Next Dataset';
    nextBtn.style.display = 'none';
    nextBtn.addEventListener('click', () => {
      progress.datasetIndex = (progress.datasetIndex + 1) % DATASETS.length;
      saveProgress(progress);
      signalInData.mount(container, context);
    });

    controls.append(submitBtn, nextBtn);
    wrapper.append(title, desc, stats, dataDesc, canvas, question, choices, resultArea, controls);
    container.appendChild(wrapper);

    function drawChart(ctx: CanvasRenderingContext2D, data: number[]) {
      const w = canvas.width;
      const h = canvas.height;
      const pad = 40;
      const chartW = w - pad * 2;
      const chartH = h - pad * 2;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = getComputedStyle(canvas).backgroundColor || '#fff';
      ctx.fillRect(0, 0, w, h);

      const min = Math.min(...data) - 5;
      const max = Math.max(...data) + 5;
      const range = max - min;

      // Grid
      ctx.strokeStyle = '#ccc';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = pad + (chartH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(pad, y);
        ctx.lineTo(w - pad, y);
        ctx.stroke();
      }

      // Bars
      const barW = chartW / data.length * 0.7;
      const gap = chartW / data.length * 0.3;

      data.forEach((val, i) => {
        const x = pad + i * (barW + gap) + gap / 2;
        const barH = ((val - min) / range) * chartH;
        const y = pad + chartH - barH;

        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(x, y, barW, barH);
      });

      // Labels
      ctx.fillStyle = '#666';
      ctx.font = '12px sans-serif';
      ctx.fillText('Day', w / 2 - 10, h - 8);
      ctx.save();
      ctx.translate(12, h / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('Value', 0, 0);
      ctx.restore();
    }

    function updateStats() {
      const accuracy = progress.total > 0 ? Math.round((progress.correct / progress.total) * 100) : 0;
      stats.textContent = `Datasets: ${progress.datasetIndex + 1}/${DATASETS.length} • Accuracy: ${accuracy}%`;
    }

    return () => {};
  }
};

export default signalInData;
