import * as THREE from 'three';

export type LayoutProfileId =
  | 'desktop-landscape'
  | 'tablet-landscape'
  | 'tablet-portrait'
  | 'mobile-landscape'
  | 'mobile-portrait';

export type ViewportMatrix = {
  cameraPosition: THREE.Vector3Tuple;
  cameraRotation: THREE.Vector3Tuple;
  focalPoint: THREE.Vector3Tuple;
  deskPlaneScale: number;
  orthographicZoom: number;
};

export type AnchorSpec = {
  /** Normalized viewport coordinate: 0..1 left-to-right. */
  u: number;
  /** Normalized viewport coordinate: 0..1 top-to-bottom. */
  v: number;
  /** Desk-local coordinate on the blueprint/paper plane. */
  world: THREE.Vector3Tuple;
  label: string;
};

export type LayoutMap = {
  gearCluster: AnchorSpec;
  schematicTitlePlate: AnchorSpec;
  telemetryGauges: {
    depth: AnchorSpec;
    signals: AnchorSpec;
    trace: AnchorSpec;
    pearls: AnchorSpec;
  };
  paperBounds: {
    min: THREE.Vector2Tuple;
    max: THREE.Vector2Tuple;
  };
};

export type WorkstationLayoutProfile = {
  id: LayoutProfileId;
  viewport: ViewportMatrix;
  anchors: LayoutMap;
};

/**
 * Liquid Memory Phase 1 composition constants.
 *
 * These are the stable camera/framing targets for the workstation GLB phase.
 * They intentionally describe the desired diorama composition without changing
 * runtime renderer behavior yet.
 */
export const WORKSTATION_LAYOUTS: Record<LayoutProfileId, WorkstationLayoutProfile> = {
  'desktop-landscape': {
    id: 'desktop-landscape',
    viewport: {
      cameraPosition: [0, -0.42, 13.2],
      cameraRotation: [0, 0, 0],
      focalPoint: [0, -0.28, -1.35],
      deskPlaneScale: 1.0,
      orthographicZoom: 1.08,
    },
    anchors: {
      gearCluster: { u: 0.5, v: 0.5, world: [0, 0, -1.18], label: 'Primary gear cluster' },
      schematicTitlePlate: { u: 0.5, v: 0.86, world: [0, -3.92, -1.06], label: 'Schematic v0.9 plate' },
      telemetryGauges: {
        depth: { u: 0.23, v: 0.84, world: [-3.2, -3.68, -1.03], label: 'Depth gauge' },
        signals: { u: 0.39, v: 0.84, world: [-1.06, -3.68, -1.03], label: 'Signals gauge' },
        trace: { u: 0.61, v: 0.84, world: [1.08, -3.68, -1.03], label: 'Trace gauge' },
        pearls: { u: 0.77, v: 0.84, world: [3.22, -3.68, -1.03], label: 'Pearls gauge' },
      },
      paperBounds: { min: [-6.2, -4.4], max: [6.2, 4.4] },
    },
  },
  'tablet-landscape': {
    id: 'tablet-landscape',
    viewport: {
      cameraPosition: [0, -0.42, 14.3],
      cameraRotation: [0, 0, 0],
      focalPoint: [0, -0.28, -1.35],
      deskPlaneScale: 0.92,
      orthographicZoom: 0.88,
    },
    anchors: {
      gearCluster: { u: 0.5, v: 0.56, world: [0, -0.42, -1.18], label: 'Primary gear cluster' },
      schematicTitlePlate: { u: 0.5, v: 0.86, world: [0, -3.82, -1.06], label: 'Schematic v0.9 plate' },
      telemetryGauges: {
        depth: { u: 0.16, v: 0.76, world: [-2.9, -2.15, -1.03], label: 'Depth gauge' },
        signals: { u: 0.84, v: 0.76, world: [2.9, -2.15, -1.03], label: 'Signals gauge' },
        trace: { u: 0.16, v: 0.22, world: [-2.9, 2.2, -1.03], label: 'Trace gauge' },
        pearls: { u: 0.84, v: 0.22, world: [2.9, 2.0, -1.03], label: 'Pearls gauge' },
      },
      paperBounds: { min: [-6.2, -4.4], max: [6.2, 4.4] },
    },
  },
  'tablet-portrait': {
    id: 'tablet-portrait',
    viewport: {
      cameraPosition: [0, -0.85, 14.3],
      cameraRotation: [0, 0, 0],
      focalPoint: [0, -0.35, -1.35],
      deskPlaneScale: 0.86,
      orthographicZoom: 0.62,
    },
    anchors: {
      gearCluster: { u: 0.5, v: 0.62, world: [0, -0.64, -1.18], label: 'Primary gear cluster' },
      schematicTitlePlate: { u: 0.5, v: 0.82, world: [0, -3.82, -1.06], label: 'Schematic v0.9 plate' },
      telemetryGauges: {
        depth: { u: 0.2, v: 0.18, world: [-3.0, 3.25, -1.03], label: 'Depth gauge' },
        signals: { u: 0.4, v: 0.18, world: [-1.0, 3.25, -1.03], label: 'Signals gauge' },
        trace: { u: 0.6, v: 0.18, world: [1.0, 3.25, -1.03], label: 'Trace gauge' },
        pearls: { u: 0.8, v: 0.18, world: [3.0, 3.25, -1.03], label: 'Pearls gauge' },
      },
      paperBounds: { min: [-6.2, -4.4], max: [6.2, 4.4] },
    },
  },
  'mobile-landscape': {
    id: 'mobile-landscape',
    viewport: {
      cameraPosition: [0, -0.72, 14.4],
      cameraRotation: [0, 0, 0],
      focalPoint: [0, -0.32, -1.35],
      deskPlaneScale: 0.78,
      orthographicZoom: 0.64,
    },
    anchors: {
      gearCluster: { u: 0.5, v: 0.6, world: [0, -0.85, -1.18], label: 'Primary gear cluster' },
      schematicTitlePlate: { u: 0.5, v: 0.84, world: [0, -3.72, -1.06], label: 'Schematic v0.9 plate' },
      telemetryGauges: {
        depth: { u: 0.16, v: 0.72, world: [-2.9, -2.15, -1.03], label: 'Depth gauge' },
        signals: { u: 0.84, v: 0.72, world: [2.9, -2.15, -1.03], label: 'Signals gauge' },
        trace: { u: 0.16, v: 0.22, world: [-2.9, 2.2, -1.03], label: 'Trace gauge' },
        pearls: { u: 0.84, v: 0.22, world: [2.9, 2.0, -1.03], label: 'Pearls gauge' },
      },
      paperBounds: { min: [-6.2, -4.4], max: [6.2, 4.4] },
    },
  },
  'mobile-portrait': {
    id: 'mobile-portrait',
    viewport: {
      cameraPosition: [0, -0.85, 14.8],
      cameraRotation: [0, 0, 0],
      focalPoint: [0, -0.38, -1.35],
      deskPlaneScale: 0.72,
      orthographicZoom: 0.74,
    },
    anchors: {
      gearCluster: { u: 0.5, v: 0.66, world: [0, -1.55, -1.18], label: 'Thumb-reachable primary gear cluster' },
      schematicTitlePlate: { u: 0.5, v: 0.84, world: [0, -3.82, -1.06], label: 'Schematic v0.9 plate' },
      telemetryGauges: {
        depth: { u: 0.2, v: 0.18, world: [-3.0, 3.25, -1.03], label: 'Depth gauge' },
        signals: { u: 0.4, v: 0.18, world: [-1.0, 3.25, -1.03], label: 'Signals gauge' },
        trace: { u: 0.6, v: 0.18, world: [1.0, 3.25, -1.03], label: 'Trace gauge' },
        pearls: { u: 0.8, v: 0.18, world: [3.0, 3.25, -1.03], label: 'Pearls gauge' },
      },
      paperBounds: { min: [-6.2, -4.4], max: [6.2, 4.4] },
    },
  },
};

