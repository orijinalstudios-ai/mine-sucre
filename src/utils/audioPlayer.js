// Web Audio API Synthesizer for Romantic Acoustic Melody & Sound Effects
export function getAudioEmbedUrl(url) {
  if (!url) return '';
  const audiomackMatch = url.match(/audiomack\.com\/(?:embed\/)?([a-zA-Z0-9_-]+)\/song\/([a-zA-Z0-9_-]+)/i);
  if (audiomackMatch) {
    const [, artist, song] = audiomackMatch;
    return `https://audiomack.com/embed/${artist}/song/${song}`;
  }
  return url;
}

class AmbientMelodyPlayer {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.timer = null;
    this.currentTime = 0;
    this.duration = 164; // 2:44 in seconds
    this.step = 0;
    this.listeners = new Set();
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    this.listeners.forEach((cb) => cb({
      isPlaying: this.isPlaying,
      currentTime: this.currentTime,
      duration: this.duration,
    }));
  }

  play() {
    this.init();
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.notify();

    // Romantic chord progression frequencies (Fave - Baby Riddim vibed chords: F#m, D, A, E)
    // pentatonic romantic chime chords
    const chordProgression = [
      [220.00, 277.18, 329.63, 440.00], // A Major
      [246.94, 311.13, 369.99, 493.88], // B Minor
      [185.00, 220.00, 277.18, 369.99], // F# Minor
      [196.00, 246.94, 293.66, 392.00], // G/D Major
    ];

    this.timer = setInterval(() => {
      this.currentTime += 0.5;
      if (this.currentTime >= this.duration) {
        this.currentTime = 0;
      }

      // Trigger chord pluck every 2 seconds
      if (Math.floor(this.currentTime * 2) % 4 === 0) {
        const chordIndex = Math.floor((this.currentTime / 2) % chordProgression.length);
        this.playChord(chordProgression[chordIndex]);
      }

      this.notify();
    }, 500);
  }

  playChord(notes) {
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    notes.forEach((freq, i) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      // Soft warm sine/triangle blend
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      gain.gain.setValueAtTime(0.001, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.07, now + i * 0.08 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 1.8);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 1.9);
    });
  }

  playChime() {
    this.init();
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gain.gain.setValueAtTime(0.001, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.05, now + idx * 0.06 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.9);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 1.0);
    });
  }

  pause() {
    this.isPlaying = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.notify();
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }
}

export const ambientPlayer = new AmbientMelodyPlayer();
