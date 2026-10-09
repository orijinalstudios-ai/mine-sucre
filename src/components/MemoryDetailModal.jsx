import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Icon from './Icon';

export default function MemoryDetailModal() {
  const {
    selectedMemoryModal,
    setSelectedMemoryModal,
    toggleFavorite,
    deleteMemory,
    audioState,
    togglePlayAudio,
  } = useApp();

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  if (!selectedMemoryModal) return null;
  const mem = selectedMemoryModal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto no-scrollbar border border-secondary/40 shadow-2xl relative flex flex-col">
        {/* Modal Header */}
        <div className="sticky top-0 bg-surface/95 backdrop-blur-md px-5 py-3.5 border-b border-outline-variant/30 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="font-montserrat text-[10px] uppercase tracking-wider text-secondary font-semibold">
              ✦ {mem.chapter || 'Sacred Chronicle'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(mem.id)}
              className="p-1 text-secondary hover:text-error transition-colors"
              title="Toggle Favorite"
            >
              <Icon
                name="favorite"
                size={20}
                filled={mem.isFavorite}
                className={mem.isFavorite ? 'text-error' : 'opacity-60'}
              />
            </button>
            <button
              onClick={() => setSelectedMemoryModal(null)}
              className="p-1 rounded-full text-on-surface-variant hover:text-primary transition-colors"
              title="Close"
            >
              <Icon name="close" size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5">
          {/* Photos Carousel / Lightbox */}
          {mem.photos && mem.photos.length > 0 && (
            <div className="space-y-2">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-surface-dim border border-secondary/30 shadow-inner">
                <img
                  src={mem.photos[activePhotoIndex]}
                  alt={mem.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnails if multiple */}
              {mem.photos.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {mem.photos.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhotoIndex(idx)}
                      className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                        activePhotoIndex === idx
                          ? 'border-secondary scale-105 shadow'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={p} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Titles & Meta */}
          <div className="space-y-1">
            <h2 className="font-serif text-2xl text-primary font-bold">
              {mem.title}
            </h2>
            <div className="flex items-center gap-4 text-xs text-on-surface-variant font-medium pt-1">
              <span className="flex items-center gap-1.5">
                <Icon name="calendar_today" size={14} className="text-secondary" />
                <span>{mem.displayDate || mem.date}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="location_on" size={14} className="text-secondary" />
                <span>{mem.location}</span>
              </span>
            </div>
          </div>

          {/* The Full Side Note Letter */}
          <div className="parchment-texture rounded-xl p-5 border border-secondary/30 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-secondary/20 pb-2 text-secondary">
              <span className="font-montserrat text-[10px] uppercase tracking-wider font-semibold">
                Letter from {mem.author || 'Beloved'}
              </span>
              <span className="text-xs">✦ Wax Sealed</span>
            </div>

            <p className="font-editorial italic text-lg md:text-xl text-primary leading-relaxed">
              “{mem.letter}”
            </p>

            {mem.counterNote && (
              <div className="pt-3 border-t border-secondary/20 space-y-1">
                <span className="font-montserrat text-[9px] uppercase tracking-wider text-secondary font-semibold block">
                  Echoed by {mem.author === 'Sucre' ? 'Mine' : 'Sucre'}
                </span>
                <p className="font-editorial italic text-sm md:text-base text-on-surface-variant leading-relaxed">
                  “{mem.counterNote}”
                </p>
              </div>
            )}
          </div>

          {/* Audio Resonance / Song Chip */}
          <div className="flex items-center justify-between bg-surface-container-low rounded-xl p-3 border border-secondary/20">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlayAudio}
                className="w-8 h-8 rounded-full bg-primary text-secondary-fixed flex items-center justify-center shadow active:scale-90"
              >
                <Icon
                  name={audioState.isPlaying ? 'pause' : 'play_arrow'}
                  size={15}
                  filled={true}
                />
              </button>
              <div>
                <span className="font-montserrat text-[10px] text-secondary uppercase font-semibold block">
                  Soundtrack
                </span>
                <span className="font-sans text-xs text-primary font-medium truncate max-w-[200px] block">
                  {mem.song || '✦ Baby Riddim'}
                </span>
              </div>
            </div>

            {mem.mood && (
              <span className="px-3 py-1 rounded-full bg-surface-container-lowest text-primary text-[10px] font-montserrat uppercase font-semibold border border-secondary/30">
                ✦ {mem.mood}
              </span>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-outline-variant/30 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Delete "${mem.title || 'this memory'}" from your journal?`)) {
                deleteMemory(mem.id);
                setSelectedMemoryModal(null);
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs text-error/90 hover:text-error hover:bg-error/10 font-montserrat uppercase font-semibold transition-all active:scale-95 border border-error/20"
          >
            <Icon name="delete" size={14} />
            <span>Delete Memory</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMemoryModal(null)}
            className="px-5 py-2.5 rounded-full bg-primary text-secondary-fixed text-xs font-montserrat uppercase tracking-wider font-semibold shadow hover:bg-primary-container active:scale-95 transition-all"
          >
            Close Keepsake
          </button>
        </div>
      </div>
    </div>
  );
}
