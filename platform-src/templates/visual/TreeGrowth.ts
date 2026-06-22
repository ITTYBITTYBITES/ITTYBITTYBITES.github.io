import { PlatformState } from '../../core/kernel/state/PlatformState';
import { selectPlayerLevel } from '../selectors/playerSelectors';
import { VisualBridge } from '../../core/kernel/bridge/VisualBridge';

export class TreeGrowth {
  public readonly id = 'tree-growth';
  public element: HTMLElement | null = null;

  constructor(bridge: VisualBridge) {
    bridge.subscribe((state) => this.onStateChange(state));
  }

  onStateChange(state: PlatformState): void {
    if (!this.element) return;

    const level = selectPlayerLevel(state);
    const scale = 1 + (level - 1) * 0.3;

    this.element.style.transform = `scale(${scale})`;
    this.element.innerHTML = `🌳 Tree Level ${level}<br><small>scale: ${scale.toFixed(2)}</small>`;

    console.log(`[TreeGrowth] Updated → Level ${level}`);
  }

  getVisualState() {
    return this.element
      ? { innerText: this.element.innerText, transform: this.element.style.transform }
      : { innerText: '', transform: '' };
  }
}
