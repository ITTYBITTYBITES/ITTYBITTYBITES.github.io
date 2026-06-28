# Liquid Memory Game QA Audit
**Track:** C — Game QA / Arcade Stability  
**Scope:** 26 browser games registered in `website/games.json`  
**Purpose:** Provide a living QA command center for load, controls, mobile, responsive canvas, reward/ad loop, and console-health verification before monetization and broader Liquid Memory site migration.
---
## Status Legend
- `Pending` — not tested yet.
- `Pass` — works as expected.
- `Fix Needed` — issue found and needs code changes.
- `Blocked` — cannot complete test due to missing dependency/account/device.
- `Pending Manual QA` — automated boot/console audit passed, but controls/mobile/reward testing remains.
- `N/A` — not applicable for this game.

---
## Test Procedure
For each game, test both direct game URL and arcade-launch path where applicable.
1. Open the direct URL.
2. Confirm the game renders and can start/restart.
3. Test desktop controls with keyboard/mouse.
4. Use mobile device emulation and a real mobile device if possible.
5. Rotate or resize the viewport and confirm the canvas/layout remains usable.
6. Trigger any score/game-over/reward condition that emits arcade ad events.
7. Check browser console for errors/warnings that affect gameplay.

Recommended local test server:

```bash
python3 -m http.server 8765
```

Local base URL:

```text
http://127.0.0.1:8765/website/
```

Production base URL:

```text
https://ittybittybites.github.io/website/
```

