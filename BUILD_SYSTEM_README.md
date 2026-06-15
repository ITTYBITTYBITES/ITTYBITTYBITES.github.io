# Build System — Automated Programmatic SEO Engine

## Overview

This repository uses a **server-side Static Site Generation (SSG) pipeline** driven by GitHub Actions. Every night at 2:00 AM UTC (and on every push to `main`), the build engine runs on GitHub's servers — not in the user's browser — producing thousands of pre-rendered, lightning-fast HTML pages.

The pipeline:
1. Fetches live science/book RSS feeds at build time (server-side)
2. Cross-references topic and persona data matrices
3. Generates all permutations into pre-rendered HTML pages
4. Updates `sitemap.xml` with every new URL
5. Auto-commits everything back to `main`, triggering GitHub Pages deployment

**Result:** Googlebot indexes fully-rendered pages instantly. Zero client-side JavaScript bottleneck.

---

## File Structure

```
├── build-engine.js            ← Master build script (Node.js)
├── package.json               ← Dependencies + npm scripts
├── .github/
│   └── workflows/
│       └── programmatic-build.yml  ← GitHub Actions workflow
├── core-data/
│   └── manifest.json          ← Book/product catalog (source of truth)
├── pipeline-data/
│   ├── topics.json            ← Topic matrix (20 topics)
│   ├── personas.json          ← Persona matrix (12 personas)
│   ├── universes.json         ← Universe categories
│   └── worlds/*.json          ← 63 subject world files
├── templates/
│   ├── template.html          ← Library page template
│   └── page-template.html     ← Intel page template (auto-built)
├── library/                   ← Generated library pages (~65)
├── intel/                     ← Generated intel pages (topic × persona = 240)
├── library.html               ← Updated with dynamic catalog
└── sitemap.xml                ← Updated with all generated URLs
```

**Note:** `pipeline-data/` is used by the SSG pipeline and is completely separate from any `data/` folder used by other project tools (e.g. Android game assets).

---

## Running Locally

```bash
# Install dependencies
npm install

# Full build (library + intel + sitemap)
npm run build

# Section-specific builds
npm run build:library   # Only library pages
npm run build:intel     # Only intel pages
npm run build:feeds     # Only feed scraping

# Dry run (shows what would be generated without writing files)
npm test

# Single topic/persona test
node build-engine.js --section=library --dry-run
```

---

## Page Count Architecture

| Source | Pages Generated |
|---|---|
| `core-data/manifest.json` catalog | ~65 library pages |
| `pipeline-data/topics.json` × `pipeline-data/personas.json` | 20 × 12 = **240 intel pages** |
| Static pages (`index.html`, etc.) | ~25 pre-existing |
| **Total programmatic pages** | **~330 pages** |

---

## Feed Configuration

Live feeds are fetched **server-side at build time** from:
- ScienceDaily Mind & Brain RSS
- NPR Books RSS
- MIT Technology Review RSS

Throttle rate: **1.2 seconds** between requests to avoid firewall blocks.

To add a new feed, edit the `fetchLiveFeedData()` function in `build-engine.js`.

---

## Extending the Topic Matrix

To add a new topic, edit `pipeline-data/topics.json`:

```json
{
  "slug": "my-new-topic",
  "title": "My New Topic Title",
  "focus": "what this topic optimizes for",
  "icon": "🔮",
  "color": "#ff6b35",
  "universe": "science",
  "relatedBooks": ["book-slug-1", "book-slug-2"]
}
```

The build engine automatically picks up new topics and generates cross-product pages for all personas.

---

## Extending the Persona Matrix

To add a new persona, edit `pipeline-data/personas.json`:

```json
{
  "slug": "my-new-persona",
  "name": "My New Persona Name",
  "description": "Description of this target user",
  "tags": ["tag1", "tag2", "tag3"],
  "universe": "tech"
}
```

---

## GitHub Actions Schedule

The workflow runs:
- **Automatically**: Every day at `02:00 UTC`
- **On push**: When `core-data/`, `pipeline-data/`, `templates/`, `build-engine.js`, or `package.json` changes
- **Manually**: Via `workflow_dispatch` from the GitHub Actions dashboard

---

## Technical Safeguards

- **Relative paths only** — All template links use `../` relative paths. GitHub Pages deploys to subfolder paths, so no `/css/style.css` root-relative paths are used.
- **1.2s throttle** — Outbound feed requests are throttled to prevent firewall blocks.
- **Idempotent sitemap** — sitemap.xml is rebuilt from scratch each run; no duplicate entries.
- **Clean + rebuild** — Output directories are wiped before each build to remove stale pages.
- **Affiliate tag extraction** — The engine reads existing HTML files to auto-detect the active Associate tag.

---

## Adding New Pages to the Static Catalog

To add a new book/product to the library:

1. Add an entry to `core-data/manifest.json` under the `catalog` array
2. Include: `asin`, `slug`, `category`, `title`, `author`, `targetKeywords`, `summary`, `deepDiveBriefing`
3. Run `npm run build` (or wait for the nightly scheduled run)
4. The new page is automatically generated, catalog is updated, and sitemap is refreshed

---

## Google Search Console Setup

1. Submit `sitemap.xml` once to Google Search Console
2. Google reads the sitemap on its own schedule
3. Nightly builds automatically add new URLs to the sitemap
4. No manual re-submission needed — Google tracks changes via the sitemap

---

## ⚠️ Important Notes

- The build script runs on **GitHub's servers** — no local machine needed for production
- Generated pages are **committed back to the repo** — this means every build creates a commit
- The `intel/` directory gets **240 new pages** on each full run — keep this in mind for repo size
- If you hit rate limits on feed fetching, increase `CONFIG.feedThrottleMs` in `build-engine.js`
- The `pipeline-data/` folder is **completely separate** from any `data/` folder used by other project tools