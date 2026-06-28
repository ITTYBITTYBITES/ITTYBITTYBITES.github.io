/**
 * ITTYBITTYBITES AUDIO MANAGER (Phase 6)
 * Programmatic Web Audio API Synth Engine for Ambient Drones and UI Sound FX.
 * Depth-aware low-pass filter synthesis tracking camera position.
 */

class AudioManager {
  constructor() {
    this.ctx = null;
    this.ambientOsc1 = null;
    this.ambientOsc2 = null;
    this.ambientFilter = null;
    this.ambientGain = null;
    
    this.isMuted = false;
    this.isAmbiencePlaying = false;
    
    // Core frequency limits for depth-aware synthesis
    this.maxCutoff = 1800; // Crisp frequency at tunnel entrance (Z = 10)
    this.minCutoff = 250;  // Deep muffled frequency at deep-storage (Z = -110)
  }

  /**
   * Initializes the AudioContext. Must be triggered via user gesture to unlock.
   */
  init() {
    if (this.ctx) return;

    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      console.log("🔊 [AudioManager] AudioContext initialized successfully.");
      
      // Setup master spatial ambience synth path
      this.setupAmbienceSynth();
    } catch (e) {
      console.error("✗ [AudioManager] Web Audio API not supported in this browser:", e);
    }
  }

  /**
   * Builds the low-frequency ambient drone synthesis pipeline.
   */
  setupAmbienceSynth() {
    if (!this.ctx) return;

    // 1. Create detuned drone oscillators (detuned saw/triangle notes for phasing rich texture)
    this.ambientOsc1 = this.ctx.createOscillator();
    this.ambientOsc2 = this.ctx.createOscillator();
    
    this.ambientOsc1.type = "triangle";
    this.ambientOsc2.type = "sawtooth";

    this.ambientOsc1.frequency.value = 110; // A2 note
    this.ambientOsc2.frequency.value = 110.4; // Detuned slightly for lush phasing drone

    // 2. Create high-resonance low-pass filter
    this.ambientFilter = this.ctx.createBiquadFilter();
    this.ambientFilter.type = "lowpass";
    this.ambientFilter.frequency.value = this.maxCutoff;
    this.ambientFilter.Q.value = 4.5; // Resonant peak

    // 3. Create Gain Node for volume control
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.value = 0.0; // Start silenced

    // 4. Connect synth pipeline
    this.ambientOsc1.connect(this.ambientFilter);
    this.ambientOsc2.connect(this.ambientFilter);
    this.ambientFilter.connect(this.ambientGain);
    this.ambientGain.connect(this.ctx.destination);

    // 5. Start oscillators in background
    this.ambientOsc1.start(0);
    this.ambientOsc2.start(0);
  }

  /**
   * Resumes the AudioContext if suspended (browser security unlock).
   */
  async resumeContext() {
    this.init();
    if (this.ctx && this.ctx.state === "suspended") {
      await this.ctx.resume();
      console.log("🔊 [AudioManager] AudioContext resumed via user gesture.");
    }
  }

  /**
   * Starts the looping ambient soundscape with a smooth fade-in.
   */
  startAmbience() {
    this.resumeContext().then(() => {
      if (!this.ctx || this.isAmbiencePlaying || this.isMuted) return;

      console.log("🔊 [AudioManager] Starting ambient drone soundscape...");
      this.isAmbiencePlaying = true;

      // Smooth fade-in
      const now = this.ctx.currentTime;
      this.ambientGain.gain.cancelScheduledValues(now);
      this.ambientGain.gain.setValueAtTime(0, now);
      this.ambientGain.gain.linearRampToValueAtTime(0.18, now + 2.0); // 2-second fade-in
    });
  }

  /**
   * Fades out and mutes the ambient drone (e.g. when mounting active game sandbox).
   */
  stopAmbience() {
    if (!this.ctx || !this.isAmbiencePlaying) return;

    console.log("🔊 [AudioManager] Muting ambient drone soundscape...");
    this.isAmbiencePlaying = false;

    const now = this.ctx.currentTime;
    this.ambientGain.gain.cancelScheduledValues(now);
    this.ambientGain.gain.linearRampToValueAtTime(0.0, now + 0.8); // 0.8s smooth fade-out
  }

  /**
   * Modulates the cutoff frequency of the ambient lowpass filter based on camera Z depth.
   * Camera Z = 10 (entrance) -> Crisp, high cutoff.
   * Camera Z = -110 (deep) -> Muffled, heavy bass cutoff.
   * @param {number} cameraZ - Active camera position on the Z-axis.
   */
  updateDepth(cameraZ) {
    if (!this.ctx || !this.ambientFilter || !this.isAmbiencePlaying) return;

    // Clamp camera bounds
    const entranceZ = 10;
    const deepZ = -110;
    
    // Calculate progress ratio (0.0 at entrance, 1.0 at maximum depth)
    const ratio = Math.max(0, Math.min(1, (entranceZ - cameraZ) / (entranceZ - deepZ)));

    // Interpolate cutoff frequency logarithmically for smooth natural sweep
    const targetCutoff = this.maxCutoff - (ratio * (this.maxCutoff - this.minCutoff));

    // Smoothly transition filter cutoff over 0.1s to avoid digital clicks
    const now = this.ctx.currentTime;
    this.ambientFilter.frequency.setTargetAtTime(targetCutoff, now, 0.08);
  }

  /**
   * Plays a quick synth 'ping' upon hovering over interactive 3D nodes.
   */
  playHoverPing() {
    this.resumeContext().then(() => {
      if (!this.ctx || this.isMuted) return;

      const now = this.ctx.currentTime;
      
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = "sine";
      // Slide frequency up slightly for an organic sound
      osc.frequency.setValueAtTime(880, now); // A5 note
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.08); // Sweep up

      gainNode.gain.setValueAtTime(0.08, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15); // Short decay

      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    });
  }

  /**
   * Synthesizes a deep wind-like 'woosh' when performing camera transitions/dives.
   */
  playWoosh() {
    this.resumeContext().then(() => {
      if (!this.ctx || this.isMuted) return;

      const now = this.ctx.currentTime;
      const duration = 1.4; // Match camera tween transition duration exactly

      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gainNode = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(80, now);
      // Sweep frequency up then back down to simulate speed rush
      osc.frequency.quadraticRampToValueAtTime(280, now + duration / 2);
      osc.frequency.exponentialRampToValueAtTime(60, now + duration);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(200, now);
      filter.frequency.exponentialRampToValueAtTime(1200, now + duration / 2);
      filter.frequency.exponentialRampToValueAtTime(100, now + duration);
      filter.Q.value = 5.0;

      gainNode.gain.setValueAtTime(0.0, now);
      gainNode.gain.linearRampToValueAtTime(0.24, now + duration * 0.3); // Rise
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration); // Fall

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.1);
    });
  }
}

// Instantiated globally
window.ibbAudio = new AudioManager();
