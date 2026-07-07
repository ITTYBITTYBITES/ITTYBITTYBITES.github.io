import type { ExperienceModule, ExperienceContext } from '../platform/types';
import { events } from '../platform/events';

interface ChainNode {
  id: string;
  text: string;
  choices: { label: string; next: string | null; explanation: string }[];
}

const CHAINS: Record<string, ChainNode> = {
  start: {
    id: 'start',
    text: 'A coastal city decides to divert its river to expand the harbor. The project is ambitious, expensive, and irreversible.',
    choices: [
      { label: 'The harbor grows rapidly, attracting merchants from distant ports', next: 'growth', explanation: 'The immediate economic benefit is undeniable.' },
      { label: 'The diverted river floods farmland upstream during the first rainy season', next: 'flood', explanation: 'Engineering solutions often create problems elsewhere in the system.' }
    ]
  },
  growth: {
    id: 'growth',
    text: "The expanded harbor becomes the region's largest trade hub. Wealth concentrates in the city.",
    choices: [
      { label: 'Neighboring towns resent the city\'s dominance and form a trade alliance against it', next: 'alliance', explanation: 'Economic inequality often produces political reaction.' },
      { label: 'The city uses its wealth to hire mercenaries and protect its position', next: 'mercenaries', explanation: 'Wealth can be converted into power, but power requires maintenance.' }
    ]
  },
  flood: {
    id: 'flood',
    text: 'Farmland is destroyed. Farmers migrate to the city, swelling the population beyond its capacity.',
    choices: [
      { label: 'The city builds walls to control the influx and protect existing residents', next: 'walls', explanation: 'Boundaries are a common response to resource pressure.' },
      { label: 'The city invests in new infrastructure to support the larger population', next: 'infrastructure', explanation: 'Crisis can drive innovation — or bankruptcy.' }
    ]
  },
  alliance: {
    id: 'alliance',
    text: 'The trade alliance routes commerce around the city. Harbor traffic declines.',
    choices: [
      { label: 'The city negotiates a treaty, sharing harbor rights for alliance membership', next: 'treaty', explanation: 'Compromise can restore what conflict destroyed.' },
      { label: 'The city launches a naval blockade against alliance ports', next: 'blockade', explanation: 'Escalation often seems like the only option to those who feel cornered.' }
    ]
  },
  mercenaries: {
    id: 'mercenaries',
    text: 'Mercenaries protect the city but demand ever-higher payment. The treasury strains.',
    choices: [
      { label: 'The city raises taxes, sparking unrest among its own merchants', next: 'unrest', explanation: 'External security purchased with internal legitimacy is a fragile trade.' },
      { label: 'The city grants mercenaries land and citizenship, integrating them into society', next: 'integration', explanation: 'Transforming outsiders into stakeholders can stabilize — or destabilize.' }
    ]
  },
  walls: {
    id: 'walls',
    text: 'The walls create two cities: one inside, protected and prosperous; one outside, desperate and excluded.',
    choices: [
      { label: 'The excluded population organizes and breaches the walls during a festival', next: 'breach', explanation: 'Exclusion breeds the very threat walls are built to prevent.' },
      { label: 'The city opens the gates and creates a new district with shared governance', next: 'district', explanation: 'Inclusion can turn a threat into a resource.' }
    ]
  },
  infrastructure: {
    id: 'infrastructure',
    text: 'New aqueducts, roads, and markets transform the city. It becomes a model others copy.',
    choices: [
      { label: 'The city becomes a center of learning, attracting scholars and inventors', next: 'learning', explanation: 'Infrastructure enables intellectual as well as economic growth.' },
      { label: 'Other cities compete by building their own infrastructure, creating a regional boom', next: 'boom', explanation: 'Innovation spreads. First movers do not always keep their advantage.' }
    ]
  },
  treaty: {
    id: 'treaty',
    text: 'The treaty restores trade but requires the city to share harbor governance. Power is distributed.',
    choices: [
      { label: 'The shared governance model proves durable and is copied by other port cities', next: 'model', explanation: 'A successful compromise can become a template.' },
      { label: 'The city secretly undermines the alliance from within, eventually dissolving it', next: 'dissolve', explanation: 'Not all treaties are made in good faith.' }
    ]
  },
  blockade: {
    id: 'blockade',
    text: 'The blockade triggers a wider war. The city wins militarily but destroys the trade it depended on.',
    choices: [
      { label: 'The city pivots to manufacturing, replacing trade with production', next: 'manufacturing', explanation: 'Necessity forces adaptation. Some adaptations succeed.' },
      { label: 'The city declines slowly, its harbor silting up from lack of maintenance', next: 'decline', explanation: 'Victory without purpose is still defeat.' }
    ]
  },
  unrest: {
    id: 'unrest',
    text: 'Merchant unrest grows into open rebellion. The mercenaries, unpaid, switch sides.',
    choices: [
      { label: 'A new merchant council takes power and dissolves the mercenary contracts', next: 'council', explanation: 'Internal revolution can correct external overreach.' },
      { label: 'Chaos allows a neighboring power to invade and occupy the city', next: 'occupation', explanation: 'Internal weakness invites external opportunism.' }
    ]
  },
  integration: {
    id: 'integration',
    text: 'Mercenaries become citizens, bringing new skills and loyalties. The city culture changes.',
    choices: [
      { label: 'The blended culture produces new art, technology, and philosophy', next: 'renaissance', explanation: 'Diversity, when integrated, can generate creativity.' },
      { label: 'Tensions between old and new citizens erupt into civil conflict', next: 'civil', explanation: 'Integration is a process, not an event. It can fail.' }
    ]
  },
  breach: {
    id: 'breach',
    text: 'The walls fall. The old order collapses. A new leader emerges from the excluded population.',
    choices: [
      { label: 'The new leader rebuilds the city with no walls, creating a more open society', next: 'open', explanation: 'Revolution can produce genuine transformation.' },
      { label: 'The new leader builds even stronger walls, this time keeping different people out', next: 'newwalls', explanation: 'Revolution often replaces one exclusion with another.' }
    ]
  },
  district: {
    id: 'district',
    text: 'The new district becomes the most vibrant part of the city. Innovation flourishes at the boundaries.',
    choices: [
      { label: 'The city becomes known for tolerance and attracts migrants from across the region', next: 'tolerance', explanation: 'Reputation compounds. Success breeds success.' },
      { label: 'Rapid growth strains resources, and old residents blame the newcomers', next: 'strain', explanation: 'Growth creates its own tensions.' }
    ]
  },
  learning: {
    id: 'learning',
    text: 'Scholars develop new methods of navigation, medicine, and record-keeping. Knowledge spreads.',
    choices: [
      { label: 'The city founds academies that outlast its political power by centuries', next: 'academies', explanation: 'Ideas can outlast institutions.' },
      { label: 'Knowledge becomes controlled by a priesthood that restricts access', next: 'priesthood', explanation: 'Power often seeks to monopolize information.' }
    ]
  },
  boom: {
    id: 'boom',
    text: 'The regional boom lifts all cities. Competition drives continuous improvement.',
    choices: [
      { label: 'Cities form a federation for mutual defense and standardization', next: 'federation', explanation: 'Competition can evolve into cooperation.' },
      { label: 'The boom creates a bubble that bursts, leaving debt and abandoned projects', next: 'bubble', explanation: 'Unchecked growth often ends in collapse.' }
    ]
  },
  model: { id: 'model', text: 'The shared governance model spreads. The region enters a long period of stability and trade.', choices: [] },
  dissolve: { id: 'dissolve', text: 'The alliance dissolves. The city regains full control but loses the trust that made trade possible.', choices: [] },
  manufacturing: { id: 'manufacturing', text: 'Manufacturing replaces trade. The city becomes an industrial center with a different kind of power.', choices: [] },
  decline: { id: 'decline', text: 'The harbor silts. The city shrinks. Centuries later, travelers wonder what great civilization once stood here.', choices: [] },
  council: { id: 'council', text: 'The merchant council creates a new constitution. The city becomes a republic governed by trade interests.', choices: [] },
  occupation: { id: 'occupation', text: 'The occupiers impose their own laws. The city loses its identity, becoming a province of a larger empire.', choices: [] },
  renaissance: { id: 'renaissance', text: 'A cultural flowering transforms the region. The city becomes remembered as a birthplace of new ideas.', choices: [] },
  civil: { id: 'civil', text: 'Civil war divides the city. Neither side wins fully. The city fragments into competing neighborhoods.', choices: [] },
  open: { id: 'open', text: 'The open city thrives for generations. Its lack of walls becomes a symbol, not a vulnerability.', choices: [] },
  newwalls: { id: 'newwalls', text: 'New walls, new exclusions. The cycle repeats. History remembers the pattern more than the names.', choices: [] },
  tolerance: { id: 'tolerance', text: 'Tolerance becomes the city\'s defining trait. It survives crises that destroy less adaptable cities.', choices: [] },
  strain: { id: 'strain', text: 'Growth without planning leads to collapse. The city survives but is diminished, its promise unfulfilled.', choices: [] },
  academies: { id: 'academies', text: 'The academies outlast empires. Long after the harbor is forgotten, students still learn what was discovered here.', choices: [] },
  priesthood: { id: 'priesthood', text: 'Knowledge controlled is knowledge stagnated. The city falls behind rivals who share information freely.', choices: [] },
  federation: { id: 'federation', text: 'The federation becomes one of history\'s most successful experiments in shared governance.', choices: [] },
  bubble: { id: 'bubble', text: 'The bubble bursts. Ruins remain as warnings to future generations about the dangers of unchecked optimism.', choices: [] }
};

