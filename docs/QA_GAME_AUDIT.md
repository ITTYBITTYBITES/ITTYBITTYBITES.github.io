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
| 1 | 3D Cyber Vector Grid Hover-Racer | `cyber-vector` | [`games/cyber-vector/index.html`](../website/games/cyber-vector/index.html) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | Pending | Ad event hook present |
| 2 | 3D Neon Geometric Defender | `neon-polygon` | [`games/neon-polygon/index.html`](../website/games/neon-polygon/index.html) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | Pending | Ad event hook present |
| 3 | 3D Particle Breakout Engine | `quantum-breakout` | [`games/quantum-breakout/index.html`](../website/games/quantum-breakout/index.html) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | Pending | Ad event hook present |
| 4 | Attentional Blink Assessor | `attentional-blink` | [`games/attentional-blink/index.html`](../website/games/attentional-blink/index.html) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | Pending | Ad event hook present |
| 5 | Cosmic Tunnel 3D | `cosmic-tunnel` | [`games/cosmic-tunnel/index.html`](../website/games/cosmic-tunnel/index.html) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | Pending | Ad event hook present; Ad completion listener present |
| 6 | Cyber Flappy Hover-Drone | `hover-drone` | [`games/hover-drone/index.html`](../website/games/hover-drone/index.html) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | Pending |  |
| 7 | Cyber Snake 2026 | `cyber-snake` | [`games/cyber-snake/index.html`](../website/games/cyber-snake/index.html) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | Pending | Ad event hook present |
| 8 | Cyber Sweeper Sentinel | `cyber-mines` | [`games/cyber-mines/index.html`](../website/games/cyber-mines/index.html) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | Pending | Ad event hook present |
| 9 | Grid Delver: 1-Minute Micro-Rogue | `grid-delver` | [`games/grid-delver/index.html`](../website/games/grid-delver/index.html) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | Pending |  |
| 10 | METRONOMIC RHYTHM ANCHOR | `metronomic-rhythm` | [`games/metronomic-rhythm/index.html`](../website/games/metronomic-rhythm/index.html) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | Pending | Ad event hook present |
| 11 | N-BACK SENTINEL LOG | `nback-sentinel` | [`games/nback-sentinel/index.html`](../website/games/nback-sentinel/index.html) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | Pending | Ad event hook present |
| 12 | Neon Cyber Pong 1v1 | `neon-pong` | [`games/neon-pong/index.html`](../website/games/neon-pong/index.html) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | Pending |  |
| 13 | Orbital Gravitational Physics Sandbox | `orbital-sandbox` | [`games/orbital-sandbox/index.html`](../website/games/orbital-sandbox/index.html) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | Pending | Ad event hook present |
| 14 | Quantum Sentinel: Fast Spatial Reflex | `quantum-sentinel` | [`games/quantum-sentinel/index.html`](../website/games/quantum-sentinel/index.html) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | Pending |  |
| 15 | Raycasted 3D Doom Labyrinth | `raycasted-doom` | [`games/raycasted-doom/index.html`](../website/games/raycasted-doom/index.html) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | Pending | Ad event hook present |
| 16 | Relivistic Space Slingshot | `gravity-slingshot` | [`games/gravity-slingshot/index.html`](../website/games/gravity-slingshot/index.html) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | Pending | Ad event hook present |
| 17 | Retro Cyber Neon Breakout | `retro-breakout` | [`games/retro-breakout/index.html`](../website/games/retro-breakout/index.html) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | Pending |  |
| 18 | SACCADIC TARGET ACQUISITION | `saccadic-target` | [`games/saccadic-target/index.html`](../website/games/saccadic-target/index.html) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | Pending | Ad event hook present |
| 19 | SHIFTING ATTENTIONAL ATTRIBUTE SELECTOR | `shifting-selector` | [`games/shifting-selector/index.html`](../website/games/shifting-selector/index.html) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | Pending | Ad event hook present |
| 20 | SIGNAL DETECTION FILTER | `signal-detection` | [`games/signal-detection/index.html`](../website/games/signal-detection/index.html) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | Pending | Ad event hook present |
| 21 | Space Asteroids Retro Vector | `space-asteroids` | [`games/space-asteroids/index.html`](../website/games/space-asteroids/index.html) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | Pending | Ad event hook present |
| 22 | SPATIAL MATRIX EXPANSION | `spatial-matrix` | [`games/spatial-matrix/index.html`](../website/games/spatial-matrix/index.html) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | Pending | Ad event hook present |
| 23 | Stroop Interference Calibrator | `stroop-calibrator` | [`games/stroop-calibrator/index.html`](../website/games/stroop-calibrator/index.html) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | Pending | Ad event hook present |
| 24 | TACHISTOSCOPE RECOGNITION MATRIX | `tachistoscope` | [`games/tachistoscope/index.html`](../website/games/tachistoscope/index.html) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | Pending | Ad event hook present |
| 25 | Tachyon Hyper-Speed Interceptor | `tachyon-racer` | [`games/tachyon-racer/index.html`](../website/games/tachyon-racer/index.html) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | Pending | Ad event hook present |
| 26 | WORKING MEMORY CALIBRATION CHURN | `memory-churn` | [`games/memory-churn/index.html`](../website/games/memory-churn/index.html) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | Pending | Ad event hook present |

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
| Pending | 26 |

---
## Notes for Monetization Readiness
Do not treat a game as monetization-ready until all of the following are checked:
- Loads on production URL.
- Mobile touch controls work.
- Reward/ad loop does not hang.
- Game controls are not covered by any ad container.
- No console errors during start, gameplay, game-over, or restart.

