import { GlobalEventBus } from './core/kernel/bus/GlobalEventBus';
import { reduce } from './core/kernel/reducer/PlatformReducer';
import { VisualBridge } from './core/kernel/bridge/VisualBridge';
import { INITIAL_PLATFORM_STATE, PlatformState } from './core/kernel/state/PlatformState';
import { PlatformPersistor } from './core/kernel/persistence/PlatformPersistor';
import { TemplateRegistry } from './templates/registry/TemplateRegistry';
import { TreeGrowth } from './templates/visual/TreeGrowth';
import { MechanicalOrrery } from './templates/visual/MechanicalOrrery';
import { CrystallineBloom } from './templates/visual/CrystallineBloom';
import { RewardBanner } from './templates/visual/RewardBanner';
import { ResourceCollector } from './modules/collector/game';
import { MonetizationLayer } from './core/monetization/MonetizationLayer';
import { registerPlugin, destroyAllPlugins } from './modules/registry';
import { EventContract } from './core/kernel/types/EventContract';

const visualRoot = document.getElementById('visual-root');
const statusEl = document.getElementById('status');

if (!visualRoot || !statusEl) {
  throw new Error('Kernel demo DOM anchors are missing.');
}

const bus = GlobalEventBus.getInstance();
const persistor = new PlatformPersistor();

let uiSequence = 0;
const nextUiSequence = () => ++uiSequence;
const makeEvent = (type: string, payload: Record<string, any>, source = 'kernel-demo-ui'): EventContract => ({
  eventId: crypto.randomUUID(),
  sequenceId: nextUiSequence(),
  timestamp: new Date().toISOString(),
  type,
  payload,
  source,
  metadata: { version: '1.0.0' },
});

const cloneInitialState = (): PlatformState => ({
  ...INITIAL_PLATFORM_STATE,
  timestamp: new Date().toISOString(),
  processedEventIds: new Set<string>(),
  lastSequenceIds: {},
  player: { ...INITIAL_PLATFORM_STATE.player, resources: {} },
  world: {
    ...INITIAL_PLATFORM_STATE.world,
    entities: {},
    time: { totalElapsedMs: 0, lastEventTimestamp: new Date().toISOString() },
  },
  system: { eventCount: 0, errors: [] },
});

const rehydratedState = persistor.rehydrate();
const initialState: PlatformState = rehydratedState || cloneInitialState();
statusEl.textContent = rehydratedState
  ? 'Status: Rehydrated from previous session'
  : 'Status: New session started';

const bridge = new VisualBridge(initialState);

function updateResourceDisplay(state: PlatformState) {
  const woodEl = document.getElementById('res-wood');
  const stoneEl = document.getElementById('res-stone');
  const goldEl = document.getElementById('res-gold');
  if (woodEl) woodEl.textContent = String(state.player.resources.wood || 0);
  if (stoneEl) stoneEl.textContent = String(state.player.resources.stone || 0);
  if (goldEl) goldEl.textContent = String(state.player.resources.gold || 0);
}

bridge.subscribe(updateResourceDisplay);

bus.subscribe((event) => {
  const currentState = bridge.getCurrentState();
  const newState = reduce(currentState, event);

  if (newState !== currentState && newState.processedEventIds.has(event.eventId)) {
    persistor.logEvent(event);
    persistor.save(newState);
    statusEl.textContent = `Status: ${event.type} processed • events ${newState.system.eventCount}`;
  }

  bridge.onStateUpdated(newState);
});

const registry = new TemplateRegistry(visualRoot);
const treeGrowth = new TreeGrowth(bridge);
const orrery = new MechanicalOrrery(bridge);
const bloom = new CrystallineBloom(bridge);
const rewardBanner = new RewardBanner(bus);

registry.register(treeGrowth);
registry.register(orrery);
registry.register(bloom);
registry.register(rewardBanner as any);
registry.mount('tree-growth');
registry.mount('mechanical-orrery');
registry.mount('crystalline-bloom');
registry.notifyAll(initialState);

const collector = new ResourceCollector();
registerPlugin(collector, bus);
collector.onStart();

const monetization = new MonetizationLayer();
monetization.init(bus);

function levelUp(level: number) {
  bus.emit(makeEvent('milestone.level_up', { newLevel: level, xp: level * 100 }));
}

function spendGold(amount: number) {
  bus.emit(makeEvent('economic.resource_spent', { resource: 'gold', amount }));
}

document.getElementById('btn-level-2')?.addEventListener('click', () => levelUp(2));
document.getElementById('btn-level-3')?.addEventListener('click', () => levelUp(3));
document.getElementById('btn-level-4')?.addEventListener('click', () => levelUp(4));
document.getElementById('btn-level-5')?.addEventListener('click', () => levelUp(5));
document.getElementById('btn-spend')?.addEventListener('click', () => spendGold(60));
document.getElementById('btn-clear')?.addEventListener('click', () => {
  collector.destroy();
  destroyAllPlugins();
  persistor.clear();
  bus.reset();
  window.location.reload();
});

function runTemporalStressTest() {
  const source = 'stress-test';
  const base = {
    timestamp: new Date().toISOString(),
    type: 'milestone.level_up',
    payload: { newLevel: 99 },
    source,
    metadata: { version: '1.0.0' },
  };
  bus.emit({ ...base, eventId: crypto.randomUUID(), sequenceId: 10 });
  bus.emit({ ...base, eventId: crypto.randomUUID(), sequenceId: 9 });
  document.getElementById('status')!.textContent = 'Status: Temporal stress test emitted sequence 10 then 9';
}

const testBtn = document.createElement('button');
testBtn.textContent = 'Temporal Stress Test';
testBtn.className = 'secondary';
testBtn.addEventListener('click', runTemporalStressTest);
document.getElementById('controls')?.appendChild(testBtn);

console.log('[Kernel] Mounted. Current player level:', initialState.player.level);
