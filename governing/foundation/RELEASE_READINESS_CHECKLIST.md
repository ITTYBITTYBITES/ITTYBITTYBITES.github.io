# Release Readiness Checklist

**Version:** 1.0.0  
**Status:** Active  
**Applies to:** All public releases  

---

## Purpose

This checklist is the gatekeeper for every release. No release is published until every item is verified. If an item cannot be checked, the release is deferred until it can.

The checklist exists to protect the platform's quality, accessibility, and trustworthiness. It is not a formality.

---

## How to Use

1. Create a copy of this checklist for each release.
2. Check each item manually or via automation.
3. Record the result (pass / fail / N/A) and the verifier.
4. If any required item fails, the release is blocked.
5. The final sign-off requires two verifications: automated and human.

---

## 1. Functional Readiness

| # | Item | Verification | Required |
|---|------|------------|----------|
| 1.1 | `npm run build` completes without errors | Automated | Yes |
| 1.2 | `npm test` passes with zero failures | Automated | Yes |
| 1.3 | TypeScript compilation is clean (`npm run lint`) | Automated | Yes |
| 1.4 | All registered experiences load without runtime errors | Manual | Yes |
| 1.5 | All routes resolve correctly (/, /experiences, /collections, /library, /experience/:id) | Manual | Yes |
| 1.6 | Deep links work (refreshing any page does not 404) | Manual | Yes |
| 1.7 | PWA manifest is valid and installable | Manual | Yes |
| 1.8 | Service worker registers and caches assets | Manual | Yes |

---

## 2. Content Completeness

| # | Item | Verification | Required |
|---|------|------------|----------|
| 2.1 | Every experience has complete JSON metadata (id, title, description, category, module, accessibility) | Automated | Yes |
| 2.2 | Every experience has a corresponding `.ts` module file | Automated | Yes |
| 2.3 | Every Collection has a story reference | Automated | Yes |
| 2.4 | Every story referenced by a Collection exists | Automated | Yes |
| 2.5 | Every experience in a Collection is listed in the Collection's `experiences` array | Automated | Yes |
| 2.6 | No placeholder text remains in any experience, collection, or story | Manual | Yes |
| 2.7 | Every experience has `estimatedDuration` and `returnValue` | Automated | Yes |
| 2.8 | Every Collection has `estimatedDuration` | Automated | Yes |
| 2.9 | All new content passes schema validation | Automated | Yes |
| 2.10 | Registry generation produces valid output with no broken references | Automated | Yes |

---

## 3. Accessibility

| # | Item | Verification | Required |
|---|------|------------|----------|
| 3.1 | Every experience has accessibility metadata (keyboard, screenReader, contrast) | Automated | Yes |
| 3.2 | Skip link is present and functional on all pages | Manual | Yes |
| 3.3 | Focus management works on route changes | Manual | Yes |
| 3.4 | All interactive elements have visible focus indicators | Manual | Yes |
| 3.5 | Color is not the sole means of conveying information | Manual | Yes |
| 3.6 | Text meets minimum contrast ratios (4.5:1 for body, 3:1 for large text) | Manual | Yes |
| 3.7 | Reduced motion preference is respected | Manual | Yes |
| 3.8 | All images and canvases have appropriate `alt` text or `aria-label` | Manual | Yes |
| 3.9 | Form inputs have associated labels | Manual | Yes |
| 3.10 | No keyboard traps exist | Manual | Yes |

---

## 4. Performance

| # | Item | Verification | Required |
|---|------|------------|----------|
| 4.1 | Main bundle size is under 100 KB (gzipped) | Automated | Yes |
| 4.2 | Largest experience module is under 50 KB (gzipped) | Automated | Yes |
| 4.3 | Total precache size is under 500 KB | Automated | Yes |
| 4.4 | First contentful paint is under 2 seconds on simulated 3G | Manual | Recommended |
| 4.5 | No render-blocking resources | Manual | Recommended |
| 4.6 | Experience modules load on demand, not at startup | Automated | Yes |

