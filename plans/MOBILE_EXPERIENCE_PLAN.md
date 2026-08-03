=== MOBILE EXPERIENCE OPTIMIZATION PLAN ===
Workspace: /home/user/fresh_clone (single source of truth)
Status: Design only — no implementation until approved.
Reference: /home/user/yearglass_ARCHIVED/ (original source) + /home/user/fresh_clone/src/ (platform integration)

=== CURRENT PROBLEMS (Desktop-First Design on Mobile) ===
- Scene is scaled down from 1280x800 world; touch targets (lamp: 86x128, jar: ~236x46, notebook: 170x136) become very small on phones
- Interactive objects (mug, camera, hourglass, radio) clustered; precise tapping difficult
- Text in overview/preview sections may require zooming
- Focus mode (hourglass) and photo mode (camera) open full overlays; fine on desktop but may feel abrupt on mobile
- Audio loops and simulation tick run continuously; mobile battery/CPU impact significant (mitigated by visibility fixes but not optimized for small screens)
- No pinch/zoom support; no adaptive camera framing; no mobile-specific layout
- Touch events use `pointerdown` without `touchstart` fallback; some mobile browsers handle pointer differently
- No minimum touch target enforcement (mobile accessibility guidelines recommend 44px min)

=== PROPOSED LAYOUT CHANGES (Mobile-First Design) ===
1. Default Mobile Camera:
   - Closer framing: center on terrarium jar area rather than full desk
   - Scale scene to fill viewport width; crop left/right instead of shrinking entire world
   - Maintain portrait orientation; no landscape requirement

2. Adaptive Object Placement:
   - Objects remain at same world positions (no redesign of world geometry)
   - Interactive hitboxes expanded visually (not world geometry changed) — larger invisible touch zones around each object
   - Touch zones should be at least 48px diameter (accessibility standard) regardless of visual size

3. Responsive Text & Panels:
   - All text scaled with `clamp()` CSS or relative units; no fixed px for body text
   - Panel overlays (notebook, settings, camera) should slide up from bottom (mobile standard) rather than full-screen overlay
   - Focus mode countdown should have larger timer text and button

=== CAMERA CHANGES ===
- Default `worldRoot` scale larger on mobile viewport (detect via window.innerWidth)
- Smooth transition when opening focus/terrarium mode: zoom from desk view to jar area over 600ms
- Pinch/zoom: optional `touchmove` handler with scale limit (min 0.8, max 2.0) and pan boundary clamping
- When focus mode (hourglass) active: camera remains on jar area; timer visible as floating element (not full overlay blocking scene)

=== UI CHANGES ===
- Notebook: slide-up panel on mobile (same content, compact spacing)
- Camera photo filter selection: horizontal swipe cards instead of vertical list
- Radio channel selection: large circular buttons instead of text list
- Settings: grouped sections with larger touch targets
- Name dialog: larger input and keyboard-friendly spacing
- Intro overlay: larger text, single-action continue button (no small close icon)
- Focus badge: larger countdown number; positioned at top center (not floating near hourglass)

=== INTERACTION CHANGES ===
- Jar (terrarium) tap: opens focus/terrarium view (close-up) with smooth camera zoom; second tap or close button returns
- Creature tap: pet interaction with larger invisible touch zone; double-tap for name (same as desktop but larger zone)
- Plant tap: water splash with larger splash radius; touch zone around plant base expanded
- Lamp/mug/hourglass/notebook/camera/radio: invisible touch zones expanded to 48px minimum
- Pointer events: keep `pointerdown` but add `touchstart` fallback for mobile browsers that prefer it
- No precise tapping required on tiny objects

=== PERFORMANCE RECOMMENDATIONS ===
- Simulation tick remains 250ms; no change needed
- Visibility suspension (already implemented) is sufficient for background; add `document.hidden` check to audio init
- Web Audio: keep `noiseBuffer` at 1s (already reduced); lower ambient intervals further on mobile (optional adaptive rate based on `navigator.deviceMemory` or performance hint)
- Pixi rendering: bake layer resolution should not exceed viewport size; no change needed for small screens
- Image filters (photo): canvas filter operations are CPU-bound; add debounce or limit to one filter at a time on mobile
- Build bundle: remove GSAP/Howler if not used (already noted in audit)
- Add `touch-action: manipulation` CSS to prevent browser zoom on double-tap
- Add `user-scalable=no` only if pinch/zoom is handled manually; otherwise allow system zoom as accessibility fallback

=== ESTIMATED SCOPE ===
- Medium: responsive camera scaling (viewport detection + smooth transition)
- Small: touch zone expansion (CSS/invisible overlay adjustments in scene/module)
- Small: mobile panel layout adjustments (notebook, settings, focus)
- Small: interaction mapping updates (jar opens close-up mode)
- Small: performance checks (visibility, audio, build verification)
- No new dependencies
- No framework changes
- Preserves existing architecture

=== APPROVAL REQUESTED ===
Proceed with mobile layout + interaction fixes (Batch 1: responsive camera + touch zones)?
Proceed with focus mode zoom transition (Batch 2: camera zoom + close-up overlay)?
Proceed with performance checks (Batch 3: visibility/audio verification + mobile test)?
