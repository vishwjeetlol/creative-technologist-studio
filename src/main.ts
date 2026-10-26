import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { studioAudio } from './audio';

// ============================================================================
// PROJECT EXHIBITION METADATA (5 FLAGSHIP CREATIVE TECH INSTALLATIONS)
// ============================================================================

interface ProjectMeta {
  id: string;
  name: string;
  category: string;
  desc: string;
  specMaterial: string;
  specMetricA: string;
  specMetricB: string;
  specMetricC: string;
  defaultMetallic: number;
  defaultRoughness: number;
  defaultParam: number;
  paramLabel: string;
  cameraPos: [number, number, number];
  cameraLook: [number, number, number];
}

const PROJECTS: ProjectMeta[] = [
  {
    id: 'couture-atelier',
    name: 'KINETIC SPATIAL ATELIER',
    category: 'INSTALLATION-01 // COMPUTATIONAL COUTURE',
    desc: 'Modular circular apparel rail featuring 5 generative couture garments: Liquid Mercury Trench, Prismatic Glass Corset, Anisotropic Carbon Kimono, Origami Pleats, and Neural Puffer.',
    specMaterial: 'Liquid Chrome & Optical Crown Glass',
    specMetricA: '5 Kinetic Wearables',
    specMetricB: '3.6m Suspension Ring',
    specMetricC: '96,000 Total Polygons',
    defaultMetallic: 0.98,
    defaultRoughness: 0.04,
    defaultParam: 0.8,
    paramLabel: 'WIND & DRAPE FLUTTER',
    cameraPos: [0, 1.45, 8.2],
    cameraLook: [0, 1.1, 0]
  },
  {
    id: 'kinetic-monolith',
    name: 'NEUROMORPHIC SOUND MONOLITH',
    category: 'INSTALLATION-02 // PHYSICAL KINETIC MATRIX',
    desc: 'Monumental acoustic transducer featuring a 10×10 matrix of 100 articulated obsidian needle pistons with 24k gold diamond tips rippling in real-time to synthesized audio waveforms.',
    specMaterial: 'High-Density Obsidian & 24k PVD Gold',
    specMetricA: '100 Articulated Pistons',
    specMetricB: '140 Hz Resonant Wave',
    specMetricC: '4.2 Tesla Magnetic Flux',
    defaultMetallic: 0.92,
    defaultRoughness: 0.12,
    defaultParam: 1.0,
    paramLabel: 'ACOUSTIC WAVE AMPLITUDE',
    cameraPos: [0, 2.2, 6.2],
    cameraLook: [0, 0.4, 0]
  },
  {
    id: 'tourbillon-timepiece',
    name: 'ZERO-G TOURBILLON TIMEPIECE',
    category: 'INSTALLATION-03 // HAUTE HORLOGERIE ENGINE',
    desc: 'Exploded mechanical tourbillon floating in zero-gravity inside an octagonal synthetic sapphire case. Features an oscillating balance wheel at 28,800 VPH, planetary gear train, and synthetic ruby jewels.',
    specMaterial: 'Synthetic Sapphire & 18k Rose Gold',
    specMetricA: '28,800 VPH Escapement',
    specMetricB: '60s Tourbillon Cage',
    specMetricC: '25 Synthetic Ruby Jewels',
    defaultMetallic: 0.95,
    defaultRoughness: 0.08,
    defaultParam: 1.0,
    paramLabel: 'EXPLODE GAP SEPARATION',
    cameraPos: [0, 1.2, 4.6],
    cameraLook: [0, 0.1, 0]
  },
  {
    id: 'computational-flora',
    name: 'BIOLUMINESCENT ALIEN FLORA',
    category: 'INSTALLATION-04 // XENOBOTANICAL CRYOPOD',
    desc: 'Zero-gravity computational terrarium housing an algorithmic alien flora specimen with a Fibonacci spiral stem, phyllotaxis bloom petals, and bioluminescent glowing synaptic spores.',
    specMaterial: 'Cryo Quartz & Biolum Chlorophyll',
    specMetricA: '137.5° Golden Angle',
    specMetricB: '480 Lumen Spore Pulse',
    specMetricC: 'Flora-X7 Xenobotanical',
    defaultMetallic: 0.35,
    defaultRoughness: 0.25,
    defaultParam: 1.2,
    paramLabel: 'SPORE PULSE FREQUENCY',
    cameraPos: [0, 1.3, 5.0],
    cameraLook: [0, 0.2, 0]
  },
  {
    id: 'ferrofluid-orb',
    name: 'ELECTROMAGNETIC FERROFLUID ORB',
    category: 'INSTALLATION-05 // ANTI-GRAVITY MAGNETICS',
    desc: 'Colloidal magnetic liquid core suspended in zero-gravity between 4 stator copper coils and 3 gimbal flux rings. Magnetic dipole field vectors produce dynamic surface spikes and fluid sheen.',
    specMaterial: 'Magnetite Colloidal Fe3O4 & Copper',
    specMetricA: '1.85 Tesla Dipole Field',
    specMetricB: '4 Magnetic Stator Coils',
    specMetricC: 'Octahedral Spherical Harmonics',
    defaultMetallic: 0.98,
    defaultRoughness: 0.02,
    defaultParam: 1.0,
    paramLabel: 'MAGNETIC SPIKE DENSITY',
    cameraPos: [0, 1.35, 4.8],
    cameraLook: [0, 0.1, 0]
  }
];

