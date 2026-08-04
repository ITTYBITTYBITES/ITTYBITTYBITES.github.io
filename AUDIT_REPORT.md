# SOURCE OF TRUTH AUDIT REPORT — YearGlass / ITTYBITTYBITES Platform

## 1. Executive Snapshot
Workspace (`/home/user/fresh_clone`) is the ITTYBITTYBITES platform repository, not a standalone YearGlass engine source. `yearglass.ts` is a preview/integration module; the full interactive experience is delivered via compiled assets (`public/yearglass/assets/`). Production hardening (build safeguard, version-check, route indexes, audio engine) is complete; immersive simulation depth and full engine source separation remain as architectural clarifications.

## 2. Feature Matrix Table

| System / Object | Current Status | Key Technical Gap |
|---|---|---|
| `src/main.ts` / RenderPipeline | Missing (workspace) | No engine entry point in workspace source |
| `TerrariumScene` / `RoomScene` | Missing (workspace) | Scene architecture exists only in compiled assets |
| `SimulationEngine` | Missing (workspace) | No real-time tick/state machine source |
| `EntitySystem` (Pip AI) | Missing (workspace) | No creature AI logic in workspace |
| `SaveEngine` / IndexedDB | Missing (workspace) | No schema migration wrapper; no persistent save layer |
| `yearglass.ts` (Module) | Implemented (Prototype) | Preview/entry only; full simulation separate |
| `AudioEngine` / `audio.ts` | Implemented (Prototype) | Web Audio API (`initAudio`, `playTone`); no remote `.mp3` assets |
| `AudioEngine` — Mixer/Balance | Prototype | Master/music/SFX separation basic; no mixer architecture |
| Focus Mode Overlay | Implemented | Text/reveal overlay (`fadeIn`/`reveal`); minimal instruction layer |
| Dome Interaction | Implemented (Module) | Visual circle (`220px`) + `openDome()`; deployed game has button |
| Relationship Tracking | Prototype | Click counter (`relationshipClicks`/`Visits`) only |
| Shader / Filter Pipeline (`src/`) | Missing (workspace) | Compiled assets (`assets/index-DxyXdlg0.js`) contain filters; not editable here |
| Graphics Composition (workspace) | Flat / CSS-based | No bloom/glass distortion in source; deployed scene has compiled effects |
| Mobile Viewport Handling | Partial | Responsive CSS (`max-width: 100%; min-height: 100vh`); no orientation/low-power detection |
| Build Pipeline (`vite.config.ts`, PWA) | Stable / Hardened | `tsc` dependency fixed (`typescript` installed); `verify-deploy.sh` added |
| Deployment (`public/`, routes) | Stable | Route indexes (`experiences/`, `experience/yearglass/`), `404.html`, `version-check.js` active |

## 3. Graphics & Composition Audit

What the user actually sees (based on deployed compiled assets and workspace module preview):

- **Workspace preview (`/experience/yearglass/`)**: Clean ambient card layout with category label (`Ambient / Sanctuary`), overview section, focus mode description (`Terrarium Focus Mode`), return experience notes, first morning prompt, expectation list, and launch link (`/yearglass/`). No dynamic lighting or glass effects rendered by workspace source — those come from compiled `assets/`.
- **Deployed game (`/yearglass/`)**: Full compiled scene (desk, window, plant, lamp, notebook, dome element added via `public/yearglass/index.html`). The overlay (`openDome`) is a fixed gradient overlay with `animation: fadeIn 0.8s ease` and inner content using `animation: reveal 1.2s ease-out`. No evidence of custom shader distortion, bloom, or dynamic light masks in workspace source; visual richness depends entirely on compiled assets (`assets/index-DxyXdlg0.js`, `CanvasPool`, `Filter` references confirmed in build output but not source-editable).
- **Composition layers**: Workspace module uses flat HTML/CSS layers (`h('div', ...)`). No multi-layer container objects or depth sorting in workspace source.

## 4. Architecture & Technical Debt

- **Module vs Compiled Separation**: The workspace (`yearglass.ts`) integrates the experience into the platform library; the full interactive sanctuary is delivered as a compiled build (`public/yearglass/assets/`). This separation is not clearly documented for the user, causing confusion about which file controls which behavior.
- **TypeScript Build Reliability**: `npm run build` relies on `tsc`. `typescript` was missing from environment (now installed as dependency), but the build pipeline is fragile (`sh: 1: tsc: not found` observed). Mitigation: `scripts/verify-deploy.sh` ensures `dist/index.html` and route artifacts exist before pushing.
- **PWA Cache Aggressiveness**: Service worker (`sw.js`) caches aggressively. `version-check.js` (added to `public/` and injected into `index.html`) detects `app-version.json` changes and reloads, preventing stale deployments.
- **Audio Context Boundaries**: `audio.ts` initializes `AudioContext` on `initAudio()`; `unlockAudio()` resumes suspended context. No error boundary if `window.AudioContext` is unsupported (falls back silently). Works for modern browsers.
- **No Error Boundaries in Module**: The module (`yearglass.ts`) does not wrap interaction or overlay creation in `try/catch`; if the overlay fails, there is no graceful fallback.
- **No Schema Migration for Saves**: No `IndexedDB` wrapper or version migration exists in workspace (`SaveEngine` missing).

## 5. Top 5 Critical Fixes Required Before Production

1. **Build Pipeline Stability** (`verify-deploy.sh` + `typescript` install) — DONE. Prevents broken deploys.
2. **Auto-Refresh / Cache Bust** (`version-check.js` + `app-version.json`) — DONE. Prevents stale PWA states.
3. **Route Handling / SPA Fallback** (`public/404.html`, `public/experiences/index.html`, `public/experience/yearglass/index.html`) — DONE. Direct routes work.
4. **Clear Source Separation / Documentation** — PENDING. Workspace is module/integration repo; full game source (`yearglass/` standalone) is separate. User confusion about where fixes apply (module vs deployed compiled assets) requires clarification.
5. **Immersive Scene / Audio Completeness** — PENDING. Overlay remains text/reveal-based (not a full interactive scene). Audio is procedural tone (`playTone`) rather than ambient/environmental soundscape (`.mp3` assets missing). Dome interaction triggers overlay correctly but user expects deeper experience transition.

### Final Note
The workspace (`/home/user/fresh_clone`) is fully audited and production-hardened for the platform integration layer (`yearglass.ts`, routes, deployment, version tracking, build safeguards). The full interactive sanctuary (`/yearglass/`) operates via compiled assets (`public/yearglass/assets/`) that are not source-editable within this repository; any deeper simulation or scene changes require access to the standalone game source or a separate engine build pipeline.
