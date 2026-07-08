# ITTYBITTYBITES — Interactive collections worth returning to.

> **ITTYBITTYBITES is a growing library of interactive experiences designed to help people understand the world a little better, one bite at a time.**

---

## Foundation v1.0 (Frozen)
The Platform Foundation is complete and frozen. All future work focuses on the growth of the **Core Library**.

See:
- `governing/docs/VISION.md` — Why we exist
- `governing/docs/PRODUCT_CONSTITUTION.md` — Our laws
- `governing/docs/PLATFORM_STATUS.md` — Current library progress

---

## Technical Overview

The section below documents the stable engineering foundation that was completed before v2 began.

A clean, modular foundation for a creative platform capable of hosting browser games, applications, interactive experiences, utilities, experiments, documentation, and media projects.

This repository replaces the previous static website with a modern application shell. It is intentionally unbranded: design decisions such as colors, typography, logos, animations, and product-specific content will be layered on top in later passes.

## Purpose

- Provide a stable technical base that future experiences can plug into.
- Keep concerns separated: routing, content, experiences, analytics, and deployment are independent systems.
- Ship as a Progressive Web App with offline support.
- Deploy automatically to GitHub Pages with correct deep-link routing.

## Architecture

```
.
├── .github/workflows/          # GitHub Pages deployment pipeline
├── public/                     # Static assets served at root
│   ├── icons/                  # PWA icons
│   ├── robots.txt
│   └── sitemap.xml
├── scripts/                    # Build helpers (e.g., icon generation)
├── src/
│   ├── components/             # Reusable custom elements
│   │   ├── app-header.ts
│   │   ├── app-footer.ts
│   │   ├── experience-host.ts
│   │   └── skip-link.ts
│   ├── content/                # Content manifests
│   │   └── experiences.json    # Experience registry source of truth
│   ├── experiences/            # Experience modules
│   │   ├── counter.ts
│   │   ├── canvas-demo.ts
│   │   └── markdown-doc.ts
│   ├── pages/                  # Page-level route handlers
│   │   ├── home.ts
│   │   ├── experience-index.ts
│   │   ├── experience.ts
│   │   └── docs.ts
│   ├── platform/               # Core platform services
│   │   ├── config.ts           # Environment-aware configuration
│   │   ├── router.ts           # History API router
│   │   ├── registry.ts         # Experience registry loader
│   │   ├── analytics.ts        # GA4 + internal event bus bridge
│   │   ├── events.ts           # Internal event bus
│   │   ├── pwa.ts              # Service worker registration
│   │   ├── utils.ts            # DOM helpers
│   │   └── types.ts            # Shared TypeScript types
│   ├── style.css               # Neutral, accessible base styles
│   └── main.ts                 # Application bootstrap
├── index.html                  # Shell HTML
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Development Setup

Requirements:

- Node.js 20+
- npm 10+

Install dependencies:

```bash
npm install
```

Start the local dev server:

```bash
npm run dev
```

Open `http://localhost:5173`.

## Production Build

```bash
npm run build
```

This runs TypeScript, produces a Vite production bundle in `dist/`, and copies `dist/index.html` to `dist/404.html` so GitHub Pages can fall back to the SPA shell for deep links.

Preview the production build:

```bash
npm run preview
```

## Deployment

The repository uses GitHub Actions to build and deploy to GitHub Pages on every push to `main`.

Workflow file: `.github/workflows/deploy.yml`

Repository settings required:

1. Go to **Settings > Pages**.
2. Set **Build and deployment** source to **GitHub Actions**.
3. Ensure the workflow has `pages: write` and `id-token: write` permissions (already configured in the file).

## Adding an Experience

1. Create a new file in `src/experiences/` that exports `meta`, `mount`, and optionally `unmount`.
2. Add an entry to `src/content/experiences.json` pointing to the module file.
3. The experience is now reachable at `/experience/{id}`.

Example module shape:

```ts
import type { ExperienceContext, ExperienceMeta, ExperienceModule } from '../platform/types';

export const meta: ExperienceMeta = {
  id: 'my-experience',
  title: 'My Experience',
  description: 'What it does.',
  category: 'game',
  tags: ['demo'],
};

export const mount = (container: HTMLElement, context: ExperienceContext): (() => void) => {
  container.textContent = 'Hello, experience.';
  return () => {
    container.innerHTML = '';
  };
};

export default { meta, mount };
```

## Analytics

Google Analytics 4 is loaded once via a centralized service (`src/platform/analytics.ts`).

- Measurement ID: `G-A4541307705`
- No tracking snippets are duplicated across pages or experiences.
- Tracking respects `navigator.doNotTrack` and can be disabled with `VITE_DISABLE_ANALYTICS=true`.

Experiences should emit events through the shared service:

```ts
context.analytics.track('experience_started', { experience_id: context.meta.id });
```

The internal event bus (`src/platform/events.ts`) also fires these events, so future UI components can subscribe without coupling to GA4.

## Accessibility

- Semantic HTML (`header`, `nav`, `main`, `footer`, `article`).
- Skip link for keyboard users.
- Visible focus indicators.
- Focus management on route changes.
- `aria-current` for active navigation.
- `prefers-reduced-motion` disables transitions and animations.

## Contribution Workflow

1. Create a feature branch from `main`.
2. Make changes in the relevant system (`src/platform/`, `src/experiences/`, etc.).
3. Run `npm run lint` and `npm run build` locally.
4. Open a pull request.
5. Merge when the GitHub Pages deployment succeeds.

## Design & Vision Governance (Important)

**Current status (2026-07-07)**

A draft reference document exists at:
`docs/drafts/PLATFORM_BLUEPRINT_DRAFT.md`

This is **reference material only** — it was produced during the stabilization phase.

**It is not the governing document.**

The platform architect is currently authoring the official hierarchy:

1. **Product Constitution** (root philosophy and principles)
2. **Platform Blueprint**
3. **Design System**
4. **Engineering Standards**
5. **Build Orders**

Until the **Product Constitution** is published, **no implementation of visual design, motion language, branding, navigation philosophy, or new experience surfaces should begin**.

Implementation agents should continue to focus exclusively on:
- Maintaining the engineering foundation
- Improving developer experience and tooling
- Adding new experiences **only** when explicitly requested with a narrow technical scope
- Bug fixes and stabilization

### High-Level Areas That Will Be Defined
- Visual design system
- Motion and interaction language
- Information architecture and navigation model
- Content and experience strategy
- Monetization approach
- Accessibility and performance standards

---

## Authoritative Documents (Current)

| Document                        | Purpose                                           | Location                              | Status          |
|---------------------------------|---------------------------------------------------|---------------------------------------|-----------------|
| Product Constitution            | Root philosophy, principles, and non-negotiables  | `docs/PRODUCT_CONSTITUTION.md`        | To be authored  |
| Platform Blueprint (Draft)      | Historical reference / engineering observations   | `docs/drafts/PLATFORM_BLUEPRINT_DRAFT.md` | Reference only |
| Handoff Stabilization Report    | Engineering baseline after agent handoff          | `HANDOFF_REPORT.md`                   | Stable          |
| This README                     | Technical setup, architecture, and contribution   | `README.md`                           | Current         |
## Handoff Stabilization (2026-07-07)

This commit establishes a stable baseline after manual file move + previous agent interruption.

See the commit message for full details.

Next agents: Always pull from GitHub first. Use `npm ci && npm run lint && npm run build` before any work.
