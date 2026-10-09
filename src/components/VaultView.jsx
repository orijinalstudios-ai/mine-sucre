import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import TopAppBar from './TopAppBar';
import Icon from './Icon';

export default function VaultView() {
  const {
    coupleProfile,
    memories,
    vows,
    addVow,
    deleteVow,
    setIsAudioPlayerOpen,
    setIsKeepsakeBookOpen,
    setActiveTab,
    timeStats,
  } = useApp();

  const [activeTabYear, setActiveTabYear] = useState('year1'); // 'year1', 'year2', 'vows'
  const [showAddVowModal, setShowAddVowModal] = useState(false);
  const [newVowText, setNewVowText] = useState('');
  const [newVowAuthor, setNewVowAuthor] = useState(coupleProfile.partner1);

  // Stats calculation from real memories
  const totalPhotos = memories.reduce((acc, m) => acc + (m.photos?.length || 0), 0);
  const totalLetters = memories.filter((m) => m.letter).length;
  const totalFavorites = memories.filter((m) => m.isFavorite).length;

  const handleSaveVow = (e) => {
    e.preventDefault();
    if (!newVowText.trim()) return;
    addVow({
      author: newVowAuthor,
      vow: newVowText.trim(),
      date: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    });
    setNewVowText('');
    setShowAddVowModal(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-surface min-h-full">
      <TopAppBar title="Annual Retrospective" />

      {/* Year & Category Switcher */}
      <section className="p-3 bg-surface-container-low border-b border-outline-variant/20 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex bg-surface-container rounded-lg p-1 border border-outline-variant/30">
          <button
            onClick={() => setActiveTabYear('year1')}
            className={`flex-1 py-1.5 px-2 rounded font-montserrat text-[10px] tracking-wider uppercase transition-all ${
              activeTabYear === 'year1'
                ? 'bg-primary text-secondary-fixed font-bold shadow-sm'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Year 1 Archive
          </button>
          <button
            onClick={() => setActiveTabYear('year2')}
            className={`flex-1 py-1.5 px-2 rounded font-montserrat text-[10px] tracking-wider uppercase transition-all ${
              activeTabYear === 'year2'
                ? 'bg-primary text-secondary-fixed font-bold shadow-sm'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Year 2 (Upcoming)
          </button>
          <button
            onClick={() => setActiveTabYear('vows')}
            className={`flex-1 py-1.5 px-2 rounded font-montserrat text-[10px] tracking-wider uppercase transition-all ${
              activeTabYear === 'vows'
                ? 'bg-primary text-secondary-fixed font-bold shadow-sm'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Our Vows ({vows.length})
          </button>
        </div>
      </section>

      <main className="px-5 py-6 space-y-6 flex-1">
        {activeTabYear === 'year1' && (
          <>
            {/* Save The Next Date Countdown Badge */}
            <section className="bg-surface-container-low border border-secondary/30 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-secondary-container/40 flex items-center justify-center text-secondary border border-secondary/30">
                  <Icon name="hourglass_top" size={18} />
                </div>
                <div>
                  <span className="font-montserrat uppercase text-secondary block text-[9px] tracking-widest font-semibold">
                    Next Milestone
                  </span>
                  <span className="font-serif text-sm md:text-base text-primary block leading-tight font-medium">
                    {timeStats.nextAnniversaryFormatted}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-serif text-primary font-bold text-lg block leading-none">
                  {timeStats.daysTogether}
                </span>
                <span className="font-montserrat text-[8px] uppercase tracking-wider text-outline block mt-0.5">
                  Days Together
                </span>
              </div>
            </section>

            {/* Our Soundtrack of the Year (Audiomack Real Playback) */}
            <section
              onClick={() => setIsAudioPlayerOpen(true)}
              className="rounded-xl bg-surface-container-lowest border border-secondary/35 p-4 relative overflow-hidden shadow-sm cursor-pointer hover:border-secondary transition-colors group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-1.5">
                  <span className="text-secondary text-[11px]">✦</span>
                  <span className="font-montserrat uppercase text-secondary text-[10px] tracking-widest font-semibold">
                    Our Love Anthem
                  </span>
                </div>
                <span className="font-montserrat text-[9px] uppercase tracking-wider text-secondary font-semibold hover:underline">
                  Play Track ✦
                </span>
              </div>

              <div className="flex items-center space-x-4">
                {/* Vinyl Disc Art Record */}
                <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-[#1b120e] flex items-center justify-center shadow-lg relative spin-slow">
                    {/* Vinyl Grooves */}
                    <div className="w-16 h-16 rounded-full border border-stone-800 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full border border-stone-700 flex items-center justify-center">
                        {/* Center Label */}
                        <div className="w-7 h-7 rounded-full bg-primary-container border border-secondary-fixed flex items-center justify-center text-[7px] text-secondary-fixed font-serif font-bold">
                          M&S
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Center Play Button Overlay */}
                  <div className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-primary/80 backdrop-blur-sm text-secondary-fixed flex items-center justify-center border border-secondary/50 shadow group-hover:scale-110 transition-transform">
                    <Icon name="play_arrow" size={15} filled={true} className="ml-0.5" />
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex-1 min-w-0">
                  <span className="font-serif text-primary text-base font-semibold block truncate">
                    {coupleProfile.anthemTitle}
                  </span>
                  <span className="font-montserrat text-[10px] text-secondary font-medium tracking-wider uppercase block -mt-0.5">
                    {coupleProfile.anthemArtist}
                  </span>
                  <p className="font-serif italic text-on-surface-variant text-xs leading-relaxed mt-1.5 border-l-2 border-secondary/40 pl-2">
                    “Baby riddim playing on replay... our shared constellation.”
                  </p>
                </div>
              </div>
            </section>

            {/* Retrospective Statistics Grid */}
            <section className="grid grid-cols-2 gap-3">
              <div className="bg-surface-container-low p-3.5 rounded-xl border border-secondary/25 shadow-sm text-center">
                <div className="flex justify-center mb-1 text-secondary">
                  <Icon name="auto_stories" size={20} />
                </div>
                <span className="font-serif text-2xl text-primary font-bold block">
                  {memories.length}
                </span>
                <span className="font-montserrat text-[9px] uppercase tracking-wider text-on-surface-variant">
                  Memories Chronicled
                </span>
              </div>

              <div className="bg-surface-container-low p-3.5 rounded-xl border border-secondary/25 shadow-sm text-center">
                <div className="flex justify-center mb-1 text-secondary">
                  <Icon name="photo_library" size={20} />
                </div>
                <span className="font-serif text-2xl text-primary font-bold block">
                  {totalPhotos}
                </span>
                <span className="font-montserrat text-[9px] uppercase tracking-wider text-on-surface-variant">
                  Photos Preserved
                </span>
              </div>

              <div className="bg-surface-container-low p-3.5 rounded-xl border border-secondary/25 shadow-sm text-center">
                <div className="flex justify-center mb-1 text-secondary">
                  <Icon name="stylus_note" size={20} />
                </div>
                <span className="font-serif text-2xl text-primary font-bold block">
                  {totalLetters}
                </span>
                <span className="font-montserrat text-[9px] uppercase tracking-wider text-on-surface-variant">
                  Side Notes Written
                </span>
              </div>

              <div className="bg-surface-container-low p-3.5 rounded-xl border border-secondary/25 shadow-sm text-center">
                <div className="flex justify-center mb-1 text-error">
                  <Icon name="favorite" size={20} filled={true} />
                </div>
                <span className="font-serif text-2xl text-primary font-bold block">
                  {totalFavorites}
                </span>
                <span className="font-montserrat text-[9px] uppercase tracking-wider text-on-surface-variant">
                  Starred Keepsakes
                </span>
              </div>
            </section>

            {/* Printable Keepsake Album CTA */}
            <section className="bg-gradient-to-r from-primary to-primary-container text-surface rounded-xl p-5 border border-secondary/40 shadow-md text-center space-y-3">
              <span className="font-montserrat text-[9px] uppercase tracking-widest text-secondary-fixed font-semibold block">
                Physical Keepsake
              </span>
              <h3 className="font-serif text-xl italic font-normal text-secondary-fixed">
                “Bound Forever in Print”
              </h3>
              <p className="font-sans text-xs text-primary-fixed-dim max-w-sm mx-auto">
                Generate a commemorative photo album ready for printing, framing, or saving as PDF.
              </p>
              <button
                onClick={() => setIsKeepsakeBookOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary text-primary font-montserrat text-xs tracking-wider uppercase font-bold shadow hover:bg-secondary-fixed active:scale-95 transition-all"
              >
                <Icon name="print" size={15} />
                <span>View Printable Album</span>
              </button>
            </section>
          </>
        )}

        {activeTabYear === 'year2' && (
          <section className="text-center py-12 space-y-4 bg-surface-container-low rounded-xl border border-secondary/20 p-6">
            <div className="w-12 h-12 rounded-full bg-secondary-container/30 border border-secondary/40 mx-auto flex items-center justify-center text-secondary">
              <Icon name="lock_clock" size={24} />
            </div>
            <h3 className="font-serif text-xl text-primary font-medium">
              Year 2 Archives Unfolding
            </h3>
            <p className="font-sans text-xs text-on-surface-variant max-w-xs mx-auto leading-relaxed">
              Every day writes another chapter of your journey together.
            </p>
            <div className="pt-2">
              <span className="font-montserrat text-[10px] uppercase tracking-widest text-secondary font-semibold">
                Countdown to Next Retrospective: {timeStats.days} Days Left
              </span>
            </div>
          </section>
        )}

        {activeTabYear === 'vows' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-montserrat text-[10px] uppercase tracking-widest text-secondary font-semibold">
                  Sacred Promises
                </span>
                <h3 className="font-serif text-2xl text-primary">Our Sealed Vows</h3>
              </div>

              <button
                onClick={() => setShowAddVowModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-secondary-fixed text-xs font-semibold shadow hover:bg-primary-container"
              >
                <Icon name="add_circle" size={14} />
                <span>Seal Vow</span>
              </button>
            </div>

            {vows.length === 0 ? (
              <div className="text-center py-12 space-y-3 bg-surface-container-low rounded-xl border border-secondary/20 p-6">
                <div className="w-12 h-12 rounded-full bg-secondary-container/20 border border-secondary/30 mx-auto flex items-center justify-center text-secondary">
                  <Icon name="drafts" size={22} />
                </div>
                <h4 className="font-serif text-base font-bold text-primary">
                  No Vows Sealed Yet
                </h4>
                <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
                  Seal sacred promises to one another that will be permanently preserved in your vault.
                </p>
                <button
                  onClick={() => setShowAddVowModal(true)}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-secondary-fixed text-xs font-semibold shadow"
                >
                  <Icon name="add_circle" size={14} />
                  <span>Seal Your First Vow</span>
                </button>
              </div>
            ) : (
              vows.map((vow, i) => (
                <div
                  key={i}
                  className="parchment-texture rounded-xl p-5 border border-secondary/35 shadow-sm space-y-2 relative overflow-hidden group"
                >
                  <div className="flex items-center justify-between text-secondary">
                    <span className="font-montserrat text-[9px] uppercase tracking-widest font-semibold">
                      Vow of {vow.author}
                    </span>
                    <button
                      onClick={() => deleteVow(i)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-on-surface-variant hover:text-error transition-opacity"
                      title="Remove Vow"
                    >
                      <Icon name="delete" size={14} />
                    </button>
                  </div>
                  <p className="font-serif italic text-sm text-primary leading-relaxed">
                    “{vow.vow}”
                  </p>
                  <div className="pt-2 flex items-center justify-between text-xs text-on-surface-variant/70 border-t border-secondary/20 font-sans">
                    <span>Dated: {vow.date}</span>
                    <span className="font-montserrat text-[9px] tracking-wider uppercase text-secondary">
                      ✦ Wax Sealed
                    </span>
                  </div>
                </div>
              ))
            )}
          </section>
        )}

        {/* Modal: Seal a New Vow */}
        {showAddVowModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <div className="bg-surface rounded-2xl max-w-md w-full border border-secondary/40 shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
                <h3 className="font-serif text-lg font-bold text-primary">
                  Seal a Sacred Vow
                </h3>
                <button
                  onClick={() => setShowAddVowModal(false)}
                  className="p-1 text-on-surface-variant hover:text-primary"
                >
                  <Icon name="close" size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveVow} className="space-y-4">
                <div className="space-y-1">
                  <label className="font-montserrat text-[10px] uppercase tracking-wider text-secondary font-semibold block">
                    Author
                  </label>
                  <select
                    value={newVowAuthor}
                    onChange={(e) => setNewVowAuthor(e.target.value)}
                    className="w-full bg-surface-container-low border border-secondary/30 rounded-lg p-2 text-xs font-serif text-primary"
                  >
                    <option value={coupleProfile.partner1}>{coupleProfile.partner1}</option>
                    <option value={coupleProfile.partner2}>{coupleProfile.partner2}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-montserrat text-[10px] uppercase tracking-wider text-secondary font-semibold block">
                    Your Sacred Promise
                  </label>
                  <textarea
                    rows={4}
                    value={newVowText}
                    onChange={(e) => setNewVowText(e.target.value)}
                    placeholder="I promise to honor your heart, cherish the quiet seconds, and love you with every sunrise..."
                    className="w-full bg-surface-container-low border border-secondary/30 rounded-lg p-3 text-xs font-serif italic text-primary focus:ring-0 focus:outline-none"
                    autoFocus
                  ></textarea>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddVowModal(false)}
                    className="px-4 py-2 rounded-full border border-outline-variant/40 text-xs font-montserrat uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-primary text-secondary-fixed text-xs font-montserrat uppercase tracking-wider font-semibold shadow"
                  >
                    Seal Vow ✦
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
