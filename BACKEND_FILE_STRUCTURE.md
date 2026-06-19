# 📁 BACKEND FILE STRUCTURE & ARCHITECTURE
**Repository**: `ITTYBITTYBITES.github.io`
**Core Objective**: Maintain a clean, modular, highly organized Git architecture that decouples developer maintenance automation from live production web files.

---

## 🏛️ Master Directory Map

```text
ITTYBITTYBITES.github.io/
│
├── 🌐 CORE PRODUCTION HUBS (Root)
│   ├── index.html                 # Central Intelligence HQ Landing
│   ├── arcade.html                # Interactive Tactical Arcade Hub
│   ├── library.html               # Amazon Affiliate Gear Locker Database
│   ├── feed.html                  # Live RSS Video & Intelligence Feed
│   ├── about.html                 # Cognitive Training Division Overview
│   ├── contact.html               # Secure Communication Portal
│   ├── sitemap.html               # HTML Index Sitemap for Human Agents
│   └── sitemap.xml                # XML Index Sitemap for Google Crawlers
│
├── 📚 RESEARCH BRIEFINGS (/articles)
│   ├── stroop-effect.html         # The Stroop Effect Deep Dive
│   ├── cognitive-biases.html      # 25 Cognitive Biases Breakdown
│   ├── flow-state.html            # How to Trigger Flow State on Demand
│   └── ... (20 total structured cognitive science HTML articles)
│
├── 🎮 LIVE MINI-GAMES (/games)
│   ├── /stroop-calibrator         # Interactive Multiple-Choice Stroop Primer
│   ├── /tachistoscope             # High-Speed Visual Recognition Trainer
│   └── ... (28 standalone operational HTML mini-game folders)
│
├── 🧠 OPERATIONAL BRIEFINGS (/intel)
│   ├── attentional-blink-*.html   # 16 professional division deflection briefings
│   ├── working-memory-*.html      # 16 working memory optimization guides
│   └── ... (100+ highly tailored professional operational pages)
│
├── 🛒 GEAR REVIEWS (/library)
│   ├── atomic-habits.html         # Amazon Affiliate Book Deep Review
│   ├── sony-wh-1000xm5-*.html     # Tactical Field Equipment Overview
│   └── ... (60 automated, SEO-optimized affiliate review pages)
│
├── 🛠️ DEVELOPER TOOLS (/dev-tools)
│   ├── build-engine.js            # Node.js Svelte/Static Generator Engine
│   ├── upgrade_html_architecture.js # HTML Overhaul Injector Script
│   ├── build_all_missing_games.py # Python Automated Game Suite Compiler
│   └── ... (18 isolated maintenance and compilation automation scripts)
│
└── 📦 PIPELINE & DATA CATALOGS
    ├── /data                      # Remote JSON Manifests for Godot Mobile App
    ├── /core-data                 # Backup Data Manifests and Schemas
    ├── /pipeline-data             # Dynamic Persona & Universe JSON Topologies
    ├── /assets                    # CSS Tailwind overrides and Core Graphics
    ├── games.json                 # Interactive Registry loaded by portal.js
    └── portal.js                  # Operational Svelte Module powering the Arcade
```

---

## 🔗 How Data & Traffic Move

### 1. The Web Simulation Bridge (`/demo` integration)
Your native Android Godot app repository (`2-second-witness-mobile`) contains an automated `[preset.1]` build configuration for HTML5 Web builds. When compiled, the static Web assembly can be dropped directly into this Website repository. The live `arcade.html` hub seamlessly links users into the Godot HTML simulation without needing a standalone third domain.

### 2. SEO Meta-Redirect Architecture
To protect existing external Google search indexing, the root directory maintains lightweight `0-second Meta Redirect` HTML stubs for all relocated research briefings. For example, if a legacy crawler accesses `https://ittybittybites.github.io/stroop-effect.html`, it is instantly redirected to the clean target at `./articles/stroop-effect.html` while passing pristine relative canonical link parameters.

### 3. Isolated Developer Utilities
All Node.js (`.js`) maintenance scripts and Python (`.py`) automated pipeline tools live safely inside `/dev-tools`. They do not pollute the live web folder hierarchy, guaranteeing that `npm run` or manual terminal maintenance operations remain cleanly decoupled from public HTTP GET responses.
