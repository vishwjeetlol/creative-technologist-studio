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
# 1. HAUTE COUTURE TRENCH COAT (With Sleeves, Lapels, Storm Flap, Belt)
# ==============================================================================
def build_garment_mercury_trench():
    reset_scene()
    chrome_mat = create_pbr_material("Liquid_Mercury", base_color=(0.95, 0.96, 0.98, 1.0), metallic=0.98, roughness=0.04)
    gold_mat = create_pbr_material("Atelier_Gold", base_color=(0.90, 0.76, 0.45, 1.0), metallic=0.92, roughness=0.15)
    
    # 1. Main Torus Collar / Funnel Neck
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.16,
        minor_radius=0.035,
        location=(0, 0, -0.42),
        major_segments=32,
        minor_segments=8
    )
    collar = bpy.context.active_object
    collar.name = "Trench_Collar"
    collar.data.materials.append(chrome_mat)

    # 2. Torso & Flared Coat Skirt
    mesh = bpy.data.meshes.new("TrenchTorsoMesh")
    torso_obj = bpy.data.objects.new("Trench_Torso", mesh)
    bpy.context.scene.collection.objects.link(torso_obj)
    
    bm = bmesh.new()
    steps_z = 24
    steps_c = 32
    layers = []
    
    for h in range(steps_z):
        t = h / (steps_z - 1)
        z = -0.45 - t * 1.55 # -0.45 to -2.0
        
        if t < 0.2: # Chest
            rx = 0.38 - t * 0.15
            ry = 0.20
        elif t < 0.45: # Waist
            rx = 0.26 + (t - 0.2) * 0.1
            ry = 0.16
        else: # Wide flared flowing skirt
            k = (t - 0.45) / 0.55
            rx = 0.29 + k * 0.36
            ry = 0.18 + k * 0.24
            
        ring = []
        for c in range(steps_c):
            theta = c * (2 * math.pi / steps_c)
            # Front lapel opening indentation at front (cos(theta) > 0.8)
            lapel_slit = 0.92 if math.cos(theta) > 0.85 else 1.0
            ripple = math.sin(theta * 6.0 + t * 8.0) * (0.01 + t * 0.02)
            
            x = math.sin(theta) * (rx + ripple)
            y = math.cos(theta) * (ry + ripple) * lapel_slit
            ring.append(bm.verts.new((x, y, z)))
        layers.append(ring)
        
    bm.verts.ensure_lookup_table()
    for h in range(steps_z - 1):
        for c in range(steps_c):
            c_next = (c + 1) % steps_c
            bm.faces.new((layers[h][c], layers[h][c_next], layers[h+1][c_next], layers[h+1][c]))
            
    bm.to_mesh(mesh)
    bm.free()
    
    bpy.context.view_layer.objects.active = torso_obj
    sol = torso_obj.modifiers.new("Solidify", 'SOLIDIFY')
    sol.thickness = 0.012
    sub = torso_obj.modifiers.new("Subdiv", 'SUBSURF')
    sub.levels = 1
    torso_obj.data.materials.append(chrome_mat)

    # 3. Left & Right Draped Sleeves
    for side in [-1, 1]:
        bpy.ops.mesh.primitive_cylinder_add(
            radius=0.11,
            depth=1.1,
            location=(side * 0.46, 0.02, -0.95)
        )
        sleeve = bpy.context.active_object
        sleeve.rotation_euler = (0.1, -side * 0.18, 0)
        sleeve.scale = (0.85, 1.0, 1.0)
        sleeve.name = f"Trench_Sleeve_{'L' if side < 0 else 'R'}"
        sleeve.data.materials.append(chrome_mat)
        
        # Cuff strap
        bpy.ops.mesh.primitive_torus_add(
            major_radius=0.11,
            minor_radius=0.012,
            location=(side * 0.54, 0.08, -1.45)
        )
        cuff = bpy.context.active_object
        cuff.name = f"Trench_Cuff_{'L' if side < 0 else 'R'}"
        cuff.data.materials.append(gold_mat)

    # 4. Belt & Geometric Buckle
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.28,
        minor_radius=0.022,
        location=(0, 0, -1.05)
    )
    belt = bpy.context.active_object
    belt.name = "Trench_Belt"
    belt.data.materials.append(gold_mat)

    bpy.ops.mesh.primitive_cube_add(
        size=0.08,
        location=(0, 0.28, -1.05)
    )
    buckle = bpy.context.active_object
    buckle.scale = (1.4, 0.3, 1.1)
    buckle.name = "Trench_Buckle"
    buckle.data.materials.append(gold_mat)

    # 5. Double-breasted buttons
    for row in range(4):
        bz = -0.65 - row * 0.12
        for col in [-0.07, 0.07]:
            bpy.ops.mesh.primitive_cylinder_add(
                radius=0.015,
                depth=0.01,
                location=(col, 0.21 - row * 0.01, bz)
            )
            btn = bpy.context.active_object
            btn.rotation_euler = (math.pi / 2, 0, 0)
            btn.name = f"Button_{row}_{col}"
            btn.data.materials.append(gold_mat)

    export_asset("garment_mercury_trench")

