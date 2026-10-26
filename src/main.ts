import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { studioAudio } from './audio';

// ============================================================================
// GARMENT METADATA CONFIGURATION
// ============================================================================

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
  defaultFlutter: number;
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
    defaultRoughness: 0.04,
    defaultFlutter: 0.8
  },
  {
    id: 'prismatic-corset',
    name: 'PRISMATIC GLASS CORSET',
    file: '/models/garment_prismatic_corset.glb',
    tag: 'COUTURE-02 // REFRACTIVE TRANSMISSION',
    desc: 'Sculptural anatomical bodice constructed from optical crown glass facets. Features internal total reflection, chromatic aberration dispersion, and polished platinum boning.',
    material: 'Fused Silica Glass (IOR 1.52)',
    transmission: '0.96 (Optical Clear)',
    tension: '112.5 N/m²',
    nodes: '14,280 Vertices',
    defaultMetallic: 0.05,
    defaultRoughness: 0.06,
    defaultFlutter: 0.2
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
    defaultRoughness: 0.32,
    defaultFlutter: 0.3
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
    defaultMetallic: 0.25,
    defaultRoughness: 0.38,
    defaultFlutter: 1.2
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
    defaultMetallic: 0.65,
    defaultRoughness: 0.28,
    defaultFlutter: 0.6
  }
];

// ============================================================================
// STUDIO STATE
// ============================================================================

class StudioApp {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private loader: GLTFLoader;

  // Rail & Garments
  private carouselGroup: THREE.Group;
  private garmentNodes: Array<{
    group: THREE.Group;
    meshGroup: THREE.Group;
    data: GarmentData;
    materials: THREE.Material[];
    originalPositions?: Float32Array;
  }> = [];

  // Carousel Physics
  private railRadius = 3.6;
  private carouselAngle = 0;
  private targetCarouselAngle = 0;
  private activeIndex = 0;
  private isDragging = false;
  private lastPointerX = 0;

  // Lighting & Environment
  private ambientLight!: THREE.AmbientLight;
  private keyLight!: THREE.DirectionalLight;
  private rimLight!: THREE.DirectionalLight;
  private fillLight!: THREE.PointLight;
  private groundMirror!: THREE.Mesh;
  private currentLightPreset: 'noir' | 'prismatic' | 'golden' = 'noir';

  // Director Reel Mode (Instagram Video Capture)
  private isDirectorMode = false;
  private directorTime = 0;

  // Shader Animation Clock
  private clock = new THREE.Clock();

  // Inspect Options
  private isWireframe = false;
  private isExploded = false;
  private userMetallic = 0.95;
  private userRoughness = 0.08;
  private userFlutter = 0.8;

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
    this.carouselGroup = new THREE.Group();
    this.scene.add(this.carouselGroup);

    this.setupEnvironment();
    this.setupGround();
    this.loadAssets();
    this.setupInteractions();
    this.setupUI();

