# Library Season 1 Illustration System

_Date:_ 2026-07-08  
_Build Order:_ 009

## Purpose

Library Season 1 now uses a permanent illustration system designed to make the platform feel like a single authored publication.

The system is built around five reusable asset families:

- `icons/`
- `illustrations/`
- `patterns/`
- `backgrounds/`
- `collection-badges/`

All assets live in:

`public/assets/library-season-1/`

A shared manifest for the system lives in:

`src/content/assets/illustration-manifest.json`

## Design principles

### 1. Explanatory, not decorative

Artwork should help the reader understand the idea before interaction begins.

### 2. Editorial, not app-like

Cards, headers, and hero areas should feel like pages, covers, badges, and diagrams.

### 3. Reusable by future seasons

Collections and experiences are described through a manifest and a generator rather than ad hoc one-off assets.

### 4. Lightweight by default

SVG is used for icons, collection art, and experience hero art.

## Collection language

### Foundations
- geometry
- grids
- structural frames
- measured accents

### History
- paper panels
- timelines
- mapped contours
- archival marks

### Science
- instrument grids
- plots
- measured curves
- observation windows

### Nature
- branches
- currents
- river paths
- living cycles

### Creativity
- layered collage
- sketch movement
- rearranged forms
- compositional overlap

### Engineering
- spans
- supports
- blueprint lines
- load-bearing forms

### Mathematics
- curves
- axes
- proof structures
- mirrored balance

### Society & Mind
- networks
- dialogue forms
- attention fields
- branching decisions

## Asset inventory

### Icons
Reusable collection icons and a shared bookmark icon.

### Collection badges
Compact emblem-like assets for lists, context markers, and progress surfaces.

### Patterns
Low-contrast SVG pattern fields used to add atmosphere without overwhelming content.

### Backgrounds
Large-format collection backdrops for future seasonal reuse.

### Collection illustrations
Wide-format artwork used in collection cards and featured sections.

### Experience illustrations
Each experience now has a dedicated small hero illustration under:

`public/assets/library-season-1/illustrations/experiences/`

These images are intentionally diagrammatic so they can support:

- detail page hero figures
- list thumbnails
- future editorial callouts

## Source of truth

### Manifest
`src/content/assets/illustration-manifest.json`

This file defines:

- collection palette
- collection visual direction
- collection motif ID
- per-experience motif ID
- per-experience explanatory caption

### Generator
`scripts/generate-library-season-1-assets.mjs`

This script builds the reusable SVG library from the manifest-defined system.

Run it manually whenever the visual manifest changes:

```bash
node scripts/generate-library-season-1-assets.mjs
```

## Runtime usage

### Collection identity helpers
`src/platform/collection-identity.ts`

Provides:

- collection palette variables
- collection icon rendering
- collection badge rendering
- collection illustration rendering
- collection CSS variable injection

### Experience artwork helpers
`src/platform/illustration-system.ts`

Provides:

- experience artwork lookup
- experience hero image rendering
- experience figure rendering with explanatory caption
- bookmark icon rendering

## Accessibility notes

- Decorative card thumbnails use empty `alt` text.
- Experience hero figures use descriptive captions because they explain the concept.
- Text remains the primary content source; artwork supports comprehension rather than replacing language.

## Performance notes

- SVG assets are static and cacheable.
- Icons and badges are small files reused across many surfaces.
- Experience hero art is lightweight enough to use as thumbnails without image bloat.
- No new frameworks or runtime dependencies were added.

## Extension guidance for future seasons

To extend the system:

1. add a new collection block to `illustration-manifest.json`
2. add experience motif entries and captions
3. update the generator with any new motif logic needed
4. regenerate assets
5. reuse the same runtime helpers on new pages

## Result

The library now has a visual asset pipeline instead of isolated illustrations.

That means future seasons can inherit:

- consistent collection identity
- reusable asset categories
- predictable rendering helpers
- strong publication-level cohesion
