import * as THREE from 'three';
import type { EventContract, PlatformState } from '../kernel';
import { BIOME_EVENT_MAP, DEFAULT_BIOME_MAPPING, type BiomeMapping } from './biome.config';

type SpatialNode = {
  id: string;
  eventType: string;
  mesh: THREE.Mesh;
  target: THREE.Vector3;
  createdAt: number;
  mapping: BiomeMapping;
};

export class SpatialRenderer {
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(48, 1, 0.1, 1000);
  private renderer: THREE.WebGLRenderer;
  private group = new THREE.Group();
  private lineGroup = new THREE.Group();
  private nodes: SpatialNode[] = [];
  private frame = 0;
  private resizeObserver?: ResizeObserver;
  private rafId = 0;
  private focusIndex = -1;
  private readonly clock = new THREE.Clock();

  constructor(private host: HTMLElement, private liveRegion?: HTMLElement | null) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.domElement.className = 'kernel-spatial-webgl';
    this.renderer.domElement.setAttribute('aria-label', 'Generative 3D Kernel spatial ecosystem');
    this.host.appendChild(this.renderer.domElement);

    this.scene.add(this.group);
    this.scene.add(this.lineGroup);
    this.camera.position.set(0, 4.5, 12);
    this.camera.lookAt(0, 0, 0);

    const ambient = new THREE.AmbientLight(0x9fb8ff, 1.15);
    const key = new THREE.PointLight(0x5fe8ff, 2.4, 38);
    key.position.set(6, 8, 8);
    const rim = new THREE.PointLight(0xff5ee7, 1.7, 42);
    rim.position.set(-7, -3, 6);
    this.scene.add(ambient, key, rim);

    this.createStarfield();
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
    this.group.add(mesh);

    const node: SpatialNode = { id: event.eventId, eventType: event.type, mesh, target, createdAt: performance.now(), mapping };
    this.nodes.push(node);
    this.connectToPrevious(node);
    this.updateHud(event, mapping);
    this.focusIndex = this.nodes.length - 1;

    while (this.nodes.length > 42) {
      const old = this.nodes.shift();
      if (old) this.group.remove(old.mesh);
    }
  }

  updateFromState(state: PlatformState): void {
    const level = state.player.level || 1;
    this.group.rotation.y += Math.min(level, 20) * 0.00035;
    this.group.scale.setScalar(1 + Math.min(state.system.eventCount, 80) * 0.0025);
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
      case 'growth-node': return new THREE.IcosahedronGeometry(0.74, 1);
      case 'resource-crystal': return new THREE.OctahedronGeometry(0.66, 0);
      case 'reward-orb': return new THREE.SphereGeometry(0.58, 28, 18);
      case 'heartbeat-ring': return new THREE.TorusGeometry(0.58, 0.055, 12, 56);
      default: return new THREE.TetrahedronGeometry(0.72, 0);
    }
  }

  private createMaterial(mapping: BiomeMapping): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: mapping.color,
      emissive: mapping.emissive,
      emissiveIntensity: 0.85,
      metalness: 0.48,
      roughness: 0.24,
      transparent: true,
      opacity: 0.94,
    });
  }

  private computePosition(index: number, pull: number): THREE.Vector3 {
    if (index === 0) return new THREE.Vector3(0, 0, 0);
    const golden = Math.PI * (3 - Math.sqrt(5));
    const radius = 1.4 + Math.sqrt(index) * 1.14 * pull;
    const angle = index * golden;
    const branch = Math.floor(index / 7);
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = Math.sin(index * 0.72) * 1.35 + branch * 0.22;
    return new THREE.Vector3(x, y, z);
  }

  private connectToPrevious(node: SpatialNode): void {
    const prev = this.nodes.length > 1 ? this.nodes[this.nodes.length - 2] : null;
    if (!prev) return;
    const points = [prev.target, node.target];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: node.mapping.color, transparent: true, opacity: 0.32 });
    const line = new THREE.Line(geometry, material);
    this.lineGroup.add(line);
    while (this.lineGroup.children.length > 48) this.lineGroup.remove(this.lineGroup.children[0]);
  }

  private createStarfield(): void {
    const geometry = new THREE.BufferGeometry();
    const verts: number[] = [];
    for (let i = 0; i < 220; i++) {
      verts.push((Math.random() - 0.5) * 44, (Math.random() - 0.5) * 24, (Math.random() - 0.5) * 44);
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    const material = new THREE.PointsMaterial({ color: 0x8fa7ff, size: 0.035, transparent: true, opacity: 0.62 });
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
    this.group.rotation.y += 0.0022;
    this.group.rotation.x = Math.sin(elapsed * 0.17) * 0.08;
    this.lineGroup.rotation.copy(this.group.rotation);

    this.nodes.forEach((node, index) => {
      const age = Math.min(1, (performance.now() - node.createdAt) / 620);
      node.mesh.position.lerp(node.target, 0.055);
      const pulse = 1 + Math.sin(elapsed * 2.4 + index) * 0.045;
      node.mesh.scale.setScalar(node.mapping.scale * pulse * age);
      node.mesh.rotation.x += 0.006 + index * 0.0002;
      node.mesh.rotation.y += 0.009;
    });

    const focus = this.nodes[this.focusIndex];
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

  private updateHud(event: EventContract, mapping: BiomeMapping): void {
    this.host.dataset.nodes = String(this.nodes.length);
    this.host.dataset.lastEvent = event.type;
    if (this.liveRegion) {
      this.liveRegion.textContent = `${mapping.label}: ${event.type}`;
    }
  }
}
