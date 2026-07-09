# BUILD ORDER 008: History Collection

**Status:** Completed  
**Date:** 2026-07-07  
**Repository:** https://github.com/ITTYBITTYBITES/ITTYBITTYBITES.github.io  
**Branch:** main  

---

## Objective

Prove the platform scales by creating an entirely new Collection using only content files and experience modules — without modifying platform architecture. This is the real scalability test.

> **Success criterion:** No platform code should require modification solely because a second Collection exists. Any architectural changes must be justified as general improvements that benefit all Collections.

---

## Phase 1: Collection Definition

### Collection: History

**Content file:** `src/content/collections/history.json`

| Field | Value |
|-------|-------|
| Title | History |
| Description | Explore how evidence, perspective, and interpretation shape our understanding of the past. Not dates to memorize — questions to wrestle with. |
| Experiences | 5 |
| Story | Echoes of Evidence |
| Estimated Duration | 30-50 min |

### Story: Echoes of Evidence

**Content file:** `src/content/stories/echoes-of-evidence.json`

Six narrative segments:
1. **Intro** (`collection_start`) — The fragments remain
2. **Accounts to Artifacts** (`after_dueling-accounts`) — Objects outlast words
3. **Artifacts to Chronology** (`after_unlabeled`) — Order is an argument
4. **Chronology to Causation** (`after_chronology`) — One thing leads
5. **Causation to Perspective** (`after_chain-reaction`) — No single view
6. **Completion** (`collection_complete`) — You are now part of the chain

---

## Phase 2: Experience Design

Every experience revolves around **observation, interpretation, evidence, and decision-making** — not memorizing dates or facts.

### 1. Dueling Accounts (Primary Source)

**File:** `src/experiences/dueling-accounts.ts`

Two eyewitness accounts of the same fictional harbor incident are presented side by side. Users click on phrases that differ meaningfully between versions. Each difference reveals an explanation about how perspective shapes narrative.

**Interaction pattern:** Side-by-side comparison with clickable differences
**Skills:** Source comparison, bias detection, close reading
**Persistence:** Tracks which differences the user has found across sessions

### 2. Unlabeled (Artifact Analysis)

**File:** `src/experiences/unlabeled.ts`

An artifact description is presented with no date, name, or context. Users answer three inference questions (era, purpose, origin) via multiple choice. After submitting, the actual context is revealed with an explanation of what the physical evidence suggested.

**Interaction pattern:** Evidence-based inference with reveal
**Skills:** Material culture analysis, contextual reasoning
**Persistence:** Tracks accuracy percentage across artifacts

### 3. Chronology (Timeline Reconstruction)

**File:** `src/experiences/chronology.ts`

Five events are presented with descriptions and evidence snippets — but no dates. Users reorder them by clicking to move events up/down (or using arrow keys). Validation checks logical sequence, not memorized dates.

**Interaction pattern:** Click-to-reorder sequence with logical validation
**Skills:** Causal reasoning, chronological inference
**Persistence:** Tracks sets completed and attempts

### 4. Chain Reaction (Cause & Consequence)

**File:** `src/experiences/chain-reaction.ts`

A branching decision tree where users build chains of historical consequence. Starting from a single event (a city diverts its river), each choice leads to a new situation with 2-3 options. There are 24 nodes, 14 possible endings, and multiple valid paths.

**Interaction pattern:** Branching narrative with choice chains
**Skills:** Causal reasoning, systems thinking, exploring counterfactuals
**Persistence:** Tracks chains completed and nodes visited

### 5. Witness Accounts (Historical Perspective)

**File:** `src/experiences/witness-accounts.ts`

The same fictional treaty ceremony is viewed through three perspectives: a military commander, a document scribe, and a field healer. Each reveals details the others miss. A final insight panel appears only after all three have been viewed.

**Interaction pattern:** Multi-lens perspective toggle
**Skills:** Perspective-taking, understanding incomplete information
**Persistence:** Tracks which perspectives have been viewed

---

## Phase 3: Platform Scalability Validation

### What Was Required

**New content files only:**
- `src/content/collections/history.json`
- `src/content/stories/echoes-of-evidence.json`
- `src/content/experiences/dueling-accounts.json`
- `src/content/experiences/unlabeled.json`
- `src/content/experiences/chronology.json`
- `src/content/experiences/chain-reaction.json`
- `src/content/experiences/witness-accounts.json`
- `src/experiences/dueling-accounts.ts`
- `src/experiences/unlabeled.ts`
- `src/experiences/chronology.ts`
- `src/experiences/chain-reaction.ts`
- `src/experiences/witness-accounts.ts`

### What Scaled Automatically

| System | Behavior | Platform Change Required |
|--------|----------|-------------------------|
| Registry generation | Picked up 10 experiences, 2 collections, 3 stories | None |
| Search index | Included all new content automatically | None |
| Relationships graph | Built `history` collection mappings automatically | None |
| Content validation | Validated all new JSON against schemas | None |
| Discovery (homepage) | Featured Collection, Browse by Collection, Browse by Theme all include History | None |
| Recommendations | Rules-based system surfaces History experiences naturally | None |
| Library | Collection Progress shows History automatically | None |
| Experience lazy-loading | Vite glob picked up new `.ts` modules automatically | None |
| Router | No new routes needed — uses existing `/experience/:id` | None |

