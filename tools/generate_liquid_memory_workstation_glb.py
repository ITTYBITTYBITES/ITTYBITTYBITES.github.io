"""
Generate a high-fidelity proxy GLB for the Liquid Memory workstation.

This is not a substitute for a hand-authored Blender model, but it produces a
single packed .glb with embedded procedural PBR-style textures, named anchors,
and raycast-compatible gear mesh names.
"""
from __future__ import annotations

import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import trimesh
from trimesh.transformations import concatenate_matrices, rotation_matrix, translation_matrix
from trimesh.visual.material import PBRMaterial
from trimesh.visual.texture import TextureVisuals

OUT = Path('website/assets/models/liquid-memory-workstation.glb')
OUT.parent.mkdir(parents=True, exist_ok=True)

rng = np.random.default_rng(4332)


def font(size: int):
    for candidate in ['DejaVuSansMono-Bold.ttf', 'DejaVuSansMono.ttf']:
        try:
            return ImageFont.truetype(candidate, size)
        except Exception:
            pass
    return ImageFont.load_default()


def pbr(name, color=(1, 1, 1, 1), metallic=0.0, roughness=0.7, base_tex=None, normal_tex=None, emissive=None):
    return PBRMaterial(
        name=name,
        baseColorFactor=color,
        metallicFactor=metallic,
        roughnessFactor=roughness,
        baseColorTexture=base_tex,
        normalTexture=normal_tex,
        emissiveFactor=emissive,
        alphaMode='BLEND' if color[3] < 1 else None,
        doubleSided=True,
    )


def normal_noise(size=512, strength=16):
    arr = np.zeros((size, size, 4), dtype=np.uint8)
    n = np.clip(rng.normal(128, strength, (size, size)), 0, 255).astype(np.uint8)
    arr[..., 0] = n
    arr[..., 1] = n
    arr[..., 2] = 255
    arr[..., 3] = 255
    return Image.fromarray(arr, 'RGBA').filter(ImageFilter.GaussianBlur(0.35))


def wood_texture(w=1536, h=1024):
    img = Image.new('RGBA', (w, h), (28, 16, 8, 255))
    d = ImageDraw.Draw(img, 'RGBA')
    for y in range(h):
        wave = math.sin(y * 0.024) * 20 + math.sin(y * 0.007) * 32 + rng.normal(0, 3)
        d.line([(0, y), (w, y)], fill=(int(43 + wave), int(24 + wave * 0.36), int(10 + wave * 0.12), 255))
    for x in [180, 390, 620, 835, 1080, 1310]:
        d.rectangle([x - 3, 0, x + 3, h], fill=(9, 5, 2, 150))
        d.rectangle([x + 7, 0, x + 8, h], fill=(88, 53, 20, 35))
    for _ in range(5000):
        x = int(rng.integers(0, w)); y = int(rng.integers(0, h)); r = int(rng.integers(1, 5))
        d.ellipse([x-r, y-r, x+r, y+r], fill=(0, 0, 0, int(rng.integers(12, 62))))
    return img.filter(ImageFilter.GaussianBlur(0.18))


