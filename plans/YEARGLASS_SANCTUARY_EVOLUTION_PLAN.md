=== YEARGLASS SANCTUARY EVOLUTION PLAN ===
Workspace: /home/user/fresh_clone (single source of truth)
Status: Design / roadmap definition. No implementation yet.
No new gameplay systems. Preserve calm sanctuary experience.

=== 1. THE ROOM AS THE SANCTUARY ===

Current objects (from scene/module):
- Notebook (journal): manual entry, no automatic memory writing
- Camera (photo mode): capture with filters, save to IndexedDB
- Radio (ambient channels): rain, forest, lofi, fireplace, ocean
- Terrarium (jar): water interaction + splash event + note sound; no dedicated focus mode
- Lamp, mug, hourglass: interactive with sound/visual feedback
- Clock/time display: implicit via simulation minute/weather

Future-ready interactions (design only — no new objects):

Notebook evolution:
- Current: user writes text note manually
- Ready: automatic milestone entries from engine (milestone, relationship, discovery, anniversary, focus) should appear as pre-filled or suggested entries
- Ready: memory references (photo thumbnails embedded in notes)
- Ready: day markers (simulated date stamps)
- Ready: relationship history (creature visits, plant blooms, weather events) as journal sections

Camera evolution:
- Current: captures full scene with filter, saves dataUrl + metadata (simDay, weather, creatures present)
- Ready: photo should trigger memory association (firstPhotoDone flag exists; expand to photo-triggered milestone)
- Ready: photo gallery should show growth timeline (filter/order by simDay)
- Ready: creature close-up opportunity when creature is near jar (existing creature positions tracked)

Radio evolution:
- Current: 6 channels, procedural synthesis, weather-adaptive layers
- Ready: radio should adapt to time of day (morning = birds, night = crickets/frogs — already partially implemented)
- Ready: radio volume/gain should respond quietly to focus mode (lower ambient, maintain presence)
- Ready: new audio events (focus start/end) should blend with existing audio layers

Terrarium evolution (primary emotional point):
- Current: jar object = water splash event + sound
- Ready (design correction from previous audit): jar click opens close-up focus mode (see Terrarium Life Evolution section)
- Ready: jar interaction should include observation (close view), watering (existing), and gentle sound feedback (already implemented)

=== 2. TERRARIUM LIFE EVOLUTION ===

Current state (from core/constants, core/types, engine):
- Plants: 5 stages (seed, sprout, young, mature, elder), age tracked by sim minutes
- Creatures: Weighted FSM (Idle, Wander, Explore, Eat, Rest, Interact, Sleep)
- Personality: traits (curious, social, shy, playful) — basic weight used in state selection
- Memory: milestone (intro, away), relationship (favorite_plant, first_interaction — basic), discovery, anniversary, focus, photo
- Traits: empty array by default; rare trait definitions exist (glowing mushroom, four-leaf clover) but mutation/generation inheritance not implemented

Natural evolution timeline (design — aligned with existing engine capabilities):

Day 1 (existing):
- Starter plants (moss, fern, clover) at seed/sprout
- Pip (ladybug) present
- Intro message shown
- First milestone memory: "The world began"

Day 2 (existing milestone):
- Milestone memory triggers automatically at sim time progression
- Observation opportunity: user can observe growth (journal entry suggested)

Day 7 (existing milestone):
- Milestone memory: anniversary-style reflection
- Plants should show visible growth (young stage for fast-growing; mature for slow)
- Creature routine established (Pip visits favorite plant, explores regularly)

Day 30 (existing milestone):
- Plants mature or elder
- Creature personality more visible through behavior patterns (favorite location, rest time)
- Memory accumulation: photo gallery has variety; journal has entries

Day 100 (existing milestone):
- Deep milestone: sanctuary feels lived-in
- Plants show elder stages; some may bloom (bloom event from engine exists)
- Creature companion behavior: Pip shows preference for specific plant/slot
- Memory: "This is where we grew together"

