import type { ExperienceModule, ExperienceContext } from '../platform/types';
import { events } from '../platform/events';

interface Evidence {
  id: string;
  text: string;
  relevant: boolean;
  points_to?: string;
}

interface Hypothesis {
  id: string;
  description: string;
  correct: boolean;
}

interface Case {
  id: string;
  title: string;
  scenario: string;
  evidence: Evidence[];
  hypotheses: Hypothesis[];
}

const CASES: Case[] = [
  {
    id: 'server-crash',
    title: 'Server Outage',
    scenario: 'A production server crashed at 3:47 AM. The on-call engineer restarted it, but you need to find the root cause to prevent recurrence.',
    evidence: [
      { id: 'e1', text: 'Memory usage was at 94% before the crash', relevant: true, points_to: 'memory-leak' },
      { id: 'e2', text: 'CPU usage spiked to 99% in the final minute', relevant: true, points_to: 'memory-leak' },
      { id: 'e3', text: 'A new version was deployed at 2:00 PM the previous day', relevant: true, points_to: 'memory-leak' },
      { id: 'e4', text: 'The server room temperature was 72°F', relevant: false },
      { id: 'e5', text: 'Network latency increased by 200ms before the crash', relevant: true, points_to: 'memory-leak' },
      { id: 'e6', text: 'The server had been running for 47 days', relevant: false },
      { id: 'e7', text: 'Application logs show "OutOfMemoryError" repeatedly', relevant: true, points_to: 'memory-leak' },
      { id: 'e8', text: 'Disk I/O was normal throughout', relevant: false }
    ],
    hypotheses: [
      { id: 'memory-leak', description: 'Memory leak in the new code deployment', correct: true },
      { id: 'hardware-failure', description: 'Hardware failure in RAM modules', correct: false },
      { id: 'ddos-attack', description: 'DDoS attack from external source', correct: false },
      { id: 'database-issue', description: 'Database connection pool exhaustion', correct: false }
    ]
  },
  {
    id: 'performance-degradation',
    title: 'Website Slowdown',
    scenario: 'Users report the website has been getting slower over the past week. Page load times went from 2 seconds to 8 seconds.',
    evidence: [
      { id: 'e1', text: 'Database query times increased 300% over the week', relevant: true, points_to: 'missing-index' },
      { id: 'e2', text: 'A marketing campaign started 8 days ago', relevant: true, points_to: 'missing-index' },
      { id: 'e3', text: 'New feature added user profile pictures', relevant: false },
      { id: 'e4', text: 'The "users" table grew from 10K to 500K rows', relevant: true, points_to: 'missing-index' },
      { id: 'e5', text: 'CDN cache hit ratio dropped from 95% to 60%', relevant: true, points_to: 'missing-index' },
      { id: 'e6', text: 'Server CPU usage is at 45%', relevant: false },
      { id: 'e7', text: 'Slow query log shows queries taking 5-10 seconds', relevant: true, points_to: 'missing-index' },
      { id: 'e8', text: 'Network bandwidth is only at 30% capacity', relevant: false }
    ],
    hypotheses: [
      { id: 'missing-index', description: 'Missing database index on frequently queried columns', correct: true },
      { id: 'server-overload', description: 'Server hardware cannot handle the traffic', correct: false },
      { id: 'cdn-misconfiguration', description: 'CDN configuration error', correct: false },
      { id: 'dns-issue', description: 'DNS resolution delays', correct: false }
    ]
  },
  {
    id: 'data-corruption',
    title: 'Corrupted Records',
    scenario: 'Customer reports show 15% of orders from last month have incorrect total amounts. The finance team cannot reconcile accounts.',
    evidence: [
      { id: 'e1', text: 'All affected orders used the new payment gateway', relevant: true, points_to: 'currency-conversion' },
      { id: 'e2', text: 'Orders with discounts are more likely to be wrong', relevant: true, points_to: 'currency-conversion' },
      { id: 'e3', text: 'The payment gateway handles currency conversion', relevant: true, points_to: 'currency-conversion' },
      { id: 'e4', text: 'Orders paid with credit cards are unaffected', relevant: true, points_to: 'currency-conversion' },
      { id: 'e5', text: 'The warehouse team reported no issues', relevant: false },
      { id: 'e6', text: 'Error amounts are always off by exchange rate factors', relevant: true, points_to: 'currency-conversion' },
      { id: 'e7', text: 'The old payment gateway is still running in parallel', relevant: false },
      { id: 'e8', text: 'Discount calculation happens before payment processing', relevant: true, points_to: 'currency-conversion' }
    ],
    hypotheses: [
      { id: 'currency-conversion', description: 'Currency conversion applied twice to discounted amounts', correct: true },
      { id: 'database-corruption', description: 'Database table corruption in orders table', correct: false },
      { id: 'race-condition', description: 'Race condition in concurrent order processing', correct: false },
      { id: 'rounding-error', description: 'Floating point rounding errors', correct: false }
    ]
  },
  {
    id: 'api-timeouts',
    title: 'API Timeouts',
    scenario: 'Third-party integrations are failing. Your API calls to external services are timing out after 30 seconds, but only for some customers.',
    evidence: [
      { id: 'e1', text: 'Affected customers are on the East Coast', relevant: true, points_to: 'regional-outage' },
      { id: 'e2', text: 'Your API server is in US-West', relevant: true, points_to: 'regional-outage' },
      { id: 'e3', text: 'The external service status page shows "degraded performance"', relevant: true, points_to: 'regional-outage' },
      { id: 'e4', text: 'West Coast customers are unaffected', relevant: true, points_to: 'regional-outage' },
      { id: 'e5', text: 'Your API code has not changed in 2 weeks', relevant: false },
      { id: 'e6', text: 'East Coast traffic routes through a different data center', relevant: true, points_to: 'regional-outage' },
      { id: 'e7', text: 'API request payloads are larger than usual', relevant: false },
      { id: 'e8', text: 'The external service has a regional outage in US-East', relevant: true, points_to: 'regional-outage' }
    ],
    hypotheses: [
      { id: 'regional-outage', description: 'External service regional outage in US-East', correct: true },
      { id: 'network-firewall', description: 'Network firewall blocking East Coast traffic', correct: false },
      { id: 'rate-limiting', description: 'API rate limiting triggered by heavy usage', correct: false },
      { id: 'dns-routing', description: 'DNS routing sending traffic to wrong endpoint', correct: false }
    ]
  },
  {
    id: 'security-breach',
    title: 'Unauthorized Access',
    scenario: 'Security logs show unauthorized access to admin accounts. The access came from legitimate credentials but unusual behavior patterns.',
    evidence: [
      { id: 'e1', text: 'Admin passwords were reused across multiple sites', relevant: true, points_to: 'credential-stuffing' },
      { id: 'e2', text: 'A data breach at a popular social media site occurred last week', relevant: true, points_to: 'credential-stuffing' },
      { id: 'e3', text: 'Access attempts came from 50 different IP addresses', relevant: true, points_to: 'credential-stuffing' },
      { id: 'e4', text: 'The admin panel has no 2FA requirement', relevant: true, points_to: 'credential-stuffing' },
      { id: 'e5', text: 'Server firewall rules have not changed', relevant: false },
      { id: 'e6', text: 'Login attempts happened at 3 AM on a Saturday', relevant: false },
      { id: 'e7', text: 'Successful logins used correct passwords for each account', relevant: true, points_to: 'credential-stuffing' },
      { id: 'e8', text: 'Admin emails were not phished recently', relevant: true, points_to: 'credential-stuffing' }
    ],
    hypotheses: [
      { id: 'credential-stuffing', description: 'Credential stuffing attack using passwords from other breaches', correct: true },
      { id: 'phishing-attack', description: 'Phishing attack targeting admin users', correct: false },
      { id: 'insider-threat', description: 'Disgruntled employee with access', correct: false },
      { id: 'sql-injection', description: 'SQL injection bypassing authentication', correct: false }
    ]
  }
];

