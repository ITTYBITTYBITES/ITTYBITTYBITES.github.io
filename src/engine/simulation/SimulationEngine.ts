/**
 * YearGlass — Simulation Engine
 *
 * Coordinates the full sanctuary experience:
 *   - WebGL2 glass scene & camera framing
 *   - Real-time ecosystem simulation (plants, soil moisture, procedural growth)
 *   - Creature AI (Pip the ladybug) & gesture reaction engine
 *   - IndexedDB state persistence & offline progression calculation
 *   - Premium high-contrast UI overlays (Journal, Settings, Focus Mode, Evolution popups)
 */

import { AudioEngine } from '../audio/AudioEngine';
import { RenderPipeline } from '../rendering/RenderPipeline';
import { CameraController } from '../rendering/CameraController';
import { RoomScene } from '../rendering/RoomScene';
import { SaveEngine } from '../storage/SaveEngine';
import { MemoryEngine } from './MemoryEngine';
import { GrowthSystem, GrowthEvent } from './GrowthSystem';
import { PipAI } from './PipAI';

const DAY_MS = 90_000; // 90 seconds of wall time = 1 simulated sanctuary day
const ECOSYSTEM_SAVE_KEY = 'ecosystem-growth';
const PIP_SAVE_KEY = 'pip-state';
const USER_SETTINGS_KEY = 'user-settings';

export interface SimulationHooks {
  onMemory?: (message: string) => void;
  onReady?: () => void;
  onPipObserved?: (visited: number) => void;
  onEvolutionMilestone?: (event: GrowthEvent) => void;
}

export class SimulationEngine {
  private readonly audio = new AudioEngine();
  private readonly save = new SaveEngine();
  private readonly memory = new MemoryEngine(this.save);
  private readonly growth = new GrowthSystem();
  private readonly pip = new PipAI();
  private readonly camera = new CameraController();

  private room: RoomScene | null = null;
  private pipeline: RenderPipeline | null = null;

  private readonly hooks: SimulationHooks;
  private clock = { dayStart: Date.now(), lampOn: true, audioMuted: false };
  private started = false;
  private destroyed = false;

  // UI Elements
  private uiContainer: HTMLElement | null = null;
  private activeModal: HTMLElement | null = null;
  private activeToast: HTMLElement | null = null;
  private toastTimeout = 0;

  constructor(hooks: SimulationHooks = {}) {
    this.hooks = hooks;

    this.pip.setOnVisit(() => {
      const visits = this.pip.observation.visited;
      void this.memory.record('creature-visit', 'Pip came to say hello.').then((ev) => {
        this.hooks.onMemory?.(ev.message);
        this.hooks.onPipObserved?.(visits);
      });
      void this.saveState();
    });
  }

  async mount(container: HTMLElement): Promise<void> {
    if (this.started) return;
    this.started = true;

    try {
      await this.save.open();
      await this.memory.init();
      await this.loadEcosystemState();
    } catch (err) {
      console.warn('[YearGlass] storage init warning — continuing in-memory:', err);
    }

    this.seedWorldIfEmpty();
    this.checkOfflineProgression();

    this.room = new RoomScene(container);
    this.room.setLamp(this.clock.lampOn);
    this.room.setTimeOfDay(this.clock.lampOn ? 10.0 : 22.0);

    this.camera.computeDesktop();

    this.pipeline = new RenderPipeline(
      container,
      this.camera,
      (dt) => this.frame(dt),
      (normX, normY) => this.handleDomeTap(normX, normY)
    );

    this.pipeline.start();
    this.audio.installGestureUnlock();

    this.mountUIOverlay(container);

    const firstDay = this.memory.currentDay;
    if (this.memory.allEvents().length === 0) {
      void this.memory
        .record('first-launch', `Day ${firstDay}: The sanctuary began.`)
        .then((ev) => this.hooks.onMemory?.(ev.message));
    }

    this.hooks.onReady?.();
  }