// Garment Metadata for Project 0
interface GarmentData {
  id: string;
  name: string;
  file: string;
  tag: string;
  desc: string;
  material: string;
  transmission: string;
  tension: string;
  nodes: string;
  defaultMetallic: number;
  defaultRoughness: number;
}

const GARMENTS: GarmentData[] = [
  {
    id: 'mercury-trench',
    name: 'LIQUID MERCURY TRENCH',
    file: '/models/garment_mercury_trench.glb',
    tag: 'COUTURE-01 // FLUID DISPLACEMENT',
    desc: 'Hyper-reflective fluid chrome coat with algorithmic surface ripples and micro-vortex dynamics. Synthesized with real-time vertex displacement and anisotropic specular lobes.',
    material: 'Liquid Chrome 99.8%',
    transmission: '0.00 (Opaque Mirror)',
    tension: '84.2 N/m²',
    nodes: '18,420 Vertices',
    defaultMetallic: 0.98,
    defaultRoughness: 0.04
  },
  {
    id: 'prismatic-corset',
    name: 'PRISMATIC GLASS CORSET',
    file: '/models/garment_prismatic_corset.glb',
    tag: 'COUTURE-02 // REFRACTIVE TRANSMISSION',
    desc: 'Sculptural anatomical bodice constructed from optical crown glass facets. Features internal total reflection, chromatic dispersion, and polished platinum boning.',
    material: 'Fused Silica Glass (IOR 1.54)',
    transmission: '0.88 (Optical Clear)',
    tension: '112.5 N/m²',
    nodes: '14,280 Vertices',
    defaultMetallic: 0.10,
    defaultRoughness: 0.06
  },
  {
    id: 'carbon-exoskeleton',
    name: 'CARBON EXOSKELETON',
    file: '/models/garment_carbon_exoskeleton.glb',
    tag: 'COUTURE-03 // ANISOTROPIC WEAVE',
    desc: 'Architectural structured kimono with pagoda shoulders and segmented vertebral spine plates. Features high-modulus carbon fiber micro-weave and atelier gold accents.',
    material: 'Continuous Carbon Braid',
    transmission: '0.00 (Opaque Shield)',
    tension: '240.0 N/m²',
    nodes: '16,940 Vertices',
    defaultMetallic: 0.75,
    defaultRoughness: 0.30
  },
  {
    id: 'origami-pleats',
    name: 'PARAMETRIC ORIGAMI PLEATS',
    file: '/models/garment_origami_pleats.glb',
    tag: 'COUTURE-04 // RADIAL ACCORDION',
    desc: 'Computational kinetic dress generated via algorithmic radial folding mathematics. Dynamic accordion pleats expand and flutter in response to virtual air resistance.',
    material: 'Memory Microfiber Silk',
    transmission: '0.12 (Subsurface Sheer)',
    tension: '46.0 N/m²',
    nodes: '19,800 Vertices',
    defaultMetallic: 0.20,
    defaultRoughness: 0.35
  },
  {
    id: 'neural-puffer',
    name: 'NEURAL BIOLUMINESCENT PUFFER',
    file: '/models/garment_neural_puffer.glb',
    tag: 'COUTURE-05 // VOLUMETRIC CELLULAR',
    desc: 'Baffled cocoon jacket with cellular pneumatic chambers. High-visibility bioluminescent fiber-optic seam piping pulses with generative synaptic frequencies.',
    material: 'Bioluminescent Ripstop Nylon',
    transmission: '0.05 (Translucent Baffle)',
    tension: '68.4 N/m²',
    nodes: '22,600 Vertices',
    defaultMetallic: 0.70,
    defaultRoughness: 0.25
  }
];

// ============================================================================
// STUDIO MAIN APP CLASS
// ============================================================================

class StudioApp {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private loader: GLTFLoader;

  // Active Project State
  private activeProjectIndex = 0;
  private projectGroups: THREE.Group[] = [];

  // Project 0: Couture Atelier
  private coutureGroup = new THREE.Group();
  private carouselGroup = new THREE.Group();
  private railRadius = 3.6;
  private carouselAngle = 0;
  private targetCarouselAngle = 0;
  private activeGarmentIndex = 0;
  private isDragging = false;
  private lastPointerX = 0;
  private garmentNodes: Array<{
    group: THREE.Group;
    meshGroup: THREE.Group;
    data: GarmentData;
    materials: THREE.Material[];
  }> = [];

  // Project 1: Kinetic Monolith
  private monolithGroup = new THREE.Group();
  private monolithPistons: Array<{ mesh: THREE.Object3D; baseZ: number; dist: number }> = [];
  private laserRing: THREE.Object3D | null = null;

