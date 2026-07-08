import { audio } from '../platform/audio';
import { signal } from '../platform/feedback';

export class AudioToggle extends HTMLElement {
  private button!: HTMLButtonElement;
  private statusEl!: HTMLSpanElement;

  connectedCallback() {
    this.render();
    window.addEventListener('ibb:audiochange', this.render.bind(this));
  }

  disconnectedCallback() {
    window.removeEventListener('ibb:audiochange', this.render.bind(this));
  }

  private render() {
    const prefs = audio.getPrefs();
    const enabled = prefs.enabled;

    if (!this.button) {
      this.innerHTML = '';
      this.style.display = 'inline-flex';
      this.style.alignItems = 'center';
      this.style.gap = '0.5rem';

      this.button = document.createElement('button');
      this.button.type = 'button';
      this.button.className = 'btn subtle audio-toggle-btn';
      this.button.style.minHeight = '2.25rem';
      this.button.style.padding = '0.35rem 0.7rem';
      this.button.style.fontSize = '0.875rem';

      this.button.addEventListener('click', () => {
        const nowOn = audio.toggle();
        if (nowOn) {
          // welcoming toggle-on chime
          void audio.play('return');
          signal('confirm', { announceText: 'Sound on. Interaction tones enabled.', silent: true });
        } else {
          signal('back', { announceText: 'Sound off.', silent: true });
        }
        this.update();
      });

      this.statusEl = document.createElement('span');
      this.statusEl.className = 'audio-status meta';
      this.statusEl.style.fontSize = '0.75rem';
      this.statusEl.setAttribute('aria-hidden', 'true');

      this.append(this.button, this.statusEl);

      // first-visit gentle invitation (non-intrusive)
      try {
        const seen = localStorage.getItem('ibb-audio-nudge-v1');
        if (!seen && !enabled && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          setTimeout(() => {
            if (!audio.getPrefs().enabled) {
              this.button.classList.add('audio-nudge');
              setTimeout(() => this.button.classList.remove('audio-nudge'), 2200);
            }
          }, 1600);
          localStorage.setItem('ibb-audio-nudge-v1', '1');
        }
      } catch { /* ignore */ }
    }

    this.update();
  }

  private update() {
    const prefs = audio.getPrefs();
    const enabled = prefs.enabled;
    this.button.setAttribute('aria-pressed', String(enabled));
    this.button.setAttribute('aria-label', enabled ? 'Sound on — toggle to mute interaction tones' : 'Sound off — toggle to enable interaction tones');
    this.button.textContent = enabled ? 'Sound on' : 'Sound off';

    const meta = audio.getCollectionMeta();
    this.statusEl.textContent = enabled ? meta.mood : '';
    this.statusEl.title = enabled ? `${meta.name}: ${meta.mood}` : '';
  }
}

if (!customElements.get('audio-toggle')) {
  customElements.define('audio-toggle', AudioToggle);
}
