# BUILD ORDER 001: Platform Alignment Audit

**Version:** 1.0.0  
**Status:** Ready for Execution  
**Effective Date:** 2026-07-07  
**References:**  
- governing/docs/PRODUCT_CONSTITUTION.md (v1.0.0)  
- governing/docs/PLATFORM_BLUEPRINT.md (v1.0.0)  

---

## Mission

Perform a complete alignment audit of the current codebase against the published governing documents.

The goal is to ensure the **public product** and **internal architecture** conform to the Constitution and Blueprint **before** any new feature development.

This is a verification and cleanup phase only. No new experiences, engines, or UI features should be added until this Build Order is complete and approved.

## Scope

### 1. Public Website (Visitor Experience)
- What is the actual public product today?
- Does the live experience match the principles in the Constitution ("We build things worth returning to")?
- Does the structure match the Blueprint hierarchy (Interaction → Experience → Collection → Discovery → Platform Shell)?
- Identify unnecessary content, legacy pages, or misaligned navigation.
- Confirm clean, minimal public surface.

### 2. App / Game Architecture
- Witness Engine boundaries (if present)
- Iris Engine boundaries (if present)
- Scenario content separation
- World / Universe architecture
- Manager responsibilities
- Any legacy coupling between experiences and platform core

### 3. Public / Private Boundary Enforcement
- Confirm no private content can reach `dist/`
- Validate that `governing/` is the single source of truth for architecture
- Review all `.json`, `.md`, and config files that ship to browser
- Ensure `experiences.json` and other public manifests contain only player-facing data

### 4. Legacy Removal
- Remove anything that survived from older designs that conflicts with current Constitution + Blueprint
- Clean up duplicate or conflicting routing, registry, or component patterns
- Eliminate debug/admin paths that may have leaked into production code

## Deliverables

1. **Compliance Report** (Markdown)
   - Section-by-section mapping against Constitution (sections 1–19)
   - Section-by-section mapping against Platform Blueprint (sections 1–15)
   - List of misalignments (with file paths)
   - Risk level for each (Critical / High / Medium / Low)

2. **Public Product Audit**
   - Current visitor journey map
   - Gaps vs Blueprint hierarchy
   - Recommendations for minimal viable public experience

3. **Architecture Audit**
   - Current engine / manager / component map
   - Boundary violations
   - Recommended refactors (high-level only)

4. **Cleanup List**
   - Exact files and code that must be removed or moved before any new work

## Constraints

- **Do not add new features, experiences, or UI components.**
- All changes must be justified by alignment with published Constitution + Blueprint.
- Preserve the existing public/private boundary (governing/ is never deployed).
- The CI Privacy Guard (added in this cycle) must continue to pass.

## Success Criteria

- Zero private content in `dist/`
- Full traceability from every public file back to the Blueprint model
- No legacy architecture that contradicts the Three Laws or Experience Model
- Clear, documented plan for the next Build Order (UI Completion or Content Expansion)

## Execution Notes

This Build Order is intentionally an **audit and alignment** phase.

Implementation work begins only after the compliance report is reviewed and the next Build Order is issued.

**End of BUILD ORDER 001**