# ==============================================================================
# 2. PRISMATIC GLASS CORSET (Faceted Bodice + Boning + Peplum Wings)
# ==============================================================================
def build_garment_prismatic_corset():
    reset_scene()
    glass_mat = create_pbr_material("Prismatic_Glass", base_color=(0.92, 0.96, 1.0, 1.0), metallic=0.1, roughness=0.06, transmission=0.92)
    plat_mat = create_pbr_material("Platinum_Hardware", base_color=(0.92, 0.94, 0.96, 1.0), metallic=0.95, roughness=0.1)

    # Sculptural Bustier Cups
    for side in [-1, 1]:
        bpy.ops.mesh.primitive_uv_sphere_add(
            radius=0.13,
            location=(side * 0.12, 0.12, -0.62)
        )
        cup = bpy.context.active_object
        cup.scale = (1.0, 0.7, 1.1)
        cup.name = f"Corset_Cup_{'L' if side < 0 else 'R'}"
        cup.data.materials.append(glass_mat)

    # Hourglass Faceted Bodice
    mesh = bpy.data.meshes.new("CorsetBodiceMesh")
    bodice = bpy.data.objects.new("Corset_Bodice", mesh)
    bpy.context.scene.collection.objects.link(bodice)
    
    bm = bmesh.new()
    steps_z = 16
    facets = 16
    layers = []
    
    for h in range(steps_z):
        t = h / (steps_z - 1)
        z = -0.55 - t * 0.95 # -0.55 to -1.50
        
        if t < 0.2:
            rx = 0.32 - t * 0.15
            ry = 0.20
        elif t < 0.65:
            kt = (t - 0.2) / 0.45
            rx = 0.29 - math.sin(kt * math.pi) * 0.08
            ry = 0.18 - math.sin(kt * math.pi) * 0.06
        else: # Sculptural Peplum Wing Flare
            kt = (t - 0.65) / 0.35
            rx = 0.23 + kt * 0.24
            ry = 0.14 + kt * 0.16
            
        ring = []
        for c in range(facets):
            theta = c * (2 * math.pi / facets)
            # Faceted diamond ribs
            crease = 1.0 + (0.08 if (c % 2 == 0) else -0.04)
            x = math.sin(theta) * rx * crease
            y = math.cos(theta) * ry * crease
            ring.append(bm.verts.new((x, y, z)))
        layers.append(ring)
        
    bm.verts.ensure_lookup_table()
    for h in range(steps_z - 1):
        for c in range(facets):
            c_next = (c + 1) % facets
            bm.faces.new((layers[h][c], layers[h][c_next], layers[h+1][c_next], layers[h+1][c]))
            
    bm.to_mesh(mesh)
    bm.free()
    
    bpy.context.view_layer.objects.active = bodice
    sol = bodice.modifiers.new("Solidify", 'SOLIDIFY')
    sol.thickness = 0.018
    bodice.data.materials.append(glass_mat)

    # Platinum Boning Skeleton Struts
    for c in range(0, facets, 2):
        theta = c * (2 * math.pi / facets)
        bpy.ops.mesh.primitive_cylinder_add(
            radius=0.007,
            depth=1.0,
            location=(math.sin(theta) * 0.25, math.cos(theta) * 0.16, -1.02)
        )
        strut = bpy.context.active_object
        strut.name = f"Boning_Strut_{c}"
        strut.data.materials.append(plat_mat)

    export_asset("garment_prismatic_corset")

