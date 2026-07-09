# Library Season 1 — Visual Asset Audit

_Date:_ 2026-07-08  
_Build Order:_ 009  
_Status:_ Phase 1 complete before illustration decisions

## Scope audited

- Home (`src/pages/home.ts`)
- Experiences index (`src/pages/experience-index.ts`)
- Collections (`src/pages/collections.ts`)
- Experience detail (`src/pages/experience.ts`)
- My Library (`src/pages/library.ts`)
- Shared chrome (`src/components/app-header.ts`, `src/components/app-footer.ts`)
- Global presentation layer (`src/style.css`)
- Existing collection identity system (`src/platform/collection-identity.ts`)
- Experience-internal visual surfaces with placeholder symbols (`src/experiences/attention.ts`, `src/experiences/ecosystem.ts`, `src/experiences/seasons.ts`)

## Summary

The platform already has structure, navigation, and content depth, but its visual layer is still prototype-grade.

The main pattern is consistent: the application communicates clearly, but it rarely feels authored. Collections do not yet read like distinct illustrated volumes, and experience pages do not yet introduce ideas with explanatory artwork.

## Findings

### 1. Emoji placeholders

**Collection-level emoji still present**

- `src/platform/collection-identity.ts`
  - Foundations `🏛️`
  - History `📜`
  - Science `🔬`
  - Nature `🌿`
  - Creativity `🎨`
  - Engineering `⚙️`
  - Mathematics `📐`
  - Society & Mind `🧠`
- Fallback emoji rendering still exists on:
  - `src/pages/home.ts`
  - `src/pages/collections.ts`

**UI emoji/symbol placeholders**

- Favorite toggle in `src/pages/library.ts` uses `★` and `☆`
- `src/experiences/attention.ts` uses text symbols (`●`, `▲`, `■`, `★`) as visual card faces
- `src/experiences/ecosystem.ts` uses species emoji throughout the food-web interface
- `src/experiences/seasons.ts` uses seasonal and observation emoji throughout the observation cards and tabs

**Assessment**

Emoji currently carry too much of the application’s visual identity. They work as placeholders but not as permanent publication art.

---

### 2. Generic SVGs / insufficient authored iconography

**Current state**

- Collection icons are assembled from generic stroke paths in `src/platform/collection-identity.ts`
- The icon set is inconsistent in metaphor, stroke personality, and silhouette
- No reusable shared illustration library exists for future seasons

**Assessment**

The product has the beginnings of a visual system, but not yet a stable authored language.

---

### 3. Empty or missing illustrations

**Current state**

- Home hero has typography only; no publication-grade artwork
- Collections page has no collection illustration panel
- Experience index cards have no hero thumbnail or explanatory motif
- Experience detail pages have no hero illustration, supporting visual motif, or contextual diagram
- Library page has no authored artwork for progress or return journeys
- Empty states are text-only and visually generic

**Assessment**

The application relies almost entirely on text and boxes. It needs an illustration layer that teaches, frames, and differentiates.

---

### 4. Placeholder gradients and repetitive backgrounds

**Current state**

- Collection backgrounds rely on simple inline gradients and color tints
- Multiple surfaces repeat `canvas`, `ButtonFace`, or plain linear gradients
- Several pages share nearly identical card backgrounds even when their subject matter differs
- The current collection tint system communicates color but not identity

**Assessment**

Backgrounds are serviceable but repetitive. They suggest a design system rather than a finished publication.

---

### 5. Generic buttons and card primitives

**Current state**

- Buttons are structurally sound but visually generic across all contexts
- Cards on home, browse, collections, and library share similar shells with limited hierarchy
- Calls to action do not yet feel collection-aware or editorially framed

**Assessment**

Interaction components are usable, but not yet authored.

---

### 6. Inconsistent spacing, borders, and shadow language

**Current state**

- `src/style.css` has multiple passes layered onto one another, creating duplicate and competing rules
- Border radii, shadow intensities, and hover treatments are repeated and occasionally overridden
- Empty-state styling appears multiple times with different definitions
- Hero, card, and progress styles have overlapping variants from earlier passes

**Assessment**

The platform needs a single visual rhythm for spacing, borders, dividers, and elevation so the library reads as one publication.

---

### 7. Inconsistent iconography scale and application

**Current state**

- Collection icons appear as inline SVGs in some places, emoji fallbacks in others
- Experience cards usually have no iconography at all
- Library favorites use star glyphs rather than the same icon family used elsewhere
- Experience-internal iconography mixes emojis, text symbols, and plain labels

**Assessment**

There is no single icon sizing and metaphor standard across surfaces.

---

### 8. Experience pages lack explanatory visual framing

**Current state**

- Experience pages begin with text and then jump directly into interaction
- There is no visual “idea diagram” to prepare the user for the concept being explored
- Supporting motifs are not reused across collection, index, and detail views

**Assessment**

This is the largest missed opportunity in the current build. Every experience needs a small hero illustration that clarifies the concept before interaction begins.

## Priority placeholder surfaces to replace

### Highest priority

1. Collection emoji and generic collection icons
2. Home hero, featured, and browse cards without illustration support
3. Experience detail pages without hero artwork
4. Experience index cards without supporting thumbnails
5. Collection cards without authored badges, patterns, or illustrations

### Secondary priority

6. Library favorite star glyphs
7. Text-only empty states
8. Experience-internal emoji surfaces where they are acting as visual stand-ins rather than core content

## Visual direction approved by the audit

The next pass should introduce a permanent reusable asset system with:

- authored collection icons
- collection badges
- repeatable collection patterns
- lightweight collection backgrounds
- collection illustrations
- per-experience hero illustrations with explanatory motifs
- a standardized publication card system

## Guardrails for implementation

- Do not alter routing, content logic, progression, scoring, or platform architecture
- Prefer SVG for all new authored assets
- Use decorative images with empty alt text when text already communicates meaning
- Use descriptive alt text or figure captions when artwork explains the concept
- Keep assets lightweight and cacheable
- Preserve responsive behavior and reduced-motion support

## Definition of done for the visual pass

- No collection-level emoji remain in the library shell
- Each collection has a durable visual identity across list, detail, and progress surfaces
- Each experience receives a hero illustration on its detail page
- Shared assets exist in reusable folders for future seasons
- Spacing, borders, shadows, and icon sizing read as one publication system
