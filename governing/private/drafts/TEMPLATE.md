# Build Order Template

**Build Order ID**: BO-XXXX  
**Title**: [Short, precise title]  
**Reference**: [Exact section of governing document, e.g. "Product Constitution §4.3.2" or "Platform Blueprint §2.1"]  
**Date**: YYYY-MM-DD  
**Status**: Proposed / In Progress / Complete  

---

## Objective

One-sentence description of what must be implemented.

## Scope

- What is included
- What is explicitly **out of scope**

## Acceptance Criteria

- [ ] Criterion 1 (measurable)
- [ ] Criterion 2
- [ ] ...

## Files Expected to Change

- `path/to/file.ts`
- `path/to/other.md`

## Tests / Verification Required

- Build succeeds (`npm run build`)
- Lint passes (`npm run lint`)
- Manual verification steps...

## Constraints

- Must preserve existing behavior in [specific areas]
- Must follow [specific rule from governing document]

## Implementation Notes

(Provided by the architect only. No creative interpretation.)

---

## Completion Checklist (Mandatory)

- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] Production preview verified locally (where applicable)
- [ ] Accessibility preserved (no regressions in keyboard, focus, or reduced-motion support)
- [ ] Performance budgets respected (if applicable)
- [ ] CI would pass (the `.github/workflows/ci.yml` checks)
- [ ] Relevant documentation updated (if the change affects user-facing behavior or developer workflow)
- [ ] Commit message follows convention: `feat|fix|docs: short description (ref: BO-XXXX)`
- [ ] Changes pushed to GitHub
- [ ] Handoff report provided (concise summary + commit hash)

## Handoff Report

**Commit**: `abc1234`  
**Summary**: ...  
**Notes for next agent**: ...

---

**Rule**: This Build Order must be implemented exactly as written. No design decisions. No "improvements." No interpretation beyond what is explicitly stated.