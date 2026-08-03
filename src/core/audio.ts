let ctx: AudioContext | null = null;
export const initAudio = () => {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('AudioContext initialized');
    } catch (e) {
      console.error('Audio init failed', e);
    }
  }
};
export const unlockAudio = () => {
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().then(() => console.log('Audio unlocked'));
  } else {
    console.log('Audio unlocked');
  }
};
export const playTone = (freq: number = 440, dur: number = 0.15, vol: number = 0.15) => {
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  } catch (e) {
    console.error('Audio play error', e);
  }
};
export const setMasterVolume = (v: number) => console.log('Master:', v);
export const setMusicVolume = (v: number) => console.log('Music:', v);
export const setSfxVolume = (v: number) => console.log('SFX:', v);
export const fadeIn = (dur: number) => console.log('Fade in:', dur);
export const fadeOut = (dur: number) => console.log('Fade out:', dur);
export const playCooldown = (ms: number) => console.log('Cooldown:', ms);