# ==============================================================================
# 3. ANISOTROPIC CARBON KIMONO / EXOSKELETON (Pagoda Shoulders, Flared Sleeves)
# ==============================================================================
def build_garment_carbon_exoskeleton():
    reset_scene()
    carbon_mat = create_pbr_material("Carbon_Fiber", base_color=(0.10, 0.11, 0.13, 1.0), metallic=0.75, roughness=0.30)
    gold_mat = create_pbr_material("Atelier_Gold", base_color=(0.90, 0.76, 0.45, 1.0), metallic=0.92, roughness=0.15)

    # High Architectural Pagoda Shoulders
    for side in [-1, 1]:
        bpy.ops.mesh.primitive_cube_add(
            size=0.18,
            location=(side * 0.42, 0, -0.48)
        )
        shoulder = bpy.context.active_object
        shoulder.scale = (1.6, 0.8, 0.4)
        shoulder.rotation_euler = (0, 0, -side * 0.22)
        shoulder.name = f"Pagoda_Shoulder_{'L' if side < 0 else 'R'}"
        shoulder.data.materials.append(carbon_mat)

        # Flared Kimono Sleeves
        bpy.ops.mesh.primitive_cylinder_add(
            radius=0.16,
            depth=1.05,
            location=(side * 0.55, 0, -1.0)
        )
        sleeve = bpy.context.active_object
        sleeve.scale = (0.7, 1.2, 1.0)
        sleeve.rotation_euler = (0, -side * 0.15, 0)
        sleeve.name = f"Kimono_Sleeve_{'L' if side < 0 else 'R'}"
        sleeve.data.materials.append(carbon_mat)

    # Angular Diamond Torso
    mesh = bpy.data.meshes.new("CarbonTorsoMesh")
    torso = bpy.data.objects.new("Carbon_Torso", mesh)
    bpy.context.scene.collection.objects.link(torso)
    
    bm = bmesh.new()
    steps_z = 20
    steps_c = 24
    layers = []
    
    for h in range(steps_z):
        t = h / (steps_z - 1)
        z = -0.45 - t * 1.55
        
        if t < 0.25:
            rx = 0.38 - t * 0.2
            ry = 0.20
        elif t < 0.6:
            rx = 0.33
            ry = 0.18
        else:
            k = (t - 0.6) / 0.4
            rx = 0.33 + k * 0.22
            ry = 0.18 + k * 0.14
            
        ring = []
        for c in range(steps_c):
            theta = c * (2 * math.pi / steps_c)
            angularity = 1.0 + 0.14 * math.cos(theta * 4.0)
            x = math.sin(theta) * rx * angularity
            y = math.cos(theta) * ry * angularity
            ring.append(bm.verts.new((x, y, z)))
        layers.append(ring)
        
    bm.verts.ensure_lookup_table()
    for h in range(steps_z - 1):
        for c in range(steps_c):
            c_next = (c + 1) % steps_c
            bm.faces.new((layers[h][c], layers[h][c_next], layers[h+1][c_next], layers[h+1][c]))
            
    bm.to_mesh(mesh)
    bm.free()
    
    bpy.context.view_layer.objects.active = torso
    sol = torso.modifiers.new("Solidify", 'SOLIDIFY')
    sol.thickness = 0.018
    torso.data.materials.append(carbon_mat)

    # Gold Spine Vertebrae Armor Plates along Back
    for i in range(8):
        sz = -0.55 - i * 0.16
        bpy.ops.mesh.primitive_cube_add(
            size=0.07,
            location=(0, -0.20 - i * 0.01, sz)
        )
        plate = bpy.context.active_object
        plate.scale = (0.9, 0.35, 0.5)
        plate.name = f"Vertebra_{i+1}"
        plate.data.materials.append(gold_mat)

    export_asset("garment_carbon_exoskeleton")

# ==============================================================================
# 4. PARAMETRIC ORIGAMI PLEATS (Accordion Cape & Fluted Wings)
# ==============================================================================
def build_garment_origami_pleats():
    reset_scene()
    silk_mat = create_pbr_material("Origami_Silk", base_color=(0.94, 0.92, 0.88, 1.0), metallic=0.20, roughness=0.35)
    
    mesh = bpy.data.meshes.new("OrigamiPleatsMesh")
    obj = bpy.data.objects.new("Garment_Origami_Pleats", mesh)
    bpy.context.scene.collection.objects.link(obj)
    
    bm = bmesh.new()
    steps_z = 28
    pleats = 36
    layers = []
    
    for h in range(steps_z):
        t = h / (steps_z - 1)
        z = -0.44 - t * 1.55
        
        # Dramatic fluted cape flare
        base_r = 0.22 + (t ** 1.4) * 0.52
        pleat_amp = 0.014 + t * 0.065
        
        ring = []
        for c in range(pleats):
            theta = c * (2 * math.pi / pleats)
            fold = pleat_amp if (c % 2 == 0) else -pleat_amp
            twist = t * 0.4
            r = base_r + fold
            x = math.sin(theta + twist) * r * 1.15 # Broad elegant cape width
            y = math.cos(theta + twist) * r * 0.82
            ring.append(bm.verts.new((x, y, z)))
        layers.append(ring)
        
    bm.verts.ensure_lookup_table()
    for h in range(steps_z - 1):
        for c in range(pleats):
            c_next = (c + 1) % pleats
            bm.faces.new((layers[h][c], layers[h][c_next], layers[h+1][c_next], layers[h+1][c]))
            
    bm.to_mesh(mesh)
    bm.free()
    
    bpy.context.view_layer.objects.active = obj
    sol = obj.modifiers.new("Solidify", 'SOLIDIFY')
    sol.thickness = 0.009
    obj.data.materials.append(silk_mat)
    
    export_asset("garment_origami_pleats")

