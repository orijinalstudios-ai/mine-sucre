import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Icon from './Icon';

export default function SettingsModal() {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    coupleProfile,
    setCoupleProfile,
    clearAllData,
    showToast,
    memories,
    vows,
    lockApp,
  } = useApp();

  const [names, setNames] = useState(coupleProfile.names);
  const [partner1, setPartner1] = useState(coupleProfile.partner1);
  const [partner2, setPartner2] = useState(coupleProfile.partner2);
  const [anniversaryDate, setAnniversaryDate] = useState(coupleProfile.anniversaryDate);
  const [songUrl, setSongUrl] = useState(coupleProfile.songUrl || '');
  const [anthemTitle, setAnthemTitle] = useState(coupleProfile.anthemTitle || '');
  const [anthemArtist, setAnthemArtist] = useState(coupleProfile.anthemArtist || '');

  if (!isSettingsOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    setCoupleProfile({
      ...coupleProfile,
      names: names.trim() || 'Mine & Sucre',
      partner1: partner1.trim() || 'Mine',
      partner2: partner2.trim() || 'Sucre',
      anniversaryDate,
      songUrl: songUrl.trim() || 'https://audiomack.com/favourish/song/baby-riddim',
      anthemTitle: anthemTitle.trim() || 'Baby Riddim',
      anthemArtist: anthemArtist.trim() || 'Fave',
    });
    showToast('Journal settings sealed ✦');
    setIsSettingsOpen(false);
  };

  const handleExportJSON = () => {
    const data = {
      coupleProfile,
      memories,
      vows,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mine-and-sucre-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('Vault archives exported as backup');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-surface rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto no-scrollbar border border-secondary/35 shadow-2xl p-6 space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-secondary-container/30 border border-secondary/30 flex items-center justify-center text-secondary">
              <Icon name="settings" size={17} />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-primary leading-tight">
                Sanctuary Settings
              </h2>
              <span className="font-montserrat text-[9px] uppercase tracking-widest text-secondary block">
                Personalization &amp; Vault
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="w-8 h-8 rounded-full border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-secondary transition-colors"
            title="Close"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        {/* Live Auto-Sync Status Badge */}
        <div className="p-3.5 rounded-xl bg-surface-container-low border border-secondary/25 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 shrink-0">
              <Icon name="cloud_sync" size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-montserrat text-xs font-semibold uppercase tracking-wider text-primary">
                  Live Auto-Sync
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-700 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant/80 mt-0.5 leading-snug">
                All photos, letters, and milestones update automatically in real time across both Mine &amp; Sucre’s phones.
              </p>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Journal Title */}
          <div className="space-y-1.5">
            <label className="font-montserrat uppercase tracking-wider text-secondary font-semibold block text-[10px]">
              Journal Title
            </label>
            <input
              type="text"
              value={names}
              onChange={(e) => setNames(e.target.value)}
              placeholder="Mine & Sucre"
              className="w-full bg-surface-container-low border border-secondary/30 rounded-xl px-3 py-2.5 text-primary text-sm font-serif focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30 transition-all"
            />
          </div>

          {/* Partner Names */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-montserrat uppercase tracking-wider text-secondary font-semibold block text-[10px]">
                Partner 1
              </label>
              <input
                type="text"
                value={partner1}
                onChange={(e) => setPartner1(e.target.value)}
                placeholder="Mine"
                className="w-full bg-surface-container-low border border-secondary/30 rounded-xl px-3 py-2 text-primary focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-montserrat uppercase tracking-wider text-secondary font-semibold block text-[10px]">
                Partner 2
              </label>
              <input
                type="text"
                value={partner2}
                onChange={(e) => setPartner2(e.target.value)}
                placeholder="Sucre"
                className="w-full bg-surface-container-low border border-secondary/30 rounded-xl px-3 py-2 text-primary focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30 transition-all"
              />
            </div>
          </div>

          {/* Anniversary Date */}
          <div className="space-y-1.5">
            <label className="font-montserrat uppercase tracking-wider text-secondary font-semibold block text-[10px]">
              Anniversary Date
            </label>
            <input
              type="date"
              value={anniversaryDate}
              onChange={(e) => setAnniversaryDate(e.target.value)}
              className="w-full bg-surface-container-low border border-secondary/30 rounded-xl px-3 py-2 text-primary focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30 transition-all font-sans"
            />
            <p className="text-[10px] text-on-surface-variant/70 italic leading-snug">
              All live milestone tickers and anniversary countdowns calculate from this sacred date.
            </p>
          </div>

          {/* Anthem Track */}
          <div className="space-y-1.5">
            <label className="font-montserrat uppercase tracking-wider text-secondary font-semibold block text-[10px]">
              Song Link (Audiomack or Audio URL)
            </label>
            <input
              type="url"
              value={songUrl}
              onChange={(e) => setSongUrl(e.target.value)}
              placeholder="https://audiomack.com/favourish/song/baby-riddim"
              className="w-full bg-surface-container-low border border-secondary/30 rounded-xl px-3 py-2 text-primary focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30 transition-all font-sans text-xs"
            />
          </div>

          {/* Track Meta */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-montserrat uppercase tracking-wider text-secondary font-semibold block text-[10px]">
                Song Title
              </label>
              <input
                type="text"
                value={anthemTitle}
                onChange={(e) => setAnthemTitle(e.target.value)}
                placeholder="Baby Riddim"
                className="w-full bg-surface-container-low border border-secondary/30 rounded-xl px-3 py-2 text-primary focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-montserrat uppercase tracking-wider text-secondary font-semibold block text-[10px]">
                Song Artist
              </label>
              <input
                type="text"
                value={anthemArtist}
                onChange={(e) => setAnthemArtist(e.target.value)}
                placeholder="Fave"
                className="w-full bg-surface-container-low border border-secondary/30 rounded-xl px-3 py-2 text-primary focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30 transition-all"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-outline-variant/30 space-y-2.5">
            <button
              type="submit"
              className="w-full py-2.5 rounded-full bg-primary text-secondary-fixed font-montserrat text-xs uppercase tracking-wider font-semibold shadow hover:bg-primary-container active:scale-95 transition-all"
            >
              Save Sanctuary Settings
            </button>

            <button
              type="button"
              onClick={() => {
                setIsSettingsOpen(false);
                lockApp();
              }}
              className="w-full py-2 rounded-full border border-secondary/40 text-secondary hover:bg-secondary/10 font-montserrat text-[10px] uppercase tracking-wider font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <Icon name="lock" size={14} />
              <span>Lock Sanctuary Now</span>
            </button>

            <button
              type="button"
              onClick={handleExportJSON}
              className="w-full py-2 rounded-full border border-outline-variant/50 text-on-surface-variant hover:bg-surface-container font-montserrat text-[10px] uppercase tracking-wider font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <Icon name="download" size={14} />
              <span>Export Journal Backup (JSON)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Clear all memories and vows? This will reset the journal for a fresh start.')) {
                  clearAllData();
                  setIsSettingsOpen(false);
                }
              }}
              className="w-full py-2 text-center text-error hover:underline text-[11px] font-medium transition-colors"
            >
              Clear All Journal Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
