import { GlobalEventBus, INITIAL_PLATFORM_STATE, MonetizationLayer, PlatformPersistor, reduce, VisualBridge } from './kernel';
import type { EventContract, PlatformState } from './kernel';
import { SpatialRenderer, type GearId } from './spatial/SpatialRenderer';

const STORAGE_NAMESPACE = 'lm_home_kernel';
const LEGACY_STORAGE_NAMESPACE = 'ibb_home_kernel';
const BLUEPRINT_GEAR_KEY = 'lm_blueprint_nav_gear';
let uiSequence = 0;

type GearIntent = {
  eventType: string;
  payload: Record<string, any>;
};

const GEAR_INTENTS: Record<GearId, GearIntent> = {
  games: { eventType: 'library.game_opened', payload: { resource: 'trace', amount: 25, chamber: 'Arcade Genesis' } },
  archive: { eventType: 'library.archive_opened', payload: { resource: 'trace', amount: 5, chamber: 'Old Memory Vault' } },
  community: { eventType: 'community.vortex', payload: { resource: 'pearls', amount: 60, chamber: 'Community Vortex' } },
  blueprint: { eventType: 'milestone.level_up', payload: { chamber: 'Blueprint Dial' } },
  memory: { eventType: 'economic.resource_gained', payload: { resource: 'trace', amount: 10, chamber: 'Memory Mycelium' } },
};

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
  const bus = GlobalEventBus.getInstance();
  bus.reset();
  migrateLegacyMemoryState();

  const persistor = new PlatformPersistor(`${STORAGE_NAMESPACE}_state`, `${STORAGE_NAMESPACE}_event_log`);
  const rehydrated = persistor.rehydrate();
  const bridge = new VisualBridge(rehydrated || cloneInitialState());
  const monetization = new MonetizationLayer();
  monetization.init(bus);

  const spatialHost = document.getElementById('spatial-canvas');
  const spatialLive = document.getElementById('spatial-live-region');
  let spatial: SpatialRenderer | null = null;

  function focusGear(gear: GearId): void {
    spatial?.focusGear(gear);
    spatial?.setActiveGear(gear);
    localStorage.setItem(BLUEPRINT_GEAR_KEY, gear);
  }

  function triggerGear(gear: GearId): void {
    const intent = GEAR_INTENTS[gear];
    const payload = { ...intent.payload };
    if (intent.eventType === 'milestone.level_up') {
      const current = bridge.getCurrentState().player.level || 1;
      payload.newLevel = current + 1;
      payload.xp = current * 150;
    }
    localStorage.setItem(BLUEPRINT_GEAR_KEY, gear);
    bus.emit(makeEvent(intent.eventType, payload, `blueprint-gear-${gear}`));
    window.setTimeout(() => focusGear(gear), 90);
  }

  spatial = spatialHost ? new SpatialRenderer(spatialHost, spatialLive, triggerGear) : null;

  // Rebuild visible biome from persisted event memory without reducer side effects.
  const rememberedEvents = persistor.getEventLog().slice(-48);
  rememberedEvents.forEach((event) => spatial?.handle(event));

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
    emit: (type: string, payload: Record<string, any> = {}, source?: string) => bus.emit(makeEvent(type, payload, source)),
    getState: () => bridge.getCurrentState(),
    levelUp: () => triggerGear('blueprint'),
    gain: (resource = 'trace', amount = 10) => bus.emit(makeEvent('economic.resource_gained', { resource, amount })),
    spend: (resource = 'pearls', amount = 60) => bus.emit(makeEvent('economic.resource_spent', { resource, amount })),
    focusSpatial: () => spatial?.focusNext(),
    focusGear,
    triggerGear,
    getSpatialNodeCount: () => spatial?.getNodeCount() || 0,
    getSpatialGearCount: () => spatial?.getGearCount() || 0,
    getSpatialGaugeCount: () => spatial?.getGaugeCount() || 0,
    getResponsiveMode: () => spatial?.getResponsiveMode?.() || 'unknown',
    isWorkstationModelLoaded: () => spatial?.isWorkstationModelLoaded?.() || false,
    isProceduralFallbackActive: () => spatial?.isProceduralFallbackActive?.() || false,
    getWorkstationAnchorCount: () => spatial?.getAnchorCount?.() || 0,
    clear: () => { persistor.clear(); localStorage.removeItem(BLUEPRINT_GEAR_KEY); window.location.reload(); },
  };

  (window as any).LiquidMemoryKernel = api;
  (window as any).LiquidMemorySpatial = spatial;

  const savedGear = (localStorage.getItem(BLUEPRINT_GEAR_KEY) || 'games') as GearId;
  if (GEAR_INTENTS[savedGear]) {
    window.setTimeout(() => focusGear(savedGear), 160);
  }

  bus.emit(makeEvent('lifecycle.start', { page: location.pathname }));
  window.setInterval(() => bus.emit(makeEvent('system.heartbeat', { path: location.pathname })), 30000);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initKernel);
else initKernel();
