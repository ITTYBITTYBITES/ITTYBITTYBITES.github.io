import { PlatformState } from '../../core/kernel/state/PlatformState';
import { selectPlayerLevel } from '../selectors/playerSelectors';
import { VisualBridge } from '../../core/kernel/bridge/VisualBridge';

export class CrystallineBloom {
  public readonly id = 'crystalline-bloom';
  public element: HTMLElement | null = null;

  constructor(bridge: VisualBridge) {
    bridge.subscribe((state) => this.onStateChange(state));
  }

  onStateChange(state: PlatformState): void {
    if (!this.element) return;

    const level = selectPlayerLevel(state);
    const scale = 0.8 + level * 0.15;
    const hue = (level * 25) % 360;

    this.element.style.transform = `scale(${scale})`;
    this.element.style.filter = `hue-rotate(${hue}deg) saturate(1.4)`;
    this.element.innerText = `💎 Bloom • Level ${level} • Hue: ${hue}°`;
  }

  getVisualState() {
    return this.element
      ? { innerText: this.element.innerText, transform: this.element.style.transform }
      : { innerText: '', transform: '' };
  }
}