---
## Master QA Table
| # | Game Title | ID | URL | Loads | Desktop Controls | Mobile Controls | Responsive Canvas | Reward/Ad Loop | Console Errors | Status | Notes |
|---:|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 3D Cyber Vector Grid Hover-Racer | `cyber-vector` | [`games/cyber-vector/index.html`](../website/games/cyber-vector/index.html) | [x] | [ ] | [ ] | [ ] | [ ] | [x] | Pending Manual QA | Ad event hook present; Boot audit: Green (HTTP 200, no critical JS errors); Noncritical warning: Tailwind CDN development warning; Reward hook audit: bridge present, 1 trigger(s), manual reward QA required. |
| 2 | 3D Neon Geometric Defender | `neon-polygon` | [`games/neon-polygon/index.html`](../website/games/neon-polygon/index.html) | [x] | [ ] | [ ] | [ ] | [ ] | [x] | Pending Manual QA | Ad event hook present; Boot audit: Green (HTTP 200, no critical JS errors); Noncritical warning: Tailwind CDN development warning; Reward hook audit: bridge present, 2 trigger(s), manual reward QA required. |
| 3 | 3D Particle Breakout Engine | `quantum-breakout` | [`games/quantum-breakout/index.html`](../website/games/quantum-breakout/index.html) | [x] | [ ] | [ ] | [ ] | [ ] | [x] | Pending Manual QA | Ad event hook present; Boot audit: Green (HTTP 200, no critical JS errors); Noncritical warning: Tailwind CDN development warning; Reward hook audit: bridge present, 1 trigger(s), manual reward QA required. |
| 4 | Attentional Blink Assessor | `attentional-blink` | [`games/attentional-blink/index.html`](../website/games/attentional-blink/index.html) | [x] | [ ] | [ ] | [ ] | [ ] | [x] | Pending Manual QA | Ad event hook present; Boot audit: Green (HTTP 200, no critical JS errors); Noncritical warning: Tailwind CDN development warning; Reward hook audit: bridge present, 1 trigger(s), manual reward QA required. |
| 5 | Cosmic Tunnel 3D | `cosmic-tunnel` | [`games/cosmic-tunnel/index.html`](../website/games/cosmic-tunnel/index.html) | [x] | [ ] | [ ] | [ ] | [ ] | [x] | Pending Manual QA | Ad event hook present; Ad completion listener present; Boot audit: Yellow (noncritical warning); Warning: The AudioContext was not allowed to start. It must be resumed (or created) after a user gesture on the page. https://developer.chrome.com/blog/autoplay/#web_audio; Reward hook audit: bridge present, 1 trigger(s), manual reward QA required. |
| 6 | Cyber Flappy Hover-Drone | `hover-drone` | [`games/hover-drone/index.html`](../website/games/hover-drone/index.html) | [x] | [ ] | [ ] | [ ] | [ ] | [x] | Pending Manual QA | Boot audit: Green (HTTP 200, no critical JS errors); Noncritical warning: Tailwind CDN development warning; Reward hook audit: bridge present, 1 trigger(s), manual reward QA required. |
| 7 | Cyber Snake 2026 | `cyber-snake` | [`games/cyber-snake/index.html`](../website/games/cyber-snake/index.html) | [x] | [ ] | [ ] | [ ] | [ ] | [x] | Pending Manual QA | Ad event hook present; Boot audit: Green (HTTP 200, no critical JS errors); Noncritical warning: Tailwind CDN development warning; Reward hook audit: bridge present, 1 trigger(s), manual reward QA required. |
| 8 | Cyber Sweeper Sentinel | `cyber-mines` | [`games/cyber-mines/index.html`](../website/games/cyber-mines/index.html) | [x] | [ ] | [ ] | [ ] | [ ] | [x] | Pending Manual QA | Ad event hook present; Boot audit: Green (HTTP 200, no critical JS errors); Noncritical warning: Tailwind CDN development warning; Reward hook audit: bridge present, 1 trigger(s), manual reward QA required. |
| 9 | Grid Delver: 1-Minute Micro-Rogue | `grid-delver` | [`games/grid-delver/index.html`](../website/games/grid-delver/index.html) | [x] | [ ] | [ ] | [ ] | [ ] | [x] | Pending Manual QA | Boot audit: Green (HTTP 200, no critical JS errors); Noncritical warning: Tailwind CDN development warning; Reward hook audit: bridge present, 1 trigger(s), manual reward QA required. |
| 10 | METRONOMIC RHYTHM ANCHOR | `metronomic-rhythm` | [`games/metronomic-rhythm/index.html`](../website/games/metronomic-rhythm/index.html) | [x] | [ ] | [ ] | [ ] | [ ] | [x] | Pending Manual QA | Ad event hook present; Boot audit: Green (HTTP 200, no critical JS errors); Noncritical warning: Tailwind CDN development warning; Reward hook audit: bridge present, 1 trigger(s), manual reward QA required. |
| 11 | N-BACK SENTINEL LOG | `nback-sentinel` | [`games/nback-sentinel/index.html`](../website/games/nback-sentinel/index.html) | [x] | [ ] | [ ] | [ ] | [ ] | [x] | Pending Manual QA | Ad event hook present; Boot audit: Green (HTTP 200, no critical JS errors); Noncritical warning: Tailwind CDN development warning; Reward hook audit: bridge present, 1 trigger(s), manual reward QA required. |
| 12 | Neon Cyber Pong 1v1 | `neon-pong` | [`games/neon-pong/index.html`](../website/games/neon-pong/index.html) | [x] | [ ] | [ ] | [ ] | [ ] | [x] | Pending Manual QA | Boot audit: Green (HTTP 200, no critical JS errors); Noncritical warning: Tailwind CDN development warning; Reward hook audit: bridge present, 1 trigger(s), manual reward QA required. |
| 13 | Orbital Gravitational Physics Sandbox | `orbital-sandbox` | [`games/orbital-sandbox/index.html`](../website/games/orbital-sandbox/index.html) | [x] | [ ] | [ ] | [ ] | [ ] | [x] | Pending Manual QA | Ad event hook present; Boot audit: Green (HTTP 200, no critical JS errors); Noncritical warning: Tailwind CDN development warning; Reward hook audit: bridge present, 1 trigger(s), manual reward QA required. |
| 14 | Quantum Sentinel: Fast Spatial Reflex | `quantum-sentinel` | [`games/quantum-sentinel/index.html`](../website/games/quantum-sentinel/index.html) | [x] | [ ] | [ ] | [ ] | [ ] | [x] | Pending Manual QA | Boot audit: Green (HTTP 200, no critical JS errors); Noncritical warning: Tailwind CDN development warning; Reward hook audit: bridge present, 1 trigger(s), manual reward QA required. |
| 15 | Raycasted 3D Doom Labyrinth | `raycasted-doom` | [`games/raycasted-doom/index.html`](../website/games/raycasted-doom/index.html) | [x] | [ ] | [ ] | [ ] | [ ] | [x] | Pending Manual QA | Ad event hook present; Boot audit: Green (HTTP 200, no critical JS errors); Noncritical warning: Tailwind CDN development warning; Reward hook audit: bridge present, 1 trigger(s), manual reward QA required. |
| 16 | Relivistic Space Slingshot | `gravity-slingshot` | [`games/gravity-slingshot/index.html`](../website/games/gravity-slingshot/index.html) | [x] | [ ] | [ ] | [ ] | [ ] | [x] | Pending Manual QA | Ad event hook present; Boot audit: Green (HTTP 200, no critical JS errors); Noncritical warning: Tailwind CDN development warning; Reward hook audit: bridge present, 1 trigger(s), manual reward QA required. |
| 17 | Retro Cyber Neon Breakout | `retro-breakout` | [`games/retro-breakout/index.html`](../website/games/retro-breakout/index.html) | [x] | [ ] | [ ] | [ ] | [ ] | [x] | Pending Manual QA | Boot audit: Green (HTTP 200, no critical JS errors); Noncritical warning: Tailwind CDN development warning; Reward hook audit: bridge present, 1 trigger(s), manual reward QA required. |
| 18 | SACCADIC TARGET ACQUISITION | `saccadic-target` | [`games/saccadic-target/index.html`](../website/games/saccadic-target/index.html) | [x] | [ ] | [ ] | [ ] | [ ] | [x] | Pending Manual QA | Ad event hook present; Boot audit: Green (HTTP 200, no critical JS errors); Noncritical warning: Tailwind CDN development warning; Reward hook audit: bridge present, 1 trigger(s), manual reward QA required. |
| 19 | SHIFTING ATTENTIONAL ATTRIBUTE SELECTOR | `shifting-selector` | [`games/shifting-selector/index.html`](../website/games/shifting-selector/index.html) | [x] | [ ] | [ ] | [ ] | [ ] | [x] | Pending Manual QA | Ad event hook present; Boot audit: Green (HTTP 200, no critical JS errors); Noncritical warning: Tailwind CDN development warning; Reward hook audit: bridge present, 1 trigger(s), manual reward QA required. |
| 20 | SIGNAL DETECTION FILTER | `signal-detection` | [`games/signal-detection/index.html`](../website/games/signal-detection/index.html) | [x] | [ ] | [ ] | [ ] | [ ] | [x] | Pending Manual QA | Ad event hook present; Boot audit: Green (HTTP 200, no critical JS errors); Noncritical warning: Tailwind CDN development warning; Reward hook audit: bridge present, 1 trigger(s), manual reward QA required. |
| 21 | Space Asteroids Retro Vector | `space-asteroids` | [`games/space-asteroids/index.html`](../website/games/space-asteroids/index.html) | [x] | [ ] | [ ] | [ ] | [ ] | [x] | Pending Manual QA | Ad event hook present; Boot audit: Green (HTTP 200, no critical JS errors); Noncritical warning: Tailwind CDN development warning; Reward hook audit: bridge present, 2 trigger(s), manual reward QA required. |
| 22 | SPATIAL MATRIX EXPANSION | `spatial-matrix` | [`games/spatial-matrix/index.html`](../website/games/spatial-matrix/index.html) | [x] | [ ] | [ ] | [ ] | [ ] | [x] | Pending Manual QA | Ad event hook present; Boot audit: Green (HTTP 200, no critical JS errors); Noncritical warning: Tailwind CDN development warning; Reward hook audit: bridge present, 1 trigger(s), manual reward QA required. |
| 23 | Stroop Interference Calibrator | `stroop-calibrator` | [`games/stroop-calibrator/index.html`](../website/games/stroop-calibrator/index.html) | [x] | [ ] | [ ] | [ ] | [ ] | [x] | Pending Manual QA | Ad event hook present; Boot audit: Green; Interaction smoke fixed/passed after pre-start input guard; Noncritical warning: Tailwind CDN development warning; Reward hook audit: bridge present, 1 trigger(s), manual reward QA required. |
| 24 | TACHISTOSCOPE RECOGNITION MATRIX | `tachistoscope` | [`games/tachistoscope/index.html`](../website/games/tachistoscope/index.html) | [x] | [ ] | [ ] | [ ] | [ ] | [x] | Pending Manual QA | Ad event hook present; Boot audit: Green (HTTP 200, no critical JS errors); Noncritical warning: Tailwind CDN development warning; Reward hook audit: bridge present, 1 trigger(s), manual reward QA required. |
| 25 | Tachyon Hyper-Speed Interceptor | `tachyon-racer` | [`games/tachyon-racer/index.html`](../website/games/tachyon-racer/index.html) | [x] | [ ] | [ ] | [ ] | [ ] | [x] | Pending Manual QA | Ad event hook present; Boot audit: Green (HTTP 200, no critical JS errors); Noncritical warning: Tailwind CDN development warning; Reward hook audit: bridge present, 1 trigger(s), manual reward QA required. |
| 26 | WORKING MEMORY CALIBRATION CHURN | `memory-churn` | [`games/memory-churn/index.html`](../website/games/memory-churn/index.html) | [x] | [ ] | [ ] | [ ] | [ ] | [x] | Pending Manual QA | Ad event hook present; Boot audit: Green (HTTP 200, no critical JS errors); Noncritical warning: Tailwind CDN development warning; Reward hook audit: bridge present, 1 trigger(s), manual reward QA required. |

