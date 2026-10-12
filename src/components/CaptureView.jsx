import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import Icon from './Icon';
import { compressImage } from '../utils/imageCompressor';
import TextFormattingToolbar from './TextFormattingToolbar';
import SongSelector from './SongSelector';
import CardColorPicker from './CardColorPicker';
import { saveAudioFile } from '../utils/audioStorage';

export default function CaptureView() {
  const {
    setActiveTab,
    addMemory,
    coupleProfile,
    setIsAudioPlayerOpen,
  } = useApp();

  const fileInputRef = useRef(null);
  const letterTextareaRef = useRef(null);

  // Form states - completely clean and ready to receive user data
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState(coupleProfile?.partner1 || 'Mine');
  const [momentDate, setMomentDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [location, setLocation] = useState('');
  const [letter, setLetter] = useState('');
  const [counterNote, setCounterNote] = useState('');
  const [selectedMood, setSelectedMood] = useState('Intimate');
  const [selectedSong, setSelectedSong] = useState(
    `✦ ${coupleProfile?.anthemArtist || 'Fave'} — ${coupleProfile?.anthemTitle || 'Baby Riddim'}`
  );
  const [songUrl, setSongUrl] = useState(coupleProfile?.songUrl || '');
  const [cardColor, setCardColor] = useState('parchment');
  const [isLocked, setIsLocked] = useState(false);
  const [attachedPhotos, setAttachedPhotos] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [audioBlobUrl, setAudioBlobUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);

  const moodOptions = [
    'Effortless Joy',
    'Intimate',
    'Adventures',
    'Celebration',
    'Quiet Love',
  ];

  const formatAnniversaryLabel = () => {
    const raw = coupleProfile?.anniversaryDate || '2025-04-27';
    const parts = raw.split('-').map(Number);
    if (parts.length === 3) {
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      return `${parts[2]}th ${months[parts[1] - 1]}`;
    }
    return '27th April';
  };

  // Handle image upload with automatic mobile compression
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      try {
        const { dataUrl } = await compressImage(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.8 });
        setAttachedPhotos((prev) => [
          ...prev,
          {
            id: `photo-${Date.now()}-${index}`,
            caption: file.name.slice(0, 15),
            url: dataUrl,
          },
        ]);
      } catch (err) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setAttachedPhotos((prev) => [
            ...prev,
            {
              id: `photo-${Date.now()}-${index}`,
              caption: file.name.slice(0, 15),
              url: event.target.result,
            },
          ]);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removePhoto = (id) => {
    setAttachedPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  // Audio memo recorder
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        try {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const audioId = await saveAudioFile(blob);
          setAudioBlobUrl(audioId);
        } catch (err) {
          console.warn('Failed to save audio memo to IndexedDB:', err);
          setAudioBlobUrl('recorded-memo');
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      setIsRecording(true);
      setRecordSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    }
    clearInterval(timerRef.current);
    setIsRecording(false);
    if (!audioBlobUrl) {
      setAudioBlobUrl('recorded-memo');
    }
  };

  // Submit new memory
  const handleSaveToCapsule = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!title.trim() && !letter.trim() && attachedPhotos.length === 0) {
      alert("Please enter a title, photo, or letter for your memory.");
      return;
    }

    setIsSaving(true);

    try {
      const formattedDate = new Date(momentDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

      const newMemory = {
        id: `memory-${Date.now()}`,
        title: title.trim() || 'A Sacred Keepsake Second',
        chapter: `Chronicle · ${formattedDate}`,
        date: momentDate,
        displayDate: formattedDate,
        location: location.trim() || 'Our Sanctuary',
        photos: attachedPhotos.map((p) => p.url),
        letter: letter.trim() || 'Every second in this quiet constellation is a blessing beyond words.',
        author: author,
        counterNote: counterNote.trim() || null,
        song: selectedSong,
        songUrl: songUrl || null,
        cardColor: cardColor || 'parchment',
        tag: selectedMood === 'Adventures' ? 'Travel' : selectedMood === 'Celebration' ? 'Milestones' : 'Letters',
        mood: selectedMood,
        isFavorite: true,
        isMemoryOfDay: false,
        isLocked: isLocked,
        audioMemoDuration: audioBlobUrl ? `0:${recordSeconds.toString().padStart(2, '0')}` : null,
        voiceMemoUrl: audioBlobUrl || null,
      };

      try {
        await addMemory(newMemory);
      } catch (err) {
        console.error('Error saving memory:', err);
      }

      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#ffd79b', '#2f020e', '#ffdeae', '#e8c086'],
        });
      } catch (err) {
        // Ignore
      }

      setActiveTab('journey');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-surface min-h-full">
      {/* Top Action Bar */}
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md px-4 py-2.5 border-b border-outline-variant/30 flex items-center justify-between transition-colors">
        <button
          onClick={() => setActiveTab('sanctuary')}
          className="w-8 h-8 rounded-full border border-secondary/20 hover:border-secondary/40 text-on-surface-variant hover:text-secondary active:scale-90 transition-all flex items-center justify-center"
          type="button"
          title="Cancel"
        >
          <Icon name="close" size={16} />
        </button>

        {/* Monogram Crest */}
        <div className="flex items-center gap-1.5 opacity-85">
          <span className="text-secondary text-[10px]">✦</span>
          <span className="font-cinzel font-semibold text-base tracking-widest text-primary">
            {(coupleProfile?.partner1 || 'Mine').charAt(0)} &amp; {(coupleProfile?.partner2 || 'Sucre').charAt(0)}
          </span>
          <span className="text-secondary text-[10px]">✦</span>
        </div>

        {/* Quick Save Action in Header */}
        <button
          type="button"
          onClick={handleSaveToCapsule}
          disabled={isSaving}
          className="px-3.5 py-1.5 rounded-full bg-primary hover:bg-[#4a1622] text-secondary-fixed font-montserrat text-xs tracking-wider uppercase font-bold border border-secondary/40 shadow-sm active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-60"
          title="Save Memory"
        >
          <Icon name={isSaving ? "sync" : "check"} size={13} className={isSaving ? "animate-spin" : ""} />
          <span>{isSaving ? "Saving..." : "Save"}</span>
        </button>
      </header>

      {/* Form Content */}
      <form onSubmit={handleSaveToCapsule} className="px-3.5 sm:px-5 pt-4 sm:pt-5 pb-12 flex flex-col gap-5 sm:gap-6 flex-1">
        {/* Title & Archival Header */}
        <section className="text-center pt-1">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <span className="h-[1px] w-8 bg-secondary/30"></span>
            <span className="text-secondary font-cinzel text-[10px] tracking-widest uppercase font-bold">
              ✦ SACRED KEEPSAKE ✦
            </span>
            <span className="h-[1px] w-8 bg-secondary/30"></span>
          </div>
          <h1 className="font-serif text-2xl md:text-3xl text-primary font-bold">
            Pen a New Memory
          </h1>
          <p className="font-editorial italic text-sm md:text-base text-on-surface-variant/85 mt-1">
            “Immortalizing the quiet cadence of today.”
          </p>
        </section>

        {/* Memory Title Input */}
        <section className="bg-surface-container-lowest border border-secondary/25 rounded-2xl p-3.5 shadow-sm">
          <label className="font-montserrat text-[9px] uppercase tracking-wider text-secondary font-semibold block mb-1">
            Memory Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Our First Beach Sunset"
            className="w-full bg-transparent border-none p-0 font-serif font-bold text-lg text-primary focus:ring-0 focus:outline-none placeholder:text-on-surface-variant/40"
          />
        </section>

        {/* Media Upload Area */}
        <section className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <label className="font-montserrat text-[10px] uppercase tracking-wider text-primary font-semibold flex items-center gap-1.5">
              <Icon name="photo_camera" size={14} className="text-secondary" />
              <span>Keepsake Photos & Frames</span>
            </label>
            <span className="font-montserrat text-[10px] text-on-surface-variant/70 uppercase">
              {attachedPhotos.length} Attached
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {attachedPhotos.map((photo) => (
              <div
                key={photo.id}
                className="relative group aspect-[4/5] rounded bg-surface-container-low p-1.5 border border-secondary/30 shadow-sm flex flex-col justify-between"
              >
                <div className="w-full h-full overflow-hidden rounded-[2px] relative">
                  <img
                    className="w-full h-full object-cover"
                    src={photo.url}
                    alt={photo.caption}
                  />
                </div>
                <button
                  onClick={() => removePhoto(photo.id)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-surface flex items-center justify-center shadow hover:scale-105 active:scale-95 transition-transform"
                  type="button"
                  title="Remove photo"
                >
                  <Icon name="close" size={11} />
                </button>
                <div className="text-center pt-1 truncate">
                  <p className="font-montserrat text-[8px] leading-tight text-secondary uppercase tracking-tighter truncate">
                    {photo.caption}
                  </p>
                </div>
              </div>
            ))}

            {/* Upload Dropzone Button */}
            <label className="aspect-[4/5] rounded border-2 border-dashed border-secondary/40 hover:border-secondary bg-surface-container-lowest/60 hover:bg-surface-container-low transition-all duration-200 cursor-pointer flex flex-col items-center justify-center p-2 text-center group active:scale-95">
              <div className="w-8 h-8 rounded-full bg-secondary-container/40 flex items-center justify-center text-primary mb-1.5 group-hover:scale-110 transition-transform">
                <Icon name="add_photo_alternate" size={18} />
              </div>
              <span className="font-montserrat text-[9px] leading-tight uppercase tracking-wider text-primary font-medium">
                Add Photo<br />or Film
              </span>
              <span className="text-[8px] text-on-surface-variant/60 font-sans mt-0.5">
                Upload
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </section>

        {/* Date & Location Selector */}
        <section className="bg-surface-container-lowest border border-secondary/25 rounded p-3.5 shadow-sm space-y-3">
          <div className="grid grid-cols-1 divide-y divide-outline-variant/30">
            {/* Date Row */}
            <div className="pb-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="calendar_today" size={16} className="text-secondary" />
                <span className="font-montserrat text-[10px] uppercase tracking-wider text-on-surface-variant">
                  Date
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={momentDate}
                  onChange={(e) => setMomentDate(e.target.value)}
                  className="bg-transparent text-right font-serif text-sm text-primary border-none p-0 focus:ring-0 cursor-pointer hover:text-secondary"
                />
                <span className="text-secondary text-[10px]">✦</span>
              </div>
            </div>

            {/* Location Row */}
            <div className="pt-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="location_on" size={16} className="text-secondary" />
                <span className="font-montserrat text-[10px] uppercase tracking-wider text-on-surface-variant">
                  Location
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Lagos, Nigeria"
                  className="bg-transparent text-right font-sans text-xs text-primary border-none p-0 focus:ring-0 w-44 hover:text-secondary"
                />
              </div>
            </div>
          </div>
        </section>

        {/* The 'Side Note' Journal Editor */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="font-montserrat text-[10px] uppercase tracking-wider text-primary font-semibold flex items-center gap-1.5">
              <Icon name="stylus_note" size={14} className="text-secondary" />
              <span>Side Note · Written by {author}</span>
            </label>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-secondary font-serif italic text-xs">Author:</span>
              <select
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="bg-transparent text-xs font-serif italic text-secondary border-none p-0 focus:ring-0 cursor-pointer"
              >
                <option value={coupleProfile?.partner1 || 'Mine'}>{coupleProfile?.partner1 || 'Mine'}</option>
                <option value={coupleProfile?.partner2 || 'Sucre'}>{coupleProfile?.partner2 || 'Sucre'}</option>
              </select>
            </div>
          </div>

          {/* Parchment Double-Hairline Archival Stationery */}
          <div className="parchment-texture rounded-2xl border border-secondary/35 p-1 bg-surface-container-lowest shadow-sm">
            <div className="rounded-xl border border-secondary/20 p-4 space-y-3 bg-surface/80 backdrop-blur-[1px]">
              <span className="font-editorial italic text-base text-secondary block font-semibold">
                Dear Heart,
              </span>

              {/* Formatting & Emojis Toolbar */}
              <TextFormattingToolbar
                textareaRef={letterTextareaRef}
                value={letter}
                onChange={setLetter}
              />

              <textarea
                ref={letterTextareaRef}
                value={letter}
                onChange={(e) => setLetter(e.target.value)}
                rows={6}
                placeholder="What made this moment unforgettable? Write something to make your love smile in ten years... Press Enter twice to create new paragraphs."
                className="w-full bg-transparent border-none p-0 text-primary font-editorial italic text-lg md:text-xl leading-relaxed focus:ring-0 resize-y placeholder:text-on-surface-variant/40"
              ></textarea>

              {/* Counter Perspective Note */}
              <div className="pt-2 border-t border-outline-variant/20">
                <input
                  type="text"
                  value={counterNote}
                  onChange={(e) => setCounterNote(e.target.value)}
                  placeholder={`Optional: A note from ${author === (coupleProfile?.partner1 || 'Mine') ? (coupleProfile?.partner2 || 'Sucre') : (coupleProfile?.partner1 || 'Mine')}...`}
                  className="w-full bg-transparent text-sm font-editorial italic text-on-surface-variant border-none p-0 focus:ring-0 placeholder:text-on-surface-variant/40"
                />
              </div>

              {/* Stationery Bottom Bar */}
              <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-between flex-wrap gap-2">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    type="button"
                    className="flex items-center gap-2 bg-secondary-fixed/40 hover:bg-secondary-fixed/70 border border-secondary/30 rounded-full px-3.5 py-1.5 transition-all active:scale-95 text-primary shadow-sm"
                  >
                    <Icon name="mic" size={14} />
                    <span className="font-montserrat text-[9px] uppercase tracking-wider font-semibold">
                      {audioBlobUrl ? 'Re-record Audio Memo' : 'Record Audio Memo'}
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    type="button"
                    className="flex items-center gap-2 bg-error-container border border-error/40 rounded-full px-3.5 py-1.5 transition-all text-error active:scale-95 shadow-sm"
                  >
                    <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
                    <span className="font-montserrat text-[9px] uppercase tracking-wider font-bold">
                      Stop ({recordSeconds}s)
                    </span>
                  </button>
                )}

                <div className="flex items-center gap-2 text-on-surface-variant/70 font-montserrat text-[9px] tracking-widest uppercase font-medium">
                  <span>✦ Wax Sealed</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Song Soundtrack Resonance for this memory */}
        <section className="bg-surface-container-lowest border border-secondary/30 rounded-2xl p-3.5 shadow-xs">
          <SongSelector
            selectedSong={selectedSong}
            onChange={setSelectedSong}
            songUrl={songUrl}
            onUrlChange={setSongUrl}
            coupleProfile={coupleProfile}
          />
        </section>

        {/* Card Color Tone for Main Screen */}
        <section className="bg-surface-container-lowest border border-secondary/30 rounded-2xl p-3.5 shadow-xs">
          <CardColorPicker
            selectedColor={cardColor}
            onChange={setCardColor}
          />
        </section>

        {/* Mood Tag Selector Pills */}
        <section className="space-y-2">
          <span className="font-montserrat text-[10px] uppercase tracking-wider text-primary font-semibold flex items-center gap-1.5">
            <Icon name="label" size={14} className="text-secondary" />
            <span>Atmosphere & Mood Tags</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {moodOptions.map((mood) => {
              const isSelected = selectedMood === mood;
              return (
                <button
                  key={mood}
                  type="button"
                  onClick={() => setSelectedMood(mood)}
                  className={`px-3 py-1.5 rounded-full font-montserrat text-[9px] uppercase tracking-wider flex items-center gap-1 transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-primary text-surface border border-secondary/40 shadow-sm'
                      : 'bg-surface-container-lowest text-on-surface-variant hover:text-primary hover:border-secondary border border-outline-variant/40'
                  }`}
                >
                  {isSelected && <span className="text-secondary-fixed">✦</span>}
                  <span>{mood}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Private Capsule Toggle */}
        <section className="bg-surface-container-lowest border border-secondary/30 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                isLocked
                  ? 'bg-primary text-secondary-fixed border-secondary'
                  : 'bg-secondary-container/30 border-secondary/30 text-secondary'
              }`}
            >
              <Icon name={isLocked ? 'lock' : 'lock_open'} size={17} />
            </div>
            <div>
              <h3 className="font-serif text-sm font-semibold text-primary">
                Lock until Anniversary
              </h3>
              <p className="font-sans text-[11px] text-on-surface-variant/80">
                Capsule seals until {formatAnniversaryLabel()}
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isLocked}
              onChange={(e) => setIsLocked(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary border border-secondary/30"></div>
          </label>
        </section>

        {/* Prominent Save Button Placed Just Below Everything for Good UX */}
        <div className="pt-3 pb-8 space-y-2">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-4 rounded-full bg-gradient-to-r from-primary via-[#4a1622] to-primary text-secondary-fixed font-montserrat text-xs tracking-widest uppercase font-bold border border-secondary/50 shadow-lg hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-75"
          >
            <Icon name={isSaving ? "sync" : "auto_awesome"} size={17} className={`text-secondary-fixed ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? "Saving Memory into Vault..." : "Save Memory ✦"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