export function resolveLayoutProfile(kind: string, orientation: string): WorkstationLayoutProfile {
  const id = `${kind}-${orientation}` as LayoutProfileId;
  return WORKSTATION_LAYOUTS[id] || WORKSTATION_LAYOUTS['desktop-landscape'];
}

/**
 * Optional visual validation helper. It renders paper bounds and crosshairs at
 * the anchor points. This is intentionally not wired into production by default.
 */
export function drawLayoutGuides(scene: THREE.Scene, profile: WorkstationLayoutProfile): THREE.Group {
  const group = new THREE.Group();
  group.name = `layout_guides_${profile.id}`;

  const guideMaterial = new THREE.LineBasicMaterial({ color: 0x6ef4e5, transparent: true, opacity: 0.72 });
  const [minX, minY] = profile.anchors.paperBounds.min;
  const [maxX, maxY] = profile.anchors.paperBounds.max;
  const z = -0.92;
  const bounds = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(minX, minY, z),
    new THREE.Vector3(maxX, minY, z),
    new THREE.Vector3(maxX, maxY, z),
    new THREE.Vector3(minX, maxY, z),
    new THREE.Vector3(minX, minY, z),
  ]);
  group.add(new THREE.Line(bounds, guideMaterial));

  const anchors: AnchorSpec[] = [
    profile.anchors.gearCluster,
    profile.anchors.schematicTitlePlate,
    ...Object.values(profile.anchors.telemetryGauges),
  ];

  anchors.forEach((anchor) => {
    const [x, y, az] = anchor.world;
    const size = anchor === profile.anchors.gearCluster ? 0.42 : 0.24;
    const horizontal = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x - size, y, az + 0.18),
      new THREE.Vector3(x + size, y, az + 0.18),
    ]);
    const vertical = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x, y - size, az + 0.18),
      new THREE.Vector3(x, y + size, az + 0.18),
    ]);
    group.add(new THREE.Line(horizontal, guideMaterial));
    group.add(new THREE.Line(vertical, guideMaterial));
  });

  scene.add(group);
  return group;
}
