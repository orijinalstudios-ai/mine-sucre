// Web Audio API Synthesizer for Romantic Acoustic Melody & Sound Effects
export const ROMANTIC_SONG_PRESETS = [
  {
    title: 'Baby Riddim',
    artist: 'Fave',
    url: 'https://audiomack.com/favourish/song/baby-riddim',
    isAnthem: true,
  },
  {
    title: 'Until I Found You',
    artist: 'Stephen Sanchez',
    url: 'https://audiomack.com/stephensanchez/song/until-i-found-you',
  },
  {
    title: 'Perfect',
    artist: 'Ed Sheeran',
    url: 'https://audiomack.com/teddysphotos/song/perfect',
  },
  {
    title: 'golden hour',
    artist: 'JVKE',
    url: 'https://audiomack.com/jvke/song/golden-hour',
  },
  {
    title: 'Lover',
    artist: 'Taylor Swift',
    url: 'https://audiomack.com/taylorswift/song/lover',
  },
  {
    title: 'Texas Sun',
    artist: 'Leon Bridges & Khruangbin',
    url: 'https://audiomack.com/leonbridges/song/texas-sun',
  },
  {
    title: 'All of Me',
    artist: 'John Legend',
    url: 'https://audiomack.com/johnlegend/song/all-of-me',
  },
  {
    title: 'By Your Side',
    artist: 'Sade',
    url: 'https://audiomack.com/sade-2/song/by-your-side',
  },
];

export function resolveSongInfo(songString, coupleProfile) {
  if (!songString) {
    return {
      title: coupleProfile?.anthemTitle || 'Baby Riddim',
      artist: coupleProfile?.anthemArtist || 'Fave',
      url: coupleProfile?.songUrl || 'https://audiomack.com/favourish/song/baby-riddim',
      isAnthem: true,
    };
  }

  const anthemTitle = (coupleProfile?.anthemTitle || 'Baby Riddim').toLowerCase();
  const lower = songString.toLowerCase();

  if (
    lower.includes(anthemTitle) ||
    lower.includes('our anthem') ||
    lower.includes('baby riddim')
  ) {
    return {
      title: coupleProfile?.anthemTitle || 'Baby Riddim',
      artist: coupleProfile?.anthemArtist || 'Fave',
      url: coupleProfile?.songUrl || 'https://audiomack.com/favourish/song/baby-riddim',
      isAnthem: true,
    };
  }

  // Check against presets
  for (const preset of ROMANTIC_SONG_PRESETS) {
    if (
      lower.includes(preset.title.toLowerCase()) ||
      lower.includes(preset.artist.toLowerCase())
    ) {
      return {
        title: preset.title,
        artist: preset.artist,
        url: preset.url,
        isAnthem: Boolean(preset.isAnthem),
      };
    }
  }

  // If user typed a direct URL
  const urlMatch = songString.match(/https?:\/\/[^\s]+/i);
  if (urlMatch) {
    const url = urlMatch[0];
    const cleanText = songString.replace(url, '').replace(/^✦\s*/, '').trim();
    return {
      title: cleanText || 'Custom Keepsake Track',
      artist: 'Beloved',
      url,
      isAnthem: false,
    };
  }

  // Parse formatted "✦ Artist — Title" or "Artist - Title"
  const clean = songString.replace(/^✦\s*/, '').trim();
  const parts = clean.split(/\s*[-—]\s*/);
  if (parts.length >= 2) {
    return {
      title: parts[1].trim(),
      artist: parts[0].trim(),
      url: '',
      isAnthem: false,
    };
  }

  return {
    title: clean,
    artist: 'Special Soundtrack',
    url: '',
    isAnthem: false,
  };
}

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
