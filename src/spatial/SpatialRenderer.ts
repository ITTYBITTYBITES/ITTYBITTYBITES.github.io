import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { EventContract, PlatformState } from '../kernel';
import { getSpatialContent, getSpatialSpawnTier, resolveSpatialSpawn, shouldSpawnSpatialNode, SpawnTier, type BiomeMapping, type SpatialContentMetadata } from './registry/SpatialSpawnRegistry';
import { ResponsiveEngine, type ResponsiveProfile } from '../responsive/ResponsiveEngine';

export type GearId = 'games' | 'archive' | 'community' | 'blueprint' | 'memory';

export const HOLO_TONES = {
  CYAN: 0x00ffff,
  MAGENTA: 0xff00ff,
  PURPLE: 0x8a2be2,
} as const;

type SpatialNode = {
  id: string;
  eventType: string;
  spawnTier: SpawnTier;
  contentMetadata?: SpatialContentMetadata;
  mesh: THREE.Mesh;
  halo: THREE.Sprite;
  target: THREE.Vector3;
  home: THREE.Vector3;
  createdAt: number;
  mapping: BiomeMapping;
  gearId?: GearId;
};

type LiquidLink = {
  mesh: THREE.Mesh;
  material: THREE.MeshStandardMaterial;
  createdAt: number;
};

type GearAssembly = {
  id: GearId;
  group: THREE.Object3D;
  hit: THREE.Mesh;
  anchor: THREE.Vector3;
  eventType: string;
  unlockedLevel: number;
  active: boolean;
  label: THREE.Sprite;
};

type Gauge = {
  key: string;
  sprite: THREE.Sprite;
  lastValue: string;
};

const GEAR_EVENT_TYPES: Record<GearId, string> = {
  games: 'library.game_opened',
  archive: 'library.archive_opened',
  community: 'community.vortex',
  blueprint: 'milestone.level_up',
  memory: 'economic.resource_gained',
};

const EVENT_TO_GEAR: Record<string, GearId> = Object.fromEntries(
  Object.entries(GEAR_EVENT_TYPES).map(([gear, event]) => [event, gear])
) as Record<string, GearId>;

export class SpatialRenderer {
  private scene = new THREE.Scene();
  private camera = new THREE.OrthographicCamera(-7.2, 7.2, 4.05, -4.05, 0.1, 1000);
  private renderer: THREE.WebGLRenderer;
  private composer!: EffectComposer;
  private bloomPass!: UnrealBloomPass;
  private ambient!: THREE.AmbientLight;
  private lamp!: THREE.SpotLight;
  private workstationGroup = new THREE.Group();
  private biomeGroup = new THREE.Group();
  private linkGroup = new THREE.Group();
  private gearGroup = new THREE.Group();
  private gaugeGroup = new THREE.Group();
  private particleGroup = new THREE.Group();
  private nodes: SpatialNode[] = [];
  private links: LiquidLink[] = [];
  private gears: GearAssembly[] = [];
  private gauges: Gauge[] = [];
  private focusDial?: THREE.Group;
  private modelAnchors = new Map<string, THREE.Object3D>();
  private gearRaycastObjects: THREE.Object3D[] = [];
  private workstationModelLoaded = false;
  private workstationFallbackActive = false;
  private baseEnvironmentCreated = false;
  private resizeObserver?: ResizeObserver;
  private mountGuardId?: number;
  private webglContextLost = false;
  private lastLayoutHealthCheck = 0;
  private rafId = 0;
  private focusIndex = -1;
  private hovered?: SpatialNode;
  private hoveredGear?: GearAssembly;
  private pointer = new THREE.Vector2(99, 99);
  private raycaster = new THREE.Raycaster();
  private readonly clock = new THREE.Clock();
  private readonly haloTexture = this.createHaloTexture();
  private readonly responsive = new ResponsiveEngine();
  private profile: ResponsiveProfile = this.responsive.getProfile();
  private selectedGear?: GearAssembly;
  private lastTouchGear?: GearId;
  private lastTouchAt = 0;
  private dragGear?: GearAssembly;
  private dragStartX = 0;
  private didDrag = false;

  constructor(
    private host: HTMLElement,
    private liveRegion?: HTMLElement | null,
    private onGearSelected?: (gear: GearId) => void
  ) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.42;
    this.renderer.domElement.className = 'kernel-spatial-webgl';
    this.renderer.domElement.setAttribute('aria-label', 'Liquid Memory generative spatial ecosystem');
    this.host.appendChild(this.renderer.domElement);
    this.bindContextMonitoring();
    this.startMountGuard();

