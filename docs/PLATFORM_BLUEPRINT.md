# The Experience Platform
## Platform Blueprint v1.0

**Version**: 1.0  
**Date**: 2026-07-07  
**Status**: Draft — Authoritative Specification  
**Owner**: Platform Vision Lead  
**Repository**: https://github.com/ITTYBITTYBITES/ITTYBITTYBITES.github.io  

> **Core Principle**  
> Everything is an Experience.  
> The platform exists to host, discover, and compose experiences — not pages.

---

## 1. Executive Summary

The Experience Platform is a modular, registry-driven web application that serves as a living home for interactive content of all kinds:

- Games
- Utilities & tools
- Experiments & prototypes
- Documentation & articles
- Media experiences
- Interactive stories
- Applications

It is intentionally **unbranded** at the foundation level. All visual identity, tone, motion language, and content strategy are defined in this Blueprint and layered on top of the stable engineering foundation established in the previous phase.

This document is the single source of truth for design, UX, content, navigation, and implementation decisions. All future development must follow the specifications herein.

### Key Architectural Pillars

1. **Registry-First Architecture** — The `experiences.json` registry is the heart of the system.
2. **Experience Model** — Every piece of content is mounted as an isolated, composable Experience.
3. **Progressive Web App** — Installable, offline-capable, fast.
4. **Deep-Linkable** — Every experience and view has a stable, shareable URL.
5. **Accessible by Default** — WCAG 2.2 AA baseline.
6. **Analytics-Native** — Centralized, event-driven, privacy-respecting.
7. **Future-Proof** — New experiences can be added without touching core platform code.

---

## 2. Vision & Identity

### 2.1 Internal Name
**The Experience Platform** (or simply "Experience Platform")

This name reflects the fundamental shift from "website" or "collection of pages" to a composable system of experiences.

### 2.2 Public Identity (To Be Defined)
The public-facing name, tagline, and visual identity will be decided in a future iteration of this Blueprint. Until then:

- Current placeholder: "Platform"
- All branding decisions must be documented here before implementation.

### 2.3 Brand Philosophy

- **Minimal at the core**, expressive at the surface.
- The platform shell is quiet and respectful. Experiences are allowed to be loud.
- "Everything is an Experience" is not marketing copy — it is the organizing principle of the entire system.

### 2.4 Tone of Voice

| Context              | Tone                          |
|----------------------|-------------------------------|
| Platform shell       | Calm, clear, confident        |
| Navigation & chrome  | Helpful, lightweight          |
| Experience content   | Determined by the experience  |
| Error states         | Empathetic, actionable        |

---

## 3. Experience-First Model

### 3.1 Core Concept

We no longer think in "pages". We think in:

- **Experiences** — The atomic unit (mounted via `<experience-host>`)
- **Collections** — Curated groups of experiences (e.g. "Games", "Tools for Writers")
- **Stories** — Narrative journeys that may span multiple experiences
- **Updates** — Time-based or versioned content
- **Discovery surfaces** — Home, search, category views, recommendations

### 3.2 Experience Taxonomy

Current categories (from `src/content/experiences.json` + types):

```ts
type ExperienceCategory =
  | 'game'
  | 'application'
  | 'interactive'
  | 'utility'
  | 'experiment'
  | 'documentation'
  | 'media'
  | 'future';
```

**Future expansion** (to be added to types and registry):

- `story`
- `tool`
- `course`
- `portfolio-piece`
- `live-demo`

Every experience **must** declare:
- `id` (stable, URL-safe)
- `title`
- `description`
- `category`
- `tags[]`
- `module` (file reference)

### 3.3 The Experience Registry

**Location**: `src/content/experiences.json`

This JSON file is the **single source of truth** for all discoverable content.

Rules:
- Adding an experience = add entry here + create module in `src/experiences/`
- Registry drives home, search, index, sitemap, and recommendations
- No hard-coded lists of experiences anywhere else

---

## 4. Information Architecture & Navigation

### 4.1 Top-Level Navigation

Current routes (to be evolved):

| Route                  | Purpose                        | Experience Model |
|------------------------|--------------------------------|------------------|
| `/`                    | Discovery home                 | Collection of featured experiences + hero |
| `/experiences`         | Full experience index          | Collection view |
| `/experience/:id`      | Individual experience          | The Experience itself |
| `/docs`                | Platform documentation         | Documentation experience |

### 4.2 Recommended Evolution (Blueprint v1.1+)

Proposed primary navigation model:

- **Discover**
  - Home (featured + trending)
  - All Experiences (filterable grid)
  - Collections (curated groups)
- **Create / Journal** (future)
- **About / Manifesto**

