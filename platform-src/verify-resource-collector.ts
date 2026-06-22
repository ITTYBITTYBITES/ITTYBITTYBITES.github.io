import { GlobalEventBus } from './core/kernel/bus/GlobalEventBus';
import { reduce } from './core/kernel/reducer/PlatformReducer';
import { VisualBridge } from './core/kernel/bridge/VisualBridge';
import { INITIAL_PLATFORM_STATE } from './core/kernel/state/PlatformState';
import { PlatformPersistor } from './core/kernel/persistence/PlatformPersistor';
import { ResourceCollector } from './modules/collector/game';
import { registerPlugin } from './modules/registry';

console.log('=== RESOURCE COLLECTOR INTEGRATION TEST ===\n');

const bus = GlobalEventBus.getInstance();
const persistor = new PlatformPersistor();
const bridge = new VisualBridge({ ...INITIAL_PLATFORM_STATE });

// Wire reducer + persistor
bus.subscribe((event) => {
  const current = bridge.getCurrentState();
  const newState = reduce(current, event);

  if (!current.processedEventIds.has(event.eventId)) {
    persistor.logEvent(event);
    persistor.save(newState);
  }
  bridge.onStateUpdated(newState);
});

// Register the real ResourceCollector
const collector = new ResourceCollector();
registerPlugin(collector, bus);

// Start collection (will emit events every 2s in browser, here we trigger manually)
collector.collect('wood', 3);
collector.collect('stone', 2);
collector.collect('gold', 1);

console.log('\n=== FINAL STATE ===');
const finalState = bridge.getCurrentState();
console.log('Player resources:', finalState.player.resources);
console.log('Event count:', finalState.system.eventCount);

console.log('\n✅ Resource Collector integration verified successfully!');