Plant evolution details (use existing stage system):
- No new data structure needed; existing `stage` (0-4) handles growth
- Visual: stage changes already reflected in rendering (`plants.ts` uses stage for art)
- Bloom event (`EV.BLOOM`) exists; rare bloom could trigger milestone
- Water event triggers splash; no over-watering penalty in current engine (intentional simplicity)

Creature evolution details (use existing personality + FSM):
- Personality weights (`curious`, `social`, `shy`, `playful`) already exist in constants/types
- Routine: creature visits plants, rests, explores; over time patterns emerge
- Memory: relationship event for "favorite plant" can be triggered after repeated interactions (pet event count > 5, for example)
- No complex AI needed — existing weighted random selection produces believable patterns over time

=== 3. FUTURE CUSTOMIZATION BACKLOG (Record Only) ===

Backlog items for future phases (not implemented):
- Design Pip's habitat: custom jar decorations, moss varieties, crystal placements, fairy castles, seasonal themes
- Plant customization: moss varieties (soft, star, sheet), crystal decorations (amethyst, quartz), small decorations
- Creature customization: different starter species, accessory options (tiny hat, scarf — cosmetic only)
- Room customization: different lamp colors, mug patterns, notebook covers, desk arrangements
- Theme customization: season backgrounds (spring bloom, winter frost, autumn leaves), weather frequency adjustments
- Memory book customization: cover design, photo arrangement, journal themes
- No gameplay impact; cosmetic only; preserves calm experience

=== 4. LONG-TERM RETURN LOOP ===

Existing mechanism: `catchUp()` handles away time; milestone memories trigger at intervals.

Proposed return experiences (use existing memory and engine systems):

After 1 day away:
- Milestone: "You were away" (already exists)
- Visual: plants show growth; creature behavior resumed naturally
- Memory: brief, gentle acknowledgment of absence

After 1 week away:
- Milestone: deeper reflection
- Plants: significantly larger; possible bloom
- Memory: "You returned to a world that kept living"
- Visual difference noticeable without overwhelming

After 1 month away:
- Plants: mature/elder stages
- Memory: longer-form milestone about companionship over time
- Creature: personality more pronounced through behavior patterns
- Visual: sanctuary feels well-established

After 1 year away:
- Memory: anniversary milestone (existing in spec)
- Visual: elder plants, rich memory gallery, established creature patterns
- Emotional: sanctuary feels like a place that remembers you

Avoid:
- Grinding or tasks
- Upgrade trees or currencies
- Chores or penalties
- Complex mechanics that break calm

=== 5. IMPLEMENTATION REVIEW ===

Which existing systems support this naturally?
- Engine: `stage`, `ageDays`, `simTime`, `memory`, `catchUp()` — fully supports growth and time progression
- Memory: `addMemory()` supports milestone, relationship, discovery, anniversary, focus, photo — supports emotional milestones
- Visual: `plants.ts` uses `stage` for art changes; `creatures.ts` uses personality/state — supports behavior patterns
- Storage: save/load preserves all identity and progression data
- Module: `yearglass.ts` and platform integration work correctly
- Audio: visibility suspension + interaction unlock preserved; audio layers adapt to weather/time

What needs changes:
- Memory engine: deeper relationship events (optional, uses existing `addMemory()`)
- Focus mode: close-up transition requires new panel/component (design only; no new gameplay system)
- Visual: no changes needed for growth/evolution; existing art stages sufficient
- Module: jar interaction can open focus mode instead of just water event (uses existing interaction system)
- Performance: visibility suspension already implemented; no changes needed for long sessions

Batch recommendation (after approval):
Batch A (Low risk): Deeper relationship memory events (use existing memory API)
Batch B (Medium risk): Focus mode camera transition + close-up overlay (new UI component, no gameplay change)
Batch C (Low risk): Return loop milestone messages (use existing milestone API)
Batch D (Medium risk): Visual close-up layer adjustments (new overlay component)
Batch E (Verification): Mobile/build verification with rebuilt environment
