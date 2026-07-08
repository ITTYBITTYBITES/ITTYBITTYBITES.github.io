/**
 * Library Season 1 — Audio & Interaction Feel
 *
 * Calm, thoughtful, rewarding — never addictive.
 * Every sound answers: "Does this help the person understand what just happened?"
 *
 * - WebAudio synthesis only (no large assets)
 * - Collection-tinted tonal identities
 * - User-controlled, muted by default on reduced-motion
 * - Accessible: never essential information via sound alone
 */

export type InteractionTone =
  | 'select'
  | 'confirm'
  | 'success'
  | 'complete'
  | 'discover'
  | 'transition'
  | 'back'
  | 'progress'
  | 'return';

export type CollectionId =
  | 'foundations'
  | 'history'
  | 'science'
  | 'nature'
  | 'creativity'
  | 'engineering'
  | 'mathematics'
  | 'society-mind'
  | string;

interface CollectionVoice {
  name: string;
  baseHz: number;
  waveform: OscillatorType;
  scale: number[]; // semitone offsets
  filterHz: number;
  q: number;
  color: string;
  mood: string;
}

/**
 * Collection Sound Identity — subtle, not musical wallpaper.
 * Silence remains a valid choice; these are interaction tints.
 */
const COLLECTION_VOICE: Record<string, CollectionVoice> = {
  foundations: {
    name: 'Foundations',
    baseHz: 432,
    waveform: 'sine',
    scale: [0, 2, 4, 7, 9], // major pentatonic — clarity, structure
    filterHz: 1800,
    q: 0.7,
    color: '#6B7280',
    mood: 'clarity · structure · discovery'
  },
  history: {
    name: 'History',
    baseHz: 330,
    waveform: 'triangle',
    scale: [0, 2, 3, 5, 7, 8, 10], // dorian — evidence, time, reflection
    filterHz: 1400,
    q: 1.1,
    color: '#92400E',
    mood: 'evidence · time · reflection'
  },
  science: {
    name: 'Science',
    baseHz: 523.25,
    waveform: 'sine',
    scale: [0, 2, 4, 6, 8, 10], // whole tone — curiosity, observation
    filterHz: 2200,
    q: 0.5,
    color: '#1E40AF',
    mood: 'curiosity · observation · experimentation'
  },
  nature: {
    name: 'Nature',
    baseHz: 392,
    waveform: 'triangle',
    scale: [0, 2, 4, 7, 9], // pentatonic — connection, systems
    filterHz: 1200,
    q: 1.4,
    color: '#065F46',
    mood: 'connection · systems · environment'
  },
  creativity: {
    name: 'Creativity',
    baseHz: 466.16,
    waveform: 'sine',
    scale: [0, 2, 4, 6, 7, 9, 11], // lydian — imagination, possibility
    filterHz: 2600,
    q: 0.6,
    color: '#7C2D12',
    mood: 'imagination · expression · possibility'
  },
  engineering: {
    name: 'Engineering',
    baseHz: 220,
    waveform: 'triangle',
    scale: [0, 3, 5, 7, 10], // minor pentatonic — precision, construction
    filterHz: 1600,
    q: 0.9,
    color: '#1E3A8A',
    mood: 'precision · construction · problem solving'
  },
  mathematics: {
    name: 'Mathematics',
    baseHz: 440,
    waveform: 'sine',
    scale: [0, 2, 5, 7, 9], // symmetric — patterns, elegance
    filterHz: 2000,
    q: 0.8,
    color: '#4B5563',
    mood: 'patterns · symmetry · elegance'
  },
  'society-mind': {
    name: 'Society & Mind',
    baseHz: 349.23,
    waveform: 'triangle',
    scale: [0, 2, 4, 5, 7, 9, 11], // major — communication, perspective
    filterHz: 1500,
    q: 1.0,
    color: '#5B21B6',
    mood: 'communication · perspective · human connection'
  }
};

const STORAGE_KEY = 'ibb-audio-prefs-v1';

interface AudioPrefs {
  enabled: boolean;
  volume: number; // 0..1 master scale
  collectionAmbience: boolean;
}

function defaultPrefs(): AudioPrefs {
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return {
    enabled: !prefersReduced ? false : false, // start quiet, invite opt-in
    volume: 0.45,
    collectionAmbience: false
  };
}

function loadPrefs(): AudioPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultPrefs(), ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return defaultPrefs();
}