const STORAGE_KEY = 'failure-analysis-progress';

function loadProgress(): { solved: string[]; evidenceCollected: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { solved: [], evidenceCollected: 0 };
}

function saveProgress(p: { solved: string[]; evidenceCollected: number }): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

const failureAnalysis: ExperienceModule = {
  mount(container: HTMLElement, context: ExperienceContext) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'failure-analysis';
    wrapper.style.cssText = 'padding: 1rem; max-width: 640px; margin: 0 auto;';

    let progress = loadProgress();
    let currentCaseIdx = 0;
    // Find first unsolved case
    for (let i = 0; i < CASES.length; i++) {
      if (!progress.solved.includes(CASES[i].id)) {
        currentCaseIdx = i;
        break;
      }
    }

    let collectedEvidence: string[] = [];
    let selectedHypothesis: string | null = null;

    const title = document.createElement('h2');
    title.textContent = 'Failure Analysis';

    const desc = document.createElement('p');
    desc.className = 'lead';
    desc.textContent = 'Investigate failures. Examine evidence. Eliminate impossible causes. Find the root cause.';

    const stats = document.createElement('div');
    stats.style.cssText = 'font-size: 0.875rem; color: GrayText; margin-bottom: 1rem;';

    const caseCard = document.createElement('div');
    caseCard.style.cssText = 'padding: 1rem; border: 2px solid ButtonBorder; border-radius: 0.5rem; background: ButtonFace; margin: 1rem 0;';

    const evidenceArea = document.createElement('div');
    evidenceArea.style.cssText = 'margin: 1rem 0;';

    const hypothesisArea = document.createElement('div');
    hypothesisArea.style.cssText = 'margin: 1rem 0;';

    const resultArea = document.createElement('div');
    resultArea.style.cssText = 'margin-top: 1rem;';

    const controls = document.createElement('div');
    controls.style.cssText = 'display: flex; gap: 0.5rem; margin-top: 1rem;';

    function updateStats() {
      stats.textContent = `Cases solved: ${progress.solved.length}/${CASES.length} • Evidence collected: ${progress.evidenceCollected}`;
    }

    function renderCase() {
      const currentCase = CASES[currentCaseIdx];
      caseCard.innerHTML = '';

      const caseTitle = document.createElement('h3');
      caseTitle.style.marginTop = '0';
      caseTitle.textContent = currentCase.title;

      const scenario = document.createElement('p');
      scenario.style.cssText = 'line-height: 1.6; margin-bottom: 0; font-style: italic;';
      scenario.textContent = currentCase.scenario;

      caseCard.append(caseTitle, scenario);
    }

    function renderEvidence() {
      const currentCase = CASES[currentCaseIdx];
      evidenceArea.innerHTML = '';

      const heading = document.createElement('h4');
      heading.style.cssText = 'margin-bottom: 0.75rem;';
      heading.textContent = 'Evidence';

      evidenceArea.appendChild(heading);

      const evidenceGrid = document.createElement('div');
      evidenceGrid.style.cssText = 'display: grid; gap: 0.5rem;';

      currentCase.evidence.forEach(ev => {
        const evidenceItem = document.createElement('div');
        const isCollected = collectedEvidence.includes(ev.id);
        evidenceItem.style.cssText = `padding: 0.75rem; border: 1px solid ${isCollected ? '#3b82f6' : 'ButtonBorder'}; border-radius: 0.25rem; cursor: pointer; background: ${isCollected ? '#3b82f611' : 'ButtonFace'};`;

        const text = document.createElement('div');
        text.style.cssText = 'line-height: 1.4;';
        text.textContent = ev.text;

        if (isCollected) {
          const badge = document.createElement('span');
          badge.style.cssText = 'display: inline-block; margin-top: 0.25rem; font-size: 0.75rem; color: #3b82f6; font-weight: 600;';
          badge.textContent = '✓ Collected';
          evidenceItem.append(text, badge);
        } else {
          evidenceItem.appendChild(text);
          evidenceItem.addEventListener('click', () => {
            collectedEvidence.push(ev.id);
            progress.evidenceCollected++;
            saveProgress(progress);
            updateStats();
            renderEvidence();

            events.emit('experience_interaction', {
              experience_id: context.meta.id,
              action: 'evidence_collected',
              case_id: currentCase.id,
              evidence_id: ev.id
            });
          });
        }

        evidenceGrid.appendChild(evidenceItem);
      });

      evidenceArea.appendChild(evidenceGrid);
    }

    function renderHypotheses() {
      const currentCase = CASES[currentCaseIdx];
      hypothesisArea.innerHTML = '';

      const heading = document.createElement('h4');
      heading.style.cssText = 'margin-bottom: 0.75rem;';
      heading.textContent = 'Hypotheses';

      hypothesisArea.appendChild(heading);

      const hypothesisList = document.createElement('div');
      hypothesisList.style.cssText = 'display: grid; gap: 0.5rem;';

      currentCase.hypotheses.forEach(hyp => {
        const hypothesisItem = document.createElement('button');
        hypothesisItem.className = 'btn';
        const isSelected = selectedHypothesis === hyp.id;
        hypothesisItem.style.cssText = `text-align: left; padding: 0.75rem; border: 2px solid ${isSelected ? '#22c55e' : 'ButtonBorder'}; background: ${isSelected ? '#22c55e11' : 'ButtonFace'};`;

        hypothesisItem.textContent = hyp.description;

        hypothesisItem.addEventListener('click', () => {
          selectedHypothesis = hyp.id;
          renderHypotheses();
          renderControls();
        });

        hypothesisList.appendChild(hypothesisItem);
      });

      hypothesisArea.appendChild(hypothesisList);
    }

    function renderControls() {
      controls.innerHTML = '';

      if (selectedHypothesis) {
        const submitBtn = document.createElement('button');
        submitBtn.className = 'btn primary';
        submitBtn.textContent = 'Submit Analysis';
        submitBtn.addEventListener('click', submitAnalysis);
        controls.appendChild(submitBtn);
      }
    }

    function submitAnalysis() {
      const currentCase = CASES[currentCaseIdx];
      const selected = currentCase.hypotheses.find(h => h.id === selectedHypothesis);

      if (!selected) return;

      resultArea.innerHTML = '';

      const relevantEvidence = currentCase.evidence.filter(e => e.relevant);
      const collectedRelevant = collectedEvidence.filter(id => relevantEvidence.some(e => e.id === id));
      const evidenceScore = relevantEvidence.length > 0 ? (collectedRelevant.length / relevantEvidence.length) * 100 : 0;

      if (selected.correct) {
        const result = document.createElement('div');
        result.style.cssText = 'padding: 1rem; border: 2px solid #22c55e; border-radius: 0.5rem; background: #22c55e11;';

        const heading = document.createElement('h4');
        heading.style.cssText = 'margin-top: 0; color: #16a34a;';
        heading.textContent = '✓ Root Cause Identified';

        const message = document.createElement('p');
        message.style.cssText = 'margin-bottom: 0.5rem;';
        message.textContent = selected.description;

        const evidenceSummary = document.createElement('p');
        evidenceSummary.style.cssText = 'margin-bottom: 0; font-size: 0.875rem; color: GrayText;';
        evidenceSummary.textContent = `You collected ${collectedRelevant.length}/${relevantEvidence.length} relevant pieces of evidence (${Math.round(evidenceScore)}%)`;

        result.append(heading, message, evidenceSummary);
        resultArea.appendChild(result);

        if (!progress.solved.includes(currentCase.id)) {
          progress.solved.push(currentCase.id);
          saveProgress(progress);
          updateStats();

          events.emit('experience_interaction', {
            experience_id: context.meta.id,
            action: 'case_solved',
            case_id: currentCase.id,
            evidence_score: Math.round(evidenceScore)
          });
        }

        controls.innerHTML = '';
        if (progress.solved.length < CASES.length) {
          const nextBtn = document.createElement('button');
          nextBtn.className = 'btn primary';
          nextBtn.textContent = 'Next Case →';
          nextBtn.addEventListener('click', () => {
            currentCaseIdx = (currentCaseIdx + 1) % CASES.length;
            collectedEvidence = [];
            selectedHypothesis = null;
            resultArea.innerHTML = '';
            controls.innerHTML = '';
            render();
          });
          controls.appendChild(nextBtn);
        }
      } else {
        const result = document.createElement('div');
        result.style.cssText = 'padding: 1rem; border: 2px solid #ef4444; border-radius: 0.5rem; background: #ef444411;';

        const heading = document.createElement('h4');
        heading.style.cssText = 'margin-top: 0; color: #dc2626;';
        heading.textContent = '✗ Incorrect Root Cause';

        const message = document.createElement('p');
        message.style.cssText = 'margin-bottom: 0;';
        message.textContent = 'This hypothesis does not match the evidence. Review the clues and try again.';

        result.append(heading, message);
        resultArea.appendChild(result);

        const retryBtn = document.createElement('button');
        retryBtn.className = 'btn';
        retryBtn.textContent = 'Try Again';
        retryBtn.style.marginTop = '0.5rem';
        retryBtn.addEventListener('click', () => {
          selectedHypothesis = null;
          resultArea.innerHTML = '';
          renderHypotheses();
          renderControls();
        });
        controls.appendChild(retryBtn);
      }
    }

    function render() {
      updateStats();
      renderCase();
      renderEvidence();
      renderHypotheses();
      renderControls();
    }

    wrapper.append(title, desc, stats, caseCard, evidenceArea, hypothesisArea, resultArea, controls);
    container.appendChild(wrapper);

    render();

    return () => {};
  }
};

export default failureAnalysis;
