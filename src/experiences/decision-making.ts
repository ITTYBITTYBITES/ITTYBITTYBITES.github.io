import type { ExperienceContext, ExperienceModule } from '../platform/types';
import { events } from '../platform/events';

const STORAGE_KEY = 'decision-making-progress';
const REVEAL_LIMIT = 2;

interface BriefingCard {
  id: string;
  label: string;
  text: string;
}

interface DecisionOption {
  id: string;
  title: string;
  summary: string;
  consequence: string;
}

interface DecisionScenario {
  id: string;
  title: string;
  prompt: string;
  briefings: BriefingCard[];
  options: DecisionOption[];
  closing: string;
}

interface DecisionProgress {
  sessionsCompleted: number;
  scenariosCompleted: number;
}

const SCENARIOS: DecisionScenario[] = [
  {
    id: 'festival',
    title: 'Neighborhood Festival',
    prompt: 'A major outdoor festival starts in six hours. You cannot learn everything before you choose. Reveal two briefing cards, then decide.',
    briefings: [
      { id: 'forecast', label: 'Forecast', text: 'The storm may miss the city entirely, but wind gusts are becoming more likely by evening.' },
      { id: 'venue', label: 'Indoor Hall', text: 'A backup hall is available, but it holds only half the planned crowd.' },
      { id: 'vendors', label: 'Vendors', text: 'Food vendors already paid for outdoor equipment and will lose money if the event is postponed.' },
      { id: 'transit', label: 'Transit', text: 'Late buses are expected if the weather turns, making departure harder for families and older visitors.' },
    ],
    options: [
      {
        id: 'outdoors',
        title: 'Keep the event outdoors',
        summary: 'Prioritizes attendance and vendor revenue.',
        consequence: 'This choice protects the original plan but accepts more safety risk if the storm arrives.',
      },
      {
        id: 'indoors',
        title: 'Move indoors',
        summary: 'Prioritizes safety and predictability.',
        consequence: 'This choice protects people from weather but leaves less room and disappoints some vendors and guests.',
      },
      {
        id: 'postpone',
        title: 'Postpone the festival',
        summary: 'Prioritizes flexibility for a cleaner decision later.',
        consequence: 'This choice avoids immediate weather risk but creates financial and scheduling costs right away.',
      },
    ],
    closing: 'No option removes all cost. Human decisions often mean choosing which downside is easiest to live with.',
  },
  {
    id: 'library-budget',
    title: 'Library Budget Cut',
    prompt: 'Your town library lost a portion of its budget. You can only uncover two facts before deciding where to protect service.',
    briefings: [
      { id: 'teens', label: 'Youth Demand', text: 'After-school attendance has doubled this year, especially on weekdays between 3 and 6 PM.' },
      { id: 'roof', label: 'Building Risk', text: 'A roof repair can wait a few months, but delay increases the chance of an expensive leak in winter.' },
      { id: 'seniors', label: 'Older Patrons', text: 'Homebound patrons rely on the outreach van because many cannot drive to the building.' },
      { id: 'grants', label: 'Grant Chance', text: 'A state grant might cover technology purchases next season, but it is not guaranteed.' },
    ],
    options: [
      {
        id: 'hours',
        title: 'Protect after-school hours',
        summary: 'Prioritizes daily access for students and families.',
        consequence: 'This choice helps the busiest users now but leaves less room for maintenance or outreach coverage.',
      },
      {
        id: 'maintenance',
        title: 'Protect building repair funds',
        summary: 'Prioritizes long-term reliability.',
        consequence: 'This choice reduces future risk but cuts into visible service in the short term.',
      },
      {
        id: 'outreach',
        title: 'Protect the outreach van',
        summary: 'Prioritizes equitable access for patrons who cannot easily visit in person.',
        consequence: 'This choice preserves access for vulnerable users but may force cuts elsewhere that more people feel immediately.',
      },
    ],
    closing: 'Good decisions are not only about numbers. They also depend on who bears the consequence when resources are limited.',
  },
  {
    id: 'intersection',
    title: 'Busy Intersection',
    prompt: 'A dangerous intersection near a school needs action. You may reveal only two briefings before choosing a path forward.',
    briefings: [
      { id: 'accidents', label: 'Accident Pattern', text: 'Most crashes happen at dusk, and most involve turning drivers who do not see people crossing.' },
      { id: 'grant', label: 'Funding Window', text: 'A grant for a full traffic signal may open next spring, but there is no guarantee your city will win it.' },
      { id: 'businesses', label: 'Local Shops', text: 'Nearby shops worry that a long construction project could sharply reduce foot traffic.' },
      { id: 'students', label: 'School Route', text: 'Children use the crossing daily, especially during sports practice when the sun is low.' },
    ],
    options: [
      {
        id: 'quick-fix',
        title: 'Install paint, signs, and flexible posts now',
        summary: 'Prioritizes speed and lower cost.',
        consequence: 'This choice acts immediately, but the safety improvement may be partial rather than transformative.',
      },
      {
        id: 'full-signal',
        title: 'Wait and pursue a full traffic signal',
        summary: 'Prioritizes the strongest long-term fix.',
        consequence: 'This choice could solve the problem more fully later, but it leaves the current danger in place while funding remains uncertain.',
      },
      {
        id: 'temporary-closure',
        title: 'Close one turning lane during key hours',
        summary: 'Prioritizes immediate safety during the riskiest times.',
        consequence: 'This choice reduces exposure quickly but creates inconvenience and pushback from drivers and businesses.',
      },
    ],
    closing: 'Under uncertainty, choosing is not just about evidence. It is also about timing, values, and what kinds of risk feel acceptable.',
  },
];

