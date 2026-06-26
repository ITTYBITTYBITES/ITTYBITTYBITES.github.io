export type BiomeTone = 'cyan' | 'gold' | 'green' | 'pink' | 'violet';
export type BiomeGeometry = 'growth-node' | 'resource-crystal' | 'reward-orb' | 'heartbeat-ring' | 'default-shard';

export type SpatialNodeLifecycle = {
  /** Whether the node participates in the archive fading rules as the memory field fills. */
  archiveable: boolean;
  /** Whether the node should use the renderer's ambient pulse animation. */
  pulse: boolean;
  /** Whether the node should create links to previous memories and source control anchors. */
  connect: boolean;
};

export type SpatialNodeDefinition = {
  id: string;
  label: string;
  tone: BiomeTone;
  geometry: BiomeGeometry;
  color: number;
  emissive: number;
  scale: number;
  pull: number;
  lifecycle: SpatialNodeLifecycle;
};

// Backwards-compatible alias for the active renderer while the registry is formalized.
export type BiomeMapping = SpatialNodeDefinition;

export type SpatialSpawnManifest = {
  version: string;
  definitions: Record<string, SpatialNodeDefinition>;
  events: Record<string, string>;
  defaultDefinition: string;
};

const DEFAULT_LIFECYCLE: SpatialNodeLifecycle = {
  archiveable: true,
  pulse: true,
  connect: true,
};

const defineNode = (definition: Omit<SpatialNodeDefinition, 'lifecycle'> & { lifecycle?: Partial<SpatialNodeLifecycle> }): SpatialNodeDefinition => ({
  ...definition,
  lifecycle: { ...DEFAULT_LIFECYCLE, ...(definition.lifecycle || {}) },
});

export const SPATIAL_SPAWN_REGISTRY: SpatialSpawnManifest = {
  version: '1.0.0',
  definitions: {
    originChamber: defineNode({
      id: 'originChamber',
      label: 'Origin Chamber',
      tone: 'green',
      geometry: 'heartbeat-ring',
      color: 0x95e0bc,
      emissive: 0x284b38,
      scale: 1.2,
      pull: 1.0,
    }),
    growthChamber: defineNode({
      id: 'growthChamber',
      label: 'Growth Chamber',
      tone: 'gold',
      geometry: 'growth-node',
      color: 0xd7b36a,
      emissive: 0x62471c,
      scale: 1.35,
      pull: 1.65,
    }),
    myceliumLink: defineNode({
      id: 'myceliumLink',
      label: 'Mycelium Link',
      tone: 'cyan',
      geometry: 'resource-crystal',
      color: 0x6ef4e5,
      emissive: 0x0d5a54,
      scale: 1.0,
      pull: 1.25,
    }),
    abyssalExchange: defineNode({
      id: 'abyssalExchange',
      label: 'Abyssal Exchange',
      tone: 'violet',
      geometry: 'default-shard',
      color: 0x9b8c74,
      emissive: 0x3a3024,
      scale: 1.05,
      pull: 1.45,
    }),
    pearlReward: defineNode({
      id: 'pearlReward',
      label: 'Pearl Reward',
      tone: 'pink',
      geometry: 'reward-orb',
      color: 0xd7a7a0,
      emissive: 0x633b36,
      scale: 1.22,
      pull: 1.55,
    }),
    memoryPulse: defineNode({
      id: 'memoryPulse',
      label: 'Memory Pulse',
      tone: 'green',
      geometry: 'heartbeat-ring',
      color: 0x95e0bc,
      emissive: 0x123d32,
      scale: 0.72,
      pull: 0.5,
      lifecycle: { archiveable: false, connect: false },
    }),
    arcadeGenesis: defineNode({
      id: 'arcadeGenesis',
      label: 'Arcade Genesis',
      tone: 'cyan',
      geometry: 'growth-node',
      color: 0x6ef4e5,
      emissive: 0x0b5d66,
      scale: 1.42,
      pull: 1.9,
    }),
    oldMemoryVault: defineNode({
      id: 'oldMemoryVault',
      label: 'Old Memory Vault',
      tone: 'violet',
      geometry: 'default-shard',
      color: 0x8f8068,
      emissive: 0x30281e,
      scale: 0.95,
      pull: 0.95,
    }),
    archiveSignal: defineNode({
      id: 'archiveSignal',
      label: 'Archive Signal',
      tone: 'violet',
      geometry: 'default-shard',
      color: 0x8a2be2,
      emissive: 0x34135c,
      scale: 1.02,
      pull: 1.08,
    }),
    communityVortex: defineNode({
      id: 'communityVortex',
      label: 'Community Vortex',
      tone: 'gold',
      geometry: 'heartbeat-ring',
      color: 0xd7b36a,
      emissive: 0x5a421d,
      scale: 1.7,
      pull: 2.25,
    }),
    memoryShard: defineNode({
      id: 'memoryShard',
      label: 'Memory Shard',
      tone: 'cyan',
      geometry: 'default-shard',
      color: 0x6ef4e5,
      emissive: 0x0b5d77,
      scale: 0.86,
      pull: 0.9,
    }),
    memoryEcho: defineNode({
      id: 'memoryEcho',
      label: 'Memory Echo',
      tone: 'cyan',
      geometry: 'heartbeat-ring',
      color: 0xbfffff,
      emissive: 0x0b5d77,
      scale: 0.78,
      pull: 0.82,
      lifecycle: { archiveable: true, connect: true },
    }),
  },
  events: {
    'lifecycle.start': 'originChamber',
    'milestone.level_up': 'growthChamber',
    'economic.resource_gained': 'myceliumLink',
    'economic.resource_spent': 'abyssalExchange',
    'system.reward_offered': 'pearlReward',
    'system.heartbeat': 'memoryPulse',
    'library.game_opened': 'arcadeGenesis',
    'library.archive_opened': 'oldMemoryVault',
    'library.archive_signal': 'archiveSignal',
    'memory.echo': 'memoryEcho',
    'community.vortex': 'communityVortex',
  },
  defaultDefinition: 'memoryShard',
};

export function resolveSpatialSpawn(eventType: string): SpatialNodeDefinition {
  const definitionId = SPATIAL_SPAWN_REGISTRY.events[eventType] || SPATIAL_SPAWN_REGISTRY.defaultDefinition;
  return SPATIAL_SPAWN_REGISTRY.definitions[definitionId] || SPATIAL_SPAWN_REGISTRY.definitions[SPATIAL_SPAWN_REGISTRY.defaultDefinition];
}

// Compatibility exports for the current SpatialRenderer and existing verifier assumptions.
export const BIOME_EVENT_MAP: Record<string, BiomeMapping> = Object.fromEntries(
  Object.entries(SPATIAL_SPAWN_REGISTRY.events).map(([eventType, definitionId]) => [
    eventType,
    SPATIAL_SPAWN_REGISTRY.definitions[definitionId],
  ])
);

export const DEFAULT_BIOME_MAPPING: BiomeMapping = SPATIAL_SPAWN_REGISTRY.definitions[SPATIAL_SPAWN_REGISTRY.defaultDefinition];
