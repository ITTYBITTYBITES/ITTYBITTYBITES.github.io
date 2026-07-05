# Two Second Witness — Phase 2 Architecture Build

**Can You Trust What You Just Saw?**

A fast-paced visual memory and perception game where every scene lasts only two seconds. One detail changes. Your mind decides what it remembers.

---

## About This Repository

This repository hosts the **scalable static website architecture** for Two Second Witness — structured and scaffolded in preparation for Phase 3 interactive demo integration.

It retains the original Phase 1 coming-soon splash landing page (`/website/index.html`) while expanding into a multi-page SEO-optimized website architecture.

## Structure

```
/website/
├── index.html                  — Original Splash Landing Page (intact functionality)
├── sitemap.xml                 — Full SEO XML sitemap covering all pages
├── robots.txt                  — Search crawler directives
├── pages/
│   ├── home.html               — Architecture Overview & Hub
│   ├── worlds.html             — 5 Biome Card Placeholders (Ancient Egypt, Vikings, Mars Colony, Fantasy, Cyberpunk)
│   ├── scenarios.html          — 4 Cognitive Scenario Placeholders (Memory Recall, Spot Difference, Sequence Memory, Pattern Recognition)
│   ├── faq.html                — General & Technical Knowledge Base
│   ├── press.html              — Press Kit, Fact Sheet & Asset Placeholders
│   ├── blog.html               — Scaffolded Development Chronicles
│   └── legal.html              — Terms of Service, Privacy Policy & WCAG Compliance
├── css/
│   └── main.css                — Expanded layout, typography, card & button systems (zero frameworks)
├── js/
│   └── main.js                 — Responsive navigation toggle & accessibility handlers (zero dependencies)
└── assets/
    └── images/                 — Favicon SVG and placeholder assets
README.md
```

## Phase 2 Architecture Highlights

- **Pure Static Stack:** Built with semantic HTML5, CSS Grid/Flexbox utilities, and vanilla JS. Zero frameworks or dependencies.
- **Global Navigation System:** Accessible, keyboard-navigable header with mobile hamburger drawer support.
- **Scalable Component System:** Modular card, button, and badge systems ready for Phase 3 gameplay hooks.
- **Full SEO Baseline:** Optimized `<title>` tags, semantic headings (H1 → H2 → H3), Open Graph & Twitter Cards, canonical URLs, and XML sitemap.
- **Accessibility & Performance Compliant:** WCAG 2.1 AA contrast ratios, screen reader skip links, focus trapping, and sub-1.5s load target.

## Roadmap & Readiness

- **Phase 1:** Clean Splash Landing Page & Git History Sanitization — **Completed**
- **Phase 2:** Multi-Page Static Website Architecture & Content Scaffolding — **Completed**
- **Phase 3:** Interactive WebGL / HTML5 Playable Demo Integration — **Ready for Integration**

## License

All rights reserved. © 2026 Two Second Witness
