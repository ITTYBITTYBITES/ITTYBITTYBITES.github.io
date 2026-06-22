import { GlobalEventBus, INITIAL_PLATFORM_STATE, MonetizationLayer, PlatformPersistor, reduce, VisualBridge } from './kernel';
import type { EventContract, PlatformState } from './kernel';
import { KernelObserver } from './dom/KernelObserver';
import { SpatialRenderer } from './spatial/SpatialRenderer';

const STORAGE_NAMESPACE = 'lm_home_kernel';
const LEGACY_STORAGE_NAMESPACE = 'ibb_home_kernel';
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

function makeEvent(type: string, payload: Record<string, any> = {}, source = 'ibb-homepage'): EventContract {
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

  const observer = new KernelObserver(bridge);
  observer.start();

  const spatialHost = document.getElementById('spatial-canvas');
  const spatialLive = document.getElementById('spatial-live-region');
  const spatial = spatialHost ? new SpatialRenderer(spatialHost, spatialLive) : null;

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
    levelUp: () => {
      const current = bridge.getCurrentState().player.level || 1;
      return bus.emit(makeEvent('milestone.level_up', { newLevel: current + 1, xp: current * 150 }));
    },
    gain: (resource = 'bytes', amount = 10) => bus.emit(makeEvent('economic.resource_gained', { resource, amount })),
    spend: (resource = 'gold', amount = 60) => bus.emit(makeEvent('economic.resource_spent', { resource, amount })),
    focusSpatial: () => spatial?.focusNext(),
    getSpatialNodeCount: () => spatial?.getNodeCount() || 0,
    clear: () => { persistor.clear(); window.location.reload(); },
  };

  (window as any).LiquidMemoryKernel = api;
  (window as any).LiquidMemorySpatial = spatial;

  document.querySelectorAll<HTMLElement>('[data-kernel-event]').forEach((el) => {
    el.addEventListener('click', () => {
      const type = el.dataset.kernelEvent || 'system.heartbeat';
      const payload = el.dataset.kernelPayload ? JSON.parse(el.dataset.kernelPayload) : {};
      if (type === 'milestone.level_up') api.levelUp();
      else bus.emit(makeEvent(type, payload));
    });
  });

  bus.emit(makeEvent('lifecycle.start', { page: location.pathname }));
  window.setInterval(() => bus.emit(makeEvent('system.heartbeat', { path: location.pathname })), 30000);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initKernel);
else initKernel();
