/**
 * ITTYBITTYBITES AUDIO MANAGER (Phase 20 - Audio Engine Refactor V2)
 * Fully rebalanced Web Audio API Synth Engine optimized for hardware audibility.
 * Implements a warm, non-intrusive, mid-low frequency atmospheric drone (A2 note)
 * designed to be clearly audible on laptops/mobiles, yet soft and soothing.
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
    
    // Core frequency limits for depth-aware synthesis (Phase 20 Rebalance: warm mid-bass cutoff)
    this.maxCutoff = 500; // Warm, easily reproducible cutoff at entrance (Z = 10)
    this.minCutoff = 180; // Softer muffled sub-bass cutoff at depth (Z = -300)
    this.baseAmbienceVolume = 0.055; // Calibrated non-intrusive gain (audible on laptop speakers!)
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
   * Builds the soft low-frequency ambient drone synthesis pipeline.
   * Calibrated with A2 (110Hz) frequencies so that it is beautifully audible
   * on all standard computer and laptop speakers (which cut off below 100Hz).
   */
  setupAmbienceSynth() {
    if (!this.ctx) return;

    // 1. Create detuned drone oscillators (detuned sine/triangle notes for extremely warm background thrum)
    this.ambientOsc1 = this.ctx.createOscillator();
    this.ambientOsc2 = this.ctx.createOscillator();
    
    this.ambientOsc1.type = "sine";      // Pure smooth sine wave
    this.ambientOsc2.type = "triangle";  // Soft triangle wave for warmth

    this.ambientOsc1.frequency.value = 110;   // Detuned A2 mid-bass note (reproducible on laptop speakers!)
    this.ambientOsc2.frequency.value = 110.3; // Phased detuning for slow relaxing thrum

    // 2. Create high-resonance low-pass filter to restrict higher harmonics
    this.ambientFilter = this.ctx.createBiquadFilter();
    this.ambientFilter.type = "lowpass";
    this.ambientFilter.frequency.value = this.maxCutoff;
    this.ambientFilter.Q.value = 3.5; // Moderate resonance

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
      if (!this.ctx || this.isMuted) return;
      if (this.isAmbiencePlaying) return;

      console.log("🔊 [AudioManager] Starting ambient drone soundscape...");
      this.isAmbiencePlaying = true;

      // Smooth, long fade-in to prevent jarring onset pops
      const now = this.ctx.currentTime;
      this.ambientGain.gain.cancelScheduledValues(now);
      this.ambientGain.gain.setValueAtTime(0, now);
      this.ambientGain.gain.linearRampToValueAtTime(this.baseGainValue(), now + 2.0); // 2.0s fade-in
    });
  }

  /**
   * Fades out the ambient drone immediately (ducking to 0%) when a game is loaded.
   * Completely avoids background audio bleed to respect privacy and policy.
   */
  stopAmbience() {
    if (!this.ctx || !this.isAmbiencePlaying) return;

    console.log("🔊 [AudioManager] Attenuating (ducking) ambient drone to 0% for game focus...");
    this.isAmbiencePlaying = false;

    const now = this.ctx.currentTime;
    this.ambientGain.gain.cancelScheduledValues(now);
    this.ambientGain.gain.linearRampToValueAtTime(0.0, now + 0.2); // Instant, fast 0.2s fade-out (ducking)
  }

  /**
   * Helper: Calculates targeted gain volume based on muting states.
   */
  baseGainValue() {
    return this.isMuted ? 0.0 : this.baseAmbienceVolume;
  }

  /**
   * Modulates the cutoff frequency of the ambient lowpass filter based on camera Z depth.
   * @param {number} cameraZ - Active camera position on the Z-axis.
   */
  updateDepth(cameraZ) {
    if (!this.ctx || !this.ambientFilter || !this.isAmbiencePlaying) return;

    const entranceZ = 10;
    const deepZ = -300; // Track the extended Phase 16 tunnel coordinates
    
    // Calculate progress ratio (0.0 at entrance, 1.0 at maximum depth)
    const ratio = Math.max(0, Math.min(1, (entranceZ - cameraZ) / (entranceZ - deepZ)));

    // Interpolate cutoff frequency logarithmically for smooth natural sweep
    const targetCutoff = this.maxCutoff - (ratio * (this.maxCutoff - this.minCutoff));

    // Smoothly transition filter cutoff over 0.1s to avoid digital clicks
    const now = this.ctx.currentTime;
    this.ambientFilter.frequency.setTargetAtTime(targetCutoff, now, 0.08);
  }

  /**
   * Plays a crisp, short, clean high-frequency synth 'ping' upon node clicks or hovers.
   * Deleted any chaotic, distorted, or high-gain assets.
   */
  playHoverPing() {
    this.resumeContext().then(() => {
      if (!this.ctx || this.isMuted) return;

      const now = this.ctx.currentTime;
      
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = "sine"; // Pure high-frequency clean sine wave
      osc.frequency.setValueAtTime(960, now); // Crisp high C6 note
      osc.frequency.exponentialRampToValueAtTime(1440, now + 0.05); // Clean brief sweep up

      gainNode.gain.setValueAtTime(0.04, now); // Gentle, low volume
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1); // Ultra-fast clean decay (100ms)

      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    });
  }

  /**
   * Synthesizes a very soft, filtered air-woosh when performing camera transitions/dives.
   * Non-distorted, low gain.
   */
  playWoosh() {
    this.resumeContext().then(() => {
      if (!this.ctx || this.isMuted) return;

      const now = this.ctx.currentTime;
      const duration = 1.4;

      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gainNode = this.ctx.createGain();

      osc.type = "sine"; // Sine oscillators prevent standard triangle/saw clipping
      osc.frequency.setValueAtTime(60, now);
      osc.frequency.quadraticRampToValueAtTime(120, now + duration / 2);
      osc.frequency.exponentialRampToValueAtTime(40, now + duration);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(100, now);
      filter.frequency.exponentialRampToValueAtTime(400, now + duration / 2);
      filter.frequency.exponentialRampToValueAtTime(80, now + duration);
      filter.Q.value = 2.0;

      gainNode.gain.setValueAtTime(0.0, now);
      gainNode.gain.linearRampToValueAtTime(0.06, now + duration * 0.2); // Extremely soft, background woosh
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

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
