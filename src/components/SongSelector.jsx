import React, { useState } from 'react';
import Icon from './Icon';
import { ROMANTIC_SONG_PRESETS } from '../utils/audioPlayer';

export { ROMANTIC_SONG_PRESETS };

export default function SongSelector({ selectedSong, onChange, coupleProfile }) {
  const [isCustomMode, setIsCustomMode] = useState(() => {
    if (!selectedSong) return false;
    // Check if matches preset
    const match = ROMANTIC_SONG_PRESETS.some(
      (p) => selectedSong.includes(p.title) || selectedSong.includes(p.artist)
    );
    return !match;
  });

  const anthemLabel = `✦ ${coupleProfile?.anthemArtist || 'Fave'} — ${coupleProfile?.anthemTitle || 'Baby Riddim'}`;

  const handleSelectPreset = (song) => {
    setIsCustomMode(false);
    if (!song) {
      onChange('');
      return;
    }
    onChange(`✦ ${song.artist} — ${song.title}`);
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="font-montserrat text-[10px] uppercase tracking-wider text-primary font-semibold flex items-center gap-1.5">
          <Icon name="music_note" size={14} className="text-secondary" />
          <span>Soundtrack on this Memory</span>
        </label>
        {selectedSong && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[10px] text-on-surface-variant hover:text-error transition-colors"
          >
            Remove Song
          </button>
        )}
      </div>

      {/* Current Chosen Song Pill Display */}
      <div className="bg-primary-container/10 border border-secondary/35 rounded-xl px-3.5 py-2 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Icon name="music_note" size={16} className="text-secondary shrink-0" />
          <span className="font-serif text-xs text-primary truncate font-medium">
            {selectedSong || 'No soundtrack selected (Quiet memory)'}
          </span>
        </div>
        {selectedSong && (
          <span className="text-[9px] font-montserrat uppercase tracking-wider text-secondary px-2 py-0.5 rounded-full bg-secondary-container/30 shrink-0 font-semibold">
            Active
          </span>
        )}
      </div>

      {/* Preset Suggestions Quick Chips */}
      <div className="space-y-1">
        <span className="text-[9px] font-montserrat uppercase tracking-wider text-on-surface-variant/70 block">
          Suggestions &amp; Love Anthem:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {/* Couple's Anthem Button */}
          <button
            type="button"
            onClick={() => handleSelectPreset({ artist: coupleProfile?.anthemArtist || 'Fave', title: coupleProfile?.anthemTitle || 'Baby Riddim' })}
            className={`px-3 py-1.5 rounded-full text-[10px] font-montserrat uppercase tracking-wider whitespace-nowrap transition-all active:scale-95 shrink-0 flex items-center gap-1 ${
              selectedSong === anthemLabel
                ? 'bg-primary text-secondary-fixed font-bold border border-secondary/40 shadow-xs'
                : 'bg-secondary-container/25 text-primary border border-secondary/30 hover:border-secondary'
            }`}
          >
            <span>♥ Our Anthem</span>
          </button>

          {/* Other romantic presets */}
          {ROMANTIC_SONG_PRESETS.filter((p) => !p.isAnthem).map((song) => {
            const label = `✦ ${song.artist} — ${song.title}`;
            const isSelected = selectedSong === label;
            return (
              <button
                key={song.title}
                type="button"
                onClick={() => handleSelectPreset(song)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-montserrat uppercase tracking-wider whitespace-nowrap transition-all active:scale-95 shrink-0 ${
                  isSelected
                    ? 'bg-primary text-secondary-fixed font-bold border border-secondary/40 shadow-xs'
                    : 'bg-surface-container-low text-on-surface-variant border border-outline-variant/30 hover:border-secondary/30 hover:text-primary'
                }`}
              >
                {song.title} · {song.artist}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Song Input */}
      <div className="pt-1">
        <div className="relative flex items-center">
          <input
            type="text"
            value={selectedSong}
            onChange={(e) => {
              setIsCustomMode(true);
              onChange(e.target.value);
            }}
            placeholder="Or type any custom song title & artist..."
            className="w-full bg-surface-container-low text-xs rounded-xl px-3 py-2 border border-secondary/30 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30 text-primary placeholder:text-on-surface-variant/50 transition-all font-sans"
          />
        </div>
      </div>
    </div>
  );
}
