import { GlobalEventBus } from '../core/kernel/bus/GlobalEventBus';
import { GamePlugin } from './types/GamePlugin';

const registeredPlugins: GamePlugin[] = [];

export function registerPlugin(plugin: GamePlugin, bus: GlobalEventBus): void {
  plugin.initialize(bus);
  registeredPlugins.push(plugin);
  console.log(`[PluginRegistry] Registered: ${plugin.id}`);
}

export function getRegisteredPlugins(): GamePlugin[] {
  return [...registeredPlugins];
}

export function destroyAllPlugins(): void {
  registeredPlugins.forEach(plugin => {
    if (plugin.destroy) plugin.destroy();
  });
  registeredPlugins.length = 0;
}
