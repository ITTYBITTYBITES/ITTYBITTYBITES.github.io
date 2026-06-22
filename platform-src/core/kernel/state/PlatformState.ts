import { EventContract } from '../types/EventContract';

export interface PlatformState {
  version: string;
  timestamp: string;
  processedEventIds: Set<string>;
  lastSequenceIds: Record<string, number>;

  player: {
    id: string;
    level: number;
    xp: number;
    resources: Record<string, number>;
  };

  world: {
    entities: Record<string, any>;
    time: {
      totalElapsedMs: number;
      lastEventTimestamp: string;
    };
  };

  system: {
    eventCount: number;
    errors: Array<{ eventId: string; message: string }>;
  };
}

export const INITIAL_PLATFORM_STATE: PlatformState = {
  version: "1.0.0",
  timestamp: new Date().toISOString(),
  processedEventIds: new Set<string>(),
  lastSequenceIds: {},
  player: {
    id: "player_default",
    level: 1,
    xp: 0,
    resources: {},
  },
  world: {
    entities: {},
    time: {
      totalElapsedMs: 0,
      lastEventTimestamp: new Date().toISOString(),
    },
  },
  system: {
    eventCount: 0,
    errors: [],
  },
};
