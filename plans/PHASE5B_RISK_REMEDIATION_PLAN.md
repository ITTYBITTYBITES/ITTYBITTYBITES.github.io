=== PHASE 5B RISK REMEDIATION PLAN ===
Workspace: /home/user/fresh_clone (single source of truth)
No new features. Remediation only.

=== RISK 1: SAVE VERSION MIGRATION (HIGH) ===

=== CURRENT STATE ===
- Save structure: world object saved by SaveManager.saveWorld()
- No `saveVersion` field present in saved JSON structure (spec mentions it but not implemented)
- Identity fields (generation, parents, traits, lineage) added in Phase 1.5 but no migration logic
- Capsule import validates format but doesn't upgrade version

=== REMEDIATION PLAN ===
File: src/storage/save.ts
- Change: Add version constant (`SAVE_VERSION = 2`) to save/export logic
- Change: Before save, check `world.saveVersion`; if missing or < current, apply migration:
  * Add `saveVersion: 2`
  * Ensure all plants have `id`, `generation`, `parents`, `traits`, `lineage`
  * Ensure all creatures have `id`, `generation`, `personality`, `memories`
  * Default `lineage: []`, `parents: []`, `traits: []` for entities missing them
- Risk: LOW — migration is backward-compatible (adds fields, doesn't remove)
- Verification: Save, reload, confirm identity fields preserved; import capsule, confirm identity preserved

=== RISK 2: MOBILE HEAT / PERFORMANCE (HIGH) ===

=== CURRENT STATE ===
- Simulation tick: 250ms interval (continuous)
- Audio: procedural Web Audio (noise sources, intervals for crickets/birds/frogs at reduced rates after fix)
- Visibility suspension: audio context suspended when hidden; timer cleared when hidden; restored when visible
- Lamp glow: reduced (scale 1.2, alpha 0.08) to prevent GPU overdraw
- Build passes cleanly; no runtime errors

=== REMEDIATION PLAN ===
File: src/state/host.ts (timer suspension already applied in workspace; verify rebuilt)
- Verification: Confirm `logicTimer` cleared in `onVisibility()` hidden branch; restored in visible branch
File: src/audio/audioEngine.ts (visibility suspension + reduced gains applied)
- Verification: Confirm `ctx.suspend()` called on hidden; `ctx.resume()` on visible; master cap 0.8; ambient 0.2; intervals slowed
File: Build verification
- Rebuild from fresh clone confirms clean output
- Mobile verification: open `/yearglass/` on mobile browser; interact; observe temperature/smoothness over 5 min session; confirm no freeze

=== RISK 3: RELATIONSHIP MEMORY (MEDIUM) ===

=== CURRENT STATE ===
- MemorySystem (MemorySystem.ts) supports types: milestone, relationship, discovery, anniversary, focus
- Engine creates basic relationship events (favorite_plant, first_interaction via pet command) but doesn't trigger deeper emotional milestones
- Day 2 observe, day 7/30/100 anniversary memories exist in spec; basic milestone memory for intro exists
- No automatic relationship memory for long-term companionship or favorite locations

=== REMEDIATION PLAN ===
File: src/core/engine.ts (memory creation)
- Change: After creature pet interaction (`type: "pet"`), trigger relationship memory: `addMemory(world, "relationship", creatureId, "favorite_plant", "Pip often visits this plant after rain.")` (scaffolded event — optional enhancement within existing architecture)
- Change: After first bloom/flower event, trigger discovery memory
- Change: After 7/30/100 days (simulated), trigger anniversary milestone
- Risk: LOW — uses existing `addMemory()` API; no framework changes
- Verification: Confirm memory appears in journal (Notebook panel) after event

=== APPROVAL REQUESTED ===
Proceed with Risk 1 (Save Migration) implementation?
Proceed with Risk 2 (Performance Verification) — build + mobile test?
Proceed with Risk 3 (Relationship Memory) — add deeper emotional milestones?
