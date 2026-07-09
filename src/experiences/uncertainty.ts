import type { ExperienceModule, ExperienceContext } from '../platform/types';
import { events } from '../platform/events';

interface Scenario {
  id: number;
  situation: string;
  options: { text: string; confidence: number; explanation: string }[];
}

const SCENARIOS: Scenario[] = [
  {
    id: 1,
    situation: 'A new bridge design has been tested in simulation 1,000 times. It failed twice under extreme wind conditions. The bridge will serve a region with moderate wind. Do you approve construction?',
    options: [
      { text: 'Approve — 99.8% success rate is excellent', confidence: 95, explanation: 'High confidence based on large sample size. The failure mode (extreme wind) is rare in the target region. This is how engineers make decisions: accept small risks when the benefit is large and the failure mode is well understood.' },
      { text: 'Delay — study the two failures more carefully', confidence: 70, explanation: 'Moderate confidence. The sample is large, but understanding why those two failed might reveal a design flaw that matters even in moderate wind. Uncertainty does not always mean stop, but it often means look closer.' },
      { text: 'Reject — any failure is unacceptable', confidence: 40, explanation: 'Low confidence in this stance. Zero-risk engineering does not exist. Every bridge, building, and vehicle carries some failure probability. The question is whether the risk is understood and acceptable, not whether it is zero.' }
    ]
  },
  {
    id: 2,
    situation: 'A medical trial shows a new treatment helps 60% of patients, compared to 50% with the standard treatment. The sample size is 200 patients. Side effects are mild but present. Do you recommend the new treatment?',
    options: [
      { text: 'Recommend — a 10% improvement is meaningful', confidence: 75, explanation: 'Moderate-to-high confidence. The effect is real but modest. With 200 patients, the result is statistically suggestive but not definitive. In medicine, a 10% improvement can save thousands of lives at scale, but more data would strengthen the recommendation.' },
      { text: 'Wait — run a larger trial first', confidence: 85, explanation: 'High confidence in the decision to wait. A larger trial would confirm whether the 10% improvement holds across diverse populations. Uncertainty here is not paranoia — it is the difference between a promising result and a proven treatment.' },
      { text: 'Reject — the side effects outweigh a 10% gain', confidence: 50, explanation: 'Low-to-moderate confidence. Without knowing the severity of side effects or the patient population, this is hard to justify. The stance might be correct for some patients but not as a general rule.' }
    ]
  },
  {
    id: 3,
    situation: 'Climate models predict a 70% chance of severe drought in your agricultural region within 20 years. The models have been wrong before, but they have also been right about other regions. What do you do?',
    options: [
      { text: 'Prepare now — shift to drought-resistant crops', confidence: 80, explanation: 'High confidence in preparation. Even if the drought does not come, drought-resistant crops are a reasonable adaptation. The cost of preparing is lower than the cost of being caught unprepared. This is how uncertainty is managed: hedge against the worst case.' },
      { text: 'Wait — 70% is not certain', confidence: 45, explanation: 'Low-to-moderate confidence. Waiting because something is not 100% certain ignores that 70% is already a strong signal. Inaction is also a decision, and it carries its own risks.' },
      { text: 'Diversify — prepare some land, keep some unchanged', confidence: 90, explanation: 'Very high confidence. Diversification is the classic response to uncertainty. It acknowledges the risk without betting everything on one outcome. This is how farmers, investors, and ecosystems survive volatility.' }
    ]
  }
];

const STORAGE_KEY = 'uncertainty-progress';

function loadProgress(): { scenarioIndex: number; choices: number[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { scenarioIndex: 0, choices: [] };
}

function saveProgress(p: { scenarioIndex: number; choices: number[] }): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

const uncertainty: ExperienceModule = {
  mount(container: HTMLElement, context: ExperienceContext) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'uncertainty';
    wrapper.style.cssText = 'padding: 1rem; max-width: 640px; margin: 0 auto;';

    let progress = loadProgress();
    let current = SCENARIOS[progress.scenarioIndex % SCENARIOS.length];
    let selected = -1;
    let revealed = false;

    const title = document.createElement('h2');
    title.textContent = 'Uncertainty';

    const desc = document.createElement('p');
    desc.className = 'lead';
    desc.textContent = 'Make decisions when the answer is not yet known. Science lives in the space between what we know and what we are still figuring out.';

    const progressEl = document.createElement('div');
    progressEl.style.cssText = 'font-size: 0.875rem; color: GrayText; margin-bottom: 1rem;';
    progressEl.textContent = `Scenario ${progress.scenarioIndex + 1}/${SCENARIOS.length}`;

    const situation = document.createElement('div');
    situation.style.cssText = 'padding: 1rem; border: 1px solid ButtonBorder; border-radius: 0.5rem; background: ButtonFace; margin: 1rem 0; line-height: 1.6;';
    situation.textContent = current.situation;

    const question = document.createElement('p');
    question.style.fontWeight = '600';
    question.style.marginTop = '1.5rem';
    question.textContent = 'What would you do?';

    const options = document.createElement('div');
    options.style.cssText = 'display: flex; flex-direction: column; gap: 0.75rem; margin: 1rem 0;';

    current.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.style.cssText = 'text-align: left; padding: 0.75rem 1rem; flex-direction: column; align-items: flex-start; gap: 0.25rem;';
      btn.innerHTML = `<strong>${opt.text}</strong><span style="font-size:0.85rem;color:GrayText;">Confidence level: ${opt.confidence}%</span>`;
      btn.addEventListener('click', () => {
        if (revealed) return;
        selected = idx;
        revealed = true;
        renderOptions();
        showResult();
        progress.choices.push(idx);
        saveProgress(progress);
        events.emit('experience_interaction', {
          experience_id: context.meta.id,
          action: 'decision_made',
          scenario_id: current.id,
          choice: idx,
          confidence: opt.confidence
        });
      });
      options.appendChild(btn);
    });

    const resultArea = document.createElement('div');
    resultArea.style.cssText = 'margin-top: 1rem;';

    const controls = document.createElement('div');
    controls.style.cssText = 'display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem;';

    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn primary';
    nextBtn.textContent = 'Next Scenario';
    nextBtn.style.display = 'none';
    nextBtn.addEventListener('click', () => {
      progress.scenarioIndex = (progress.scenarioIndex + 1) % SCENARIOS.length;
      saveProgress(progress);
      uncertainty.mount(container, context);
    });

    controls.appendChild(nextBtn);
    wrapper.append(title, desc, progressEl, situation, question, options, resultArea, controls);
    container.appendChild(wrapper);

    function renderOptions() {
      Array.from(options.children).forEach((btn, idx) => {
        const b = btn as HTMLElement;
        if (idx === selected) {
          b.style.borderColor = '#3b82f6';
          b.style.background = '#3b82f611';
        }
        b.style.opacity = '0.7';
      });
      (options.children[selected] as HTMLElement).style.opacity = '1';
    }

    function showResult() {
      const opt = current.options[selected];
      resultArea.innerHTML = `
        <div style="padding: 1rem; border: 1px solid ButtonBorder; border-radius: 0.5rem; background: canvas;">
          <h4 style="margin-top:0;">Why this matters</h4>
          <p style="margin-bottom:0.5rem;">${opt.explanation}</p>
          <p style="margin-bottom:0; font-size:0.85rem; color:GrayText;">There is no single correct answer. The goal is to understand how confidence, evidence, and consequence shape good decisions under uncertainty.</p>
        </div>
      `;
      nextBtn.style.display = 'inline-flex';
    }

    return () => {};
  }
};

export default uncertainty;
