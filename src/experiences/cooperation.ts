import type { ExperienceContext, ExperienceModule } from '../platform/types';
import { events } from '../platform/events';

const STORAGE_KEY = 'cooperation-progress';
const TOKENS_PER_ROUND = 4;
const PLAYERS = 4;

interface CooperationRound {
  id: string;
  title: string;
  description: string;
  ruleText: string;
  baseOthers: number[];
  bonusThreshold?: number;
  bonusPoints?: number;
}

interface CooperationProgress {
  sessionsCompleted: number;
  bestGroupTotal: number;
}

interface RoundResult {
  roundId: string;
  userContribution: number;
  others: number[];
  totalContribution: number;
  personalPoints: number;
  bonusEarned: number;
  groupPoints: number;
}

const ROUNDS: CooperationRound[] = [
  {
    id: 'commons',
    title: 'Round 1 — The Commons',
    description: 'Everyone gets four tokens. Kept tokens are safe. Contributed tokens go to the shared pot, double in value, and are split equally.',
    ruleText: 'No special rules. No reputation yet. Keeping feels safe.',
    baseOthers: [1, 1, 2],
  },
  {
    id: 'reputation',
    title: 'Round 2 — Reputation',
    description: 'People remember whether others carried their share. Trust is not visible, but it is already shaping expectations.',
    ruleText: 'Others adjust based on whether last round felt cooperative.',
    baseOthers: [1, 2, 2],
  },
  {
    id: 'shared-rule',
    title: 'Round 3 — Shared Rule',
    description: 'A new rule appears: if the group contributes at least 10 tokens, everyone earns a bonus.',
    ruleText: 'Hit 10 shared tokens and each player earns +2 points.',
    baseOthers: [2, 2, 2],
    bonusThreshold: 10,
    bonusPoints: 2,
  },
  {
    id: 'visible-history',
    title: 'Round 4 — Visible History',
    description: 'Now everyone can see the pattern of contribution. Trust and incentives are working together — or against each other.',
    ruleText: 'Past behavior matters more when people can see it.',
    baseOthers: [2, 3, 2],
    bonusThreshold: 10,
    bonusPoints: 2,
  },
];

function loadProgress(): CooperationProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as CooperationProgress;
    }
  } catch {
    // ignore persistence failures
  }
  return { sessionsCompleted: 0, bestGroupTotal: 0 };
}