---
## Mobile Device Matrix
| Device/Profile | Browser | Orientation | Result | Notes |
|---|---|---|---|---|
| Android Chrome — small phone | TBD | Portrait/Landscape | Pending |  |
| Android Chrome — large phone | TBD | Portrait/Landscape | Pending |  |
| Android installed PWA | TBD | Portrait/Landscape | Pending |  |
| iPhone Safari | TBD | Portrait/Landscape | Pending |  |
| iPad/tablet Safari or Chrome | TBD | Portrait/Landscape | Pending |  |

---
## Common Issue Codes
| Code | Meaning |
|---|---|
| `LOAD-404` | Game path or asset missing. |
| `LOAD-JS` | JavaScript exception prevents boot. |
| `CTRL-DESKTOP` | Keyboard/mouse controls fail. |
| `CTRL-TOUCH` | Touch controls fail or are inaccurate. |
| `RESP-CANVAS` | Canvas overflows, clips, or scales incorrectly. |
| `AD-HANG` | Game requests ad/reward but never receives completion. |
| `PERF-MOBILE` | Mobile frame rate/heat/battery issue. |
| `A11Y` | Accessibility issue. |

---
## Summary Counters
Update these manually as QA progresses.

| Category | Count |
|---|---:|
| Total games | 26 |
| Fully passed | 0 |
| Fix needed | 0 |
| Blocked | 0 |
| Pending full manual QA | 26 |
| Automated boot green | 25 |
| Automated boot yellow | 1 |
| Automated boot red | 0 |



