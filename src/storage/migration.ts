import { SAVE_VERSION } from './types';

/**
 * Save Version Migration Framework
 * Version 2: Adds identity fields (generation, parents, traits, lineage) to plants and creatures.
 * Migration is defensive: if fields missing, default values applied; never corrupts data.
 */

export function migrateWorld(data: any, targetVersion = 2): any {
  if (!data || typeof data !== 'object') return data;
  const currentVersion = data.saveVersion ?? 1;
  if (currentVersion >= targetVersion) return data;

  // Create a shallow copy to avoid mutating the original unexpectedly
  const migrated = { ...data, saveVersion: targetVersion };

  // Ensure identity fields exist for plants
  if (Array.isArray(migrated.plants)) {
    migrated.plants = migrated.plants.map((p: any) => ({
      ...p,
      id: p.id ?? `plant_${Math.random().toString(36).slice(2, 8)}`,
      generation: p.generation ?? 1,
      parents: p.parents ?? [],
      traits: p.traits ?? [],
      lineage: p.lineage ?? [],
    }));
  }

  // Ensure identity fields exist for creatures
  if (Array.isArray(migrated.creatures)) {
    migrated.creatures = migrated.creatures.map((c: any) => ({
      ...c,
      id: c.id ?? `creature_${Math.random().toString(36).slice(2, 8)}`,
      generation: c.generation ?? 1,
      parents: c.parents ?? [],
      traits: c.traits ?? [],
      lineage: c.lineage ?? [],
      personality: c.personality ?? ['curious'],
    }));
  }

  // Preserve settings, stats, flags, photos references
  if (migrated.settings && typeof migrated.settings === 'object') {
    migrated.settings = { ...migrated.settings };
  }
  if (migrated.stats && typeof migrated.stats === 'object') {
    migrated.stats = { ...migrated.stats };
  }

  return migrated;
}

export function isValidSave(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  if (typeof data.simTime !== 'number') return false;
  if (!Array.isArray(data.plants)) return false;
  if (!Array.isArray(data.creatures)) return false;
  return true;
}

export function safeLoad(rawData: any): any {
  try {
    const parsed = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
    if (!isValidSave(parsed)) {
      return null; // Corrupted or incompatible
    }
    return migrateWorld(parsed, SAVE_VERSION);
  } catch {
    return null; // Corrupted JSON or migration failure
  }
}