Secondary / persistent:
- Search (global)
- Account / Profile (future)
- Install (PWA prompt)

### 4.3 URL Philosophy

- Human-readable and stable
- `/experience/canvas-demo` not `/e/abc123`
- Deep links always work (already supported via 404.html fallback + router)
- Query params used for state within experiences (e.g. `?level=3`)

### 4.4 Navigation Physics (Specification)

To be defined in detail:

- Active states (`aria-current`)
- Transition behavior between views (see Motion section)
- Mobile navigation behavior
- Keyboard navigation model
- Breadcrumbs (when needed)

---

## 5. Design Language (Tokens & Scales)

The current `src/style.css` is intentionally neutral. All visual decisions will be defined here first, then implemented.

### 5.1 Design Token System (Proposed)

```css
:root {
  /* Typography */
  --font-sans: ...;
  --font-display: ...;
  --font-mono: ...;

  /* Spacing (8px base) */
  --space-1: 0.125rem;
  --space-2: 0.25rem;
  --space-3: 0.5rem;
  --space-4: 0.75rem;
  --space-5: 1rem;
  --space-6: 1.5rem;
  --space-7: 2rem;
  --space-8: 3rem;
  --space-9: 4rem;

  /* Radii */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;

  /* Elevation */
  --shadow-sm: ...;
  --shadow-md: ...;
  --shadow-lg: ...;

  /* Motion */
  --duration-fast: 120ms;
  --duration-base: 200ms;
  --duration-slow: 320ms;
  --easing-standard: cubic-bezier(0.2, 0, 0, 1);
  --easing-emphasized: cubic-bezier(0.2, 0, 0, 1.2);
}
```

### 5.2 Color System

To be defined with:
- Semantic tokens (`--color-bg`, `--color-text`, `--color-accent`, `--color-surface`, etc.)
- Light + dark mode
- Brand palette (once decided)
- Accessibility contrast requirements (minimum 4.5:1)

### 5.3 Typography Scale

- Base: 16px / 1.5
- Display sizes
- Heading hierarchy
- Reading width: `--measure: 65ch`

### 5.4 Component Behaviors (High-Level)

- Buttons
- Cards
- Search input
- Experience host container
- Navigation items

Detailed interaction specs will be added in later versions.

---

## 6. UX Philosophy & Interaction Patterns

### 6.1 Core UX Principles

1. **Respect the experience** — The shell should disappear when an experience is active.
2. **Fast first** — Every interaction should feel instantaneous.
3. **Discoverable by default** — Users should never be lost.
4. **Progressive enhancement** — Works without JavaScript where possible (core content).
5. **Ownership** — Users feel they are in a living platform, not visiting a website.

### 6.2 Key Interaction Patterns

- Experience mounting / unmounting lifecycle
- Search with instant filtering + analytics
- Deep linking into any state
- Offline experience support (PWA)
- Focus management on route changes (already implemented)

---

## 7. Content & Experience Strategy

### 7.1 Content Types

| Type              | Description                              | Registry Category |
|-------------------|------------------------------------------|-------------------|
| Interactive Game  | Full playable game                       | `game`            |
| Utility Tool      | Practical single-purpose tool            | `utility`         |
| Experiment        | Creative or technical demo               | `experiment`      |
| Documentation     | Guides, reference, platform docs         | `documentation`   |
| Media Experience  | Video, audio, or visual storytelling     | `media`           |
| Application       | Multi-feature tool (future)              | `application`     |

### 7.2 Content Creation Guidelines

- Every experience must have a clear `title` + `description`
- Use tags liberally for discovery
- Experiences should be self-contained
- Platform-level documentation lives in the registry as an experience

### 7.3 Discovery Surfaces

- Home (curated hero + featured collections)
- Experiences index (search + filters)
- Category collections
- Related experiences (future)

---

## 8. SEO, Discovery & Metadata

### 8.1 Current State

- `index.html` meta tags
- `public/sitemap.xml`
- `public/robots.txt`
- Dynamic titles via router

### 8.2 Requirements

- Every experience must contribute to SEO (title, description, structured data)
- Sitemap must be regenerated from registry (future enhancement)
- Open Graph + Twitter cards per experience
- Canonical URLs

### 8.3 Future: Structured Data

Implement JSON-LD for:
- CreativeWork / SoftwareApplication for experiences
- CollectionPage for index views

---

## 9. Accessibility (Non-Negotiable)

**Target**: WCAG 2.2 AA

Current foundation (already strong):
- Semantic landmarks
- Skip links
- Focus management
- `aria-current`
- Reduced motion respect

**Blueprint Additions**:
- Color contrast audit process
- Keyboard-only navigation test matrix
- Screen reader experience checklist
- Focus visible states (enhanced)
- Live regions for dynamic content

