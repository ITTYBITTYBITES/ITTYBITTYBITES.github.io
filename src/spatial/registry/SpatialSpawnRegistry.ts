import type { EventContract } from '../../kernel';
import {
  SPATIAL_SPAWN_REGISTRY,
  type BiomeMapping,
  type SpatialNodeDefinition,
} from '../biome.config';

export { type BiomeMapping, type SpatialNodeDefinition } from '../biome.config';

export enum SpawnTier {
  LOW = 'low',
  STANDARD = 'standard',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export type SpatialSpawnContext = {
  userTrace?: number;
  playerLevel?: number;
  eventCount?: number;
};

export interface SpatialSpawnRegistry {
  getDefinition(event: EventContract): SpatialNodeDefinition;
  shouldSpawn(event: EventContract, userTrace?: number): boolean;
  getSpawnTier(event: EventContract, userTrace?: number): SpawnTier;
}

function payloadNumber(event: EventContract, key: 'amount' | 'value' | 'newLevel'): number {
  const value = event.payload?.[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function resolveDefinitionId(eventType: string): string {
  return SPATIAL_SPAWN_REGISTRY.events[eventType] || SPATIAL_SPAWN_REGISTRY.defaultDefinition;
}

export class DefaultSpatialSpawnRegistry implements SpatialSpawnRegistry {
  getDefinition(event: EventContract): SpatialNodeDefinition {
    const definitionId = resolveDefinitionId(event.type);
    return (
      SPATIAL_SPAWN_REGISTRY.definitions[definitionId] ||
      SPATIAL_SPAWN_REGISTRY.definitions[SPATIAL_SPAWN_REGISTRY.defaultDefinition]
    );
  }

  shouldSpawn(event: EventContract, userTrace = 0): boolean {
    void event;
    void userTrace;
    // Patch 1B is intentionally behavior-preserving: every Kernel event that
    // reached SpatialRenderer.handle(event) before this registry still resolves
    // to either an explicit definition or the default memory shard.
    return true;
  }

  getSpawnTier(event: EventContract, userTrace = 0): SpawnTier {
    const amount = payloadNumber(event, 'amount');
    const value = payloadNumber(event, 'value');
    const newLevel = payloadNumber(event, 'newLevel');
    const trigger = event.payload?.trigger;
    const rewardType = event.payload?.rewardType;
    const resource = event.payload?.resource;

    if (
      event.type === 'system.reward_offered' &&
      trigger === 'milestone' &&
      (value >= 10 || rewardType === 'premium_currency')
    ) {
      return SpawnTier.CRITICAL;
    }

    if (event.type === 'milestone.level_up' && newLevel >= 10) return SpawnTier.CRITICAL;

    if (
      (event.type === 'system.reward_offered' && trigger === 'milestone' && value >= 5) ||
      (event.type === 'system.reward_offered' && trigger === 'spending' && value >= 50) ||
      (event.type === 'community.vortex' && (amount >= 60 || value >= 60)) ||
      (event.type === 'economic.resource_spent' && amount >= 50)
    ) {
      return SpawnTier.HIGH;
    }

    if (
      (event.type === 'library.game_opened' && amount >= 25) ||
      (event.type === 'economic.resource_gained' && resource === 'trace' && amount >= 10) ||
      (event.type === 'milestone.level_up' && newLevel >= 2) ||
      userTrace >= 25
    ) {
      return SpawnTier.STANDARD;
    }

    return SpawnTier.LOW;
  }
}

export const spatialSpawnRegistry = new DefaultSpatialSpawnRegistry();

export function resolveSpatialSpawn(event: EventContract): BiomeMapping {
  return spatialSpawnRegistry.getDefinition(event);
}

export function shouldSpawnSpatialNode(event: EventContract, userTrace = 0): boolean {
  return spatialSpawnRegistry.shouldSpawn(event, userTrace);
}

export function getSpatialSpawnTier(event: EventContract, userTrace = 0): SpawnTier {
  return spatialSpawnRegistry.getSpawnTier(event, userTrace);
}
