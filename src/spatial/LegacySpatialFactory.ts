import * as THREE from 'three';
import type { GearId } from './SpatialRenderer';

/**
 * Archived mechanical/steampunk gear factory from SpatialRenderer.
 *
 * The active renderer now uses `createHolographicPanel()` and `createPanelGear()`
 * in SpatialRenderer to keep the Data-Hub visual system decoupled from the
 * legacy procedural gear mesh. This file intentionally keeps the legacy logic as
 * commented reference only, so it does not affect bundle size or typecheck flow.
 */
export type LegacyGearFactoryContext = {
  createOxidizedMetalMaterial(color: number, emissive: number, cyanCatch?: number): THREE.MeshStandardMaterial;
  createTextSprite(text: string, color: string, background: string, density?: number): THREE.Sprite;
};

export const LEGACY_MECHANICAL_GEAR_FACTORY_NOTE = 'Archived for optional Steampunk/Mechanical mode restoration.';

/*
  private createGear(id: GearId, label: string, position: THREE.Vector3, radius: number, unlockedLevel: number): void {
    const group = new THREE.Group();
    group.position.copy(position);
    group.userData = { gearId: id, active: false, unlockedLevel };

    const bodyMat = this.createOxidizedMetalMaterial(0xb07038, 0x2b1608, 0.035);
    const face = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.18, 64), bodyMat);
    face.rotation.x = Math.PI / 2;
    face.userData = { gearId: id };
    group.add(face);

    const inner = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.48, 0.035, 10, 48), this.createOxidizedMetalMaterial(0xe0ab62, 0x3b230d, 0.018));
    inner.position.z = 0.105;
    group.add(inner);

    const outer = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.86, 0.045, 10, 64), this.createOxidizedMetalMaterial(0xc69a59, 0x33210d, 0.014));
    outer.position.z = 0.115;
    group.add(outer);

    const spokeMat = this.createOxidizedMetalMaterial(0x3b1b0d, 0x080301, 0.0);
    const spokeCount = radius > 0.9 ? 8 : 6;
    for (let i = 0; i < spokeCount; i++) {
      const a = (i / spokeCount) * Math.PI * 2;
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(radius * 0.62, 0.045, 0.055), spokeMat);
      spoke.position.set(Math.cos(a) * radius * 0.28, Math.sin(a) * radius * 0.28, 0.145);
      spoke.rotation.z = a;
      spoke.userData = { gearId: id };
      group.add(spoke);
    }

    const toothMat = this.createOxidizedMetalMaterial(0xbc7a3f, 0x2e1708, 0.025);
    const toothCount = Math.max(14, Math.round(radius * 24));
    for (let i = 0; i < toothCount; i++) {
      const a = (i / toothCount) * Math.PI * 2;
      const tooth = new THREE.Mesh(new THREE.BoxGeometry(radius * 0.12, radius * 0.24, 0.16), toothMat);
      tooth.position.set(Math.cos(a) * radius * 1.02, Math.sin(a) * radius * 1.02, 0);
      tooth.rotation.z = a;
      tooth.userData = { gearId: id };
      group.add(tooth);
    }

    const labelSprite = this.createTextSprite(label, '#fff0c4', 'rgba(28,16,8,0.82)', 1.2);
    labelSprite.position.set(0, 0, 0.32);
    labelSprite.scale.set(radius * 1.35, radius * 0.36, 1);
    group.add(labelSprite);

    group.traverse((obj) => { const mesh = obj as THREE.Mesh; if (mesh.isMesh) { mesh.castShadow = true; mesh.receiveShadow = true; } });
    this.gearRaycastObjects.push(group);
    this.gearGroup.add(group);
    const hit = this.createGearHitProxy(id, position.clone(), radius * 1.12);
    this.gears.push({ id, group, hit, anchor: position.clone(), eventType: GEAR_EVENT_TYPES[id], unlockedLevel, active: false, label: labelSprite });
  }

*/