function loadProgress(): DecisionProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as DecisionProgress;
    }
  } catch {
    // ignore persistence failures
  }
  return { sessionsCompleted: 0, scenariosCompleted: 0 };
}

function saveProgress(progress: DecisionProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // ignore persistence failures
  }
}

const decisionMaking: ExperienceModule = {
  mount(container: HTMLElement, context: ExperienceContext) {
    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'decision-making-experience';
    wrapper.style.cssText = 'padding: 1rem; max-width: 760px; margin: 0 auto;';

    const progress = loadProgress();
    let scenarioIndex = 0;
    let revealedCards = new Set<string>();
    let finished = false;

    const title = document.createElement('h2');
    title.textContent = 'Decision Making';

    const desc = document.createElement('p');
    desc.className = 'lead';
    desc.textContent = 'Reveal only part of the picture, then choose anyway. Real decisions rarely wait for complete information.';

    const stats = document.createElement('div');
    stats.style.cssText = 'font-size: 0.875rem; color: GrayText; margin-bottom: 1rem;';

    const scenarioCard = document.createElement('div');
    scenarioCard.style.cssText = 'padding: 1rem; border: 1px solid ButtonBorder; border-radius: 0.75rem; background: ButtonFace; margin-bottom: 1rem;';

    const briefingArea = document.createElement('div');
    briefingArea.style.cssText = 'display: grid; gap: 0.75rem; margin-top: 1rem;';

    const optionsArea = document.createElement('div');
    optionsArea.style.cssText = 'display: grid; gap: 0.75rem; margin-top: 1rem;';

    const resultArea = document.createElement('div');
    resultArea.style.cssText = 'margin-top: 1rem;';

    function updateStats(): void {
      stats.textContent = `Scenarios completed: ${progress.scenariosCompleted} • Full sessions: ${progress.sessionsCompleted}`;
    }

    function currentScenario(): DecisionScenario {
      return SCENARIOS[scenarioIndex];
    }

    function renderScenario(): void {
      if (finished) {
        renderSummary();
        return;
      }

      const scenario = currentScenario();
      scenarioCard.innerHTML = '';
      briefingArea.innerHTML = '';
      optionsArea.innerHTML = '';
      resultArea.innerHTML = '';

      const label = document.createElement('div');
      label.style.cssText = 'font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.06em; color: GrayText; margin-bottom: 0.5rem;';
      label.textContent = `Scenario ${scenarioIndex + 1} of ${SCENARIOS.length}`;

      const heading = document.createElement('h3');
      heading.style.marginTop = '0';
      heading.textContent = scenario.title;

      const prompt = document.createElement('p');
      prompt.style.cssText = 'margin-bottom: 0; line-height: 1.6;';
      prompt.textContent = scenario.prompt;

      scenarioCard.append(label, heading, prompt);

      const briefingHeading = document.createElement('h4');
      briefingHeading.textContent = `Reveal up to ${REVEAL_LIMIT} briefing cards`;
      briefingHeading.style.marginBottom = '0.5rem';
      briefingArea.appendChild(briefingHeading);

      scenario.briefings.forEach((briefing) => {
        const revealed = revealedCards.has(briefing.id);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn';
        button.style.cssText = 'text-align: left; justify-content: flex-start; white-space: normal; padding: 0.85rem;';
        button.disabled = !revealed && revealedCards.size >= REVEAL_LIMIT;
        button.textContent = revealed ? `${briefing.label}: ${briefing.text}` : `Reveal: ${briefing.label}`;
        if (revealed) {
          button.style.borderColor = '#2563eb';
          button.style.background = '#2563eb11';
        }
        button.addEventListener('click', () => {
          if (revealedCards.size >= REVEAL_LIMIT || revealed) {
            return;
          }
          revealedCards = new Set([...revealedCards, briefing.id]);
          renderScenario();
          events.emit('experience_interaction', {
            experience_id: context.meta.id,
            action: 'briefing_revealed',
            scenario: scenario.id,
            briefing: briefing.id,
          });
        });
        briefingArea.appendChild(button);
      });

      const note = document.createElement('p');
      note.style.cssText = 'margin-top: 0.5rem; margin-bottom: 0; font-size: 0.9rem; color: GrayText;';
      note.textContent = `${revealedCards.size}/${REVEAL_LIMIT} cards revealed.`;
      briefingArea.appendChild(note);

      const optionsHeading = document.createElement('h4');
      optionsHeading.textContent = 'Choose a path';
      optionsHeading.style.marginBottom = '0.5rem';
      optionsArea.appendChild(optionsHeading);

      scenario.options.forEach((option) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn';
        button.style.cssText = 'text-align: left; justify-content: flex-start; white-space: normal; padding: 0.85rem;';
        button.disabled = revealedCards.size < REVEAL_LIMIT;
        button.innerHTML = `<strong>${option.title}</strong><span style="display:block;font-size:0.9rem;color:GrayText;margin-top:0.25rem;">${option.summary}</span>`;
        button.addEventListener('click', () => handleChoice(option.id));
        optionsArea.appendChild(button);
      });
    }

    function handleChoice(optionId: string): void {
      const scenario = currentScenario();
      const option = scenario.options.find((entry) => entry.id === optionId);
      if (!option) {
        return;
      }

      progress.scenariosCompleted += 1;
      saveProgress(progress);
      updateStats();

      resultArea.innerHTML = '';
      const card = document.createElement('div');
      card.style.cssText = 'padding: 1rem; border: 1px solid #7c3aed; border-radius: 0.75rem; background: #7c3aed11;';

      const heading = document.createElement('h4');
      heading.style.cssText = 'margin-top: 0; color: #6d28d9;';
      heading.textContent = option.title;

      const explanation = document.createElement('p');
      explanation.style.marginBottom = '0.5rem';
      explanation.textContent = option.consequence;

      const hiddenInfo = document.createElement('div');
      hiddenInfo.style.cssText = 'display: grid; gap: 0.5rem; margin: 0.75rem 0;';

      scenario.briefings.forEach((briefing) => {
        const item = document.createElement('div');
        const seen = revealedCards.has(briefing.id);
        item.style.cssText = `padding: 0.75rem; border: 1px solid ${seen ? '#2563eb' : '#b45309'}; border-radius: 0.5rem; background: ${seen ? '#2563eb11' : '#b4530911'};`;
        item.innerHTML = `<strong>${seen ? 'Seen' : 'Unseen'} — ${briefing.label}</strong><div style="margin-top:0.35rem; font-size:0.9rem;">${briefing.text}</div>`;
        hiddenInfo.appendChild(item);
      });

      const closing = document.createElement('p');
      closing.style.cssText = 'margin-bottom: 0; font-size: 0.9rem; color: GrayText;';
      closing.textContent = scenario.closing;

      const next = document.createElement('button');
      next.type = 'button';
      next.className = 'btn primary';
      next.style.marginTop = '0.75rem';
      next.textContent = scenarioIndex < SCENARIOS.length - 1 ? 'Next Decision →' : 'What this teaches';
      next.addEventListener('click', () => {
        if (scenarioIndex < SCENARIOS.length - 1) {
          scenarioIndex += 1;
          revealedCards = new Set<string>();
          renderScenario();
        } else {
          finished = true;
          progress.sessionsCompleted += 1;
          saveProgress(progress);
          updateStats();
          renderSummary();
        }
      });

      card.append(heading, explanation, hiddenInfo, closing, next);
      resultArea.appendChild(card);

      optionsArea.querySelectorAll('button').forEach((button) => {
        (button as HTMLButtonElement).disabled = true;
      });
      briefingArea.querySelectorAll('button').forEach((button) => {
        (button as HTMLButtonElement).disabled = true;
      });

      events.emit('experience_interaction', {
        experience_id: context.meta.id,
        action: 'decision_made',
        scenario: scenario.id,
        option: option.id,
        revealed: Array.from(revealedCards),
      });
    }

    function renderSummary(): void {
      scenarioCard.innerHTML = '';
      briefingArea.innerHTML = '';
      optionsArea.innerHTML = '';
      resultArea.innerHTML = '';

      const summary = document.createElement('div');
      summary.style.cssText = 'padding: 1rem; border: 1px solid #16a34a; border-radius: 0.75rem; background: #16a34a11;';

      const heading = document.createElement('h3');
      heading.style.cssText = 'margin-top: 0; color: #166534;';
      heading.textContent = 'Decisions are shaped before the choice itself.';

      const text = document.createElement('p');
      text.textContent = 'What you know, what you do not know, what you value, and what consequences you fear all shape the path that feels reasonable. Choosing under uncertainty is not a bug in human life. It is the default condition.';

      const note = document.createElement('p');
      note.style.cssText = 'margin-bottom: 0; font-size: 0.9rem; color: GrayText;';
      note.textContent = 'Return and reveal different briefing cards. A different slice of information can make a different trade-off feel wise.';

      const restart = document.createElement('button');
      restart.type = 'button';
      restart.className = 'btn primary';
      restart.style.marginTop = '0.75rem';
      restart.textContent = 'Try the dilemmas again';
      restart.addEventListener('click', () => {
        decisionMaking.mount(container, context);
      });

      summary.append(heading, text, note, restart);
      resultArea.appendChild(summary);

      events.emit('experience_interaction', {
        experience_id: context.meta.id,
        action: 'session_complete',
        total_scenarios: SCENARIOS.length,
      });
    }

    updateStats();
    wrapper.append(title, desc, stats, scenarioCard, briefingArea, optionsArea, resultArea);
    container.appendChild(wrapper);
    renderScenario();

    return () => {
      // state persists intentionally
    };
  },
};

export default decisionMaking;
