# Liquid Memory Workstation — Asset Specification

**Phase:** 2 — Custom Asset Production  
**Purpose:** Provide the modeling, texturing, naming, and coordinate-space contract for the production `.glb` workstation asset used by the Liquid Memory WebGL renderer.

This document is the handoff contract between the renderer and the 3D asset. If the model follows this spec, Phase 3 integration should be anchor-driven rather than trial-and-error.

---

## 1. Production Goal

The final asset should resemble a physical antique engineering workstation:

- dark wooden drafting desk
- aged parchment / blueprint sheet
- oxidized bronze gear mechanism
- warm upper-right desk lamp
- scrolls / paper rolls
- metal rails and rivets
- ornate corner hardware
- schematic plate marked `SCHEMATIC v0.9`
- stamped/etched `BLUEPRINT // NAV` identity plate
- all interaction points physically embedded in the desk/paper surface

The visual target is **not** a futuristic HUD. It is a tactile, lamp-lit, high-precision drafting machine.

---

## 2. Coordinate System Contract

The renderer uses a desk-local coordinate space centered on the workstation.

```text
X axis: left / right across the desk
Y axis: bottom / top across the desk
Z axis: height above desk surface
```

Current production coordinate assumptions:

```text
Desk plane center:          [0, 0, approximately -2.8]
Blueprint paper center:     [0, -0.2, approximately -1.9]
Interactive surface layer:  around z = -1.18 to -1.03
Camera target:              around [0, -0.28, -1.35]
```

The model should be authored so that the primary paper/gear system is centered around world origin.

---

## 3. Layout Profiles

The source of truth is:

```text
src/spatial/layout.constants.ts
```

The current profiles are:

- `desktop-landscape`
- `tablet-landscape`
- `tablet-portrait`
- `mobile-landscape`
- `mobile-portrait`

Each profile defines:

```ts
cameraPosition
cameraRotation
focalPoint
deskPlaneScale
orthographicZoom
```

The artist should model the asset around the **desktop-landscape** profile first, then verify the silhouette remains readable under the mobile/tablet profiles.

---

## 4. Critical Anchor Map

The following anchors must exist either as named empty nodes in the `.glb` or as clearly placed mesh origins.

### Required Named Nodes

```text
anchor_games
anchor_archive
anchor_community
anchor_blueprint
anchor_memory
anchor_schematic_plate
anchor_blueprint_nav_plate
anchor_lamp
anchor_paper_center
anchor_desk_center
```

### Primary Anchor Coordinates

These are the current target coordinates from the layout constants and renderer:

| Anchor | Approx. world coordinate | Purpose |
|---|---:|---|
| `anchor_games` | `[0.0, 0.72, -1.18]` | Primary gear / Arcade Genesis |
| `anchor_archive` | `[-2.36, 0.05, -1.18]` | Archive gear / Old Memory Vault |
| `anchor_community` | `[2.34, 0.0, -1.18]` | Community gear / Community Vortex |
| `anchor_blueprint` | `[0.0, -1.42, -1.18]` | Blueprint gear / level growth |
| `anchor_memory` | `[-1.48, -1.34, -1.18]` | Memory gear / trace collection |
| `anchor_schematic_plate` | `[0.0, -3.92, -1.06]` | Bottom schematic title/data plate |
| `anchor_blueprint_nav_plate` | `[-4.28, 3.62, -1.08]` | Top-left identity plate |
| `anchor_lamp` | `[4.9, 3.45, 4.2]` | Lamp/light source area |
| `anchor_paper_center` | `[0.0, -0.2, -1.92]` | Blueprint parchment center |
| `anchor_desk_center` | `[0.0, 0.0, -2.82]` | Desk center |

### Important

Gear meshes should be centered on their anchor points. The renderer may use these anchors later for raycasting, event spawning, camera focus, and layout debugging.

---

## 5. Paper Bounds

The blueprint/paper area should fit the following approximate bounds:

```text
min: [-6.2, -4.4]
max: [ 6.2,  4.4]
```

This is the active schematic zone where:

- gear mechanism is mounted
- memory traces appear
- telemetry is stamped
- schematic labels live

The paper should not be a tiny inset element. It should dominate the workstation surface.

---

## 6. Camera Composition Requirements

The asset should read well from a fixed orthographic/isometric view.

### Desktop target

```ts
cameraPosition: [0, -0.42, 13.2]
focalPoint:     [0, -0.28, -1.35]
orthographicZoom: 1.08
```

### Mobile portrait target

```ts
cameraPosition: [0, -0.85, 14.8]
focalPoint:     [0, -0.38, -1.35]
orthographicZoom: 0.74
```

### Artist requirement

The asset should look like a composed desk portrait from these camera views. Avoid details that only read from side angles.

---

## 7. Mesh Requirements

## 7.1 Desk

Required:

- substantial wooden surface
- visible edge thickness
- optional drawer/front mass
- dark, aged walnut or mahogany tone
- roughness/normal detail
- not a flat color plane

Recommended mesh names:

```text
desk_body
desk_surface
desk_front_drawers
desk_drawer_pulls
```

## 7.2 Blueprint Paper

Required:

- aged parchment/blueprint paper as a physical sheet
- slight thickness or bevel
- subtle waviness/imperfection
- schematic grid lines and faded technical markings
- accepts shadows from gears

Recommended mesh names:

