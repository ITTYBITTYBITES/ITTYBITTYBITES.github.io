import * as THREE from 'three';
import type { EventContract, PlatformState } from '../kernel';
import { BIOME_EVENT_MAP, DEFAULT_BIOME_MAPPING, type BiomeMapping } from './biome.config';

type SpatialNode = {
  id: string;
  eventType: string;
  mesh: THREE.Mesh;
  halo: THREE.Sprite;
  target: THREE.Vector3;
  home: THREE.Vector3;
  createdAt: number;
  mapping: BiomeMapping;
};

type LiquidLink = {
  mesh: THREE.Mesh;
  material: THREE.MeshStandardMaterial;
  createdAt: number;
};

export class SpatialRenderer {
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(48, 1, 0.1, 1000);
  private renderer: THREE.WebGLRenderer;
  private group = new THREE.Group();
  private linkGroup = new THREE.Group();
  private nodes: SpatialNode[] = [];
  private links: LiquidLink[] = [];
  private resizeObserver?: ResizeObserver;
  private rafId = 0;
  private focusIndex = -1;
  private hovered?: SpatialNode;
  private pointer = new THREE.Vector2(99, 99);
  private raycaster = new THREE.Raycaster();
  private readonly clock = new THREE.Clock();
  private readonly haloTexture = this.createHaloTexture();

  constructor(private host: HTMLElement, private liveRegion?: HTMLElement | null) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.domElement.className = 'kernel-spatial-webgl';
    this.renderer.domElement.setAttribute('aria-label', 'Liquid Memory generative spatial ecosystem');
    this.host.appendChild(this.renderer.domElement);

    this.scene.add(this.group);
    this.scene.add(this.linkGroup);
    this.camera.position.set(0, 4.5, 12);
    this.camera.lookAt(0, 0, 0);

    const ambient = new THREE.AmbientLight(0xd7c2a1, 1.05);
    const key = new THREE.PointLight(0x6ef4e5, 2.7, 42);
    key.position.set(6, 8, 8);
    const rim = new THREE.PointLight(0xd7b36a, 1.75, 46);
    rim.position.set(-7, -3, 6);
    this.scene.add(ambient, key, rim);