### Platform Changes Made

**Only one code fix — a genuine defect, not an architecture change:**

- `src/experiences/chain-reaction.ts` line 21: Fixed an unescaped apostrophe inside a single-quoted string (`region's` → `"region's"`). This is a TypeScript syntax bug in the experience module itself, not a platform change.

**No platform files were modified.** The following files remained completely unchanged:
- `src/platform/registry.ts`
- `src/platform/router.ts`
- `src/platform/types.ts`
- `src/platform/config.ts`
- `src/platform/events.ts`
- `src/platform/analytics.ts`
- `src/platform/pwa.ts`
- `src/platform/utils.ts`
- `src/platform/discovery.ts`
- `src/platform/lifecycle.ts`
- `src/platform/search.ts`
- `src/components/skip-link.ts`
- `src/components/app-footer.ts`
- `src/components/app-header.ts`
- `src/components/experience-host.ts`
- `src/pages/home.ts`
- `src/pages/library.ts`
- `src/pages/collections.ts`
- `src/pages/experience.ts`
- `src/pages/experience-index.ts`
- `vite.config.ts`
- `tsconfig.json`
- `package.json`
- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`

---

## Phase 4: Quality Gates

### Test Results

```
npm test
# tests 30
# suites 1
# pass 30
# fail 0
```

New tests added for BUILD ORDER 008:
- History collection contains 5 experiences
- Echoes of Evidence story has segments
- History experiences span multiple categories
- All history modules export valid ExperienceModule
- History story references all its experiences
- No platform files modified solely for second collection

### Build Results

```
npm run build
# ✅ Validation passed (10 experiences, 2 collections, 3 stories)
# ✅ TypeScript compilation clean
# ✅ Vite build successful
```

### Bundle Analysis

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Experiences | 5 | 10 | +5 |
| Collections | 1 | 2 | +1 |
| Stories | 2 | 3 | +1 |
| Main bundle (js) | 43.68 kB | 52.95 kB | +9.27 kB |
| Largest experience | 4.79 kB | 13.25 kB | Chain Reaction |
| Precache total | 98.21 kB | 145.76 kB | +47.55 kB |

The main bundle grew only by ~9 kB because experience modules are lazy-loaded. The precache grew because the service worker pre-caches all JS chunks. Chain Reaction is the largest experience at 13.25 kB due to its extensive node tree.

---

## Phase 5: Architecture Validation

### Hierarchy
```
Platform
  ├── Collections
  │     ├── Foundations (5 experiences, Echo Origin story)
 │     └── History (5 experiences, Echoes of Evidence story)
  └── Discovery
        ├── Search (10 experiences, 2 collections, 3 stories)
        ├── Recommendations (rules-based, all content)
        └── Library (progress for all collections)
```

### Registry Architecture
- `src/generated/registry.json` — build-time generated, 10 experiences ✅
- `src/generated/search-index.json` — build-time generated, 13 entries ✅
- `src/generated/collection-summaries.json` — build-time generated, 2 collections ✅
- `src/generated/relationships.json` — build-time generated, 2 collection mappings ✅

### Security Boundary
- `governing/` directory never copied to `dist/` ✅
- Private drafts excluded ✅
- No `.md` files in `dist/` ✅

---

## Compliance

- ✅ No platform architecture changes for second collection
- ✅ Only content JSON and experience modules added
- ✅ Registry, search, discovery, library all scaled automatically
- ✅ All quality gates pass (30/30 tests)
- ✅ TypeScript compilation clean
- ✅ Privacy boundary guard verified
- ✅ Performance budgets within limits
- ✅ Accessibility metadata on all 10 experiences
- ✅ Repository remains deployable

---

## Files Changed

### New Files (Content)
- `src/content/collections/history.json`
- `src/content/stories/echoes-of-evidence.json`
- `src/content/experiences/dueling-accounts.json`
- `src/content/experiences/unlabeled.json`
- `src/content/experiences/chronology.json`
- `src/content/experiences/chain-reaction.json`
- `src/content/experiences/witness-accounts.json`

### New Files (Experience Modules)
- `src/experiences/dueling-accounts.ts`
- `src/experiences/unlabeled.ts`
- `src/experiences/chronology.ts`
- `src/experiences/chain-reaction.ts`
- `src/experiences/witness-accounts.ts`

### New Files (Documentation)
- `governing/build_orders/BUILD_ORDER_008_HISTORY_COLLECTION.md`
- `governing/build_orders/BUILD_ORDER_008_COMPLIANCE_REPORT.md`

### Modified Files (Tests Only)
- `test/content-regression.test.mjs` — updated to 30 tests including History Collection validation

---

**End of Build Order 008**
