import React from 'react';
import { useApp } from '../context/AppContext';
import Icon from './Icon';

export default function PrintableKeepsakeModal() {
  const { isKeepsakeBookOpen, setIsKeepsakeBookOpen, coupleProfile, memories, timeStats } = useApp();

  if (!isKeepsakeBookOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[95vh] overflow-y-auto no-scrollbar shadow-2xl flex flex-col relative text-[#1c1c18]">
        {/* Controls Toolbar (hidden during print) */}
        <div className="print:hidden sticky top-0 bg-surface/95 backdrop-blur-md px-6 py-4 border-b border-secondary/30 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <Icon name="menu_book" size={20} className="text-secondary" />
            <span className="font-serif font-bold text-primary">Printable Keepsake Album</span>
          </div>

          <div className="flex items-center gap-3">
            {memories.length > 0 && (
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-secondary-fixed text-xs font-montserrat uppercase tracking-wider font-semibold shadow hover:bg-primary-container"
              >
                <Icon name="print" size={15} />
                <span>Print / Save as PDF</span>
              </button>
            )}
            <button
              onClick={() => setIsKeepsakeBookOpen(false)}
              className="p-1 rounded-full text-gray-500 hover:text-black"
            >
              <Icon name="close" size={20} />
            </button>
          </div>
        </div>

        {/* Printable Album Content */}
        <div className="p-8 md:p-12 space-y-12 bg-[#fffdfa] print:p-0 print:space-y-8">
          {/* Cover Page */}
          <div className="text-center py-16 border-b-2 border-secondary/20 space-y-4">
            <div className="w-20 h-20 rounded-full border-2 border-secondary/50 mx-auto flex items-center justify-center bg-surface-container-low shadow-sm">
              <span className="font-serif italic font-bold text-secondary text-2xl">
                {coupleProfile.partner1.charAt(0)}&{coupleProfile.partner2.charAt(0)}
              </span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl text-primary font-normal">
              {coupleProfile.names}
            </h1>
            <p className="font-montserrat text-xs uppercase tracking-widest text-secondary font-semibold">
              An Heirloom Chronicle of Love & Milestones
            </p>
            <div className="pt-4 text-xs text-gray-600 font-sans">
              <p>Commenced: {coupleProfile.anniversaryDate}</p>
              <p className="mt-1 font-serif italic text-primary">
                “{timeStats.daysTogether} Days of Love & Endless Constellations”
              </p>
            </div>
          </div>

          {/* Chapters & Memories */}
          {memories.length > 0 ? (
            <div className="space-y-10">
              {memories.map((mem, index) => (
                <div
                  key={mem.id}
                  className="break-inside-avoid page-break space-y-4 pb-8 border-b border-gray-200"
                >
                  <div className="flex items-center justify-between text-xs text-secondary font-montserrat uppercase tracking-wider">
                    <span>{mem.chapter || `Chapter ${index + 1}`}</span>
                    <span>{mem.displayDate || mem.date} · {mem.location}</span>
                  </div>

                  <h2 className="font-serif text-2xl text-primary font-semibold">
                    {mem.title}
                  </h2>

                  {mem.photos && mem.photos.length > 0 && (
                    <div className="aspect-[16/9] w-full rounded-lg overflow-hidden border border-gray-200">
                      <img src={mem.photos[0]} alt={mem.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="bg-[#f9f6f0] p-6 rounded-lg border border-secondary/20 space-y-2">
                    <span className="font-montserrat text-[10px] uppercase tracking-wider text-secondary font-semibold block">
                      Letter from {mem.author || 'Beloved'}
                    </span>
                    <p className="font-serif italic text-base leading-relaxed text-gray-900">
                      “{mem.letter}”
                    </p>
                    {mem.counterNote && (
                      <p className="font-serif italic text-xs text-gray-600 pt-2 border-t border-gray-200">
                        Echoed: “{mem.counterNote}”
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 space-y-2 text-on-surface-variant">
              <p className="font-serif italic text-base text-primary">
                No memories recorded yet in this journal.
              </p>
              <p className="text-xs">
                Once you pen moments and attach photos, they will be formatted here for printing.
              </p>
            </div>
          )}

          {/* Book Ending Seal */}
          <div className="text-center py-10 space-y-2">
            <span className="font-serif italic text-lg text-primary block">
              Bound in Love Forever
            </span>
            <p className="font-montserrat text-[9px] uppercase tracking-widest text-secondary">
              Archived in the Vault · {coupleProfile.archivedVaultYear}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
