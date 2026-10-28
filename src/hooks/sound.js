// Tiny synthesized sound engine (no audio files needed). Disabled by default.
// The AudioContext is only created after the visitor clicks the sound toggle.
let ctx = null;
let enabled = false;

function tone(freq, duration, gain, delay = 0) {
  if (!ctx) return;
  const t0 = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(amp).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

export const sound = {
  get enabled() {
    return enabled;
  },
  setEnabled(value) {
    enabled = value;
    if (value) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!ctx) ctx = new AC();
      if (ctx.state === 'suspended') ctx.resume();
      tone(523.25, 1.2, 0.05);
      tone(783.99, 1.4, 0.035, 0.12);
    }
  },
  select() {
    if (!enabled) return;
    tone(659.25, 0.9, 0.05);
    tone(987.77, 1.1, 0.03, 0.08);
  },
  hover() {
    if (!enabled) return;
    tone(1318.5, 0.35, 0.018);
  },
};
