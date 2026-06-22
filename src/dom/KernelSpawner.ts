import type { EventContract } from '../kernel';

type Tone = 'cyan' | 'gold' | 'green' | 'pink';

type SpawnTemplate = {
  eyebrow: string;
  title: string;
  copy: string;
  icon: string;
  tone: Tone;
  stat?: string;
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
  }[char] || char));
}

export class KernelSpawner {
  private count = 0;

  constructor(private zone: HTMLElement) {}

  handle(event: EventContract): void {
    const template = this.mapEvent(event);
    if (!template) return;
    this.spawn(template);
  }

  spawn(template: SpawnTemplate): void {
    this.count += 1;
    this.zone.querySelector('.kernel-canvas-empty')?.remove();

    const card = document.createElement('article');
    card.className = `kernel-spawn-card kernel-spawn-card--${template.tone}`;
    card.dataset.spawnIndex = String(this.count);
    card.innerHTML = `
      <div class="kernel-spawn-card__glow" aria-hidden="true"></div>
      <div class="kernel-spawn-card__topline">
        <span class="kernel-spawn-card__icon" aria-hidden="true">${escapeHtml(template.icon)}</span>
        <span class="kernel-spawn-card__eyebrow">${escapeHtml(template.eyebrow)}</span>
      </div>
      <h3>${escapeHtml(template.title)}</h3>
      <p>${escapeHtml(template.copy)}</p>
      ${template.stat ? `<strong class="kernel-spawn-card__stat">${escapeHtml(template.stat)}</strong>` : ''}
    `;

    this.zone.prepend(card);
    while (this.zone.children.length > 6) this.zone.lastElementChild?.remove();
  }

  private mapEvent(event: EventContract): SpawnTemplate | null {
    if (event.type === 'milestone.level_up') {
      const level = event.payload.newLevel || '?';
      return {
        eyebrow: 'Achievement unlocked',
        title: `Studio Level ${level}`,
        copy: 'The hub powered up and unlocked a brighter signal tier.',
        icon: '🏆',
        tone: 'gold',
        stat: `Level ${level}`,
      };
    }

    if (event.type === 'economic.resource_gained') {
      const amount = event.payload.amount || 0;
      const resource = event.payload.resource || 'bytes';
      return {
        eyebrow: 'Resource cache',
        title: `${amount} ${resource} collected`,
        copy: 'A fresh cache was added to the living site economy.',
        icon: '✦',
        tone: 'cyan',
        stat: `+${amount}`,
      };
    }

    if (event.type === 'system.reward_offered') {
      return {
        eyebrow: 'Reward drop',
        title: 'Bonus ready',
        copy: 'The reward layer detected a qualifying action and staged a studio bonus.',
        icon: '🎁',
        tone: 'pink',
        stat: event.payload.rewardType || 'Bonus',
      };
    }

    return null;
  }
}
