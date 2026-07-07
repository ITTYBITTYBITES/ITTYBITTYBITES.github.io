# BUILD ORDER 007: Discovery & Personalization

**Status:** Completed  
**Date:** 2026-07-07  
**Repository:** https://github.com/ITTYBITTYBITES/ITTYBITTYBITES.github.io  
**Branch:** main  

---

## Objective

Transform the platform from a static collection of experiences into a living, personalized discovery environment. Build a real discovery layer, local-first personalization, enhanced search, transparent recommendations, and a personal library — all without accounts, servers, or cloud dependencies.

---

## Phase 1: Discovery Layer

### Homepage Transformation

The homepage (`src/pages/home.ts`) is now a dynamic launch point instead of a static landing page.

**Sections implemented:**

| Section | Purpose | Data Source |
|---------|---------|-------------|
| **Search** | Instant full-platform search | `search-index.json` + `src/platform/search.ts` |
| **Welcome Back / Welcome** | Context-aware greeting | `getProfileSummary()` |
| **Quick Actions** | One-click continue/recommend | `getContinueExploringSuggestions()` + `getRecommendations()` |
| **Featured Collection** | Highlight uncompleted collection | `getFeatured()` |
| **Continue Playing** | In-progress experiences | `getContinueExploringSuggestions()` |
| **Recently Visited** | Last 4 played experiences | `getRecentlyVisitedExperiences()` |
| **Recommended for You** | Rules-based suggestions | `getRecommendations()` |
| **Browse by Collection** | Collection cards with progress | Registry + `getCollectionCompletion()` |
| **Browse by Theme** | Category cards with examples | `getBrowseByCategory()` |

### Search Enhancement

`src/platform/search.ts` provides full-text search across the generated `search-index.json`:

- Searches titles, descriptions, tags, and keywords
- Relevance scoring: title (10x), tags (7x), description (5x), general text (2x), exact match (+15)
- Results grouped by type with direct links
- Debounced at 150ms for instant feel
- Used on both homepage and experiences page

### Experiences Page Enhancement

`src/pages/experience-index.ts` now includes:
- Full-text search via `searchExperiences()`
- Category filter tabs with active state
- Progress badges on each card
- Empty state with guidance

---

## Phase 2: Personalization

### Local-First Profile

`src/platform/lifecycle.ts` (v3) stores a rich local profile:

```typescript
interface PlatformProfile {
  version: number;
  experiences: Record<string, ExperienceProgress>;
  collections: Record<string, CollectionProgress>;
  lastActiveExperienceId?: string;
  recentlyVisited: string[];
  completedCollections: string[];
  preferredCategories: Record<string, number>;
  lastVisit: number;
  totalVisits: number;
}
```

### Tracked Data

| Field | Purpose |
|-------|---------|
| `completedCollections` | Auto-detected when all experiences in a collection are completed |
| `preferredCategories` | Counts category visits to infer preferences |
| `lastVisit` | Timestamp of most recent platform visit |
| `totalVisits` | Total session starts across all experiences |
| `isFavorite` | Per-experience favorite toggle |

### Profile Summary

`getProfileSummary()` returns:
- Total experiences played
- Total completed
- Total collections completed
- Current streak (best across all experiences)
- Total visits
- Top category

---

## Phase 3: Search

### Architecture

- **Index:** `src/generated/search-index.json` (build-time generated from registry)
- **Engine:** `src/platform/search.ts` — client-side relevance scoring
- **Coverage:** Titles, descriptions, keywords, collections, stories, categories
- **Speed:** Debounced 150ms, instant results feel

### Search Results UI

- Dropdown overlay on homepage
- Grouped by type with visual badges
- Direct navigation to experiences, collections, or stories
- Keyboard-accessible

---

## Phase 4: Recommendations

### Rules-Based System

`src/platform/discovery.ts` → `getRecommendations()` implements transparent, explainable recommendations:

