# Two Second Witness — Phase 3 Demo Integration System

**Can You Trust What You Just Saw?**

A fast-paced visual memory and perception game where every scene lasts only two seconds. One detail changes. Your mind decides what it remembers.

---

## About This Repository

This repository hosts the **unified playable static website architecture** for Two Second Witness — featuring an embedded browser-based vertical slice trial system.

It combines our Phase 1 cinematic splash landing page (`/website/index.html`), Phase 2 scalable multi-page SEO architecture (`/website/pages/*.html`), and Phase 3 interactive demo integration engine (`/website/js/demo_engine.js`).

## Structure

```
/website/
├── index.html                  — Original Splash Landing Page (intact functionality)
├── sitemap.xml                 — Full SEO XML sitemap covering all pages
├── robots.txt                  — Search crawler directives
├── pages/
│   ├── home.html               — Architecture Overview & Hub
│   ├── worlds.html             — Game Biomes with Phase 3 Trial Launchers
│   ├── scenarios.html          — Cognitive Scenarios + #demo-root Trial Mount Point
│   ├── faq.html                — General & Technical Knowledge Base
│   ├── press.html              — Press Kit, Fact Sheet & Asset Placeholders
│   ├── blog.html               — Scaffolded Development Chronicles
│   └── legal.html              — Terms of Service, Privacy Policy & WCAG Compliance
├── css/
│   └── main.css                — Expanded layout, typography, card & button systems (zero frameworks)
├── js/
│   ├── demo_engine.js          — Core 11-step playable timing & scoring loop (vanilla JS)
│   ├── scenarios.js            — Data-driven stub scenarios (Ancient Egypt, Vikings, Mars Colony)
│   └── main.js                 — Responsive navigation toggle & accessibility handlers
└── assets/
    └── images/                 — Favicon SVG and placeholder assets
README.md
```

## Phase 3 Demo Engine Highlights

- **Pure Vanilla JS Engine (`demo_engine.js`):** Implements the exact 11-step gameplay loop: Scenario Init → Scene A Load → 3s Countdown → Exactly 2000ms Observation → 400ms Blackout Fade → Scene B Testimony Input → Speed/Accuracy Evaluation → Persistent Forensic Result Card → Retry/Next Handlers.
- **Data-Driven Scenarios (`scenarios.js`):** Modular schema decoupling engine logic from scenario content. Includes 3 high-detail SVG geometric trials with distinct anomalies.
- **Precision Timing & Scoring:** Accurate millisecond reaction speed tracking (`performance.now()`) with three tier ratings: *Master Witness* (≤2.2s), *Sharp Observer* (>2.2s), or *Keep Practicing*.
- **Full Keyboard Accessibility:** Supports instantaneous anomaly testimony selection via number keys `1`-`4` alongside mouse/touch input.
- **Zero Layout Shift & Zero Frameworks:** Sub-1.5s load target maintained across all devices.

## Roadmap & Readiness

- **Phase 1:** Clean Splash Landing Page & Git History Sanitization — **Completed**
- **Phase 2:** Multi-Page Static Website Architecture & Content Scaffolding — **Completed**
- **Phase 3:** Unified Browser Playable Demo Integration System — **Completed**
- **Phase 4:** Content Expansion, Marketing Ecosystem & Viral Share Cards — **Ready for Phase 4**

## License

All rights reserved. © 2026 Two Second Witness
