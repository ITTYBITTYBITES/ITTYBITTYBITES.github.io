export type DeviceKind = 'mobile' | 'tablet' | 'desktop';
export type OrientationKind = 'portrait' | 'landscape';

export type ResponsiveProfile = {
  kind: DeviceKind;
  orientation: OrientationKind;
  gearScale: number;
  gearPosition: { x: number; y: number; z: number };
  gaugeMode: 'topbar' | 'side-panels' | 'compact-corners';
  camera: { x: number; y: number; z: number; fov: number };
  starCount: number;
  linkSegments: number;
  linkRadialSegments: number;
  geometryDetail: number;
  touchTargetScale: number;
};

export class ResponsiveEngine {
  private listeners = new Set<(profile: ResponsiveProfile) => void>();
  private profile: ResponsiveProfile;

  constructor() {
    this.profile = this.measure();
    window.addEventListener('resize', this.handleResize, { passive: true });
    window.addEventListener('orientationchange', this.handleResize, { passive: true });
  }

  getProfile(): ResponsiveProfile {
    return this.profile;
  }

  subscribe(listener: (profile: ResponsiveProfile) => void): () => void {
    this.listeners.add(listener);
    listener(this.profile);
    return () => this.listeners.delete(listener);
  }

  dispose(): void {
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('orientationchange', this.handleResize);
    this.listeners.clear();
  }

  private handleResize = () => {
    const next = this.measure();
    const changed = JSON.stringify(next) !== JSON.stringify(this.profile);
    this.profile = next;
    if (changed) this.listeners.forEach((listener) => listener(this.profile));
  };

  private measure(): ResponsiveProfile {
    const width = window.innerWidth || 1024;
    const height = window.innerHeight || 768;
    const min = Math.min(width, height);
    const max = Math.max(width, height);
    const orientation: OrientationKind = height >= width ? 'portrait' : 'landscape';
    const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false;

    let kind: DeviceKind = 'desktop';
    if (coarse && min < 700) kind = 'mobile';
    else if (coarse || max < 1180) kind = 'tablet';

    if (kind === 'mobile' && orientation === 'portrait') {
      return {
        kind,
        orientation,
        gearScale: 0.86,
        gearPosition: { x: 0, y: -2.25, z: -1.18 },
        gaugeMode: 'topbar',
        camera: { x: 0, y: 4.9, z: 15.8, fov: 54 },
        starCount: 92,
        linkSegments: 12,
        linkRadialSegments: 5,
        geometryDetail: 0,
        touchTargetScale: 1.38,
      };
    }

    if (kind === 'mobile') {
      return {
        kind,
        orientation,
        gearScale: 0.72,
        gearPosition: { x: 0, y: -1.15, z: -1.18 },
        gaugeMode: 'compact-corners',
        camera: { x: 0, y: 4.2, z: 14.4, fov: 52 },
        starCount: 110,
        linkSegments: 14,
        linkRadialSegments: 5,
        geometryDetail: 0,
        touchTargetScale: 1.32,
      };
    }

    if (kind === 'tablet') {
      return {
        kind,
        orientation,
        gearScale: orientation === 'portrait' ? 0.9 : 0.86,
        gearPosition: { x: 0, y: orientation === 'portrait' ? -1.05 : -0.55, z: -1.18 },
        gaugeMode: orientation === 'portrait' ? 'topbar' : 'compact-corners',
        camera: { x: 0, y: 4.65, z: 14.3, fov: 50 },
        starCount: 155,
        linkSegments: 20,
        linkRadialSegments: 7,
        geometryDetail: 1,
        touchTargetScale: 1.18,
      };
    }

    return {
      kind,
      orientation,
      gearScale: 1,
      gearPosition: { x: 0, y: 0, z: -1.18 },
      gaugeMode: 'side-panels',
      camera: { x: 0, y: 4.7, z: 13.5, fov: 48 },
      starCount: 260,
      linkSegments: 30,
      linkRadialSegments: 9,
      geometryDetail: 2,
      touchTargetScale: 1,
    };
  }
}
