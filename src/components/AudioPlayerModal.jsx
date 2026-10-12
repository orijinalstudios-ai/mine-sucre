import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { getAudioEmbedInfo } from '../utils/audioPlayer';
import { saveAudioFile, getAudioPlayableUrl } from '../utils/audioStorage';
import Icon from './Icon';

export default function AudioPlayerModal() {
  const {
    isAudioPlayerOpen,
    setIsAudioPlayerOpen,
    coupleProfile,
    updateCoupleProfile,
    updateMemory,
    activeTrack,
    setActiveTrack,
    playAnthem,
    showToast,
  } = useApp();

  const fileInputRef = useRef(null);
  const [showUrlEditor, setShowUrlEditor] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [inputTitle, setInputTitle] = useState('');
  const [inputArtist, setInputArtist] = useState('');
  const [resolvedAudioUrl, setResolvedAudioUrl] = useState('');

  // Default to coupleProfile if activeTrack is null
  const currentTrack = activeTrack || {
    title: coupleProfile?.anthemTitle || 'Baby Riddim',
    artist: coupleProfile?.anthemArtist || 'Fave',
    url: coupleProfile?.songUrl || 'https://open.spotify.com/track/1a2R0g4f08rY2k26t1vY3g',
    isAnthem: true,
  };

  const embedInfo = getAudioEmbedInfo(currentTrack.url);

  useEffect(() => {
    let isCancelled = false;
    if (!currentTrack?.url) {
      setResolvedAudioUrl('');
      return;
    }

    if (currentTrack.url.startsWith('idb:')) {
      getAudioPlayableUrl(currentTrack.url).then((url) => {
        if (!isCancelled) setResolvedAudioUrl(url);
      });
    } else {
      setResolvedAudioUrl(embedInfo.embedUrl || currentTrack.url);
    }

    return () => {
      isCancelled = true;
    };
  }, [currentTrack?.url, embedInfo.embedUrl]);

  useEffect(() => {
    if (isAudioPlayerOpen && currentTrack) {
      setInputUrl(currentTrack.url?.startsWith('idb:') ? '' : (currentTrack.url || ''));
      setInputTitle(currentTrack.title || '');
      setInputArtist(currentTrack.artist || '');
    }
  }, [isAudioPlayerOpen, currentTrack.url, currentTrack.title]);

  if (!isAudioPlayerOpen) return null;

  const handleUpdateTrackUrl = async (e) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    const trimmedUrl = inputUrl.trim();
    const resolvedInfo = getAudioEmbedInfo(trimmedUrl);
    const newTitle = inputTitle.trim() || currentTrack.title || `${resolvedInfo.platform} Track`;
    const newArtist = inputArtist.trim() || currentTrack.artist || 'Beloved';

    // Update active track immediately in state
    setActiveTrack((prev) => ({
      ...prev,
      title: newTitle,
      artist: newArtist,
      url: trimmedUrl,
      embedUrl: resolvedInfo.embedUrl,
      platform: resolvedInfo.platform,
      type: resolvedInfo.type,
    }));

    if (currentTrack.onTrackUpdated) {
      try {
        currentTrack.onTrackUpdated(trimmedUrl, `✦ ${newArtist} — ${newTitle}`);
      } catch (err) {
        // ignore
      }
    }

    if (currentTrack.isAnthem) {
      await updateCoupleProfile({
        ...coupleProfile,
        songUrl: trimmedUrl,
        anthemTitle: newTitle,
        anthemArtist: newArtist,
      });
      showToast('Love Anthem updated & synced ✦');
    } else if (currentTrack.memoryId) {
      await updateMemory(currentTrack.memoryId, {
        songUrl: trimmedUrl,
        song: `✦ ${newArtist} — ${newTitle}`,
      });
      showToast('Memory soundtrack updated & synced ✦');
    } else {
      showToast('Track link loaded ✦');
    }

    setShowUrlEditor(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cleanName = file.name.replace(/\.[^/.]+$/, '');
    setInputTitle(cleanName);

    try {
      const audioId = await saveAudioFile(file);
      setInputUrl(audioId);

      setActiveTrack((prev) => ({
        ...prev,
        title: cleanName,
        url: audioId,
        embedUrl: audioId,
        type: 'idb',
        platform: 'Uploaded Audio',
      }));

      if (currentTrack.onTrackUpdated) {
        try {
          currentTrack.onTrackUpdated(audioId, `✦ ${cleanName}`);
        } catch (err) {
          // ignore
        }
      }

      if (currentTrack.isAnthem) {
        await updateCoupleProfile({
          ...coupleProfile,
          songUrl: audioId,
          anthemTitle: cleanName,
        });
        showToast('Love Anthem updated with audio file ✦');
      } else if (currentTrack.memoryId) {
        await updateMemory(currentTrack.memoryId, {
          songUrl: audioId,
          song: `✦ ${cleanName}`,
        });
        showToast('Memory audio saved in vault ✦');
      } else {
        showToast('Audio file loaded into player ✦');
      }

      setShowUrlEditor(false);
    } catch (err) {
      console.warn('Failed to save audio file to IndexedDB:', err);
      showToast('Error uploading audio file');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface rounded-2xl max-w-md w-full border border-secondary/40 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-2 text-primary min-w-0">
            <Icon name="music_note" size={18} className="text-secondary shrink-0" />
            <span className="font-serif font-bold text-sm truncate">
              {currentTrack.isAnthem ? 'Our Love Anthem' : 'Memory Soundtrack'}
            </span>
            {embedInfo.platform !== 'None' && (
              <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/30 text-[9px] font-bold uppercase tracking-wider shrink-0">
                {embedInfo.platform}
              </span>
            )}
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

          {/* Universal Player Area */}
          <div className="rounded-xl overflow-hidden shadow-sm border border-secondary/35 bg-surface-container-low">
            {embedInfo.type === 'spotify' && (
              <div className="w-full bg-[#121212]">
                <iframe
                  key={embedInfo.embedUrl}
                  src={embedInfo.embedUrl}
                  width="100%"
                  height="152"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="w-full"
                  title={`${currentTrack.title} Player`}
                ></iframe>
              </div>
            )}

            {embedInfo.type === 'youtube' && (
              <div className="w-full aspect-video bg-black">
                <iframe
                  key={embedInfo.embedUrl}
                  src={embedInfo.embedUrl}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                  title={`${currentTrack.title} Player`}
                ></iframe>
              </div>
            )}

            {embedInfo.type === 'soundcloud' && (
              <div className="w-full bg-black">
                <iframe
                  key={embedInfo.embedUrl}
                  width="100%"
                  height="166"
                  scrolling="no"
                  frameBorder="no"
                  allow="autoplay"
                  src={embedInfo.embedUrl}
                  className="w-full"
                  title={`${currentTrack.title} Player`}
                ></iframe>
              </div>
            )}

            {embedInfo.type === 'audiomack' && (
              <div className="w-full bg-surface-container-low">
                <iframe
                  key={embedInfo.embedUrl}
                  src={embedInfo.embedUrl}
                  scrolling="no"
                  width="100%"
                  height="252"
                  frameBorder="0"
                  className="w-full"
                  title={`${currentTrack.title} Player`}
                  allow="autoplay; encrypted-media"
                ></iframe>
              </div>
            )}

            {(embedInfo.type === 'direct' || embedInfo.type === 'idb') && (
              <div className="p-4 text-center space-y-3 bg-surface-container-low">
                <div className="flex items-center justify-center gap-2">
                  <Icon name="music_note" size={20} className="text-secondary" />
                  <span className="font-serif text-sm font-semibold text-primary">{currentTrack.title}</span>
                </div>
                {resolvedAudioUrl ? (
                  <audio
                    key={resolvedAudioUrl}
                    controls
                    autoPlay
                    className="w-full rounded-lg"
                    src={resolvedAudioUrl}
                  >
                    Your browser does not support audio playback.
                  </audio>
                ) : (
                  <div className="space-y-1.5 py-2">
                    <p className="font-editorial italic text-xs text-secondary">
                      ✦ Audio file stored on the device where it was uploaded.
                    </p>
                    <p className="font-sans text-[10px] text-on-surface-variant/70">
                      To stream across both phones seamlessly, paste a Spotify, YouTube, or audio link!
                    </p>
                  </div>
                )}
              </div>
            )}

            {embedInfo.type === 'none' && (
              <div className="p-5 text-center space-y-3 bg-surface-container-low">
                <div className="flex items-center justify-center gap-1.5 h-6">
                  <span className="w-1 h-3 bg-secondary rounded-full animate-bar-wave-1"></span>
                  <span className="w-1 h-5 bg-secondary rounded-full animate-bar-wave-2"></span>
                  <span className="w-1 h-2 bg-primary rounded-full animate-bar-wave-3"></span>
                  <span className="w-1 h-6 bg-secondary rounded-full animate-bar-wave-4"></span>
                  <span className="w-1 h-3 bg-secondary rounded-full animate-bar-wave-5"></span>
                </div>
                <p className="font-editorial italic text-xs text-on-surface-variant">
                  Acoustic romantic melody active. Paste a Spotify, YouTube, SoundCloud, or MP3 link below to stream directly!
                </p>
              </div>
            )}
          </div>

          {/* Quick Switch Button between Memory Track and Couple Anthem */}
          {!currentTrack.isAnthem && (
            <div className="flex justify-center pt-1">
              <button
                type="button"
                onClick={playAnthem}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-secondary-container/30 border border-secondary/40 text-primary hover:bg-secondary-container/60 transition-all text-xs font-montserrat font-semibold active:scale-95"
              >
                <Icon name="favorite" size={13} className="text-secondary" />
                <span>Play Our Couple Love Anthem (“{coupleProfile.anthemTitle}”)</span>
              </button>
            </div>
          )}

          {/* Upload / Change Song URL Section */}
          <div className="pt-2 border-t border-outline-variant/30 space-y-2">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowUrlEditor((prev) => !prev)}
                className="text-[10px] font-montserrat uppercase tracking-wider text-secondary font-semibold hover:underline flex items-center gap-1.5"
              >
                <Icon name={showUrlEditor ? 'expand_less' : 'link'} size={14} className="text-secondary" />
                <span>{showUrlEditor ? 'Hide Track Settings' : 'Add / Change Song URL (Spotify, YouTube, MP3)'}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[10px] font-montserrat text-primary hover:text-secondary flex items-center gap-1 font-semibold"
                title="Upload audio file"
              >
                <Icon name="upload_file" size={13} className="text-secondary" />
                <span>Upload Audio</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {showUrlEditor && (
              <form onSubmit={handleUpdateTrackUrl} className="p-3.5 rounded-xl bg-surface-container-low border border-secondary/30 space-y-2.5 animate-fade-in">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-montserrat uppercase tracking-wider text-secondary font-semibold">
                      Song Streaming URL
                    </label>
                    <span className="text-[9px] text-on-surface-variant">
                      Spotify · YouTube · SoundCloud · MP3
                    </span>
                  </div>
                  <input
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://open.spotify.com/track/... or YouTube / MP3 link"
                    className="w-full bg-surface-container-lowest border border-secondary/30 rounded-lg p-2 text-xs text-primary font-sans focus:outline-none focus:border-secondary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={inputTitle}
                    onChange={(e) => setInputTitle(e.target.value)}
                    placeholder="Song Title"
                    className="w-full bg-surface-container-lowest border border-secondary/30 rounded-lg p-2 text-xs text-primary focus:outline-none focus:border-secondary"
                  />
                  <input
                    type="text"
                    value={inputArtist}
                    onChange={(e) => setInputArtist(e.target.value)}
                    placeholder="Artist"
                    className="w-full bg-surface-container-lowest border border-secondary/30 rounded-lg p-2 text-xs text-primary focus:outline-none focus:border-secondary"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 rounded-full bg-primary text-secondary-fixed font-montserrat text-[10px] tracking-wider uppercase font-bold hover:bg-primary-container active:scale-95 transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Icon name="save" size={13} />
                  <span>Apply &amp; Stream Track</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
