import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import Icon from './Icon';
import { compressImage } from '../utils/imageCompressor';

export default function CaptureView() {
  const {
    setActiveTab,
    addMemory,
    coupleProfile,
    setIsAudioPlayerOpen,
  } = useApp();

  const fileInputRef = useRef(null);

  // Form states - completely clean and ready to receive user data
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState(coupleProfile.partner1);
  const [momentDate, setMomentDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [location, setLocation] = useState('');
  const [letter, setLetter] = useState('');
  const [counterNote, setCounterNote] = useState('');
  const [selectedMood, setSelectedMood] = useState('Effortless Joy');
  const [selectedSong, setSelectedSong] = useState(
    `✦ ${coupleProfile.anthemArtist} — ${coupleProfile.anthemTitle}`
  );
  const [isLocked, setIsLocked] = useState(false);
  const [attachedPhotos, setAttachedPhotos] = useState([]);

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

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlobUrl(url);
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
  const handleSaveToCapsule = (e) => {
    e.preventDefault();

    if (!title.trim() && !letter.trim() && attachedPhotos.length === 0) {
      alert("Please enter a title, photo, or letter for your memory.");
      return;
    }

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
      tag: selectedMood === 'Adventures' ? 'Travel' : selectedMood === 'Celebration' ? 'Milestones' : 'Letters',
      mood: selectedMood,
      isFavorite: true,
      isMemoryOfDay: false,
      isLocked: isLocked,
      audioMemoDuration: audioBlobUrl ? `0:${recordSeconds.toString().padStart(2, '0')}` : null,
    };

    addMemory(newMemory);

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
  };

  return (
    <div className="flex-1 flex flex-col bg-surface min-h-full">
      {/* Top Action Bar */}
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md px-4 py-3 border-b border-outline-variant/30 flex items-center justify-between transition-colors">
        <button
          onClick={() => setActiveTab('sanctuary')}
          className="text-on-surface-variant font-montserrat text-xs uppercase tracking-widest hover:text-secondary transition-colors active:scale-95 flex items-center gap-1.5"
          type="button"
        >
          <Icon name="close" size={17} />
          <span>Cancel</span>
        </button>

        {/* Monogram Crest */}
        <div className="flex items-center gap-1.5 opacity-80">
          <span className="text-secondary text-[11px]">✦</span>
          <span className="font-serif italic text-base tracking-widest text-primary">
            {coupleProfile.partner1.charAt(0)} & {coupleProfile.partner2.charAt(0)}
          </span>
          <span className="text-secondary text-[11px]">✦</span>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveToCapsule}
          className="bg-primary text-secondary-fixed px-3.5 py-1.5 rounded-full border border-secondary/40 font-montserrat text-[10px] tracking-wider uppercase flex items-center gap-1.5 shadow-sm hover:bg-primary-container active:scale-95 group transition-transform"
          type="button"
        >
          <Icon name="auto_awesome" size={14} className="text-secondary-fixed" />
          <span className="font-medium tracking-wider">Save Memory</span>
        </button>
      </header>

      {/* Form Content */}
      <form onSubmit={handleSaveToCapsule} className="px-5 pt-5 pb-12 flex flex-col gap-6 flex-1">
        {/* Title & Archival Header */}
        <section className="text-center pt-1">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <span className="h-[1px] w-6 bg-secondary/30"></span>
            <span className="text-secondary font-montserrat text-[10px] tracking-widest uppercase">
              Sacred Keepsake
            </span>
            <span className="h-[1px] w-6 bg-secondary/30"></span>
          </div>
          <h1 className="font-serif text-2xl md:text-3xl text-primary font-normal">
            Pen a New Memory
          </h1>
          <p className="font-serif italic text-xs md:text-sm text-on-surface-variant/80 mt-1">
            “Immortalizing the quiet cadence of today.”
          </p>
        </section>

        {/* Memory Title Input */}
        <section className="bg-surface-container-lowest border border-secondary/25 rounded p-3 shadow-sm">
          <label className="font-montserrat text-[9px] uppercase tracking-wider text-secondary font-semibold block mb-1">
            Memory Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Our First Beach Sunset"
            className="w-full bg-transparent border-none p-0 font-serif text-base text-primary focus:ring-0 focus:outline-none placeholder:text-on-surface-variant/40"
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
                <option value={coupleProfile.partner1}>{coupleProfile.partner1}</option>
                <option value={coupleProfile.partner2}>{coupleProfile.partner2}</option>
              </select>
            </div>
          </div>

          {/* Parchment Double-Hairline Archival Stationery */}
          <div className="parchment-texture rounded border border-secondary/35 p-1 bg-surface-container-lowest shadow-sm">
            <div className="rounded border border-secondary/20 p-4 space-y-3 bg-surface/80 backdrop-blur-[1px]">
              <span className="font-serif italic text-sm text-secondary block">
                Dear Heart,
              </span>
              <textarea
                value={letter}
                onChange={(e) => setLetter(e.target.value)}
                rows={5}
                placeholder="What made this moment unforgettable? Write something to make your love smile in ten years..."
                className="w-full bg-transparent border-none p-0 text-primary font-serif italic text-base leading-relaxed focus:ring-0 resize-none placeholder:text-on-surface-variant/40"
              ></textarea>

              {/* Counter Perspective Note */}
              <div className="pt-2 border-t border-outline-variant/20">
                <input
                  type="text"
                  value={counterNote}
                  onChange={(e) => setCounterNote(e.target.value)}
                  placeholder={`Optional: A note from ${author === coupleProfile.partner1 ? coupleProfile.partner2 : coupleProfile.partner1}...`}
                  className="w-full bg-transparent text-xs font-serif italic text-on-surface-variant border-none p-0 focus:ring-0 placeholder:text-on-surface-variant/40"
                />
              </div>

              {/* Stationery Bottom Bar */}
              <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-between flex-wrap gap-2">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    type="button"
                    className="flex items-center gap-2 bg-secondary-fixed/40 hover:bg-secondary-fixed/70 border border-secondary/30 rounded-full px-3 py-1.5 transition-all active:scale-95 text-primary"
                  >
                    <Icon name="mic" size={15} />
                    <span className="font-montserrat text-[9px] uppercase tracking-wider font-medium">
                      {audioBlobUrl ? 'Re-record Audio Memo' : 'Record Audio Memo'}
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    type="button"
                    className="flex items-center gap-2 bg-error-container border border-error/40 rounded-full px-3 py-1.5 transition-all text-error active:scale-95"
                  >
                    <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
                    <span className="font-montserrat text-[9px] uppercase tracking-wider font-semibold">
                      Stop ({recordSeconds}s)
                    </span>
                  </button>
                )}

                <div className="flex items-center gap-2 text-on-surface-variant/70 font-montserrat text-[9px] tracking-widest uppercase">
                  <span>✦ Wax Sealed</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Song Soundtrack Resonance */}
        <section className="bg-surface-container-lowest border border-secondary/25 rounded p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-montserrat text-[10px] uppercase tracking-wider text-primary font-semibold flex items-center gap-1.5">
              <Icon name="music_note" size={15} className="text-secondary" />
              <span>Soundtrack Resonance</span>
            </span>
            <span
              onClick={() => setIsAudioPlayerOpen(true)}
              className="font-sans text-[11px] text-secondary hover:underline cursor-pointer"
            >
              Open Audiomack Track ✦
            </span>
          </div>

          <div className="bg-primary-container/10 border border-secondary/35 rounded-full px-3.5 py-2 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5 overflow-hidden flex-1">
              <button
                type="button"
                onClick={() => setIsAudioPlayerOpen(true)}
                className="w-6 h-6 rounded-full bg-primary text-secondary-fixed flex items-center justify-center shrink-0 shadow active:scale-90"
              >
                <Icon name="play_arrow" size={14} filled={true} className="text-secondary-fixed ml-0.5" />
              </button>
              <input
                type="text"
                value={selectedSong}
                onChange={(e) => setSelectedSong(e.target.value)}
                placeholder="Song title and artist..."
                className="bg-transparent border-none p-0 font-serif text-xs text-primary truncate focus:ring-0 w-full"
              />
            </div>
          </div>
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
        <section className="bg-surface-container-lowest border border-secondary/30 rounded p-4 shadow-sm flex items-center justify-between gap-3">
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
                Capsule seals until March 27
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

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3.5 rounded-full bg-primary text-secondary-fixed font-montserrat text-xs tracking-widest uppercase font-semibold border border-secondary/50 shadow-md hover:bg-primary-container active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Icon name="auto_awesome" size={16} className="text-secondary-fixed" />
            <span>Archive Forever into Capsule</span>
          </button>
        </div>
      </form>
    </div>
  );
}
