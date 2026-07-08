# ITTYBITTYBITES

> **ITTYBITTYBITES is a growing library of interactive experiences that help people understand the world, one bite at a time.**

Explore history, science, nature, creativity, engineering, mathematics, society and mind, and more through short, hands-on experiences designed to make complex ideas approachable.

Every collection is built around a simple belief:  
*Understanding grows through interaction.*

---

## Platform Foundation v1.0 (Frozen)

The technical architecture of the ITTYBITTYBITES platform is complete, frozen, and fully stabilized. All future work is dedicated entirely to **Library Season 1** — creating interactive experiences that are memorable, handcrafted, and beautiful.

Work is cleanly divided into two peer disciplines:
*   **Engineering protects the platform** (located in `governing/foundation/`).
*   **Editorial protects the library** (located in `governing/editorial/`).

---

## Getting Started

### For Visitors & Explorers
To run the library locally on your machine:

1.  **Clone & Install**:
    ```bash
    npm ci
    ```
2.  **Start Dev Server**:
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173` to explore the bookshelf.

### For Contributors & Authors
Before contributing to the library, please orient yourself with our specifications:

*   **Who we are & why we exist**: Read the [Library Vision](governing/editorial/VISION.md).
*   **The feeling and personality of our experiences**: Read the [Editorial Voice](governing/editorial/EDITORIAL_VOICE.md).
*   **Our standards for curated experiences**: Read the [Content System](governing/editorial/CONTENT_SYSTEM.md).
*   **The outcomes & permanent citations of all books**: Read the [Library Compass](governing/editorial/LIBRARY_COMPASS.md).
*   **Step-by-step authoring workflows & checklists**: Read the [Curation Guide](governing/editorial/CURATION_GUIDE.md).
*   **The platform's technical architecture**: Read the [Platform Blueprint](governing/foundation/PLATFORM_BLUEPRINT.md) and [Product Constitution](governing/foundation/PRODUCT_CONSTITUTION.md).
*   **Analytics and Privacy**: Read the [GA4 & Privacy Configuration](docs/ANALYTICS.md) to understand configuration points and privacy safeguards.
*   **Library Season 1 visual system**: Read the [Visual Asset Audit](docs/LIBRARY_SEASON_1_VISUAL_AUDIT.md) and [Illustration System](docs/ILLUSTRATION_SYSTEM.md) before extending collection artwork.

---

## Technical Commands

*   **Production Build**:
    ```bash
    npm run build
    ```
    This validates all content and assets, compiles TypeScript, bundles code via Vite, and generates developer diagnostics.
*   **Run Regression Tests**:
    ```bash
    npm test
    ```
    Runs our automated suite of 73 quality gates to verify schema validity, lazy loading, and asset integrity.

---

*Waking up tomorrow to think: **"What should people discover next in the library?"***
