import bpy
import bmesh
import math
import os

MODELS_DIR = "/Users/vishwjeetchavan/creative-technologist-studio/public/models"
os.makedirs(MODELS_DIR, exist_ok=True)

def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for obj in bpy.data.objects:
        bpy.data.objects.remove(obj, do_unlink=True)
    for mesh in bpy.data.meshes:
        bpy.data.meshes.remove(mesh, do_unlink=True)
    for mat in bpy.data.materials:
        bpy.data.materials.remove(mat, do_unlink=True)

def create_pbr_material(name, base_color=(0.8, 0.8, 0.8, 1.0), metallic=0.0, roughness=0.5, transmission=0.0, emission_color=(0,0,0,1), emission_strength=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = base_color
        bsdf.inputs["Metallic"].default_value = metallic
        bsdf.inputs["Roughness"].default_value = roughness
        if "Transmission Weight" in bsdf.inputs:
            bsdf.inputs["Transmission Weight"].default_value = transmission
        elif "Transmission" in bsdf.inputs:
            bsdf.inputs["Transmission"].default_value = transmission
        if "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = emission_color
            bsdf.inputs["Emission Strength"].default_value = emission_strength
    return mat

def export_asset(name):
    blend_path = os.path.join(MODELS_DIR, f"{name}.blend")
    glb_path = os.path.join(MODELS_DIR, f"{name}.glb")
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    bpy.ops.export_scene.gltf(
        filepath=glb_path,
        export_format='GLB',
        use_selection=False,
        export_apply=True,
        export_attributes=True
    )
    print(f"Exported {name} -> {glb_path} ({os.path.getsize(glb_path)} bytes)")

# ==============================================================================
# PROJECT 02: KINETIC SOUND MONOLITH (Matrix of 100 Articulated Obsidian Needles)
# ==============================================================================
def build_kinetic_monolith():
    reset_scene()
    obsidian_mat = create_pbr_material("Obsidian_Piston", base_color=(0.06, 0.07, 0.09, 1.0), metallic=0.92, roughness=0.12)
    gold_mat = create_pbr_material("Needle_Gold_Tip", base_color=(0.95, 0.82, 0.45, 1.0), metallic=0.95, roughness=0.1)
    chassis_mat = create_pbr_material("Brushed_Titanium", base_color=(0.35, 0.38, 0.42, 1.0), metallic=0.9, roughness=0.25)
    laser_mat = create_pbr_material("Laser_Ring", base_color=(1.0, 0.2, 0.4, 1.0), emission_color=(1.0, 0.2, 0.4, 1.0), emission_strength=5.0)

    # 1. Monolithic Base Chassis
    bpy.ops.mesh.primitive_cube_add(
        size=1.0,
        location=(0, 0, -1.1)
    )
    base = bpy.context.active_object
    base.scale = (3.2, 3.2, 0.3)
    base.name = "Monolith_Base_Chassis"
    base.data.materials.append(chassis_mat)

    # 2. Outer Guard Frame Rails
    for i in range(4):
        angle = i * (math.pi / 2)
        bpy.ops.mesh.primitive_cylinder_add(
            radius=0.035,
            depth=3.2,
            location=(math.cos(angle + math.pi/4) * 2.1, math.sin(angle + math.pi/4) * 2.1, 0.5)
        )
        post = bpy.context.active_object
        post.name = f"Frame_Post_{i+1}"
        post.data.materials.append(chassis_mat)

    # 3. 10x10 Matrix of Kinetic Pins / Needles
    grid_size = 10
    spacing = 0.26
    start_offset = -(grid_size - 1) * spacing * 0.5

    for r in range(grid_size):
        for c in range(grid_size):
            px = start_offset + c * spacing
            py = start_offset + r * spacing
            # Procedural ripple wave profile
            dist = math.sqrt(px**2 + py**2)
            height_wave = math.cos(dist * 3.5) * 0.45
            pz = -0.1 + height_wave

            # Piston Body
            bpy.ops.mesh.primitive_cylinder_add(
                radius=0.045,
                depth=1.4,
                location=(px, py, pz)
            )
            piston = bpy.context.active_object
            piston.name = f"Piston_{r}_{c}"
            piston.data.materials.append(obsidian_mat)

            # Gold Diamond Tip
            bpy.ops.mesh.primitive_cone_add(
                radius1=0.045,
                radius2=0.005,
                depth=0.12,
                location=(px, py, pz + 0.76)
            )
            tip = bpy.context.active_object
            tip.name = f"Tip_{r}_{c}"
            tip.data.materials.append(gold_mat)

    # 4. Floating Caustic Laser Ring
    bpy.ops.mesh.primitive_torus_add(
        major_radius=1.8,
        minor_radius=0.015,
        location=(0, 0, 1.25)
    )
    laser_ring = bpy.context.active_object
    laser_ring.name = "Laser_Emitter_Ring"
    laser_ring.data.materials.append(laser_mat)

    export_asset("project_kinetic_monolith")

# ==============================================================================
# PROJECT 03: ZERO-G TOURBILLON TIMEPIECE (Exploded Haute Horlogerie Engine)
# ==============================================================================
def build_tourbillon_timepiece():
    reset_scene()
    sapphire_mat = create_pbr_material("Sapphire_Crystal", base_color=(0.95, 0.98, 1.0, 1.0), metallic=0.05, roughness=0.04, transmission=0.95)
    rose_gold_mat = create_pbr_material("Rose_Gold", base_color=(0.92, 0.65, 0.55, 1.0), metallic=0.95, roughness=0.12)
    steel_mat = create_pbr_material("Polished_Steel", base_color=(0.90, 0.92, 0.94, 1.0), metallic=0.96, roughness=0.08)
    ruby_mat = create_pbr_material("Synthetic_Ruby", base_color=(0.9, 0.05, 0.25, 1.0), transmission=0.85, roughness=0.05)

    # 1. Octagonal Sapphire Crystal Case
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=8,
        radius=1.65,
        depth=0.6,
        location=(0, 0, 0)
    )
    case = bpy.context.active_object
    case.scale = (1.0, 1.0, 1.0)
    case.name = "Sapphire_Case"
    case.data.materials.append(sapphire_mat)

    # 2. Outer Planetary Hour Ring
    bpy.ops.mesh.primitive_torus_add(
        major_radius=1.45,
        minor_radius=0.035,
        location=(0, 0, 0.45)
    )
    hour_ring = bpy.context.active_object
    hour_ring.name = "Hour_Index_Ring"
    hour_ring.data.materials.append(rose_gold_mat)

    # 12 Hour Index Markers
    for h in range(12):
        angle = h * (math.pi * 2 / 12)
        hx = math.cos(angle) * 1.38
        hy = math.sin(angle) * 1.38
        bpy.ops.mesh.primitive_cube_add(
            size=0.06,
            location=(hx, hy, 0.46)
        )
        idx = bpy.context.active_object
        idx.scale = (1.5, 0.4, 0.5)
        idx.rotation_euler = (0, 0, angle)
        idx.name = f"Hour_Marker_{h+1}"
        idx.data.materials.append(steel_mat)

    # 3. Main Central Gear Train Wheels (Exploded in Zero-G along Z)
    gears = [
        {"r": 0.95, "teeth": 36, "z": 0.2, "mat": rose_gold_mat, "name": "Center_Wheel"},
        {"r": 0.72, "teeth": 28, "z": 0.0, "mat": steel_mat, "name": "Third_Wheel"},
        {"r": 0.55, "teeth": 20, "z": -0.2, "mat": rose_gold_mat, "name": "Fourth_Wheel"},
    ]

    for g in gears:
        bpy.ops.mesh.primitive_cylinder_add(
            radius=g["r"],
            depth=0.04,
            location=(0, 0, g["z"])
        )
        wheel = bpy.context.active_object
        wheel.name = g["name"]
        wheel.data.materials.append(g["mat"])

        # Spokes
        for s in range(5):
            s_angle = s * (math.pi * 2 / 5)
            bpy.ops.mesh.primitive_cylinder_add(
                radius=0.015,
                depth=g["r"] * 1.9,
                location=(0, 0, g["z"])
            )
            spoke = bpy.context.active_object
            spoke.rotation_euler = (math.pi / 2, s_angle, 0)
            spoke.name = f"{g['name']}_Spoke_{s}"
            spoke.data.materials.append(g["mat"])

    # 4. Flying Tourbillon Cage & Balance Wheel (At center top)
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.38,
        minor_radius=0.02,
        location=(0, 0, 0.32)
    )
    balance_wheel = bpy.context.active_object
    balance_wheel.name = "Tourbillon_Balance_Wheel"
    balance_wheel.data.materials.append(rose_gold_mat)

    # 4 Gold Inertia Screws on Balance Wheel
    for s in range(4):
        s_angle = s * (math.pi / 2)
        sx = math.cos(s_angle) * 0.38
        sy = math.sin(s_angle) * 0.38
        bpy.ops.mesh.primitive_cylinder_add(
            radius=0.015,
            depth=0.04,
            location=(sx, sy, 0.32)
        )
        screw = bpy.context.active_object
        screw.name = f"Inertia_Screw_{s+1}"
        screw.data.materials.append(steel_mat)

    # Central Ruby Endstone
    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=0.04,
        location=(0, 0, 0.34)
    )
    ruby = bpy.context.active_object
    ruby.name = "Ruby_Pivot_Jewel"
    ruby.data.materials.append(ruby_mat)

    export_asset("project_tourbillon_timepiece")