---

## 10. Analytics & Telemetry Strategy

### 10.1 Current Architecture (Excellent)

- Centralized `src/platform/analytics.ts`
- Internal event bus (`src/platform/events.ts`)
- GA4 bridge + custom events
- `context.analytics.track()` available to every experience

### 10.2 Required Event Taxonomy (v1.0)

| Event                        | When it fires                              | Parameters |
|-----------------------------|--------------------------------------------|----------|
| `page_view`                 | Route change                               | title, path |
| `experience_opened`         | Experience host mounts                     | experience_id, category |
| `experience_started`        | User begins interacting                    | experience_id |
| `experience_completed`      | Significant completion milestone           | experience_id, metadata |
| `search_used`               | User performs search                       | term, result_count |
| `experience_viewed`         | User views experience detail page          | experience_id |

All experiences **must** emit events using the shared analytics context.

### 10.3 Privacy & Consent

- Respect `doNotTrack`
- Future: Consent banner + granular controls
- No tracking before consent (future)

---

## 11. Monetization Strategy (High-Level)

To be detailed in a dedicated appendix.

Initial directions:
- Google AdSense (non-intrusive placement)
- Amazon Associates / affiliate links (in relevant experiences)
- Future: Paid experiences / premium collections
- Platform-level sponsorships

**Rule**: Monetization must never degrade experience quality or accessibility.

---

## 12. Performance & Technical Constraints

### 12.1 Performance Budgets (v1.0)

| Metric                  | Target          |
|-------------------------|-----------------|
| LCP (Largest Contentful Paint) | < 2.0s     |
| INP (Interaction to Next Paint) | < 200ms   |
| CLS (Cumulative Layout Shift) | < 0.1     |
| First Byte                | < 600ms         |
| Total JS (initial)        | < 120KB gzipped |

### 12.2 Technical Rules

- All new experiences must be lazy-loaded
- No blocking scripts in shell
- Images must use appropriate formats + lazy loading
- Service worker precaching must be managed via Vite PWA plugin
- Maintain `npm run lint` + `npm run build` as gate

---

## 13. Motion & Animation Language

### 13.1 Philosophy

- Motion serves purpose (feedback, orientation, delight)
- Never used for decoration alone
- Respect `prefers-reduced-motion`

### 13.2 Tokenized Durations & Easings

(Defined in Section 5 — will be expanded)

Recommended starting values:
- Micro-interactions: 120–180ms
- View transitions: 200–280ms
- Page-level: 320–420ms

---

## 14. Implementation Guidelines for Future Agents

**This section is critical.**

1. **Never begin implementation** until the relevant section of this Blueprint has been approved.
2. All visual, motion, or UX changes must reference specific tokens or patterns defined here.
3. When adding new experiences, follow the exact Experience Module contract (`meta`, `mount`, optional `unmount`).
4. Update the registry before creating the module.
5. Run full build + test after every significant change.
6. Commit messages must reference the Blueprint section being implemented (e.g. `feat(design): implement button tokens per §5.3`).

---

## 15. Current State vs. Blueprint (Gap Analysis)

| Area                    | Current State                  | Blueprint Target          | Priority |
|-------------------------|--------------------------------|---------------------------|----------|
| Visual Design           | Neutral foundation             | Full design system        | High     |
| Navigation              | Basic 3-item nav               | Experience-first IA       | High     |
| Content Strategy        | 3 sample experiences           | Rich taxonomy + strategy  | Medium   |
| Motion                  | Minimal + reduced-motion       | Full motion language      | Medium   |
| Monetization            | None                           | Defined strategy          | Low      |
| SEO                     | Basic                          | Experience-level metadata | Medium   |
| Analytics               | Strong foundation              | Full event taxonomy       | Low      |

---

## 16. Roadmap

**Phase 1** — Platform Foundation (Completed)  
**Phase 2** — Platform Blueprint v1.0 (Current)  
**Phase 3** — Design System Implementation (per this Blueprint)  
**Phase 4** — Content & Experience Expansion  
**Phase 5** — Advanced Features (Collections, Stories, Journal, etc.)

---

## 17. Appendices (Future)

- A. Detailed Token Definitions
- B. Component Specification Sheets
- C. Experience Module Template
- D. Monetization Playbook
- E. Accessibility Test Matrix
- F. Performance Budget Enforcement

---

**This document supersedes all previous design decisions.**

From this point forward, the Experience Platform is built according to the specifications in **Platform Blueprint v1.0**.

---

*End of Platform Blueprint v1.0*  
Next version: v1.1 — Detailed Design Tokens + Navigation Physics