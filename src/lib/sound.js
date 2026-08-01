/**
 * Tiny WebAudio click engine. No audio files to ship, and the context is only
 * created after the first real gesture so browsers don't warn about autoplay.
 */

let ctx = null;

function audio() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function blip({ freq = 720, duration = 0.035, gain = 0.05, type = 'triangle' }) {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime);
  amp.gain.setValueAtTime(gain, ac.currentTime);
  amp.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration);
  osc.connect(amp).connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + duration);
}

export const sfx = {
  key: () => blip({ freq: 620 + Math.random() * 90, duration: 0.028, gain: 0.035 }),
  space: () => blip({ freq: 420, duration: 0.04, gain: 0.04 }),
  error: () => blip({ freq: 180, duration: 0.09, gain: 0.05, type: 'sawtooth' }),
  complete: () => {
    [523, 659, 784, 1047].forEach((f, i) =>
      setTimeout(() => blip({ freq: f, duration: 0.14, gain: 0.05, type: 'sine' }), i * 85),
    );
  },
  unlock: () => {
    [784, 988, 1319].forEach((f, i) =>
      setTimeout(() => blip({ freq: f, duration: 0.18, gain: 0.06, type: 'sine' }), i * 110),
    );
  },
};