# ==============================================================================
# PROJECT 04: COMPUTATIONAL BIOLUMINESCENT FLORA (Alien Zero-G Terrarium)
# ==============================================================================
def build_computational_flora():
    reset_scene()
    chamber_mat = create_pbr_material("Containment_Glass", base_color=(0.92, 0.98, 1.0, 1.0), metallic=0.05, roughness=0.04, transmission=0.96)
    stem_mat = create_pbr_material("Biolum_Stem", base_color=(0.04, 0.12, 0.18, 1.0), metallic=0.5, roughness=0.3)
    petal_mat = create_pbr_material("Translucent_Petal", base_color=(0.2, 0.85, 0.7, 1.0), transmission=0.4, roughness=0.2)
    spore_mat = create_pbr_material("Glowing_Spore", base_color=(0.3, 1.0, 0.6, 1.0), emission_color=(0.3, 1.0, 0.6, 1.0), emission_strength=6.0)

    # 1. Cylindrical Zero-G Containment Tube
    bpy.ops.mesh.primitive_cylinder_add(
        radius=1.35,
        depth=3.2,
        location=(0, 0, 0)
    )
    tube = bpy.context.active_object
    tube.name = "Containment_Vessel"
    tube.data.materials.append(chamber_mat)

    # Top & Bottom Magnetic Vacuum Seal Caps
    for end_z in [-1.6, 1.6]:
        bpy.ops.mesh.primitive_cylinder_add(
            radius=1.45,
            depth=0.15,
            location=(0, 0, end_z)
        )
        cap = bpy.context.active_object
        cap.name = f"Vacuum_Cap_{'Bottom' if end_z < 0 else 'Top'}"
        metal_mat = create_pbr_material("Chamber_Metal", base_color=(0.2, 0.22, 0.26, 1.0), metallic=0.9, roughness=0.2)
        cap.data.materials.append(metal_mat)

    # 2. Central Fibonacci Tendril Stem
    mesh = bpy.data.meshes.new("FloraStemMesh")
    stem_obj = bpy.data.objects.new("Flora_Spiral_Stem", mesh)
    bpy.context.scene.collection.objects.link(stem_obj)

    bm = bmesh.new()
    steps = 45
    stem_verts = []
    for s in range(steps):
        t = s / steps # 0 to 1
        sz = -1.2 + t * 2.4
        spiral_angle = t * math.pi * 6.0
        spiral_radius = 0.12 + math.sin(t * math.pi) * 0.25
        sx = math.cos(spiral_angle) * spiral_radius
        sy = math.sin(spiral_angle) * spiral_radius
        stem_verts.append((sx, sy, sz))

    for i in range(len(stem_verts) - 1):
        v1 = bm.verts.new(stem_verts[i])
        v2 = bm.verts.new(stem_verts[i+1])
        bm.edges.new((v1, v2))

    bm.to_mesh(mesh)
    bm.free()

    bpy.context.view_layer.objects.active = stem_obj
    skin = stem_obj.modifiers.new("Skin", 'SKIN')
    sub = stem_obj.modifiers.new("Subsurf", 'SUBSURF')
    sub.levels = 1
    stem_obj.data.materials.append(stem_mat)

    # 3. Floating Phyllotaxis Bloom Petals & Glowing Spores
    petal_count = 24
    golden_angle = 2.39996 # 137.5 degrees in radians

    for p in range(petal_count):
        pt = p / petal_count
        p_angle = p * golden_angle
        p_dist = 0.25 + pt * 0.65
        pz = -0.6 + pt * 1.5

        px = math.cos(p_angle) * p_dist
        py = math.sin(p_angle) * p_dist

        # Sculptural Leaf Petal
        bpy.ops.mesh.primitive_uv_sphere_add(
            radius=0.14,
            location=(px, py, pz)
        )
        petal = bpy.context.active_object
        petal.scale = (1.5, 0.4, 0.8)
        petal.rotation_euler = (0.2, pt * 0.5, p_angle)
        petal.name = f"Flora_Petal_{p+1}"
        petal.data.materials.append(petal_mat)

        # Bioluminescent Spore Orb at petal tip
        bpy.ops.mesh.primitive_uv_sphere_add(
            radius=0.035,
            location=(px * 1.25, py * 1.25, pz + 0.05)
        )
        spore = bpy.context.active_object
        spore.name = f"Spore_Node_{p+1}"
        spore.data.materials.append(spore_mat)

    export_asset("project_computational_flora")