```text
blueprint_paper
blueprint_grid_ink
blueprint_schematic_marks
```

## 7.3 Gear Set

Required gears:

```text
gear_games
gear_archive
gear_community
gear_blueprint
gear_memory
```

Each gear should include:

- real teeth geometry
- central hub
- inner ring
- outer ring
- visible thickness
- oxidized bronze/copper material
- contact shadow onto paper
- label plate or etched label area

Recommended child mesh names:

```text
gear_games_body
gear_games_teeth
gear_games_hub
gear_games_label
```

Repeat naming pattern for all gears.

## 7.4 Engage Dial

Required:

- physical dial embedded in the lower schematic area
- not a UI button
- should look pressable/rotatable
- should be raycastable later

Recommended names:

```text
engage_dial_body
engage_dial_ring
engage_dial_label
anchor_engage_dial
```

## 7.5 Telemetry / Gauges

Telemetry must be part of the physical surface.

Labels:

```text
DEPTH
SIGNALS
TRACE
PEARLS
```

Preferred treatment:

- inked onto parchment, or
- etched into a brass schematic plate, or
- stamped on the lower `SCHEMATIC v0.9` plate

Recommended names:

```text
gauge_depth_plate
gauge_signals_plate
gauge_trace_plate
gauge_pearls_plate
```

Avoid modern floating digital panels.

## 7.6 Lamp

Required:

- top-right lamp matching the reference
- warm glass/emissive bulb mesh
- shade and base
- positioned to justify upper-right light source

Recommended names:

```text
lamp_base
lamp_stem
lamp_shade
lamp_bulb
anchor_lamp
```

## 7.7 Ornamentation

Required:

- corner hardware / filigree
- rivets
- routed wire/cable/vine-like elements
- metal rails around parchment

Recommended names:

```text
corner_ornament_tl
corner_ornament_tr
corner_ornament_bl
corner_ornament_br
paper_rail_top
paper_rail_bottom
paper_rail_left
paper_rail_right
routed_cable_*
rivet_*
```

---

## 8. Material Requirements

Use PBR materials. Avoid flat colors.

### Wood material

Maps preferred:

```text
baseColor
normal
roughness
ambientOcclusion
```

Characteristics:

```text
metalness: 0.0 to 0.05
roughness: 0.75 to 0.95
```

### Parchment material

Maps preferred:

```text
baseColor
normal
roughness
ink/decal overlay
```

Characteristics:

```text
metalness: 0.0
roughness: 0.85 to 1.0
```

### Oxidized bronze/copper

Maps preferred:

```text
baseColor
normal
roughness
metalness
ambientOcclusion
edge wear mask
patina mask
```

Characteristics:

```text
metalness: 0.75 to 1.0
roughness: 0.35 to 0.65
```

### Bioluminescent memory ink

Use sparingly.

Characteristics:

```text
color: cyan/green-blue
low emissive intensity
should feel like glowing ink, not neon signage
```

---

## 9. Lighting Expectations

The scene should be designed for a primary upper-right lamp.

Required lighting target:

```text
single warm key source from upper-right
soft but visible shadows
minimal ambient fill
subtle cyan memory glow only on active memory elements
```

The model must support shadows:

- gears cast shadows onto parchment
- lamp casts directional warmth
- ornaments and rails have contact shadows
- desk edge has visible depth

---

## 10. GLB Export Requirements

Export format:

```text
.glb binary glTF 2.0
```

Recommended file:

```text
website/assets/models/liquid-memory-workstation.glb
```

Requirements:

- apply transforms before export
- origin centered at workstation center
- units treated as arbitrary Three.js world units
- named meshes/nodes preserved
- PBR materials preserved
- texture paths embedded or packed in GLB
- no external absolute texture paths
- no unnecessary animation tracks unless intentionally included
- keep file optimized for web

Target size:

```text
Initial production asset: under 5 MB preferred
High-fidelity final asset: under 12 MB maximum if compressed/optimized
```

---

## 11. Integration Expectations for Phase 3

The renderer should eventually:

1. Load `liquid-memory-workstation.glb`.
2. Find named anchors.
3. Attach raycast handlers to gear meshes.
4. Use anchor positions instead of hardcoded procedural gear positions.
5. Spawn ink/memory traces on the blueprint plane.
6. Keep current Kernel persistence unchanged.

The GLB should therefore be organized so that anchors and interactive parts are discoverable by name.

---

## 12. Debugging / Layout Verification

The codebase includes:

```ts
drawLayoutGuides(scene, profile)
```

This can draw:

- paper bounds
- gear cluster anchor
- schematic plate anchor
- telemetry gauge anchors

Use it during integration to confirm the asset matches the expected layout skeleton.

---

## 13. Acceptance Criteria

A candidate GLB asset is acceptable when:

- it loads in Three.js without errors
- named anchors are present
- gear cluster aligns with layout constants
- paper fills the camera composition
- lamp is visible in the upper-right area
- gears appear physically mounted to the paper/desk
- telemetry feels etched/stamped, not floating
- shadows sell contact between objects and paper
- mobile portrait still reads as a deliberate workstation crop
- file size is acceptable for GitHub Pages

---

## 14. Current Placeholder Asset

A procedural placeholder exists at:

```text
website/assets/models/liquid-memory-workstation.glb
```

It contains the correct conceptual parts and named anchors, but it is not the final art-quality model. It should be used as a structural reference, not as the final visual target.
