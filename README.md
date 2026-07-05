# Two Second Witness — Phase 5 Production Hardening & Product Polish

**Can You Trust What You Just Saw?**

A fast-paced visual memory and perception game where every scene lasts only two seconds. One detail changes. Your mind decides what it remembers.

---

## About This Repository

This repository hosts the **public production-hardened static web application and acquisition ecosystem** for Two Second Witness.

It integrates our Phase 1 cinematic splash landing page (`/website/index.html`), Phase 2 scalable multi-page SEO architecture (`/website/pages/*.html`), Phase 3 interactive demo engine (`/website/js/demo_engine.js`), Phase 4 content & viral sharing network (`/website/js/share_cards.js`), and Phase 5 stability, analytics, WCAG 2.1 AA accessibility, and mobile polish safeguards.

## Structure

```
/website/
├── index.html                  — Original Splash Landing Page (intact functionality)
├── sitemap.xml                 — Full SEO XML sitemap covering 22 indexed URLs
├── robots.txt                  — Search crawler directives
├── pages/
│   ├── home.html               — Architecture Overview & Hub
│   ├── worlds.html             — Game Biomes Hub
│   ├── scenarios.html          — Hardened Playable Demo Mount Point (#demo-root) + Analytics & Share Hooks
│   ├── faq.html                — General & Technical Knowledge Base
│   ├── press.html              — Press Kit, Fact Sheet & Asset Placeholders
│   ├── blog.html               — Research & Cognitive Blog Index
│   ├── legal.html              — Terms of Service, Privacy Policy & WCAG Compliance
│   ├── worlds/                 — Dedicated SEO Primary Biome Entry Points
│   │   ├── egypt.html
│   │   ├── vikings.html
│   │   ├── mars.html
│   │   ├── fantasy.html
│   │   └── cyberpunk.html
│   ├── scenarios/              — Dedicated SEO Discovery Landing Pages
│   │   ├── pharaohs-chamber.html
│   │   ├── shipyard-storm.html
│   │   └── reactor-core-drift.html
│   └── blog/                   — Long-Form SEO Indexable Articles
│       ├── why-your-brain-lies-after-2-seconds.html
│       ├── what-is-change-blindness.html
│       ├── can-memory-be-trained-like-a-muscle.html
│       ├── the-science-behind-visual-attention.html
│       ├── why-fast-perception-games-improve-focus.html
│       └── how-two-second-witness-was-designed.html
├── css/
│   └── main.css                — Hardware accelerated 60fps layout, typography, WCAG focus outlines & safe areas
├── js/
│   ├── analytics.js            — Static-safe custom event telemetry layer (demo_start, scenario_complete, share_card_generated)
│   ├── demo_engine.js          — Hardened 11-step playable loop with race condition cleanup and debouncing
│   ├── scenarios.js            — Extended Data-Driven Database (15 Scenarios across 5 Biomes)
│   ├── share_cards.js          — Viral share cards, HTML5 Canvas image generator & ghost challenge links
│   └── main.js                 — Responsive navigation toggle & accessibility handlers
└── assets/
    └── images/                 — Favicon SVG and placeholder assets
README.md
```

## Phase 5 Production Hardening Highlights

- **60fps Performance & Hardware Acceleration:** Applied `will-change` and `translateZ(0)` on animation layers and timers. Achieves 95+ mobile performance targets with zero layout shifts.
- **Demo Engine Safeguards:** Implemented exact timer clearing (`clearAllTimers()`) to prevent race conditions during rapid retries. Added double-click input submission lock (`isProcessingInput`) and defensive URL parameter bounds checks.
- **Mobile Touch & Safe Area Polish:** Enforced minimum 48px touch targets for thumb navigation on 320px+ viewports, iOS notch environment safe area padding (`env(safe-area-inset-*)`), and overflow prevention.
- **WCAG 2.1 AA Accessibility:** Full keyboard interaction across all 15 scenarios (`1`-`4` number keys, `Tab`/`Enter`), high-visibility cyan focus indicators, screen reader live regions (`aria-live="polite"`), and `<noscript>` fallbacks.
- **Static-Safe Telemetry (`analytics.js`):** Lightweight custom event dispatcher emitting `demo_start`, `scenario_complete`, `share_card_generated`, and `challenge_link_opened` without external dependencies.

## Production Status

- **Phase 1:** Clean Splash Landing Page & Git History Sanitization — **Completed**
- **Phase 2:** Multi-Page Static Website Architecture & Content Scaffolding — **Completed**
- **Phase 3:** Unified Browser Playable Demo Integration System — **Completed**
- **Phase 4:** Content, Viral Loop, Share Cards & SEO Ecosystem Layer — **Completed**
- **Phase 5:** Production Launch Hardening, Mobile UX Polish & Analytics — **Completed & Deployed Live**

## License

All rights reserved. © 2026 Two Second Witness