# ==============================================================================
# PROJECT 05: ELECTROMAGNETIC FERROFLUID ORB (Anti-Gravity Magnetic Spikes)
# ==============================================================================
def build_ferrofluid_orb():
    reset_scene()
    chrome_liquid_mat = create_pbr_material("Liquid_Ferrofluid", base_color=(0.04, 0.05, 0.07, 1.0), metallic=0.98, roughness=0.02)
    coil_mat = create_pbr_material("Copper_EM_Coil", base_color=(0.88, 0.45, 0.25, 1.0), metallic=0.92, roughness=0.18)
    housing_mat = create_pbr_material("Stator_Housing", base_color=(0.15, 0.17, 0.20, 1.0), metallic=0.85, roughness=0.25)
    field_glow_mat = create_pbr_material("Magnetic_Field_Line", base_color=(0.7, 0.2, 1.0, 1.0), emission_color=(0.7, 0.2, 1.0, 1.0), emission_strength=5.5)

    # 1. Anti-Gravity Core Ferrofluid Orb with Spikes
    mesh = bpy.data.meshes.new("FerrofluidOrbMesh")
    orb = bpy.data.objects.new("Ferrofluid_Orb", mesh)
    bpy.context.scene.collection.objects.link(orb)

    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=3, radius=0.85)

    # Deform vertices along magnetic dipole spike vectors
    for v in bm.verts:
        vec = v.co.normalized()
        # Spherical harmonics magnetic field pattern (spikes at poles and equator)
        spike = math.sin(vec.x * 6.0) * math.cos(vec.y * 6.0) * math.sin(vec.z * 6.0)
        v.co += vec * max(0.0, spike) * 0.42

    bm.to_mesh(mesh)
    bm.free()

    bpy.context.view_layer.objects.active = orb
    sub = orb.modifiers.new("Subsurf", 'SUBSURF')
    sub.levels = 1
    orb.data.materials.append(chrome_liquid_mat)

    # 2. 4 Stator Magnetic Pole Coils (Surrounding the orb at 90 deg)
    for i in range(4):
        angle = i * (math.pi / 2)
        cx = math.cos(angle) * 1.55
        cy = math.sin(angle) * 1.55

        # Pole core
        bpy.ops.mesh.primitive_cylinder_add(
            radius=0.22,
            depth=0.5,
            location=(cx, cy, 0)
        )
        pole = bpy.context.active_object
        pole.rotation_euler = (0, math.pi / 2, angle)
        pole.name = f"Magnetic_Pole_{i+1}"
        pole.data.materials.append(housing_mat)

        # Copper wire coil winding
        bpy.ops.mesh.primitive_torus_add(
            major_radius=0.24,
            minor_radius=0.045,
            location=(cx * 0.85, cy * 0.85, 0)
        )
        coil = bpy.context.active_object
        coil.rotation_euler = (0, math.pi / 2, angle)
        coil.name = f"Copper_Coil_{i+1}"
        coil.data.materials.append(coil_mat)

    # 3. Floating Magnetic Field Flux Rings (Gimbaled Orbit)
    field_radii = [1.3, 1.5, 1.7]
    for idx, r in enumerate(field_radii):
        bpy.ops.mesh.primitive_torus_add(
            major_radius=r,
            minor_radius=0.012,
            location=(0, 0, 0)
        )
        ring = bpy.context.active_object
        ring.rotation_euler = (idx * 0.5, idx * 0.7, 0)
        ring.name = f"Magnetic_Field_Ring_{idx+1}"
        ring.data.materials.append(field_glow_mat)

    export_asset("project_ferrofluid_orb")

if __name__ == "__main__":
    print("=== STARTING GENERATION OF ALL FLAGSHIP CREATIVE TECH PROJECTS ===")
    build_kinetic_monolith()
    build_tourbillon_timepiece()
    build_computational_flora()
    build_ferrofluid_orb()
    print("=== ALL 4 ADDITIONAL FLAGSHIP PROJECTS GENERATED SUCCESSFULLY ===")
