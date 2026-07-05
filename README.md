# Two Second Witness — Phase 6 Controlled Launch Activation Layer

**Can You Trust What You Just Saw?**

A fast-paced visual memory and perception game where every scene lasts only two seconds. One detail changes. Your mind decides what it remembers.

---

## About This Repository

This repository hosts the **public controlled launch activation layer and acquisition ecosystem** for Two Second Witness.

It integrates our Phase 1 cinematic splash landing page (`/website/index.html`), Phase 2 scalable multi-page SEO architecture (`/website/pages/*.html`), Phase 3 interactive demo engine (`/website/js/demo_engine.js`), Phase 4 content & viral sharing network (`/website/js/share_cards.js`), Phase 5 stability & mobile hardening pass (`/website/js/analytics.js`), and Phase 6 canonical entry routing & traffic source tagging (`/website/js/launch_config.js`).

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
│   └── main.css                — Hardware accelerated 60fps layout, typography, onboarding pulse & safe areas
├── js/
│   ├── launch_config.js        — Phase 6 Controlled launch configuration, dev HUD & first-visit onboarding
│   ├── analytics.js            — Static-safe telemetry layer (demo_start, scenario_complete, share_card_generated)
│   ├── demo_engine.js          — Hardened 11-step playable loop with race condition cleanup and debouncing
│   ├── scenarios.js            — Extended Data-Driven Database (15 Scenarios across 5 Biomes)
│   ├── share_cards.js          — Viral share cards, HTML5 Canvas image generator & ghost challenge links
│   └── main.js                 — Responsive navigation toggle & accessibility handlers
└── assets/
    └── images/                 — Favicon SVG and placeholder assets
README.md
```

## Phase 6 Controlled Launch Highlights

- **Canonical Entry Consolidation:** Root `/index.html` serves as a unified gateway directing standard traffic to `/website/index.html` while automatically intercepting and forwarding viral challenge and trial deep-links (`?world=...&scenario=...&src=share`) directly into `/website/pages/scenarios.html`.
- **Launch State Config (`launch_config.js`):** Centralized experiment flags (`demo_ui_variant: "A"`, `onboarding_variant: "minimal"`), first-session friction reduction, and temporary dev HUD (`window.__WITNESS_DEBUG`).
- **No-Backend Traffic Source Tagging:** Automatically captures query attributes (`?src=reddit`, `?src=twitter`, `?src=direct`) into `sessionStorage.trafficSource` and binds them to all core events (`demo_start`, `scenario_complete`, `share_card_generated`, `challenge_link_opened`).
- **Hardened Viral Share Loop:** All generated share links resolve directly to the canonical root domain ensuring zero broken challenge states across social platforms.

## Production Status

- **Phase 1:** Clean Splash Landing Page & Git History Sanitization — **Completed**
- **Phase 2:** Multi-Page Static Website Architecture & Content Scaffolding — **Completed**
- **Phase 3:** Unified Browser Playable Demo Integration System — **Completed**
- **Phase 4:** Content, Viral Loop, Share Cards & SEO Ecosystem Layer — **Completed**
- **Phase 5:** Production Launch Hardening, Mobile UX Polish & Analytics — **Completed**
- **Phase 6:** Controlled Launch Activation, Source Tracking & Entry Consolidation — **Completed & Live**

## License

All rights reserved. © 2026 Two Second Witness
