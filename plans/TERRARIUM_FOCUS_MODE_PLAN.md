=== TERRARIUM FOCUS MODE PLAN ===
Workspace: /home/user/fresh_clone (platform repo + deploy output)
Reference source: /home/user/yearglass_ARCHIVED/ (original standalone)
No new features. Design correction only.

=== CURRENT BEHAVIOR ===
- Jar object is interactable (click = water + splash sound)
- No dedicated focus panel exists (PanelId: notebook, camera, radio, focus, settings, name; no "jar" or "terrarium")
- Module (yearglass.ts) renders preview with overview + expectations + launch button
- No camera transition or zoom into jar area
- Scene (platform) has lamp, jar interactable, but no dedicated "terrarium view" overlay

=== ORIGINAL DESIGN INTENT ===
- Glass dome should feel like opening the notebook or camera — a focused, intimate view of the sanctuary
- Player should see plants at close range, observe Pip behaviors, notice growth details, experience weather effects up close
- Should feel connected (not a separate disconnected scene) — same world, closer perspective
- Should allow interactions: water, photo, observe creature, return to desk view

=== MISSING PIECES ===
1. Dedicated panel/overlay for terrarium focus (like notebook panel)
2. Camera zoom/transition effect (Pixi.js camera scale/position change or overlay)
3. Close-up rendering of jar area (plants, creature, soil, moisture)
4. Focus-mode interactions (observe, photo, water) within the focused view
5. Return transition back to full desk view
6. Audio context for focused mode (quieter, closer ambient)

=== REQUIRED CODE CHANGES (Plan only — no implementation) ===
File: src/ui/*.tsx (or equivalent in standalone) — add TerrariumPanel component
File: src/state/store.ts — add "terrarium" to PanelId type
File: src/experiences/yearglass.ts — add button/link to open terrarium focus mode (or wire jar click to open panel)
File: src/rendering/scene.ts (standalone yearglass source) — add zoom/transition method or overlay layer
File: src/state/host.ts (standalone) — wire jar interaction to open terrarium panel (instead of only water command)
File: src/audio/audioEngine.ts — add quieter/focused ambient layer when in focus mode

=== DESIGN SPECIFICATION (For approval) ===
- Click jar → smooth scale transition into jar area (2-3 second fade/scale)
- Overlay shows close-up: soil, plants (current stage visible close), creature (Pip), weather effects (rain on glass, light pools)
- Top-right or bottom: "Return to Sanctuary" button (same style as other panels)
- Within focus mode: buttons/controls for Observe (close view), Photo (capture current close-up), Water (apply water event)
- Focus mode does not pause simulation; continues quietly
- Audio: ambient layer reduced (lower gain), radio muted, closer ambient sounds (soft wind, creature sounds closer)
- Visual: darker background, focused lighting (lamp glow focused on jar area), reduced scene complexity

=== RISKS ===
- Low: Adding a new panel type is safe (PanelId enum extension)
- Low: Scene overlay/zoom is cosmetic (Pixi.js camera position change)
- Medium: Focus mode must maintain simulation accuracy (timer suspension must not break focus countdown or focus rewards)
- Low: Audio layer changes are additive (new gain node, not destructive)

=== ESTIMATED SCOPE ===
- Small-Medium: 1 new panel component, 1 new scene overlay method, 1 new host interaction mapping, audio gain adjustment
- No new dependencies
- No framework changes
- Preserves existing architecture

=== APPROVAL REQUESTED ===
Proceed with focus mode design? Confirm scope (panel + scene overlay + interaction mapping + audio layer) before implementation.
