=== BETA 0.1 READINESS PLAN ===
Workspace: /home/user/fresh_clone (single source of truth)
No new gameplay. No customization. No monetization. Stability and emotional completeness only.

=== CURRENT STATUS (After Phase 5B + Batch 1) ===
- Module (`yearglass.ts`): full ExperienceModule with preview, focus mode, relationship tracking, return description
- Content (`yearglass.json`): registered with collection (nature), story (the-living-web), category (interactive), tags, search keywords
- Assets: illustration SVG + thumbnail SVG present
- Deploy: `/yearglass/` (standalone) + `/experience/yearglass/` (redirect/full build) present
- Build: passes cleanly from fresh clone (`npm run build` succeeds; PWA generated)
- Audio: visibility suspension + interaction unlock + reduced gains + timer suspension + shorter intervals implemented (workspace edits preserved; rebuilt from archive/deploy folder)
- Performance: lamp glow reduced; no excessive GPU overdraw; no new dependencies
- Save integrity: IndexedDB working; capsule export/import functional; identity fields present (generation, parents, traits, lineage) but version migration logic MISSING (high risk from audit)
- Mobile: touch-friendly module button; focus mode large overlay; redirect avoids SPA 404; actual mobile device verification UNVERIFIED (remains from performance audit)
- First-time user experience: subtle discovery prompt added; intro overlay preserved; name dialog exists; no forced tutorial or arrows
- Emotional loop: personality (FSM), memory (milestone + basic relationship), photo mode, focus mode, return loop descriptions all present
- Relationship memory: interaction tracking in module (3 interactions -> familiarity; 8 -> preference); deeper emotional milestones (favorite_location, long companionship) remain as future enhancement only
- Visual refinement: focus mode overlay clean; no separate scene; same world closer view; smooth transition animation preserved

=== READINESS SCORE ===
Functional/Visual: READY (build passes, deploy present, module loads, focus mode works, audio unlock works)
Stability: READY (visibility suspension, timer suspension, reduced gains, no crashes in workspace tests)
Emotional Depth: READY (core attachment loop works: naming, petting, watering, observing, photo, memory, return descriptions)
Performance: PARTIAL (visibility/audio fixes implemented; mobile device verification unverified)
Data Safety: PARTIAL (IndexedDB + capsule export work; save version migration MISSING — high risk before wider release)
Public Readiness: READY for Beta 0.1 with caveat (advise users to export capsule; mobile verification recommended before broad release)

=== REQUIRED BEFORE BETA 0.1 RELEASE ===
- [ ] Save version migration (small defensive change: add version field + migration rules)
- [ ] Actual mobile verification (Android Chrome, 5+ minute session, confirm no freeze)
- [ ] Confirm build from fresh clone passes in full environment (`npm install` + `npm run build` with `tsc` available)
- [ ] Confirm `/yearglass/` and `/experience/yearglass/` load correctly on live site after deploy delay
- [ ] Confirm audio plays after user interaction on mobile browser
- [ ] Confirm visibility suspension works correctly (hide/return cycle)
- [ ] Confirm focus mode opens/closes smoothly on mobile touch
- [ ] Confirm module link (`Open Sanctuary`) opens correctly (new tab avoids SPA routing issue)
- [ ] Confirm relationship tracking updates correctly (3/8 interaction milestones visible in preview)
- [ ] Confirm return descriptions visible in preview section

=== RECOMMENDED POST-RELEASE (Not blocking Beta 0.1) ===
- [ ] Dependency cleanup (GSAP/Howler removal — optional, low priority)
- [ ] Automated regression test for engine logic (optional, medium priority)
- [ ] Adaptive tick rate (optional, low priority)
- [ ] Server-side capsule backup or sync (optional, low priority)
- [ ] Guided tutorial or first-time hint improvement (optional, design preference)
- [ ] Deeper relationship memory events (Phase 1.5 spec: favorite_location, long companionship — future enhancement only)
- [ ] Mobile profiling and battery measurement (optional, performance optimization only)

=== APPROVAL REQUESTED ===
Proceed to final verification batch (mobile test + save version + build in full environment)?
Confirm Beta 0.1 readiness with caveats above.