def parchment_texture(w=1800, h=1150):
    img = Image.new('RGBA', (w, h), (181, 133, 70, 255))
    d = ImageDraw.Draw(img, 'RGBA')
    for _ in range(26000):
        x = int(rng.integers(0, w)); y = int(rng.integers(0, h)); c = int(rng.integers(-28, 29))
        d.point((x, y), fill=(max(0, min(255, 181+c)), max(0, min(255, 133+c)), max(0, min(255, 70+c//2)), int(rng.integers(16, 60))))
    for _ in range(120):
        x = int(rng.integers(0, w)); y = int(rng.integers(0, h)); rad = int(rng.integers(24, 130))
        d.ellipse([x-rad, y-rad, x+rad, y+rad], fill=(80, 45, 16, int(rng.integers(4, 16))))
    grid = (54, 38, 18, 82)
    for x in range(90, w, 160): d.line([(x, 75), (x, h-90)], fill=grid, width=2)
    for y in range(95, h, 145): d.line([(75, y), (w-75, y)], fill=grid, width=2)
    ink = (43, 31, 17, 115)
    for i, (x, y) in enumerate([(205,170),(545,160),(910,180),(1270,160),(330,625),(780,555),(1215,640),(520,835),(1010,855)]):
        d.rectangle([x, y, x+125, y+70], outline=ink, width=3)
        d.ellipse([x+32, y+104, x+112, y+184], outline=ink, width=3)
        d.line([x-40, y+24, x+165, y+24], fill=(43, 31, 17, 55), width=2)
    d.text((w/2, h-158), 'SCHEMATIC v0.9', anchor='mm', font=font(84), fill=(55, 34, 14, 115))
    d.text((245, 70), 'BLUEPRINT // NAV', anchor='mm', font=font(38), fill=(55, 34, 14, 145))
    return img.filter(ImageFilter.GaussianBlur(0.12))


def patina_texture(size=768):
    img = Image.new('RGBA', (size, size), (95, 58, 28, 255))
    d = ImageDraw.Draw(img, 'RGBA')
    for _ in range(5200):
        x = int(rng.integers(0, size)); y = int(rng.integers(0, size)); r = int(rng.integers(1, 7))
        if rng.random() < 0.12:
            col = (48, 132, 114, int(rng.integers(18, 75)))
        else:
            col = (20, 10, 5, int(rng.integers(10, 80)))
        d.ellipse([x-r, y-r, x+r, y+r], fill=col)
    return img.filter(ImageFilter.GaussianBlur(0.25))


def label_texture(text, w=512, h=128, fg=(43, 32, 20, 255), bg=(0, 0, 0, 0), border=True):
    img = Image.new('RGBA', (w, h), bg)
    d = ImageDraw.Draw(img, 'RGBA')
    if border and bg[3] > 0:
        d.rectangle([12, 24, w-12, h-24], fill=bg, outline=(64, 44, 22, 150), width=3)
        d.rectangle([24, 35, w-24, h-35], outline=(230, 190, 125, 50), width=1)
    f = font(34)
    d.text((w/2+2, h/2+2), text, anchor='mm', font=f, fill=(255, 235, 190, 36))
    d.text((w/2, h/2), text, anchor='mm', font=f, fill=fg)
    return img


WOOD = wood_texture(); WOOD_N = normal_noise(512, 22)
PAPER = parchment_texture(); PAPER_N = normal_noise(512, 8)
PATINA = patina_texture(); METAL_N = normal_noise(512, 18)

mat_wood = pbr('mat_dark_oiled_walnut', base_tex=WOOD, normal_tex=WOOD_N, metallic=.02, roughness=.88)
mat_paper = pbr('mat_aged_blueprint_parchment', base_tex=PAPER, normal_tex=PAPER_N, metallic=0, roughness=.96)
mat_bronze = pbr('mat_oxidized_bronze', color=(.72,.46,.24,1), metallic=.92, roughness=.55, base_tex=PATINA, normal_tex=METAL_N)
mat_brass = pbr('mat_worn_brass', color=(.8,.58,.30,1), metallic=.82, roughness=.42, base_tex=PATINA, normal_tex=METAL_N)
mat_iron = pbr('mat_blackened_iron', color=(.08,.065,.055,1), metallic=.8, roughness=.68, base_tex=PATINA, normal_tex=METAL_N)
mat_ink = pbr('mat_burnt_umber_ink', color=(.12,.075,.035,1), metallic=0, roughness=.98)
mat_cyan = pbr('mat_subtle_bioluminescent_cyan', color=(.25,.86,.78,1), metallic=.05, roughness=.42, emissive=(.03,.22,.19))
mat_lamp = pbr('mat_warm_lamp_glass', color=(1,.68,.28,1), metallic=0, roughness=.2, emissive=(1,.44,.08))
mat_scroll = pbr('mat_aged_scroll_paper', color=(.57,.42,.24,1), metallic=0, roughness=.88, base_tex=parchment_texture(768,768), normal_tex=PAPER_N)

scene = trimesh.Scene()


def add(mesh, name, material=None, transform=None):
    if material is not None:
        mesh.visual.material = material
    scene.add_geometry(mesh, node_name=name, geom_name=name, transform=transform)
    return mesh


def box(name, ext, loc, material):
    return add(trimesh.creation.box(extents=ext), name, material, translation_matrix(loc))


def cyl(name, radius, height, loc, material, sections=64, rot=None):
    tf = translation_matrix(loc)
    if rot is not None: tf = concatenate_matrices(tf, rot)
    return add(trimesh.creation.cylinder(radius=radius, height=height, sections=sections), name, material, tf)


def plane(name, w, h, loc, material):
    verts = np.array([[-w/2,-h/2,0],[w/2,-h/2,0],[w/2,h/2,0],[-w/2,h/2,0]], float)
    faces = np.array([[0,1,2],[0,2,3]])
    mesh = trimesh.Trimesh(vertices=verts, faces=faces, process=False)
    mesh.visual = TextureVisuals(uv=np.array([[0,0],[1,0],[1,1],[0,1]], float), material=material)
    return add(mesh, name, None, translation_matrix(loc))

# Desk and parchment
box('desk_body_single_solid_walnut_slab', [16.8, 10.4, .42], [0,0,-.28], mat_wood)
box('desk_front_drawer_mass', [13.4,.62,.72], [0,-5.22,-.68], mat_wood)
for x in [-5.4,-2.7,0,2.7,5.4]: box(f'bronze_drawer_pull_{x:+.1f}', [.78,.08,.08], [x,-5.55,-.22], mat_brass)
plane('blueprint_paper_large_aged_schematic_surface', 13.6, 9.4, [0,-.2,.04], mat_paper)
for name,ext,loc in [('paper_rail_top',[13.4,.14,.18],[0,3.95,.16]),('paper_rail_bottom',[13.4,.14,.18],[0,-4.35,.16]),('paper_rail_left',[.14,8.45,.18],[-6.72,-.2,.16]),('paper_rail_right',[.14,8.45,.18],[6.72,-.2,.16])]: box(name,ext,loc,mat_iron)
# plates and labels
box('top_left_blueprint_nav_bronze_backplate',[3.2,.46,.06],[-4.35,3.58,.14],mat_brass)
plane('top_left_blueprint_nav_ink_label',2.9,.36,[-4.35,3.58,.20],pbr('label_blueprint_nav',base_tex=label_texture('BLUEPRINT // NAV', bg=(177,132,72,150)), roughness=.8))
box('bottom_schematic_v09_bronze_plate',[3.3,.52,.08],[0,-3.88,.15],mat_brass)
plane('bottom_schematic_v09_ink_label',2.95,.4,[0,-3.88,.23],pbr('label_schematic_v09',base_tex=label_texture('SCHEMATIC  v0.9', bg=(90,66,42,150)), roughness=.85))
for key,x in [('DEPTH 1',-3.2),('SIGNALS 0',-1.06),('TRACE 0',1.08),('PEARLS 0',3.22)]:
    plane('gauge_'+key.lower().replace(' ','_'),1.55,.28,[x,-3.50,.19],pbr('label_'+key,base_tex=label_texture(key,bg=(0,0,0,0),border=False), roughness=.9))

# gears
GEARS={'games':(0,.72,1.06,36),'archive':(-2.36,.05,.70,26),'community':(2.34,0,.76,28),'blueprint':(0,-1.42,.86,30),'memory':(-1.48,-1.34,.60,22)}
for gid,(x,y,r,teeth) in GEARS.items():
    cyl(f'gear_{gid}_body_cast_oxidized_bronze',r,.20,[x,y,.24],mat_bronze,sections=128)
    cyl(f'gear_{gid}_dark_recess',r*.58,.22,[x,y,.275],mat_iron,sections=96)
    cyl(f'gear_{gid}_hub',r*.27,.28,[x,y,.35],mat_bronze,sections=80)
    add(trimesh.creation.torus(major_radius=r*.66, minor_radius=.035, major_sections=128, minor_sections=10), f'gear_{gid}_worn_brass_inner_ring', mat_brass, translation_matrix([x,y,.43]))
    add(trimesh.creation.torus(major_radius=r*.91, minor_radius=.035, major_sections=128, minor_sections=10), f'gear_{gid}_outer_ring', mat_bronze, translation_matrix([x,y,.43]))
    add(trimesh.creation.torus(major_radius=r*.78, minor_radius=.012, major_sections=128, minor_sections=6), f'gear_{gid}_subtle_cyan_memory_inlay', mat_cyan, translation_matrix([x,y,.46]))
    for i in range(teeth):
        a=i/teeth*math.tau
        tf=concatenate_matrices(translation_matrix([x+math.cos(a)*r*1.08,y+math.sin(a)*r*1.08,.285]), rotation_matrix(a,[0,0,1]))
        add(trimesh.creation.box(extents=[r*.145,r*.32,.22]), f'gear_{gid}_individual_tooth_{i:02d}', mat_bronze, tf)
    box(f'gear_{gid}_engraved_label_plate',[r*1.1,.16,.04],[x,y,.50],mat_brass)
    plane(f'gear_{gid}_etched_label_text',r*1.0,.14,[x,y,.53],pbr('label_'+gid,base_tex=label_texture(gid.upper(), fg=(240,220,185,230), bg=(0,0,0,0), border=False), roughness=.8))

# engage dial
cyl('engage_dial_body',.66,.16,[0,-2.82,.22],mat_iron,sections=72)
add(trimesh.creation.torus(major_radius=.54,minor_radius=.04,major_sections=72,minor_sections=10),'engage_dial_worn_ring',mat_brass,translation_matrix([0,-2.82,.34]))
plane('engage_dial_etched_label',1.1,.22,[0,-2.82,.42],pbr('label_engage_dial',base_tex=label_texture('ENGAGE DIAL', fg=(48,34,20,230), bg=(0,0,0,0), border=False), roughness=.85))

# lamp / props
cyl('lamp_base_oxidized_iron',.46,.18,[5.25,3.15,.25],mat_iron,sections=80)
cyl('lamp_stem_bronze',.055,.95,[5.25,3.15,.78],mat_brass,sections=24)
cyl('lamp_shade_blackened_metal',.48,.34,[5.25,3.15,1.28],mat_iron,sections=80)
add(trimesh.creation.icosphere(subdivisions=3,radius=.23),'lamp_bulb_warm_glass',mat_lamp,translation_matrix([5.25,3.15,1.12]))
for i,(x,y,length) in enumerate([(-6.35,2.72,2.5),(6.35,2.25,2.25),(6.16,-2.92,2.1)]): cyl(f'rolled_parchment_scroll_{i}',.16,length,[x,y,.26],mat_scroll,sections=36,rot=rotation_matrix(math.pi/2,[0,1,0]))
for i,(x,y,a,l,matr) in enumerate([(-1.7,-2.95,.08,4.1,mat_brass),(2.8,-2.25,.28,2.8,mat_scroll),(-4.2,-3.18,-.12,2.35,mat_brass)]): add(trimesh.creation.box(extents=[l,.055,.05]), f'drafting_tool_{i}', matr, concatenate_matrices(translation_matrix([x,y,.23]), rotation_matrix(a,[0,0,1])))
for idx,(x,y,sx,sy) in enumerate([(-5.95,3.25,1,1),(5.95,3.25,-1,1),(-5.95,-3.7,1,-1),(5.95,-3.7,-1,-1)]):
    for k,rad in enumerate([.34,.50,.66]): add(trimesh.creation.torus(major_radius=rad,minor_radius=.018,major_sections=64,minor_sections=8), f'corner_scrollwork_{idx}_{k}', mat_bronze, translation_matrix([x+sx*.28,y+sy*.28,.25]))
    for rr in range(3): cyl(f'corner_rivet_{idx}_{rr}',.055,.05,[x+sx*(.18+rr*.22),y+sy*.10,.30],mat_brass,sections=24)
pts=np.array([[-5.6,-3.55,.18],[-3.4,-3.9,.19],[-1.2,-3.48,.19],[0,-3.8,.19],[3.7,-3.55,.19]])
for j in range(len(pts)-1):
    a,b=pts[j],pts[j+1]; mid=(a+b)/2; length=np.linalg.norm(b-a); direction=(b-a)/length; T=trimesh.geometry.align_vectors([0,0,1], direction); add(trimesh.creation.cylinder(radius=.025,height=length,sections=8), f'blackened_routed_cable_{j}', mat_iron, concatenate_matrices(translation_matrix(mid),T))

# structural anchors
for name,(x,y,_,_) in GEARS.items(): cyl(f'anchor_{name}',.045,.012,[x,y,.56],mat_cyan,sections=18)
for name,loc in {
    'anchor_schematic_plate':(0,-3.88,.4), 'anchor_blueprint_nav_plate':(-4.35,3.58,.4), 'anchor_lamp':(5.25,3.15,1.45),
    'anchor_paper_center':(0,-.2,.2), 'anchor_desk_center':(0,0,.2), 'anchor_engage_dial':(0,-2.82,.42)
}.items(): cyl(name,.035,.012,loc,mat_cyan,sections=18)

OUT.write_bytes(trimesh.exchange.gltf.export_glb(scene))
print(f'Wrote {OUT} ({OUT.stat().st_size/1024:.1f} KiB), geometries={len(scene.geometry)}')
