// Universal Audio Engine: Supports Spotify, YouTube, SoundCloud, Direct MP3/M4A Audio Streams, Audio File Uploads, and Synthesized Acoustic Ambience

export const ROMANTIC_SONG_PRESETS = [
  {
    title: 'Baby Riddim',
    artist: 'Fave',
    url: 'https://audiomack.com/favourish/song/baby-riddim',
    youtubeUrl: 'https://www.youtube.com/watch?v=FqG7j3x9T88',
    isAnthem: true,
  },
];

/**
 * Universal Embed Info Parser:
 * Detects Spotify, YouTube, SoundCloud, Audiomack, or Direct Audio Files/Streams
 */
export function getAudioEmbedInfo(url) {
  if (!url || typeof url !== 'string') {
    return { type: 'none', platform: 'None', embedUrl: '', originalUrl: '' };
  }
  const trimmed = url.trim();

  // 1. Spotify Track / Album / Playlist / Episode
  const spotifyMatch = trimmed.match(/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?(track|album|playlist|episode)\/([a-zA-Z0-9]+)/i);
  if (spotifyMatch) {
    const [, entity, id] = spotifyMatch;
    return {
      type: 'spotify',
      platform: 'Spotify',
      embedUrl: `https://open.spotify.com/embed/${entity}/${id}?utm_source=generator&theme=0`,
      originalUrl: trimmed,
    };
  }

  // 2. YouTube / YouTube Music
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/|music\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/i);
  if (ytMatch) {
    return {
      type: 'youtube',
      platform: 'YouTube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0`,
      originalUrl: trimmed,
    };
  }

  // 3. SoundCloud
  if (trimmed.includes('soundcloud.com/')) {
    return {
      type: 'soundcloud',
      platform: 'SoundCloud',
      embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(trimmed)}&color=%23ffd79b&auto_play=true&show_artwork=true&show_comments=false`,
      originalUrl: trimmed,
    };
  }

  // 4. Audiomack
  const audiomackMatch = trimmed.match(/audiomack\.com\/(?:embed\/)?([a-zA-Z0-9_-]+)\/song\/([a-zA-Z0-9_-]+)/i);
  if (audiomackMatch) {
    const [, artist, song] = audiomackMatch;
    return {
      type: 'audiomack',
      platform: 'Audiomack',
      embedUrl: `https://audiomack.com/embed/${artist}/song/${song}`,
      originalUrl: trimmed,
    };
  }

  // 5. IndexedDB Uploaded Audio Track
  if (trimmed.startsWith('idb:')) {
    return {
      type: 'idb',
      platform: 'Uploaded Audio',
      embedUrl: trimmed,
      originalUrl: trimmed,
    };
  }

  // 6. Direct Audio File (mp3, m4a, wav, aac, ogg, flac, data:audio/..., blob:...)
  const isDirect =
    trimmed.startsWith('data:audio/') ||
    trimmed.startsWith('blob:') ||
    /\.(mp3|m4a|wav|aac|ogg|flac|opus)(\?.*)?$/i.test(trimmed);

  if (isDirect) {
    return {
      type: 'direct',
      platform: 'Direct Audio',
      embedUrl: trimmed,
      originalUrl: trimmed,
    };
  }

  // 6. Generic web URL (treat as direct audio or stream)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return {
      type: 'direct',
      platform: 'Audio Stream',
      embedUrl: trimmed,
      originalUrl: trimmed,
    };
  }

  return { type: 'none', platform: 'None', embedUrl: '', originalUrl: trimmed };
}

export function getAudioEmbedUrl(url) {
  const info = getAudioEmbedInfo(url);
  return info.embedUrl || url || '';
}

/**
 * Resolves song title, artist, audio URL, and embed details for any memory or anthem
 */
export function resolveSongInfo(songInput, coupleProfile) {
  // If memory object passed with direct songUrl
  if (songInput && typeof songInput === 'object') {
    const rawSong = songInput.song || songInput.title || '';
    const rawUrl = songInput.songUrl || (typeof songInput.song === 'string' && songInput.song.match(/https?:\/\/[^\s]+/i)?.[0]) || '';
    if (rawUrl) {
      const info = getAudioEmbedInfo(rawUrl);
      return {
        title: songInput.songTitle || rawSong.replace(/https?:\/\/[^\s]+/i, '').replace(/^✦\s*/, '').trim() || 'Keepsake Soundtrack',
        artist: songInput.songArtist || 'Beloved',
        url: rawUrl,
        embedUrl: info.embedUrl,
        platform: info.platform,
        type: info.type,
        isAnthem: false,
      };
    }
    return resolveSongInfo(rawSong, coupleProfile);
  }

  const songString = typeof songInput === 'string' ? songInput : '';

  if (!songString.trim()) {
    const anthemUrl = coupleProfile?.songUrl || 'https://audiomack.com/favourish/song/baby-riddim';
    const info = getAudioEmbedInfo(anthemUrl);
    return {
      title: coupleProfile?.anthemTitle || 'Baby Riddim',
      artist: coupleProfile?.anthemArtist || 'Fave',
      url: anthemUrl,
      embedUrl: info.embedUrl,
      platform: info.platform,
      type: info.type,
      isAnthem: true,
    };
  }

  const anthemTitle = (coupleProfile?.anthemTitle || 'Baby Riddim').toLowerCase();
  const lower = songString.toLowerCase();

  // Check if matches couple anthem
  if (
    lower.includes(anthemTitle) ||
    lower.includes('our anthem') ||
    lower.includes('baby riddim')
  ) {
    const anthemUrl = coupleProfile?.songUrl || 'https://audiomack.com/favourish/song/baby-riddim';
    const info = getAudioEmbedInfo(anthemUrl);
    return {
      title: coupleProfile?.anthemTitle || 'Baby Riddim',
      artist: coupleProfile?.anthemArtist || 'Fave',
      url: anthemUrl,
      embedUrl: info.embedUrl,
      platform: info.platform,
      type: info.type,
      isAnthem: true,
    };
  }

  // If user pasted a direct URL in the song string
  const urlMatch = songString.match(/https?:\/\/[^\s]+/i);
  if (urlMatch) {
    const foundUrl = urlMatch[0];
    const info = getAudioEmbedInfo(foundUrl);
    const cleanText = songString.replace(foundUrl, '').replace(/^✦\s*/, '').trim();
    return {
      title: cleanText || `${info.platform} Track`,
      artist: 'Beloved',
      url: foundUrl,
      embedUrl: info.embedUrl,
      platform: info.platform,
      type: info.type,
      isAnthem: false,
    };
  }

  // If data:audio base64 was entered
  if (songString.startsWith('data:audio/')) {
    return {
      title: 'Uploaded Audio Keepsake',
      artist: 'Beloved',
      url: songString,
      embedUrl: songString,
      platform: 'Direct Audio',
      type: 'direct',
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
      embedUrl: '',
      platform: 'Synthesized Ambience',
      type: 'none',
      isAnthem: false,
    };
  }

  return {
    title: clean,
    artist: 'Special Soundtrack',
    url: '',
    embedUrl: '',
    platform: 'Synthesized Ambience',
    type: 'none',
    isAnthem: false,
  };
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
