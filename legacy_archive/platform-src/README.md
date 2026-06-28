# Liquid Memory Kernel Platform

**Version:** v1.0.0 Production Release  
**Status:** Stable dependency  
**Live demo:** https://ittybittybites.github.io/website/platform/

The Kernel Platform is a deterministic, event-driven foundation for building persistent, monetizable, and visually reactive interactive experiences for Liquid Memory.

It is intentionally **not** a traditional game engine. It is the shared platform layer beneath games, reward loops, visual projections, and persistent player state.

---

## The Golden Loop

```text
Game Module
  ↓ emits EventContract
GlobalEventBus
  ↓ routes event once
PlatformReducer
  ↓ produces new immutable PlatformState
PlatformPersistor
  ↓ saves event log + state snapshot
VisualBridge
  ↓ broadcasts state snapshot
TemplateRegistry / Visual Templates
  ↓ update the player-facing UI
MonetizationLayer
  ↓ observes qualifying events
RewardBanner
  ↓ player claims reward
GlobalEventBus
  ↓ emits economic.reward_claimed
PlatformState updates again
```

This loop is the core contract. Every future game or monetization system should plug into it rather than bypass it.

---

## Non-negotiable invariants

| Invariant | Rule | Why it matters |
|---|---|---|
| Purity | Only `PlatformReducer` creates state transitions | Prevents hidden mutations and drift |
| Idempotency | Duplicate `eventId`s are dropped | Prevents double rewards and double-spend |
| Temporal safety | `sequenceId` must increase per source | Keeps replay deterministic |
| Decoupling | Games emit, visuals read, observers react | Keeps future systems modular |
| Persistence | Event log and state snapshot survive refresh | Enables rehydration and continuity |

---

## Production verification checklist

The production release is considered green only when all checks pass:

1. **Asset path integrity**
   - `/website/platform/index.html` loads.
   - Relative Vite assets load from `/website/platform/assets/`.
   - Links back to the main Liquid Memory site resolve.

2. **State persistence audit**
   - Click `Level Up → 5`.
   - Confirm `platform_state` is written to `localStorage`.
   - Refresh.
   - Confirm the page rehydrates and the visual templates still show level 5.

3. **Event log audit**
   - Confirm `platform_event_log` contains `milestone.level_up`.
   - Click `Spend 60 Gold`.
   - Confirm `system.reward_offered` is emitted.
   - Confirm `RewardBanner` renders.

4. **No runtime errors**
   - Browser console must not show page errors during the core loop.

A local automated verification script exists at the repository root:

```bash
node verify-production-platform.mjs
```

For local server verification:

```bash
python3 -m http.server 8765
BASE="http://127.0.0.1:8765/website/platform/" node verify-production-platform.mjs
```

---

## Development commands

```bash
npm ci
npm run typecheck
npm run build
npm run test
```

The GitHub Actions workflow builds this package and copies the static output into:

```text
website/platform/
```

---

## Source layout

```text
core/kernel/                 Immutable event/state platform
core/monetization/           Reward-offer observer layer
modules/collector/           Reference resource collector game loop
modules/types/               Game plugin contract
templates/registry/          Visual projection registry
templates/visual/            Tree, orrery, bloom, and reward UI templates
main.ts                      Browser integration and demo controls
index.html                   Production demo shell
```

---

## Stable dependency policy

As of v1.0.0, this platform should be treated as a stable dependency.

Future games should integrate by:

1. Implementing a `GamePlugin`.
2. Emitting `EventContract` events.
3. Allowing the reducer/persistor/bridge/monetization layers to handle the rest.

Do not bypass the event bus for gameplay state, rewards, or persistent player progress.

---

## Closure statement

The Kernel Platform v1.0.0 release is complete when the live production verification passes and the release tag is present.

At that point, the platform moves from **work in progress** to **production foundation** for future Liquid Memory interactive experiences.