    window.addEventListener('resize', this.onResize.bind(this));
    this.animate();
  }

  // ==========================================================================
  // ENVIRONMENT & LIGHTING RIG
  // ==========================================================================

  private setupEnvironment() {
    // Generate Studio HDR Environment Map for Realistic Physical PBR Reflections
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    this.scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(this.ambientLight);

    // Key Spotlight / Directional Light
    this.keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    this.keyLight.position.set(3, 6, 5);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 2048;
    this.keyLight.shadow.mapSize.height = 2048;
    this.keyLight.shadow.bias = -0.0001;
    this.scene.add(this.keyLight);

    // Rim Backlight for high-fashion silhouette separation
    this.rimLight = new THREE.DirectionalLight(0xc8a265, 3.2);
    this.rimLight.position.set(-4, 4, -4);
    this.scene.add(this.rimLight);

    // Colored Fill Point Light
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
      this.ambientLight.color.setHex(0xffffff);
      this.ambientLight.intensity = 0.35;
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
      this.ambientLight.intensity = 0.45;
      this.keyLight.color.setHex(0x38bdf8); // Cyan key
      this.keyLight.intensity = 3.8;
      this.rimLight.color.setHex(0xf43f5e); // Magenta rim
      this.rimLight.intensity = 4.2;
      this.fillLight.color.setHex(0xa855f7); // Purple ambient
      this.fillLight.intensity = 2.0;
      this.renderer.toneMappingExposure = 1.25;
    } else if (preset === 'golden') {
      this.scene.background = new THREE.Color(0x090807);
      this.scene.fog = new THREE.FogExp2(0x090807, 0.045);
      this.ambientLight.intensity = 0.5;
      this.keyLight.color.setHex(0xfef3c7); // Warm 3200K tungsten
      this.keyLight.intensity = 3.5;
      this.rimLight.color.setHex(0xd97706); // Amber rim
      this.rimLight.intensity = 3.8;
      this.fillLight.color.setHex(0xb45309);
      this.fillLight.intensity = 1.2;
      this.renderer.toneMappingExposure = 1.2;
    }

    // Update UI active state
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

    // Decorative floor target concentric rings
    const ringGeo = new THREE.RingGeometry(3.5, 3.52, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xc8a265, side: THREE.DoubleSide, transparent: true, opacity: 0.25 });
    const floorRing = new THREE.Mesh(ringGeo, ringMat);
    floorRing.rotation.x = -Math.PI / 2;
    floorRing.position.y = 0.11;
    this.scene.add(floorRing);
  }

  // ==========================================================================
  // 3D MODEL LOADING & CIRCULAR PLACEMENT
  // ==========================================================================

  private loadAssets() {
    // 1. Load Static Circular Guide Rail
    this.loader.load('/models/circular_rail_static.glb', (gltf) => {
      const rail = gltf.scene;
      rail.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      this.scene.add(rail);
    });

    // 2. Load Modular Hanger Unit and mount 5 garments along the rotating rail
    this.loader.load('/models/hanger_unit.glb', (hangerGltf) => {
      const angleStep = (Math.PI * 2) / GARMENTS.length;

      GARMENTS.forEach((data, index) => {
        const angle = index * angleStep;
        const x = Math.sin(angle) * this.railRadius;
        const z = Math.cos(angle) * this.railRadius;

        const garmentGroup = new THREE.Group();
        garmentGroup.position.set(x, 2.4, z);
        garmentGroup.rotation.y = angle + Math.PI; // Face outward toward camera and viewer

        // Add cloned hanger trolley unit
        const hangerClone = hangerGltf.scene.clone();
        hangerClone.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
          }
        });
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

              // Preserve materials
              if (Array.isArray(mesh.material)) {
                materials.push(...mesh.material);
              } else if (mesh.material) {
                materials.push(mesh.material);
              }

              // Custom procedural tweaks per garment
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
              } else if (data.id === 'neural-puffer' && mesh.name.includes('Pipe')) {
                mesh.material = new THREE.MeshStandardMaterial({
                  color: 0x38bdf8,
                  emissive: 0x38bdf8,
                  emissiveIntensity: 4.5,
                  toneMapped: false
                });
              }
            }
          });

          meshGroup.add(model);
        });

        this.garmentNodes.push({
          group: garmentGroup,
          meshGroup,
          data,
          materials
        });
      });
    });
  }

  // ==========================================================================
  // INTERACTION & INERTIA PHYSICS
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
      this.carouselAngle += delta;
      this.targetCarouselAngle = this.carouselAngle;
      this.lastPointerX = clientX;

      if (Math.abs(delta) > 0.008) {
        studioAudio.playRailTick(Math.abs(delta) * 100);
      }
    };

    const onPointerUp = (e: MouseEvent | TouchEvent) => {
      if (!this.isDragging) return;
      this.isDragging = false;
      const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as MouseEvent).clientX;
      if (Math.abs(clientX - startX) < 5) {
        // Simple click without drag - check raycast
        this.handleRaycast(clientX, 'changedTouches' in e ? e.changedTouches[0].clientY : (e as MouseEvent).clientY);
      } else {
        this.snapToNearest();
      }
    };

    const dom = this.renderer.domElement;
    dom.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    dom.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp, { passive: true });

    // Mouse Wheel
    window.addEventListener('wheel', (e) => {
      if (this.isDirectorMode) return;
      this.targetCarouselAngle += e.deltaY * 0.0015;
      studioAudio.playRailTick(Math.abs(e.deltaY) * 0.02);
      this.snapToNearest();
    }, { passive: true });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.stepGarment(-1);
      } else if (e.key === 'ArrowRight') {
        this.stepGarment(1);
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

  private handleRaycast(x: number, y: number) {
    const mouse = new THREE.Vector2(
      (x / window.innerWidth) * 2 - 1,
      -(y / window.innerHeight) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    const intersects = raycaster.intersectObjects(this.carouselGroup.children, true);
    if (intersects.length > 0) {
      let hit = intersects[0].object;
      while (hit.parent && hit.parent !== this.carouselGroup) {
        hit = hit.parent;
      }
      const hitIdx = this.garmentNodes.findIndex(node => node.group === hit);
      if (hitIdx !== -1) {
        this.selectGarment(hitIdx);
      }
    }
  }

  private snapToNearest() {
    const angleStep = (Math.PI * 2) / GARMENTS.length;
    // Normalized angle relative to origin
    let normalized = -this.targetCarouselAngle % (Math.PI * 2);
    if (normalized < 0) normalized += Math.PI * 2;
    const nearestIndex = Math.round(normalized / angleStep) % GARMENTS.length;
    this.selectGarment(nearestIndex);
  }

  public selectGarment(index: number) {
    const oldIndex = this.activeIndex;
    this.activeIndex = (index + GARMENTS.length) % GARMENTS.length;
    const angleStep = (Math.PI * 2) / GARMENTS.length;

    // Calculate shortest angular path to bring activeIndex to angle 0 (front of camera)
    const targetAngle = -this.activeIndex * angleStep;
    const diff = (targetAngle - this.carouselAngle) % (Math.PI * 2);
    let shortestDiff = diff;
    if (diff > Math.PI) shortestDiff -= Math.PI * 2;
    if (diff < -Math.PI) shortestDiff += Math.PI * 2;

    this.targetCarouselAngle = this.carouselAngle + shortestDiff;

    if (oldIndex !== this.activeIndex) {
      studioAudio.playWhoosh(shortestDiff > 0 ? 1 : -1);
      this.updateTelemetryUI();
    }
  }

  public stepGarment(delta: number) {
    this.selectGarment(this.activeIndex + delta);
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
        // Reset camera position smoothly
        this.camera.position.set(0, 1.35, 7.8);
        this.camera.lookAt(0, 0.45, 0);
      }
    }
  }

  // ==========================================================================
  // UI SYNC & TELEMETRY
  // ==========================================================================

  private setupUI() {
    // Navigation arrows
    document.getElementById('btn-prev-garment')?.addEventListener('click', () => {
      this.stepGarment(-1);
    });
    document.getElementById('btn-next-garment')?.addEventListener('click', () => {
      this.stepGarment(1);
    });

    // Quick Tabs
    document.querySelectorAll('.garment-tab-item').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const idx = parseInt((e.currentTarget as HTMLElement).getAttribute('data-index') || '0', 10);
        this.selectGarment(idx);
        studioAudio.playClick();
      });
    });

    // Director Mode Triggers
    document.getElementById('btn-director-mode')?.addEventListener('click', () => {
      this.toggleDirectorMode();
    });
    document.getElementById('btn-exit-director')?.addEventListener('click', () => {
      this.toggleDirectorMode(false);
    });

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

    // Material Tuner Sliders
    const metallicSlider = document.getElementById('slider-metallic') as HTMLInputElement;
    const roughnessSlider = document.getElementById('slider-roughness') as HTMLInputElement;
    const flutterSlider = document.getElementById('slider-flutter') as HTMLInputElement;

    metallicSlider?.addEventListener('input', (e) => {
      this.userMetallic = parseFloat((e.target as HTMLInputElement).value);
      this.updateActiveMaterialProps();
    });
    roughnessSlider?.addEventListener('input', (e) => {
      this.userRoughness = parseFloat((e.target as HTMLInputElement).value);
      this.updateActiveMaterialProps();
    });
    flutterSlider?.addEventListener('input', (e) => {
      this.userFlutter = parseFloat((e.target as HTMLInputElement).value);
    });

    // Wireframe & Explode buttons
    const wireframeBtn = document.getElementById('btn-toggle-wireframe');
    wireframeBtn?.addEventListener('click', () => {
      this.isWireframe = !this.isWireframe;
      wireframeBtn.classList.toggle('active', this.isWireframe);
      this.garmentNodes.forEach(node => {
        node.materials.forEach(mat => {
          if ('wireframe' in mat) (mat as THREE.MeshStandardMaterial).wireframe = this.isWireframe;
        });
      });
      studioAudio.playClick(1500);
    });

    const explodeBtn = document.getElementById('btn-toggle-explode');
    explodeBtn?.addEventListener('click', () => {
      this.isExploded = !this.isExploded;
      explodeBtn.classList.toggle('active', this.isExploded);
      studioAudio.playClick(1200);
    });

    // Archive & CV Modal
    const archiveModal = document.getElementById('archive-modal');
    const openArchiveBtn = document.getElementById('btn-open-archive');
    const closeArchiveBtn = document.getElementById('btn-close-archive');

    openArchiveBtn?.addEventListener('click', () => {
      archiveModal?.removeAttribute('hidden');
      studioAudio.playClick();
    });
    closeArchiveBtn?.addEventListener('click', () => {
      archiveModal?.setAttribute('hidden', 'true');
    });
    archiveModal?.addEventListener('click', (e) => {
      if (e.target === archiveModal) archiveModal.setAttribute('hidden', 'true');
    });

    this.updateTelemetryUI();
  }

  private updateActiveMaterialProps() {
    const activeNode = this.garmentNodes[this.activeIndex];
    if (!activeNode) return;
    activeNode.materials.forEach(mat => {
      if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
        mat.metalness = this.userMetallic;
        mat.roughness = this.userRoughness;
      }
    });
  }

  private updateTelemetryUI() {
    const cur = GARMENTS[this.activeIndex];
    const indexDisp = document.getElementById('garment-index-display');
    const titleDisp = document.getElementById('garment-title');
    const descDisp = document.getElementById('garment-desc');
    const matDisp = document.getElementById('spec-material');
    const transDisp = document.getElementById('spec-transmission');
    const tensionDisp = document.getElementById('spec-tension');
    const nodesDisp = document.getElementById('spec-nodes');

    if (indexDisp) indexDisp.textContent = `${this.activeIndex + 1}`;
    if (titleDisp) titleDisp.textContent = cur.name;
    if (descDisp) descDisp.textContent = cur.desc;
    if (matDisp) matDisp.textContent = cur.material;
    if (transDisp) transDisp.textContent = cur.transmission;
    if (tensionDisp) tensionDisp.textContent = cur.tension;
    if (nodesDisp) nodesDisp.textContent = cur.nodes;

    // Update Tab UI
    document.querySelectorAll('.garment-tab-item').forEach(tab => {
      const idx = parseInt(tab.getAttribute('data-index') || '0', 10);
      tab.classList.toggle('active', idx === this.activeIndex);
      tab.setAttribute('aria-selected', idx === this.activeIndex ? 'true' : 'false');
    });

    // Sliders
    const metallicSlider = document.getElementById('slider-metallic') as HTMLInputElement;
    const roughnessSlider = document.getElementById('slider-roughness') as HTMLInputElement;
    const flutterSlider = document.getElementById('slider-flutter') as HTMLInputElement;

    if (metallicSlider) metallicSlider.value = cur.defaultMetallic.toString();
    if (roughnessSlider) roughnessSlider.value = cur.defaultRoughness.toString();
    if (flutterSlider) flutterSlider.value = cur.defaultFlutter.toString();
    this.userMetallic = cur.defaultMetallic;
    this.userRoughness = cur.defaultRoughness;
    this.userFlutter = cur.defaultFlutter;
  }

  // ==========================================================================
  // RENDER LOOP & PROCEDURAL FABRIC PHYSICS
  // ==========================================================================

  private animate() {
    requestAnimationFrame(this.animate.bind(this));

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Spring-damped carousel rotation
    if (!this.isDragging) {
      this.carouselAngle += (this.targetCarouselAngle - this.carouselAngle) * 0.08;
    }
    this.carouselGroup.rotation.y = this.carouselAngle;

    // Update UI angle
    const angleDeg = ((this.carouselAngle * 180 / Math.PI) % 360).toFixed(1);
    const railAngleElem = document.getElementById('env-rail-angle');
    if (railAngleElem) railAngleElem.textContent = `${angleDeg}°`;

    // 2. Garment Pendulum Sway & Dynamic Flutter
    this.garmentNodes.forEach((node, idx) => {
      const isFocused = idx === this.activeIndex;
      
      // Floating bobbing motion
      const bob = Math.sin(elapsedTime * 1.5 + idx * 1.2) * 0.035 * this.userFlutter;
      node.meshGroup.position.y = bob;

      // When focused, tilt slightly toward viewer
      const targetTilt = isFocused ? 0.08 : 0.0;
      node.meshGroup.rotation.x += (targetTilt - node.meshGroup.rotation.x) * 0.1;

      // Displace Shell explode effect
      const targetScale = this.isExploded ? 1.25 : 1.0;
      node.meshGroup.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

      // Liquid Mercury wave ripple
      if (node.data.id === 'mercury-trench') {
        node.meshGroup.rotation.y = Math.sin(elapsedTime * 0.8) * 0.06;
      }

      // Neural Puffer bioluminescent pulse
      if (node.data.id === 'neural-puffer') {
        const pulse = (Math.sin(elapsedTime * 3.0) + 1.0) * 0.5;
        node.materials.forEach(mat => {
          if (mat instanceof THREE.MeshStandardMaterial && mat.name.includes('Neon')) {
            mat.emissiveIntensity = 2.0 + pulse * 3.5;
          }
        });
      }
    });

    // 3. Autonomous Director Reel Mode Logic
    if (this.isDirectorMode) {
      this.directorTime += delta;
      
      // Update Reel Timer UI (MM:SS)
      const mins = Math.floor(this.directorTime / 60).toString().padStart(2, '0');
      const secs = Math.floor(this.directorTime % 60).toString().padStart(2, '0');
      const timeElem = document.getElementById('director-time');
      if (timeElem) timeElem.textContent = `${mins}:${secs}`;

      // Sequence Director Shots every 7 seconds
      const shotCycle = this.directorTime % 28;
      const shotLabel = document.getElementById('director-shot-label');

      if (shotCycle < 7) {
        // Shot 1: Wide Orbital Crane Sweep
        if (shotLabel) shotLabel.textContent = 'SHOT 01: WIDE ORBITAL CRANE SWEEP';
        const t = shotCycle / 7;
        const camAngle = t * Math.PI * 0.8;
        this.camera.position.x = Math.sin(camAngle) * 8.5;
        this.camera.position.z = Math.cos(camAngle) * 8.5;
        this.camera.position.y = 1.8 + Math.sin(t * Math.PI) * 1.2;
        this.camera.lookAt(0, 0.45, 0);

      } else if (shotCycle < 14) {
        // Shot 2: Low-Angle Gliding Track Under Rail
        if (shotLabel) shotLabel.textContent = 'SHOT 02: LOW-ANGLE GLIDE TRACK';
        const t = (shotCycle - 7) / 7;
        this.camera.position.x = Math.sin(t * Math.PI * 0.5) * 4.2;
        this.camera.position.z = 4.8 - t * 1.5;
        this.camera.position.y = -0.2 + t * 0.8;
        this.camera.lookAt(0, 0.8, 0);

      } else if (shotCycle < 21) {
        // Shot 3: Macro Fabric Specular Closeup
        if (shotLabel) shotLabel.textContent = 'SHOT 03: MACRO FABRIC SPECULAR DETAIL';
        const t = (shotCycle - 14) / 7;
        this.camera.position.set(0.6, 0.8 + t * 0.6, 2.4);
        this.camera.lookAt(0, 0.9, 0);

        // Key light sweep across fabric
        this.keyLight.position.x = Math.sin(t * Math.PI * 2) * 4.0;

      } else {
        // Shot 4: Dramatic 360 Spin Showcase
        if (shotLabel) shotLabel.textContent = 'SHOT 04: DRAMATIC 360 COUTURE SHOWCASE';
        this.carouselAngle += 0.015;
        this.targetCarouselAngle = this.carouselAngle;
        this.camera.position.set(0, 1.2, 5.8);
        this.camera.lookAt(0, 0.5, 0);
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

// Initialize on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  new StudioApp();
});
