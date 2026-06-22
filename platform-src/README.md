# 🌱 Kernel Platform Manifesto

> *"A deterministic, event-driven foundation for building emergent, persistent, and monetizable interactive experiences."*

---

## Vision

The **Kernel Platform** is not a game engine. It is a **self-sustaining ecosystem engine**.

It separates three eternal concerns:

- **What happened** (Events)
- **What is true** (State)
- **What the player sees** (Projection)

By enforcing strict contracts at every layer, the platform allows games, visuals, and monetization systems to evolve independently — forever.

---

## Core Invariants (Non-Negotiable)

| Invariant         | Rule                                      | Why It Matters                              |
|-------------------|-------------------------------------------|---------------------------------------------|
| **Purity**        | Only the Reducer may mutate state         | Eliminates side effects and race conditions |
| **Idempotency**   | Duplicate `eventId`s are silently dropped | Prevents double-spend and state drift       |
| **Temporal Safety** | `sequenceId` must be strictly increasing per source | Guarantees deterministic replay             |
| **Decoupling**    | Games only emit. Visuals only read. Observers only react. | Enables infinite extensibility              |

These four rules are the **constitution** of the platform.

---

## Architecture Overview

### Two Projection Systems

```
┌─────────────────────────────┐
│       BEHAVIORAL SYSTEM     │
│  Events → Reducer → State   │
└─────────────────────────────┘
              │
              ▼
┌─────────────────────────────┐
│        VISUAL SYSTEM        │
│ Snapshots → Registry → Templates │
└─────────────────────────────┘
```

### The Golden Loop (Complete Lifecycle)

```
Game Module
   ↓ emits economic.resource_gained
Kernel (Reducer)
   ↓ updates state
MonetizationLayer (Observer)
   ↓ emits system.reward_offered
RewardBanner (Template)
   ↓ player clicks "Claim"
Kernel
   ↓ processes economic.reward_claimed
State Updated → UI Reacts
```

---

## Project Structure

```
/core
  └── kernel/                 # Immutable Platform SDK
      ├── bus/
      ├── reducer/
      ├── bridge/
      ├── state/
      ├── persistence/
      └── monetization/

modules/
  └── collector/              # Reference game implementation

templates/
  ├── visual/                 # All visual projections
  └── registry/

public/
  └── index.html              # Live Dashboard Demo

docs/
  └── GamePlugin.md           # Contract for all future games
```

---

## Key Components

| Component              | Responsibility                              | Location                     |
|------------------------|---------------------------------------------|------------------------------|
| `GlobalEventBus`       | Centralized, idempotent event routing       | `core/kernel/bus`            |
| `PlatformReducer`      | Pure state transitions + validation         | `core/kernel/reducer`        |
| `VisualBridge`         | State snapshot broadcasting                 | `core/kernel/bridge`         |
| `PlatformPersistor`    | Event log + deterministic rehydration       | `core/kernel/persistence`    |
| `MonetizationLayer`    | Cross-cutting observer (rewards, offers)    | `core/monetization`          |
| `TemplateRegistry`     | Multi-template projection orchestrator      | `templates/registry`         |
| `ResourceCollector`    | Reference game (economic events)            | `modules/collector`          |

---

## The Power of This Architecture

- **Deterministic Replay** — Any sequence of events will always produce the exact same state.
- **Immortal State** — Close the tab, come back tomorrow — your world is exactly as you left it.
- **Zero Architectural Drift** — New games, visuals, or monetization strategies can be added without touching the kernel.
- **Observable Everything** — Every action, reward, and state change is permanently recorded in the event log.

---

## Getting Started

```bash
npm install
npx vite
```

Open `http://localhost:5173` and interact with the live dashboard.

- Click level-up buttons
- Watch the Resource Collector run in the background
- Trigger the MonetizationLayer
- Claim rewards via the `RewardBanner`

---

## Extending the Platform

1. **New Game** — Implement `GamePlugin` in `modules/`
2. **New Visual** — Create a class in `templates/visual/` and register it
3. **New Service** — Build an observer like `MonetizationLayer` that subscribes to the bus

All extensions speak the same language: the `EventContract`.

---

## Final Words

This platform was built with one belief:

> **The best systems are those that make future change trivial.**

By treating events as the single source of truth and enforcing strict boundaries, we have created a foundation that can support games, economies, and experiences for years — without ever needing to rewrite the core.

**The Kernel is complete. The platform is alive.**

Now go build something beautiful on top of it.

---

*Platform Manifesto v1.0.0 — June 2026*