# ==============================================================================
# 5. NEURAL BIOLUMINESCENT PUFFER (Quilted Sleeves, High Funnel Neck, Neon Rings)
# ==============================================================================
def build_garment_neural_puffer():
    reset_scene()
    puffer_mat = create_pbr_material("Neural_Fabric", base_color=(0.08, 0.09, 0.12, 1.0), metallic=0.70, roughness=0.25)
    neon_mat = create_pbr_material("Neon_Biolum", base_color=(0.1, 0.85, 1.0, 1.0), emission_color=(0.1, 0.85, 1.0, 1.0), emission_strength=4.5)

    # 1. Puffed Sleeves Left & Right
    for side in [-1, 1]:
        for b in range(4):
            bz = -0.65 - b * 0.22
            bpy.ops.mesh.primitive_uv_sphere_add(
                radius=0.15,
                location=(side * (0.42 + b * 0.04), 0, bz)
            )
            baffle = bpy.context.active_object
            baffle.scale = (0.9, 0.9, 0.7)
            baffle.name = f"Puffer_Sleeve_Baffle_{side}_{b}"
            baffle.data.materials.append(puffer_mat)

            # Neon Ring between sleeve baffles
            bpy.ops.mesh.primitive_torus_add(
                major_radius=0.14,
                minor_radius=0.007,
                location=(side * (0.42 + b * 0.04), 0, bz - 0.11)
            )
            ring = bpy.context.active_object
            ring.name = f"Sleeve_Neon_{side}_{b}"
            ring.data.materials.append(neon_mat)

    # 2. Main Quilted Torso
    mesh = bpy.data.meshes.new("PufferTorsoMesh")
    torso = bpy.data.objects.new("Puffer_Torso", mesh)
    bpy.context.scene.collection.objects.link(torso)
    
    bm = bmesh.new()
    baffle_count = 11
    steps_c = 28
    total_steps = baffle_count * 3
    layers = []
    
    for s in range(total_steps):
        t = s / (total_steps - 1)
        z = -0.44 - t * 1.50
        
        if t < 0.2:
            rx = 0.30
            ry = 0.22
        elif t < 0.7:
            kt = (t - 0.2) / 0.5
            bulge = math.sin(kt * math.pi) * 0.15
            rx = 0.38 + bulge
            ry = 0.28 + bulge * 0.8
        else:
            rx = 0.34
            ry = 0.22
            
        phase = s % 3
        bulge = 0.035 if phase == 1 else -0.012
        
        ring = []
        for c in range(steps_c):
            theta = c * (2 * math.pi / steps_c)
            x = math.sin(theta) * (rx + bulge)
            y = math.cos(theta) * (ry + bulge)
            ring.append(bm.verts.new((x, y, z)))
        layers.append(ring)
        
    bm.verts.ensure_lookup_table()
    for s in range(total_steps - 1):
        for c in range(steps_c):
            c_next = (c + 1) % steps_c
            bm.faces.new((layers[s][c], layers[s][c_next], layers[s+1][c_next], layers[s+1][c]))
            
    bm.to_mesh(mesh)
    bm.free()
    
    bpy.context.view_layer.objects.active = torso
    sol = torso.modifiers.new("Solidify", 'SOLIDIFY')
    sol.thickness = 0.016
    torso.data.materials.append(puffer_mat)

    # Torso Neon Bioluminescent Rings
    for i in range(1, baffle_count):
        bz = -0.44 - (i / baffle_count) * 1.45
        bpy.ops.mesh.primitive_torus_add(
            major_radius=0.42,
            minor_radius=0.008,
            location=(0, 0, bz)
        )
        pipe = bpy.context.active_object
        pipe.scale = (1.0, 0.78, 1.0)
        pipe.name = f"Biolum_Pipe_{i}"
        pipe.data.materials.append(neon_mat)

    export_asset("garment_neural_puffer")

if __name__ == "__main__":
    print("=== STARTING GENERATION OF HIGH-FASHION COUTURE ASSETS ===")
    build_garment_mercury_trench()
    build_garment_prismatic_corset()
    build_garment_carbon_exoskeleton()
    build_garment_origami_pleats()
    build_garment_neural_puffer()
    print("=== ALL HIGH-FASHION COUTURE ASSETS EXPORTED SUCCESSFULLY ===")
