import { GlobalEventBus } from '../../core/kernel/bus/GlobalEventBus';

export interface GamePlugin {
  readonly id: string;
  readonly source: string;

  initialize(bus: GlobalEventBus): void;
  destroy?(): void;
}
