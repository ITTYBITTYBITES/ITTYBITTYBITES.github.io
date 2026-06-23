# Liquid Memory Workstation — Blender / 3D Artist Handoff Package

**Purpose:** Build the final high-fidelity `liquid-memory-workstation.glb` that can drop into the existing Liquid Memory engine without code changes.

The engine is already GLB/anchor-driven. If this handoff package is followed, the exported GLB will be compatible with:

```text
website/assets/models/liquid-memory-workstation.glb
```

---

## 1. Required Output

Deliver one optimized binary glTF file:

```text
liquid-memory-workstation.glb
```

Target location in repo:

```text
website/assets/models/liquid-memory-workstation.glb
```

The GLB must include:

- desk
- parchment / blueprint sheet
- gear set
- lamp
- scrolls / drafting tools
- rails
- ornamentation
- telemetry / schematic plates
- named anchor empties
- PBR materials and packed textures

---

## 2. Coordinate System

Use this scene convention:

```text
X = left / right across the desk
Y = bottom / top across the desk
Z = height above desk / paper surface
```

The workstation should be centered around world origin.

Approximate production framing:

```text
Desk center:             [0, 0, -2.82]
Paper center:            [0, -0.2, -1.92]
Interactive surface:     z ≈ -1.18 to -1.03
Camera target:           [0, -0.28, -1.35]
```

---

## 3. Required Anchor Empties

