/**
 * Central Registry v1.0
 *
 * Definitive Registry-Driven architecture for Liquid Memory nodes, chambers,
 * dynamic routing, and legacy static content bridging.
 */

export type RegistryCategory = 'arcade' | 'flagship' | 'archive' | 'community' | 'system' | 'legacy';

export interface RegistryNode {
  nodeId: string;
  gearId?: 'games' | 'archive' | 'community' | 'blueprint' | 'memory';
  kernelEvent: string;
  route?: string;
  title: string;
  category: RegistryCategory;
  description?: string;
  seoLabel?: string;
  payload?: Record<string, any>;
  isLegacyStatic?: boolean;
}

export class Registry {
  private static nodes: Map<string, RegistryNode> = new Map([
    [
      'arcade-main',
      {
        nodeId: 'arcade-main',
        gearId: 'games',
        kernelEvent: 'library.game_opened',
        route: './arcade.html',
        title: 'Arcade Genesis',
        category: 'arcade',
        description: 'Experimental browser arcade and prototype chamber.',
        seoLabel: 'Liquid Memory Arcade Genesis',
        payload: { resource: 'trace', amount: 25, chamber: 'Arcade Genesis' },
      },
    ],
    [
      'two-second-witness-chamber',
      {
        nodeId: 'two-second-witness-chamber',
        gearId: 'games',
        kernelEvent: 'witness.chamber_opened',
        route: './2-second-witness.html',
        title: '2 Second Witness',
        category: 'flagship',
        description: 'Flagship cognitive training rapid-fire Stroop game.',
        seoLabel: 'Liquid Memory 2 Second Witness',
        payload: { resource: 'trace', amount: 25, chamber: 'Arcade Genesis' },
      },
    ],
    [
      'two-second-witness-leaderboard',
      {
        nodeId: 'two-second-witness-leaderboard',
        gearId: 'games',
        kernelEvent: 'witness.leaderboard_opened',
        route: './2-second-witness.html#leaderboard',
        title: '2SW Clearance Leaderboard',
        category: 'flagship',
        description: 'Global operative clearance rankings.',
        seoLabel: 'Liquid Memory 2SW Leaderboard',
      },
    ],
    [
      'witness-chamber',
      {
        nodeId: 'witness-chamber',
        gearId: 'games',
        kernelEvent: 'witness.landing_opened',
        route: './witness/index.html',
        title: 'Two-Second Witness (Android App)',
        category: 'flagship',
        description: 'Dedicated Android App interactive landing experience.',
        seoLabel: 'Liquid Memory Witness App',
        payload: { resource: 'trace', amount: 25, chamber: 'Arcade Genesis' },
      },
    ],
    [
      'stroop-calibrator',
      {
        nodeId: 'stroop-calibrator',
        gearId: 'games',
        kernelEvent: 'library.game_opened',
        route: './games/stroop-calibrator/index.html',
        title: 'Stroop Interference Calibrator',
        category: 'arcade',
        description: 'Rapid 2SW cognitive interference stream.',
        seoLabel: 'Liquid Memory Stroop Calibrator',
        payload: { resource: 'trace', amount: 25, chamber: 'Arcade Genesis' },
      },
    ],
    [
      'legacy-static-content',
      {
        nodeId: 'legacy-static-content',
        gearId: 'archive',
        kernelEvent: 'library.archive_opened',
        route: './library.html',
        title: 'Old Memory Vault',
        category: 'legacy',
        description: 'Archived static library and historical studio pages.',
        seoLabel: 'Liquid Memory Archive Vault',
        payload: { resource: 'trace', amount: 5, chamber: 'Old Memory Vault' },
        isLegacyStatic: true,
      },
    ],
    [
      'community-vortex',
      {
        nodeId: 'community-vortex',
        gearId: 'community',
        kernelEvent: 'community.vortex',
        route: './feed.html',
        title: 'Community Vortex',
        category: 'community',
        description: 'Living community updates and reward vortex.',
        seoLabel: 'Liquid Memory Community Vortex',
        payload: { resource: 'pearls', amount: 60, chamber: 'Community Vortex' },
      },
    ],
    [
      'blueprint-dial',
      {
        nodeId: 'blueprint-dial',
        gearId: 'blueprint',
        kernelEvent: 'milestone.level_up',
        title: 'Blueprint Dial',
        category: 'system',
        description: 'Workstation growth mechanism.',
        seoLabel: 'Liquid Memory Growth Chamber',
        payload: { chamber: 'Blueprint Dial' },
      },
    ],
    [
      'memory-mycelium',
      {
        nodeId: 'memory-mycelium',
        gearId: 'memory',
        kernelEvent: 'economic.resource_gained',
        title: 'Memory Mycelium',
        category: 'system',
        description: 'Persistent resource echo network.',
        seoLabel: 'Liquid Memory Echo',
        payload: { resource: 'trace', amount: 10, chamber: 'Memory Mycelium' },
      },
    ],
  ]);

