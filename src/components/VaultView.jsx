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
      id: `vow-${Date.now()}`,
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
      {/* Sticky Combined Header: Top App Bar + Year/Vows Switcher */}
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm transition-colors">
        <TopAppBar title="Annual Retrospective" borderless />

        {/* Year & Category Switcher */}
        <section className="px-3 sm:px-4 py-2 bg-surface-container-low/70 border-t border-outline-variant/20">
          <div className="flex bg-surface-container/80 rounded-xl p-1 border border-outline-variant/30 gap-1">
            <button
              type="button"
              onClick={() => setActiveTabYear('year1')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-montserrat text-[10px] tracking-wider uppercase transition-all active:scale-95 ${
                activeTabYear === 'year1'
                  ? 'bg-primary text-secondary-fixed font-bold shadow-sm border border-secondary/30'
                  : 'text-on-surface-variant hover:text-primary font-medium'
              }`}
            >
              Year 1 Archive
            </button>
            <button
              type="button"
              onClick={() => setActiveTabYear('year2')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-montserrat text-[10px] tracking-wider uppercase transition-all active:scale-95 ${
                activeTabYear === 'year2'
                  ? 'bg-primary text-secondary-fixed font-bold shadow-sm border border-secondary/30'
                  : 'text-on-surface-variant hover:text-primary font-medium'
              }`}
            >
              Year 2
            </button>
            <button
              type="button"
              onClick={() => setActiveTabYear('vows')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-montserrat text-[10px] tracking-wider uppercase transition-all active:scale-95 ${
                activeTabYear === 'vows'
                  ? 'bg-primary text-secondary-fixed font-bold shadow-sm border border-secondary/30'
                  : 'text-on-surface-variant hover:text-primary font-medium'
              }`}
            >
              Vows ({vows.length})
            </button>
          </div>
        </section>
      </header>

      <main className="px-3.5 sm:px-5 py-4 sm:py-6 space-y-4 sm:space-y-6 flex-1">
        {activeTabYear === 'year1' && (
          <>
            {/* Save The Next Date Countdown Badge */}
            <section className="bg-surface-container-low border border-secondary/30 rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-secondary-container/30 flex items-center justify-center text-secondary border border-secondary/30 shrink-0">
                  <Icon name="hourglass_top" size={18} />
                </div>
                <div>
                  <span className="font-montserrat uppercase text-secondary block text-[9px] tracking-widest font-semibold">
                    Next Milestone
                  </span>
                  <span className="font-cinzel text-sm md:text-base text-primary block leading-tight font-bold">
                    {timeStats.nextAnniversaryFormatted}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-cinzel text-primary font-bold text-xl block leading-none">
                  {timeStats.daysTogether}
                </span>
                <span className="font-montserrat text-[8px] uppercase tracking-wider text-outline block mt-0.5 font-semibold">
                  Days Together
                </span>
              </div>
            </section>

            {/* Our Soundtrack of the Year (Audiomack Real Playback) */}
            <section
              onClick={() => setIsAudioPlayerOpen(true)}
              className="rounded-2xl bg-surface-container-lowest border border-secondary/35 p-4 relative overflow-hidden shadow-sm cursor-pointer hover:border-secondary transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-1.5">
                  <span className="text-secondary text-[11px]">✦</span>
                  <span className="font-cinzel uppercase text-secondary text-[10px] tracking-widest font-bold">
                    Our Love Anthem
                  </span>
                </div>
                <span className="font-montserrat text-[9px] uppercase tracking-wider text-secondary font-semibold group-hover:underline">
                  Play Track ✦
                </span>
              </div>

              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#2f020e] to-[#4a1622] text-[#ffd79b] border border-[#ffd79b]/40 flex items-center justify-center shrink-0 shadow group-hover:scale-105 transition-transform">
                  <Icon name="music_note" size={22} className="text-[#ffd79b]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-serif font-bold text-base text-primary truncate">
                    {coupleProfile.anthemTitle}
                  </h4>
                  <p className="font-editorial italic text-xs text-on-surface-variant">
                    by {coupleProfile.anthemArtist}
                  </p>
                </div>
              </div>
            </section>

            {/* Archival Numbers Grid */}
            <section className="space-y-2">
              <span className="font-montserrat text-[10px] uppercase tracking-widest text-secondary font-semibold block px-1">
                Vault Curations
              </span>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-surface-container-lowest p-3 rounded-2xl border border-secondary/30 text-center shadow-sm">
                  <span className="font-cinzel text-xl font-bold text-primary block">
                    {totalPhotos}
                  </span>
                  <span className="font-montserrat text-[9px] uppercase tracking-wider text-on-surface-variant font-medium">
                    Photos
                  </span>
                </div>
                <div className="bg-surface-container-lowest p-3 rounded-2xl border border-secondary/30 text-center shadow-sm">
                  <span className="font-cinzel text-xl font-bold text-primary block">
                    {totalLetters}
                  </span>
                  <span className="font-montserrat text-[9px] uppercase tracking-wider text-on-surface-variant font-medium">
                    Letters
                  </span>
                </div>
                <div className="bg-surface-container-lowest p-3 rounded-2xl border border-secondary/30 text-center shadow-sm">
                  <span className="font-cinzel text-xl font-bold text-primary block">
                    {totalFavorites}
                  </span>
                  <span className="font-montserrat text-[9px] uppercase tracking-wider text-on-surface-variant font-medium">
                    Favorites
                  </span>
                </div>
              </div>
            </section>

            {/* Keepsake Album Export Button */}
            <section className="pt-2">
              <button
                type="button"
                onClick={() => setIsKeepsakeBookOpen(true)}
                className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-primary via-[#4a1622] to-primary text-secondary-fixed text-xs font-montserrat uppercase tracking-wider font-semibold shadow hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Icon name="menu_book" size={16} />
                <span>Open Printable Keepsake Book</span>
              </button>
            </section>
          </>
        )}

        {activeTabYear === 'year2' && (
          <section className="bg-surface-container-lowest rounded-2xl border border-secondary/30 p-8 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-secondary-container/20 border border-secondary/30 mx-auto flex items-center justify-center text-secondary">
              <Icon name="auto_awesome" size={24} />
            </div>
            <div className="space-y-1.5">
              <span className="font-cinzel text-[10px] uppercase tracking-widest text-secondary font-bold">
                Chapter Next
              </span>
              <h3 className="font-serif text-2xl text-primary font-bold">
                Year Two Is Being Written
              </h3>
              <p className="font-editorial italic text-base text-on-surface-variant max-w-xs mx-auto leading-relaxed">
                “Every sunrise together is an unpenned page waiting for your quiet memories.”
              </p>
            </div>
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
                <span className="font-cinzel text-[10px] uppercase tracking-widest text-secondary font-bold">
                  Sacred Promises
                </span>
                <h3 className="font-serif text-2xl text-primary font-bold">Our Sealed Vows</h3>
              </div>

              <button
                type="button"
                onClick={() => setShowAddVowModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-secondary-fixed text-xs font-montserrat uppercase tracking-wider font-semibold shadow hover:bg-primary-container active:scale-95 transition-all"
              >
                <Icon name="plus" size={14} />
                <span>Seal Vow</span>
              </button>
            </div>

            {vows.length === 0 ? (
              <div className="text-center py-12 space-y-3.5 bg-surface-container-low rounded-2xl border border-secondary/25 p-6 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-secondary-container/20 border border-secondary/30 mx-auto flex items-center justify-center text-secondary">
                  <Icon name="drafts" size={22} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-lg font-bold text-primary">
                    No Vows Sealed Yet
                  </h4>
                  <p className="text-xs text-on-surface-variant max-w-xs mx-auto leading-relaxed">
                    Seal sacred promises to one another that will be permanently preserved in your vault.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddVowModal(true)}
                  className="mt-2 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary text-secondary-fixed text-xs font-montserrat uppercase tracking-wider font-semibold shadow hover:bg-primary-container active:scale-95 transition-all"
                >
                  <Icon name="plus" size={14} />
                  <span>Seal Your First Vow</span>
                </button>
              </div>
            ) : (
              vows.map((vow, i) => (
                <div
                  key={vow.id || i}
                  className="parchment-texture rounded-2xl p-5 border border-secondary/35 shadow-sm space-y-2.5 relative overflow-hidden group"
                >
                  <div className="flex items-center justify-between text-secondary">
                    <span className="font-montserrat text-[10px] uppercase tracking-widest font-semibold flex items-center gap-1.5">
                      <span>✦</span>
                      <span>Vow of {vow.author}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteVow(vow.id || i)}
                      className="w-7 h-7 rounded-full border border-secondary/20 hover:border-error/40 hover:bg-error/10 text-on-surface-variant/60 hover:text-error transition-all active:scale-90 flex items-center justify-center"
                      title="Remove Vow"
                    >
                      <Icon name="delete" size={13} />
                    </button>
                  </div>
                  <p className="font-editorial italic text-base md:text-lg text-primary leading-relaxed">
                    “{vow.vow}”
                  </p>
                  <div className="pt-2 flex items-center justify-between text-xs text-on-surface-variant/70 border-t border-secondary/20 font-sans font-medium">
                    <span>Dated: {vow.date}</span>
                    <span className="font-montserrat text-[9px] tracking-wider uppercase text-secondary font-semibold">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
            <div className="bg-surface rounded-2xl max-w-md w-full border border-secondary/40 shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
                <div className="flex items-center gap-2">
                  <Icon name="drafts" size={18} className="text-secondary" />
                  <h3 className="font-serif text-lg font-bold text-primary">
                    Seal a Sacred Vow
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddVowModal(false)}
                  className="w-7 h-7 rounded-full border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                >
                  <Icon name="close" size={15} />
                </button>
              </div>

              <form onSubmit={handleSaveVow} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="font-montserrat text-[10px] uppercase tracking-wider text-secondary font-semibold block">
                    Author
                  </label>
                  <select
                    value={newVowAuthor}
                    onChange={(e) => setNewVowAuthor(e.target.value)}
                    className="w-full bg-surface-container-low border border-secondary/30 rounded-xl px-3 py-2 text-xs font-serif text-primary focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30"
                  >
                    <option value={coupleProfile.partner1}>{coupleProfile.partner1}</option>
                    <option value={coupleProfile.partner2}>{coupleProfile.partner2}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-montserrat text-[10px] uppercase tracking-wider text-secondary font-semibold block">
                    Your Sacred Promise
                  </label>
                  <textarea
                    rows={4}
                    value={newVowText}
                    onChange={(e) => setNewVowText(e.target.value)}
                    placeholder="I promise to honor your heart, cherish the quiet seconds, and love you with every sunrise..."
                    className="w-full bg-surface-container-low border border-secondary/30 rounded-xl p-3 text-sm font-editorial italic text-primary focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30 resize-none"
                    autoFocus
                  ></textarea>
                </div>

                <div className="pt-2 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowAddVowModal(false)}
                    className="px-4 py-2 rounded-full border border-outline-variant/40 text-xs font-montserrat uppercase font-medium hover:bg-surface-container active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-primary text-secondary-fixed text-xs font-montserrat uppercase tracking-wider font-semibold shadow hover:bg-primary-container active:scale-95 transition-all"
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
