# The Experience Platform
## Decision Log

**Purpose**: Historical record of major architectural, product, and process decisions.

This is **not** a governing specification.  
It exists so we can remember *why* we made certain choices and avoid cycling through the same ideas.

---

## Decision #001

**Title**: Everything is an Experience  
**Date**: 2026-06  
**Status**: Superseded  

**Reason**:  
The platform evolved toward an interaction-first architecture. Experiences remain a first-class concept, but interactions are the fundamental building block.

---

## Decision #014

**Title**: GitHub as Source of Truth  
**Date**: 2026-07  
**Status**: Accepted  

**Reason**:  
Implementation work must survive AI session loss. All canonical state lives in the repository.

---

## Decision #027

**Title**: Governance Before Features  
**Date**: 2026-07-07  
**Status**: Accepted  

**Reason**:  
We reached a stable engineering foundation. All future creative and structural decisions must be driven by published governing documents rather than ad-hoc implementation work.

---

## Decision #028

**Title**: Versioning Lives Inside Documents  
**Date**: 2026-07-07  
**Status**: Accepted  

**Reason**:  
Semantic versions (v1.0.0, v1.1.0, etc.) are recorded in frontmatter inside each governing document. Git history provides the full audit trail. No versioned filenames are used.

---

## Decision #029

**Title**: "We build things worth returning to."  
**Date**: 2026-07-07  
**Status**: Accepted  

**Reason**:  
This is the opening principle for Product Constitution v1.0.0. It is simple, memorable, and durable. All other principles (performance, accessibility, content, monetization, engineering) support this core idea.

---

*Add new decisions chronologically as they are made.*