function saveProgress(progress: CooperationProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // ignore persistence failures
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

const cooperation: ExperienceModule = {
  mount(container: HTMLElement, context: ExperienceContext) {
    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'cooperation-experience';
    wrapper.style.cssText = 'padding: 1rem; max-width: 760px; margin: 0 auto;';

    const progress = loadProgress();
    let roundIndex = 0;
    let trustLevel = 0;
    let lastContribution = 2;
    let awaitingNext = false;
    const history: RoundResult[] = [];

    const title = document.createElement('h2');
    title.textContent = 'Cooperation';

    const desc = document.createElement('p');
    desc.className = 'lead';
    desc.textContent = 'Keep your tokens or share them. Then watch how trust, rules, and incentives reshape what the group does next.';

    const stats = document.createElement('div');
    stats.style.cssText = 'font-size: 0.875rem; color: GrayText; margin-bottom: 1rem;';

    const roundCard = document.createElement('div');
    roundCard.style.cssText = 'padding: 1rem; border: 1px solid ButtonBorder; border-radius: 0.75rem; background: ButtonFace; margin-bottom: 1rem;';

    const controls = document.createElement('div');
    controls.style.cssText = 'display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem;';

    const resultArea = document.createElement('div');
    resultArea.style.cssText = 'margin-top: 1rem;';

    const timeline = document.createElement('div');
    timeline.style.cssText = 'display: grid; gap: 0.75rem; margin-top: 1rem;';

    function updateStats(): void {
      stats.textContent = `Sessions completed: ${progress.sessionsCompleted} • Best group total: ${progress.bestGroupTotal}`;
    }

    function currentRound(): CooperationRound {
      return ROUNDS[roundIndex];
    }

    function getOtherContributions(round: CooperationRound): number[] {
      const multiplier = round.id === 'visible-history' ? 2 : 1;
      const adjustment = trustLevel * multiplier;
      return round.baseOthers.map((base, index) => clamp(base + adjustment + (index === 1 && lastContribution >= 3 ? 1 : 0), 0, TOKENS_PER_ROUND));
    }

    function renderRound(): void {
      if (roundIndex >= ROUNDS.length) {
        renderSummary();
        return;
      }

      const round = currentRound();
      roundCard.innerHTML = '';
      controls.innerHTML = '';

      const heading = document.createElement('h3');
      heading.style.marginTop = '0';
      heading.textContent = round.title;

      const description = document.createElement('p');
      description.style.cssText = 'line-height: 1.6; margin-bottom: 0.5rem;';
      description.textContent = round.description;

      const rule = document.createElement('p');
      rule.style.cssText = 'margin-bottom: 0; font-size: 0.9rem; color: GrayText;';
      rule.textContent = round.ruleText;

      roundCard.append(heading, description, rule);

      const chooser = document.createElement('div');
      chooser.style.cssText = 'display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem;';
      chooser.setAttribute('aria-label', 'Contribution options');

      for (let amount = 0; amount <= TOKENS_PER_ROUND; amount += 1) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = amount >= 3 ? 'btn primary' : 'btn';
        button.textContent = `Contribute ${amount}`;
        button.addEventListener('click', () => playRound(amount));
        chooser.appendChild(button);
      }

      controls.appendChild(chooser);
      resultArea.innerHTML = '';
    }

    function playRound(userContribution: number): void {
      if (awaitingNext) {
        return;
      }
      awaitingNext = true;

      const round = currentRound();
      const others = getOtherContributions(round);
      const totalContribution = userContribution + others.reduce((sum, value) => sum + value, 0);
      const sharedPool = totalContribution * 2;
      const sharePerPlayer = sharedPool / PLAYERS;
      const bonusEarned = round.bonusThreshold && round.bonusPoints && totalContribution >= round.bonusThreshold
        ? round.bonusPoints
        : 0;
      const personalPoints = (TOKENS_PER_ROUND - userContribution) + sharePerPlayer + bonusEarned;
      const groupPoints = (PLAYERS * TOKENS_PER_ROUND - totalContribution) + sharedPool + bonusEarned * PLAYERS;

      const result: RoundResult = {
        roundId: round.id,
        userContribution,
        others,
        totalContribution,
        personalPoints: Math.round(personalPoints * 10) / 10,
        bonusEarned,
        groupPoints,
      };
      history.push(result);

      lastContribution = userContribution;
      if (userContribution >= 3) {
        trustLevel = clamp(trustLevel + 1, -2, 2);
      } else if (userContribution <= 1) {
        trustLevel = clamp(trustLevel - 1, -2, 2);
      }

      renderRoundResult(result);

      events.emit('experience_interaction', {
        experience_id: context.meta.id,
        action: 'cooperation_round_played',
        round: round.id,
        contribution: userContribution,
        total: totalContribution,
      });
    }

    function renderRoundResult(result: RoundResult): void {
      resultArea.innerHTML = '';

      const card = document.createElement('div');
      card.style.cssText = 'padding: 1rem; border: 1px solid #2563eb; border-radius: 0.75rem; background: #2563eb11;';

      const heading = document.createElement('h4');
      heading.style.cssText = 'margin-top: 0; color: #1d4ed8;';
      heading.textContent = 'Round result';

      const summary = document.createElement('p');
      summary.style.marginBottom = '0.5rem';
      summary.textContent = `You contributed ${result.userContribution}. Others contributed ${result.others.join(', ')}. The group shared ${result.totalContribution} tokens.`;

      const payout = document.createElement('p');
      payout.style.marginBottom = '0.5rem';
      payout.textContent = `You earned ${result.personalPoints} points this round. Group total: ${result.groupPoints}.`;

      const interpretation = document.createElement('p');
      interpretation.style.cssText = 'margin-bottom: 0; font-size: 0.9rem; color: GrayText;';
      if (result.bonusEarned > 0) {
        interpretation.textContent = 'The shared rule paid off. Once incentives reward the group directly, cooperation becomes easier to justify.';
      } else if (result.userContribution <= 1) {
        interpretation.textContent = 'Keeping tokens protected you immediately, but it also pulled trust downward for the next round.';
      } else {
        interpretation.textContent = 'Cooperation always asks for a leap: give up something now in hopes that others will do the same.';
      }

      const next = document.createElement('button');
      next.type = 'button';
      next.className = 'btn primary';
      next.style.marginTop = '0.75rem';
      next.textContent = roundIndex < ROUNDS.length - 1 ? 'Next Round →' : 'See the group pattern';
      next.addEventListener('click', () => {
        roundIndex += 1;
        awaitingNext = false;
        renderTimeline();
        renderRound();
      });

      card.append(heading, summary, payout, interpretation, next);
      resultArea.appendChild(card);
    }

    function renderTimeline(): void {
      timeline.innerHTML = '';
      history.forEach((result, index) => {
        const item = document.createElement('div');
        item.style.cssText = 'padding: 0.75rem; border: 1px solid ButtonBorder; border-radius: 0.75rem;';
        item.innerHTML = `
          <strong>Round ${index + 1}</strong>
          <div style="margin-top:0.35rem;font-size:0.9rem;">
            You: ${result.userContribution} • Others: ${result.others.join(', ')} • Group total: ${result.groupPoints}
          </div>
        `;
        timeline.appendChild(item);
      });
    }

    function renderSummary(): void {
      roundCard.innerHTML = '';
      controls.innerHTML = '';
      resultArea.innerHTML = '';

      const totalPersonal = history.reduce((sum, result) => sum + result.personalPoints, 0);
      const totalGroup = history.reduce((sum, result) => sum + result.groupPoints, 0);
      progress.sessionsCompleted += 1;
      progress.bestGroupTotal = Math.max(progress.bestGroupTotal, totalGroup);
      saveProgress(progress);
      updateStats();
      renderTimeline();

      const summary = document.createElement('div');
      summary.style.cssText = 'padding: 1rem; border: 1px solid #16a34a; border-radius: 0.75rem; background: #16a34a11;';

      const heading = document.createElement('h3');
      heading.style.cssText = 'margin-top: 0; color: #166534;';
      heading.textContent = 'Cooperation is valuable because it is fragile.';

      const text = document.createElement('p');
      text.textContent = `Across ${ROUNDS.length} rounds, you earned ${Math.round(totalPersonal * 10) / 10} points and the group produced ${totalGroup} points.`;

      const note = document.createElement('p');
      note.style.cssText = 'margin-bottom: 0; font-size: 0.9rem; color: GrayText;';
      note.textContent = 'When trust rises and the rules reward shared effort, groups can create more than isolated individuals can protect alone. When trust drops, keeping feels safer — even if everyone ends up with less.';

      const restart = document.createElement('button');
      restart.type = 'button';
      restart.className = 'btn primary';
      restart.style.marginTop = '0.75rem';
      restart.textContent = 'Try a different strategy';
      restart.addEventListener('click', () => {
        cooperation.mount(container, context);
      });

      summary.append(heading, text, note, restart);
      roundCard.appendChild(summary);

      events.emit('experience_interaction', {
        experience_id: context.meta.id,
        action: 'session_complete',
        group_total: totalGroup,
        personal_total: totalPersonal,
      });
    }

    updateStats();
    wrapper.append(title, desc, stats, roundCard, controls, resultArea, timeline);
    container.appendChild(wrapper);
    renderRound();

    return () => {
      // state persists intentionally
    };
  },
};

export default cooperation;
