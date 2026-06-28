/**
 * Liquid Memory Home Kernel v1.0
 *
 * Orchestrates the Holographic Data-Hub, preserving compatibility aliases
 * while exposing the unified window.LiquidMemory namespace. Built on
 * Registry-Driven architecture and centralized LiquidMemoryTelemetry.
 */
import { GlobalEventBus, INITIAL_PLATFORM_STATE, MonetizationLayer, PlatformPersistor, reduce, VisualBridge } from './kernel';
import type { EventContract, PlatformState } from './kernel';
import { SpatialRenderer, type GearId } from './spatial/SpatialRenderer';
import { SpatialEventBus, type SwipeGestureController } from './spatial/SpatialEventBus';
import { ENGINE_VERSION } from './core/Version';
import { LiquidMemoryTelemetry, type ChamberDepartureMarker } from './core/telemetry/LiquidMemoryTelemetry';
import { Registry } from './registry/Registry';

const STORAGE_NAMESPACE = 'lm_home_kernel';
const LEGACY_STORAGE_NAMESPACE = 'ibb_home_kernel';
const BLUEPRINT_GEAR_KEY = 'lm_blueprint_nav_gear';
const HOME_ENGINE_VERSION_KEY = `${STORAGE_NAMESPACE}_engine_version`;
const LEGACY_SHELL_STYLE_ID = 'lm-legacy-shell-purge';
const PORTAL_TELEMETRY_KEY = `${STORAGE_NAMESPACE}_portal_telemetry`;
let uiSequence = 0;

function cloneInitialState(): PlatformState {
  return {
    ...INITIAL_PLATFORM_STATE,
    timestamp: new Date().toISOString(),
    processedEventIds: new Set<string>(),
    lastSequenceIds: {},
    player: { ...INITIAL_PLATFORM_STATE.player, resources: { pearls: 0, trace: 0, sparks: 0 } },
    world: {
      ...INITIAL_PLATFORM_STATE.world,
      entities: {},
      time: { totalElapsedMs: 0, lastEventTimestamp: new Date().toISOString() },
    },
    system: { eventCount: 0, errors: [] },
  };
}

function makeEvent(type: string, payload: Record<string, any> = {}, source = 'liquid-memory-homepage'): EventContract {
  return {
    eventId: crypto.randomUUID(),
    sequenceId: ++uiSequence,
    timestamp: new Date().toISOString(),
    type,
    payload,
    source,
    metadata: { version: '1.0.0' },
  };
}

