import React from 'react';
import { useApp } from '../context/AppContext';
import TopAppBar from './TopAppBar';
import Icon from './Icon';
import { getCardTheme } from '../utils/cardThemes';
import FormattedText from './FormattedText';

export default function SanctuaryView() {
  const {
    coupleProfile,
    memories,
    setActiveTab,
    setIsAudioPlayerOpen,
    playAnthem,
    setSelectedMemoryModal,
    timeStats,
  } = useApp();

  // Extract up to 3 featured memories (1 big hero + 2 inline underneath)
  const featuredMemories = memories.slice(0, 3);
  const primaryMemory = featuredMemories[0];
  const secondaryMemory1 = featuredMemories[1];
  const secondaryMemory2 = featuredMemories[2];

  const primaryTheme = primaryMemory ? getCardTheme(primaryMemory.cardColor) : null;
  const secondary1Theme = secondaryMemory1 ? getCardTheme(secondaryMemory1.cardColor) : null;
  const secondary2Theme = secondaryMemory2 ? getCardTheme(secondaryMemory2.cardColor) : null;

  // Format anniversary date for display (timezone-safe)
  const formatAnniversaryStart = (dateStr) => {
    const raw = dateStr || '2025-04-27';
    const parts = raw.split('-').map(Number);
    if (parts.length === 3) {
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      return `${parts[2]}th ${months[parts[1] - 1]}, ${parts[0]}`;
    }
    return '27th April, 2025';
  };

  const formattedStart = formatAnniversaryStart(coupleProfile.anniversaryDate);

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

        {/* Real Audio Player Ribbon */}
        <section
          onClick={playAnthem}
          className="bg-surface-container-low rounded-2xl border border-secondary/30 p-3.5 shadow-sm relative overflow-hidden cursor-pointer hover:border-secondary transition-all group"
        >
          <div className="flex items-center justify-between gap-3">
            {/* Play Action Button */}
            <button
              type="button"
              className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#2f020e] to-[#4a1622] text-[#ffd79b] flex items-center justify-center shadow-md border border-[#ffd79b]/40 group-hover:scale-105 active:scale-95 transition-transform shrink-0"
              title="Play Love Anthem"
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

        {/* Featured Memories Showcase: 1 Big Featured + 2 Inline Underneath + Journey Navigation */}
        {primaryMemory ? (
          <section className="space-y-4">
            {/* Section Header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-secondary text-xs">✦</span>
                <h2 className="font-cinzel text-xs uppercase tracking-widest text-primary font-bold">
                  Featured Chronicles
                </h2>
              </div>
              <span className="font-montserrat text-[10px] text-on-surface-variant font-medium">
                {memories.length} {memories.length === 1 ? 'Keepsake' : 'Keepsakes'} Preserved
              </span>
            </div>

            {/* 1. Large Top Featured Card */}
            <article
              onClick={() => setSelectedMemoryModal(primaryMemory)}
              style={{
                backgroundColor: primaryTheme?.bg || undefined,
                borderColor: primaryTheme?.border || undefined,
              }}
              className={`rounded-2xl border p-4 sm:p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden ${
                primaryTheme?.isDark ? 'text-[#fff6e9]' : 'text-primary'
              }`}
            >
              {/* Header of Big Card */}
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full border border-secondary/50 flex items-center justify-center bg-surface-container-low text-secondary font-serif text-[11px] italic font-semibold">
                    {primaryMemory.author ? primaryMemory.author.charAt(0) : 'M'}
                  </div>
                  <div>
                    <span
                      className="font-montserrat text-[9px] uppercase tracking-widest font-bold block"
                      style={{ color: primaryTheme?.accent }}
                    >
                      Primary Keepsake · {primaryMemory.displayDate || primaryMemory.date}
                    </span>
                  </div>
                </div>
                <span className="font-sans text-[11px] text-on-surface-variant font-medium flex items-center gap-1">
                  <Icon name="location_on" size={12} className="text-secondary" />
                  <span className="truncate max-w-[120px] sm:max-w-[160px]">{primaryMemory.location || 'Our Sanctuary'}</span>
                </span>
              </div>

              {/* Main Keepsake Photo (if attached) */}
              {primaryMemory.photos && primaryMemory.photos.length > 0 && (
                <div className="aspect-[16/10] sm:aspect-[2/1] max-h-[300px] w-full overflow-hidden rounded-xl bg-surface-dim relative mb-3 shadow-sm">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={primaryMemory.photos[0]}
                    alt={primaryMemory.title}
                  />
                </div>
              )}

              {/* Title & Letter */}
              <div className="space-y-1.5 px-0.5">
                <h3 className={`font-serif font-bold text-lg sm:text-xl leading-snug ${primaryTheme?.isDark ? 'text-[#fff6e9]' : 'text-primary'}`}>
                  {primaryMemory.title}
                </h3>
                <FormattedText
                  text={primaryMemory.letter}
                  clampLines={3}
                  className="font-editorial italic leading-relaxed text-sm sm:text-base text-on-surface-variant"
                />
              </div>

              {/* Footer info */}
              <div className="pt-3 mt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs">
                {primaryMemory.song ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container/20 text-secondary text-[10px] font-sans font-medium truncate max-w-[200px]">
                    <Icon name="music_note" size={12} className="shrink-0" />
                    <span className="truncate">{primaryMemory.song}</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-montserrat uppercase tracking-wider text-secondary">
                    ✦ Preserved in Vault
                  </span>
                )}
                <span className="font-serif italic text-secondary group-hover:underline inline-flex items-center gap-1 font-medium">
                  <span>Read Full Keepsake</span>
                  <span>→</span>
                </span>
              </div>
            </article>

            {/* 2. Two Inline Cards Underneath (Responsive Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Secondary Card 1 */}
              {secondaryMemory1 ? (
                <article
                  onClick={() => setSelectedMemoryModal(secondaryMemory1)}
                  style={{
                    backgroundColor: secondary1Theme?.bg || undefined,
                    borderColor: secondary1Theme?.border || undefined,
                  }}
                  className={`rounded-2xl border p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between ${
                    secondary1Theme?.isDark ? 'text-[#fff6e9]' : 'text-primary'
                  }`}
                >
                  <div className="space-y-2">
                    {secondaryMemory1.photos && secondaryMemory1.photos.length > 0 ? (
                      <div className="aspect-[16/10] w-full overflow-hidden rounded-lg bg-surface-dim relative shadow-sm">
                        <img
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          src={secondaryMemory1.photos[0]}
                          alt={secondaryMemory1.title}
                        />
                      </div>
                    ) : (
                      <div className="h-16 rounded-lg bg-surface-container-low/60 border border-outline-variant/30 flex items-center justify-center text-secondary">
                        <Icon name="favorite" size={20} filled={true} />
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between text-[9px] font-montserrat uppercase tracking-wider text-secondary font-semibold mb-1">
                        <span>From {secondaryMemory1.author || 'Mine'}</span>
                        <span>{secondaryMemory1.displayDate || secondaryMemory1.date}</span>
                      </div>
                      <h4 className={`font-serif font-bold text-sm sm:text-base leading-tight truncate ${secondary1Theme?.isDark ? 'text-[#fff6e9]' : 'text-primary'}`}>
                        {secondaryMemory1.title}
                      </h4>
                      <div className="mt-1">
                        <FormattedText
                          text={secondaryMemory1.letter}
                          clampLines={2}
                          className="font-editorial italic text-xs leading-snug text-on-surface-variant"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 mt-2 border-t border-outline-variant/20 flex items-center justify-between text-[10px] text-secondary font-serif italic">
                    <span className="truncate max-w-[130px] font-sans text-on-surface-variant/80">
                      {secondaryMemory1.location || 'Sanctuary'}
                    </span>
                    <span className="group-hover:underline">View Details →</span>
                  </div>
                </article>
              ) : (
                <div
                  onClick={() => setActiveTab('capture')}
                  className="rounded-2xl border border-dashed border-secondary/40 p-4 bg-surface-container-low/40 hover:bg-surface-container-low transition-all cursor-pointer text-center flex flex-col items-center justify-center space-y-2 min-h-[160px] active:scale-95 group"
                >
                  <div className="w-9 h-9 rounded-full bg-secondary-container/20 border border-secondary/30 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                    <Icon name="plus" size={16} />
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-cinzel text-[10px] uppercase tracking-wider text-primary font-bold block">
                      Pen Second Keepsake
                    </span>
                    <p className="font-editorial italic text-xs text-on-surface-variant">
                      “Add another chapter to your constellation.”
                    </p>
                  </div>
                </div>
              )}

              {/* Secondary Card 2 */}
              {secondaryMemory2 ? (
                <article
                  onClick={() => setSelectedMemoryModal(secondaryMemory2)}
                  style={{
                    backgroundColor: secondary2Theme?.bg || undefined,
                    borderColor: secondary2Theme?.border || undefined,
                  }}
                  className={`rounded-2xl border p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between ${
                    secondary2Theme?.isDark ? 'text-[#fff6e9]' : 'text-primary'
                  }`}
                >
                  <div className="space-y-2">
                    {secondaryMemory2.photos && secondaryMemory2.photos.length > 0 ? (
                      <div className="aspect-[16/10] w-full overflow-hidden rounded-lg bg-surface-dim relative shadow-sm">
                        <img
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          src={secondaryMemory2.photos[0]}
                          alt={secondaryMemory2.title}
                        />
                      </div>
                    ) : (
                      <div className="h-16 rounded-lg bg-surface-container-low/60 border border-outline-variant/30 flex items-center justify-center text-secondary">
                        <Icon name="auto_awesome" size={20} />
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between text-[9px] font-montserrat uppercase tracking-wider text-secondary font-semibold mb-1">
                        <span>From {secondaryMemory2.author || 'Sucre'}</span>
                        <span>{secondaryMemory2.displayDate || secondaryMemory2.date}</span>
                      </div>
                      <h4 className={`font-serif font-bold text-sm sm:text-base leading-tight truncate ${secondary2Theme?.isDark ? 'text-[#fff6e9]' : 'text-primary'}`}>
                        {secondaryMemory2.title}
                      </h4>
                      <div className="mt-1">
                        <FormattedText
                          text={secondaryMemory2.letter}
                          clampLines={2}
                          className="font-editorial italic text-xs leading-snug text-on-surface-variant"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 mt-2 border-t border-outline-variant/20 flex items-center justify-between text-[10px] text-secondary font-serif italic">
                    <span className="truncate max-w-[130px] font-sans text-on-surface-variant/80">
                      {secondaryMemory2.location || 'Sanctuary'}
                    </span>
                    <span className="group-hover:underline">View Details →</span>
                  </div>
                </article>
              ) : (
                <div
                  onClick={() => setActiveTab('capture')}
                  className="rounded-2xl border border-dashed border-secondary/40 p-4 bg-surface-container-low/40 hover:bg-surface-container-low transition-all cursor-pointer text-center flex flex-col items-center justify-center space-y-2 min-h-[160px] active:scale-95 group"
                >
                  <div className="w-9 h-9 rounded-full bg-secondary-container/20 border border-secondary/30 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                    <Icon name="edit_note" size={16} />
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-cinzel text-[10px] uppercase tracking-wider text-primary font-bold block">
                      Add Third Keepsake
                    </span>
                    <p className="font-editorial italic text-xs text-on-surface-variant">
                      “Preserve quiet laughter and memories.”
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Navigation to Journey ("View More Memories") */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setActiveTab('journey')}
                className="w-full py-3.5 px-4 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-secondary/40 text-primary font-montserrat text-xs uppercase tracking-widest font-bold flex items-center justify-between group shadow-sm hover:border-secondary active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-secondary-container/30 border border-secondary/30 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform shrink-0">
                    <Icon name="auto_stories" size={16} />
                  </div>
                  <div className="text-left min-w-0">
                    <span className="block text-primary font-bold text-xs truncate">
                      Explore All Memories in Journey
                    </span>
                    <span className="block text-[10px] text-on-surface-variant font-normal normal-case font-editorial italic truncate">
                      Browse all {memories.length} preserved chapters &amp; letters
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-secondary font-serif italic text-sm group-hover:translate-x-1 transition-transform shrink-0 ml-2">
                  <span>View All</span>
                  <span>→</span>
                </div>
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
              {(coupleProfile?.partner1 || 'Mine').charAt(0)}&amp;{(coupleProfile?.partner2 || 'Sucre').charAt(0)}
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