  private async loadEcosystemState(): Promise<void> {
    const [eco, pipState, settings] = await Promise.all([
      this.save.get<any>(ECOSYSTEM_SAVE_KEY),
      this.save.get<any>(PIP_SAVE_KEY),
      this.save.get<any>(USER_SETTINGS_KEY),
    ]);

    if (eco) this.growth.fromJSON(eco);
    if (pipState) this.pip.fromJSON(pipState);
    if (settings) {
      if (typeof settings.lampOn === 'boolean') this.clock.lampOn = settings.lampOn;
      if (typeof settings.audioMuted === 'boolean') {
        this.clock.audioMuted = settings.audioMuted;
        if (settings.audioMuted) this.audio.stopAmbient();
      }
    }
  }

  private async saveState(): Promise<void> {
    try {
      await Promise.all([
        this.save.put(ECOSYSTEM_SAVE_KEY, this.growth.toJSON()),
        this.save.put(PIP_SAVE_KEY, this.pip.toJSON()),
        this.save.put(USER_SETTINGS_KEY, {
          lampOn: this.clock.lampOn,
          audioMuted: this.clock.audioMuted,
        }),
      ]);
    } catch (err) {
      console.warn('[YearGlass] state save warning:', err);
    }
  }

  private seedWorldIfEmpty(): void {
    if (this.growth.plantCount() === 0) {
      this.growth.addPlant('moss', 0.35, 0.6);
      this.growth.addPlant('fern', 0.55, 0.68);
      this.growth.addPlant('orchid', 0.5, 0.52);
      this.growth.addPlant('vine', 0.68, 0.6);
      void this.saveState();
    }
  }

  private checkOfflineProgression(): void {
    const lastSave = this.memory.lastSaveTimestamp;
    if (!lastSave) return;

    const elapsedMs = Date.now() - lastSave;
    const elapsedDays = Math.floor(elapsedMs / DAY_MS);

    if (elapsedDays >= 1) {
      const daysToAdvance = Math.min(7, elapsedDays);
      let totalMilestones: GrowthEvent[] = [];

      for (let i = 0; i < daysToAdvance; i++) {
        const milestones = this.growth.tickDay();
        totalMilestones.push(...milestones);
      }

      void this.memory.advanceDay(daysToAdvance);
      const currentDay = this.memory.currentDay;
      const offlineMsg = `Welcome back! ${daysToAdvance} day${daysToAdvance === 1 ? '' : 's'} passed in quiet growth. Day ${currentDay}.`;
      void this.memory.record('journal', offlineMsg);

      setTimeout(() => {
        this.showToast('🌿 Sanctuary Reflection', offlineMsg);
        if (totalMilestones.length > 0) {
          const firstM = totalMilestones[0];
          this.showEvolutionPopup(firstM);
        }
      }, 800);

      void this.saveState();
    }
  }

  private readonly frame = (dt: number): void => {
    if (this.destroyed) return;

    this.pip.setPresence(true);
    this.pip.update(dt);

    if (this.pipeline) {
      this.pipeline.scene.setSimulationData(
        this.growth.allPlants(),
        this.pip.observation,
        this.growth.moisture
      );
    }

    const elapsed = Date.now() - this.clock.dayStart;
    if (elapsed >= DAY_MS) {
      this.clock.dayStart = Date.now();
      void this.advanceDay();
    }
  };

  private async advanceDay(): Promise<void> {
    const milestones = this.growth.tickDay();
    for (const m of milestones) {
      await this.memory.record(
        'growth-milestone',
        m.message,
        { species: m.species, stage: m.stageName, growth: m.growth }
      );
      this.hooks.onEvolutionMilestone?.(m);
      this.showEvolutionPopup(m);
    }

    const day = this.memory.currentDay;
    const dayMsg = `The sanctuary enters day ${day + 1}.`;
    this.hooks.onMemory?.(dayMsg);
    this.showToast('🌅 New Sanctuary Day', `Day ${day + 1} has arrived.`);
    await this.memory.advanceDay();
    await this.saveState();
    this.updateHUDStatus();
  }

  /** Dome pointer/touch tap handler. */
  private handleDomeTap(normX: number, normY: number): void {
    this.audio.play('shimmer');
    this.pipeline?.wake();

    const pipMsg = this.pip.reactToTap(normX, normY);
    const moisturePct = Math.round(this.growth.moisture * 100);

    void this.memory.record('creature-visit', pipMsg);
    this.hooks.onPipObserved?.(this.pip.observation.visited);

    if (!this.camera.currentView.focusMode) {
      this.camera.focusOnDome();
    }

    this.showDialogueCard('The ladybug watches...', `${pipMsg} Soil moisture is at ${moisturePct}%.`);
    void this.saveState();
  }