---
## Automated Interaction Smoke Audit

Generated by:

```bash
node tools/audit_games_interaction.mjs
```

Result snapshot after the `stroop-calibrator` pre-start input fix:

| Metric | Count |
|---|---:|
| Total games | 26 |
| Automated desktop/mobile interaction smoke pass | 26 |
| Needs review | 0 |

Notes:

- This audit performs a low-risk interaction probe: first visible button/canvas click, common keyboard inputs, and mobile tap/drag.
- This is not a full gameplay completion test.
- `stroop-calibrator` originally threw `Cannot read properties of null (reading 'hex')` when a color button was clicked before calibration started. It was fixed by ignoring early choices while `correct` is null and by removing the correct `pointerdown` listener once started.
- Manual QA is still required for real gameplay, scoring, mobile ergonomics, and reward/ad loop completion.

---
## Automated Responsive Smoke Audit

Generated by:

```bash
node tools/audit_games_responsive.mjs
```

Result snapshot:

| Metric | Count |
|---|---:|
| Total games | 26 |
| Desktop/mobile responsive smoke pass | 25 |
| Mobile boot pass | 25 |
| Needs review | 1 |

### Needs Review

| Game | Reason | Follow-up |
|---|---|---|
| WORKING MEMORY CALIBRATION CHURN | Automated mobile profile timed out once during `domcontentloaded` navigation. Manual spot-check loaded successfully with HTTP 200 and visible content. | Retest during manual controls/mobile QA pass. |

Notes:

- This is still a smoke test, not a full gameplay test.
- Passing here means the game loaded, had visible content, no critical page errors, and no obvious canvas/layout failure in automated desktop/mobile profiles.
- Desktop controls, mobile controls, and reward/ad loops remain manual QA items.


---
## Automated Reward Hook Audit

Generated by:

```bash
node tools/audit_games_reward_hooks.mjs
```

Result snapshot:

| Metric | Count |
|---|---:|
| Total games | 26 |
| Trigger hook + monetization bridge present | 26 |
| No in-game reward hook currently present | 0 |
| Missing bridge while triggering ads | 0 |
| Missing direct files | 0 |

### Games without in-game reward hooks

None. All 26 registered games now contain at least one `ARCADE_TRIGGER_AD` path and include the shared Liquid Memory monetization bridge.

Notes:

- `Ready for Manual Reward QA` does **not** mean monetization is fully approved; it means the game has an ad trigger and the direct page has the Liquid Memory arcade monetization bridge.
- Manual testing still needs to confirm the reward/interstitial modal appears and returns completion without blocking gameplay.
- Account-side AdSense/Adsterra configuration is still separate from this code-level hook audit.


---
## Monetization Timing Rule

Liquid Memory arcade monetization now enforces an initial gameplay grace period:

```text
No visible ad rail, interstitial, rewarded modal, or sponsor break during the first 60 seconds of a game session.
```

Implementation locations:

- `website/assets/arcade-monetization.js`
- `website/arcade.html`
- `website/portal.js` legacy wrapper

Behavior:

- If a game emits `ARCADE_TRIGGER_AD` before the 60-second mark, the bridge silently returns `ARCADE_AD_COMPLETE` so gameplay does not hang.
- The bottom ad rail is hidden until the 60-second grace period completes.
- After 60 seconds, the normal cooldown/reward modal rules apply.

Manual QA should confirm that no game displays ads during the first minute of active play.

---
## Notes for Monetization Readiness
Do not treat a game as monetization-ready until all of the following are checked:
- Loads on production URL.
- Mobile touch controls work.
- Reward/ad loop does not hang.
- Game controls are not covered by any ad container.
- No console errors during start, gameplay, game-over, or restart.

