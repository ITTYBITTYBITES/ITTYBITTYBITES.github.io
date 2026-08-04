/**
 * YearGlass — Room Scene
 *
 * A lightweight DOM representation of the cozy evening workspace that frames
 * the terrarium: a desk surface, a warm lamp, and a window that responds to
 * the current time of day. Kept as a stable, non-rendering backdrop so the
 * WebGL canvas stays free for the dome. Toggling the lamp updates a CSS class
 * that the theme uses to brighten/dim the scene.
 */

export interface RoomState {
  lampOn: boolean;
  night: boolean;
}

export class RoomScene {
  private readonly root: HTMLElement;
  private readonly lamp: HTMLElement;
  private readonly window: HTMLElement;
  private readonly state: RoomState = { lampOn: true, night: false };
  private disposed = false;

  constructor(container: HTMLElement) {
    this.root = document.createElement('div');
    this.root.className = 'yearglass-room';
    this.root.style.cssText =
      'position:absolute;inset:0;pointer-events:none;overflow:hidden;';

    this.window = document.createElement('div');
    this.window.className = 'yearglass-room-window';
    this.window.style.cssText =
      'position:absolute;top:6%;left:8%;width:26%;height:30%;border-radius:14px;' +
      'background:linear-gradient(160deg,#0c1524,#1a2c44);box-shadow:inset 0 0 40px rgba(0,0,0,0.5);';

    this.lamp = document.createElement('div');
    this.lamp.className = 'yearglass-room-lamp';
    this.lamp.style.cssText =
      'position:absolute;top:14%;right:12%;width:34%;height:44%;' +
      'background:radial-gradient(circle at 50% 60%,rgba(255,186,94,0.5),rgba(255,150,60,0.05));';

    this.root.append(this.window, this.lamp);
    container.appendChild(this.root);
  }

  setLamp(on: boolean): void {
    this.state.lampOn = on;
    this.lamp.classList.toggle('off', !on);
  }

  /** Night detection based on a 0..24 hour value. */
  setTimeOfDay(hours: number): void {
    const night = hours < 6.5 || hours >= 19.5;
    this.state.night = night;
    this.root.classList.toggle('night', night);
    this.window.classList.toggle('night', night);
  }

  get isNight(): boolean {
    return this.state.night;
  }

  destroy(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.root.remove();
  }
}
