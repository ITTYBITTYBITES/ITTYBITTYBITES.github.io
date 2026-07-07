# The Experience Platform — Governing Documents

This directory contains the **authoritative product and engineering specifications** for the platform.

These are not marketing documents. They are **living governing specifications**.

## Document Hierarchy (Strict Order)

All work on the platform must follow this order:

```
1. PRODUCT_CONSTITUTION.md
        ↓
2. PLATFORM_BLUEPRINT.md
        ↓
3. DESIGN_SYSTEM.md
        ↓
4. ENGINEERING_STANDARD.md
        ↓
5. MONETIZATION_STRATEGY.md
   CONTENT_STRATEGY.md
   SEO_STRATEGY.md
   ACCESSIBILITY_STANDARD.md
        ↓
6. BUILD_ORDERS/
```

## Current Documents

| File                              | Purpose                                      | Status          |
|-----------------------------------|----------------------------------------------|-----------------|
| `PRODUCT_CONSTITUTION.md`         | Root philosophy, principles, non-negotiables | Placeholder     |
| `PLATFORM_BLUEPRINT.md`           | Product architecture & models                | Placeholder     |
| `DESIGN_SYSTEM.md`                | Visual language, tokens, components          | Placeholder     |
| `ENGINEERING_STANDARD.md`         | How we build (code, processes, contracts)    | Placeholder     |
| `MONETIZATION_STRATEGY.md`        | Sustainable revenue without harming UX       | Placeholder     |
| `CONTENT_STRATEGY.md`             | What content belongs and how it is curated   | Placeholder     |
| `SEO_STRATEGY.md`                 | Discovery on the open web                    | Placeholder     |
| `ACCESSIBILITY_STANDARD.md`       | Inclusive design commitments                 | Placeholder     |
| `BUILD_ORDERS/README.md`          | Rules for implementation specifications      | Ready           |

## Draft / Historical Material

- `drafts/PLATFORM_BLUEPRINT_DRAFT.md` — Engineering reference from stabilization phase (not authoritative)

## Rules

- The **Product Constitution** is the single source of truth.
- No implementation of design, UX, motion, navigation, or new surfaces may begin until the Constitution exists.
- Every Build Order must explicitly reference the governing document sections it implements.
- These documents are versioned and durable — they should still make sense years from now.

## For Implementation Agents

Until the Product Constitution is published and approved:

- Focus only on maintenance, tooling, and narrowly scoped technical work.
- Do **not** begin creative or visual work.
- Do **not** create new Build Orders outside this structure.

---

**Chief Product Architect** owns the content of these documents.  
**Implementation teams** execute from them.