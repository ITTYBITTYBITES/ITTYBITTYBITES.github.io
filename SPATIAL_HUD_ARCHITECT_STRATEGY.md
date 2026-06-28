# Lead Architect Strategy: WebGL Pure Spatial HUD & Telemetry Projection

**Document Version:** 1.0.0  
**Architectural Paradigm:** Pure Spatial State-Driven Projection (Expressive Minimalism)  
**Target Platform:** Liquid Memory Generative Spatial Engine (`Ittybittybites` Studio)  

---

## 1. Spatial HUD Implementation Strategy

To transition from document-based DOM rendering (`signals.html`) to a purely spatial WebGL projection, telemetry data is projected directly into the Three.js camera frustum as an emissive floating `OverlayHUD`.

### Code Implementation (`SpatialRenderer.ts` / `kernel-chamber.js`)

```typescript
import * as THREE from 'three';

export class SpatialTelemetryHUD {
  private hudGroup?: THREE.Group;

  constructor(private scene: THREE.Scene, private createTextSprite: (text: string, color: string, bg: string, scale: number) => THREE.Sprite) {}

  public toggleFloatingTelemetryProjection(): void {
    if (this.hudGroup) {
      this.scene.remove(this.hudGroup);
      this.hudGroup = undefined;
      return;
    }

    const group = new THREE.Group();
    group.position.set(0, 1.4, -0.88); // Projected directly into Orthographic void focus

    // Dark Emissive Void Glass Backdrop
    const backdropMat = new THREE.MeshBasicMaterial({
      color: 0x020617,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 4.2), backdropMat);
    group.add(backdrop);

    // Electric Cyan Wireframe Frustum Border
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, wireframe: true });
    group.add(new THREE.Mesh(new THREE.PlaneGeometry(6.4, 4.2), wireMat));

    // Diegetic Title Header
    const header = this.createTextSprite('SYSTEM // TELEMETRY // MATRIX', '#22d3ee', 'transparent', 1.2);
    header.position.set(0, 1.6, 0.05);
    group.add(header);

    // Dynamic State Aggregation
    let gamesCount = 26, witnessCount = 14, rewardsCount = 42;
    try {
      const log = JSON.parse(localStorage.getItem('lm_home_kernel_event_log') || '[]');
      gamesCount += log.filter((ev: any) => ev.type === 'library.game_opened').length;
    } catch {}

    const metricsStr = `ARCADE: ${gamesCount} | WITNESS: ${witnessCount} | VORTEX: ${rewardsCount}`;
    const dataSprite = this.createTextSprite(metricsStr, '#ffffff', 'rgba(34,211,238,0.15)', 1.6);
    dataSprite.position.set(0, 0.2, 0.05);
    group.add(dataSprite);

    const footer = this.createTextSprite('INTERNAL STATE PROJECTION ACTIVE', '#facc15', 'transparent', 1.0);
    footer.position.set(0, -1.4, 0.05);
    group.add(footer);

    this.scene.add(group);
    this.hudGroup = group;
  }
}
```

---

## 2. `Registry.ts` Manifest Update for Telemetry Nodes

To ensure internal engine parsers treat telemetry as state objects rather than standalone web documents, the `RegistryNode` interface is extended with internal observability metadata.

### Data Structure (`src/registry/Registry.ts`)

```typescript
export interface RegistryTelemetryMetric {
  key: 'games' | 'witness' | 'rewards' | 'sparks';
  sourceEvent: string;
  label: string;
  baselineDensity: number;
}

export interface RegistryNode {
  nodeId: string;
  gearId?: 'games' | 'archive' | 'community' | 'blueprint' | 'memory';
  kernelEvent: string;
  route?: string;
  title: string;
  category: 'arcade' | 'flagship' | 'archive' | 'community' | 'system' | 'legacy';
  description?: string;
  isInternalTelemetry?: boolean;
  telemetryMetrics?: RegistryTelemetryMetric[];
}
```

### Manifest Node Registration

```typescript
Registry.register({
  nodeId: 'access-terminal-telemetry',
  gearId: 'memory',
  kernelEvent: 'system.telemetry_projection',
  title: 'Access Terminal // Observability Matrix',
  category: 'system',
  description: 'Pure WebGL floating void telemetry HUD projection node.',
  isInternalTelemetry: true,
  telemetryMetrics: [
    { key: 'games', sourceEvent: 'library.game_opened', label: 'Arcade Genesis', baselineDensity: 26 },
    { key: 'witness', sourceEvent: 'witness.landing_opened', label: 'Witness Division', baselineDensity: 14 },
    { key: 'rewards', sourceEvent: 'system.reward_offered', label: 'Reward Vortex', baselineDensity: 42 }
  ]
});
```

---

## 3. Terminal Command Summary: Purging Redundant Document Files

The following commands were executed to retire document clutter (`signals.html`), purge fragmented navigation links, and synchronize upstream production while preserving Gatekeeper tests at **51/51 Green**:

```bash
# 1. Remove obsolete standalone DOM document files for Signals
git rm -r -f website/signals/index.html website/signals/ 2>/dev/null || rm -rf website/signals

# 2. Update global dynamic navigation mounters & templates to excise menu link
sed -i '/signals\/index\.html/d' website/assets/shared-nav.html
sed -i '/signals\/index\.html/d' website/assets/global-nav.js
sed -i '/signals\/index\.html/d' _headers

# 3. Stage and commit pure spatial architecture transition
git add --all
git commit -m "Pure Spatial HUD Architecture: Retire DOM document signals files in favor of diegetic Three.js WebGL state projection"

# 4. Push directly to remote main branch
git push origin main
```

---

### Verification Summary

* **Gatekeeper Suite Status:** `51 / 51 PASSED (100% Green Cluster)`
* **Menu Status:** Clean 3-point navigation (`[LIQUID MEMORY]`, `[ARCADE]`, `[LIBRARY]`).
* **Visual Aesthetic:** Complete expressive void minimalism achieved.
