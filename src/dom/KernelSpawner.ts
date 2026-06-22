import type { EventContract } from '../kernel';

export class KernelSpawner {
  private count = 0;

  constructor(private zone: HTMLElement) {}

  handle(event: EventContract): void {
    const mapped = this.mapEvent(event);
    if (!mapped) return;
    this.spawn(mapped.title, mapped.copy, mapped.tone);
  }

  spawn(title: string, copy: string, tone: 'cyan' | 'gold' | 'green' | 'pink' = 'cyan'): void {
    this.count += 1;
    const card = document.createElement('article');
    card.className = `kernel-spawn-card kernel-spawn-card--${tone}`;
    card.innerHTML = `
      <div class="kernel-spawn-card__meta">Spawn #${this.count}</div>
      <h3>${title}</h3>
      <p>${copy}</p>
    `;
    this.zone.prepend(card);
    while (this.zone.children.length > 8) this.zone.lastElementChild?.remove();
  }

  private mapEvent(event: EventContract): { title: string; copy: string; tone?: 'cyan' | 'gold' | 'green' | 'pink' } | null {
    if (event.type === 'lifecycle.start') return { title: 'Kernel online', copy: 'The homepage event bus is active and broadcasting.', tone: 'green' };
    if (event.type === 'milestone.level_up') return { title: `Level ${event.payload.newLevel || '?'}`, copy: 'A milestone event spawned a new homepage artifact.', tone: 'gold' };
    if (event.type === 'economic.resource_gained') return { title: 'Resource gained', copy: `${event.payload.amount || 0} ${event.payload.resource || 'resource'} added to the living site state.`, tone: 'cyan' };
    if (event.type === 'system.reward_offered') return { title: 'Reward offered', copy: `Reward type: ${event.payload.rewardType || 'bonus'}.`, tone: 'pink' };
    if (event.type === 'system.heartbeat') return { title: 'Heartbeat', copy: 'The site emitted a periodic health signal.', tone: 'green' };
    return null;
  }
}
