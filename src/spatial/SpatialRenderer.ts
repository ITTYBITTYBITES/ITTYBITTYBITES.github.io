import * as THREE from 'three';
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
  private camera = new THREE.PerspectiveCamera(48, 1, 0.1, 1000);
  private renderer: THREE.WebGLRenderer;
  private biomeGroup = new THREE.Group();
  private linkGroup = new THREE.Group();
  private gearGroup = new THREE.Group();
  private gaugeGroup = new THREE.Group();
  private nodes: SpatialNode[] = [];
  private links: LiquidLink[] = [];
  private gears: GearAssembly[] = [];
  private gauges: Gauge[] = [];
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
    this.renderer.domElement.className = 'kernel-spatial-webgl';
    this.renderer.domElement.setAttribute('aria-label', 'Liquid Memory generative spatial ecosystem');
    this.host.appendChild(this.renderer.domElement);

    this.scene.add(this.linkGroup);
    this.scene.add(this.biomeGroup);
    this.scene.add(this.gearGroup);
    this.scene.add(this.gaugeGroup);
    this.applyCameraProfile(this.profile, true);

    const ambient = new THREE.AmbientLight(0xd7c2a1, 1.06);
    const key = new THREE.PointLight(0x6ef4e5, 2.8, 44);
    key.position.set(6, 8, 8);
    const lantern = new THREE.PointLight(0xd7b36a, 2.15, 36);
    lantern.position.set(-5, 4, 7);
    const rim = new THREE.PointLight(0x95e0bc, 1.15, 46);
    rim.position.set(2, -4, 9);
    this.scene.add(ambient, key, lantern, rim);

    this.createStarfield();
    this.createBlueprintGearRig();
    this.createGauges();
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

    const halo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: this.haloTexture,
      color: mapping.color,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }));
    halo.position.copy(mesh.position);
    halo.scale.setScalar(2.2 * mapping.scale);

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
    this.camera.fov = profile.camera.fov;
    this.camera.updateProjectionMatrix();
    const target = new THREE.Vector3(profile.camera.x, profile.camera.y, profile.camera.z);
    if (instant) this.camera.position.copy(target);
    else this.camera.position.lerp(target, 0.2);
    this.camera.lookAt(0, 0, 0);
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
      gauge.sprite.position.set(point[0], point[1], 0.7);
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

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x5a3c21, emissive: 0x1a0e08, metalness: 0.86, roughness: 0.22 });
    const face = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.18, 64), bodyMat);
    face.rotation.x = Math.PI / 2;
    face.userData = { gearId: id };
    group.add(face);

    const inner = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.48, 0.035, 10, 48), new THREE.MeshStandardMaterial({ color: 0xd7b36a, emissive: 0x2e2110, metalness: 0.76, roughness: 0.18 }));
    inner.position.z = 0.105;
    group.add(inner);

    const outer = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.86, 0.045, 10, 64), new THREE.MeshStandardMaterial({ color: 0x6ef4e5, emissive: 0x0d4540, emissiveIntensity: 0.45, metalness: 0.68, roughness: 0.16 }));
    outer.position.z = 0.115;
    group.add(outer);

    const toothMat = new THREE.MeshStandardMaterial({ color: 0x8a633a, emissive: 0x20140a, metalness: 0.82, roughness: 0.2 });
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

    this.gearGroup.add(group);
    this.gears.push({ id, group, hit: face, anchor: position.clone(), eventType: GEAR_EVENT_TYPES[id], unlockedLevel, active: false, label: labelSprite });
  }

  private createGauges(): void {
    const specs = [
      ['depth', 'DEPTH 1', -3.4, 1.75],
      ['signals', 'SIGNALS 0', 3.35, 1.55],
      ['trace', 'TRACE 0', -3.15, -2.05],
      ['pearls', 'PEARLS 0', 3.12, -2.0],
    ] as const;
    specs.forEach(([key, text, x, y]) => {
      const sprite = this.createTextSprite(text, '#6ef4e5', 'rgba(18,15,11,0.62)', 1.0);
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
    gauge.sprite.material.map = this.createTextTexture(value, '#6ef4e5', 'rgba(18,15,11,0.62)');
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
      emissiveIntensity: 0.86,
      metalness: 0.72,
      roughness: 0.18,
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
      opacity: 0.42,
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
    const material = new THREE.PointsMaterial({ color: 0xbfa777, size: 0.035, transparent: true, opacity: 0.58 });
    this.scene.add(new THREE.Points(geometry, material));
  }

  private bindResize(): void {
    const resize = () => {
      const rect = this.host.getBoundingClientRect();
      const width = Math.max(320, rect.width || window.innerWidth);
      const height = Math.max(320, rect.height || window.innerHeight);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height, false);
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
      material.opacity = THREE.MathUtils.lerp(0.24, 0.96, 1 - blurFactor) * archiveFactor;
      material.emissiveIntensity = THREE.MathUtils.lerp(0.22, 1.08, 1 - blurFactor);
      node.halo.material.opacity = THREE.MathUtils.lerp(0.32, 0.08, 1 - blurFactor) * archiveFactor;
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
      const desired = focus.target.clone().multiplyScalar(0.2).add(new THREE.Vector3(this.profile.camera.x, this.profile.camera.y - 0.8, this.profile.camera.z - 1.3));
      this.camera.position.lerp(desired, 0.018);
      this.camera.lookAt(focus.target.clone().multiplyScalar(0.18));
    } else {
      this.camera.lookAt(0, 0, 0);
    }

    this.renderer.render(this.scene, this.camera);
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
    this.renderer.domElement.style.cursor = this.hoveredGear || this.hovered ? 'grab' : 'crosshair';
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
    this.roundRect(ctx, 12, 22, 488, 84, 30);
    ctx.fill();
    ctx.strokeStyle = 'rgba(110,244,229,0.32)';
    ctx.lineWidth = 3;
    this.roundRect(ctx, 12, 22, 488, 84, 30);
    ctx.stroke();
    ctx.font = '900 34px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
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
