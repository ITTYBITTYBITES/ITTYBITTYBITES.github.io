# Two Second Witness — Phase 4 Content & Growth Architecture

**Can You Trust What You Just Saw?**

A fast-paced visual memory and perception game where every scene lasts only two seconds. One detail changes. Your mind decides what it remembers.

---

## About This Repository

This repository hosts the **self-propagating content, SEO, and viral sharing network** for Two Second Witness — built around our embedded browser vertical slice trial system.

It transforms our static engine into a discoverable, shareable acquisition system with zero backend dependencies.

## Structure

```
/website/
├── index.html                  — Original Splash Landing Page (intact functionality)
├── sitemap.xml                 — Full SEO XML sitemap covering 22 indexed URLs
├── robots.txt                  — Search crawler directives
├── pages/
│   ├── home.html               — Architecture Overview & Hub
│   ├── worlds.html             — Game Biomes Hub
│   ├── scenarios.html          — Playable Demo Mount Point (#demo-root) + Viral Challenge Hook
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
│   └── main.css                — Expanded layout, typography, card & button systems (zero frameworks)
├── js/
│   ├── demo_engine.js          — Core 11-step playable timing & scoring loop (vanilla JS - Frozen Phase 3)
│   ├── scenarios.js            — Extended Data-Driven Database (15 Scenarios across 5 Biomes)
│   ├── share_cards.js          — Viral share cards, HTML5 Canvas image generator & ghost challenge links
│   └── main.js                 — Responsive navigation toggle & accessibility handlers
└── assets/
    └── images/                 — Favicon SVG and placeholder assets
README.md
```

## Phase 4 Ecosystem Highlights

- **Extended Scenario Registry (`scenarios.js`):** Expanded to **15 distinct data-driven scenarios** (3 per world across Ancient Egypt, Vikings, Mars Colony, Fantasy, and Cyberpunk).
- **SEO Landing Page Network:** Dedicated keyword-optimized entry points for worlds (`/worlds/*.html`), individual cognitive scenarios (`/scenarios/*.html`), and long-form articles (`/blog/*.html`).
- **Structured Data Layer:** JSON-LD schema injected across discovery pages (`VideoGame`, `Article`, `FAQPage`, and `BreadcrumbList`).
- **Shareable Result Card Engine (`share_cards.js`):** Intercepts trial completion to dynamically render custom testimony cards. Features one-click clipboard text copying, instant HTML5 `<canvas>` PNG image card downloads, and **Viral Challenge Links** (`?challenge=...&time=...`).
- **Zero Backend Viral Loop:** Incoming challenger links generate a live **Ghost Challenge Banner** comparing reaction speed targets against friends.

## Roadmap & Readiness

- **Phase 1:** Clean Splash Landing Page & Git History Sanitization — **Completed**
- **Phase 2:** Multi-Page Static Website Architecture & Content Scaffolding — **Completed**
- **Phase 3:** Unified Browser Playable Demo Integration System — **Completed**
- **Phase 4:** Content, Viral Loop, Share Cards & SEO Ecosystem Layer — **Completed**
- **Phase 5:** Launch Hardening, Analytics Hooks & Conversion Tuning — **Ready for Phase 5**

## License

All rights reserved. © 2026 Two Second Witness
