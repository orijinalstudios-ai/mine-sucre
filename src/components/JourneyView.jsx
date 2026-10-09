import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import TopAppBar from './TopAppBar';
import Icon from './Icon';

export default function JourneyView() {
  const {
    memories,
    toggleFavorite,
    setSelectedMemoryModal,
    setActiveTab,
    togglePlayAudio,
    audioState,
    deleteMemory,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const filters = ['All', 'Favorites', 'Milestones', 'Travel', 'Letters'];

  const filteredMemories = memories.filter((mem) => {
    // Filter by category
    if (activeFilter === 'Favorites' && !mem.isFavorite) return false;
    if (activeFilter !== 'All' && activeFilter !== 'Favorites' && mem.tag !== activeFilter) {
      return false;
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = mem.title?.toLowerCase().includes(q);
      const matchLocation = mem.location?.toLowerCase().includes(q);
      const matchLetter = mem.letter?.toLowerCase().includes(q);
      const matchChapter = mem.chapter?.toLowerCase().includes(q);
      if (!matchTitle && !matchLocation && !matchLetter && !matchChapter) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-surface min-h-full">
      {/* Sticky Combined Header: Navigation + Filter Drawer */}
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm transition-colors">
        <TopAppBar title="Chapters of Us" borderless />

        {/* Category Filter Drawer & Search */}
        <section className="px-3 sm:px-4 py-2 bg-surface-container-low/70 border-t border-outline-variant/20">
          <div className="flex items-center justify-between gap-2">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-1 touch-pan-x scroll-smooth">
              {filters.map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    type="button"
                    className={`px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-montserrat uppercase tracking-wider whitespace-nowrap transition-all duration-150 active:scale-95 shrink-0 ${
                      isActive
                        ? 'bg-primary text-secondary-fixed font-bold shadow-sm border border-secondary/40'
                        : 'bg-surface text-on-surface-variant hover:text-primary hover:border-secondary/30 border border-outline-variant/30 font-medium'
                    }`}
                  >
                    {filter === 'Favorites' && '♥ '}
                    {filter}
                  </button>
                );
              })}
            </div>

            {/* Search Toggle Icon */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              type="button"
              className={`w-8 h-8 rounded-full border transition-all active:scale-90 flex items-center justify-center shrink-0 ${
                showSearch
                  ? 'bg-primary text-secondary-fixed border-primary'
                  : 'text-on-surface-variant hover:text-primary border-outline-variant/30 bg-surface hover:border-secondary/40'
              }`}
              title="Search Memories"
            >
              <Icon name="search" size={15} />
            </button>
          </div>

          {/* Collapsible Search Input */}
          {showSearch && (
            <div className="pt-2 pb-0.5 animate-fade-in">
              <div className="relative flex items-center">
                <span className="absolute left-3 text-secondary flex items-center pointer-events-none">
                  <Icon name="search" size={14} />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by location, chapter, or sacred words..."
                  className="w-full bg-surface text-xs rounded-full pl-9 pr-9 py-2 border border-secondary/30 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30 text-primary placeholder:text-on-surface-variant/50 transition-all"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    type="button"
                    className="absolute right-3 text-on-surface-variant hover:text-primary flex items-center p-1"
                  >
                    <Icon name="close" size={14} />
                  </button>
                )}
              </div>
            </div>
          )}
        </section>
      </header>

      {/* Timeline Stream */}
      <main className="px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 flex-1">
        {filteredMemories.length === 0 ? (
          <div className="text-center py-12 sm:py-16 px-4 space-y-3.5">
            <div className="w-14 h-14 rounded-full bg-secondary-container/20 border border-secondary/30 mx-auto flex items-center justify-center text-secondary">
              <Icon name="history_edu" size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-primary">No Moments Found</h3>
              <p className="text-xs text-on-surface-variant max-w-xs mx-auto leading-relaxed">
                {searchQuery
                  ? `No memories match "${searchQuery}". Try a different keyword.`
                  : `No memories in the "${activeFilter}" archive yet.`}
              </p>
            </div>
            <button
              onClick={() => setActiveTab('capture')}
              type="button"
              className="mt-2 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary text-secondary-fixed text-xs font-montserrat uppercase tracking-wider font-semibold shadow hover:bg-primary-container active:scale-95 transition-all"
            >
              <Icon name="plus" size={15} />
              <span>Pen a New Memory</span>
            </button>
          </div>
        ) : (
          filteredMemories.map((mem, index) => (
            <article
              key={mem.id}
              className="bg-surface-container-lowest rounded-2xl border border-secondary/30 p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              {/* Card Header: Chapter & Actions */}
              <div className="flex items-start justify-between gap-2 pb-2.5 sm:pb-3 border-b border-outline-variant/20">
                <div className="space-y-0.5 min-w-0 flex-1">
                  <span className="font-cinzel text-[9px] sm:text-[10px] uppercase tracking-widest text-secondary font-bold block truncate">
                    {mem.chapter || `Chapter ${index + 1}`}
                  </span>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-primary leading-snug break-words">
                    {mem.title}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                  {/* Heart / Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(mem.id)}
                    type="button"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-secondary/20 hover:border-secondary hover:bg-secondary-container/20 flex items-center justify-center transition-all active:scale-125 shrink-0"
                    title={mem.isFavorite ? 'Unfavorite' : 'Add to Favorites'}
                  >
                    <Icon
                      name="favorite"
                      size={16}
                      filled={mem.isFavorite}
                      className={mem.isFavorite ? 'text-error' : 'text-on-surface-variant/60 hover:text-error'}
                    />
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete "${mem.title || 'this memory'}" from your journal?`)) {
                        deleteMemory(mem.id);
                      }
                    }}
                    type="button"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-outline-variant/30 hover:border-error/50 hover:bg-error/10 hover:text-error flex items-center justify-center transition-all active:scale-90 text-on-surface-variant/60 shrink-0"
                    title="Delete Memory"
                  >
                    <Icon name="delete" size={14} />
                  </button>
                </div>
              </div>

              {/* Meta details: Date & Location */}
              <div className="flex items-center justify-between gap-2 py-2 text-xs text-on-surface-variant font-medium">
                <span className="flex items-center gap-1.5 shrink-0">
                  <Icon name="calendar_today" size={13} className="text-secondary shrink-0" />
                  <span className="text-[11px] sm:text-xs">{mem.displayDate || mem.date}</span>
                </span>
                <span className="flex items-center gap-1.5 min-w-0 max-w-[55%] justify-end">
                  <Icon name="location_on" size={13} className="text-secondary shrink-0" />
                  <span className="truncate text-[11px] sm:text-xs">{mem.location}</span>
                </span>
              </div>

              {/* Main Keepsake Photo (Polaroid Frame with Adaptive Aspect Ratio) */}
              {mem.photos && mem.photos.length > 0 && (
                <div
                  onClick={() => setSelectedMemoryModal(mem)}
                  className="bg-surface-container-low p-2 rounded-xl border border-outline-variant/30 cursor-pointer group my-2 transition-all hover:border-secondary/40"
                >
                  {mem.photos.length === 1 && (
                    <div className="aspect-[4/3] sm:aspect-[16/10] max-h-[360px] w-full overflow-hidden rounded-lg bg-surface-dim relative">
                      <img
                        src={mem.photos[0]}
                        alt={mem.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}

                  {mem.photos.length === 2 && (
                    <div className="grid grid-cols-2 gap-1.5 aspect-[16/10] sm:aspect-[2/1] w-full overflow-hidden rounded-lg bg-surface-dim">
                      <div className="h-full overflow-hidden">
                        <img
                          src={mem.photos[0]}
                          alt=""
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="h-full overflow-hidden">
                        <img
                          src={mem.photos[1]}
                          alt=""
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    </div>
                  )}

                  {mem.photos.length >= 3 && (
                    <div className="grid grid-cols-3 gap-1.5 aspect-[16/10] sm:aspect-[2/1] w-full overflow-hidden rounded-lg bg-surface-dim relative">
                      <div className="col-span-2 h-full overflow-hidden">
                        <img
                          src={mem.photos[0]}
                          alt=""
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5 h-full">
                        <div className="h-1/2 overflow-hidden">
                          <img
                            src={mem.photos[1]}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="h-1/2 overflow-hidden relative">
                          <img
                            src={mem.photos[2]}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          {mem.photos.length > 3 && (
                            <span className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center text-white text-[11px] sm:text-xs font-montserrat font-bold">
                              +{mem.photos.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Dual Perspective or Love Letter */}
              <div className="pt-2 space-y-2">
                {mem.counterNote && (
                  <div className="bg-surface-container-low/70 rounded-xl p-2.5 sm:p-3 border-l-2 border-secondary/60">
                    <span className="font-montserrat text-[9px] uppercase tracking-wider text-secondary font-semibold block mb-0.5">
                      Perspective from {mem.author === 'Sucre' ? 'Mine' : 'Sucre'}
                    </span>
                    <p className="font-editorial italic text-xs sm:text-sm text-on-surface-variant leading-relaxed break-words">
                      “{mem.counterNote}”
                    </p>
                  </div>
                )}

                <div className="space-y-1">
                  <p className="font-editorial italic text-sm sm:text-base md:text-lg text-primary leading-relaxed line-clamp-3 break-words">
                    “{mem.letter}”
                  </p>
                  <button
                    onClick={() => setSelectedMemoryModal(mem)}
                    type="button"
                    className="text-xs font-serif italic text-secondary hover:underline inline-flex items-center gap-1 font-semibold active:scale-95 transition-transform"
                  >
                    <span>Read Full Keepsake Note</span>
                    <span>→</span>
                  </button>
                </div>
              </div>

              {/* Footer Chips: Soundtrack & Mood Tag */}
              <div className="pt-2.5 mt-2.5 border-t border-outline-variant/20 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5 flex-wrap min-w-0 max-w-full">
                  {mem.song && (
                    <button
                      onClick={togglePlayAudio}
                      type="button"
                      className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-primary/5 hover:bg-primary/10 border border-secondary/30 text-[10px] text-primary transition-all active:scale-95 max-w-[190px] sm:max-w-[220px] truncate"
                      title={mem.song}
                    >
                      <Icon
                        name={audioState.isPlaying ? 'volume_up' : 'music_note'}
                        size={13}
                        className="text-secondary shrink-0"
                      />
                      <span className="truncate font-sans font-medium">{mem.song}</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                  {mem.audioMemoDuration && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-container/20 text-secondary text-[9px] font-montserrat uppercase font-semibold">
                      <Icon name="mic" size={12} />
                      <span>{mem.audioMemoDuration}</span>
                    </span>
                  )}
                  {mem.mood && (
                    <span className="px-2.5 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant border border-outline-variant/30 text-[9px] font-montserrat uppercase tracking-wider font-semibold">
                      ✦ {mem.mood}
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))
        )}
      </main>
    </div>
  );
}
