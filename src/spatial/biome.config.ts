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
    label: 'Origin Core',
    tone: 'green',
    geometry: 'heartbeat-ring',
    color: 0x58ffbd,
    emissive: 0x0f6b50,
    scale: 1.2,
    pull: 1.0,
  },
  'milestone.level_up': {
    label: 'Growth Node',
    tone: 'gold',
    geometry: 'growth-node',
    color: 0xffe27a,
    emissive: 0x6f4a00,
    scale: 1.35,
    pull: 1.65,
  },
  'economic.resource_gained': {
    label: 'Mycelium Link',
    tone: 'cyan',
    geometry: 'resource-crystal',
    color: 0x5fe8ff,
    emissive: 0x0b5d77,
    scale: 1.0,
    pull: 1.25,
  },
  'economic.resource_spent': {
    label: 'Gravity Well',
    tone: 'violet',
    geometry: 'default-shard',
    color: 0xa873ff,
    emissive: 0x3d1c75,
    scale: 1.05,
    pull: 1.45,
  },
  'system.reward_offered': {
    label: 'Reward Orb',
    tone: 'pink',
    geometry: 'reward-orb',
    color: 0xff5ee7,
    emissive: 0x7a1a68,
    scale: 1.22,
    pull: 1.55,
  },
  'system.heartbeat': {
    label: 'Pulse Ring',
    tone: 'green',
    geometry: 'heartbeat-ring',
    color: 0x58ffbd,
    emissive: 0x123d32,
    scale: 0.72,
    pull: 0.5,
  },
};

export const DEFAULT_BIOME_MAPPING: BiomeMapping = {
  label: 'Signal Shard',
  tone: 'cyan',
  geometry: 'default-shard',
  color: 0x5fe8ff,
  emissive: 0x0b5d77,
  scale: 0.86,
  pull: 0.9,
};
