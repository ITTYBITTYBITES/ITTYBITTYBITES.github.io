# GamePlugin Specification v1.0.0

## Overview

This document defines the contract that every game module must follow to remain compliant with the Platform Kernel.

All games are treated as **pure event emitters**. They must never read or mutate `PlatformState` directly.

---

## Core Rules

1. **Games only emit events** via the `GlobalEventBus`.
2. **Games must never import or reference** `PlatformState`, `PlatformReducer`, or any visual components.
3. **Every event must conform** to the `EventContract` schema defined in `PLATFORM_MANIFEST.md`.
4. **Games must increment `sequenceId`** per source (recommended: maintain a local counter).
5. **Games should use a unique `source` identifier** (e.g., `"resource-collector"`).

---

## Required Interface

Every game module **must** export a class that implements the following interface:

```typescript
interface GamePlugin {
  readonly id: string;
  readonly source: string;
  
  // Called once when the game is mounted
  initialize(bus: GlobalEventBus): void;

  // Optional: Cleanup when game is unmounted
  destroy?(): void;
}
```

---

## Recommended Pattern

```typescript
import { GlobalEventBus } from '../core/kernel/bus/GlobalEventBus';
import { EventContract } from '../core/kernel/types/EventContract';

export class ResourceCollector implements GamePlugin {
  readonly id = 'resource-collector';
  readonly source = 'resource-collector';

  private bus!: GlobalEventBus;
  private sequence = 0;

  initialize(bus: GlobalEventBus): void {
    this.bus = bus;
    // Game-specific setup (UI, timers, etc.)
  }

  // Example helper
  private emit(type: string, payload: Record<string, any>) {
    const event: EventContract = {
      eventId: crypto.randomUUID(),
      sequenceId: ++this.sequence,
      timestamp: new Date().toISOString(),
      type,
      payload,
      source: this.source,
    };
    this.bus.emit(event);
  }

  // Public game actions
  collectResource(resource: string, amount: number) {
    this.emit('economic.resource_gained', { resource, amount });
  }
}
```

---

## Allowed Event Categories

Games should primarily emit:

- `milestone.*`
- `economic.*`
- `lifecycle.*`
- `monetization.*`

System events (`system.*`) are reserved for the kernel.

---

## Versioning

- This specification is versioned independently of the kernel.
- Breaking changes to this contract will increment the major version.

---

*This document is the single source of truth for all future game modules.*