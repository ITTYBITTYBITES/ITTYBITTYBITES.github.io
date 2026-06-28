import { PlatformState } from '../../core/kernel/state/PlatformState';
import { selectPlayerLevel } from '../selectors/playerSelectors';
import { VisualBridge } from '../../core/kernel/bridge/VisualBridge';

export class MechanicalOrrery {
  public readonly id = 'mechanical-orrery';
  public element: HTMLElement | null = null;

  constructor(bridge: VisualBridge) {
    bridge.subscribe((state) => this.onStateChange(state));
  }

  onStateChange(state: PlatformState): void {
    if (!this.element) return;

    const level = selectPlayerLevel(state);
    const rotation = level * 45;
    const speed = Math.min(1 + (level - 1) * 0.2, 3);

    this.element.style.transform = `rotate(${rotation}deg)`;
    this.element.style.opacity = level > 3 ? '0.95' : '1';
    this.element.innerText = `⚙️ Orrery • Level ${level} • ${rotation}° @ ${speed.toFixed(1)}x`;
  }

  getVisualState() {
    return this.element
      ? { innerText: this.element.innerText, transform: this.element.style.transform }
      : { innerText: '', transform: '' };
  }
}
