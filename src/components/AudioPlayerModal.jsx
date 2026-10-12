import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getAudioEmbedUrl } from '../utils/audioPlayer';
import Icon from './Icon';

export default function AudioPlayerModal() {
  const {
    isAudioPlayerOpen,
    setIsAudioPlayerOpen,
    coupleProfile,
    updateCoupleProfile,
    activeTrack,
    playAnthem,
    showToast,
  } = useApp();

  const [showAnthemEditor, setShowAnthemEditor] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [songArtist, setSongArtist] = useState('');

  // Default to coupleProfile if activeTrack is null
  const currentTrack = activeTrack || {
    title: coupleProfile.anthemTitle || 'Baby Riddim',
    artist: coupleProfile.anthemArtist || 'Fave',
    url: coupleProfile.songUrl || 'https://audiomack.com/favourish/song/baby-riddim',
    isAnthem: true,
  };

  useEffect(() => {
    if (isAudioPlayerOpen) {
      setCustomUrl(coupleProfile.songUrl || '');
      setSongTitle(coupleProfile.anthemTitle || '');
      setSongArtist(coupleProfile.anthemArtist || '');
    }
  }, [isAudioPlayerOpen, coupleProfile]);

  if (!isAudioPlayerOpen) return null;

  const embedUrl = getAudioEmbedUrl(currentTrack.url);

  const handleUpdateAnthem = async (e) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    await updateCoupleProfile({
      ...coupleProfile,
      songUrl: customUrl.trim(),
      anthemTitle: songTitle.trim() || 'Baby Riddim',
      anthemArtist: songArtist.trim() || 'Fave',
    });
    showToast('Love anthem updated & synced ✦');
    setShowAnthemEditor(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface rounded-2xl max-w-md w-full border border-secondary/40 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary min-w-0">
            <Icon name="music_note" size={18} className="text-secondary shrink-0" />
            <span className="font-serif font-bold text-sm truncate">
              {currentTrack.isAnthem ? 'Our Love Anthem' : 'Memory Soundtrack'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsAudioPlayerOpen(false)}
            className="w-7 h-7 rounded-full border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-primary active:scale-90 transition-all shrink-0"
            title="Close Player"
          >
            <Icon name="close" size={15} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Song Info Header */}
          <div className="text-center space-y-1">
            <span className="font-montserrat text-[10px] uppercase tracking-widest text-secondary font-semibold">
              {currentTrack.isAnthem ? '✦ Our Couple Love Anthem ✦' : '✦ Individual Memory Keepsake ✦'}
            </span>
            <h3 className="font-serif text-xl sm:text-2xl text-primary font-bold break-words px-2">
              {currentTrack.title}
            </h3>
            <p className="font-sans text-xs text-on-surface-variant">
              by {currentTrack.artist}
            </p>
            {currentTrack.memoryTitle && (
              <p className="font-editorial italic text-xs text-secondary pt-0.5">
                From “{currentTrack.memoryTitle}”
              </p>
            )}
          </div>

          {/* Real Audio Player (Audiomack Embed with Dynamic Key for instant song switches) */}
          {embedUrl && embedUrl.includes('audiomack.com') ? (
            <div className="w-full rounded-xl overflow-hidden shadow-sm border border-secondary/30 bg-surface-container-low flex justify-center">
              <iframe
                key={embedUrl}
                src={embedUrl}
                scrolling="no"
                width="100%"
                height="252"
                scrollbars="no"
                frameBorder="0"
                title={`${currentTrack.title} Player`}
                className="w-full rounded-xl"
                allow="autoplay; encrypted-media"
              ></iframe>
            </div>
          ) : embedUrl ? (
            /* Direct Audio Link */
            <div className="bg-surface-container-low p-4 rounded-xl border border-secondary/30 text-center space-y-2">
              <audio controls className="w-full" src={embedUrl} key={embedUrl}>
                Your browser does not support the audio element.
              </audio>
            </div>
          ) : (
            /* Ambient Acoustic Melody Playback for custom titled memory songs */
            <div className="bg-surface-container-low p-5 rounded-xl border border-secondary/30 text-center space-y-3">
              <div className="flex items-center justify-center gap-1.5 h-6">
                <span className="w-1 h-3 bg-secondary rounded-full animate-bar-wave-1"></span>
                <span className="w-1 h-5 bg-secondary rounded-full animate-bar-wave-2"></span>
                <span className="w-1 h-2 bg-primary rounded-full animate-bar-wave-3"></span>
                <span className="w-1 h-6 bg-secondary rounded-full animate-bar-wave-4"></span>
                <span className="w-1 h-3 bg-secondary rounded-full animate-bar-wave-5"></span>
              </div>
              <p className="font-editorial italic text-xs text-on-surface-variant">
                Synthesized romantic melody active for this private keepsake
              </p>
            </div>
          )}

          {/* Quick Switch Button between Memory Song and Couple Anthem */}
          {!currentTrack.isAnthem && (
            <div className="pt-1 flex justify-center">
              <button
                type="button"
                onClick={playAnthem}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-secondary-container/30 border border-secondary/40 text-primary hover:bg-secondary-container/60 transition-all text-xs font-montserrat font-semibold active:scale-95"
              >
                <Icon name="music_note" size={14} className="text-secondary" />
                <span>Play Our Couple Love Anthem (“{coupleProfile.anthemTitle}”)</span>
              </button>
            </div>
          )}

          {/* Optional: Change Anthem Link Toggle (Only for Couple Anthem) */}
          {currentTrack.isAnthem && (
            <div className="pt-2 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={() => setShowAnthemEditor((prev) => !prev)}
                className="text-[10px] font-montserrat uppercase tracking-wider text-secondary hover:underline flex items-center gap-1 mx-auto"
              >
                <span>{showAnthemEditor ? 'Hide Anthem Settings' : 'Customize Couple Love Anthem Link'}</span>
                <span>{showAnthemEditor ? '▴' : '▾'}</span>
              </button>

              {showAnthemEditor && (
                <form onSubmit={handleUpdateAnthem} className="pt-3 space-y-2.5 animate-fade-in">
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://audiomack.com/favourish/song/baby-riddim"
                    className="w-full bg-surface-container-lowest border border-secondary/30 rounded-lg p-2 text-xs text-primary font-sans focus:outline-none focus:border-secondary"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={songTitle}
                      onChange={(e) => setSongTitle(e.target.value)}
                      placeholder="Song Title"
                      className="w-full bg-surface-container-lowest border border-secondary/30 rounded-lg p-2 text-xs text-primary focus:outline-none focus:border-secondary"
                    />
                    <input
                      type="text"
                      value={songArtist}
                      onChange={(e) => setSongArtist(e.target.value)}
                      placeholder="Artist"
                      className="w-full bg-surface-container-lowest border border-secondary/30 rounded-lg p-2 text-xs text-primary focus:outline-none focus:border-secondary"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 rounded-full bg-primary text-secondary-fixed font-montserrat text-[10px] tracking-wider uppercase font-semibold hover:bg-primary-container active:scale-95 transition-transform"
                  >
                    Update Couple Anthem
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
