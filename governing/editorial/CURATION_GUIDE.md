# ITTYBITTYBITES — Curation Guide

**Status**: Published  
**Version**: 1.0.0  
**Date**: 2026-07-08  

---

## 1. Protecting the Library

While **Engineering** protects the platform (ensuring performance, accessibility, offline capability, and code durability), **Editorial** protects the library (ensuring clarity, context, insight, and engagement).

This guide acts as the manual for curators and editors of ITTYBITTYBITES. It defines how we conceptualize, evaluate, and polish experiences before they are offered to the public.

---

## 2. Experience Quality Framework (EQF)

Before any interactive draft is promoted into the active Library, it must answer five questions:

1. **Purpose**: Why does this experience exist? What is the one insight it is designed to deliver?
2. **Interaction**: What is the core meaningful action the person takes? (Clicking, dragging, adjusting a slider, or choosing an option must directly map to the concept, not be arbitrary fluff).
3. **Value**: What does the person gain from spending 30 seconds here? 
4. **Connection**: How does this experience strengthen and build on the other experiences in its Collection?
5. **Return**: Why would someone come back to this "bite" a week or a year from now? Is it worth preserving?

---

## 3. The Editorial Curation Workflow

All new additions to the library follow a strict 5-step flow:

### Phase 1: Definition & Alignment
- **Goal**: Establish the conceptual foundation.
- **Actions**:
  - Select or create the parent Collection.
  - Review the Collection’s **Library Compass**.
  - Author the **Editor's Note** and the targeted concept.
  - Assign a **Permanent Citation Identifier** (e.g. `M-002`).

### Phase 2: Design & Prototyping
- **Goal**: Establish the interaction model.
- **Actions**:
  - Sketch the interaction. It must be understandable within **30 seconds** without reading a wall of text.
  - Eliminate unnecessary visual elements. Minimize friction.

### Phase 3: Technical Implementation
- **Goal**: Build using frozen platform primitives.
- **Actions**:
  - Implement using the Custom Elements standard.
  - Register the experience configuration in `src/content/experiences/[id].json`.
  - Ensure zero new platform code is written (use existing components and utilities).

### Phase 4: Quality Gate Review
- **Goal**: Pass all standards.
- **Actions**:
  - **Performance**: Experience must load instantly and run at 60fps.
  - **Accessibility**: Support screen readers, keyboard navigation, high contrast.
  - **Self-Containment**: No external server dependencies, entirely local-first.

### Phase 5: Launch & Integration
- **Goal**: Add to the collection bookshelf.
- **Actions**:
  - Update `src/generated/registry.json`.
  - Add a record to `governing/releases/LIBRARY_VERSION.md`.

---

## 4. The 30-Second Rule

If a visitor cannot grasp the interaction within 30 seconds, the interaction is too complex. 

- **Do not** add complex tutorial overlays.
- **Do** use intuitive visual cues (ghost cursors, clear arrows, descriptive interactive labels).
- **Do** allow immediate play. Trial and error should be rewarding.

---

*We do not simply host content. We curate understanding.*
