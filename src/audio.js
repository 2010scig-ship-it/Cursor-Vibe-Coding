let context;
let muted = false;

function getContext() {
  if (!context) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    context = new AudioContextClass();
  }
  if (context.state === 'suspended') {
    context.resume();
  }
  return context;
}

function tone({ frequency, duration, type = 'sine', gain = 0.08, slideTo }) {
  const audio = getContext();
  if (!audio || muted) return;

  const now = audio.currentTime;
  const oscillator = audio.createOscillator();
  const envelope = audio.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);
  if (slideTo) {
    oscillator.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
  }

  envelope.gain.setValueAtTime(0.0001, now);
  envelope.gain.exponentialRampToValueAtTime(gain, now + 0.02);
  envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.connect(envelope);
  envelope.connect(audio.destination);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.02);
}

export function setMuted(nextMuted) {
  muted = Boolean(nextMuted);
}

export function isMuted() {
  return muted;
}

export function playFlip() {
  tone({ frequency: 420, duration: 0.08, type: 'triangle', gain: 0.05 });
}

export function playMatch() {
  tone({ frequency: 520, duration: 0.12, type: 'sine', gain: 0.07 });
  setTimeout(() => tone({ frequency: 740, duration: 0.16, type: 'sine', gain: 0.06 }), 70);
}

export function playMismatch() {
  tone({ frequency: 220, duration: 0.18, type: 'square', gain: 0.04, slideTo: 140 });
}

export function playWin() {
  [523, 659, 784, 1046].forEach((frequency, index) => {
    setTimeout(() => tone({ frequency, duration: 0.22, type: 'sine', gain: 0.07 }), index * 110);
  });
}
