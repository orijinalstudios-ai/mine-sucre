import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import Icon from './Icon';
import { compressImage } from '../utils/imageCompressor';
import TextFormattingToolbar from './TextFormattingToolbar';
import SongSelector from './SongSelector';
import CardColorPicker from './CardColorPicker';

export default function EditMemoryModal() {
  const {
    editingMemory,
    setEditingMemory,
    updateMemory,
    coupleProfile,
    showToast,
  } = useApp();

  const fileInputRef = useRef(null);
  const letterTextareaRef = useRef(null);

  // Form states initialized from editingMemory
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [momentDate, setMomentDate] = useState('');
  const [location, setLocation] = useState('');
  const [letter, setLetter] = useState('');
  const [counterNote, setCounterNote] = useState('');
  const [selectedMood, setSelectedMood] = useState('Effortless Joy');
  const [selectedSong, setSelectedSong] = useState('');
  const [cardColor, setCardColor] = useState('parchment');
  const [isLocked, setIsLocked] = useState(false);
  const [attachedPhotos, setAttachedPhotos] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const initializedMemoryIdRef = useRef(null);

  useEffect(() => {
    if (editingMemory) {
      // Don't wipe out active edits if already editing this memory
      if (initializedMemoryIdRef.current === editingMemory.id) {
        return;
      }
      initializedMemoryIdRef.current = editingMemory.id;

      setTitle(editingMemory.title || '');
      setAuthor(editingMemory.author || coupleProfile?.partner1 || 'Sucre');
      setMomentDate(editingMemory.date || new Date().toISOString().split('T')[0]);
      setLocation(editingMemory.location || '');
      setLetter(editingMemory.letter || '');
      setCounterNote(editingMemory.counterNote || '');
      setSelectedMood(editingMemory.mood || 'Effortless Joy');
      setSelectedSong(editingMemory.song || '');
      setCardColor(editingMemory.cardColor || 'parchment');
      setIsLocked(Boolean(editingMemory.isLocked));

      // Photos
      if (Array.isArray(editingMemory.photos)) {
        setAttachedPhotos(
          editingMemory.photos.map((url, idx) => ({
            id: `photo-${idx}-${Date.now()}`,
            url,
            caption: `Photo ${idx + 1}`,
          }))
        );
      } else {
        setAttachedPhotos([]);
      }
    } else {
      initializedMemoryIdRef.current = null;
    }
  }, [editingMemory]);

  if (!editingMemory) return null;

  const moodOptions = [
    'Effortless Joy',
    'Intimate',
    'Adventures',
    'Celebration',
    'Quiet Love',
  ];

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

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!title.trim() && !letter.trim() && attachedPhotos.length === 0) {
      alert('Please enter a title, photo, or letter for your memory.');
      return;
    }

    setIsSaving(true);

    const formattedDate = new Date(momentDate).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const updates = {
      title: title.trim() || 'A Sacred Keepsake Second',
      chapter: editingMemory.chapter || `Chronicle · ${formattedDate}`,
      date: momentDate,
      displayDate: formattedDate,
      location: location.trim() || 'Our Sanctuary',
      photos: attachedPhotos.map((p) => p.url),
      letter: letter.trim() || 'Every second in this quiet constellation is a blessing beyond words.',
      author,
      counterNote: counterNote.trim() || null,
      song: selectedSong || null,
      cardColor: cardColor || 'parchment',
      tag: selectedMood === 'Adventures' ? 'Travel' : selectedMood === 'Celebration' ? 'Milestones' : 'Letters',
      mood: selectedMood,
      isLocked,
    };

    try {
      await updateMemory(editingMemory.id, updates);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#ffd79b', '#2f020e', '#ffdeae'],
        });
      } catch (err) {
        // Ignore
      }
      setEditingMemory(null);
    } catch (err) {
      showToast('Error saving changes');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto no-scrollbar border border-secondary/40 shadow-2xl relative flex flex-col">
        {/* Sticky Modal Top Bar */}
        <header className="sticky top-0 bg-surface/95 backdrop-blur-md px-4 py-3 border-b border-outline-variant/30 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-secondary-container/30 border border-secondary/30 flex items-center justify-center text-secondary">
              <Icon name="edit" size={15} />
            </div>
            <h2 className="font-serif font-bold text-base text-primary">
              Edit Sacred Memory
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setEditingMemory(null)}
            className="w-8 h-8 rounded-full border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-primary active:scale-90 transition-all"
            title="Cancel"
          >
            <Icon name="close" size={16} />
          </button>
        </header>

        {/* Form Body */}
        <form onSubmit={handleUpdate} className="p-4 sm:p-5 space-y-5">
          {/* Title */}
          <section className="bg-surface-container-lowest border border-secondary/30 rounded-2xl p-3.5 shadow-xs">
            <label className="font-montserrat text-[9px] uppercase tracking-wider text-secondary font-semibold block mb-1">
              Memory Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Our First Beach Sunset"
              className="w-full bg-transparent border-none p-0 font-serif font-bold text-lg text-primary focus:ring-0 focus:outline-none"
            />
          </section>

          {/* Author Selector */}
          <section className="space-y-1.5">
            <label className="font-montserrat text-[9px] uppercase tracking-wider text-secondary font-semibold block">
              Authored By
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAuthor(coupleProfile.partner1)}
                className={`py-2 px-3 rounded-xl border text-xs font-montserrat uppercase tracking-wider transition-all ${
                  author === coupleProfile.partner1
                    ? 'bg-primary text-secondary-fixed border-secondary font-bold shadow-xs'
                    : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30'
                }`}
              >
                {coupleProfile.partner1}
              </button>
              <button
                type="button"
                onClick={() => setAuthor(coupleProfile.partner2)}
                className={`py-2 px-3 rounded-xl border text-xs font-montserrat uppercase tracking-wider transition-all ${
                  author === coupleProfile.partner2
                    ? 'bg-primary text-secondary-fixed border-secondary font-bold shadow-xs'
                    : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30'
                }`}
              >
                {coupleProfile.partner2}
              </button>
            </div>
          </section>

          {/* Photos Manager */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-montserrat text-[10px] uppercase tracking-wider text-primary font-semibold flex items-center gap-1.5">
                <Icon name="photo_camera" size={14} className="text-secondary" />
                <span>Keepsake Photos ({attachedPhotos.length})</span>
              </label>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {attachedPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative group aspect-[4/5] rounded-xl bg-surface-container-low p-1.5 border border-secondary/30 shadow-xs flex flex-col justify-between"
                >
                  <div className="w-full h-full overflow-hidden rounded-lg relative">
                    <img
                      className="w-full h-full object-cover"
                      src={photo.url}
                      alt={photo.caption}
                    />
                  </div>
                  <button
                    onClick={() => removePhoto(photo.id)}
                    className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-error text-white flex items-center justify-center shadow hover:scale-105 active:scale-95 transition-transform"
                    type="button"
                    title="Remove photo"
                  >
                    <Icon name="close" size={13} />
                  </button>
                </div>
              ))}

              {/* Add More Photos */}
              <label className="aspect-[4/5] rounded-xl border-2 border-dashed border-secondary/40 hover:border-secondary bg-surface-container-lowest/60 hover:bg-surface-container-low transition-all cursor-pointer flex flex-col items-center justify-center p-2 text-center group active:scale-95">
                <div className="w-8 h-8 rounded-full bg-secondary-container/40 flex items-center justify-center text-primary mb-1">
                  <Icon name="add_photo_alternate" size={18} />
                </div>
                <span className="font-montserrat text-[9px] uppercase tracking-wider text-primary font-medium">
                  Add Photo
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

          {/* Date & Location */}
          <section className="grid grid-cols-2 gap-3 bg-surface-container-lowest border border-secondary/30 rounded-2xl p-3.5 shadow-xs">
            <div className="space-y-1">
              <label className="font-montserrat text-[9px] uppercase tracking-wider text-secondary font-semibold flex items-center gap-1">
                <Icon name="calendar_today" size={12} className="text-secondary" />
                <span>Date</span>
              </label>
              <input
                type="date"
                value={momentDate}
                onChange={(e) => setMomentDate(e.target.value)}
                className="w-full bg-transparent border-none p-0 text-xs text-primary font-sans focus:ring-0"
              />
            </div>
            <div className="space-y-1">
              <label className="font-montserrat text-[9px] uppercase tracking-wider text-secondary font-semibold flex items-center gap-1">
                <Icon name="location_on" size={12} className="text-secondary" />
                <span>Location</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Our Sanctuary"
                className="w-full bg-transparent border-none p-0 text-xs text-primary font-sans focus:ring-0"
              />
            </div>
          </section>

          {/* Sacred Letter with Paragraphs, Formatting & Emojis */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-montserrat text-[10px] uppercase tracking-wider text-primary font-semibold flex items-center gap-1.5">
                <Icon name="history_edu" size={15} className="text-secondary" />
                <span>The Sacred Note (Preserves Paragraphs)</span>
              </label>
            </div>

            <div className="bg-surface-container-lowest border border-secondary/35 rounded-2xl p-3.5 space-y-2 shadow-xs">
              {/* Text formatting & Emoji Toolbar */}
              <TextFormattingToolbar
                textareaRef={letterTextareaRef}
                value={letter}
                onChange={setLetter}
              />

              <textarea
                ref={letterTextareaRef}
                value={letter}
                onChange={(e) => setLetter(e.target.value)}
                placeholder="Write your heartfelt memory... Press Enter twice to create new paragraphs. Use toolbar for bold, italics, quotes, and emojis."
                rows={6}
                className="w-full bg-transparent border-none p-0 font-editorial italic text-base md:text-lg text-primary focus:ring-0 placeholder:text-on-surface-variant/40 leading-relaxed resize-y"
              />

              {/* Counter Perspective Note */}
              <div className="pt-2 border-t border-outline-variant/20">
                <label className="font-montserrat text-[9px] uppercase tracking-wider text-secondary font-semibold block mb-1">
                  Optional Echo Note from {author === coupleProfile.partner1 ? coupleProfile.partner2 : coupleProfile.partner1}
                </label>
                <input
                  type="text"
                  value={counterNote}
                  onChange={(e) => setCounterNote(e.target.value)}
                  placeholder="A romantic echo perspective..."
                  className="w-full bg-transparent text-sm font-editorial italic text-on-surface-variant border-none p-0 focus:ring-0 placeholder:text-on-surface-variant/40"
                />
              </div>
            </div>
          </section>

          {/* Individual Song Soundtrack Selector */}
          <section className="bg-surface-container-lowest border border-secondary/30 rounded-2xl p-3.5 shadow-xs">
            <SongSelector
              selectedSong={selectedSong}
              onChange={setSelectedSong}
              coupleProfile={coupleProfile}
            />
          </section>

          {/* Card Color Display Tone Selector */}
          <section className="bg-surface-container-lowest border border-secondary/30 rounded-2xl p-3.5 shadow-xs">
            <CardColorPicker
              selectedColor={cardColor}
              onChange={setCardColor}
            />
          </section>

          {/* Atmosphere & Mood Tags */}
          <section className="space-y-1.5">
            <span className="font-montserrat text-[10px] uppercase tracking-wider text-primary font-semibold flex items-center gap-1.5">
              <Icon name="label" size={14} className="text-secondary" />
              <span>Mood &amp; Atmosphere</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {moodOptions.map((mood) => {
                const isSelected = selectedMood === mood;
                return (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => setSelectedMood(mood)}
                    className={`px-3 py-1.5 rounded-full font-montserrat text-[9px] uppercase tracking-wider transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-primary text-secondary-fixed border border-secondary/40 shadow-xs font-bold'
                        : 'bg-surface-container-low text-on-surface-variant border border-outline-variant/30 hover:border-secondary/30'
                    }`}
                  >
                    {isSelected && '✦ '}
                    {mood}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Lock Option */}
          <section className="bg-surface-container-lowest border border-secondary/30 rounded-2xl p-3.5 shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Icon name={isLocked ? 'lock' : 'lock_open'} size={18} className="text-secondary" />
              <div>
                <span className="font-serif text-xs font-semibold text-primary block">
                  Lock until Anniversary
                </span>
                <span className="text-[10px] text-on-surface-variant/80">
                  Keep sealed until April 27
                </span>
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
          <div className="pt-2 pb-4 space-y-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-4 rounded-full bg-gradient-to-r from-primary via-[#4a1622] to-primary text-secondary-fixed font-montserrat text-xs tracking-widest uppercase font-bold border border-secondary/50 shadow-lg hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-75"
            >
              <Icon name="auto_awesome" size={17} className="text-secondary-fixed" />
              <span>{isSaving ? 'Sealing Changes...' : 'Save Changes to Memory'}</span>
            </button>

            <button
              type="button"
              onClick={() => setEditingMemory(null)}
              className="w-full py-2.5 rounded-full border border-outline-variant/40 text-on-surface-variant hover:text-primary font-montserrat text-xs uppercase tracking-wider font-semibold active:scale-95 transition-all text-center"
            >
              Discard / Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
