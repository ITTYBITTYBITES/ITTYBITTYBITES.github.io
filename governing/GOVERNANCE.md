# The Experience Platform — Governance

**Effective**: 2026-07-07 (Platform v2 — Product Phase)

This repository is now governed by a strict, layered specification system.

## The Governing Stack (in order of authority)

1. **Product Constitution** — Why we exist, core principles, non-negotiables, trade-offs.
2. **Platform Blueprint** — Product model, architecture, information architecture, experience model.
3. **Design System** — Visual language, tokens, components, motion, interaction patterns.
4. **Engineering Standard** — How we build, contracts, processes, quality gates.
5. **Strategy Documents** (Monetization, Content, SEO, Accessibility)
6. **Build Orders** — Narrow, reference-linked, executable implementation instructions.

## Core Rule

**No creative or interpretive work is permitted from implementation agents.**

All work must be:
- Explicitly derived from a specific section of a governing document
- Narrow in scope
- Verifiable against acceptance criteria

## For Implementation Agents

Until the Product Constitution is published:

- Only perform maintenance, tooling improvements, or narrowly scoped technical tasks that have been explicitly requested.
- Do **not** create new experiences, visual changes, navigation changes, or design work.
- When a Build Order is issued, implement **exactly** what is written.

## Build Order Requirements

Every Build Order must:
- Reference the exact governing document section(s)
- Include measurable acceptance criteria
- List expected files
- End with the standard completion checklist (see `docs/BUILD_ORDERS/README.md`)

## Versioning

See `VERSION.md`

This governance model is intended to produce durable, consistent product decisions that will still make sense years from now.