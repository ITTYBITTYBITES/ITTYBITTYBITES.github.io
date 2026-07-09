# BUILD ORDER 002: Public Experience Architecture Implementation

**Build Order ID:** 002  
**Title:** Public Experience Architecture Implementation  
**Version:** 1.0.0  
**Status:** Published  
**Effective Date:** 2026-07-07  
**Parent:** BUILD ORDER 001 (Platform Alignment Audit)  
**Governing Documents:**  
- `governing/docs/PRODUCT_CONSTITUTION.md` (v1.0.0)  
- `governing/docs/PLATFORM_BLUEPRINT.md` (v1.0.0)  

---

## Objective

Implement the public layer of the platform architecture per the Platform Blueprint sections 3–8 and Product Constitution sections 4, 11, and 18.

Specifically:

- Establish the **Collection → Story → Experience** hierarchy in public data and UI.
- Replace the two placeholder experiences with the platform's **first coherent public experience**.
- Introduce minimal, registry-driven support for Collections and Stories.
- Preserve the strict public/private boundary, registry as single source of truth, and Three Laws.
- Ensure the repository remains deployable and the Privacy Boundary Guard passes.

**Verbatim hierarchy (from Blueprint):**

**Interactions create Experiences.**  
**Experiences create Collections.**  
**Collections create Discovery.**  
**Discovery creates the Platform.**

**Three Laws (verbatim):**

Law 1: Protect the platform before extending it.  
Law 2: Every addition must make the entire platform better.  
Law 3: The repository is always deployable.

## Scope

### In Scope
- New public content structures: `collections.json`, `stories.json` (minimal first versions).
- One coherent public experience that demonstrates meaningful return value.
- Registry extensions to support collection membership and story references.
- Updates to home, experience index, and navigation to surface Collections and Stories.
- One new experience module that replaces both placeholders.
- Updated `experiences.json` (removal of placeholders, addition of coherent experience).
- Homepage language aligned with Constitution promise ("things worth returning to").

### Out of Scope (deferred to later Build Orders)
- Full Discovery engine or recommendation system.
- Multiple collections or complex story graphs.
- New standalone demos or toy utilities.
- Private/governing content exposure.
- UI/Design System updates beyond necessary hierarchy presentation.

## Acceptance Criteria

1. `governing/build_orders/BUILD_ORDER_002_PUBLIC_EXPERIENCE_ARCHITECTURE.md` published.
2. Public data files exist under `src/content/`:
   - `collections.json` (at least 1 collection)
   - `stories.json` (at least 1 story element)
3. `src/content/experiences.json` contains exactly **one** coherent public experience (no placeholders).
4. Registry (`src/platform/registry.ts` + types) exposes collections and story references.
5. Homepage reflects the Constitution promise and hierarchy.
6. Experience index surfaces collections.
7. The coherent experience demonstrates Interaction → Experience (user performs meaningful actions that create lasting value).
8. `npm run build` succeeds with 0 markdown files and 0 forbidden patterns in `dist/`.
9. Privacy Boundary Guard passes.
10. All changes committed with reference to this Build Order.

## Implementation Notes

- All content changes are public (`src/content/`).
- Registry remains the single source of truth.
- Experiences are still loaded dynamically via `loadExperience`.
- No private content may leak into `dist/`.
- Use exact hierarchy and Three Laws phrasing where referenced in code or UI.
- The first coherent experience must answer the five Experience Quality Framework questions (Blueprint §11):
  - Purpose
  - Interaction
  - Value
  - Connection
  - Return

## Verification Steps

After implementation:
1. `npm run build`
2. Verify `dist/` has 0 *.md and 0 matches for forbidden list.
3. Run local preview and confirm:
   - Home references "things worth returning to"
   - Collections and Stories visible
   - One coherent experience loads
4. Commit with message referencing BUILD ORDER 002.

**End of BUILD ORDER 002**