  private static aliases: Map<string, string> = new Map([
    ['games', 'arcade-main'],
    ['library.game_opened', 'arcade-main'],
    ['arcade genesis', 'arcade-main'],
    ['two-second-witness', 'two-second-witness-chamber'],
    ['2-second-witness', 'two-second-witness-chamber'],
    ['witness.chamber_opened', 'two-second-witness-chamber'],
    ['archive', 'legacy-static-content'],
    ['library.archive_opened', 'legacy-static-content'],
    ['old memory vault', 'legacy-static-content'],
    ['community', 'community-vortex'],
    ['community.vortex', 'community-vortex'],
    ['blueprint', 'blueprint-dial'],
    ['milestone.level_up', 'blueprint-dial'],
    ['memory', 'memory-mycelium'],
    ['economic.resource_gained', 'memory-mycelium'],
  ]);

  static {
    // Populate legacy static content articles
    const articles = [
      ['behavioral-economics', 'Behavioral Economics'],
      ['best-brain-games', 'Best Brain Games'],
      ['best-psychology-books', 'Best Psychology Books'],
      ['brain-training-tips', 'Brain Training Tips'],
      ['cognitive-biases', 'Cognitive Biases'],
      ['cybersecurity-beginners', 'Cybersecurity Beginners'],
      ['decision-making', 'Decision Making'],
      ['dunning-kruger', 'Dunning-Kruger Effect'],
      ['false-memory', 'False Memory'],
      ['first-aid-basics', 'First Aid Basics'],
      ['flow-state', 'Flow State'],
      ['food-safety', 'Food Safety'],
      ['how-doctors-think', 'How Doctors Think'],
      ['logical-fallacies', 'Logical Fallacies'],
      ['pattern-recognition', 'Pattern Recognition'],
      ['priming-effect', 'Priming Effect'],
      ['rapid-thinking', 'Rapid Thinking'],
      ['social-engineering', 'Social Engineering'],
      ['stroop-effect', 'Stroop Effect'],
      ['survival-skills', 'Survival Skills'],
    ];

    articles.forEach(([slug, title]) => {
      const id = `legacy-article-${slug}`;
      this.nodes.set(id, {
        nodeId: id,
        gearId: 'archive',
        kernelEvent: `legacy.${slug}`,
        route: `./articles/${slug}.html`,
        title,
        category: 'legacy',
        description: `Legacy studio publication: ${title}`,
        isLegacyStatic: true,
      });
      this.aliases.set(slug, id);
      this.aliases.set(`${slug}.html`, id);
      this.aliases.set(title.toLowerCase(), id);
    });
  }

  static register(node: RegistryNode, extraAliases: string[] = []): void {
    this.nodes.set(node.nodeId, node);
    extraAliases.forEach((alias) => this.aliases.set(alias.toLowerCase(), node.nodeId));
  }

  static lookup(query?: string | null): RegistryNode | null {
    if (!query) return null;
    const clean = query.trim();
    if (this.nodes.has(clean)) return this.nodes.get(clean)!;
    const aliasKey = clean.toLowerCase();
    const resolvedId = this.aliases.get(aliasKey);
    if (resolvedId && this.nodes.has(resolvedId)) return this.nodes.get(resolvedId)!;

    for (const node of this.nodes.values()) {
      if (
        node.kernelEvent === clean ||
        node.title.toLowerCase() === aliasKey ||
        node.seoLabel?.toLowerCase() === aliasKey ||
        node.gearId === clean
      ) {
        return node;
      }
    }
    return null;
  }

  static getAllNodes(): RegistryNode[] {
    return Array.from(this.nodes.values());
  }

  static getNodesByCategory(category: RegistryCategory): RegistryNode[] {
    return this.getAllNodes().filter((n) => n.category === category);
  }
}