---

## 5. Privacy and Security

| # | Item | Verification | Required |
|---|------|------------|----------|
| 5.1 | Privacy Boundary Guard passes in CI | Automated | Yes |
| 5.2 | No `governing/` files exist in `dist/` | Automated | Yes |
| 5.3 | No `.md` files exist in `dist/` | Automated | Yes |
| 5.4 | No private drafts or internal documents are referenced in public code | Manual | Yes |
| 5.5 | Analytics respects `doNotTrack` and can be disabled | Automated | Yes |
| 5.6 | No external scripts load without explicit purpose | Manual | Yes |
| 5.7 | No sensitive data is logged to console | Manual | Yes |

---

## 6. Quality Gates

| # | Item | Verification | Required |
|---|------|------------|----------|
| 6.1 | Content validation passes (`npm run validate`) | Automated | Yes |
| 6.2 | Asset validation passes | Automated | Yes |
| 6.3 | Registry generation succeeds | Automated | Yes |
| 6.4 | Search index generation succeeds | Automated | Yes |
| 6.5 | Relationship graph generation succeeds | Automated | Yes |
| 6.6 | Performance report is generated | Automated | Yes |
| 6.7 | Accessibility report is generated | Automated | Yes |
| 6.8 | Build summary is generated | Automated | Yes |
| 6.9 | Content report is generated | Automated | Yes |
| 6.10 | Diagnostics report is generated | Automated | Yes |

---

## 7. Documentation

| # | Item | Verification | Required |
|---|------|------------|----------|
| 7.1 | Build order document exists for this release | Manual | Yes |
| 7.2 | Compliance report exists for this release | Manual | Yes |
| 7.3 | `PLATFORM_STATUS.md` is updated with current version and Collections | Manual | Yes |
| 7.4 | Decision log is updated if architectural choices were made | Manual | Yes |
| 7.5 | README is accurate (if modified) | Manual | Yes |

---

## 8. User Experience Review

| # | Item | Verification | Required |
|---|------|------------|----------|
| 8.1 | Homepage communicates what the platform is within 15 seconds | Manual | Yes |
| 8.2 | First-time visitor has a clear next step | Manual | Yes |
| 8.3 | Collection page has introduction, progress, and completion state | Manual | Yes |
| 8.4 | "Continue Playing" surfaces genuinely useful suggestions | Manual | Yes |
| 8.5 | Library makes progress feel meaningful | Manual | Yes |
| 8.6 | Search returns relevant results for common queries | Manual | Yes |
| 8.7 | Recommendations include clear, human-readable reasons | Manual | Yes |
| 8.8 | Every experience has a clear purpose and instructions | Manual | Yes |
| 8.9 | Empty states are helpful, not dead ends | Manual | Yes |
| 8.10 | Mobile layout is usable and readable | Manual | Yes |
| 8.11 | Desktop layout is usable and readable | Manual | Yes |
| 8.12 | Touch interactions work on mobile | Manual | Yes |
| 8.13 | Keyboard interactions work on desktop | Manual | Yes |
| 8.14 | Loading states do not feel broken | Manual | Yes |
| 8.15 | Error states explain what happened and what to do | Manual | Yes |

---

## 9. Release Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Automated Verification | CI Pipeline | | |
| Human Verification | | | |
| Final Sign-Off | | | |

**Release is approved only when:**
- All required items (marked "Yes") are checked.
- Both automated and human verification are recorded.
- No blocking issues remain open.

---

## Release Blocking Issues

| Issue | Severity | Status | Owner |
|-------|----------|--------|-------|
| | | | |

*If this table is empty and all checks pass, the release may proceed.*

---

## Notes

- "Automated" means the check is performed by CI or build scripts.
- "Manual" means a human must verify the item.
- "Required" means the release is blocked if this item fails.
- "Recommended" means the item should be addressed but does not block release.
- This checklist is versioned. Updates require review.

---

**End of Release Readiness Checklist v1.0.0**
