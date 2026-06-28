import type { PlatformState } from '../kernel';
import { VisualBridge } from '../kernel';

function readPath(obj: any, path: string): any {
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

export class KernelObserver {
  constructor(private bridge: VisualBridge, private root: ParentNode = document) {}

  start(): () => void {
    return this.bridge.subscribe((state) => this.render(state));
  }

  render(state: PlatformState): void {
    this.root.querySelectorAll<HTMLElement>('[data-kernel-bind]').forEach((el) => {
      const path = el.dataset.kernelBind || '';
      const value = readPath(state, path);
      el.textContent = value == null ? '0' : String(value);
    });
  }
}
