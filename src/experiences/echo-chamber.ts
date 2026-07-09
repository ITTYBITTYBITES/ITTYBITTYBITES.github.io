import type { ExperienceModule, ExperienceContext } from '../platform/types';
import { events } from '../platform/events';

interface EchoEntry {
  text: string;
  timestamp: number;
  echoes: number;
}

const ECHOES_KEY = 'echo-chamber-entries';

function loadEchoes(): EchoEntry[] {
  try {
    const raw = localStorage.getItem(ECHOES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEchoes(entries: EchoEntry[]): void {
  try {
    localStorage.setItem(ECHOES_KEY, JSON.stringify(entries));
  } catch {
    // storage unavailable — graceful degradation
  }
}

function evolveText(text: string): string {
  const variations = [
    text,
    text + " — and again.",
    "You said: " + text,
    text.split('').reverse().join(''),
    text + " (still listening)"
  ];
  return variations[Math.floor(Math.random() * variations.length)];
}

const echoChamber: ExperienceModule = {
  mount(container: HTMLElement, context: ExperienceContext) {
    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'echo-chamber';

    const title = document.createElement('h2');
    title.textContent = 'Echo Chamber';

    const subtitle = document.createElement('p');
    subtitle.className = 'lead';
    subtitle.textContent = 'Speak. Listen. Return. Your words become part of something that evolves.';

    const input = document.createElement('textarea');
    input.placeholder = 'Type something worth returning to...';
    input.rows = 3;
    input.className = 'echo-input';

    const speakBtn = document.createElement('button');
    speakBtn.textContent = 'Speak into the chamber';
    speakBtn.className = 'btn primary';

    const history = document.createElement('div');
    history.className = 'echo-history';

    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear echoes';
    clearBtn.className = 'btn subtle';

    wrapper.appendChild(title);
    wrapper.appendChild(subtitle);
    wrapper.appendChild(input);
    wrapper.appendChild(speakBtn);
    wrapper.appendChild(history);
    wrapper.appendChild(clearBtn);

    container.appendChild(wrapper);

    let echoes: EchoEntry[] = loadEchoes();

    function renderHistory() {
      history.innerHTML = '';

      if (echoes.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'muted';
        empty.textContent = 'The chamber is quiet. Speak first.';
        history.appendChild(empty);
        return;
      }

      const list = document.createElement('ul');
      list.className = 'echo-list';

      echoes.slice().reverse().forEach((entry) => {
        const li = document.createElement('li');
        li.className = 'echo-entry';

        const time = new Date(entry.timestamp).toLocaleTimeString([], { 
          hour: '2-digit', minute: '2-digit' 
        });

        const textEl = document.createElement('div');
        textEl.className = 'echo-text';
        textEl.textContent = entry.text;

        const meta = document.createElement('div');
        meta.className = 'echo-meta';
        meta.textContent = `${time} • echoed ${entry.echoes} time${entry.echoes === 1 ? '' : 's'}`;

        li.appendChild(textEl);
        li.appendChild(meta);
        list.appendChild(li);
      });

      history.appendChild(list);
    }

    function addEcho(text: string) {
      if (!text.trim()) return;

      const evolved = evolveText(text.trim());

      const existing = echoes.find(e => e.text === evolved);
      if (existing) {
        existing.echoes += 1;
        existing.timestamp = Date.now();
      } else {
        echoes.push({
          text: evolved,
          timestamp: Date.now(),
          echoes: 1
        });
      }

      if (echoes.length > 12) echoes = echoes.slice(-12);

      saveEchoes(echoes);
      renderHistory();

      events.emit('experience_interaction', {
        experience_id: context.meta.id,
        action: 'echo_created',
        count: echoes.length
      });

      input.value = '';
    }

    speakBtn.addEventListener('click', () => {
      addEcho(input.value);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        addEcho(input.value);
      }
    });

    clearBtn.addEventListener('click', () => {
      echoes = [];
      saveEchoes(echoes);
      renderHistory();
      events.emit('experience_interaction', {
        experience_id: context.meta.id,
        action: 'chamber_cleared'
      });
    });

    renderHistory();

    return () => {
      // intentional persistence of echoes across sessions
    };
  }
};

export default echoChamber;
