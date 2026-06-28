import { GlobalEventBus } from './core/kernel/bus/GlobalEventBus';
import { reduce } from './core/kernel/reducer/PlatformReducer';
import { VisualBridge } from './core/kernel/bridge/VisualBridge';
import { INITIAL_PLATFORM_STATE } from './core/kernel/state/PlatformState';
import { ResourceCollector } from './modules/collector/game';
import { registerPlugin } from './modules/registry';
import { MonetizationLayer } from './core/monetization/MonetizationLayer';

console.log('=== MONETIZATIONLAYER TRACE ===\n');

const bus = GlobalEventBus.getInstance();
const bridge = new VisualBridge({ ...INITIAL_PLATFORM_STATE });

// Wire reducer
bus.subscribe((event) => {
  const current = bridge.getCurrentState();
  const newState = reduce(current, event);
  bridge.onStateUpdated(newState);
});

// Register game + monetization
const collector = new ResourceCollector();
registerPlugin(collector, bus);

const monetization = new MonetizationLayer();
monetization.init(bus);

// Trigger spending to activate monetization logic
collector.collect('gold', 10); // small spend (won't trigger)
bus.emit({
  eventId: crypto.randomUUID(),
  sequenceId: Date.now(),
  timestamp: new Date().toISOString(),
  type: 'economic.resource_spent',
  payload: { resource: 'gold', amount: 55 },
  source: 'demo-spend',
});

console.log('\n=== TRACE COMPLETE ===');