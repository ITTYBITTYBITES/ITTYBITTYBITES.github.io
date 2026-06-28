# PLATFORM_MANIFEST.md
## Kernel Contract v1.0.0

### 1. EventContract Schema (v1.0.0)

```typescript
interface EventContract {
  eventId: string;           // UUID v4 - globally unique identifier
  sequenceId: number;        // Monotonically increasing integer (per source)
  timestamp: string;         // ISO 8601 string (UTC)
  type: string;              // Dot-notation taxonomy (see below)
  payload: Record<string, any>; // Event-specific data (immutable)
  source: string;            // Module/Game identifier that emitted the event
  metadata?: {
    version: string;         // Event schema version
    correlationId?: string;  // For tracing across systems
  };
}
```

**Validation Rules:**
- `eventId` must be unique across the entire session
- `sequenceId` must be strictly increasing per `source`
- All events are immutable once emitted

### 2. Standardized Event Taxonomy

| Category     | Examples                              | Description                              |
|--------------|---------------------------------------|------------------------------------------|
| **Lifecycle**    | `lifecycle.start`, `lifecycle.pause`, `lifecycle.resume`, `lifecycle.end` | Session and game flow control            |
| **Milestone**    | `milestone.level_up`, `milestone.achievement_unlocked`, `milestone.quest_completed` | Player progress and accomplishments      |
| **Economic**     | `economic.resource_gained`, `economic.resource_spent`, `economic.inventory_updated` | Resource and item economy                |
| **Monetization** | `monetization.purchase`, `monetization.ad_view`, `monetization.reward_claimed` | Revenue and engagement events            |
| **System**       | `system.error`, `system.heartbeat`, `system.snapshot_requested` | Platform infrastructure and diagnostics  |

### 3. PlatformState (Initial Object)

```typescript
interface PlatformState {
  version: string;                    // "1.0.0"
  timestamp: string;                  // Last state update timestamp
  processedEventIds: Set<string>;     // Deduplication store
  lastSequenceIds: Record<string, number>; // Per-source sequence tracking

  // Core domains
  player: {
    id: string;
    level: number;
    xp: number;
    resources: Record<string, number>;
  };

  world: {
    entities: Record<string, any>;    // Generic entity registry
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

const INITIAL_PLATFORM_STATE: PlatformState = {
  version: "1.0.0",
  timestamp: new Date().toISOString(),
  processedEventIds: new Set(),
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
```

**Core Invariants Enforced:**
- Reducer is the **only** place `PlatformState` is mutated
- All mutations are pure functions of `(state, event) => newState`
- Duplicate `eventId`s are silently dropped
- `sequenceId` ordering is respected for temporal calculations

---

*This document is the single source of truth for the platform kernel.*