"""
Liquid Memory Blender Anchor Template

Run inside Blender:
  blender --python tools/create_blender_anchor_template.py

This creates Empty anchors, material slots, and simple proxy geometry for the
Liquid Memory workstation GLB contract.
"""
import bpy
from mathutils import Vector

# Clear scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

ANCHORS = {
    'anchor_games': (0.0, 0.72, -1.18),
    'anchor_archive': (-2.36, 0.05, -1.18),
    'anchor_community': (2.34, 0.0, -1.18),
    'anchor_blueprint': (0.0, -1.42, -1.18),
    'anchor_memory': (-1.48, -1.34, -1.18),
    'anchor_schematic_plate': (0.0, -3.92, -1.06),
    'anchor_blueprint_nav_plate': (-4.28, 3.62, -1.08),
    'anchor_lamp': (4.9, 3.45, 4.2),
    'anchor_paper_center': (0.0, -0.2, -1.92),
    'anchor_desk_center': (0.0, 0.0, -2.82),
    'anchor_engage_dial': (0.0, -2.82, -1.03),
}

MATERIALS = {
    'mat_dark_oiled_walnut': (0.09, 0.045, 0.018, 1),
    'mat_aged_blueprint_parchment': (0.62, 0.43, 0.22, 1),
    'mat_oxidized_bronze': (0.38, 0.22, 0.11, 1),
    'mat_worn_brass': (0.72, 0.52, 0.26, 1),
    'mat_blackened_iron': (0.07, 0.06, 0.05, 1),
    'mat_burnt_umber_ink': (0.12, 0.075, 0.035, 1),
    'mat_subtle_bioluminescent_cyan': (0.18, 0.85, 0.78, 1),
    'mat_warm_lamp_glass': (1.0, 0.62, 0.22, 1),
    'mat_aged_scroll_paper': (0.55, 0.40, 0.23, 1),
}

for name, color in MATERIALS.items():
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    if bsdf:
        bsdf.inputs['Base Color'].default_value = color
        if 'Roughness' in bsdf.inputs:
            bsdf.inputs['Roughness'].default_value = 0.75
        if 'Metallic' in bsdf.inputs and any(k in name for k in ['bronze', 'brass', 'iron']):
            bsdf.inputs['Metallic'].default_value = 0.85

# Proxy desk
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, -2.82))
desk = bpy.context.object
desk.name = 'desk_body_proxy_scale_reference'
desk.dimensions = (16.8, 10.4, 0.42)
desk.data.materials.append(bpy.data.materials['mat_dark_oiled_walnut'])

# Proxy paper
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -0.2, -1.92))
paper = bpy.context.object
paper.name = 'blueprint_paper_proxy_bounds_reference'
paper.dimensions = (13.6, 9.4, 0.04)
paper.data.materials.append(bpy.data.materials['mat_aged_blueprint_parchment'])

# Gear proxy discs
GEARS = {
    'gear_games_proxy': (0.0, 0.72, -1.18, 1.06),
    'gear_archive_proxy': (-2.36, 0.05, -1.18, 0.70),
    'gear_community_proxy': (2.34, 0.0, -1.18, 0.76),
    'gear_blueprint_proxy': (0.0, -1.42, -1.18, 0.86),
    'gear_memory_proxy': (-1.48, -1.34, -1.18, 0.60),
}
for name, (x, y, z, r) in GEARS.items():
    bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=r, depth=0.16, location=(x, y, z + 0.12))
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(bpy.data.materials['mat_oxidized_bronze'])

# Empty anchors
for name, loc in ANCHORS.items():
    empty = bpy.data.objects.new(name, None)
    empty.empty_display_type = 'PLAIN_AXES'
    empty.empty_display_size = 0.18
    empty.location = loc
    bpy.context.collection.objects.link(empty)

# Lamp proxy
bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=0.25, location=ANCHORS['anchor_lamp'])
lamp = bpy.context.object
lamp.name = 'lamp_bulb_proxy'
lamp.data.materials.append(bpy.data.materials['mat_warm_lamp_glass'])

# Camera reference
bpy.ops.object.camera_add(location=(0, -0.42, 13.2), rotation=(0, 0, 0))
bpy.context.scene.camera = bpy.context.object

# Light reference
bpy.ops.object.light_add(type='SPOT', location=(4.9, 3.45, 5.2))
light = bpy.context.object
light.name = 'reference_upper_right_desk_lamp_spot'
light.data.energy = 900
light.data.spot_size = 0.65

# Save file
bpy.ops.wm.save_as_mainfile(filepath='liquid_memory_anchor_template.blend')
print('Created liquid_memory_anchor_template.blend')