    this.createStarfield();
    this.bindPointer();
    this.bindResize();
    this.animate();
  }

  handle(event: EventContract): void {
    if (event.type === 'system.heartbeat' && this.nodes.length > 0) return;
    const mapping = BIOME_EVENT_MAP[event.type] || DEFAULT_BIOME_MAPPING;
    const index = this.nodes.length;
    const target = this.computePosition(index, mapping.pull);
    const mesh = new THREE.Mesh(this.createGeometry(mapping), this.createMaterial(mapping));
    mesh.position.copy(target.clone().multiplyScalar(0.15));
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

    this.group.add(mesh);
    this.group.add(halo);

    const node: SpatialNode = { id: event.eventId, eventType: event.type, mesh, halo, target: target.clone(), home: target.clone(), createdAt: performance.now(), mapping };
    this.nodes.push(node);
    this.archiveOldMemories();
    this.connectToPrevious(node);
    this.updateHud(event, mapping);
    this.focusIndex = this.nodes.length - 1;

    while (this.nodes.length > 54) {
      const old = this.nodes.shift();
      if (old) {
        this.group.remove(old.mesh);
        this.group.remove(old.halo);
      }
    }
  }

  updateFromState(state: PlatformState): void {
    const level = state.player.level || 1;
    this.group.rotation.y += Math.min(level, 20) * 0.0003;
    this.group.scale.setScalar(1 + Math.min(state.system.eventCount, 100) * 0.002);
  }

  focusNext(): void {
    if (!this.nodes.length) return;
    this.focusIndex = (this.focusIndex + 1) % this.nodes.length;
  }

  getNodeCount(): number {
    return this.nodes.length;
  }

  dispose(): void {
    cancelAnimationFrame(this.rafId);
    this.resizeObserver?.disconnect();
    this.renderer.dispose();
    this.host.innerHTML = '';
  }

  private createGeometry(mapping: BiomeMapping): THREE.BufferGeometry {
    switch (mapping.geometry) {
      case 'growth-node': return new THREE.IcosahedronGeometry(0.74, 2);
      case 'resource-crystal': return new THREE.OctahedronGeometry(0.66, 0);
      case 'reward-orb': return new THREE.SphereGeometry(0.58, 32, 20);
      case 'heartbeat-ring': return new THREE.TorusGeometry(0.58, 0.055, 14, 64);
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

  private computePosition(index: number, pull: number): THREE.Vector3 {
    if (index === 0) return new THREE.Vector3(0, 0, 0);
    const golden = Math.PI * (3 - Math.sqrt(5));
    const radius = 1.25 + Math.sqrt(index) * 1.08 * pull;
    const angle = index * golden;
    const branch = Math.floor(index / 7);
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius + branch * 0.36;
    const y = Math.sin(index * 0.72) * 1.25 + branch * 0.22;
    return new THREE.Vector3(x, y, z);
  }

  private connectToPrevious(node: SpatialNode): void {
    const prev = this.nodes.length > 1 ? this.nodes[this.nodes.length - 2] : null;
    if (!prev) return;
    const mid = prev.target.clone().lerp(node.target, 0.5);
    mid.y += 0.4 * Math.sin(this.nodes.length * 1.7);
    const curve = new THREE.CatmullRomCurve3([prev.target, mid, node.target]);
    const geometry = new THREE.TubeGeometry(curve, 28, 0.025 + node.mapping.pull * 0.006, 8, false);
    const material = new THREE.MeshStandardMaterial({
      color: node.mapping.color,
      emissive: node.mapping.emissive,
      emissiveIntensity: 1.15,
      metalness: 0.55,
      roughness: 0.2,
      transparent: true,
      opacity: 0.42,
    });
    const mesh = new THREE.Mesh(geometry, material);
    this.linkGroup.add(mesh);
    this.links.push({ mesh, material, createdAt: performance.now() });
    while (this.links.length > 64) {
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
    };
    this.renderer.domElement.addEventListener('pointermove', update, { passive: true });
    this.renderer.domElement.addEventListener('pointerleave', () => {
      this.pointer.set(99, 99);
      this.hovered = undefined;
    });
  }

  private createStarfield(): void {
    const geometry = new THREE.BufferGeometry();
    const verts: number[] = [];
    for (let i = 0; i < 240; i++) {
      verts.push((Math.random() - 0.5) * 44, (Math.random() - 0.5) * 24, (Math.random() - 0.5) * 44);
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    const material = new THREE.PointsMaterial({ color: 0xbfa777, size: 0.035, transparent: true, opacity: 0.58 });
    this.scene.add(new THREE.Points(geometry, material));
  }

  private bindResize(): void {
    const resize = () => {
      const rect = this.host.getBoundingClientRect();
      const width = Math.max(320, rect.width);
      const height = Math.max(320, rect.height || 460);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height, false);
    };
    this.resizeObserver = new ResizeObserver(resize);
    this.resizeObserver.observe(this.host);
    resize();
  }

  private animate = () => {
    const elapsed = this.clock.getElapsedTime();
    this.updateHoverState();
    this.group.rotation.y += 0.0019;
    this.group.rotation.x = Math.sin(elapsed * 0.17) * 0.075;
    this.linkGroup.rotation.copy(this.group.rotation);

    const focus = this.nodes[this.focusIndex];
    const focalZ = focus?.target.z || 0;

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
      const desired = focus.target.clone().multiplyScalar(0.18).add(new THREE.Vector3(0, 4.6, 11.5));
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
    const intersects = this.raycaster.intersectObjects(this.nodes.map((node) => node.mesh), false);
    this.hovered = intersects[0]
      ? this.nodes.find((node) => node.mesh === intersects[0].object)
      : undefined;
    this.renderer.domElement.style.cursor = this.hovered ? 'grab' : 'crosshair';
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
}
