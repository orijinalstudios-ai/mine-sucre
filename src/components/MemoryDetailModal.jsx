import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import Icon from './Icon';
import { getCardTheme } from '../utils/cardThemes';
import FormattedText from './FormattedText';
import { resolveSongInfo, getAudioEmbedInfo, ambientPlayer } from '../utils/audioPlayer';
import { getAudioPlayableUrl } from '../utils/audioStorage';

export default function MemoryDetailModal() {
  const {
    selectedMemoryModal,
    setSelectedMemoryModal,
    setEditingMemory,
    toggleFavorite,
    deleteMemory,
    coupleProfile,
  } = useApp();

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isFitMode, setIsFitMode] = useState(false);

  // Background audio autoplay state & refs
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [resolvedAudioUrl, setResolvedAudioUrl] = useState('');
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [showEmbedPlayer, setShowEmbedPlayer] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  const mem = selectedMemoryModal;
  const theme = mem ? getCardTheme(mem.cardColor) : null;

  // Resolve track & embed details for the opened memory
  const songInfo = mem ? resolveSongInfo(mem, coupleProfile) : null;
  const embedInfo = songInfo ? getAudioEmbedInfo(songInfo.url) : { type: 'none', platform: 'None' };

  // Resolve Playable Object URL if stored in IndexedDB
  useEffect(() => {
    let isCancelled = false;
    const url = songInfo?.url;

    if (!url) {
      setResolvedAudioUrl('');
      return;
    }

    if (url.startsWith('idb:')) {
      getAudioPlayableUrl(url).then((playable) => {
        if (!isCancelled) {
          setResolvedAudioUrl(playable || '');
        }
      });
    } else {
      setResolvedAudioUrl(url);
    }

    return () => {
      isCancelled = true;
    };
  }, [songInfo?.url]);

  // Autoplay attached audio in background on memory open
  useEffect(() => {
    if (!mem) return;

    let isMounted = true;
    setAutoplayBlocked(false);

    // 1. Direct audio file or IndexedDB track
    if (embedInfo.type === 'direct' || embedInfo.type === 'idb') {
      if (audioRef.current && resolvedAudioUrl) {
        audioRef.current.currentTime = 0;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              if (isMounted) setIsPlaying(true);
            })
            .catch((err) => {
              console.warn('Direct audio autoplay deferred by browser policy:', err);
              if (isMounted) {
                setAutoplayBlocked(true);
                setIsPlaying(false);
              }
            });
        }
      }
    }
    // 2. Synthesized ambient romantic melody fallback
    else if (embedInfo.type === 'none') {
      ambientPlayer.play();
      setIsPlaying(true);
    }
    // 3. Streaming platforms (Spotify, YouTube, SoundCloud, Audiomack)
    else {
      setIsPlaying(true);
    }

    // Cleanup & stop all playback when memory modal closes or changes
    return () => {
      isMounted = false;
      if (audioRef.current) {
        audioRef.current.pause();
      }
      ambientPlayer.pause();
      setIsPlaying(false);
    };
  }, [mem?.id, resolvedAudioUrl, embedInfo.type]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedMemoryModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedMemoryModal]);

  if (!selectedMemoryModal || !mem) return null;

  const handleTogglePlay = () => {
    if (embedInfo.type === 'direct' || embedInfo.type === 'idb') {
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          audioRef.current
            .play()
            .then(() => {
              setIsPlaying(true);
              setAutoplayBlocked(false);
            })
            .catch((err) => console.warn('Play trigger failed:', err));
        }
      }
    } else if (embedInfo.type === 'none') {
      if (isPlaying) {
        ambientPlayer.pause();
        setIsPlaying(false);
      } else {
        ambientPlayer.play();
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleToggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setAudioCurrentTime(audioRef.current.currentTime);
      setAudioDuration(audioRef.current.duration || 0);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration || 0);
    }
  };

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setSelectedMemoryModal(null);
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-surface rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto no-scrollbar border border-secondary/40 shadow-2xl relative flex flex-col">
        {/* Modal Header */}
        <div className="sticky top-0 bg-surface/95 backdrop-blur-md px-4 sm:px-5 py-3 border-b border-outline-variant/30 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span
              className="font-montserrat text-[10px] uppercase tracking-wider font-bold"
              style={{ color: theme.accent }}
            >
              ✦ {mem.chapter || 'Sacred Chronicle'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => {
                setSelectedMemoryModal(null);
                setEditingMemory(mem);
              }}
              type="button"
              className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-secondary/30 text-secondary hover:bg-secondary/10 transition-colors text-xs font-montserrat font-semibold"
              title="Edit Memory"
            >
              <Icon name="edit" size={13} />
              <span>Edit</span>
            </button>
            <button
              onClick={() => toggleFavorite(mem.id)}
              className="p-1 text-secondary hover:text-error transition-colors"
              title="Toggle Favorite"
            >
              <Icon
                name="favorite"
                size={20}
                filled={mem.isFavorite}
                className={mem.isFavorite ? 'text-error' : 'opacity-60'}
              />
            </button>
            <button
              onClick={() => setSelectedMemoryModal(null)}
              className="w-8 h-8 rounded-full border border-outline-variant/40 hover:border-secondary flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
              title="Close Full View"
            >
              <Icon name="close" size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 sm:space-y-5">
          {/* Photos Carousel / Lightbox */}
          {mem.photos && mem.photos.length > 0 && (
            <div className="space-y-2">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black/40 border border-secondary/30 shadow-inner group">
                <img
                  src={mem.photos[activePhotoIndex]}
                  alt={mem.title}
                  className={`w-full h-full transition-all duration-300 ${
                    isFitMode ? 'object-contain' : 'object-cover'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setIsFitMode(!isFitMode)}
                  className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/75 hover:bg-black text-[#ffd79b] text-[10px] font-montserrat uppercase font-semibold flex items-center gap-1.5 backdrop-blur-md shadow-md border border-[#ffd79b]/30 transition-all active:scale-95"
                  title={isFitMode ? 'Switch to Fill Frame' : 'Switch to Fit Entire Image (Show Entire Photo)'}
                >
                  <Icon name={isFitMode ? 'crop' : 'crop_free'} size={13} />
                  <span>{isFitMode ? 'Fill' : 'Fit'}</span>
                </button>
              </div>

              {/* Thumbnails if multiple */}
              {mem.photos.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
                  {mem.photos.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhotoIndex(idx)}
                      className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                        activePhotoIndex === idx
                          ? 'border-secondary scale-105 shadow'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={p} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Titles & Meta */}
          <div className="space-y-1">
            <h2 className="font-serif text-2xl sm:text-3xl text-primary font-bold">
              {mem.title}
            </h2>
            <div className="flex items-center gap-4 text-xs text-on-surface-variant font-medium pt-1">
              <span className="flex items-center gap-1.5">
                <Icon name="calendar_today" size={14} className="text-secondary" />
                <span>{mem.displayDate || mem.date}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="location_on" size={14} className="text-secondary" />
                <span>{mem.location || 'Our Sanctuary'}</span>
              </span>
            </div>
          </div>

          {/* Living Background Soundtrack Ribbon with Autoplay */}
          <section className="bg-surface-container-low rounded-2xl p-3 sm:p-3.5 border border-secondary/35 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Play/Pause Button */}
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#2f020e] to-[#4a1622] text-[#ffd79b] flex items-center justify-center shadow-md border border-[#ffd79b]/40 active:scale-90 transition-transform shrink-0"
                  title={isPlaying ? 'Pause Background Soundtrack' : 'Play Background Soundtrack'}
                >
                  <Icon
                    name={isPlaying ? 'pause' : 'play_arrow'}
                    size={18}
                    filled={true}
                    className="text-[#ffd79b] ml-0.5"
                  />
                </button>

                {/* Track Info & Animated Wave Bars */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-montserrat text-[9px] uppercase tracking-wider text-secondary font-bold">
                      {isPlaying ? '✦ Autoplaying in Background' : '✦ Soundtrack Paused'}
                    </span>
                    {embedInfo.platform && (
                      <span className="px-1.5 py-0.2 text-[8px] font-montserrat uppercase rounded bg-secondary-container/30 text-secondary font-semibold">
                        {embedInfo.platform}
                      </span>
                    )}
                  </div>

                  <span className="font-serif font-bold text-sm text-primary block truncate">
                    {songInfo?.title || 'Love Anthem'}
                  </span>
                  <span className="font-sans text-[11px] text-on-surface-variant truncate block">
                    {songInfo?.artist || 'Beloved'}
                  </span>
                </div>
              </div>

              {/* Soundwave animation + Mute / Toggle controls */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* Visualizer bars */}
                <div className="flex items-center gap-1 h-4 bg-surface-container/70 rounded-full px-2 py-0.5 border border-outline-variant/30">
                  <span className={`w-0.5 bg-secondary rounded-full inline-block transition-all ${isPlaying ? 'h-3 animate-bar-wave-1' : 'h-1.5 opacity-40'}`}></span>
                  <span className={`w-0.5 bg-secondary rounded-full inline-block transition-all ${isPlaying ? 'h-4 animate-bar-wave-2' : 'h-2 opacity-40'}`}></span>
                  <span className={`w-0.5 bg-primary rounded-full inline-block transition-all ${isPlaying ? 'h-2 animate-bar-wave-3' : 'h-1 opacity-40'}`}></span>
                  <span className={`w-0.5 bg-secondary rounded-full inline-block transition-all ${isPlaying ? 'h-3.5 animate-bar-wave-4' : 'h-2 opacity-40'}`}></span>
                  <span className={`w-0.5 bg-secondary rounded-full inline-block transition-all ${isPlaying ? 'h-2.5 animate-bar-wave-5' : 'h-1.5 opacity-40'}`}></span>
                </div>

                {/* Direct audio Mute button */}
                {(embedInfo.type === 'direct' || embedInfo.type === 'idb') && (
                  <button
                    type="button"
                    onClick={handleToggleMute}
                    className="w-7 h-7 rounded-full border border-secondary/30 flex items-center justify-center text-secondary hover:bg-secondary-container/20 active:scale-90 transition-transform"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    <Icon name={isMuted ? 'volume_off' : 'volume_up'} size={14} />
                  </button>
                )}

                {/* If embed (Spotify/YouTube), toggle to show/hide the player widget */}
                {embedInfo.type !== 'direct' && embedInfo.type !== 'idb' && embedInfo.type !== 'none' && (
                  <button
                    type="button"
                    onClick={() => setShowEmbedPlayer(!showEmbedPlayer)}
                    className="w-7 h-7 rounded-full border border-secondary/30 flex items-center justify-center text-secondary hover:bg-secondary-container/20 active:scale-90 transition-transform"
                    title={showEmbedPlayer ? 'Hide Player Widget' : 'Show Player Widget'}
                  >
                    <Icon name={showEmbedPlayer ? 'expand_less' : 'open_in_new'} size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* If autoplay was deferred by browser policy, offer 1-click tap to start */}
            {autoplayBlocked && (
              <div
                onClick={handleTogglePlay}
                className="py-1 px-2.5 rounded-lg bg-secondary-container/30 border border-secondary/40 text-center cursor-pointer active:scale-98 transition-transform"
              >
                <span className="font-montserrat text-[10px] text-secondary font-semibold">
                  ✦ Tap here to start background soundtrack
                </span>
              </div>
            )}

            {/* Direct audio timeline scrubber */}
            {(embedInfo.type === 'direct' || embedInfo.type === 'idb') && audioDuration > 0 && (
              <div className="pt-1 flex items-center gap-2 text-[10px] font-sans text-on-surface-variant">
                <span>{formatTime(audioCurrentTime)}</span>
                <div
                  className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden cursor-pointer relative"
                  onClick={(e) => {
                    if (audioRef.current && audioDuration > 0) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pos = (e.clientX - rect.left) / rect.width;
                      audioRef.current.currentTime = pos * audioDuration;
                    }
                  }}
                >
                  <div
                    className="h-full bg-secondary transition-all"
                    style={{ width: `${(audioCurrentTime / audioDuration) * 100}%` }}
                  />
                </div>
                <span>{formatTime(audioDuration)}</span>
              </div>
            )}

            {/* Hidden HTML5 Audio Element for Direct / IDB playback */}
            {(embedInfo.type === 'direct' || embedInfo.type === 'idb') && resolvedAudioUrl && (
              <audio
                ref={audioRef}
                src={resolvedAudioUrl}
                autoPlay
                loop
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            )}

            {/* Streaming Platform Embed Player (Spotify, YouTube, SoundCloud, Audiomack) */}
            {embedInfo.type !== 'direct' && embedInfo.type !== 'idb' && embedInfo.type !== 'none' && isPlaying && (
              <div className={`overflow-hidden rounded-xl transition-all ${showEmbedPlayer ? 'max-h-[300px] mt-2' : 'h-0 opacity-0 pointer-events-none'}`}>
                {embedInfo.type === 'spotify' && (
                  <iframe
                    src={embedInfo.embedUrl}
                    width="100%"
                    height="152"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="rounded-xl"
                    title="Spotify Player"
                  />
                )}
                {embedInfo.type === 'youtube' && (
                  <iframe
                    src={embedInfo.embedUrl}
                    width="100%"
                    height={showEmbedPlayer ? "180" : "1"}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-xl"
                    title="YouTube Player"
                  />
                )}
                {embedInfo.type === 'soundcloud' && (
                  <iframe
                    src={embedInfo.embedUrl}
                    width="100%"
                    height="166"
                    scrolling="no"
                    frameBorder="no"
                    allow="autoplay"
                    className="rounded-xl"
                    title="SoundCloud Player"
                  />
                )}
                {embedInfo.type === 'audiomack' && (
                  <iframe
                    src={embedInfo.embedUrl}
                    width="100%"
                    height="252"
                    scrolling="no"
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    className="rounded-xl"
                    title="Audiomack Player"
                  />
                )}
              </div>
            )}
          </section>

          {/* The Full Side Note Letter */}
          <div
            style={{
              backgroundColor: theme.bg,
              borderColor: theme.border,
            }}
            className={`rounded-xl p-4 sm:p-5 border shadow-sm space-y-3 transition-colors ${
              theme.isDark ? 'text-[#fff6e9]' : 'text-primary'
            }`}
          >
            <div className="flex items-center justify-between border-b border-current/20 pb-2">
              <span
                className="font-montserrat text-[10px] uppercase tracking-wider font-semibold"
                style={{ color: theme.accent }}
              >
                Letter from {mem.author || 'Beloved'}
              </span>
              <span className="text-xs opacity-75">✦ Keepsake ({theme.name})</span>
            </div>

            <FormattedText
              text={mem.letter}
              className="font-editorial italic text-base sm:text-lg md:text-xl leading-relaxed"
            />

            {mem.counterNote && (
              <div className="pt-3 border-t border-current/20 space-y-1">
                <span
                  className="font-montserrat text-[9px] uppercase tracking-wider font-semibold block"
                  style={{ color: theme.accent }}
                >
                  Echoed by {mem.author === (coupleProfile?.partner2 || 'Sucre') ? (coupleProfile?.partner1 || 'Mine') : (coupleProfile?.partner2 || 'Sucre')}
                </span>
                <FormattedText
                  text={mem.counterNote}
                  className="font-editorial italic text-sm md:text-base opacity-90 leading-relaxed"
                />
              </div>
            )}
          </div>

          {/* Footer Mood Tag */}
          {mem.mood && (
            <div className="flex justify-end">
              <span className="px-3 py-1 rounded-full bg-surface-container-low text-primary text-[10px] font-montserrat uppercase font-semibold border border-secondary/30">
                ✦ {mem.mood}
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-outline-variant/30 flex items-center justify-between gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Delete "${mem.title || 'this memory'}" from your journal?`)) {
                deleteMemory(mem.id);
                setSelectedMemoryModal(null);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-error/90 hover:text-error hover:bg-error/10 font-montserrat uppercase font-semibold transition-all active:scale-95 border border-error/20"
          >
            <Icon name="delete" size={14} />
            <span>Delete</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedMemoryModal(null);
                setEditingMemory(mem);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-secondary/40 text-secondary hover:bg-secondary/10 font-montserrat uppercase font-semibold text-xs transition-all active:scale-95"
            >
              <Icon name="edit" size={14} />
              <span>Edit Memory</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMemoryModal(null)}
              className="px-4 py-2 rounded-full bg-primary text-secondary-fixed text-xs font-montserrat uppercase tracking-wider font-semibold shadow hover:bg-primary-container active:scale-95 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
