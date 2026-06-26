import type { EventContract } from '../kernel';
import { getSpatialContent, type SpatialContentMetadata } from './registry/SpatialSpawnRegistry';

export type SpatialEventEmitter = (type: string, payload?: Record<string, any>, source?: string) => boolean;

export type SpatialEventBudget = {
  getNodeCount: () => number;
  maxNodes: number;
};

export type ActiveChamberState = {
  nodeId: string;
  content?: SpatialContentMetadata;
  updatedAt: string;
  trigger: string;
} | null;

export type PortalIntent = {
  nodeId: string;
  chamber: string;
  route?: string;
  seoLabel?: string;
  interactionEvent?: string;
  trigger: string;
  updatedAt: string;
} | null;

export class SpatialEventBus {
  private teardownCallbacks: Array<() => void> = [];
  private activeChamberState: ActiveChamberState = null;
  private portalIntent: PortalIntent = null;

  constructor(
    private emit: SpatialEventEmitter,
    private budget: SpatialEventBudget
  ) {}

  init(): void {
    this.bindWindowEvent('liquidmemory:archive-signal', 'library.archive_signal');
    this.bindWindowEvent('liquidmemory:memory-echo', 'memory.echo');
  }

  emitArchiveSignal(payload: Record<string, any> = {}): boolean {
    return this.emitIfBudgetAllows('library.archive_signal', {
      chamber: 'Old Memory Vault',
      signal: 'archive-scroll',
      ...payload,
    });
  }

  emitMemoryEcho(payload: Record<string, any> = {}): boolean {
    return this.emitIfBudgetAllows('memory.echo', {
      chamber: 'Memory Mycelium',
      signal: 'memory-echo',
      ...payload,
    });
  }

  triggerInteraction(nodeId: string, trigger = 'spatial-interaction'): ActiveChamberState {
    const content = getSpatialContent(nodeId);
    const updatedAt = new Date().toISOString();
    this.activeChamberState = {
      nodeId,
      content,
      updatedAt,
      trigger,
    };
    if (content) {
      this.portalIntent = {
        nodeId,
        chamber: content.chamber,
        route: content.route,
        seoLabel: content.seoLabel,
        interactionEvent: content.interactionEvent,
        trigger,
        updatedAt,
      };
    }
    return this.activeChamberState;
  }

  getActiveChamberState(): ActiveChamberState {
    return this.activeChamberState;
  }

  getPortalIntent(): PortalIntent {
    return this.portalIntent;
  }

  clearPortalIntent(): void {
    this.portalIntent = null;
  }

  destroy(): void {
    this.teardownCallbacks.forEach((teardown) => teardown());
    this.teardownCallbacks = [];
  }

  private bindWindowEvent(domEventType: string, kernelEventType: string): void {
    const listener = (event: Event) => {
      const custom = event as CustomEvent<Record<string, any>>;
      this.triggerInteraction(kernelEventType, domEventType);
      this.emitIfBudgetAllows(kernelEventType, custom.detail || {});
    };
    window.addEventListener(domEventType, listener as EventListener, { passive: true });
    this.teardownCallbacks.push(() => window.removeEventListener(domEventType, listener as EventListener));
  }

  private emitIfBudgetAllows(type: string, payload: Record<string, any> = {}): boolean {
    if (this.budget.getNodeCount() >= this.budget.maxNodes) return false;
    this.triggerInteraction(type, payload.signal || 'spatial-event-bus');
    return this.emit(type, payload, 'spatial-event-bus');
  }
}
