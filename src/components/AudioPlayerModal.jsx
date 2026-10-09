import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getAudioEmbedUrl } from '../utils/audioPlayer';
import Icon from './Icon';

export default function AudioPlayerModal() {
  const {
    isAudioPlayerOpen,
    setIsAudioPlayerOpen,
    coupleProfile,
    setCoupleProfile,
    showToast,
  } = useApp();

  const [customUrl, setCustomUrl] = useState(coupleProfile.songUrl || '');
  const [songTitle, setSongTitle] = useState(coupleProfile.anthemTitle || '');
  const [songArtist, setSongArtist] = useState(coupleProfile.anthemArtist || '');

  if (!isAudioPlayerOpen) return null;

  const embedUrl = getAudioEmbedUrl(coupleProfile.songUrl);

  const handleUpdateSong = (e) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    setCoupleProfile({
      ...coupleProfile,
      songUrl: customUrl.trim(),
      anthemTitle: songTitle.trim() || 'Baby Riddim',
      anthemArtist: songArtist.trim() || 'Fave',
    });
    showToast('Love anthem updated ✦');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface rounded-2xl max-w-md w-full border border-secondary/40 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <Icon name="music_note" size={18} className="text-secondary" />
            <span className="font-serif font-bold text-sm">
              Our Love Anthem
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsAudioPlayerOpen(false)}
            className="w-7 h-7 rounded-full border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-primary active:scale-90 transition-all"
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
              ✦ Constellation Resonance ✦
            </span>
            <h3 className="font-serif text-xl text-primary font-bold">
              {coupleProfile.anthemTitle}
            </h3>
            <p className="font-sans text-xs text-on-surface-variant">
              by {coupleProfile.anthemArtist}
            </p>
          </div>

          {/* Real Audiomack Embed Player */}
          {embedUrl && embedUrl.includes('audiomack.com') ? (
            <div className="w-full rounded-xl overflow-hidden shadow-sm border border-secondary/30 bg-surface-container-low flex justify-center">
              <iframe
                src={embedUrl}
                scrolling="no"
                width="100%"
                height="252"
                scrollbars="no"
                frameBorder="0"
                title={`${coupleProfile.anthemTitle} Player`}
                className="w-full rounded-xl"
                allow="autoplay; encrypted-media"
              ></iframe>
            </div>
          ) : (
            /* Fallback HTML5 Audio Player if direct link */
            <div className="bg-surface-container-low p-4 rounded-xl border border-secondary/30 text-center space-y-2">
              <audio controls className="w-full" src={coupleProfile.songUrl}>
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {/* Change Anthem Form */}
          <form onSubmit={handleUpdateSong} className="pt-2 border-t border-outline-variant/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-montserrat text-[9px] uppercase tracking-wider text-secondary font-semibold">
                Change Anthem Link (Audiomack URL)
              </span>
            </div>

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
              Update Love Anthem
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
