# Build Orders

**Purpose**: This directory contains the **final** layer of the governance stack.

Build Orders are **executable specifications** that derive directly from:

1. Product Constitution
2. Platform Blueprint
3. Design System
4. Engineering Standard
5. Monetization Strategy
6. Content Strategy
7. SEO Strategy
8. Accessibility Standard

## Rules for Build Orders (v2+)

**Strict policy**:

- A Build Order is only valid when it references a **specific, approved section** of a governing document (e.g. "Product Constitution §3.2.1" or "Design System §4.1").
- Implementation agents must follow the specification **exactly**.
- No creative decisions, aesthetic judgments, or "improvements" are permitted.
- If something is ambiguous, the agent must stop and ask for clarification instead of interpreting.

Every Build Order must be written in the style of:

> "Implement Section 4.3.2 of the Product Constitution exactly as written."

## Rules for Build Orders

- Never create a Build Order until the relevant governing document section exists and is approved.
- Every Build Order must reference the specific section(s) of the governing documents it implements.
- Build Orders are written for implementation engineers (not for vision work).
- They must be narrow, testable, and reversible.
- Once a Build Order is complete, the implementation agent must update the governing documents if any new patterns or decisions emerged.

## Structure (Future)

```
BUILD_ORDERS/
├── 0001-...
├── 0002-...
└── README.md
```

Build Orders will be numbered sequentially and named descriptively.

---

**Current state**: This directory is prepared for use once the Product Constitution and subsequent governing documents are published by the Chief Product Architect.

**Do not populate this directory with implementation tasks until the Constitution is complete.**

---

## Standard Completion Checklist (Required in Every Build Order)

Every Build Order **must** end with this checklist, and the implementation agent is required to confirm each item:

- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds (including 404.html copy)
- [ ] Local production preview verified (when relevant)
- [ ] Accessibility foundation preserved (no regressions)
- [ ] Performance budgets respected (where defined)
- [ ] CI checks would pass
- [ ] Documentation updated if the change affects behavior or process
- [ ] Commit uses a clear, reference-linked message
- [ ] Changes pushed to GitHub
- [ ] Concise handoff report provided with commit hash

This ensures every implementation session leaves the project in a verifiably better (or at least equal) state.

---

## Future Naming Convention

Build Orders will be numbered sequentially:

- `0001-implement-platform-shell.md`
- `0002-add-experience-registry-search.md`
- etc.

Use the `TEMPLATE.md` in this directory when creating new ones.