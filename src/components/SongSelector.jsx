import React, { useState, useRef } from 'react';
import Icon from './Icon';
import { ROMANTIC_SONG_PRESETS, getAudioEmbedInfo } from '../utils/audioPlayer';
import { useApp } from '../context/AppContext';
import { saveAudioFile } from '../utils/audioStorage';

export { ROMANTIC_SONG_PRESETS };

export default function SongSelector({
  selectedSong = '',
  onChange,
  songUrl = '',
  onUrlChange,
  coupleProfile,
}) {
  const { playMemorySong } = useApp();
  const fileInputRef = useRef(null);

  // Fallback if songUrl is embedded inside selectedSong string
  const currentUrl = songUrl || (typeof selectedSong === 'string' && selectedSong.match(/https?:\/\/[^\s]+/i)?.[0]) || '';
  const embedInfo = getAudioEmbedInfo(currentUrl);

  const handleSelectPreset = (preset) => {
    const label = `✦ ${preset.artist} — ${preset.title}`;
    if (onChange) onChange(label);
    if (onUrlChange) onUrlChange(preset.url);
  };

  const handleUrlInput = (url) => {
    if (onUrlChange) onUrlChange(url);
    // If no song title yet, generate an intelligent label
    if (!selectedSong || selectedSong.startsWith('✦') || selectedSong.includes('http')) {
      const info = getAudioEmbedInfo(url);
      if (info.type !== 'none' && (!selectedSong || selectedSong.includes('http'))) {
        if (onChange) onChange(`✦ ${info.platform} Keepsake Track`);
      }
    }
  };

  const handleAudioFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileNameClean = file.name.replace(/\.[^/.]+$/, '');
    if (onChange) onChange(`✦ ${fileNameClean}`);

    try {
      const audioId = await saveAudioFile(file);
      if (onUrlChange) onUrlChange(audioId);
    } catch (err) {
      console.warn('Failed to save audio file to IndexedDB:', err);
    }
  };

  const handleClear = () => {
    if (onChange) onChange('');
    if (onUrlChange) onUrlChange('');
  };

  const anthemLabel = `✦ ${coupleProfile?.anthemArtist || 'Fave'} — ${coupleProfile?.anthemTitle || 'Baby Riddim'}`;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="font-montserrat text-[10px] uppercase tracking-wider text-primary font-semibold flex items-center gap-1.5">
          <Icon name="music_note" size={14} className="text-secondary" />
          <span>Soundtrack on this Memory</span>
        </label>
        {(selectedSong || currentUrl) && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[10px] text-on-surface-variant hover:text-error transition-colors font-medium"
          >
            Remove Soundtrack
          </button>
        )}
      </div>

      {/* Active Soundtrack Summary Card */}
      <div className="bg-primary-container/10 border border-secondary/35 rounded-xl p-3 flex items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-full bg-secondary-container/30 border border-secondary/30 flex items-center justify-center text-secondary shrink-0">
            <Icon name="music_note" size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-serif text-xs text-primary font-semibold block truncate">
              {selectedSong || (currentUrl ? 'Custom Keepsake Audio' : 'No soundtrack selected (Quiet memory)')}
            </span>
            <div className="flex items-center gap-1.5 pt-0.5">
              {embedInfo.type !== 'none' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[9px] font-bold bg-secondary/15 text-secondary border border-secondary/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  {embedInfo.platform}
                </span>
              ) : (
                <span className="text-[10px] text-on-surface-variant/70">
                  {currentUrl ? 'Audio Link' : 'Select a song, paste a URL, or upload audio'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Test / Preview Button */}
        {(selectedSong || currentUrl) && (
          <button
            type="button"
            onClick={() =>
              playMemorySong({
                title: selectedSong || 'Keepsake Track',
                song: selectedSong,
                songUrl: currentUrl,
              })
            }
            className="px-2.5 py-1 rounded-full bg-primary text-secondary-fixed text-[10px] font-montserrat uppercase font-bold flex items-center gap-1 shadow-xs hover:bg-primary-container active:scale-95 transition-all shrink-0"
            title="Preview Audio"
          >
            <Icon name="play_arrow" size={13} filled />
            <span>Test</span>
          </button>
        )}
      </div>

      {/* URL Input with Universal Platform Detection */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-montserrat uppercase tracking-wider text-secondary font-semibold">
            Song URL (Spotify, YouTube, SoundCloud, or MP3 Link)
          </span>
          {embedInfo.type !== 'none' && (
            <span className="text-[9px] font-montserrat font-bold text-emerald-600 flex items-center gap-1">
              <span>✓</span>
              <span>{embedInfo.platform} Recognized</span>
            </span>
          )}
        </div>

        <div className="relative flex items-center">
          <input
            type="url"
            value={currentUrl.startsWith('idb:') ? '' : currentUrl}
            onChange={(e) => handleUrlInput(e.target.value)}
            placeholder={currentUrl.startsWith('idb:') ? '✦ Audio file loaded in vault (or paste URL)...' : 'Paste Spotify, YouTube, SoundCloud, or MP3 link...'}
            className="w-full bg-surface-container-low text-xs rounded-xl pl-3 pr-20 py-2 border border-secondary/30 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30 text-primary placeholder:text-on-surface-variant/50 transition-all font-sans"
          />

          {/* Audio File Upload Button Trigger */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute right-1.5 px-2 py-1 rounded-lg bg-surface-container-high hover:bg-secondary-container/30 border border-secondary/25 text-[10px] font-montserrat text-primary font-medium flex items-center gap-1 transition-all active:scale-95"
            title="Upload audio file (.mp3, .m4a, .wav)"
          >
            <Icon name="upload_file" size={12} className="text-secondary" />
            <span>Upload</span>
          </button>
        </div>

        {/* Hidden File Input for Native Audio Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleAudioFileUpload}
          className="hidden"
        />
      </div>

      {/* Song Title / Custom Text Input */}
      <div className="space-y-1">
        <span className="text-[10px] font-montserrat uppercase tracking-wider text-on-surface-variant/80 font-medium">
          Soundtrack Display Label
        </span>
        <input
          type="text"
          value={selectedSong}
          onChange={(e) => onChange && onChange(e.target.value)}
          placeholder="e.g. ✦ Stephen Sanchez — Until I Found You"
          className="w-full bg-surface-container-low text-xs rounded-xl px-3 py-2 border border-secondary/30 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30 text-primary placeholder:text-on-surface-variant/50 transition-all font-sans"
        />
      </div>

      {/* Preset Suggestions Quick Chips */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[9px] font-montserrat uppercase tracking-wider text-on-surface-variant/70 block">
          Romantic Presets &amp; Love Anthem:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {/* Couple Anthem Button */}
          <button
            type="button"
            onClick={() =>
              handleSelectPreset({
                artist: coupleProfile?.anthemArtist || 'Fave',
                title: coupleProfile?.anthemTitle || 'Baby Riddim',
                url: coupleProfile?.songUrl || 'https://open.spotify.com/track/1a2R0g4f08rY2k26t1vY3g',
              })
            }
            className={`px-3 py-1.5 rounded-full text-[10px] font-montserrat uppercase tracking-wider whitespace-nowrap transition-all active:scale-95 shrink-0 flex items-center gap-1 ${
              selectedSong === anthemLabel
                ? 'bg-primary text-secondary-fixed font-bold border border-secondary/40 shadow-xs'
                : 'bg-secondary-container/25 text-primary border border-secondary/30 hover:border-secondary'
            }`}
          >
            <span>♥ Our Anthem</span>
          </button>

          {/* Other romantic presets with verified streams */}
          {ROMANTIC_SONG_PRESETS.filter((p) => !p.isAnthem).map((preset) => {
            const label = `✦ ${preset.artist} — ${preset.title}`;
            const isSelected = selectedSong === label || currentUrl === preset.url;
            return (
              <button
                key={preset.title}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-montserrat uppercase tracking-wider whitespace-nowrap transition-all active:scale-95 shrink-0 ${
                  isSelected
                    ? 'bg-primary text-secondary-fixed font-bold border border-secondary/40 shadow-xs'
                    : 'bg-surface-container-low text-on-surface-variant border border-outline-variant/30 hover:border-secondary/30 hover:text-primary'
                }`}
              >
                {preset.title} · {preset.artist}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
