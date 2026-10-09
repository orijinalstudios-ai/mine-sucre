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
      <TopAppBar title="Chapters of Us" />

      {/* Category Filter Drawer & Search */}
      <section className="px-4 py-2.5 bg-surface-container-low border-b border-outline-variant/20 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-1">
            {filters.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                    isActive
                      ? 'bg-primary text-secondary-fixed shadow-sm'
                      : 'bg-surface text-on-surface-variant hover:text-primary hover:border-secondary/30 border border-transparent'
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
            className={`p-1.5 rounded-full border transition-colors ${
              showSearch
                ? 'bg-primary text-secondary-fixed border-primary'
                : 'text-on-surface-variant hover:text-primary border-outline-variant/30 bg-surface'
            }`}
            title="Search Memories"
          >
            <Icon name="search" size={17} />
          </button>
        </div>

        {/* Collapsible Search Input */}
        {showSearch && (
          <div className="pt-1 pb-1">
            <div className="relative flex items-center">
              <span className="absolute left-2.5 text-on-surface-variant flex items-center">
                <Icon name="search" size={15} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by location, chapter, or words..."
                className="w-full bg-surface text-xs rounded-full pl-8 pr-8 py-1.5 border border-secondary/30 focus:outline-none focus:border-secondary text-primary placeholder:text-on-surface-variant/50"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-on-surface-variant hover:text-primary flex items-center"
                >
                  <Icon name="close" size={15} />
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Timeline Stream */}
      <main className="px-4 py-6 space-y-6 flex-1">
        {filteredMemories.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-14 h-14 rounded-full bg-secondary-container/20 border border-secondary/30 mx-auto flex items-center justify-center text-secondary">
              <Icon name="history_edu" size={26} />
            </div>
            <h3 className="font-serif text-lg font-bold text-primary">No Moments Found</h3>
            <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
              {searchQuery
                ? `No memories match "${searchQuery}". Try a different keyword.`
                : `No memories in the "${activeFilter}" archive yet.`}
            </p>
            <button
              onClick={() => setActiveTab('capture')}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-secondary-fixed text-xs font-semibold shadow hover:bg-primary-container"
            >
              <Icon name="add_circle" size={15} />
              <span>Pen a New Memory</span>
            </button>
          </div>
        ) : (
          filteredMemories.map((mem, index) => (
            <article
              key={mem.id}
              className="bg-surface-container-lowest rounded-xl border border-secondary/30 p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              {/* Card Header: Chapter & Actions */}
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
                <div className="space-y-0.5">
                  <span className="font-montserrat text-[9px] uppercase tracking-widest text-secondary font-semibold block">
                    {mem.chapter || `Chapter ${index + 1}`}
                  </span>
                  <h3 className="font-serif font-bold text-base text-primary leading-tight">
                    {mem.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {/* Heart / Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(mem.id)}
                    className="p-1 text-secondary transition-transform active:scale-125"
                    title={mem.isFavorite ? 'Unfavorite' : 'Add to Favorites'}
                  >
                    <Icon
                      name="favorite"
                      size={20}
                      filled={mem.isFavorite}
                      className={mem.isFavorite ? 'text-error' : 'opacity-60 hover:opacity-100'}
                    />
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete "${mem.title || 'this memory'}" from your journal?`)) {
                        deleteMemory(mem.id);
                      }
                    }}
                    className="p-1 text-on-surface-variant/60 hover:text-error transition-colors rounded hover:bg-error/10"
                    title="Delete Memory"
                  >
                    <Icon name="delete" size={16} />
                  </button>
                </div>
              </div>

              {/* Meta details: Date & Location */}
              <div className="flex items-center justify-between py-2.5 text-xs text-on-surface-variant font-medium">
                <span className="flex items-center gap-1.5">
                  <Icon name="calendar_today" size={14} className="text-secondary" />
                  <span>{mem.displayDate || mem.date}</span>
                </span>
                <span className="flex items-center gap-1.5 truncate max-w-[170px]">
                  <Icon name="location_on" size={14} className="text-secondary" />
                  <span className="truncate">{mem.location}</span>
                </span>
              </div>

              {/* Main Keepsake Photo (Polaroid Frame) */}
              {mem.photos && mem.photos.length > 0 && (
                <div
                  onClick={() => setSelectedMemoryModal(mem)}
                  className="bg-surface-container-low p-2 rounded-lg border border-outline-variant/30 cursor-pointer group my-2"
                >
                  <div className="aspect-[16/10] w-full overflow-hidden rounded bg-surface-dim relative">
                    <img
                      src={mem.photos[0]}
                      alt={mem.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {mem.photos.length > 1 && (
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-sans">
                        +{mem.photos.length - 1} photos
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Dual Perspective or Love Letter */}
              <div className="pt-2 space-y-2">
                {mem.counterNote && (
                  <div className="bg-surface-container-low/60 rounded p-2.5 border-l-2 border-secondary/60">
                    <span className="font-montserrat text-[9px] uppercase tracking-wider text-secondary font-semibold block mb-0.5">
                      Perspective from {mem.author === 'Sucre' ? 'Mine' : 'Sucre'}
                    </span>
                    <p className="font-serif italic text-xs text-on-surface-variant leading-relaxed">
                      “{mem.counterNote}”
                    </p>
                  </div>
                )}

                <div className="space-y-1">
                  <p className="font-serif text-sm text-primary leading-relaxed line-clamp-3">
                    “{mem.letter}”
                  </p>
                  <button
                    onClick={() => setSelectedMemoryModal(mem)}
                    className="text-[11px] font-serif italic text-secondary hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    <span>Read Full Side Note</span>
                    <span>→</span>
                  </button>
                </div>
              </div>

              {/* Footer Chips: Soundtrack & Mood Tag */}
              <div className="pt-3.5 mt-3 border-t border-outline-variant/20 flex items-center justify-between flex-wrap gap-2">
                {mem.song && (
                  <button
                    onClick={togglePlayAudio}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/5 hover:bg-primary/10 border border-secondary/30 text-[10px] text-primary transition-colors max-w-[200px] truncate"
                  >
                    <Icon
                      name={audioState.isPlaying ? 'volume_up' : 'music_note'}
                      size={13}
                      className="text-secondary"
                    />
                    <span className="truncate">{mem.song}</span>
                  </button>
                )}

                <div className="flex items-center gap-1.5 ml-auto">
                  {mem.audioMemoDuration && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container/20 text-secondary text-[9px] font-montserrat uppercase">
                      <Icon name="mic" size={12} />
                      <span>{mem.audioMemoDuration}</span>
                    </span>
                  )}
                  {mem.mood && (
                    <span className="px-2.5 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant border border-outline-variant/30 text-[9px] font-montserrat uppercase tracking-wider">
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
