/**
 * YearGlass — Growth System
 *
 * Procedural plant growth: each plant node advances toward a species-specific
 * maximum as days pass, with a small random "jitter" so the terrarium never
 * looks static. Growth milestones are reported upward so the MemoryEngine can
 * log them.
 */

export interface PlantNode {
  id: string;
  species: 'moss' | 'fern' | 'orchid' | 'vine';
  growth: number; // 0..1 current
  maxGrowth: number;
  water: number; // 0..1
  x: number;
  y: number;
}

export interface GrowthEvent {
  nodeId: string;
  species: PlantNode['species'];
  growth: number;
  milestone: boolean;
}

const GROWTH_RATE: Record<PlantNode['species'], number> = {
  moss: 0.02,
  fern: 0.012,
  orchid: 0.006,
  vine: 0.015,
};

export class GrowthSystem {
  private readonly plants = new Map<string, PlantNode>();
  private nextId = 0;

  addPlant(species: PlantNode['species'], x: number, y: number): PlantNode {
    const node: PlantNode = {
      id: `plant-${this.nextId++}`,
      species,
      growth: 0.05 + Math.random() * 0.1,
      maxGrowth: 0.9 + Math.random() * 0.2,
      water: 0.7,
      x,
      y,
    };
    this.plants.set(node.id, node);
    return node;
  }

  /** Advance all plants by one simulated day. Returns milestone events. */
  tickDay(): GrowthEvent[] {
    const events: GrowthEvent[] = [];
    for (const node of this.plants.values()) {
      if (node.water > 0.2) {
        const before = Math.floor(node.growth / 0.25);
        node.growth = Math.min(
          node.maxGrowth,
          node.growth + GROWTH_RATE[node.species] * (0.6 + Math.random() * 0.8)
        );
        const after = Math.floor(node.growth / 0.25);
        if (after > before) {
          events.push({
            nodeId: node.id,
            species: node.species,
            growth: node.growth,
            milestone: true,
          });
        }
      }
    }
    return events;
  }

  waterPlant(id: string, amount = 0.35): void {
    const node = this.plants.get(id);
    if (node) node.water = Math.min(1, node.water + amount);
  }

  getPlant(id: string): PlantNode | undefined {
    return this.plants.get(id);
  }

  allPlants(): PlantNode[] {
    return Array.from(this.plants.values());
  }

  plantCount(): number {
    return this.plants.size;
  }
}
