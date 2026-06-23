import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import type { EventContract, PlatformState } from '../kernel';
import { BIOME_EVENT_MAP, DEFAULT_BIOME_MAPPING, type BiomeMapping } from './biome.config';
import { ResponsiveEngine, type ResponsiveProfile } from '../responsive/ResponsiveEngine';

export type GearId = 'games' | 'archive' | 'community' | 'blueprint' | 'memory';

type SpatialNode = {
  id: string;
  eventType: string;
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
  group: THREE.Group;
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
  private workstationGroup = new THREE.Group();
  private biomeGroup = new THREE.Group();
  private linkGroup = new THREE.Group();
  private gearGroup = new THREE.Group();
  private gaugeGroup = new THREE.Group();
  private nodes: SpatialNode[] = [];
  private links: LiquidLink[] = [];
  private gears: GearAssembly[] = [];
  private gauges: Gauge[] = [];
  private focusDial?: THREE.Group;
  private resizeObserver?: ResizeObserver;
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
    this.renderer.toneMappingExposure = 0.92;
    this.renderer.domElement.className = 'kernel-spatial-webgl';
    this.renderer.domElement.setAttribute('aria-label', 'Liquid Memory generative spatial ecosystem');
    this.host.appendChild(this.renderer.domElement);

    this.scene.add(this.workstationGroup);
    this.scene.add(this.linkGroup);
    this.scene.add(this.biomeGroup);
    this.scene.add(this.gearGroup);
    this.scene.add(this.gaugeGroup);
    this.applyCameraProfile(this.profile, true);

    const ambient = new THREE.AmbientLight(0x6f5a3e, 0.42);
    const lamp = new THREE.PointLight(0xffbd68, 7.2, 42, 1.72);
    lamp.position.set(4.9, 3.45, 4.2);
    const cyanEdge = new THREE.PointLight(0x6ef4e5, 0.42, 18, 2.6);
    cyanEdge.position.set(-4.6, 1.2, 4.2);
    const lowFill = new THREE.PointLight(0x3b2a18, 1.8, 36, 2.0);
    lowFill.position.set(0, -4, 7);
    lamp.castShadow = true;
    lamp.shadow.mapSize.set(1024, 1024);
    lamp.shadow.bias = -0.0004;
    this.scene.add(ambient, lamp, cyanEdge, lowFill);
    this.scene.environment = this.createEnvironmentTexture();
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.08, 0.55, 0.94);
    this.composer.addPass(this.bloomPass);

    this.createWorkstationEnvironment();
    this.createBlueprintGearRig();
    this.createGauges();
    this.createEngageDial();
    this.applyResponsiveProfile(this.profile, true);
    this.responsive.subscribe((profile) => this.applyResponsiveProfile(profile));
    this.bindPointer();
    this.bindResize();
    this.animate();
  }

  handle(event: EventContract): void {
    if (event.type === 'system.heartbeat' && this.nodes.length > 0) return;
    const mapping = BIOME_EVENT_MAP[event.type] || DEFAULT_BIOME_MAPPING;
    const gearId = EVENT_TO_GEAR[event.type];
    const index = this.nodes.length;
    const target = this.computePosition(index, mapping.pull, gearId);
    const mesh = new THREE.Mesh(this.createGeometry(mapping), this.createMaterial(mapping));
    const origin = gearId ? this.getGearAnchor(gearId) : new THREE.Vector3(0, 0, 0);
    mesh.position.copy(origin);
    mesh.scale.setScalar(0.001);
    mesh.userData = { eventType: event.type, label: mapping.label };
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const halo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: this.haloTexture,
      color: mapping.color,
      transparent: true,
      opacity: 0.075,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }));
    halo.position.copy(mesh.position);
    halo.scale.setScalar(1.35 * mapping.scale);

    this.biomeGroup.add(mesh);
    this.biomeGroup.add(halo);

    const node: SpatialNode = { id: event.eventId, eventType: event.type, mesh, halo, target: target.clone(), home: target.clone(), createdAt: performance.now(), mapping, gearId };
    this.nodes.push(node);
    this.archiveOldMemories();
    this.connectToPrevious(node);
    this.connectGearToNode(node);
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

  dispose(): void {
    cancelAnimationFrame(this.rafId);
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
  }

  private applyCameraProfile(profile: ResponsiveProfile, instant = false): void {
    const target = profile.kind === 'mobile'
      ? new THREE.Vector3(0, -0.85, 14.8)
      : new THREE.Vector3(0, -0.42, 13.2);
    this.camera.zoom = profile.kind === 'mobile' ? 0.92 : profile.kind === 'tablet' ? 1.02 : 1.08;
    this.camera.updateProjectionMatrix();
    if (instant) this.camera.position.copy(target);
    else this.camera.position.lerp(target, 0.2);
    this.camera.lookAt(0, -0.28, -1.35);
  }

  private layoutGauges(mode: ResponsiveProfile['gaugeMode']): void {
    const layouts: Record<ResponsiveProfile['gaugeMode'], [number, number][]> = {
      'topbar': [[-2.85, 3.25], [-0.95, 3.25], [0.95, 3.25], [2.85, 3.25]],
      'side-panels': [[-3.4, 1.75], [3.35, 1.55], [-3.15, -2.05], [3.12, -2.0]],
      'compact-corners': [[-2.9, 2.2], [2.9, 2.0], [-2.9, -2.15], [2.9, -2.15]],
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
    const gearHits = this.raycaster.intersectObjects(this.gearGroup.children, true);
    const hit = gearHits.find((item) => item.object.userData.gearId);
    const gearId = hit?.object.userData.gearId as GearId | undefined;
    return gearId ? this.gears.find((item) => item.id === gearId) : undefined;
  }

  private pickDial(): boolean {
    if (!this.focusDial) return false;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    return this.raycaster.intersectObjects(this.focusDial.children, true).some((item) => item.object.userData.engageDial);
  }


  private createWorkstationEnvironment(): void {
    const desk = new THREE.Mesh(
      new THREE.PlaneGeometry(18, 11, 1, 1),
      new THREE.MeshStandardMaterial({
        color: 0x1b1209,
        map: this.createWoodTexture(),
        roughness: 0.82,
        metalness: 0.05,
      })
    );
    desk.position.set(0, 0, -2.65);
    desk.receiveShadow = true;
    this.workstationGroup.add(desk);

    const paper = new THREE.Mesh(
      new THREE.PlaneGeometry(10.6, 6.2, 1, 1),
      new THREE.MeshStandardMaterial({
        color: 0xb79258,
        map: this.createBlueprintPaperTexture(),
        roughness: 0.94,
        metalness: 0.0,
      })
    );
    paper.position.set(0, -0.2, -1.92);
    paper.receiveShadow = true;
    this.workstationGroup.add(paper);

    const frameMat = this.createOxidizedMetalMaterial(0x3c2a17, 0x0d0703, 0.01);
    const topRail = new THREE.Mesh(new THREE.BoxGeometry(11.4, 0.16, 0.2), frameMat);
    topRail.position.set(0, 3.05, -1.72);
    const bottomRail = topRail.clone(); bottomRail.position.y = -3.45;
    const leftRail = new THREE.Mesh(new THREE.BoxGeometry(0.16, 6.55, 0.2), frameMat);
    leftRail.position.set(-5.78, -0.2, -1.72);
    const rightRail = leftRail.clone(); rightRail.position.x = 5.78;
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

    const title = this.createTextSprite('BLUEPRINT // NAV', '#2e2114', 'rgba(173,134,78,0.72)', 1.0);
    title.position.set(-3.78, 2.72, -1.08);
    title.scale.set(2.55, 0.36, 1);
    const schematic = this.createTextSprite('SCHEMATIC  v0.9', '#2e2114', 'rgba(38,28,18,0.82)', 1.05);
    schematic.position.set(0, -3.12, -1.06);
    schematic.scale.set(2.35, 0.42, 1);
    this.workstationGroup.add(title, schematic);
    this.createEtchedOrnaments();
    this.workstationGroup.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) { mesh.castShadow = true; mesh.receiveShadow = true; }
    });
  }


  private createEtchedOrnaments(): void {
    const mat = this.createOxidizedMetalMaterial(0x3a2816, 0x0b0502, 0.0);
    const lineMat = new THREE.MeshStandardMaterial({ color: 0x2c1d10, emissive: 0x060302, metalness: 0.45, roughness: 0.64 });
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
    const cableMat = this.createOxidizedMetalMaterial(0x21150b, 0x050201, 0.0);
    const points = [new THREE.Vector3(-5.2, -2.8, -0.98), new THREE.Vector3(-3.5, -3.05, -0.98), new THREE.Vector3(-1.3, -2.72, -0.98), new THREE.Vector3(0, -3.05, -0.98), new THREE.Vector3(1.9, -2.84, -0.98), new THREE.Vector3(4.9, -3.0, -0.98)];
    const curve = new THREE.CatmullRomCurve3(points);
    this.workstationGroup.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.018, 6, false), cableMat));
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
      bumpMap: texture,
      bumpScale: 0.035,
      metalness: 0.88,
      roughness: 0.46,
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

  private createWoodTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#1b1209'; ctx.fillRect(0,0,512,512);
    for (let y=0;y<512;y++) {
      const n = Math.sin(y * 0.045) * 12 + Math.sin(y * 0.013) * 18;
      ctx.fillStyle = `rgba(${55+n},${34+n*0.35},${15},0.28)`;
      ctx.fillRect(0,y,512,1);
    }
    for (let i=0;i<1500;i++) {
      ctx.fillStyle = `rgba(0,0,0,${Math.random()*0.18})`;
      ctx.fillRect(Math.random()*512, Math.random()*512, Math.random()*2+0.5, Math.random()*2+0.5);
    }
    const texture = new THREE.CanvasTexture(canvas); texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(2.2,1.4); return texture;
  }

  private createBlueprintPaperTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 640;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#b89155'; ctx.fillRect(0,0,1024,640);
    ctx.fillStyle = 'rgba(70,45,20,.12)';
    for (let i=0;i<6000;i++) ctx.fillRect(Math.random()*1024, Math.random()*640, 1, 1);
    ctx.strokeStyle = 'rgba(49,70,69,.34)'; ctx.lineWidth = 1;
    for (let x=40;x<1024;x+=80) { ctx.beginPath(); ctx.moveTo(x,40); ctx.lineTo(x,600); ctx.stroke(); }
    for (let y=40;y<640;y+=80) { ctx.beginPath(); ctx.moveTo(40,y); ctx.lineTo(984,y); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(38,49,47,.52)';
    for (let i=0;i<9;i++) {
      const cx = 130 + i*95, cy = 110 + (i%3)*130;
      ctx.strokeRect(cx, cy, 58, 38);
      ctx.beginPath(); ctx.arc(cx+28, cy+72, 26, 0, Math.PI*2); ctx.stroke();
    }
    ctx.font = '700 28px Courier New, monospace'; ctx.fillStyle = 'rgba(45,31,18,.56)'; ctx.fillText('SCHEMATIC v0.9', 410, 560);
    const texture = new THREE.CanvasTexture(canvas); texture.anisotropy = 4; return texture;
  }

  private createPaperRollTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas'); canvas.width = 128; canvas.height = 256;
    const ctx = canvas.getContext('2d')!; ctx.fillStyle = '#98784e'; ctx.fillRect(0,0,128,256);
    for(let y=0;y<256;y+=6){ ctx.fillStyle = `rgba(255,240,190,${0.04+Math.random()*0.05})`; ctx.fillRect(0,y,128,1); }
    return new THREE.CanvasTexture(canvas);
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
    this.createGear('archive', 'ARCHIVE', new THREE.Vector3(-2.45, -0.05, 0), 0.72, 1);
    this.createGear('games', 'GAMES', new THREE.Vector3(0, 0.52, 0.02), 1.02, 1);
    this.createGear('community', 'COMMUNITY', new THREE.Vector3(2.28, -0.05, 0), 0.76, 2);
    this.createGear('blueprint', 'BLUEPRINT', new THREE.Vector3(0, -1.28, 0.04), 0.86, 1);
    this.createGear('memory', 'MEMORY', new THREE.Vector3(-1.55, -1.12, 0.08), 0.62, 3);
  }

  private createGear(id: GearId, label: string, position: THREE.Vector3, radius: number, unlockedLevel: number): void {
    const group = new THREE.Group();
    group.position.copy(position);
    group.userData = { gearId: id, active: false, unlockedLevel };

    const bodyMat = this.createOxidizedMetalMaterial(0x4d321d, 0x120905, 0.06);
    const face = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.18, 64), bodyMat);
    face.rotation.x = Math.PI / 2;
    face.userData = { gearId: id };
    group.add(face);

    const inner = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.48, 0.035, 10, 48), this.createOxidizedMetalMaterial(0x9d7640, 0x221407, 0.04));
    inner.position.z = 0.105;
    group.add(inner);

    const outer = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.86, 0.045, 10, 64), this.createOxidizedMetalMaterial(0x6f5430, 0x1b1108, 0.025));
    outer.position.z = 0.115;
    group.add(outer);

    const toothMat = this.createOxidizedMetalMaterial(0x6b4828, 0x160b05, 0.03);
    const toothCount = Math.max(14, Math.round(radius * 24));
    for (let i = 0; i < toothCount; i++) {
      const a = (i / toothCount) * Math.PI * 2;
      const tooth = new THREE.Mesh(new THREE.BoxGeometry(radius * 0.12, radius * 0.24, 0.16), toothMat);
      tooth.position.set(Math.cos(a) * radius * 1.02, Math.sin(a) * radius * 1.02, 0);
      tooth.rotation.z = a;
      tooth.userData = { gearId: id };
      group.add(tooth);
    }

    const labelSprite = this.createTextSprite(label, '#fff1cf', 'rgba(20,12,6,0.45)', 1.2);
    labelSprite.position.set(0, 0, 0.32);
    labelSprite.scale.set(radius * 1.35, radius * 0.36, 1);
    group.add(labelSprite);

    group.traverse((obj) => { const mesh = obj as THREE.Mesh; if (mesh.isMesh) { mesh.castShadow = true; mesh.receiveShadow = true; } });
    this.gearGroup.add(group);
    this.gears.push({ id, group, hit: face, anchor: position.clone(), eventType: GEAR_EVENT_TYPES[id], unlockedLevel, active: false, label: labelSprite });
  }

  private createEngageDial(): void {
    const group = new THREE.Group();
    group.position.set(0, -2.78, -1.03);
    group.userData = { engageDial: true };
    const mat = this.createOxidizedMetalMaterial(0x2f2318, 0x0b0603, 0.015);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.72, 0.16, 48), mat);
    base.rotation.x = Math.PI / 2;
    base.userData = { engageDial: true };
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.54, 0.04, 10, 48), this.createOxidizedMetalMaterial(0x8c693d, 0x1e1207, 0.02));
    ring.position.z = 0.11;
    ring.userData = { engageDial: true };
    const label = this.createTextSprite('ENGAGE DIAL', '#2e2114', 'rgba(154,113,62,0.68)', 0.78);
    label.position.set(0, 0, 0.24);
    label.scale.set(1.2, 0.24, 1);
    group.add(base, ring, label);
    this.gearGroup.add(group);
    this.focusDial = group;
  }

  private createGauges(): void {
    const specs = [
      ['depth', 'DEPTH 1', -3.4, 1.75],
      ['signals', 'SIGNALS 0', 3.35, 1.55],
      ['trace', 'TRACE 0', -3.15, -2.05],
      ['pearls', 'PEARLS 0', 3.12, -2.0],
    ] as const;
    specs.forEach(([key, text, x, y]) => {
      const sprite = this.createTextSprite(text, '#2f2517', 'rgba(181,144,88,0.78)', 1.0);
      sprite.position.set(x, y, 0.7);
      sprite.scale.set(1.65, 0.42, 1);
      this.gaugeGroup.add(sprite);
      this.gauges.push({ key, sprite, lastValue: text });
    });
  }

  private updateGaugeText(key: string, value: string): void {
    const gauge = this.gauges.find((item) => item.key === key);
    if (!gauge || gauge.lastValue === value) return;
    gauge.lastValue = value;
    const old = gauge.sprite.material.map;
    gauge.sprite.material.map = this.createTextTexture(value, '#2f2517', 'rgba(181,144,88,0.78)');
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
    switch (mapping.geometry) {
      case 'growth-node': return new THREE.IcosahedronGeometry(0.74, this.profile.geometryDetail);
      case 'resource-crystal': return new THREE.OctahedronGeometry(0.66, 0);
      case 'reward-orb': return new THREE.SphereGeometry(0.58, this.profile.geometryDetail > 0 ? 32 : 18, this.profile.geometryDetail > 0 ? 20 : 12);
      case 'heartbeat-ring': return new THREE.TorusGeometry(0.58, 0.055, this.profile.geometryDetail > 0 ? 14 : 8, this.profile.geometryDetail > 0 ? 64 : 28);
      default: return new THREE.TetrahedronGeometry(0.72, 0);
    }
  }

  private createMaterial(mapping: BiomeMapping): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: mapping.color,
      emissive: mapping.emissive,
      emissiveIntensity: 0.22,
      metalness: 0.42,
      roughness: 0.48,
      transparent: true,
      opacity: 0.94,
    });
  }

  private computePosition(index: number, pull: number, gearId?: GearId): THREE.Vector3 {
    const anchor = gearId ? this.getGearAnchor(gearId) : new THREE.Vector3(0, 0, 0);
    if (index === 0) return anchor.clone().add(new THREE.Vector3(0, 0, -0.6));
    const golden = Math.PI * (3 - Math.sqrt(5));
    const radius = 1.05 + Math.sqrt(index) * 0.82 * pull;
    const angleBase = gearId ? this.getGearAngle(gearId) : index * golden;
    const angle = angleBase + index * 0.22;
    const branch = Math.floor(index / 7);
    const x = anchor.x + Math.cos(angle) * radius;
    const y = anchor.y + Math.sin(angle) * radius * 0.62 + Math.sin(index * 0.72) * 0.45;
    const z = -1.4 - branch * 0.45 - Math.sin(angle) * 0.55;
    return new THREE.Vector3(x, y, z);
  }

  private getGearAnchor(gearId: GearId): THREE.Vector3 {
    return this.gears.find((gear) => gear.id === gearId)?.anchor.clone() || new THREE.Vector3(0, 0, 0);
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
    const mid = from.clone().lerp(to, 0.5);
    mid.z += 0.55;
    mid.y += 0.28 * Math.sin(this.nodes.length * 1.7);
    const curve = new THREE.CatmullRomCurve3([from, mid, to]);
    const geometry = new THREE.TubeGeometry(curve, this.profile.linkSegments, radius, this.profile.linkRadialSegments, false);
    const material = new THREE.MeshStandardMaterial({
      color: mapping.color,
      emissive: mapping.emissive,
      emissiveIntensity: 1.15,
      metalness: 0.55,
      roughness: 0.2,
      transparent: true,
      opacity: 0.30,
    });
    const mesh = new THREE.Mesh(geometry, material);
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

  private bindResize(): void {
    const resize = () => {
      const rect = this.host.getBoundingClientRect();
      const width = Math.max(320, rect.width || window.innerWidth);
      const height = Math.max(320, rect.height || window.innerHeight);
      const aspect = width / height;
      const viewHeight = 8.1;
      this.camera.top = viewHeight / 2;
      this.camera.bottom = -viewHeight / 2;
      this.camera.left = -viewHeight * aspect / 2;
      this.camera.right = viewHeight * aspect / 2;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height, false);
      this.composer?.setSize(width, height);
      this.bloomPass?.setSize(width, height);
    };
    this.resizeObserver = new ResizeObserver(resize);
    this.resizeObserver.observe(this.host);
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('orientationchange', resize, { passive: true });
    resize();
  }

  private animate = () => {
    const elapsed = this.clock.getElapsedTime();
    this.updateHoverState();
    this.biomeGroup.rotation.y += 0.0017;
    this.biomeGroup.rotation.x = Math.sin(elapsed * 0.17) * 0.06;
    this.linkGroup.rotation.copy(this.biomeGroup.rotation);

    const focus = this.nodes[this.focusIndex];
    const focalZ = focus?.target.z || 0;

    this.gears.forEach((gear, index) => {
      const target = gear.active ? 0.018 : 0.006;
      gear.group.rotation.z += target * (index % 2 ? -1 : 1);
      const activeScale = gear.active ? 1.08 : 1;
      const hoverScale = this.hoveredGear === gear || this.selectedGear === gear ? 1.08 : 1;
      const targetScale = this.profile.gearScale * this.profile.touchTargetScale * activeScale * hoverScale;
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
      material.opacity = THREE.MathUtils.lerp(0.18, 0.78, 1 - blurFactor) * archiveFactor;
      material.emissiveIntensity = THREE.MathUtils.lerp(0.08, 0.42, 1 - blurFactor);
      node.halo.material.opacity = THREE.MathUtils.lerp(0.12, 0.025, 1 - blurFactor) * archiveFactor;
      const bokehScale = THREE.MathUtils.lerp(3.8, 1.8, 1 - blurFactor);

      node.mesh.position.lerp(desired, 0.055);
      node.halo.position.copy(node.mesh.position);
      const pulse = 1 + Math.sin(elapsed * 2.4 + index) * 0.045;
      const hoverBoost = this.hovered === node ? 1.32 : 1;
      node.mesh.scale.setScalar(node.mapping.scale * pulse * age * hoverBoost * (1 - blurFactor * 0.18));
      node.halo.scale.setScalar(bokehScale * node.mapping.scale * (this.hovered === node ? 1.25 : 1));
      node.mesh.rotation.x += 0.006 + index * 0.0002;
      node.mesh.rotation.y += 0.009;
    });

    this.links.forEach((link, index) => {
      const wave = (Math.sin(elapsed * 2.8 + index * 0.65) + 1) / 2;
      link.material.opacity = 0.18 + wave * 0.34;
      link.material.emissiveIntensity = 0.7 + wave * 0.95;
      link.mesh.scale.setScalar(1 + wave * 0.045);
    });

    if (focus) {
      const desired = new THREE.Vector3(0, -0.42, this.profile.kind === 'mobile' ? 14.8 : 13.2).add(focus.target.clone().multiplyScalar(0.035));
      this.camera.position.lerp(desired, 0.016);
      this.camera.lookAt(focus.target.clone().multiplyScalar(0.045).add(new THREE.Vector3(0, -0.22, -1.35)));
    } else {
      this.camera.lookAt(0, -0.28, -1.35);
    }

    this.composer.render();
    this.rafId = requestAnimationFrame(this.animate);
  };

  private updateHoverState(): void {
    if (this.pointer.x > 2) return;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const gearHits = this.raycaster.intersectObjects(this.gearGroup.children, true);
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
    ctx.fillStyle = background;
    ctx.fillRect(12, 24, 488, 80);
    ctx.strokeStyle = 'rgba(61,42,21,0.58)';
    ctx.lineWidth = 2;
    ctx.strokeRect(12.5, 24.5, 487, 79);
    ctx.strokeStyle = 'rgba(240,211,150,0.20)';
    ctx.lineWidth = 1;
    ctx.strokeRect(22.5, 34.5, 467, 59);
    ctx.font = '900 31px "Courier New", "Courier", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255,238,190,0.16)';
    ctx.fillText(text, 258, 67);
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