  // Project 2: Tourbillon Timepiece
  private tourbillonGroup = new THREE.Group();
  private balanceWheel: THREE.Object3D | null = null;
  private centerWheel: THREE.Object3D | null = null;
  private thirdWheel: THREE.Object3D | null = null;
  private explodedParts: Array<{ obj: THREE.Object3D; baseZ: number; offsetZ: number }> = [];

  // Project 3: Computational Flora
  private floraGroup = new THREE.Group();
  private floraStem: THREE.Object3D | null = null;
  private floraPetals: Array<{ obj: THREE.Object3D; baseAngle: number; idx: number }> = [];
  private sporeNodes: Array<{ obj: THREE.Object3D; mat?: THREE.MeshStandardMaterial }> = [];

  // Project 4: Ferrofluid Orb
  private ferrofluidGroup = new THREE.Group();
  private ferrofluidOrb: THREE.Object3D | null = null;
  private fieldRings: THREE.Object3D[] = [];

  // Studio Lighting & Environment
  private ambientLight!: THREE.AmbientLight;
  private keyLight!: THREE.DirectionalLight;
  private rimLight!: THREE.DirectionalLight;
  private fillLight!: THREE.PointLight;
  private groundMirror!: THREE.Mesh;
  private currentLightPreset: 'noir' | 'prismatic' | 'golden' = 'noir';

  // Director Reel Mode (Instagram Video Capture)
  private isDirectorMode = false;
  private directorTime = 0;

  // Simulation Clock & Sliders
  private clock = new THREE.Clock();
  private isWireframe = false;
  private isExploded = false;
  private userMetallic = 0.95;
  private userRoughness = 0.08;
  private userParam = 1.0;

  constructor() {
    this.container = document.getElementById('webgl-container')!;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x07080a);
    this.scene.fog = new THREE.FogExp2(0x07080a, 0.045);

