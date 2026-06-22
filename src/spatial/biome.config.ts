export type BiomeTone = 'cyan' | 'gold' | 'green' | 'pink' | 'violet';
export type BiomeGeometry = 'growth-node' | 'resource-crystal' | 'reward-orb' | 'heartbeat-ring' | 'default-shard';

export type BiomeMapping = {
  label: string;
  tone: BiomeTone;
  geometry: BiomeGeometry;
  color: number;
  emissive: number;
  scale: number;
  pull: number;
};

export const BIOME_EVENT_MAP: Record<string, BiomeMapping> = {
  'lifecycle.start': {
    label: 'Origin Chamber',
    tone: 'green',
    geometry: 'heartbeat-ring',
    color: 0x95e0bc,
    emissive: 0x284b38,
    scale: 1.2,
    pull: 1.0,
  },
  'milestone.level_up': {
    label: 'Growth Chamber',
    tone: 'gold',
    geometry: 'growth-node',
    color: 0xd7b36a,
    emissive: 0x62471c,
    scale: 1.35,
    pull: 1.65,
  },
  'economic.resource_gained': {
    label: 'Mycelium Link',
    tone: 'cyan',
    geometry: 'resource-crystal',
    color: 0x6ef4e5,
    emissive: 0x0d5a54,
    scale: 1.0,
    pull: 1.25,
  },
  'economic.resource_spent': {
    label: 'Abyssal Exchange',
    tone: 'violet',
    geometry: 'default-shard',
    color: 0x9b8c74,
    emissive: 0x3a3024,
    scale: 1.05,
    pull: 1.45,
  },
  'system.reward_offered': {
    label: 'Pearl Reward',
    tone: 'pink',
    geometry: 'reward-orb',
    color: 0xd7a7a0,
    emissive: 0x633b36,
    scale: 1.22,
    pull: 1.55,
  },
  'system.heartbeat': {
    label: 'Memory Pulse',
    tone: 'green',
    geometry: 'heartbeat-ring',
    color: 0x95e0bc,
    emissive: 0x123d32,
    scale: 0.72,
    pull: 0.5,
  },
  'library.game_opened': {
    label: 'Arcade Genesis',
    tone: 'cyan',
    geometry: 'growth-node',
    color: 0x6ef4e5,
    emissive: 0x0b5d66,
    scale: 1.42,
    pull: 1.9,
  },
  'library.archive_opened': {
    label: 'Old Memory Vault',
    tone: 'violet',
    geometry: 'default-shard',
    color: 0x8f8068,
    emissive: 0x30281e,
    scale: 0.95,
    pull: 0.95,
  },
  'community.vortex': {
    label: 'Community Vortex',
    tone: 'gold',
    geometry: 'heartbeat-ring',
    color: 0xd7b36a,
    emissive: 0x5a421d,
    scale: 1.7,
    pull: 2.25,
  },
};

export const DEFAULT_BIOME_MAPPING: BiomeMapping = {
  label: 'Memory Shard',
  tone: 'cyan',
  geometry: 'default-shard',
  color: 0x6ef4e5,
  emissive: 0x0b5d77,
  scale: 0.86,
  pull: 0.9,
};
