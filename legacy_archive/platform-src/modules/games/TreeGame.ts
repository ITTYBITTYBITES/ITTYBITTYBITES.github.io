import { GlobalEventBus } from '../../core/kernel/bus/GlobalEventBus';
import { EventContract } from '../../core/kernel/types/EventContract';

let sequenceCounter = 0;

function generateEventId(): string {
  return 'evt-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
}

export class TreeGame {
  private bus: GlobalEventBus;
  private source = 'tree-game';

  constructor(bus: GlobalEventBus) {
    this.bus = bus;
  }

  // Public API for the game
  levelUp(newLevel: number, xpGained: number = 100): void {
    const event: EventContract = {
      eventId: generateEventId(),
      sequenceId: ++sequenceCounter,
      timestamp: new Date().toISOString(),
      type: 'milestone.level_up',
      payload: {
        newLevel,
        xp: xpGained,
      },
      source: this.source,
      metadata: {
        version: '1.0.0',
      },
    };

    console.log(`[TreeGame] Emitting milestone.level_up → level ${newLevel}`);
    this.bus.emit(event);
  }
}