const STORAGE_KEY = 'chain-reaction-progress';

function loadProgress(): { chainsCompleted: number; nodesVisited: string[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { chainsCompleted: 0, nodesVisited: [] };
}

function saveProgress(p: { chainsCompleted: number; nodesVisited: string[] }): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

const chainReaction: ExperienceModule = {
  mount(container: HTMLElement, context: ExperienceContext) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'chain-reaction';
    wrapper.style.cssText = 'padding: 1rem; max-width: 640px; margin: 0 auto;';

    let progress = loadProgress();
    let currentNodeId = 'start';
    let chain: { nodeId: string; choiceIndex: number }[] = [];

    const title = document.createElement('h2');
    title.textContent = 'Chain Reaction';

    const desc = document.createElement('p');
    desc.className = 'lead';
    desc.textContent = 'One decision opens paths no one fully foresaw. Build a chain of consequence and explore how events connect across time.';

    const stats = document.createElement('div');
    stats.className = 'chain-stats';
    stats.style.cssText = 'font-size: 0.875rem; color: GrayText; margin-bottom: 1rem;';
    stats.textContent = `Chains completed: ${progress.chainsCompleted} • Nodes visited: ${progress.nodesVisited.length}`;

    const chainDisplay = document.createElement('div');
    chainDisplay.className = 'chain-display';
    chainDisplay.style.cssText = 'display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 1rem 0; padding: 0.75rem; background: ButtonFace; border-radius: 0.5rem; font-size: 0.85rem;';

    const nodeArea = document.createElement('div');
    nodeArea.className = 'node-area';
    nodeArea.style.cssText = 'margin: 1rem 0;';

    wrapper.append(title, desc, stats, chainDisplay, nodeArea);
    container.appendChild(wrapper);

    function renderNode() {
      const node = CHAINS[currentNodeId];
      nodeArea.innerHTML = '';

      const text = document.createElement('p');
      text.style.cssText = 'line-height: 1.7; font-size: 1rem; padding: 1rem; border: 1px solid ButtonBorder; border-radius: 0.5rem; background: canvas;';
      text.textContent = node.text;
      nodeArea.appendChild(text);

      if (node.choices.length === 0) {
        // End node
        const endCard = document.createElement('div');
        endCard.style.cssText = 'margin-top: 1rem; padding: 1rem; border: 1px solid #22c55e; border-radius: 0.5rem; background: #22c55e11;';
        endCard.innerHTML = `
          <h4 style="margin-top:0;color:#16a34a;">Chain complete</h4>
          <p style="margin-bottom:0.5rem;">You made ${chain.length} decisions. Each choice opened some paths and closed others.</p>
          <p style="margin-bottom:0;font-size:0.85rem;color:GrayText;">Return and try different choices to see how the chain diverges.</p>
        `;
        nodeArea.appendChild(endCard);

        const restartBtn = document.createElement('button');
        restartBtn.className = 'btn';
        restartBtn.textContent = 'Build a new chain';
        restartBtn.style.marginTop = '1rem';
        restartBtn.addEventListener('click', () => {
          currentNodeId = 'start';
          chain = [];
          renderNode();
          updateChainDisplay();
        });
        nodeArea.appendChild(restartBtn);

        if (!progress.nodesVisited.includes(currentNodeId)) {
          progress.nodesVisited.push(currentNodeId);
        }
        progress.chainsCompleted += 1;
        saveProgress(progress);
        stats.textContent = `Chains completed: ${progress.chainsCompleted} • Nodes visited: ${progress.nodesVisited.length}`;

        events.emit('experience_interaction', {
          experience_id: context.meta.id,
          action: 'completed',
          chain_length: chain.length,
          end_node: currentNodeId
        });
        return;
      }

      const choices = document.createElement('div');
      choices.style.cssText = 'display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1rem;';

      node.choices.forEach((choice, idx) => {
        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.style.cssText = 'text-align: left; padding: 0.75rem 1rem; flex-direction: column; align-items: flex-start; gap: 0.25rem;';
        btn.innerHTML = `
          <strong>${choice.label}</strong>
          <span style="font-size:0.85rem;color:GrayText;font-weight:400;">${choice.explanation}</span>
        `;
        btn.addEventListener('click', () => {
          chain.push({ nodeId: currentNodeId, choiceIndex: idx });
          if (!progress.nodesVisited.includes(currentNodeId)) {
            progress.nodesVisited.push(currentNodeId);
          }
          currentNodeId = choice.next || currentNodeId;
          saveProgress(progress);
          renderNode();
          updateChainDisplay();

          events.emit('experience_interaction', {
            experience_id: context.meta.id,
            action: 'choice_made',
            node: chain[chain.length - 1].nodeId,
            choice: idx
          });
        });
        choices.appendChild(btn);
      });

      nodeArea.appendChild(choices);
    }

    function updateChainDisplay() {
      if (chain.length === 0) {
        chainDisplay.innerHTML = '<span style="color:GrayText;">Start building your chain…</span>';
        return;
      }
      chainDisplay.innerHTML = '';
      chain.forEach((step, idx) => {
        const node = CHAINS[step.nodeId];
        const choice = node.choices[step.choiceIndex];
        const chip = document.createElement('span');
        chip.style.cssText = 'padding: 0.25rem 0.5rem; background: ButtonFace; border: 1px solid ButtonBorder; border-radius: 999px; font-size: 0.8rem;';
        chip.textContent = `${idx + 1}. ${choice.label.substring(0, 30)}${choice.label.length > 30 ? '…' : ''}`;
        chainDisplay.appendChild(chip);
      });
    }

    renderNode();
    updateChainDisplay();

    return () => {
      // persistence handled in handlers
    };
  }
};

export default chainReaction;
