import { GlobalEventBus } from '../kernel/bus/GlobalEventBus';
import { EventContract } from '../kernel/types/EventContract';

export class MonetizationLayer {
  private bus!: GlobalEventBus;
  private playerLevel = 1;
  private resourcesSpent = 0;

  init(bus: GlobalEventBus): void {
    this.bus = bus;
    this.bus.subscribe(this.handleEvent.bind(this));
    console.log('[MonetizationLayer] Initialized and listening');
  }

  private handleEvent(event: EventContract): void {
    if (event.type === 'milestone.level_up') {
      this.playerLevel = event.payload.newLevel ?? this.playerLevel;

      // Reward at milestone levels
      if (this.playerLevel === 5 || this.playerLevel === 10) {
        this.offerReward('milestone', this.playerLevel);
      }
    }

    if (event.type === 'community.vortex') {
      this.offerReward('spending', event.payload.amount || event.payload.value || 60);
    }

    if (event.type === 'economic.resource_spent') {
      this.resourcesSpent += event.payload.amount || 0;

      // Offer reward after significant spending
      if (this.resourcesSpent >= 50) {
        this.offerReward('spending', this.resourcesSpent);
        this.resourcesSpent = 0; // reset counter
      }
    }
  }

  private offerReward(trigger: string, value: number): void {
    const rewardEvent: EventContract = {
      eventId: crypto.randomUUID(),
      sequenceId: Date.now(), // simple sequencing for system events
      timestamp: new Date().toISOString(),
      type: 'system.reward_offered',
      payload: {
        trigger,
        value,
        rewardType: trigger === 'milestone' ? 'premium_currency' : 'bonus_pack',
      },
      source: 'monetization-layer',
      metadata: {
        version: '1.0.0',
      },
    };

    console.log(`[MonetizationLayer] Emitting reward offer: ${trigger} @ ${value}`);
    this.bus.emit(rewardEvent);
  }

  destroy(): void {
    // In a real implementation we would unsubscribe, but GlobalEventBus
    // currently doesn't expose per-listener removal for simplicity.
    console.log('[MonetizationLayer] Destroyed');
  }
}
