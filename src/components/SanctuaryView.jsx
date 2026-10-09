import React from 'react';
import { useApp } from '../context/AppContext';
import TopAppBar from './TopAppBar';
import Icon from './Icon';

export default function SanctuaryView() {
  const {
    coupleProfile,
    memories,
    setActiveTab,
    setIsAudioPlayerOpen,
    setSelectedMemoryModal,
    timeStats,
  } = useApp();

  // Find memory of the day if exists
  const memoryOfDay = memories.find((m) => m.isMemoryOfDay) || memories[0];

  // Format anniversary date for display
  const startDate = new Date(coupleProfile.anniversaryDate);
  const formattedStart = startDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="flex-1 flex flex-col bg-surface min-h-full">
      <TopAppBar />

      <main className="px-3.5 sm:px-5 pt-4 sm:pt-6 pb-8 space-y-5 sm:space-y-6 flex-1">
        {/* Hero Header Section */}
        <section className="text-center space-y-2">
          <div className="inline-flex items-center justify-center gap-2 text-secondary px-3.5 py-0.5 rounded-full bg-secondary-container/25 border border-secondary/25 shadow-sm">
            <span className="font-cinzel text-[9px] sm:text-[10px] tracking-widest text-secondary font-bold">
              ✦ PRIVATE KEEPSAKE ✦
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-primary tracking-tight font-bold break-words px-2">
            {coupleProfile.names}
          </h1>
          <p className="font-editorial italic text-sm sm:text-base md:text-lg text-on-surface-variant font-medium">
            Together Since {formattedStart}
          </p>

          {/* Editorial Delimiter */}
          <div className="flex items-center justify-center gap-2 pt-1 text-secondary opacity-75">
            <span className="h-[1px] w-10 bg-secondary/30"></span>
            <span className="font-montserrat text-[10px] text-secondary">✦ ✦ ✦</span>
            <span className="h-[1px] w-10 bg-secondary/30"></span>
          </div>
        </section>

        {/* Real Audio Player Ribbon (Audiomack "Baby Riddim") */}
        <section
          onClick={() => setIsAudioPlayerOpen(true)}
          className="bg-surface-container-low rounded-2xl border border-secondary/30 p-3.5 shadow-sm relative overflow-hidden cursor-pointer hover:border-secondary transition-all group"
        >
          <div className="flex items-center justify-between gap-3">
            {/* Play Action Button */}
            <button
              type="button"
              className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#2f020e] to-[#4a1622] text-[#ffd79b] flex items-center justify-center shadow-md border border-[#ffd79b]/40 group-hover:scale-105 active:scale-95 transition-transform shrink-0"
              title="Play Real Track on Audiomack"
            >
              <Icon name="play_arrow" size={20} filled={true} className="text-[#ffd79b] ml-0.5" />
            </button>

            {/* Track Meta & Info */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-montserrat text-[10px] text-secondary uppercase font-semibold tracking-wider truncate">
                  ✦ {coupleProfile.anthemArtist} — {coupleProfile.anthemTitle}
                </span>
                <span className="font-sans text-[11px] text-on-surface-variant/80">
                  {coupleProfile.anthemDuration}
                </span>
              </div>

              {/* Soundwave Animation Indicator */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 h-3.5 bg-surface-container/70 rounded-full px-2 py-0.5 border border-outline-variant/30">
                  <span className="w-0.5 h-2 bg-secondary rounded-full inline-block animate-bar-wave-1"></span>
                  <span className="w-0.5 h-3 bg-secondary rounded-full inline-block animate-bar-wave-2"></span>
                  <span className="w-0.5 h-1.5 bg-primary rounded-full inline-block animate-bar-wave-3"></span>
                  <span className="w-0.5 h-2.5 bg-secondary rounded-full inline-block animate-bar-wave-4"></span>
                  <span className="w-0.5 h-2 bg-secondary rounded-full inline-block animate-bar-wave-5"></span>
                </div>
                <span className="text-[10px] text-secondary font-medium group-hover:underline">
                  Play Track ✦
                </span>
              </div>
            </div>

            <Icon
              name="music_note"
              size={18}
              className="text-secondary opacity-80 shrink-0 group-hover:rotate-12 transition-transform"
            />
          </div>
        </section>

        {/* Live Milestone & Countdown Cards */}
        <section className="grid grid-cols-1 gap-3.5">
          {/* Milestone Card: Days Together */}
          <div className="bg-gradient-to-br from-[#2f020e] via-[#420a17] to-[#220109] text-surface p-5 rounded-2xl border border-secondary/35 relative shadow-sm overflow-hidden">
            <div className="absolute -right-4 -bottom-4 text-surface opacity-5 pointer-events-none">
              <span className="font-cinzel text-[115px] leading-none font-bold">
                {timeStats.daysTogether}
              </span>
            </div>
            <div className="relative z-10 space-y-1.5">
              <div className="flex items-center gap-1.5 text-secondary-fixed">
                <span className="font-cinzel text-[10px] uppercase tracking-widest font-semibold">
                  Live Milestone
                </span>
                <span className="text-secondary-fixed text-[10px]">✦</span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl md:text-3xl text-surface font-bold tracking-tight">
                {timeStats.daysTogether} Days of Love &amp; Grace
              </h2>
              <p className="font-editorial italic text-xs sm:text-sm md:text-base text-primary-fixed-dim/95 pt-0.5 leading-relaxed">
                “Every quiet hour, breathless laughter, and dawn whisper chronicled in your private constellation.”
              </p>
            </div>
          </div>

          {/* Countdown Card: Anniversary Ticker */}
          <div className="bg-surface-container-lowest p-3.5 sm:p-4 rounded-2xl border border-secondary/35 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2.5 gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <Icon name="hourglass_top" size={16} className="text-secondary shrink-0" />
                <span className="font-montserrat text-[9px] sm:text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider">
                  Next Anniversary
                </span>
              </div>
              <span className="font-cinzel text-[10px] sm:text-[11px] text-secondary font-bold uppercase tracking-wider truncate">
                {timeStats.nextAnniversaryFormatted}
              </span>
            </div>

            {/* Countdown Grid */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center pt-1">
              <div className="bg-surface-container-low/80 py-2 sm:py-2.5 rounded-xl border border-outline-variant/30">
                <span className="font-serif text-base sm:text-lg md:text-xl text-primary block font-bold leading-tight">
                  {timeStats.days}
                </span>
                <span className="font-montserrat text-[8px] sm:text-[9px] uppercase tracking-wider text-on-surface-variant font-semibold">
                  Days
                </span>
              </div>
              <div className="bg-surface-container-low/80 py-2 sm:py-2.5 rounded-xl border border-outline-variant/30">
                <span className="font-serif text-base sm:text-lg md:text-xl text-primary block font-bold leading-tight">
                  {timeStats.hours}
                </span>
                <span className="font-montserrat text-[8px] sm:text-[9px] uppercase tracking-wider text-on-surface-variant font-semibold">
                  Hours
                </span>
              </div>
              <div className="bg-surface-container-low/80 py-2 sm:py-2.5 rounded-xl border border-outline-variant/30">
                <span className="font-serif text-base sm:text-lg md:text-xl text-primary block font-bold leading-tight">
                  {timeStats.minutes}
                </span>
                <span className="font-montserrat text-[8px] sm:text-[9px] uppercase tracking-wider text-on-surface-variant font-semibold">
                  Mins
                </span>
              </div>
              <div className="bg-surface-container-low/80 py-2 sm:py-2.5 rounded-xl border border-outline-variant/30">
                <span className="font-serif text-base sm:text-lg md:text-xl text-secondary block font-bold leading-tight animate-pulse">
                  {timeStats.seconds}
                </span>
                <span className="font-montserrat text-[8px] sm:text-[9px] uppercase tracking-wider text-on-surface-variant font-semibold">
                  Secs
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Action Pills Strip */}
        <section className="space-y-2">
          <span className="font-montserrat text-[10px] text-on-surface-variant uppercase tracking-widest block px-1 font-semibold">
            Chronicle Moments
          </span>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setActiveTab('capture')}
              className="flex items-center gap-1.5 whitespace-nowrap bg-primary text-secondary-fixed px-4 py-2 rounded-full border border-secondary/40 active:scale-95 transition-transform shrink-0 shadow-sm hover:bg-primary-container"
              type="button"
            >
              <Icon name="plus" size={15} className="text-secondary-fixed" />
              <span className="font-montserrat text-[10px] tracking-wider uppercase font-semibold">
                Pen Today's Moment
              </span>
            </button>
            <button
              onClick={() => setActiveTab('capture')}
              className="flex items-center gap-1.5 whitespace-nowrap bg-surface-container-lowest text-primary px-3.5 py-2 rounded-full border border-secondary/30 active:scale-95 transition-transform shrink-0 hover:border-secondary"
              type="button"
            >
              <Icon name="edit_note" size={16} className="text-secondary" />
              <span className="font-montserrat text-[10px] tracking-wider uppercase text-primary font-medium">
                Write Love Letter
              </span>
            </button>
            <button
              onClick={() => setActiveTab('vault')}
              className="flex items-center gap-1.5 whitespace-nowrap bg-surface-container-lowest text-primary px-3.5 py-2 rounded-full border border-secondary/30 active:scale-95 transition-transform shrink-0 hover:border-secondary"
              type="button"
            >
              <Icon name="history_edu" size={16} className="text-secondary" />
              <span className="font-montserrat text-[10px] tracking-wider uppercase text-primary font-medium">
                View Retrospective
              </span>
            </button>
          </div>
        </section>

        {/* Memory of the Day / Clean Empty State */}
        {memoryOfDay ? (
          <section className="bg-surface-container-lowest rounded-2xl border border-secondary/30 p-4 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full border border-secondary/50 flex items-center justify-center bg-surface-container-low text-secondary font-serif text-[11px] italic font-semibold">
                  {memoryOfDay.author ? memoryOfDay.author.charAt(0) : 'M'}
                </div>
                <span className="font-montserrat text-[10px] uppercase tracking-widest text-primary font-semibold">
                  Featured Memory
                </span>
              </div>
              <span className="font-sans text-[11px] text-on-surface-variant font-medium">
                {memoryOfDay.location}
              </span>
            </div>

            <div
              onClick={() => setSelectedMemoryModal(memoryOfDay)}
              className="bg-surface-container-low p-2.5 pb-4 rounded-xl border border-outline-variant/30 shadow-inner cursor-pointer hover:shadow-md transition-shadow group"
            >
              {memoryOfDay.photos && memoryOfDay.photos.length > 0 && (
                <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-surface-dim relative">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={memoryOfDay.photos[0]}
                    alt={memoryOfDay.title}
                  />
                </div>
              )}

              <div className="mt-3.5 px-1.5 space-y-1.5">
                <div className="flex items-center justify-between text-secondary">
                  <span className="font-montserrat text-[9px] uppercase tracking-widest text-secondary font-semibold">
                    Letter from {memoryOfDay.author || 'Beloved'}
                  </span>
                  <span className="text-[10px]">✦</span>
                </div>
                <p className="font-editorial italic text-primary leading-snug text-base md:text-lg line-clamp-2">
                  “{memoryOfDay.letter}”
                </p>
              </div>
            </div>

            <div className="pt-1 flex justify-center">
              <button
                type="button"
                onClick={() => setSelectedMemoryModal(memoryOfDay)}
                className="font-serif text-secondary hover:text-primary transition-colors text-sm italic font-medium inline-flex items-center gap-1.5 active:scale-95"
              >
                <span>✦</span>
                <span className="underline decoration-secondary/40 underline-offset-4">
                  View Full Note &amp; Details
                </span>
                <span>✦</span>
              </button>
            </div>
          </section>
        ) : (
          /* Clean Inviting Empty State (Zero Demo Data) */
          <section className="bg-surface-container-lowest rounded-2xl border border-secondary/30 p-6 shadow-sm text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-secondary-container/20 border border-secondary/40 mx-auto flex items-center justify-center text-secondary">
              <Icon name="favorite" size={24} filled={true} className="text-secondary" />
            </div>
            <div className="space-y-1.5">
              <span className="font-montserrat text-[10px] uppercase tracking-widest text-secondary font-semibold">
                Your Story Begins Here
              </span>
              <h3 className="font-serif text-xl text-primary font-bold">
                Pen Your First Memory
              </h3>
              <p className="font-sans text-xs text-on-surface-variant max-w-xs mx-auto leading-relaxed">
                This journal is a sacred space for your love story. Add photos, intimate love letters, voice memos, and unforgettable milestones.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('capture')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-secondary-fixed text-xs font-montserrat uppercase tracking-wider font-semibold shadow hover:bg-primary-container active:scale-95 transition-all"
            >
              <Icon name="plus" size={15} />
              <span>Capture First Moment</span>
            </button>
          </section>
        )}

        {/* Monogram Seal */}
        <footer className="pt-4 pb-2 text-center space-y-2">
          <div className="w-12 h-12 rounded-full border border-secondary/50 mx-auto flex items-center justify-center bg-surface-container-lowest shadow-sm">
            <span className="font-cinzel font-bold text-secondary text-sm">
              {coupleProfile.partner1.charAt(0)}&amp;{coupleProfile.partner2.charAt(0)}
            </span>
          </div>
          <p className="font-montserrat text-[9px] tracking-widest uppercase text-on-surface-variant/70 font-medium">
            Archived Forever in the Vault
          </p>
        </footer>
      </main>
    </div>
  );
}
