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

      <main className="px-5 pt-6 pb-8 space-y-6 flex-1">
        {/* Hero Header Section */}
        <section className="text-center space-y-2.5">
          <div className="inline-flex items-center justify-center gap-2 text-secondary px-3 py-0.5 rounded-full bg-secondary-container/30 border border-secondary/20">
            <span className="font-montserrat text-[10px] uppercase tracking-widest text-secondary font-semibold">
              Private Keepsake
            </span>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl text-primary tracking-tight font-normal">
            {coupleProfile.names}
          </h2>
          <p className="font-sans text-xs md:text-sm text-on-surface-variant font-medium">
            Together Since {formattedStart}
          </p>

          {/* Editorial Delimiter */}
          <div className="flex items-center justify-center gap-2 pt-1 text-secondary opacity-75">
            <span className="h-[1px] w-8 bg-secondary/30"></span>
            <span className="font-montserrat text-[10px] text-secondary">✦ ✦ ✦</span>
            <span className="h-[1px] w-8 bg-secondary/30"></span>
          </div>
        </section>

        {/* Real Audio Player Ribbon (Audiomack "Baby Riddim") */}
        <section
          onClick={() => setIsAudioPlayerOpen(true)}
          className="bg-surface-container-low rounded-xl border border-secondary/35 p-3.5 shadow-sm relative overflow-hidden cursor-pointer hover:border-secondary transition-colors group"
        >
          <div className="flex items-center justify-between gap-3">
            {/* Play Action Button */}
            <button
              type="button"
              className="w-10 h-10 rounded-full bg-primary text-secondary-fixed flex items-center justify-center shadow-md border border-secondary/40 group-hover:scale-105 active:scale-95 transition-transform shrink-0"
              title="Play Real Track on Audiomack"
            >
              <Icon name="play_arrow" size={20} filled={true} className="text-secondary-fixed ml-0.5" />
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

              {/* Soundwave Simulation Indicator */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 h-3.5 bg-surface-container/60 rounded-full px-2 py-0.5 border border-outline-variant/30">
                  <span className="w-0.5 h-2 bg-secondary rounded-full inline-block"></span>
                  <span className="w-0.5 h-3 bg-secondary rounded-full inline-block"></span>
                  <span className="w-0.5 h-1.5 bg-primary rounded-full inline-block"></span>
                  <span className="w-0.5 h-2.5 bg-secondary rounded-full inline-block"></span>
                  <span className="w-0.5 h-2 bg-secondary rounded-full inline-block"></span>
                </div>
                <span className="text-[10px] text-secondary font-medium hover:underline">
                  Play Track ✦
                </span>
              </div>
            </div>

            <Icon
              name="music_note"
              size={18}
              className="text-secondary opacity-80 shrink-0"
            />
          </div>
        </section>

        {/* Live Milestone & Countdown Cards */}
        <section className="grid grid-cols-1 gap-3.5">
          {/* Milestone Card: Days Together */}
          <div className="bg-primary text-surface p-5 rounded-xl border border-secondary/40 relative shadow-sm overflow-hidden">
            <div className="absolute -right-4 -bottom-4 text-surface opacity-5 pointer-events-none">
              <span className="font-serif text-[110px] leading-none italic font-bold">
                {timeStats.daysTogether}
              </span>
            </div>
            <div className="relative z-10 space-y-1.5">
              <div className="flex items-center gap-1.5 text-secondary-fixed">
                <span className="font-montserrat text-[10px] uppercase tracking-widest">
                  Live Milestone
                </span>
                <span className="text-secondary-fixed text-[10px]">✦</span>
              </div>
              <h3 className="font-serif text-xl md:text-2xl text-surface font-semibold tracking-tight">
                {timeStats.daysTogether} Days of Love & Grace
              </h3>
              <p className="font-sans text-xs md:text-sm text-primary-fixed-dim/90 pt-0.5 leading-relaxed">
                Every quiet hour, breathless laughter, and dawn whisper chronicled in your private constellation.
              </p>
            </div>
          </div>

          {/* Countdown Card: Anniversary Ticker */}
          <div className="bg-surface-container-lowest p-4 rounded-xl border border-secondary/35 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2.5">
              <div className="flex items-center gap-2">
                <Icon name="hourglass_top" size={17} className="text-secondary" />
                <span className="font-montserrat text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider">
                  Next Anniversary
                </span>
              </div>
              <span className="font-montserrat text-[10px] text-secondary font-bold uppercase">
                {timeStats.nextAnniversaryFormatted}
              </span>
            </div>

            {/* Countdown Grid */}
            <div className="grid grid-cols-4 gap-2 text-center pt-1">
              <div className="bg-surface-container-low/70 py-2 rounded border border-outline-variant/30">
                <span className="font-serif text-lg md:text-xl text-primary block font-semibold leading-tight">
                  {timeStats.days}
                </span>
                <span className="font-montserrat text-[9px] uppercase tracking-wider text-on-surface-variant">
                  Days
                </span>
              </div>
              <div className="bg-surface-container-low/70 py-2 rounded border border-outline-variant/30">
                <span className="font-serif text-lg md:text-xl text-primary block font-semibold leading-tight">
                  {timeStats.hours}
                </span>
                <span className="font-montserrat text-[9px] uppercase tracking-wider text-on-surface-variant">
                  Hours
                </span>
              </div>
              <div className="bg-surface-container-low/70 py-2 rounded border border-outline-variant/30">
                <span className="font-serif text-lg md:text-xl text-primary block font-semibold leading-tight">
                  {timeStats.minutes}
                </span>
                <span className="font-montserrat text-[9px] uppercase tracking-wider text-on-surface-variant">
                  Mins
                </span>
              </div>
              <div className="bg-surface-container-low/70 py-2 rounded border border-outline-variant/30">
                <span className="font-serif text-lg md:text-xl text-secondary block font-semibold leading-tight animate-pulse">
                  {timeStats.seconds}
                </span>
                <span className="font-montserrat text-[9px] uppercase tracking-wider text-on-surface-variant">
                  Secs
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Action Pills Strip */}
        <section className="space-y-2">
          <span className="font-montserrat text-[10px] text-on-surface-variant uppercase tracking-widest block px-1">
            Chronicle Moments
          </span>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setActiveTab('capture')}
              className="flex items-center gap-1.5 whitespace-nowrap bg-primary-container text-surface px-3.5 py-2 rounded-full border border-secondary/40 active:scale-95 transition-transform shrink-0"
            >
              <Icon name="add_circle" size={16} className="text-secondary-fixed" />
              <span className="font-montserrat text-[10px] tracking-wider uppercase text-surface">
                Pen Today's Moment
              </span>
            </button>
            <button
              onClick={() => setActiveTab('capture')}
              className="flex items-center gap-1.5 whitespace-nowrap bg-surface-container-lowest text-primary px-3.5 py-2 rounded-full border border-secondary/30 active:scale-95 transition-transform shrink-0 hover:border-secondary"
            >
              <Icon name="edit_note" size={16} className="text-secondary" />
              <span className="font-montserrat text-[10px] tracking-wider uppercase text-primary">
                Write Love Letter
              </span>
            </button>
            <button
              onClick={() => setActiveTab('vault')}
              className="flex items-center gap-1.5 whitespace-nowrap bg-surface-container-lowest text-primary px-3.5 py-2 rounded-full border border-secondary/30 active:scale-95 transition-transform shrink-0 hover:border-secondary"
            >
              <Icon name="history_edu" size={16} className="text-secondary" />
              <span className="font-montserrat text-[10px] tracking-wider uppercase text-primary">
                View Retrospective
              </span>
            </button>
          </div>
        </section>

        {/* Memory of the Day / Clean Empty State */}
        {memoryOfDay ? (
          <section className="bg-surface-container-lowest rounded-xl border border-secondary/30 p-4 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full border border-secondary/50 flex items-center justify-center bg-surface-container-low text-secondary font-serif text-[11px] italic font-semibold">
                  {memoryOfDay.author ? memoryOfDay.author.charAt(0) : 'M'}
                </div>
                <span className="font-montserrat text-[10px] uppercase tracking-widest text-primary font-semibold">
                  Featured Memory
                </span>
              </div>
              <span className="font-sans text-[11px] text-on-surface-variant">
                {memoryOfDay.location}
              </span>
            </div>

            <div
              onClick={() => setSelectedMemoryModal(memoryOfDay)}
              className="bg-surface-container-low p-2.5 pb-4 rounded-lg border border-outline-variant/30 shadow-inner cursor-pointer hover:shadow-md transition-shadow group"
            >
              {memoryOfDay.photos && memoryOfDay.photos.length > 0 && (
                <div className="aspect-[4/3] w-full overflow-hidden rounded bg-surface-dim relative">
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
                <p className="font-serif italic text-primary leading-snug text-sm md:text-base line-clamp-2">
                  “{memoryOfDay.letter}”
                </p>
              </div>
            </div>

            <div className="pt-1 flex justify-center">
              <button
                onClick={() => setSelectedMemoryModal(memoryOfDay)}
                className="font-serif text-secondary hover:text-primary transition-colors text-sm italic font-medium inline-flex items-center gap-1.5 active:scale-95"
              >
                <span>✦</span>
                <span className="underline decoration-secondary/40 underline-offset-4">
                  View Full Note & Details
                </span>
                <span>✦</span>
              </button>
            </div>
          </section>
        ) : (
          /* Clean Inviting Empty State (Zero Demo Data) */
          <section className="bg-surface-container-lowest rounded-xl border border-secondary/30 p-6 shadow-sm text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-secondary-container/20 border border-secondary/40 mx-auto flex items-center justify-center text-secondary">
              <Icon name="favorite" size={24} filled={true} className="text-secondary" />
            </div>
            <div className="space-y-1.5">
              <span className="font-montserrat text-[10px] uppercase tracking-widest text-secondary font-semibold">
                Your Story Begins Here
              </span>
              <h3 className="font-serif text-xl text-primary font-medium">
                Pen Your First Memory
              </h3>
              <p className="font-sans text-xs text-on-surface-variant max-w-xs mx-auto leading-relaxed">
                This journal is a sacred space for your love story. Add photos, intimate love letters, voice memos, and unforgettable milestones.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('capture')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-secondary-fixed text-xs font-montserrat uppercase tracking-wider font-semibold shadow hover:bg-primary-container active:scale-95 transition-all"
            >
              <Icon name="add_circle" size={15} />
              <span>Capture First Moment</span>
            </button>
          </section>
        )}

        {/* Monogram Seal */}
        <footer className="pt-4 pb-2 text-center space-y-2">
          <div className="w-12 h-12 rounded-full border border-secondary/50 mx-auto flex items-center justify-center bg-surface-container-lowest shadow-sm">
            <span className="font-serif italic font-semibold text-secondary text-sm">
              {coupleProfile.partner1.charAt(0)}&{coupleProfile.partner2.charAt(0)}
            </span>
          </div>
          <p className="font-montserrat text-[9px] tracking-widest uppercase text-on-surface-variant/70">
            Archived Forever in the Vault
          </p>
        </footer>
      </main>
    </div>
  );
}