| Rule | Priority | Example |
|------|----------|---------|
| Continue where you left off | 100 | "Continue Echo Chamber" |
| Next in collection | 85 | "After Signal Detection, try Pattern Garden" |
| Same category | 70 | "If you enjoyed Signal Detection, try Memory Sequence" |
| Based on favorites | 65 | "More like Echo Chamber" |
| Based on preferred category | 60 | "Because you enjoy reflection experiences" |
| Complete the collection | 55 | "Complete Foundations (3/5 done)" |
| New to explore | 40 | "New to explore" |

No machine learning. No opaque algorithms. Every recommendation includes a human-readable reason.

---

## Phase 5: Library & Progress

### New Page: `/library`

`src/pages/library.ts` provides a personal dashboard:

**Stats Grid:**
- Experiences Played
- Completed
- Collections Done
- Day Streak
- Total Visits
- Top Category

**Sections:**
- Recently Visited (6 items)
- In Progress
- Favorites (with ★/☆ toggle)
- Completed
- Collection Progress (with progress bars)

**Actions:**
- Favorite toggle on in-progress items
- Reset All Progress (with confirmation)

### Empty State

When no progress exists, the library shows a welcoming empty state with a "Start Exploring" CTA.

---

## Phase 6: UX & Navigation

### Header Update

`src/components/app-header.ts` now includes:
- Home
- Experiences
- Collections
- Library

### Navigation Flow

- New users → Homepage → Browse by Collection/Theme → Experience
- Returning users → Homepage → Quick Actions / Continue Playing → Experience
- Explorers → Experiences page → Search + Category filters
- Trackers → Library → Stats + Progress + Favorites

---

## Phase 7: Architecture Validation

### Hierarchy Integrity
```
Platform
  └── Discovery (homepage)
        ├── Search
        ├── Featured
        ├── Continue Playing
        ├── Recently Visited
        ├── Recommendations
        ├── Browse by Collection
        └── Browse by Theme
  └── Library
        ├── Stats
        ├── Recently Visited
        ├── In Progress
        ├── Favorites
        ├── Completed
        └── Collection Progress
```

### Registry Architecture
- All content remains registry-driven ✅
- `search-index.json` build-time generated ✅
- No runtime content mutations ✅

### Local-First Guarantee
- No accounts ✅
- No servers ✅
- No cloud sync ✅
- `localStorage` only, version-safe (v3) ✅

### Quality Gates
- Schema validation ✅
- Accessibility metadata ✅
- Performance budgets ✅
- Privacy boundary ✅

---

## Files Changed

### New Files
- `src/platform/search.ts`
- `src/pages/library.ts`
- `governing/build_orders/BUILD_ORDER_007_DISCOVERY_AND_PERSONALIZATION.md`
- `governing/build_orders/BUILD_ORDER_007_COMPLIANCE_REPORT.md`

### Modified Files
- `src/platform/lifecycle.ts` — v3 profile with favorites, categories, collections, stats
- `src/platform/discovery.ts` — recommendations, featured, browse, library helpers
- `src/components/experience-host.ts` — category tracking, collection completion check
- `src/components/app-header.ts` — Library nav link
- `src/pages/home.ts` — Full discovery launch point
- `src/pages/experience-index.ts` — Enhanced search + category filters
- `src/main.ts` — Library route registration
- `src/style.css` — Discovery UI, search, suggestions, stats, library styles
- `test/content-regression.test.mjs` — 25 tests covering all new systems

---

## Verification Commands

```bash
npm test              # 25/25 tests pass
npm run build         # Full build + quality gates pass
```

---

## Compliance

- ✅ No accounts introduced
- ✅ No servers or cloud sync
- ✅ No registry architecture changes
- ✅ No build pipeline changes
- ✅ No public/private boundary changes
- ✅ No quality gates weakened
- ✅ Fully compatible with BUILD ORDERS 001–006
- ✅ Repository remains deployable

---

**End of Build Order 007**