Create Blender Empty objects with these exact names:

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
anchor_engage_dial
```

### Anchor coordinates

| Empty Name | Location |
|---|---:|
| `anchor_games` | `[0.0, 0.72, -1.18]` |
| `anchor_archive` | `[-2.36, 0.05, -1.18]` |
| `anchor_community` | `[2.34, 0.0, -1.18]` |
| `anchor_blueprint` | `[0.0, -1.42, -1.18]` |
| `anchor_memory` | `[-1.48, -1.34, -1.18]` |
| `anchor_schematic_plate` | `[0.0, -3.92, -1.06]` |
| `anchor_blueprint_nav_plate` | `[-4.28, 3.62, -1.08]` |
| `anchor_lamp` | `[4.9, 3.45, 4.2]` |
| `anchor_paper_center` | `[0.0, -0.2, -1.92]` |
| `anchor_desk_center` | `[0.0, 0.0, -2.82]` |
| `anchor_engage_dial` | `[0.0, -2.82, -1.03]` |

**Do not rename these.** The engine discovers anchors by `anchor_` prefix.

---

## 4. Required Gear Mesh Names

The engine discovers raycastable gears by mesh names containing these prefixes:

```text
gear_games
gear_archive
gear_community
gear_blueprint
gear_memory
```

Recommended hierarchy:

```text
gear_games_body
gear_games_teeth
gear_games_hub
gear_games_outer_ring
gear_games_inner_ring
gear_games_label
```

Repeat the pattern for:

```text
gear_archive_*
gear_community_*
gear_blueprint_*
gear_memory_*
```

The mesh can be one object or many child meshes. As long as the mesh name includes the gear prefix, the raycaster can map it.

---

## 5. Required Object Groups / Naming

Recommended object names:

```text
desk_body
desk_surface
desk_front_drawers
desk_drawer_pulls
blueprint_paper
blueprint_grid_ink
blueprint_schematic_marks
paper_rail_top
paper_rail_bottom
paper_rail_left
paper_rail_right
lamp_base
lamp_stem
lamp_shade
lamp_bulb
rolled_parchment_scroll_01
rolled_parchment_scroll_02
rolled_parchment_scroll_03
corner_ornament_tl
corner_ornament_tr
corner_ornament_bl
corner_ornament_br
rivet_*
routed_cable_*
engage_dial_body
engage_dial_ring
engage_dial_label
schematic_v09_plate
blueprint_nav_plate
```

---

## 6. Material Slots

Use these material names where possible:

```text
mat_dark_oiled_walnut
mat_aged_blueprint_parchment
mat_oxidized_bronze
mat_worn_brass
mat_blackened_iron
mat_burnt_umber_ink
mat_subtle_bioluminescent_cyan
mat_warm_lamp_glass
mat_aged_scroll_paper
```

### PBR requirements

Each major material should use:

```text
Base Color
Roughness
Normal
Ambient Occlusion if available
Metalness for metals
```

Recommended values:

| Material | Metalness | Roughness |
|---|---:|---:|
| Wood | 0.0–0.05 | 0.75–0.95 |
| Parchment | 0.0 | 0.85–1.0 |
| Oxidized bronze | 0.75–1.0 | 0.35–0.65 |
| Brass | 0.7–0.95 | 0.25–0.55 |
| Blackened iron | 0.65–0.95 | 0.45–0.75 |
| Ink | 0.0 | 0.9–1.0 |
| Lamp glass | 0.0 | 0.1–0.35 |

---

## 7. Texture Requirements

Preferred texture format before export:

```text
PNG or WebP for source
Packed into GLB for delivery
```

Recommended max texture sizes:

```text
Desk wood: 2048x2048
Parchment: 2048x2048
Bronze/metal atlas: 2048x2048
Small props/scrolls: 1024x1024
Ink decals: 1024x1024 or atlas
```

Use atlases where possible.

Avoid shipping many separate 4K textures.

---

## 8. Polygon Budget

Target for production web/mobile:

```text
Preferred: 50k–120k triangles
Maximum: 200k triangles if optimized and tested
```

Suggested allocation:

| Asset | Target tris |
|---|---:|
| Desk + drawers | 5k–15k |
| Parchment | 500–3k |
| Main gear | 8k–20k |
| Smaller gears total | 15k–45k |
| Lamp | 5k–15k |
| Scrolls/tools | 5k–20k |
| Ornaments/rivets | 10k–50k |

If ornamentation becomes expensive, bake detail into normal maps.

---

## 9. Export Settings

Blender export settings:

```text
Format: glTF Binary (.glb)
Include: Selected Objects or Scene
Transform: +Y Up is okay; verify in Three.js
Apply Modifiers: Yes
UVs: Yes
Normals: Yes
Tangents: Yes if using normal maps
Materials: Export
Images: Automatic / packed
Animations: Off unless intentionally used
Compression: Optional, avoid if it complicates GitHub Pages testing
```

Before export:

- apply object scale
- freeze transforms where appropriate
- ensure anchors are Empty objects
- ensure anchor names are exact
- ensure gear meshes include gear prefixes
- pack textures or ensure embedded GLB output

---

## 10. QA Checklist Before Delivery

Before handing off the GLB:

```text
[ ] File is named liquid-memory-workstation.glb
[ ] File opens in Blender after re-import
[ ] File opens in an online glTF viewer
[ ] All anchor_ empties are present
[ ] All gear_ mesh prefixes are present
[ ] No missing textures
[ ] No absolute file paths
[ ] Transforms applied
[ ] Model centered around origin
[ ] Gear cluster fits paper bounds
[ ] Lamp is upper-right
[ ] Schematic v0.9 plate is bottom center
[ ] Blueprint // Nav plate is top-left
[ ] File size under 12 MB
```

---

## 11. Engine Verification After Replacement

After replacing the GLB in the repo, run:

```bash
npm run test:home-kernel
node verify-home-kernel.mjs
```

In browser console, verify:

```js
window.LiquidMemoryKernel.isWorkstationModelLoaded()
window.LiquidMemoryKernel.getWorkstationAnchorCount()
window.LiquidMemoryKernel.getSpatialGearCount()
```

Expected:

```text
isWorkstationModelLoaded() === true
getWorkstationAnchorCount() >= 5
getSpatialGearCount() >= 5
```

---

## 12. Current Proxy Model

A proxy model currently exists here:

```text
website/assets/models/liquid-memory-workstation.glb
```

It is structurally valid but not final art quality. Use it as a reference for:

- object scale
- anchor naming
- general hierarchy
- gear placement

Do not treat it as the final visual target.