    this.camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 1.45, 8.2);
    this.camera.lookAt(0, 1.1, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    this.loader = new GLTFLoader();

    // Initialize 5 Project Root Groups
    this.projectGroups = [
      this.coutureGroup,
      this.monolithGroup,
      this.tourbillonGroup,
      this.floraGroup,
      this.ferrofluidGroup
    ];
    this.projectGroups.forEach(g => this.scene.add(g));

    this.setupEnvironment();
    this.setupGround();
    this.loadAllProjects();
    this.setupInteractions();
    this.setupUI();

    window.addEventListener('resize', this.onResize.bind(this));
    this.selectProject(0);
    this.animate();
  }

  // ==========================================================================
  // ENVIRONMENT & LIGHTING RIG
  // ==========================================================================

  private setupEnvironment() {
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    this.scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(this.ambientLight);

    this.keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    this.keyLight.position.set(3, 6, 5);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 2048;
    this.keyLight.shadow.mapSize.height = 2048;
    this.scene.add(this.keyLight);

    this.rimLight = new THREE.DirectionalLight(0xc8a265, 3.2);
    this.rimLight.position.set(-4, 4, -4);
    this.scene.add(this.rimLight);

    this.fillLight = new THREE.PointLight(0x38bdf8, 1.5, 12);
    this.fillLight.position.set(0, 2.5, 0);
    this.scene.add(this.fillLight);

    this.applyLightPreset('noir');
  }

  public applyLightPreset(preset: 'noir' | 'prismatic' | 'golden') {
    this.currentLightPreset = preset;
    if (preset === 'noir') {
      this.scene.background = new THREE.Color(0x07080a);
      this.scene.fog = new THREE.FogExp2(0x07080a, 0.045);
      this.ambientLight.intensity = 0.55;
      this.keyLight.color.setHex(0xffffff);
      this.keyLight.intensity = 3.2;
      this.rimLight.color.setHex(0xc8a265);
      this.rimLight.intensity = 3.0;
      this.fillLight.color.setHex(0x1e293b);
      this.fillLight.intensity = 0.8;
      this.renderer.toneMappingExposure = 1.15;
    } else if (preset === 'prismatic') {
      this.scene.background = new THREE.Color(0x06070c);
      this.scene.fog = new THREE.FogExp2(0x06070c, 0.04);
      this.ambientLight.intensity = 0.65;
      this.keyLight.color.setHex(0x38bdf8);
      this.keyLight.intensity = 3.8;
      this.rimLight.color.setHex(0xf43f5e);
      this.rimLight.intensity = 4.2;
      this.fillLight.color.setHex(0xa855f7);
      this.fillLight.intensity = 2.0;
      this.renderer.toneMappingExposure = 1.25;
    } else if (preset === 'golden') {
      this.scene.background = new THREE.Color(0x090807);
      this.scene.fog = new THREE.FogExp2(0x090807, 0.045);
      this.ambientLight.intensity = 0.65;
      this.keyLight.color.setHex(0xfef3c7);
      this.keyLight.intensity = 3.5;
      this.rimLight.color.setHex(0xd97706);
      this.rimLight.intensity = 3.8;
      this.fillLight.color.setHex(0xb45309);
      this.fillLight.intensity = 1.2;
      this.renderer.toneMappingExposure = 1.2;
    }

    document.querySelectorAll('.light-preset-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-preset') === preset);
    });
  }

  private setupGround() {
    const geo = new THREE.PlaneGeometry(30, 30);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x050608,
      roughness: 0.22,
      metalness: 0.85
    });
    this.groundMirror = new THREE.Mesh(geo, mat);
    this.groundMirror.rotation.x = -Math.PI / 2;
    this.groundMirror.position.y = 0.1;
    this.groundMirror.receiveShadow = true;
    this.scene.add(this.groundMirror);

    const ringGeo = new THREE.RingGeometry(3.5, 3.52, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xc8a265, side: THREE.DoubleSide, transparent: true, opacity: 0.25 });
    const floorRing = new THREE.Mesh(ringGeo, ringMat);
    floorRing.rotation.x = -Math.PI / 2;
    floorRing.position.y = 0.11;
    this.scene.add(floorRing);
  }

  // ==========================================================================
  // 3D MODEL LOADING FOR ALL 5 FLAGSHIP INSTALLATIONS
  // ==========================================================================

  private loadAllProjects() {
    // ------------------------------------------------------------------------
    // Project 0: Kinetic Couture Atelier
    // ------------------------------------------------------------------------
    this.coutureGroup.add(this.carouselGroup);
    this.loader.load('/models/circular_rail_static.glb', (gltf) => {
      this.coutureGroup.add(gltf.scene);
    });

    this.loader.load('/models/hanger_unit.glb', (hangerGltf) => {
      const angleStep = (Math.PI * 2) / GARMENTS.length;
      GARMENTS.forEach((data, index) => {
        const angle = index * angleStep;
        const x = Math.sin(angle) * this.railRadius;
        const z = Math.cos(angle) * this.railRadius;

        const garmentGroup = new THREE.Group();
        garmentGroup.position.set(x, 2.4, z);
        garmentGroup.rotation.y = angle + Math.PI;

        const hangerClone = hangerGltf.scene.clone();
        garmentGroup.add(hangerClone);

        const meshGroup = new THREE.Group();
        garmentGroup.add(meshGroup);
        this.carouselGroup.add(garmentGroup);

        const materials: THREE.Material[] = [];
        this.loader.load(data.file, (gltf) => {
          const model = gltf.scene;
          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;
              if (mesh.material) materials.push(Array.isArray(mesh.material) ? mesh.material[0] : mesh.material);

              if (data.id === 'mercury-trench' && mesh.material instanceof THREE.MeshStandardMaterial) {
                mesh.material.metalness = 1.0;
                mesh.material.roughness = 0.02;
              } else if (data.id === 'prismatic-corset') {
                const glassMat = new THREE.MeshPhysicalMaterial({
                  color: new THREE.Color(0x38bdf8),
                  transmission: 0.88,
                  opacity: 0.55,
                  transparent: true,
                  roughness: 0.08,
                  ior: 1.54,
                  thickness: 1.2,
                  metalness: 0.2,
                  depthWrite: false
                });
                mesh.material = glassMat;
                materials.push(glassMat);
              }
            }
          });
          meshGroup.add(model);
        });

        this.garmentNodes.push({ group: garmentGroup, meshGroup, data, materials });
      });
    });

    // ------------------------------------------------------------------------
    // Project 1: Kinetic Sound Monolith
    // ------------------------------------------------------------------------
    this.loader.load('/models/project_kinetic_monolith.glb', (gltf) => {
      const monolith = gltf.scene;
      monolith.position.set(0, 0.4, 0);
      monolith.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.name.startsWith('Piston')) {
            const pos = child.position;
            const dist = Math.sqrt(pos.x ** 2 + pos.y ** 2);
            this.monolithPistons.push({ mesh: child, baseZ: pos.z, dist });
          } else if (child.name.includes('Laser')) {
            this.laserRing = child;
          }
        }
      });
      this.monolithGroup.add(monolith);
    });

    // ------------------------------------------------------------------------
    // Project 2: Zero-G Tourbillon Timepiece
    // ------------------------------------------------------------------------
    this.loader.load('/models/project_tourbillon_timepiece.glb', (gltf) => {
      const watch = gltf.scene;
      watch.position.set(0, 0.6, 0);
      watch.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.name.includes('Tourbillon_Balance')) {
            this.balanceWheel = child;
          } else if (child.name.includes('Center_Wheel')) {
            this.centerWheel = child;
            this.explodedParts.push({ obj: child, baseZ: child.position.z, offsetZ: 0.5 });
          } else if (child.name.includes('Third_Wheel')) {
            this.thirdWheel = child;
            this.explodedParts.push({ obj: child, baseZ: child.position.z, offsetZ: 0.9 });
          } else if (child.name.includes('Sapphire_Case')) {
            const sapphireMat = new THREE.MeshPhysicalMaterial({
              color: new THREE.Color(0xffffff),
              transmission: 0.94,
              transparent: true,
              opacity: 0.6,
              roughness: 0.05,
              ior: 1.77,
              thickness: 1.5,
              depthWrite: false
            });
            (child as THREE.Mesh).material = sapphireMat;
          }
        }
      });
      this.tourbillonGroup.add(watch);
    });

    // ------------------------------------------------------------------------
    // Project 3: Computational Bioluminescent Flora
    // ------------------------------------------------------------------------
    this.loader.load('/models/project_computational_flora.glb', (gltf) => {
      const flora = gltf.scene;
      flora.position.set(0, 0.5, 0);
      flora.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          if (mesh.name.includes('Stem')) {
            this.floraStem = mesh;
          } else if (mesh.name.includes('Petal')) {
            this.floraPetals.push({ obj: mesh, baseAngle: mesh.rotation.z, idx: this.floraPetals.length });
          } else if (mesh.name.includes('Spore')) {
            const mat = mesh.material instanceof THREE.MeshStandardMaterial ? mesh.material : undefined;
            this.sporeNodes.push({ obj: mesh, mat });
          } else if (mesh.name.includes('Containment_Vessel')) {
            mesh.material = new THREE.MeshPhysicalMaterial({
              color: new THREE.Color(0xe0f2fe),
              transmission: 0.95,
              transparent: true,
              opacity: 0.45,
              roughness: 0.04,
              ior: 1.52,
              thickness: 0.8,
              depthWrite: false
            });
          }
        }
      });
      this.floraGroup.add(flora);
    });

    // ------------------------------------------------------------------------
    // Project 4: Electromagnetic Ferrofluid Orb
    // ------------------------------------------------------------------------
    this.loader.load('/models/project_ferrofluid_orb.glb', (gltf) => {
      const ferro = gltf.scene;
      ferro.position.set(0, 0.45, 0);
      ferro.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          if (mesh.name.includes('Ferrofluid_Orb')) {
            this.ferrofluidOrb = mesh;
            mesh.material = new THREE.MeshStandardMaterial({
              color: 0x07080b,
              metalness: 0.98,
              roughness: 0.04
            });
          } else if (mesh.name.includes('Field_Ring')) {
            this.fieldRings.push(mesh);
          }
        }
      });
      this.ferrofluidGroup.add(ferro);
    });
  }

  // ==========================================================================
  // PROJECT SWITCHER
  // ==========================================================================

  public selectProject(index: number) {
    this.activeProjectIndex = (index + PROJECTS.length) % PROJECTS.length;
    const cur = PROJECTS[this.activeProjectIndex];

    // Toggle 3D Group Visibility
    this.projectGroups.forEach((g, idx) => {
      g.visible = idx === this.activeProjectIndex;
    });

    // Toggle Garment Carousel HUD (Only for Project 0)
    const carouselHud = document.querySelector('.carousel-hud') as HTMLElement;
    if (carouselHud) {
      carouselHud.style.display = this.activeProjectIndex === 0 ? 'flex' : 'none';
    }

    // Smoothly reposition camera for this installation
    this.camera.position.set(...cur.cameraPos);
    this.camera.lookAt(...cur.cameraLook);

    // Update Project Switcher Nav Buttons
    document.querySelectorAll('.project-switch-btn').forEach(btn => {
      const pIdx = parseInt(btn.getAttribute('data-project') || '0', 10);
      btn.classList.toggle('active', pIdx === this.activeProjectIndex);
    });

    // Update Telemetry Panel UI
    this.updateProjectTelemetry();

    // Audio Feedback
    studioAudio.playClick(2400);
    studioAudio.playWhoosh(1);
  }

  private updateProjectTelemetry() {
    const cur = PROJECTS[this.activeProjectIndex];
    const tagElem = document.querySelector('.panel-tag');
    const titleElem = document.getElementById('garment-title');
    const descElem = document.getElementById('garment-desc');
    const matElem = document.getElementById('spec-material');
    const transElem = document.getElementById('spec-transmission');
    const tensionElem = document.getElementById('spec-tension');
    const nodesElem = document.getElementById('spec-nodes');
    const paramLabelElem = document.querySelector('label[for="slider-flutter"]');
    const paramSlider = document.getElementById('slider-flutter') as HTMLInputElement;

    if (tagElem) tagElem.textContent = cur.category;
    if (titleElem) titleElem.textContent = cur.name;
    if (descElem) descElem.textContent = cur.desc;
    if (matElem) matElem.textContent = cur.specMaterial;
    if (transElem) transElem.textContent = cur.specMetricA;
    if (tensionElem) tensionElem.textContent = cur.specMetricB;
    if (nodesElem) nodesElem.textContent = cur.specMetricC;
    if (paramLabelElem) paramLabelElem.textContent = cur.paramLabel;

    if (paramSlider) {
      paramSlider.value = cur.defaultParam.toString();
      this.userParam = cur.defaultParam;
    }
  }

  // ==========================================================================
  // INTERACTIONS (DRAG, SCROLL, HOTKEYS)
  // ==========================================================================

  private setupInteractions() {
    let startX = 0;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      this.isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      this.lastPointerX = clientX;
      startX = clientX;
      studioAudio.init();
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!this.isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const delta = (clientX - this.lastPointerX) * 0.005;

      if (this.activeProjectIndex === 0) {
        this.carouselAngle += delta;
        this.targetCarouselAngle = this.carouselAngle;
        if (Math.abs(delta) > 0.008) studioAudio.playRailTick(Math.abs(delta) * 100);
      } else {
        // Rotate current project model
        this.projectGroups[this.activeProjectIndex].rotation.y += delta * 1.5;
      }
      this.lastPointerX = clientX;
    };

    const onPointerUp = (e: MouseEvent | TouchEvent) => {
      if (!this.isDragging) return;
      this.isDragging = false;
      const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as MouseEvent).clientX;
      if (Math.abs(clientX - startX) < 5) {
        // Raycast click
      } else if (this.activeProjectIndex === 0) {
        this.snapToNearestGarment();
      }
    };

    const dom = this.renderer.domElement;
    dom.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    dom.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp, { passive: true });

    window.addEventListener('wheel', (e) => {
      if (this.isDirectorMode) return;
      if (this.activeProjectIndex === 0) {
        this.targetCarouselAngle += e.deltaY * 0.0015;
        this.snapToNearestGarment();
      } else {
        this.projectGroups[this.activeProjectIndex].rotation.y += e.deltaY * 0.002;
      }
    }, { passive: true });

    window.addEventListener('keydown', (e) => {
      if (e.key >= '1' && e.key <= '5') {
        const pIdx = parseInt(e.key, 10) - 1;
        this.selectProject(pIdx);
      } else if (e.key === ' ' || e.key === 'r' || e.key === 'R') {
        this.toggleDirectorMode();
      } else if (e.key === 'Escape') {
        if (this.isDirectorMode) this.toggleDirectorMode(false);
        const modal = document.getElementById('archive-modal');
        if (modal && !modal.hasAttribute('hidden')) modal.setAttribute('hidden', 'true');
      } else if (e.key === 'l' || e.key === 'L') {
        const presets: Array<'noir' | 'prismatic' | 'golden'> = ['noir', 'prismatic', 'golden'];
        const next = presets[(presets.indexOf(this.currentLightPreset) + 1) % presets.length];
        this.applyLightPreset(next);
      }
    });
  }

  private snapToNearestGarment() {
    const angleStep = (Math.PI * 2) / GARMENTS.length;
    let normalized = -this.targetCarouselAngle % (Math.PI * 2);
    if (normalized < 0) normalized += Math.PI * 2;
    const nearestIndex = Math.round(normalized / angleStep) % GARMENTS.length;
    this.selectGarment(nearestIndex);
  }

  public selectGarment(index: number) {
    this.activeGarmentIndex = (index + GARMENTS.length) % GARMENTS.length;
    const angleStep = (Math.PI * 2) / GARMENTS.length;
    const targetAngle = -this.activeGarmentIndex * angleStep;
    const diff = (targetAngle - this.carouselAngle) % (Math.PI * 2);
    let shortestDiff = diff;
    if (diff > Math.PI) shortestDiff -= Math.PI * 2;
    if (diff < -Math.PI) shortestDiff += Math.PI * 2;

    this.targetCarouselAngle = this.carouselAngle + shortestDiff;
    studioAudio.playWhoosh(shortestDiff > 0 ? 1 : -1);

    document.querySelectorAll('.garment-tab-item').forEach(tab => {
      const idx = parseInt(tab.getAttribute('data-index') || '0', 10);
      tab.classList.toggle('active', idx === this.activeGarmentIndex);
    });
  }

  // ==========================================================================
  // AUTONOMOUS DIRECTOR REEL MODE (INSTAGRAM VIDEO / CINEMATIC SCREEN RECORD)
  // ==========================================================================

  public toggleDirectorMode(forcedState?: boolean) {
    this.isDirectorMode = forcedState !== undefined ? forcedState : !this.isDirectorMode;
    document.body.classList.toggle('director-mode-active', this.isDirectorMode);
    const overlay = document.getElementById('director-overlay');
    if (overlay) {
      if (this.isDirectorMode) {
        overlay.removeAttribute('hidden');
        studioAudio.playDirectorChime();
        this.directorTime = 0;
      } else {
        overlay.setAttribute('hidden', 'true');
        const cur = PROJECTS[this.activeProjectIndex];
        this.camera.position.set(...cur.cameraPos);
        this.camera.lookAt(...cur.cameraLook);
      }
    }
  }

  // ==========================================================================
  // UI SYNC
  // ==========================================================================

  private setupUI() {
    // Project Switcher Buttons
    document.querySelectorAll('.project-switch-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const pIdx = parseInt((e.currentTarget as HTMLElement).getAttribute('data-project') || '0', 10);
        this.selectProject(pIdx);
      });
    });

    // Garment tabs
    document.querySelectorAll('.garment-tab-item').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const idx = parseInt((e.currentTarget as HTMLElement).getAttribute('data-index') || '0', 10);
        this.selectGarment(idx);
      });
    });

    document.getElementById('btn-prev-garment')?.addEventListener('click', () => {
      this.selectGarment(this.activeGarmentIndex - 1);
    });
    document.getElementById('btn-next-garment')?.addEventListener('click', () => {
      this.selectGarment(this.activeGarmentIndex + 1);
    });

    // Director Mode Trigger
    document.getElementById('btn-director-mode')?.addEventListener('click', () => this.toggleDirectorMode());
    document.getElementById('btn-exit-director')?.addEventListener('click', () => this.toggleDirectorMode(false));

    // Audio Synth Button
    const audioBtn = document.getElementById('btn-audio-toggle');
    const audioLabel = document.getElementById('audio-label');
    audioBtn?.addEventListener('click', () => {
      const enabled = studioAudio.toggle();
      if (audioLabel) audioLabel.textContent = enabled ? 'AUDIO ON' : 'AUDIO OFF';
      audioBtn.classList.toggle('action-pill-gold', enabled);
    });

    // Lighting preset triggers
    document.querySelectorAll('.light-preset-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const preset = (e.currentTarget as HTMLElement).getAttribute('data-preset') as 'noir' | 'prismatic' | 'golden';
        if (preset) this.applyLightPreset(preset);
        studioAudio.playClick(2200);
      });
    });

    // Sliders
    const metallicSlider = document.getElementById('slider-metallic') as HTMLInputElement;
    const roughnessSlider = document.getElementById('slider-roughness') as HTMLInputElement;
    const paramSlider = document.getElementById('slider-flutter') as HTMLInputElement;

    metallicSlider?.addEventListener('input', (e) => {
      this.userMetallic = parseFloat((e.target as HTMLInputElement).value);
      this.projectGroups[this.activeProjectIndex].traverse((child) => {
        if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).material instanceof THREE.MeshStandardMaterial) {
          ((child as THREE.Mesh).material as THREE.MeshStandardMaterial).metalness = this.userMetallic;
        }
      });
    });
    roughnessSlider?.addEventListener('input', (e) => {
      this.userRoughness = parseFloat((e.target as HTMLInputElement).value);
      this.projectGroups[this.activeProjectIndex].traverse((child) => {
        if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).material instanceof THREE.MeshStandardMaterial) {
          ((child as THREE.Mesh).material as THREE.MeshStandardMaterial).roughness = this.userRoughness;
        }
      });
    });
    paramSlider?.addEventListener('input', (e) => {
      this.userParam = parseFloat((e.target as HTMLInputElement).value);
    });

    // Wireframe & Explode
    const wireframeBtn = document.getElementById('btn-toggle-wireframe');
    wireframeBtn?.addEventListener('click', () => {
      this.isWireframe = !this.isWireframe;
      wireframeBtn.classList.toggle('active', this.isWireframe);
      this.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).material) {
          const mat = (child as THREE.Mesh).material;
          if ('wireframe' in mat) (mat as THREE.MeshStandardMaterial).wireframe = this.isWireframe;
        }
      });
      studioAudio.playClick(1500);
    });

    const explodeBtn = document.getElementById('btn-toggle-explode');
    explodeBtn?.addEventListener('click', () => {
      this.isExploded = !this.isExploded;
      explodeBtn.classList.toggle('active', this.isExploded);
      studioAudio.playClick(1200);
    });

    // Archive Modal
    const archiveModal = document.getElementById('archive-modal');
    document.getElementById('btn-open-archive')?.addEventListener('click', () => {
      archiveModal?.removeAttribute('hidden');
      studioAudio.playClick();
    });
    document.getElementById('btn-close-archive')?.addEventListener('click', () => {
      archiveModal?.setAttribute('hidden', 'true');
    });
    archiveModal?.addEventListener('click', (e) => {
      if (e.target === archiveModal) archiveModal.setAttribute('hidden', 'true');
    });
  }

  // ==========================================================================
  // RENDER LOOP & REAL-TIME MULTI-PHYSICS
  // ==========================================================================

  private animate() {
    requestAnimationFrame(this.animate.bind(this));

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Project 0: Kinetic Couture Carousel
    if (this.coutureGroup.visible) {
      if (!this.isDragging) {
        this.carouselAngle += (this.targetCarouselAngle - this.carouselAngle) * 0.08;
      }
      this.carouselGroup.rotation.y = this.carouselAngle;

      this.garmentNodes.forEach((node, idx) => {
        const bob = Math.sin(elapsedTime * 1.5 + idx * 1.2) * 0.035 * this.userParam;
        node.meshGroup.position.y = bob;
        if (node.data.id === 'neural-puffer') {
          const pulse = (Math.sin(elapsedTime * 3.0) + 1.0) * 0.5;
          node.materials.forEach(mat => {
            if (mat instanceof THREE.MeshStandardMaterial && mat.name.includes('Neon')) {
              mat.emissiveIntensity = 2.0 + pulse * 3.5;
            }
          });
        }
      });
    }

    // 2. Project 1: Kinetic Sound Monolith (100 Articulated Needles Wave)
    if (this.monolithGroup.visible) {
      this.monolithPistons.forEach(p => {
        const wave = Math.sin(p.dist * 3.8 - elapsedTime * 3.5) * 0.32 * this.userParam;
        p.mesh.position.z = p.baseZ + wave;
      });
      if (this.laserRing) {
        this.laserRing.rotation.z = elapsedTime * 0.5;
      }
    }

    // 3. Project 2: Zero-G Tourbillon Timepiece (High-Frequency Mechanical Escapement)
    if (this.tourbillonGroup.visible) {
      if (this.balanceWheel) {
        // 4 Hz escapement oscillation (28,800 VPH)
        this.balanceWheel.rotation.z = Math.sin(elapsedTime * 16.0 * this.userParam) * 0.55;
      }
      if (this.centerWheel) {
        this.centerWheel.rotation.z = elapsedTime * 0.25 * this.userParam;
      }
      if (this.thirdWheel) {
        this.thirdWheel.rotation.z = -elapsedTime * 0.65 * this.userParam;
      }
      // Zero-G Explode separation along Z
      const explodeFactor = this.isExploded ? 1.6 : 0.0;
      this.explodedParts.forEach(part => {
        part.obj.position.z = part.baseZ + part.offsetZ * explodeFactor;
      });
    }

    // 4. Project 3: Computational Bioluminescent Flora (Zero-G Organic Respiration)
    if (this.floraGroup.visible) {
      if (this.floraStem) {
        this.floraStem.rotation.z = Math.sin(elapsedTime * 0.8) * 0.06 * this.userParam;
      }
      this.floraPetals.forEach(p => {
        p.obj.rotation.x = 0.2 + Math.sin(elapsedTime * 1.6 + p.idx * 0.3) * 0.08 * this.userParam;
      });
      // Pulsing Synaptic Bioluminescent Spores
      const sporePulse = (Math.sin(elapsedTime * 2.8 * this.userParam) + 1.0) * 0.5;
      this.sporeNodes.forEach(s => {
        if (s.mat) s.mat.emissiveIntensity = 3.0 + sporePulse * 4.0;
      });
    }

    // 5. Project 4: Electromagnetic Ferrofluid Orb (Magnetic Spikes & Gimbal Flux Rings)
    if (this.ferrofluidGroup.visible) {
      if (this.ferrofluidOrb) {
        this.ferrofluidOrb.rotation.y = elapsedTime * 0.4;
        this.ferrofluidOrb.rotation.x = Math.sin(elapsedTime * 0.6) * 0.18;
        const spikePulse = 1.0 + Math.sin(elapsedTime * 2.5) * 0.08 * this.userParam;
        this.ferrofluidOrb.scale.set(spikePulse, spikePulse, spikePulse);
      }
      this.fieldRings.forEach((ring, idx) => {
        ring.rotation.x += 0.01 * (idx + 1);
        ring.rotation.y += 0.015 * (idx + 1);
      });
    }

    // 6. Autonomous Director Reel Mode (Instagram Video Capture)
    if (this.isDirectorMode) {
      this.directorTime += delta;
      const mins = Math.floor(this.directorTime / 60).toString().padStart(2, '0');
      const secs = Math.floor(this.directorTime % 60).toString().padStart(2, '0');
      const timeElem = document.getElementById('director-time');
      if (timeElem) timeElem.textContent = `${mins}:${secs}`;

      const shotCycle = this.directorTime % 28;
      const shotLabel = document.getElementById('director-shot-label');
      const cur = PROJECTS[this.activeProjectIndex];

      if (shotCycle < 7) {
        if (shotLabel) shotLabel.textContent = `SHOT 01: WIDE ORBITAL CRANE // ${cur.name}`;
        const t = shotCycle / 7;
        const camAngle = t * Math.PI * 0.8;
        const rad = cur.cameraPos[2] * 1.1;
        this.camera.position.x = Math.sin(camAngle) * rad;
        this.camera.position.z = Math.cos(camAngle) * rad;
        this.camera.position.y = cur.cameraPos[1] + Math.sin(t * Math.PI) * 1.0;
        this.camera.lookAt(...cur.cameraLook);

      } else if (shotCycle < 14) {
        if (shotLabel) shotLabel.textContent = `SHOT 02: LOW-ANGLE GLIDE TRACK // ${cur.name}`;
        const t = (shotCycle - 7) / 7;
        this.camera.position.x = Math.sin(t * Math.PI * 0.5) * 3.5;
        this.camera.position.z = cur.cameraPos[2] * 0.7 - t * 1.0;
        this.camera.position.y = -0.1 + t * 0.8;
        this.camera.lookAt(...cur.cameraLook);

      } else if (shotCycle < 21) {
        if (shotLabel) shotLabel.textContent = `SHOT 03: MACRO SPECULAR DETAIL // ${cur.name}`;
        const t = (shotCycle - 14) / 7;
        this.camera.position.set(0.5, cur.cameraPos[1] * 0.7 + t * 0.4, cur.cameraPos[2] * 0.4);
        this.camera.lookAt(...cur.cameraLook);
        this.keyLight.position.x = Math.sin(t * Math.PI * 2) * 4.0;

      } else {
        if (shotLabel) shotLabel.textContent = `SHOT 04: DRAMATIC 360 ROTATION // ${cur.name}`;
        this.projectGroups[this.activeProjectIndex].rotation.y += 0.015;
        this.camera.position.set(0, cur.cameraPos[1], cur.cameraPos[2] * 0.85);
        this.camera.lookAt(...cur.cameraLook);
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  private onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new StudioApp();
});
