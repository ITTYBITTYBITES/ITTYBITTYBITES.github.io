import { GlobalEventBus } from '../../core/kernel/bus/GlobalEventBus';
import { EventContract } from '../../core/kernel/types/EventContract';

export class RewardBanner {
  public readonly id = 'reward-banner';
  private container: HTMLElement | null = null;
  private bus!: GlobalEventBus;
  private currentReward: any = null;

  constructor(bus: GlobalEventBus) {
    this.bus = bus;
    this.bus.subscribe(this.handleEvent.bind(this));
  }

  private handleEvent(event: EventContract): void {
    if (event.type === 'system.reward_offered') {
      this.showBanner(event.payload);
    }
  }

  private showBanner(payload: any): void {
    if (this.container) {
      this.container.remove();
    }

    this.currentReward = payload;

    this.container = document.createElement('div');
    this.container.style.cssText = `
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: white;
      padding: 20px 32px;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 20px;
      font-family: system-ui, sans-serif;
    `;

    this.container.innerHTML = `
      <div>
        <div style="font-weight: 700; font-size: 1.1rem;">🎁 Reward Available!</div>
        <div style="opacity: 0.9; font-size: 0.95rem;">
          ${payload.trigger} reward: ${payload.rewardType}
        </div>
      </div>
      <button id="claim-btn" style="
        background: white; 
        color: #d97706; 
        border: none; 
        padding: 10px 24px; 
        border-radius: 9999px; 
        font-weight: 700;
        cursor: pointer;
      ">Claim Reward</button>
    `;

    document.body.appendChild(this.container);

    const claimBtn = this.container.querySelector('#claim-btn')!;
    claimBtn.addEventListener('click', () => this.claimReward());
  }

  private claimReward(): void {
    if (!this.currentReward || !this.container) return;

    const claimEvent: EventContract = {
      eventId: crypto.randomUUID(),
      sequenceId: Date.now(),
      timestamp: new Date().toISOString(),
      type: 'economic.reward_claimed',
      payload: {
        rewardType: this.currentReward.rewardType,
        trigger: this.currentReward.trigger,
      },
      source: 'reward-banner',
    };

    this.bus.emit(claimEvent);

    // Remove banner
    this.container.remove();
    this.container = null;
    this.currentReward = null;

    console.log('[RewardBanner] Reward claimed!');
  }

  // For registry compatibility
  onStateChange(): void {
    // This banner reacts to events, not full state
  }
}