  /** Mount responsive, high-contrast UI overlay HUD. */
  private mountUIOverlay(container: HTMLElement): void {
    this.uiContainer = document.createElement('div');
    this.uiContainer.className = 'yearglass-ui-overlay';
    this.uiContainer.style.cssText =
      'position:absolute;inset:0;pointer-events:none;z-index:30;' +
      'display:flex;flex-direction:column;justify-content:space-between;padding:1rem;';

    // Top status bar
    const topBar = document.createElement('div');
    topBar.className = 'yearglass-top-bar';
    topBar.style.cssText =
      'display:flex;align-items:center;justify-content:space-between;width:100%;pointer-events:auto;';

    const statusBadge = document.createElement('button');
    statusBadge.id = 'yg-status-badge';
    statusBadge.className = 'yg-btn-badge';
    statusBadge.setAttribute('aria-label', 'Sanctuary status: Day and soil moisture');
    statusBadge.style.cssText =
      'display:inline-flex;align-items:center;gap:0.5rem;padding:0.5rem 0.9rem;' +
      'background:rgba(253,251,247,0.92);color:#1a1a1a;border:1px solid rgba(191,160,106,0.4);' +
      'border-radius:999px;font-size:0.88rem;font-weight:700;box-shadow:0 4px 12px rgba(0,0,0,0.25);' +
      'cursor:pointer;transition:transform 0.15s ease;';

    statusBadge.addEventListener('click', () => this.openJournalModal());

    const actionRow = document.createElement('div');
    actionRow.style.cssText = 'display:flex;align-items:center;gap:0.5rem;';

    const createHeaderBtn = (label: string, icon: string, onClick: () => void) => {
      const btn = document.createElement('button');
      btn.className = 'yg-hud-btn';
      btn.setAttribute('aria-label', label);
      btn.title = label;
      btn.innerHTML = `${icon} <span class="yg-btn-label">${label}</span>`;
      btn.style.cssText =
        'display:inline-flex;align-items:center;gap:0.4rem;padding:0.55rem 0.85rem;' +
        'background:rgba(253,251,247,0.92);color:#1a1a1a;border:1px solid rgba(191,160,106,0.4);' +
        'border-radius:999px;font-size:0.85rem;font-weight:700;box-shadow:0 4px 12px rgba(0,0,0,0.25);' +
        'cursor:pointer;user-select:none;touch-action:manipulation;min-height:44px;';

      btn.addEventListener('pointerdown', () => btn.classList.add('is-pressed'));
      btn.addEventListener('pointerup', () => btn.classList.remove('is-pressed'));
      btn.addEventListener('mouseleave', () => btn.classList.remove('is-pressed'));
      btn.addEventListener('click', onClick);
      return btn;
    };

    const focusBtn = createHeaderBtn('Focus Mode', '🔍', () => {
      const isFocused = this.camera.toggleFocus();
      this.audio.play('shimmer');
      this.showToast(isFocused ? '🔍 Focus Mode Active' : '🖼️ Room View', isFocused ? 'Close-up terrarium inspection mode.' : 'Framed workspace desktop mode.');
    });

    const waterBtn = createHeaderBtn('Water', '💧', () => {
      const msg = this.growth.waterPlants(0.3);
      this.audio.play('shimmer');
      void this.memory.record('care-water', msg);
      this.showToast('💧 Terrarium Care', msg);
      this.updateHUDStatus();
      void this.saveState();
    });

    const journalBtn = createHeaderBtn('Journal', '📖', () => this.openJournalModal());
    const settingsBtn = createHeaderBtn('Settings', '⚙️', () => this.openSettingsModal());

    actionRow.append(focusBtn, waterBtn, journalBtn, settingsBtn);
    topBar.append(statusBadge, actionRow);

    // Bottom container for dialogue cards and toasts
    const bottomSlot = document.createElement('div');
    bottomSlot.id = 'yg-bottom-slot';
    bottomSlot.style.cssText =
      'display:flex;flex-direction:column;align-items:center;gap:0.75rem;width:100%;pointer-events:none;';

    this.uiContainer.append(topBar, bottomSlot);
    container.appendChild(this.uiContainer);

    this.updateHUDStatus();
  }

