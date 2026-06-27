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

export type ChamberDeparture = {
  chamber: string;
  nodeId?: string;
  route?: string;
  interactionEvent?: string;
  departedAt?: string;
  reason?: string;
};


export type SwipeGestureControllerOptions = {
  threshold?: number;
  getIntentNodeId: () => string | null;
  armIntent: (nodeId: string, trigger?: string) => void;
  onPreflight?: (progress: number, nodeId: string | null, deltaX: number) => void;
  onConfirm: () => boolean;
};

export class SwipeGestureController {
  private pointerId: number | null = null;
  private startX = 0;
  private startY = 0;
  private deltaX = 0;
  private deltaY = 0;
  private armedNodeId: string | null = null;
  private threshold: number;

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (this.pointerId !== null || event.button > 0 || event.pointerType !== 'touch') return;
    this.pointerId = event.pointerId;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.deltaX = 0;
    this.deltaY = 0;
    this.armedNodeId = this.options.getIntentNodeId();
    if (this.armedNodeId) this.options.armIntent(this.armedNodeId, 'portal-swipe-start');
    this.options.onPreflight?.(0, this.armedNodeId, 0);
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    if (this.pointerId !== event.pointerId) return;
    this.deltaX = event.clientX - this.startX;
    this.deltaY = event.clientY - this.startY;
    const absX = Math.abs(this.deltaX);
    const absY = Math.abs(this.deltaY);
    if (absX <= absY || absX < 8) return;

    // Horizontal portal swipes are intentionally canvas-local; vertical motion is left alone.
    event.preventDefault();
    if (!this.armedNodeId) this.armedNodeId = this.options.getIntentNodeId();
    if (this.armedNodeId) this.options.armIntent(this.armedNodeId, 'portal-swipe-preflight');
    const progress = Math.min(1, absX / this.threshold);
    this.options.onPreflight?.(progress, this.armedNodeId, this.deltaX);
  };

  private readonly handlePointerUp = (event: PointerEvent): void => {
    if (this.pointerId !== event.pointerId) return;
    const absX = Math.abs(this.deltaX);
    const absY = Math.abs(this.deltaY);
    const shouldConfirm = absX >= this.threshold && absX > absY;
    this.options.onPreflight?.(0, null, 0);
    this.pointerId = null;
    this.armedNodeId = null;
    this.deltaX = 0;
    this.deltaY = 0;
    if (shouldConfirm) this.options.onConfirm();
  };

  private readonly handlePointerCancel = (event: PointerEvent): void => {
    if (this.pointerId !== event.pointerId) return;
    this.options.onPreflight?.(0, null, 0);
    this.pointerId = null;
    this.armedNodeId = null;
    this.deltaX = 0;
    this.deltaY = 0;
  };

  constructor(private target: HTMLElement, private options: SwipeGestureControllerOptions) {
    this.threshold = options.threshold || 50;
    this.target.addEventListener('pointerdown', this.handlePointerDown, { passive: true });
    this.target.addEventListener('pointermove', this.handlePointerMove, { passive: false });
    this.target.addEventListener('pointerup', this.handlePointerUp, { passive: true });
    this.target.addEventListener('pointercancel', this.handlePointerCancel, { passive: true });
    this.target.addEventListener('pointerleave', this.handlePointerCancel, { passive: true });
  }

  destroy(): void {
    this.target.removeEventListener('pointerdown', this.handlePointerDown);
    this.target.removeEventListener('pointermove', this.handlePointerMove);
    this.target.removeEventListener('pointerup', this.handlePointerUp);
    this.target.removeEventListener('pointercancel', this.handlePointerCancel);
    this.target.removeEventListener('pointerleave', this.handlePointerCancel);
    this.options.onPreflight?.(0, null, 0);
  }
}

export class SpatialEventBus {
  private teardownCallbacks: Array<() => void> = [];
  private activeChamberState: ActiveChamberState = null;
  private portalIntent: PortalIntent = null;
  private chamberReturnState: ActiveChamberState = null;

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

  recordChamberReturn(departure: ChamberDeparture): ActiveChamberState {
    const nodeId = departure.interactionEvent || departure.nodeId || departure.chamber;
    const content = getSpatialContent(nodeId) || getSpatialContent(departure.chamber);
    const updatedAt = new Date().toISOString();
    this.chamberReturnState = {
      nodeId,
      content,
      updatedAt,
      trigger: 'portal-return',
    };
    this.activeChamberState = this.chamberReturnState;
    if (content) {
      this.portalIntent = {
        nodeId,
        chamber: content.chamber,
        route: content.route,
        seoLabel: content.seoLabel,
        interactionEvent: content.interactionEvent,
        trigger: 'portal-return',
        updatedAt,
      };
    }
    return this.chamberReturnState;
  }

  getChamberReturnState(): ActiveChamberState {
    return this.chamberReturnState;
  }

  bindSwipeGesture(target: HTMLElement, options: SwipeGestureControllerOptions): SwipeGestureController {
    const controller = new SwipeGestureController(target, options);
    this.teardownCallbacks.push(() => controller.destroy());
    return controller;
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