function injectLegacyShellPurgeStyle(): void {
  if (document.getElementById(LEGACY_SHELL_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = LEGACY_SHELL_STYLE_ID;
  style.textContent = `
    div.box-link, div.parchment, .box-link, .parchment {
      opacity: 0 !important;
      pointer-events: none !important;
      visibility: hidden !important;
    }
  `;
  document.head.appendChild(style);
}

function removeLegacyShellNodes(): void {
  document.querySelectorAll('div.box-link, div.parchment').forEach((node) => node.remove());
}

function markHomeEngineVersion(): void {
  if (localStorage.getItem(HOME_ENGINE_VERSION_KEY) !== ENGINE_VERSION) {
    localStorage.setItem(HOME_ENGINE_VERSION_KEY, ENGINE_VERSION);
  }
}

function migrateLegacyMemoryState(): void {
  const pairs = [
    [`${LEGACY_STORAGE_NAMESPACE}_state`, `${STORAGE_NAMESPACE}_state`],
    [`${LEGACY_STORAGE_NAMESPACE}_event_log`, `${STORAGE_NAMESPACE}_event_log`],
  ];
  pairs.forEach(([legacyKey, newKey]) => {
    if (!localStorage.getItem(newKey) && localStorage.getItem(legacyKey)) {
      localStorage.setItem(newKey, localStorage.getItem(legacyKey)!);
    }
  });
}

function initKernel() {
  injectLegacyShellPurgeStyle();
  const bus = GlobalEventBus.getInstance();
  bus.reset();
  markHomeEngineVersion();
  migrateLegacyMemoryState();
  const telemetry = new LiquidMemoryTelemetry(PORTAL_TELEMETRY_KEY);

  const persistor = new PlatformPersistor(`${STORAGE_NAMESPACE}_state`, `${STORAGE_NAMESPACE}_event_log`);
  const rehydrated = persistor.rehydrate();
  const bridge = new VisualBridge(rehydrated || cloneInitialState());
  const monetization = new MonetizationLayer();
  monetization.init(bus);

  const spatialHost = document.getElementById('spatial-canvas');
  const spatialLive = document.getElementById('spatial-live-region');
  let spatial: SpatialRenderer | null = null;
  let spatialEvents: SpatialEventBus | null = null;
  let swipeGestures: SwipeGestureController | null = null;
  let kernelReady = false;
  let apiRef: any = null;
  const readyCallbacks: Array<(kernel: any) => void> = [];

  function onReady(callback: (kernel: any) => void): () => void {
    if (kernelReady && apiRef) {
      queueMicrotask(() => callback(apiRef));
      return () => undefined;
    }
    readyCallbacks.push(callback);
    return () => {
      const index = readyCallbacks.indexOf(callback);
      if (index >= 0) readyCallbacks.splice(index, 1);
    };
  }

  function performSystemRehydration(): void {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.includes('liquid-memory-cache') || key.includes('arcade_client_deployment_ver')) {
          localStorage.removeItem(key);
        }
      });
    } catch {}
  }

  function dispatchKernelReady(): void {
    if (kernelReady || !apiRef) return;
    kernelReady = true;
    document.body.classList.add('liquid-ready');
    if (spatial?.getGearCount() === 5 && spatial?.getGaugeCount() >= 4 && spatial?.isWorkstationModelLoaded?.()) {
      removeLegacyShellNodes();
    }

    readyCallbacks.splice(0).forEach((callback) => {
      try { callback(apiRef); } catch (error) { console.warn('[LiquidMemory] ready callback failed', error); }
    });
    window.dispatchEvent(new CustomEvent('liquidmemory:ready', {
      detail: { version: ENGINE_VERSION, nodeCount: spatial?.getNodeCount() || 0 },
    }));
  }

  function resolvePortalRoute(route?: string): string | null {
    if (!route) return null;
    try {
      const target = new URL(route, window.location.href);
      if (target.origin !== window.location.origin) return null;
      return target.toString();
    } catch {
      return null;
    }
  }

  function syncPortalIntent(): void {
    const intent = spatialEvents?.getPortalIntent() || null;
    spatial?.setPortalIntent(intent ? {
      chamber: intent.chamber,
      route: intent.route,
      seoLabel: intent.seoLabel,
      nodeId: intent.nodeId,
    } : null);
  }

  function confirmPortalIntent(): boolean {
    const intent = spatialEvents?.getPortalIntent() || null;
    syncPortalIntent();
    if (!intent?.route && !intent?.nodeId) return false;

    const node = Registry.lookup(intent?.nodeId) || Registry.lookup(intent?.chamber) || Registry.lookup(intent?.interactionEvent);
    const targetRoute = intent?.route || node?.route;
    if (!targetRoute) return false;

    const route = resolvePortalRoute(targetRoute);
    if (!route) return false;

    const confirmedAt = new Date().toISOString();
    if (spatialHost) {
      spatialHost.dataset.portalConfirmed = intent.chamber || intent.seoLabel || intent.nodeId || 'unknown';
      spatialHost.dataset.portalConfirmedAt = confirmedAt;
    }
    telemetry.stagePortalArrival(intent, confirmedAt);
    telemetry.logPortalConfirmed(intent, confirmedAt);
    window.location.assign(route);
    return true;
  }

  function focusGear(gear: GearId): void {
    spatial?.focusGear(gear);
    spatial?.setActiveGear(gear);
    localStorage.setItem(BLUEPRINT_GEAR_KEY, gear);
  }

  function triggerGear(gear: GearId): void {
    const node = Registry.lookup(gear);
    if (!node) return;
    const eventType = node.kernelEvent;
    const payload = { ...(node.payload || {}) };
    if (eventType === 'milestone.level_up') {
      const current = bridge.getCurrentState().player.level || 1;
      payload.newLevel = current + 1;
      payload.xp = current * 150;
    }
    localStorage.setItem(BLUEPRINT_GEAR_KEY, gear);
    bus.emit(makeEvent(eventType, payload, `blueprint-gear-${gear}`));
    window.setTimeout(() => focusGear(gear), 90);
  }

  function handleChamberReturn(departure: ChamberDepartureMarker | null): void {
    if (!departure || !spatialEvents) return;
    const state = spatialEvents.recordChamberReturn(departure);
    syncPortalIntent();
    const node = Registry.lookup(departure.nodeId) || Registry.lookup(departure.interactionEvent) || Registry.lookup(departure.chamber);
    const interactionEvent = state?.content?.interactionEvent || departure.interactionEvent || node?.kernelEvent || 'library.game_opened';
    spatial?.focusEventType(interactionEvent);
    if (departure.chamber === 'Arcade Genesis' || node?.gearId === 'games') {
      spatial?.focusGear('games');
      spatial?.setActiveGear('games');
      localStorage.setItem(BLUEPRINT_GEAR_KEY, 'games');
    }
    if (spatialHost) {
      spatialHost.dataset.portalReturn = departure.chamber;
      spatialHost.dataset.portalReturnAt = new Date().toISOString();
    }
  }

  spatial = spatialHost ? new SpatialRenderer(spatialHost, spatialLive, triggerGear) : null;
  spatialEvents = new SpatialEventBus(
    (type, payload = {}, source) => bus.emit(makeEvent(type, payload, source)),
    { getNodeCount: () => spatial?.getNodeCount() || 0, maxNodes: 48 }
  );
  spatialEvents.init();
  if (spatialHost && spatial) {
    swipeGestures = spatialEvents.bindSwipeGesture(spatialHost, {
      threshold: 50,
      getIntentNodeId: () => spatialEvents?.getPortalIntent()?.interactionEvent || spatial?.getPortalGestureTargetNodeId() || null,
      armIntent: (nodeId, trigger = 'portal-swipe') => {
        spatialEvents?.triggerInteraction(nodeId, trigger);
        syncPortalIntent();
      },
      onPreflight: (progress, nodeId, deltaX) => spatial?.setPortalPreflight(progress, nodeId, deltaX),
      onConfirm: () => confirmPortalIntent(),
    });
  }

  performSystemRehydration();
  const rememberedEvents = persistor.getEventLog().slice(-48);
  if (rememberedEvents.length === 0) {
    const initialNodes = ['arcade-main', 'legacy-static-content', 'community-vortex', 'witness-chamber', 'signals-dashboard'];
    initialNodes.forEach((id) => {
      const regNode = Registry.lookup(id);
      if (regNode) {
        spatial?.handle(makeEvent(regNode.kernelEvent, regNode.payload || {}));
      } else {
        spatial?.handle(makeEvent('system.terminal_fallback', { chamber: id }));
      }
    });
  } else {
    rememberedEvents.forEach((event) => spatial?.handle(event));
  }
  handleChamberReturn(telemetry.consumeChamberDeparture());

  if (spatialHost) {
    const isMobileDevice = window.matchMedia('(max-width: 768px)').matches || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobileDevice) {
      spatialHost.classList.add('hero-static-active');
    } else {
      window.setTimeout(() => {
        if (!spatial?.isWorkstationModelLoaded?.()) {
          spatialHost.classList.add('hero-static-active');
        }
      }, 2000);
    }
  }

  bus.subscribe((event) => {
    spatial?.handle(event);
    const current = bridge.getCurrentState();
    const next = reduce(current, event);
    if (next !== current && next.processedEventIds.has(event.eventId)) {
      persistor.logEvent(event);
      persistor.save(next);
    }
    bridge.onStateUpdated(next);
    spatial?.updateFromState(next);
  });

  const api = {
    bus,
    bridge,
    version: ENGINE_VERSION,
    navigate: (nodeId: string) => {
      const node = Registry.lookup(nodeId);
      if (!node?.route) return false;
      const route = resolvePortalRoute(node.route);
      if (!route) return false;
      const confirmedAt = new Date().toISOString();
      telemetry.stagePortalArrival({ nodeId, chamber: node.title, trigger: 'kernel-navigate' }, confirmedAt);
      telemetry.logPortalConfirmed({ nodeId, chamber: node.title, trigger: 'kernel-navigate' }, confirmedAt);
      window.location.assign(route);
      return true;
    },
    emit: (type: string, payload: Record<string, any> = {}, source?: string) => bus.emit(makeEvent(type, payload, source)),
    getState: () => bridge.getCurrentState(),
    getEngineVersion: () => ENGINE_VERSION,
    isReady: () => kernelReady,
    onReady,
    levelUp: () => triggerGear('blueprint'),
    gain: (resource = 'trace', amount = 10) => bus.emit(makeEvent('economic.resource_gained', { resource, amount })),
    spend: (resource = 'pearls', amount = 60) => bus.emit(makeEvent('economic.resource_spent', { resource, amount })),
    focusSpatial: () => spatial?.focusNext(),
    focusGear,
    triggerGear,
    getSpatialNodeCount: () => spatial?.getNodeCount() || 0,
    emitArchiveSignal: (payload: Record<string, any> = {}) => {
      const emitted = spatialEvents?.emitArchiveSignal(payload) || false;
      syncPortalIntent();
      return emitted;
    },
    emitMemoryEcho: (payload: Record<string, any> = {}) => {
      const emitted = spatialEvents?.emitMemoryEcho(payload) || false;
      syncPortalIntent();
      return emitted;
    },
    triggerSpatialInteraction: (nodeId: string, trigger?: string) => {
      const state = spatialEvents?.triggerInteraction(nodeId, trigger);
      syncPortalIntent();
      return state;
    },
    getActiveChamberState: () => spatialEvents?.getActiveChamberState() || null,
    getPortalIntent: () => spatialEvents?.getPortalIntent() || null,
    getChamberReturnState: () => spatialEvents?.getChamberReturnState() || null,
    getPortalTelemetry: () => telemetry.getPortalTelemetry(),
    syncTelemetry: (endpoint?: string) => telemetry.syncTelemetry(endpoint),
    clearPortalIntent: () => {
      spatialEvents?.clearPortalIntent();
      if (spatialHost) {
        delete spatialHost.dataset.portalConfirmed;
        delete spatialHost.dataset.portalConfirmedAt;
      }
      syncPortalIntent();
    },
    confirmPortalIntent,
    getSpatialGearCount: () => spatial?.getGearCount() || 0,
    getSpatialGaugeCount: () => spatial?.getGaugeCount() || 0,
    getHolographicModuleCount: () => spatial?.getGearCount() || 0,
    getSpatialMetricCount: () => spatial?.getGaugeCount() || 0,
    getAnchorCount: () => spatial?.getNodeCount() || 0,
    getResponsiveMode: () => spatial?.getResponsiveMode?.() || 'unknown',
    isWorkstationModelLoaded: () => spatial?.isWorkstationModelLoaded?.() || false,
    isProceduralFallbackActive: () => spatial?.isProceduralFallbackActive?.() || false,
    getWorkstationAnchorCount: () => spatial?.getAnchorCount?.() || 0,
    destroy: () => {
      swipeGestures?.destroy();
      swipeGestures = null;
      spatialEvents?.destroy();
      spatial?.dispose();
      spatial = null;
    },
    clear: () => { persistor.clear(); localStorage.removeItem(BLUEPRINT_GEAR_KEY); window.location.reload(); },
  };

  apiRef = api;
  const telemetryApi = {
    getPortalTelemetry: () => telemetry.getPortalTelemetry(),
    syncTelemetry: (endpoint?: string) => telemetry.syncTelemetry(endpoint),
  };
  (window as any).LiquidMemory = {
    version: ENGINE_VERSION,
    Kernel: api,
    Spatial: spatial,
    Events: spatialEvents,
    Telemetry: telemetryApi,
    Registry: Registry,
    onReady,
  };
  (window as any).LiquidMemoryKernel = api;
  (window as any).LiquidMemorySpatial = spatial;
  requestAnimationFrame(() => dispatchKernelReady());

  const savedGear = (localStorage.getItem(BLUEPRINT_GEAR_KEY) || 'games') as GearId;
  if (Registry.lookup(savedGear)) {
    window.setTimeout(() => focusGear(savedGear), 160);
  }

  bus.emit(makeEvent('lifecycle.start', { page: location.pathname }));
  window.setInterval(() => bus.emit(makeEvent('system.heartbeat', { path: location.pathname })), 30000);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initKernel);
else initKernel();