    this.scene.add(this.workstationGroup);
    this.scene.add(this.linkGroup);
    this.scene.add(this.biomeGroup);
    this.scene.add(this.gearGroup);
    this.scene.add(this.gaugeGroup);
    this.scene.add(this.particleGroup);
    this.applyCameraProfile(this.profile, true);

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.045, 0.42, 0.96);
    this.composer.addPass(this.bloomPass);
    this.initLighting();

    this.createWorkstationEnvironment();
    this.createBlueprintGearRig();
    this.loadWorkstationAsset();
    this.createGauges();
    this.createEngageDial();
    this.applyResponsiveProfile(this.profile, true);
    this.responsive.subscribe((profile) => this.applyResponsiveProfile(profile));
    this.bindPointer();
    this.bindResize();
    this.animate();
  }


  private initLighting(): void {
    // Neutralize the environment for the Data-Hub void.
    this.scene.environment = null;
    this.scene.background = null;

    // Set the void background while preserving transparent canvas compositing.
    this.renderer.setClearColor(0x000000, 0);

    // Cool cyan ambient fill.
    this.ambient = new THREE.AmbientLight(HOLO_TONES.CYAN, 0.4);
    this.scene.add(this.ambient);

    // Focus lamp for the holographic panels.
    this.lamp = new THREE.SpotLight(HOLO_TONES.CYAN, 10.0, 50, Math.PI / 4);
    this.lamp.position.set(0, 5, 10);
    this.scene.add(this.lamp);

    // Bump bloom strength for the Data-Hub pop.
    this.bloomPass.strength = 1.2;
  }

  handle(event: EventContract): void {
    if (event.type === 'system.heartbeat' && this.nodes.length > 0) return;
    if (!shouldSpawnSpatialNode(event)) return;
    const mapping = resolveSpatialSpawn(event);
    const spawnTier = getSpatialSpawnTier(event);
    const contentMetadata = mapping.contentMetadata || getSpatialContent(event.type);
    const gearId = EVENT_TO_GEAR[event.type];
    const index = this.nodes.length;
    const target = this.computePosition(index, mapping.pull, gearId);
    const mesh = new THREE.Mesh(this.createGeometry(mapping), this.createMaterial(mapping));
    const origin = gearId ? this.getGearAnchor(gearId).setZ(-1.04) : new THREE.Vector3(0, 0, -1.04);
    mesh.position.copy(origin);
    mesh.scale.setScalar(0.001);
    mesh.userData = { eventType: event.type, label: mapping.label, spawnTier, contentMetadata };
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const halo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: this.haloTexture,
      color: mapping.color,
      transparent: true,
      opacity: 0.035,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }));
    halo.position.copy(mesh.position);
    halo.scale.setScalar(0.82 * mapping.scale);

    this.biomeGroup.add(mesh);
    this.biomeGroup.add(halo);

    const node: SpatialNode = { id: event.eventId, eventType: event.type, spawnTier, contentMetadata, mesh, halo, target: target.clone(), home: target.clone(), createdAt: performance.now(), mapping, gearId };
    this.nodes.push(node);
    this.archiveOldMemories();
    this.connectToPrevious(node);
    this.connectGearToNode(node);
    this.emitCriticalParticleFeedback(spawnTier, target, mapping.color);
    this.updateHud(event, mapping);
    this.focusIndex = this.nodes.length - 1;
    if (gearId) this.setActiveGear(gearId);

    while (this.nodes.length > 54) {
      const old = this.nodes.shift();
      if (old) {
        this.biomeGroup.remove(old.mesh);
        this.biomeGroup.remove(old.halo);
      }
    }
  }

  updateFromState(state: PlatformState): void {
    const level = state.player.level || 1;
    this.biomeGroup.rotation.y += Math.min(level, 20) * 0.00024;
    this.biomeGroup.scale.setScalar(1 + Math.min(state.system.eventCount, 100) * 0.002);
    this.updateGaugeText('depth', `DEPTH ${level}`);
    this.updateGaugeText('signals', `SIGNALS ${state.system.eventCount || 0}`);
    this.updateGaugeText('trace', `TRACE ${state.player.resources.trace || 0}`);
    this.updateGaugeText('pearls', `PEARLS ${state.player.resources.pearls || 0}`);
    this.updateGearUnlocks(level);
  }

  focusNext(): void {
    if (!this.nodes.length) return;
    this.focusIndex = (this.focusIndex + 1) % this.nodes.length;
  }

  focusGear(gear: GearId): boolean {
    return this.focusEventType(GEAR_EVENT_TYPES[gear]);
  }

  focusEventType(eventType: string): boolean {
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      if (this.nodes[i].eventType === eventType) {
        this.focusIndex = i;
        const node = this.nodes[i];
        this.host.dataset.lastEvent = node.eventType;
        if (this.liveRegion) this.liveRegion.textContent = `${node.mapping.label}: ${node.eventType}`;
        if (node.gearId) this.setActiveGear(node.gearId);
        return true;
      }
    }
    return false;
  }

  setActiveGear(gear: GearId): void {
    this.gears.forEach((assembly) => {
      assembly.active = assembly.id === gear;
      assembly.group.userData.active = assembly.active;
    });
    this.host.dataset.activeGear = gear;
  }

  getNodeCount(): number {
    return this.nodes.length;
  }

  getGearCount(): number {
    return this.gears.length;
  }

  getGaugeCount(): number {
    return this.gauges.length;
  }

  getResponsiveMode(): string {
    return `${this.profile.kind}-${this.profile.orientation}`;
  }

  isWorkstationModelLoaded(): boolean {
    return this.workstationModelLoaded;
  }

  isProceduralFallbackActive(): boolean {
    return this.workstationFallbackActive;
  }

  getAnchorCount(): number {
    return this.modelAnchors.size;
  }

  dispose(): void {
    cancelAnimationFrame(this.rafId);
    if (this.mountGuardId !== undefined) window.clearInterval(this.mountGuardId);
    this.renderer.domElement.removeEventListener('webglcontextlost', this.handleWebGLContextLost);
    this.renderer.domElement.removeEventListener('webglcontextrestored', this.handleWebGLContextRestored);
    this.resizeObserver?.disconnect();
    this.responsive.dispose();
    this.composer?.dispose();
    this.renderer.dispose();
    this.host.innerHTML = '';
  }


  private applyResponsiveProfile(profile: ResponsiveProfile, instant = false): void {
    this.profile = profile;
    this.host.dataset.device = `${profile.kind}-${profile.orientation}`;
    this.applyCameraProfile(profile, instant);
    const gearTarget = new THREE.Vector3(profile.gearPosition.x, profile.gearPosition.y, profile.gearPosition.z);
    if (instant) this.gearGroup.position.copy(gearTarget);
    else this.gearGroup.position.lerp(gearTarget, 0.35);
    this.layoutGauges(profile.gaugeMode);
    this.updateShadowMode(profile);
  }

  private updateShadowMode(profile: ResponsiveProfile): void {
    const mobile = profile.kind === 'mobile';
    this.gearGroup.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) mesh.castShadow = !mobile;
    });
    this.biomeGroup.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) mesh.castShadow = false;
    });
  }

  private applyCameraProfile(profile: ResponsiveProfile, instant = false): void {
    const target = new THREE.Vector3(profile.camera.x, profile.camera.y, profile.camera.z);
    const focal = new THREE.Vector3(profile.camera.targetX, profile.camera.targetY, profile.camera.targetZ);
    this.camera.zoom = profile.camera.zoom;
    this.camera.updateProjectionMatrix();
    if (instant) this.camera.position.copy(target);
    else this.camera.position.lerp(target, 0.2);
    this.camera.lookAt(focal);
  }

  private layoutGauges(mode: ResponsiveProfile['gaugeMode']): void {
    const layouts: Record<ResponsiveProfile['gaugeMode'], [number, number][]> = {
      'topbar': [[-3.0, 3.46], [-1.0, 3.46], [1.0, 3.46], [3.0, 3.46]],
      'side-panels': [[-3.2, -3.68], [-1.06, -3.68], [1.08, -3.68], [3.22, -3.68]],
      'compact-corners': [[-3.0, -3.66], [-1.0, -3.66], [1.0, -3.66], [3.0, -3.66]],
    };
    const points = layouts[mode];
    this.gauges.forEach((gauge, index) => {
      const point = points[index] || [0, 0];
      gauge.sprite.position.set(point[0], point[1], -1.03);
      const compact = mode === 'topbar' ? 0.82 : 1;
      gauge.sprite.scale.set(1.65 * compact, 0.42 * compact, 1);
    });
  }

  private pickGear(): GearAssembly | undefined {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const gearHits = this.raycaster.intersectObjects(this.gearRaycastObjects, true);
    const hit = gearHits.find((item) => item.object.userData.gearId);
    const gearId = hit?.object.userData.gearId as GearId | undefined;
    return gearId ? this.gears.find((item) => item.id === gearId) : undefined;
  }

  private pickDial(): boolean {
    if (!this.focusDial) return false;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    return this.raycaster.intersectObjects(this.focusDial.children, true).some((item) => item.object.userData.engageDial);
  }



  private async loadWorkstationAsset(): Promise<void> {
    const loader = new GLTFLoader();
    try {
      const gltf = await loader.loadAsync('assets/models/liquid-memory-workstation.glb');
      const root = gltf.scene;
      root.name = 'liquid_memory_workstation_glb_root';
      // The proxy/high-fidelity GLB is authored with its visible paper near local z=0.
      // The renderer's ink/gears operate on the workstation surface around z=-1.
      // Drop the imported asset into the renderer's desk-plane coordinate space so
      // paper/desk geometry does not occlude the interactive gear mechanism.
      root.position.z = -1.96;
      this.workstationGroup.add(root);
      this.modelAnchors.clear();

      root.traverse((obj) => {
        if (obj.name?.startsWith('anchor_')) {
          this.modelAnchors.set(obj.name, obj);
          obj.visible = false;
        }

        const mesh = obj as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          this.tuneImportedMaterial(mesh);
          const gearId = this.inferGearIdFromName(mesh.name);
          if (gearId) {
            mesh.userData.gearId = gearId;
            mesh.visible = false;
          }
        }
      });

      this.resetGearControls();
      (['games', 'archive', 'community', 'blueprint', 'memory'] as GearId[]).forEach((id) => {
        const anchor = this.getModelAnchorPosition(`anchor_${id}`) || this.getFallbackGearAnchor(id);
        const radius = id === 'games' ? 1.02 : id === 'memory' ? 0.62 : id === 'blueprint' ? 0.86 : 0.76;
        this.createPanelGear(id, id.toUpperCase(), anchor, radius, id === 'community' ? 2 : id === 'memory' ? 3 : 1);
      });

      this.workstationModelLoaded = true;
      this.workstationFallbackActive = false;
      this.host.dataset.workstationModel = 'loaded';
    } catch (error) {
      console.warn('[SpatialRenderer] Workstation GLB failed; using procedural fallback.', error);
      this.renderProceduralWorkstation();
    }
  }

  private tuneImportedMaterial(mesh: THREE.Mesh): void {
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach((material) => {
      const mat = material as THREE.MeshStandardMaterial;
      if (!mat) return;
      const name = `${mat.name || ''} ${mesh.name || ''}`.toLowerCase();
      if (name.includes('paper') || name.includes('parchment') || name.includes('blueprint')) {
        mat.map = null;
        mat.roughnessMap = null;
        mat.normalMap = null;
        mat.bumpMap = null;
        mat.color.set(HOLO_TONES.CYAN);
        mat.emissive = new THREE.Color(HOLO_TONES.CYAN);
        mat.emissiveIntensity = 0.16;
        mat.opacity = 0.18;
        mat.transparent = true;
        mat.roughness = 0.48;
        mat.metalness = 0.08;
      } else if (name.includes('bronze') || name.includes('brass') || name.includes('gear')) {
        mat.color.set(HOLO_TONES.CYAN);
        mat.emissive = new THREE.Color(HOLO_TONES.CYAN);
        mat.emissiveIntensity = 0.12;
        mat.roughness = Math.min(0.72, Math.max(0.42, mat.roughness ?? 0.55));
      } else if (name.includes('wood') || name.includes('desk')) {
        mat.color.set(0x001622);
        mat.emissive = new THREE.Color(0x003344);
        mat.emissiveIntensity = 0.06;
        mat.roughness = 0.82;
      }
      mat.needsUpdate = true;
    });
  }

  private renderProceduralWorkstation(): void {
    this.workstationFallbackActive = true;
    this.workstationModelLoaded = false;
    this.host.dataset.workstationModel = 'procedural-fallback';
    this.createWorkstationEnvironment();
  }

  private inferGearIdFromName(name: string): GearId | undefined {
    const lower = name.toLowerCase();
    return (['games', 'archive', 'community', 'blueprint', 'memory'] as GearId[]).find((id) => lower.includes(`gear_${id}`) || lower.includes(`anchor_${id}`));
  }

  private getModelAnchorPosition(name: string): THREE.Vector3 | undefined {
    const obj = this.modelAnchors.get(name);
    if (!obj) return undefined;
    const position = new THREE.Vector3();
    obj.getWorldPosition(position);
    return position;
  }

  private getFallbackGearAnchor(gearId: GearId): THREE.Vector3 {
    const fallback: Record<GearId, THREE.Vector3> = {
      games: new THREE.Vector3(0, 0.72, -1.18),
      archive: new THREE.Vector3(-2.36, 0.05, -1.18),
      community: new THREE.Vector3(2.34, 0, -1.18),
      blueprint: new THREE.Vector3(0, -1.42, -1.18),
      memory: new THREE.Vector3(-1.48, -1.34, -1.18),
    };
    return fallback[gearId].clone();
  }

  private createWorkstationEnvironment(): void {
    if (this.baseEnvironmentCreated) return;
    this.baseEnvironmentCreated = true;
    const desk = new THREE.Mesh(
      new THREE.PlaneGeometry(36, 24, 1, 1),
      new THREE.MeshStandardMaterial({
        color: 0x000814,
        emissive: 0x002633,
        emissiveIntensity: 0.10,
        roughness: 0.74,
        metalness: 0.18,
      })
    );
    desk.position.set(0, 0, -2.82);
    desk.receiveShadow = true;
    this.workstationGroup.add(desk);

    const paper = new THREE.Mesh(
      new THREE.PlaneGeometry(13.6, 9.4, 1, 1),
      new THREE.MeshStandardMaterial({
        color: HOLO_TONES.CYAN,
        emissive: HOLO_TONES.CYAN,
        emissiveIntensity: 0.12,
        transparent: true,
        opacity: 0.18,
        roughness: 0.46,
        metalness: 0.08,
      })
    );
    paper.position.set(0, -0.2, -1.92);
    paper.receiveShadow = true;
    this.workstationGroup.add(paper);

    const frameMat = this.createOxidizedMetalMaterial(0x3c2a17, 0x0d0703, 0.01);
    const topRail = new THREE.Mesh(new THREE.BoxGeometry(12.9, 0.16, 0.2), frameMat);
    topRail.position.set(0, 3.95, -1.72);
    const bottomRail = topRail.clone(); bottomRail.position.y = -4.35;
    const leftRail = new THREE.Mesh(new THREE.BoxGeometry(0.16, 8.35, 0.2), frameMat);
    leftRail.position.set(-6.48, -0.2, -1.72);
    const rightRail = leftRail.clone(); rightRail.position.x = 6.48;
    this.workstationGroup.add(topRail, bottomRail, leftRail, rightRail);

    const scrollMat = new THREE.MeshStandardMaterial({ color: 0x9d8056, map: this.createPaperRollTexture(), roughness: 0.88, metalness: 0.0 });
    const scrollGeo = new THREE.CylinderGeometry(0.16, 0.16, 2.3, 24);
    const scrollA = new THREE.Mesh(scrollGeo, scrollMat);
    scrollA.rotation.z = Math.PI / 2;
    scrollA.position.set(-5.95, 2.45, -1.25);
    const scrollB = scrollA.clone(); scrollB.position.set(5.95, 2.1, -1.25);
    const scrollC = scrollA.clone(); scrollC.position.set(5.75, -2.55, -1.22);
    this.workstationGroup.add(scrollA, scrollB, scrollC);

    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.55, 0.18, 32), this.createOxidizedMetalMaterial(0x2d2117, 0x120905, 0.0));
    lampBase.rotation.x = Math.PI / 2;
    lampBase.position.set(4.65, 2.75, -1.0);
    const lampOrb = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 14), new THREE.MeshStandardMaterial({ color: 0xffc46b, emissive: 0xffad4a, emissiveIntensity: 1.8, roughness: 0.28 }));
    lampOrb.position.set(4.65, 2.75, -0.52);
    const lampShade = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.28, 0.28, 32, 1, true), this.createOxidizedMetalMaterial(0x47331e, 0x1b1007, 0.0));
    lampShade.rotation.x = Math.PI / 2;
    lampShade.position.set(4.65, 2.75, -0.62);
    this.workstationGroup.add(lampBase, lampOrb, lampShade);

    const title = this.createTextSprite('HOLOGRAPHIC // HUB', '#bfffff', 'rgba(0,255,255,0.16)', 1.0);
    title.position.set(-4.28, 3.62, -1.08);
    title.scale.set(2.55, 0.36, 1);
    const schematic = this.createTextSprite('DATA-HUB  v1.2.9', '#bfffff', 'rgba(0,255,255,0.14)', 1.05);
    schematic.position.set(0, -3.92, -1.06);
    schematic.scale.set(2.35, 0.42, 1);
    this.workstationGroup.add(title, schematic);
    this.createEtchedOrnaments();
    this.workstationGroup.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) { mesh.castShadow = true; mesh.receiveShadow = true; }
    });
  }


  private createEtchedOrnaments(): void {
    const mat = this.createOxidizedMetalMaterial(0x6f4a2a, 0x140a04, 0.0);
    const lineMat = new THREE.MeshStandardMaterial({ color: 0x5a391c, emissive: 0x0a0401, metalness: 0.55, roughness: 0.58 });
    const corners: [number, number, number][] = [[-4.95, 2.38, 0], [4.95, 2.38, Math.PI / 2], [-4.95, -2.78, -Math.PI / 2], [4.95, -2.78, Math.PI]];
    corners.forEach(([x, y, r]) => {
      const torus = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.018, 8, 38, Math.PI * 1.35), mat);
      torus.position.set(x, y, -1.02);
      torus.rotation.z = r;
      this.workstationGroup.add(torus);
      for (let i = 0; i < 3; i++) {
        const strip = new THREE.Mesh(new THREE.BoxGeometry(0.62 - i * 0.1, 0.018, 0.02), lineMat);
        strip.position.set(x + (x < 0 ? 0.35 : -0.35), y - i * 0.12 * Math.sign(y), -1.0);
        strip.rotation.z = r + i * 0.18;
        this.workstationGroup.add(strip);
      }
    });
    const cableMat = this.createOxidizedMetalMaterial(0x5c3819, 0x0b0401, 0.0);
    const points = [new THREE.Vector3(-5.2, -2.8, -0.98), new THREE.Vector3(-3.5, -3.05, -0.98), new THREE.Vector3(-1.3, -2.72, -0.98), new THREE.Vector3(0, -3.05, -0.98), new THREE.Vector3(1.9, -2.84, -0.98), new THREE.Vector3(4.9, -3.0, -0.98)];
    const curve = new THREE.CatmullRomCurve3(points);
    this.workstationGroup.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.010, 6, false), cableMat));
  }

  private createOxidizedMetalMaterial(color: number, emissive: number, cyanCatch = 0.04): THREE.MeshStandardMaterial {
    const texture = this.createPatinaTexture(cyanCatch);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return new THREE.MeshStandardMaterial({
      color,
      emissive,
      emissiveIntensity: 0.18 + cyanCatch,
      map: texture,
      roughnessMap: texture,
      normalMap: this.createNormalNoiseTexture(),
      bumpMap: texture,
      bumpScale: 0.035,
      metalness: 0.88,
      roughness: 0.52,
    });
  }


  private createEnvironmentTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 512, 256);
    gradient.addColorStop(0, '#0b0704');
    gradient.addColorStop(0.45, '#6c4a25');
    gradient.addColorStop(0.72, '#d09b4e');
    gradient.addColorStop(1, '#102824');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 256);
    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.needsUpdate = true;
    return texture;
  }


  private createNormalNoiseTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    const img = ctx.createImageData(128,128);
    for (let i=0;i<img.data.length;i+=4) {
      const n = 122 + Math.random()*12;
      img.data[i] = n;
      img.data[i+1] = n;
      img.data[i+2] = 255;
      img.data[i+3] = 255;
    }
    ctx.putImageData(img,0,0);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3,3);
    return tex;
  }

  private createPaperNormalTexture(): THREE.CanvasTexture {
    const tex = this.createNormalNoiseTexture();
    tex.repeat.set(5,3);
    return tex;
  }

  private createWoodNormalTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas'); canvas.width=256; canvas.height=256;
    const ctx = canvas.getContext('2d')!;
    const img = ctx.createImageData(256,256);
    for (let y=0;y<256;y++) for(let x=0;x<256;x++) {
      const i=(y*256+x)*4; const wave=Math.sin(y*.12+x*.015)*18;
      img.data[i]=128+wave; img.data[i+1]=126+wave*.3; img.data[i+2]=255; img.data[i+3]=255;
    }
    ctx.putImageData(img,0,0);
    const tex=new THREE.CanvasTexture(canvas); tex.wrapS=tex.wrapT=THREE.RepeatWrapping; tex.repeat.set(3,2); return tex;
  }

  private createWoodTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 768; canvas.height = 768;
    const ctx = canvas.getContext('2d')!;
    const base = ctx.createLinearGradient(0, 0, 0, canvas.height);
    base.addColorStop(0, '#241207');
    base.addColorStop(0.45, '#3b210f');
    base.addColorStop(1, '#160b04');
    ctx.fillStyle = base;
    ctx.fillRect(0,0,canvas.width,canvas.height);
    for (let y=0;y<canvas.height;y++) {
      const n = Math.sin(y * 0.034) * 16 + Math.sin(y * 0.009) * 28;
      ctx.fillStyle = `rgba(${62+n},${34+n*0.34},${14+n*0.08},0.22)`;
      ctx.fillRect(0,y,canvas.width,1);
    }
    [120, 270, 430, 585, 710].forEach((x) => {
      ctx.fillStyle = 'rgba(5,2,1,.42)'; ctx.fillRect(x-2,0,4,canvas.height);
      ctx.fillStyle = 'rgba(105,64,25,.14)'; ctx.fillRect(x+8,0,1,canvas.height);
    });
    for (let i=0;i<2800;i++) {
      ctx.fillStyle = `rgba(0,0,0,${Math.random()*0.16})`;
      ctx.fillRect(Math.random()*canvas.width, Math.random()*canvas.height, Math.random()*2+0.5, Math.random()*2+0.5);
    }
    const texture = new THREE.CanvasTexture(canvas); texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(2.0,1.28); return texture;
  }

  private createBlueprintPaperTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1400; canvas.height = 900;
    const ctx = canvas.getContext('2d')!;
    const g = ctx.createRadialGradient(canvas.width*.50, canvas.height*.42, 50, canvas.width*.50, canvas.height*.42, canvas.width*.68);
    g.addColorStop(0, '#c79455');
    g.addColorStop(0.54, '#001622');
    g.addColorStop(1, '#4b2a10');
    ctx.fillStyle = g; ctx.fillRect(0,0,canvas.width,canvas.height);
    for (let i=0;i<14000;i++) {
      const shade = Math.floor(80 + Math.random()*80);
      ctx.fillStyle = `rgba(${shade},${Math.floor(shade*.65)},${Math.floor(shade*.28)},${Math.random()*0.09})`;
      ctx.fillRect(Math.random()*canvas.width, Math.random()*canvas.height, 1, 1);
    }
    ctx.strokeStyle = 'rgba(50,34,16,.34)'; ctx.lineWidth = 2;
    for (let x=70;x<canvas.width;x+=110) { ctx.beginPath(); ctx.moveTo(x,55); ctx.lineTo(x,canvas.height-65); ctx.stroke(); }
    for (let y=70;y<canvas.height;y+=105) { ctx.beginPath(); ctx.moveTo(55,y); ctx.lineTo(canvas.width-55,y); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(34,24,13,.46)'; ctx.lineWidth = 2;
    for (let i=0;i<18;i++) {
      const cx = 110 + (i%6)*205, cy = 110 + Math.floor(i/6)*210;
      ctx.strokeRect(cx, cy, 70, 48);
      ctx.beginPath(); ctx.arc(cx+40, cy+96, 36, 0, Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx-18, cy+24); ctx.lineTo(cx+110, cy+24); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(53,31,11,.20)';
    ctx.font = '900 74px Courier New, monospace'; ctx.textAlign = 'center'; ctx.fillText('DATA-HUB v1.2.9', canvas.width/2, canvas.height-105);
    const texture = new THREE.CanvasTexture(canvas); texture.anisotropy = 4; return texture;
  }

  private createPaperRollTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas'); canvas.width = 128; canvas.height = 256;
    const ctx = canvas.getContext('2d')!; ctx.fillStyle = '#98784e'; ctx.fillRect(0,0,128,256);
    for(let y=0;y<256;y+=6){ ctx.fillStyle = `rgba(255,240,190,${0.04+Math.random()*0.05})`; ctx.fillRect(0,y,128,1); }
    return new THREE.CanvasTexture(canvas);
  }

  private emitCriticalParticleFeedback(tier: SpawnTier, origin: THREE.Vector3, color: number): void {
    if (tier !== SpawnTier.CRITICAL) return;

    const particleCount = this.profile.kind === 'mobile' ? 18 : 28;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i += 1) {
      const offset = i * 3;
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 0.04 + Math.random() * 0.18;
      positions[offset] = origin.x + Math.cos(angle) * radius;
      positions[offset + 1] = origin.y + Math.sin(angle) * radius;
      positions[offset + 2] = origin.z + 0.05 + Math.random() * 0.12;
      velocities[offset] = Math.cos(angle) * (0.006 + Math.random() * 0.018);
      velocities[offset + 1] = Math.sin(angle) * (0.006 + Math.random() * 0.018);
      velocities[offset + 2] = 0.004 + Math.random() * 0.01;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

    const material = new THREE.PointsMaterial({
      color,
      size: this.profile.kind === 'mobile' ? 0.035 : 0.045,
      transparent: true,
      opacity: 0.58,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });

    const particles = new THREE.Points(geometry, material);
    particles.userData = {
      nonNodeParticleFeedback: true,
      spawnTier: tier,
      createdAt: performance.now(),
      ttl: 1200,
    };
    this.particleGroup.add(particles);
  }

  private getSpawnTierVisuals(tier: SpawnTier): { scale: number; halo: number; opacity: number; emissive: number; pulse: number } {
    switch (tier) {
      case SpawnTier.CRITICAL:
        return { scale: 1.18, halo: 1.55, opacity: 1.14, emissive: 1.28, pulse: 0.11 };
      case SpawnTier.HIGH:
        return { scale: 1.08, halo: 1.25, opacity: 1.06, emissive: 1.12, pulse: 0.075 };
      case SpawnTier.STANDARD:
        return { scale: 1.0, halo: 1.0, opacity: 1.0, emissive: 1.0, pulse: 0.045 };
      case SpawnTier.LOW:
      default:
        return { scale: 0.92, halo: 0.9, opacity: 0.95, emissive: 0.95, pulse: 0.03 };
    }
  }

  private createPatinaTexture(cyanCatch: number): THREE.CanvasTexture {
    const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 256;
    const ctx = canvas.getContext('2d')!; ctx.fillStyle = '#5b3c22'; ctx.fillRect(0,0,256,256);
    for(let i=0;i<3200;i++) {
      const cyan = Math.random() < cyanCatch;
      ctx.fillStyle = cyan ? `rgba(110,244,229,${Math.random()*0.16})` : `rgba(${60+Math.random()*90},${38+Math.random()*50},${18+Math.random()*22},${Math.random()*0.24})`;
      ctx.fillRect(Math.random()*256, Math.random()*256, Math.random()*3+0.5, Math.random()*3+0.5);
    }
    return new THREE.CanvasTexture(canvas);
  }

  private createBlueprintGearRig(): void {
    this.gearGroup.position.set(0, 0, 0.65);
    this.createPanelGear('archive', 'ARCHIVE', new THREE.Vector3(-2.45, -0.05, 0), 0.72, 1);
    this.createPanelGear('games', 'GAMES', new THREE.Vector3(0, 0.52, 0.02), 1.02, 1);
    this.createPanelGear('community', 'COMMUNITY', new THREE.Vector3(2.28, -0.05, 0), 0.76, 2);
    this.createPanelGear('blueprint', 'BLUEPRINT', new THREE.Vector3(0, -1.28, 0.04), 0.86, 1);
    this.createPanelGear('memory', 'MEMORY', new THREE.Vector3(-1.55, -1.12, 0.08), 0.62, 3);
  }

  private resetGearControls(): void {
    this.gears.forEach((gear) => {
      this.gearGroup.remove(gear.group);
      this.gearGroup.remove(gear.hit);
    });
    this.gears = [];
    this.gearRaycastObjects = [];
    this.hoveredGear = undefined;
    this.selectedGear = undefined;
    this.dragGear = undefined;
  }

  private createPanelGear(id: GearId, label: string, position: THREE.Vector3, radius: number, unlockedLevel: number): void {
    const group = this.createHolographicPanel(id);
    group.position.copy(position);
    group.userData = {
      ...group.userData,
      gearId: id,
      active: false,
      unlocked: true,
      unlockedLevel,
      homeY: position.y,
      homeZ: position.z,
      panelScale: radius,
    };

    const labelSprite = this.createTextSprite(label, '#001b1f', 'rgba(0,255,255,0.42)', 1.0);
    labelSprite.position.set(0, -0.88, 0.035);
    labelSprite.scale.set(1.36, 0.34, 1);
    group.add(labelSprite);

    this.gearRaycastObjects.push(group);
    this.gearGroup.add(group);
    const hit = group.userData.hitProxy as THREE.Mesh;
    this.gears.push({ id, group, hit, anchor: position.clone(), eventType: GEAR_EVENT_TYPES[id], unlockedLevel, active: false, label: labelSprite });
  }

  private createHolographicPanel(id: GearId): THREE.Group {
    const group = new THREE.Group();
    group.userData.gearId = id;

    const tone = id === 'community' ? HOLO_TONES.MAGENTA : id === 'memory' ? HOLO_TONES.PURPLE : HOLO_TONES.CYAN;
    const geometry = new THREE.PlaneGeometry(1.8, 2.2);
    const material = new THREE.MeshBasicMaterial({
      color: tone,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
      toneMapped: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const panel = new THREE.Mesh(geometry, material);
    panel.userData = { gearId: id, holographicPanel: true };

    const border = new THREE.Mesh(
      new THREE.RingGeometry(0.72, 0.76, 4),
      new THREE.MeshBasicMaterial({
        color: tone,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
        toneMapped: false,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    border.scale.set(1.18, 1.43, 1);
    border.rotation.z = Math.PI / 4;
    border.position.z = 0.018;
    border.userData = { gearId: id, holographicBorder: true };

    const scanLine = new THREE.Mesh(
      new THREE.PlaneGeometry(1.58, 0.045),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.42,
        side: THREE.DoubleSide,
        toneMapped: false,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    scanLine.position.z = 0.028;
    scanLine.userData = { gearId: id, scanLine: true };

    const hitProxy = new THREE.Mesh(
      new THREE.PlaneGeometry(2.0, 2.4),
      new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide })
    );
    hitProxy.position.z = 0.04;
    hitProxy.userData = { gearId: id, hitProxy: true };

    group.add(panel, border, scanLine, hitProxy);
    group.userData.panel = panel;
    group.userData.border = border;
    group.userData.scanLine = scanLine;
    group.userData.hitProxy = hitProxy;
    return group;
  }

  private createEngageDial(): void {
    const group = new THREE.Group();
    group.position.set(0, -2.78, -1.03);
    group.userData = { engageDial: true };

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: HOLO_TONES.CYAN,
      transparent: true,
      opacity: 0.72,
      side: THREE.DoubleSide,
      toneMapped: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.46, 0.58, 48), ringMaterial);
    ring.userData = { engageDial: true, holographicDial: true };

    const core = new THREE.Mesh(
      new THREE.CircleGeometry(0.2, 40),
      new THREE.MeshBasicMaterial({
        color: HOLO_TONES.CYAN,
        transparent: true,
        opacity: 0.28,
        side: THREE.DoubleSide,
        toneMapped: false,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    core.position.z = 0.012;
    core.userData = { engageDial: true, holographicDialCore: true };

    const label = this.createTextSprite('ENGAGE DIAL', '#bfffff', 'rgba(0,255,255,0.16)', 0.78);
    label.position.set(0, 0, 0.04);
    label.scale.set(1.2, 0.24, 1);
    label.userData = { engageDial: true, holographicLabel: true };
    this.applyHolographicStyle(label);

    group.add(ring, core, label);
    this.gearGroup.add(group);
    this.focusDial = group;
  }

  private applyHolographicStyle(object: THREE.Object3D, tone = HOLO_TONES.CYAN): void {
    object.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh) {
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((material) => {
          const mat = material as THREE.MeshBasicMaterial;
          if (!mat) return;
          mat.color?.set(tone);
          mat.transparent = true;
          mat.opacity = 0.8;
          mat.toneMapped = false;
          mat.depthWrite = false;
          mat.blending = THREE.AdditiveBlending;
          mat.needsUpdate = true;
        });
      }

      const sprite = child as THREE.Sprite;
      if (sprite.isSprite) {
        const mat = sprite.material as THREE.SpriteMaterial;
        mat.color.set(tone);
        mat.transparent = true;
        mat.opacity = 0.92;
        mat.toneMapped = false;
        mat.depthWrite = false;
        mat.blending = THREE.AdditiveBlending;
        mat.needsUpdate = true;
      }
    });
  }

  private createGauges(): void {
    const specs = [
      ['depth', 'DEPTH 1', -3.4, 1.75],
      ['signals', 'SIGNALS 0', 3.35, 1.55],
      ['trace', 'TRACE 0', -3.15, -2.05],
      ['pearls', 'PEARLS 0', 3.12, -2.0],
    ] as const;
    specs.forEach(([key, text, x, y]) => {
      const sprite = this.createTextSprite(text, '#bfffff', 'rgba(0,255,255,0.14)', 1.0);
      sprite.position.set(x, y, 0.7);
      sprite.scale.set(1.65, 0.42, 1);
      sprite.userData = { gaugeKey: key, holographicGauge: true };
      this.applyHolographicStyle(sprite);
      this.gaugeGroup.add(sprite);
      this.gauges.push({ key, sprite, lastValue: text });
    });
  }

  private updateGaugeText(key: string, value: string): void {
    const gauge = this.gauges.find((item) => item.key === key);
    if (!gauge || gauge.lastValue === value) return;
    gauge.lastValue = value;
    const old = gauge.sprite.material.map;
    gauge.sprite.material.map = this.createTextTexture(value, '#bfffff', 'rgba(0,255,255,0.14)');
    this.applyHolographicStyle(gauge.sprite);
    gauge.sprite.material.needsUpdate = true;
    old?.dispose();
  }

  private updateGearUnlocks(level: number): void {
    this.gears.forEach((gear) => {
      const unlocked = level >= gear.unlockedLevel;
      gear.group.userData.unlocked = unlocked;
      gear.group.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        const material = mesh.material as THREE.MeshStandardMaterial | undefined;
        if (material?.opacity !== undefined) {
          material.transparent = true;
          material.opacity = unlocked ? 1 : 0.34;
        }
      });
    });
  }

  private createGeometry(mapping: BiomeMapping): THREE.BufferGeometry {
    const segments = this.profile.geometryDetail > 0 ? 64 : 28;
    switch (mapping.geometry) {
      case 'growth-node': return new THREE.RingGeometry(0.28, 0.44, segments);
      case 'resource-crystal': return new THREE.CircleGeometry(0.26, 6);
      case 'reward-orb': return new THREE.RingGeometry(0.22, 0.42, segments);
      case 'heartbeat-ring': return new THREE.RingGeometry(0.34, 0.42, segments);
      default: return new THREE.CircleGeometry(0.3, 4);
    }
  }

  private createMaterial(mapping: BiomeMapping): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: mapping.color,
      emissive: mapping.emissive,
      emissiveIntensity: 0.16,
      metalness: 0.0,
      roughness: 0.92,
      transparent: true,
      opacity: 0.72,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
  }

  private computePosition(index: number, pull: number, gearId?: GearId): THREE.Vector3 {
    const anchor = gearId ? this.getGearAnchor(gearId) : new THREE.Vector3(0, 0, -1.04);
    anchor.z = -1.04;
    if (index === 0) return anchor.clone();
    const golden = Math.PI * (3 - Math.sqrt(5));
    const radius = 0.58 + Math.sqrt(index) * 0.42 * pull;
    const angleBase = gearId ? this.getGearAngle(gearId) : index * golden;
    const angle = angleBase + index * 0.24;
    const branch = Math.floor(index / 9);
    const x = THREE.MathUtils.clamp(anchor.x + Math.cos(angle) * radius, -5.15, 5.15);
    const y = THREE.MathUtils.clamp(anchor.y + Math.sin(angle) * radius * 0.62 + Math.sin(index * 0.72) * 0.18 - branch * 0.06, -3.62, 3.35);
    return new THREE.Vector3(x, y, -1.04);
  }

  private getGearAnchor(gearId: GearId): THREE.Vector3 {
    const modelAnchor = this.getModelAnchorPosition(`anchor_${gearId}`);
    const anchor = modelAnchor || this.gears.find((gear) => gear.id === gearId)?.anchor.clone() || this.getFallbackGearAnchor(gearId);
    anchor.z = -1.04;
    return anchor;
  }

  private getGearAngle(gearId: GearId): number {
    const gear = this.gears.find((item) => item.id === gearId);
    if (!gear) return 0;
    return Math.atan2(gear.anchor.y, gear.anchor.x || 0.001);
  }

  private connectToPrevious(node: SpatialNode): void {
    const prev = this.nodes.length > 1 ? this.nodes[this.nodes.length - 2] : null;
    if (!prev) return;
    this.createLiquidTube(prev.target, node.target, node.mapping, 0.025 + node.mapping.pull * 0.006);
  }

  private connectGearToNode(node: SpatialNode): void {
    if (!node.gearId) return;
    this.createLiquidTube(this.getGearAnchor(node.gearId), node.target, node.mapping, 0.018 + node.mapping.pull * 0.004);
  }

  private createLiquidTube(from: THREE.Vector3, to: THREE.Vector3, mapping: BiomeMapping, radius: number): void {
    const a = from.clone();
    const b = to.clone();
    a.z = -1.035;
    b.z = -1.035;
    const mid = a.clone().lerp(b, 0.5);
    mid.y += 0.12 * Math.sin(this.nodes.length * 1.7);
    mid.z = -1.033;
    const curve = new THREE.CatmullRomCurve3([a, mid, b]);
    const geometry = new THREE.TubeGeometry(curve, Math.max(8, Math.floor(this.profile.linkSegments * 0.55)), 0.008, 4, false);
    const material = new THREE.MeshStandardMaterial({
      color: mapping.color,
      emissive: mapping.emissive,
      emissiveIntensity: 0.18,
      metalness: 0.0,
      roughness: 0.95,
      transparent: true,
      opacity: 0.26,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;
    this.linkGroup.add(mesh);
    this.links.push({ mesh, material, createdAt: performance.now() });
    while (this.links.length > 76) {
      const old = this.links.shift();
      if (old) {
        this.linkGroup.remove(old.mesh);
        old.mesh.geometry.dispose();
        old.material.dispose();
      }
    }
  }

  private archiveOldMemories(): void {
    const archiveStart = Math.max(0, this.nodes.length - 16);
    if (this.focusDial) this.focusDial.rotation.z -= 0.004;

    this.nodes.forEach((node, index) => {
      if (index < archiveStart) {
        const depth = archiveStart - index;
        node.target.z = node.home.z - 6 - depth * 0.34;
        node.target.y = node.home.y - Math.min(4, depth * 0.11);
      } else {
        node.target.copy(node.home);
      }
    });
  }

  private bindPointer(): void {
    const update = (event: PointerEvent) => {
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      if (this.dragGear) {
        const dx = event.clientX - this.dragStartX;
        if (Math.abs(dx) > 10) this.didDrag = true;
        this.dragGear.group.rotation.z += dx * 0.0018;
        this.dragStartX = event.clientX;
      }
    };
    this.renderer.domElement.addEventListener('pointermove', update, { passive: true });
    this.renderer.domElement.addEventListener('pointerdown', (event) => {
      update(event);
      const dial = this.pickDial();
      if (dial) {
        this.focusNext();
        return;
      }
      const gear = this.pickGear();
      if (!gear || gear.group.userData.unlocked === false) return;
      this.dragGear = gear;
      this.dragStartX = event.clientX;
      this.didDrag = false;
      this.renderer.domElement.setPointerCapture?.(event.pointerId);

      if (event.pointerType === 'touch') {
        const now = performance.now();
        const secondTap = this.lastTouchGear === gear.id && now - this.lastTouchAt < 900;
        this.lastTouchGear = gear.id;
        this.lastTouchAt = now;
        this.selectedGear = gear;
        this.setActiveGear(gear.id);
        if (secondTap) this.onGearSelected?.(gear.id);
      } else {
        this.selectedGear = gear;
        this.setActiveGear(gear.id);
        this.onGearSelected?.(gear.id);
      }
    });
    this.renderer.domElement.addEventListener('pointerup', (event) => {
      if (this.dragGear && this.didDrag) this.onGearSelected?.(this.dragGear.id);
      this.dragGear = undefined;
      this.didDrag = false;
      this.renderer.domElement.releasePointerCapture?.(event.pointerId);
    });
    this.renderer.domElement.addEventListener('pointerleave', () => {
      this.pointer.set(99, 99);
      this.hovered = undefined;
      this.hoveredGear = undefined;
    });
  }

  private createStarfield(): void {
    const geometry = new THREE.BufferGeometry();
    const verts: number[] = [];
    for (let i = 0; i < this.profile.starCount; i++) {
      verts.push((Math.random() - 0.5) * 44, (Math.random() - 0.5) * 24, (Math.random() - 0.5) * 44);
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    const material = new THREE.PointsMaterial({ color: 0x8f7a58, size: 0.025, transparent: true, opacity: 0.34 });
    this.scene.add(new THREE.Points(geometry, material));
  }

  private bindContextMonitoring(): void {
    this.renderer.domElement.addEventListener('webglcontextlost', this.handleWebGLContextLost, false);
    this.renderer.domElement.addEventListener('webglcontextrestored', this.handleWebGLContextRestored, false);
  }

  private readonly handleWebGLContextLost = (event: Event): void => {
    event.preventDefault();
    this.webglContextLost = true;
    this.host.dataset.webglContext = 'lost';
    if (this.liveRegion) this.liveRegion.textContent = 'Holographic renderer paused: WebGL context lost';
  };

  private readonly handleWebGLContextRestored = (): void => {
    this.webglContextLost = false;
    this.host.dataset.webglContext = 'restored';
    this.ensureCanvasMounted();
    window.dispatchEvent(new Event('resize'));
    if (this.liveRegion) this.liveRegion.textContent = 'Holographic renderer restored';
  };

  private startMountGuard(): void {
    this.mountGuardId = window.setInterval(() => {
      this.ensureCanvasMounted();
    }, 500);
  }

  private ensureCanvasMounted(): boolean {
    if (!this.host.isConnected) return false;
    if (!this.host.contains(this.renderer.domElement)) {
      this.host.appendChild(this.renderer.domElement);
      this.host.dataset.mountRecovered = String(Date.now());
    }
    return this.renderer.domElement.isConnected && this.host.contains(this.renderer.domElement);
  }

  private isWebGLContextUnavailable(): boolean {
    try {
      return this.webglContextLost || this.renderer.getContext().isContextLost();
    } catch {
      return true;
    }
  }

  private calibrateViewportSize(force = false): void {
    const viewport = window.visualViewport;
    const viewportWidth = Math.round(viewport?.width || window.innerWidth || document.documentElement.clientWidth || 320);
    const viewportHeight = Math.round(viewport?.height || window.innerHeight || document.documentElement.clientHeight || 320);
    const rect = this.host.getBoundingClientRect();
    const width = Math.max(320, viewportWidth, Math.round(rect.width || 0));
    const height = Math.max(320, viewportHeight, Math.round(rect.height || 0));
    const canvas = this.renderer.domElement;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const expectedBufferWidth = Math.round(width * pixelRatio);
    const expectedBufferHeight = Math.round(height * pixelRatio);
    const cssDrift = Math.abs(canvas.clientWidth - width) > 2 || Math.abs(canvas.clientHeight - height) > 2;
    const bufferDrift = Math.abs(canvas.width - expectedBufferWidth) > 4 || Math.abs(canvas.height - expectedBufferHeight) > 4;

    if (!force && !cssDrift && !bufferDrift) return;

    const aspect = width / height;
    const viewHeight = 8.1;
    this.host.style.width = `${viewportWidth}px`;
    this.host.style.height = `${viewportHeight}px`;
    this.renderer.setPixelRatio(pixelRatio);
    this.camera.top = viewHeight / 2;
    this.camera.bottom = -viewHeight / 2;
    this.camera.left = -viewHeight * aspect / 2;
    this.camera.right = viewHeight * aspect / 2;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.composer?.setSize(width, height);
    this.bloomPass?.setSize(width, height);
  }

  private checkLayoutHealth(elapsedMs: number): void {
    if (elapsedMs - this.lastLayoutHealthCheck < 100) return;
    this.lastLayoutHealthCheck = elapsedMs;
    this.calibrateViewportSize(false);
  }

  private bindResize(): void {
    const resize = () => this.calibrateViewportSize(true);
    this.resizeObserver = new ResizeObserver(resize);
    this.resizeObserver.observe(this.host);
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('orientationchange', resize, { passive: true });
    window.visualViewport?.addEventListener('resize', resize, { passive: true });
    window.visualViewport?.addEventListener('scroll', resize, { passive: true });
    resize();
  }

  private animate = () => {
    if (!this.ensureCanvasMounted() || this.isWebGLContextUnavailable()) {
      this.rafId = requestAnimationFrame(this.animate);
      return;
    }

    this.checkLayoutHealth(performance.now());

    if (this.gears.length === 0) {
      this.createBlueprintGearRig();
      this.applyResponsiveProfile(this.profile, true);
    }

    const elapsed = this.clock.getElapsedTime();
    this.updateHoverState();
    this.biomeGroup.rotation.y += 0.0017;
    this.biomeGroup.rotation.x = Math.sin(elapsed * 0.17) * 0.06;
    this.linkGroup.rotation.copy(this.biomeGroup.rotation);

    const focus = this.nodes[this.focusIndex];
    const focalZ = focus?.target.z || 0;

    this.gears.forEach((gear, index) => {
      const phase = elapsed * 1.08 + index * 0.82;
      const homeY = (gear.group.userData.homeY as number | undefined) ?? gear.anchor.y;
      const homeZ = (gear.group.userData.homeZ as number | undefined) ?? gear.anchor.z;
      gear.group.position.y = homeY + Math.sin(phase) * 0.045;
      gear.group.position.z = homeZ + Math.cos(phase * 0.7) * 0.012;

      const panel = gear.group.userData.panel as THREE.Mesh | undefined;
      const border = gear.group.userData.border as THREE.Mesh | undefined;
      const scanLine = gear.group.userData.scanLine as THREE.Mesh | undefined;
      if (panel) {
        panel.rotation.x = Math.sin(elapsed * 0.8 + index) * 0.03;
        panel.rotation.y = Math.cos(elapsed * 0.8 + index) * 0.03;
        const material = panel.material as THREE.MeshBasicMaterial;
        material.opacity = gear.group.userData.unlocked === false ? 0.24 : gear.active ? 0.86 : 0.62;
      }
      if (border) border.rotation.z = Math.PI / 4 + Math.sin(elapsed * 0.55 + index) * 0.018;
      if (scanLine) scanLine.position.y = Math.sin(elapsed * 1.6 + index) * 0.72;

      const activeScale = gear.active ? 1.08 : 1;
      const hoverScale = this.hoveredGear === gear || this.selectedGear === gear ? 1.08 : 1;
      const panelScale = (gear.group.userData.panelScale as number | undefined) ?? 1;
      const baseScale = this.profile.gearScale * this.profile.touchTargetScale * panelScale;
      const targetScale = baseScale * activeScale * hoverScale;
      const hitProxy = gear.group.userData.hitProxy as THREE.Mesh | undefined;
      if (hitProxy) {
        const minHitWidth = this.profile.kind === 'mobile' ? (this.profile.orientation === 'portrait' ? 0.78 : 0.72) : 0;
        const hitScale = minHitWidth > 0 ? Math.max(1, minHitWidth / Math.max(0.001, 2.0 * baseScale)) : 1;
        hitProxy.scale.set(hitScale, hitScale, 1);
      }
      gear.group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);
    });

    if (this.focusDial) this.focusDial.rotation.z -= 0.004;

    this.nodes.forEach((node, index) => {
      const age = Math.min(1, (performance.now() - node.createdAt) / 620);
      const desired = node.target.clone();

      if (this.hovered && this.hovered !== node) {
        const distance = desired.distanceTo(this.hovered.target);
        if (distance < 4.8) {
          const push = desired.clone().sub(this.hovered.target).normalize().multiplyScalar((4.8 - distance) * 0.18);
          desired.add(push);
        }
      }

      const zDistance = Math.abs(node.target.z - focalZ);
      const blurFactor = Math.min(1, zDistance / 10);
      const archiveFactor = index < Math.max(0, this.nodes.length - 16) ? 0.55 : 1;
      const material = node.mesh.material as THREE.MeshStandardMaterial;
      const tierVisuals = this.getSpawnTierVisuals(node.spawnTier);
      const tierPulse = 1 + Math.sin(elapsed * 2.1 + index * 0.73) * tierVisuals.pulse;
      material.opacity = Math.min(0.94, THREE.MathUtils.lerp(0.18, 0.78, 1 - blurFactor) * archiveFactor * tierVisuals.opacity);
      material.emissiveIntensity = THREE.MathUtils.lerp(0.08, 0.42, 1 - blurFactor) * tierVisuals.emissive * tierPulse;
      node.halo.material.opacity = Math.min(0.42, THREE.MathUtils.lerp(0.12, 0.025, 1 - blurFactor) * archiveFactor * tierVisuals.halo);
      const bokehScale = THREE.MathUtils.lerp(1.3, 0.72, 1 - blurFactor) * tierVisuals.halo;

      node.mesh.position.lerp(desired, 0.055);
      node.halo.position.copy(node.mesh.position);
      const pulse = 1 + Math.sin(elapsed * 2.4 + index) * 0.045;
      const hoverBoost = this.hovered === node ? 1.32 : 1;
      const deviceNodeScale = this.profile.kind === 'mobile' ? (this.profile.orientation === 'portrait' ? 0.16 : 0.28) : this.profile.kind === 'tablet' ? 0.55 : 0.74;
      node.mesh.scale.setScalar(deviceNodeScale * node.mapping.scale * tierVisuals.scale * pulse * tierPulse * age * hoverBoost * (1 - blurFactor * 0.18));
      node.halo.scale.setScalar(deviceNodeScale * bokehScale * node.mapping.scale * (this.hovered === node ? 1.25 : 1));
      node.mesh.rotation.x += 0.006 + index * 0.0002;
      node.mesh.rotation.y += 0.009;
    });

    const particleNow = performance.now();
    for (let i = this.particleGroup.children.length - 1; i >= 0; i -= 1) {
      const particleObject = this.particleGroup.children[i] as THREE.Points;
      const material = particleObject.material as THREE.PointsMaterial;
      const geometry = particleObject.geometry as THREE.BufferGeometry;
      const age = particleNow - ((particleObject.userData.createdAt as number | undefined) || particleNow);
      const ttl = (particleObject.userData.ttl as number | undefined) || 1200;
      const life = Math.max(0, 1 - age / ttl);

      const positions = geometry.getAttribute('position') as THREE.BufferAttribute | undefined;
      const velocities = geometry.getAttribute('velocity') as THREE.BufferAttribute | undefined;
      if (positions && velocities) {
        for (let j = 0; j < positions.count; j += 1) {
          positions.setX(j, positions.getX(j) + velocities.getX(j));
          positions.setY(j, positions.getY(j) + velocities.getY(j));
          positions.setZ(j, positions.getZ(j) + velocities.getZ(j));
        }
        positions.needsUpdate = true;
      }
      material.opacity = 0.58 * life;
      particleObject.scale.setScalar(1 + (1 - life) * 0.35);

      if (age >= ttl) {
        this.particleGroup.remove(particleObject);
        geometry.dispose();
        material.dispose();
      }
    }

    this.links.forEach((link, index) => {
      const wave = (Math.sin(elapsed * 2.8 + index * 0.65) + 1) / 2;
      link.material.opacity = 0.18 + wave * 0.34;
      link.material.emissiveIntensity = 0.7 + wave * 0.95;
      link.mesh.scale.setScalar(1 + wave * 0.045);
    });

    if (focus) {
      const desired = new THREE.Vector3(this.profile.camera.x, this.profile.camera.y, this.profile.camera.z);
      const focal = new THREE.Vector3(this.profile.camera.targetX, this.profile.camera.targetY, this.profile.camera.targetZ)
        .add(focus.target.clone().multiplyScalar(0.012));
      this.camera.position.lerp(desired, 0.016);
      this.camera.lookAt(focal);
    } else {
      this.camera.lookAt(this.profile.camera.targetX, this.profile.camera.targetY, this.profile.camera.targetZ);
    }

    this.composer.render();
    this.rafId = requestAnimationFrame(this.animate);
  };

  private updateHoverState(): void {
    if (this.pointer.x > 2) return;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const gearHits = this.raycaster.intersectObjects(this.gearRaycastObjects, true);
    const gearHit = gearHits.find((item) => item.object.userData.gearId);
    this.hoveredGear = gearHit ? this.gears.find((gear) => gear.id === gearHit.object.userData.gearId) : undefined;
    const nodeHits = this.raycaster.intersectObjects(this.nodes.map((node) => node.mesh), false);
    this.hovered = nodeHits[0]
      ? this.nodes.find((node) => node.mesh === nodeHits[0].object)
      : undefined;
    this.renderer.domElement.style.cursor = this.pickDial() || this.hoveredGear || this.hovered ? 'grab' : 'crosshair';
  }

  private updateHud(event: EventContract, mapping: BiomeMapping): void {
    this.host.dataset.nodes = String(this.nodes.length);
    this.host.dataset.lastEvent = event.type;
    if (this.liveRegion) {
      this.liveRegion.textContent = `${mapping.label}: ${event.type}`;
    }
  }

  private createHaloTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255,255,255,0.95)');
    gradient.addColorStop(0.28, 'rgba(255,255,255,0.28)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(canvas);
  }

  private createTextSprite(text: string, color: string, background: string, density = 1): THREE.Sprite {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: this.createTextTexture(text, color, background),
      transparent: true,
      depthWrite: false,
    }));
    sprite.scale.set(1.6 * density, 0.42 * density, 1);
    return sprite;
  }

  private createTextTexture(text: string, color: string, background: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (background !== 'transparent') {
      const holo = background.includes('255,255') || background.includes('255, 255') || background.includes('0,255,255') || background.includes('0, 255, 255');
      ctx.fillStyle = background;
      ctx.fillRect(12, 24, 488, 80);
      ctx.strokeStyle = holo ? 'rgba(0,255,255,0.68)' : 'rgba(61,42,21,0.58)';
      ctx.lineWidth = 2;
      ctx.strokeRect(12.5, 24.5, 487, 79);
      ctx.strokeStyle = holo ? 'rgba(190,255,255,0.32)' : 'rgba(240,211,150,0.20)';
      ctx.lineWidth = 1;
      ctx.strokeRect(22.5, 34.5, 467, 59);
      if (holo) {
        ctx.strokeStyle = 'rgba(0,255,255,0.22)';
        ctx.lineWidth = 1;
        for (let y = 40; y <= 88; y += 12) {
          ctx.beginPath();
          ctx.moveTo(28, y + 0.5);
          ctx.lineTo(484, y + 0.5);
          ctx.stroke();
        }
      }
    }
    ctx.font = '900 31px "Courier New", "Courier", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = background === 'transparent' ? 'rgba(255,226,168,0.10)' : 'rgba(255,238,190,0.16)';
    ctx.fillText(text, 259, 68);
    ctx.fillStyle = color;
    ctx.fillText(text, 256, 65);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}