  private updateHUDStatus(): void {
    const badge = document.getElementById('yg-status-badge');
    if (!badge) return;
    const day = this.memory.currentDay;
    const moisture = Math.round(this.growth.moisture * 100);
    badge.innerHTML = `<span>☀️ Day ${day}</span> · <span>💧 ${moisture}% Soil</span>`;
  }

  /** High-contrast dialogue card for resident reactions and observations. */
  showDialogueCard(title: string, message: string): void {
    const slot = document.getElementById('yg-bottom-slot');
    if (!slot) return;

    const card = document.createElement('div');
    card.className = 'yg-dialogue-card animate-in';
    card.style.cssText =
      'pointer-events:auto;max-width:32rem;width:calc(100% - 2rem);padding:1rem 1.25rem;' +
      'background:#fdfbf7;color:#1a1a1a;border:1px solid rgba(191,160,106,0.5);' +
      'border-radius:1rem;box-shadow:0 16px 40px rgba(0,0,0,0.38), 0 2px 8px rgba(0,0,0,0.2);' +
      'font-family:system-ui,-apple-system,sans-serif;line-height:1.5;';

    card.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.4rem;">
        <h4 style="margin:0;font-size:1rem;font-weight:800;color:#111;">${title}</h4>
        <button class="yg-close-btn" style="background:none;border:none;font-size:1.1rem;cursor:pointer;color:#555;padding:0.2rem 0.4rem;min-height:36px;" aria-label="Close">✕</button>
      </div>
      <p style="margin:0;font-size:0.92rem;color:#222;font-weight:500;">${message}</p>
    `;

    const closeBtn = card.querySelector('.yg-close-btn');
    closeBtn?.addEventListener('click', () => card.remove());

    slot.querySelectorAll('.yg-dialogue-card').forEach((el) => el.remove());
    slot.appendChild(card);

    setTimeout(() => {
      if (card.parentNode) card.remove();
    }, 8000);
  }

  /** Automatic Milestone Evolution Popup. */
  showEvolutionPopup(event: GrowthEvent): void {
    const slot = document.getElementById('yg-bottom-slot');
    if (!slot) return;

    const popup = document.createElement('div');
    popup.className = 'yg-evolution-popup animate-in';
    popup.style.cssText =
      'pointer-events:auto;max-width:30rem;width:calc(100% - 2rem);padding:1.1rem 1.35rem;' +
      'background:linear-gradient(180deg, #fefdf9 0%, #f7f2ea 100%);color:#1a1a1a;' +
      'border:2px solid #bfa06a;border-radius:1.1rem;box-shadow:0 20px 48px rgba(0,0,0,0.45);' +
      'text-align:left;line-height:1.55;';

    popup.innerHTML = `
      <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;">
        <span style="font-size:1.3rem;">🌿</span>
        <span style="font-size:0.75rem;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;color:#8a6a2a;">Ecosystem Evolution</span>
      </div>
      <h3 style="margin:0 0 0.4rem;font-size:1.15rem;font-weight:800;color:#111;">${event.stageName}</h3>
      <p style="margin:0 0 0.75rem;font-size:0.92rem;color:#222;">${event.message}</p>
      <div style="display:flex;justify-content:flex-end;">
        <button class="yg-ack-btn" style="padding:0.45rem 1rem;background:#2e3f57;color:#fff;border:none;border-radius:999px;font-size:0.82rem;font-weight:700;cursor:pointer;min-height:38px;">Celebrate Growth</button>
      </div>
    `;

    popup.querySelector('.yg-ack-btn')?.addEventListener('click', () => popup.remove());

    slot.querySelectorAll('.yg-evolution-popup').forEach((el) => el.remove());
    slot.appendChild(popup);
  }

  showToast(title: string, text: string): void {
    const slot = document.getElementById('yg-bottom-slot');
    if (!slot) return;

    if (this.activeToast) this.activeToast.remove();
    window.clearTimeout(this.toastTimeout);

    const toast = document.createElement('div');
    toast.className = 'yg-toast animate-in';
    toast.style.cssText =
      'pointer-events:auto;padding:0.7rem 1.1rem;background:#fdfbf7;color:#1a1a1a;' +
      'border:1px solid rgba(191,160,106,0.4);border-radius:999px;' +
      'box-shadow:0 10px 28px rgba(0,0,0,0.3);font-size:0.88rem;font-weight:600;';
    toast.innerHTML = `<strong>${title}</strong> — ${text}`;

    this.activeToast = toast;
    slot.appendChild(toast);

    this.toastTimeout = window.setTimeout(() => {
      if (this.activeToast === toast) {
        toast.remove();
        this.activeToast = null;
      }
    }, 4500);
  }

  openJournalModal(): void {
    if (this.activeModal) this.activeModal.remove();

    const overlay = document.createElement('div');
    overlay.className = 'yg-modal-overlay';
    overlay.style.cssText =
      'position:fixed;inset:0;z-index:50;background:rgba(10,12,10,0.72);' +
      'backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:1.5rem;';

    const modal = document.createElement('div');
    modal.className = 'yg-modal-card animate-in';
    modal.style.cssText =
      'max-width:34rem;width:100%;max-height:80vh;display:flex;flex-direction:column;' +
      'background:#fdfbf7;color:#1a1a1a;border:1px solid rgba(191,160,106,0.5);' +
      'border-radius:1.2rem;box-shadow:0 24px 60px rgba(0,0,0,0.5);overflow:hidden;';

    const summaryText = this.memory.summarize();
    const events = this.memory.recent(15);

    modal.innerHTML = `
      <div style="padding:1.25rem;border-bottom:1px solid rgba(0,0,0,0.1);display:flex;align-items:center;justify-content:space-between;background:#f7f2ea;">
        <div>
          <h3 style="margin:0;font-size:1.2rem;font-weight:800;color:#111;">Sanctuary Journal & Memories</h3>
          <p style="margin:0.2rem 0 0;font-size:0.82rem;color:#555;">${summaryText}</p>
        </div>
        <button class="yg-modal-close" style="background:none;border:none;font-size:1.3rem;cursor:pointer;color:#333;padding:0.3rem 0.6rem;" aria-label="Close modal">✕</button>
      </div>
      <div style="flex:1;overflow-y:auto;padding:1.25rem;display:flex;flex-direction:column;gap:0.75rem;">
        <div style="display:flex;gap:0.5rem;margin-bottom:0.5rem;">
          <input type="text" id="yg-journal-input" placeholder="Write a note in your sanctuary log..." style="flex:1;padding:0.6rem 0.9rem;border:1px solid #ccc;border-radius:0.5rem;font-size:0.9rem;color:#1a1a1a;background:#fff;" />
          <button id="yg-journal-submit" style="padding:0.6rem 1rem;background:#2e3f57;color:#fff;border:none;border-radius:0.5rem;font-weight:700;cursor:pointer;">Record</button>
        </div>
        <div id="yg-journal-list" style="display:flex;flex-direction:column;gap:0.6rem;">
          ${events.map(e => `
            <div style="padding:0.75rem;background:#f5efe6;border-left:3px solid #bfa06a;border-radius:0.4rem;font-size:0.88rem;color:#1a1a1a;">
              <div style="font-size:0.75rem;font-weight:700;color:#7a6020;margin-bottom:0.2rem;">Day ${e.day} · ${new Date(e.at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</div>
              <div>${e.message}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    this.activeModal = overlay;

    const closeBtn = modal.querySelector('.yg-modal-close');
    closeBtn?.addEventListener('click', () => {
      overlay.remove();
      this.activeModal = null;
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
        this.activeModal = null;
      }
    });

    const submitBtn = modal.querySelector('#yg-journal-submit');
    const input = modal.querySelector('#yg-journal-input') as HTMLInputElement;

    const handleRecord = () => {
      const val = input.value.trim();
      if (val) {
        void this.memory.addJournalEntry(val).then(() => {
          input.value = '';
          this.openJournalModal();
          this.showToast('📖 Journal Entry Saved', val);
        });
      }
    };

    submitBtn?.addEventListener('click', handleRecord);
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleRecord();
    });
  }

  openSettingsModal(): void {
    if (this.activeModal) this.activeModal.remove();

    const overlay = document.createElement('div');
    overlay.className = 'yg-modal-overlay';
    overlay.style.cssText =
      'position:fixed;inset:0;z-index:50;background:rgba(10,12,10,0.72);' +
      'backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:1.5rem;';

    const modal = document.createElement('div');
    modal.className = 'yg-modal-card animate-in';
    modal.style.cssText =
      'max-width:28rem;width:100%;padding:1.5rem;' +
      'background:#fdfbf7;color:#1a1a1a;border:1px solid rgba(191,160,106,0.5);' +
      'border-radius:1.2rem;box-shadow:0 24px 60px rgba(0,0,0,0.5);';

    modal.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem;">
        <h3 style="margin:0;font-size:1.2rem;font-weight:800;color:#111;">Sanctuary Settings</h3>
        <button class="yg-modal-close" style="background:none;border:none;font-size:1.3rem;cursor:pointer;color:#333;" aria-label="Close modal">✕</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:1rem;">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:0.75rem;background:#f5efe6;border-radius:0.6rem;">
          <div>
            <div style="font-weight:700;font-size:0.95rem;">Workspace Lamp</div>
            <div style="font-size:0.8rem;color:#555;">Toggle room lighting</div>
          </div>
          <button id="yg-toggle-lamp" style="padding:0.5rem 1rem;background:#2e3f57;color:#fff;border:none;border-radius:999px;font-weight:700;cursor:pointer;">${this.clock.lampOn ? 'Turn Off' : 'Turn On'}</button>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:0.75rem;background:#f5efe6;border-radius:0.6rem;">
          <div>
            <div style="font-weight:700;font-size:0.95rem;">Ambient Audio</div>
            <div style="font-size:0.8rem;color:#555;">Toggle soundscape</div>
          </div>
          <button id="yg-toggle-audio" style="padding:0.5rem 1rem;background:#2e3f57;color:#fff;border:none;border-radius:999px;font-weight:700;cursor:pointer;">${this.clock.audioMuted ? 'Unmute' : 'Mute'}</button>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:0.75rem;background:#f5efe6;border-radius:0.6rem;">
          <div>
            <div style="font-weight:700;font-size:0.95rem;color:#b91c1c;">Reset Sanctuary</div>
            <div style="font-size:0.8rem;color:#555;">Clear local progress</div>
          </div>
          <button id="yg-reset-data" style="padding:0.5rem 1rem;background:#b91c1c;color:#fff;border:none;border-radius:999px;font-weight:700;cursor:pointer;">Reset</button>
        </div>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    this.activeModal = overlay;

    modal.querySelector('.yg-modal-close')?.addEventListener('click', () => {
      overlay.remove();
      this.activeModal = null;
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
        this.activeModal = null;
      }
    });

    modal.querySelector('#yg-toggle-lamp')?.addEventListener('click', () => {
      this.setLamp(!this.clock.lampOn);
      this.openSettingsModal();
    });

    modal.querySelector('#yg-toggle-audio')?.addEventListener('click', () => {
      this.clock.audioMuted = !this.clock.audioMuted;
      if (this.clock.audioMuted) {
        this.audio.stopAmbient();
      } else {
        this.audio.startAmbient();
      }
      void this.saveState();
      this.openSettingsModal();
    });

    modal.querySelector('#yg-reset-data')?.addEventListener('click', async () => {
      if (confirm('Are you sure you want to reset your sanctuary data?')) {
        await this.memory.clear();
        await this.save.clear();
        location.reload();
      }
    });
  }

  focusDome(): void {
    this.camera.focusOnDome();
    this.pipeline?.wake();
    this.audio.play('shimmer');
  }

  exitFocus(): void {
    this.camera.exitFocus();
  }

  getMemorySummary(): string {
    return this.memory.summarize();
  }

  getPip(): { x: number; y: number; state: string; visited: number } {
    return { ...this.pip.observation, state: this.pip.observation.state };
  }

  getDay(): number {
    return this.memory.currentDay;
  }

  setLamp(on: boolean): void {
    this.clock.lampOn = on;
    this.room?.setLamp(on);
    void this.saveState();
  }

  async destroy(): Promise<void> {
    if (this.destroyed) return;
    this.destroyed = true;
    window.clearTimeout(this.toastTimeout);
    this.audio.destroy();
    this.pipeline?.destroy();
    this.room?.destroy();
    this.camera.destroy();
    this.uiContainer?.remove();
    this.activeModal?.remove();
    this.save.close();
  }
}