function savePrefs(prefs: AudioPrefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch { /* ignore */ }
}

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private prefs: AudioPrefs = loadPrefs();
  private currentCollection: CollectionId = 'foundations';
  private lastPlay = 0;
  private unlocked = false;

  get enabled() { return this.prefs.enabled && this.unlocked; }
  get volume() { return this.prefs.volume; }
  get collection(): CollectionId { return this.currentCollection; }

  setCollection(id: CollectionId) {
    this.currentCollection = id in COLLECTION_VOICE ? id : 'foundations';
  }

  setEnabled(v: boolean) {
    this.prefs.enabled = v;
    savePrefs(this.prefs);
    this.emitChange();
    if (v) void this.unlock();
  }

  toggle() {
    this.setEnabled(!this.prefs.enabled);
    return this.prefs.enabled;
  }

  setVolume(v: number) {
    this.prefs.volume = Math.max(0, Math.min(1, v));
    savePrefs(this.prefs);
    if (this.master) this.master.gain.value = this.prefs.volume * 0.22;
    this.emitChange();
  }

  private emitChange() {
    window.dispatchEvent(new CustomEvent('ibb:audiochange', {
      detail: { enabled: this.prefs.enabled, volume: this.prefs.volume }
    }));
  }

  async unlock(): Promise<boolean> {
    if (this.unlocked && this.ctx) return true;
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
      if (this.ctx.state === 'suspended') await this.ctx.resume();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.prefs.volume * 0.22;
      this.master.connect(this.ctx.destination);
      this.unlocked = true;
      return true;
    } catch {
      return false;
    }
  }

  private voice(): CollectionVoice {
    return COLLECTION_VOICE[this.currentCollection] || COLLECTION_VOICE.foundations;
  }

  private semitone(base: number, steps: number) {
    return base * Math.pow(2, steps / 12);
  }

  private now(): number {
    return this.ctx ? this.ctx.currentTime : 0;
  }

  private playTone(
    hz: number,
    {
      duration = 0.18,
      type,
      gain = 0.7,
      attack = 0.008,
      filterHz,
      detune = 0
    }: {
      duration?: number;
      type?: OscillatorType;
      gain?: number;
      attack?: number;
      filterHz?: number;
      detune?: number;
    } = {}
  ) {
    if (!this.ctx || !this.master || !this.prefs.enabled) return;
    const t0 = this.now();
    const osc = this.ctx.createOscillator();
    const amp = this.ctx.createGain();
    const filt = this.ctx.createBiquadFilter();

    const v = this.voice();
    osc.type = type || v.waveform;
    osc.frequency.value = hz;
    osc.detune.value = detune;

    filt.type = 'lowpass';
    filt.frequency.value = filterHz || v.filterHz;
    filt.Q.value = v.q;

    amp.gain.setValueAtTime(0.0001, t0);
    amp.gain.exponentialRampToValueAtTime(gain, t0 + attack);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

    osc.connect(filt);
    filt.connect(amp);
    amp.connect(this.master);

    osc.start(t0);
    osc.stop(t0 + duration + 0.03);
  }

  private playChord(semitones: number[], spread = 0.045, opts: Parameters<AudioEngine['playTone']>[1] = {}) {
    const v = this.voice();
    semitones.forEach((st, i) => {
      setTimeout(() => {
        this.playTone(this.semitone(v.baseHz, st), opts);
      }, i * spread * 1000);
    });
  }

  async play(tone: InteractionTone) {
    // gentle rate limiting — no machine-gun feedback
    const now = performance.now();
    if (now - this.lastPlay < 45 && tone === 'select') return;
    this.lastPlay = now;

    if (!this.prefs.enabled) return;
    const ok = await this.unlock();
    if (!ok) return;

    const v = this.voice();
    const s = (i: number) => this.semitone(v.baseHz, v.scale[i % v.scale.length] + 12 * Math.floor(i / v.scale.length));

    switch (tone) {
      case 'select': {
        // gentle confirmation tap
        this.playTone(s(2), { duration: 0.07, gain: 0.45, attack: 0.004 });
        break;
      }
      case 'confirm': {
        this.playTone(s(1), { duration: 0.1, gain: 0.55 });
        setTimeout(() => this.playTone(s(3), { duration: 0.13, gain: 0.5 }), 70);
        break;
      }
      case 'success': {
        // quiet upward affirmation
        this.playChord(
          [v.scale[0], v.scale[2], v.scale[4]],
          0.05,
          { duration: 0.22, gain: 0.48, attack: 0.01 }
        );
        break;
      }
      case 'discover': {
        [0, 2, 4, 5].forEach((deg, i) => {
          setTimeout(() => this.playTone(s(deg), { duration: 0.16, gain: 0.42 }), i * 55);
        });
        break;
      }
      case 'progress': {
        this.playTone(s(3), { duration: 0.14, gain: 0.4, filterHz: v.filterHz * 0.9 });
        break;
      }
      case 'complete': {
        // resolved, calm — not celebratory
        const chord = [v.scale[0], v.scale[2], v.scale[4]];
        chord.forEach((st, i) => {
          setTimeout(() => {
            this.playTone(this.semitone(v.baseHz, st), {
              duration: 0.55,
              gain: 0.38,
              attack: 0.025
            });
            // warm octave below, very quiet
            this.playTone(this.semitone(v.baseHz / 2, st), {
              duration: 0.6,
              gain: 0.16,
              attack: 0.04,
              type: 'triangle'
            });
          }, i * 70);
        });
        break;
      }
      case 'transition': {
        this.playTone(s(0), { duration: 0.12, gain: 0.34, filterHz: v.filterHz * 0.8 });
        setTimeout(() => this.playTone(s(2), { duration: 0.16, gain: 0.3 }), 90);
        break;
      }
      case 'back': {
        this.playTone(s(3), { duration: 0.09, gain: 0.36 });
        setTimeout(() => this.playTone(s(1), { duration: 0.11, gain: 0.34 }), 60);
        break;
      }
      case 'return': {
        // returning to a collection — welcoming, quiet
        this.playTone(s(0), { duration: 0.24, gain: 0.33, attack: 0.018 });
        setTimeout(() => this.playTone(s(4), { duration: 0.28, gain: 0.26 }), 110);
        break;
      }
    }
  }

  getPrefs(): AudioPrefs {
    return { ...this.prefs };
  }

  getCollectionMeta(id: CollectionId = this.currentCollection) {
    const v = COLLECTION_VOICE[id] || COLLECTION_VOICE.foundations;
    return { id, name: v.name, mood: v.mood, color: v.color };
  }

  listCollections() {
    return Object.keys(COLLECTION_VOICE).map(id => this.getCollectionMeta(id));
  }
}

export const audio = new AudioEngine();

// Auto-unlock on first intentional gesture
if (typeof window !== 'undefined') {
  const unlockOnce = () => {
    void audio.unlock();
    window.removeEventListener('pointerdown', unlockOnce);
    window.removeEventListener('keydown', unlockOnce);
  };
  window.addEventListener('pointerdown', unlockOnce, { once: true });
  window.addEventListener('keydown', unlockOnce, { once: true });
}
