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
    isCloudConfigured,
    syncAllLocalToCloud,
    generateSyncLink,
    importSyncData,
  } = useApp();

  const [names, setNames] = useState(coupleProfile.names);
  const [partner1, setPartner1] = useState(coupleProfile.partner1);
  const [partner2, setPartner2] = useState(coupleProfile.partner2);
  const [anniversaryDate, setAnniversaryDate] = useState(coupleProfile.anniversaryDate);
  const [songUrl, setSongUrl] = useState(coupleProfile.songUrl || '');
  const [anthemTitle, setAnthemTitle] = useState(coupleProfile.anthemTitle || '');
  const [anthemArtist, setAnthemArtist] = useState(coupleProfile.anthemArtist || '');

  // Manual partner code states
  const [showManualCode, setShowManualCode] = useState(false);
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');

  const handleManualImport = (e) => {
    e.preventDefault();
    if (!manualCodeInput.trim()) return;
    const success = importSyncData(manualCodeInput.trim());
    if (success) {
      setManualCodeInput('');
      setShowManualCode(false);
    }
  };

  const handleCreateShareLink = () => {
    const link = generateSyncLink();
    if (link) {
      setGeneratedLink(link);
    }
  };

  if (!isSettingsOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    setCoupleProfile({
      ...coupleProfile,
      names: names.trim() || 'Our Memory Journal',
      partner1: partner1.trim() || 'Mine',
      partner2: partner2.trim() || 'Sucre',
      anniversaryDate,
      songUrl: songUrl.trim() || 'https://audiomack.com/favourish/song/baby-riddim',
      anthemTitle: anthemTitle.trim() || 'Baby Riddim',
      anthemArtist: anthemArtist.trim() || 'Fave',
    });
    showToast('Journal settings saved ✦');
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
    a.download = `memory-journal-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('Archives exported as backup');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto no-scrollbar border border-secondary/40 shadow-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
          <div className="flex items-center gap-2">
            <Icon name="settings" size={20} className="text-secondary" />
            <h2 className="font-serif text-xl font-bold text-primary">
              Couple Settings
            </h2>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1 text-on-surface-variant hover:text-primary"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-montserrat uppercase tracking-wider text-secondary font-semibold block text-[10px]">
              Journal Title
            </label>
            <input
              type="text"
              value={names}
              onChange={(e) => setNames(e.target.value)}
              placeholder="e.g. Mine & Sucre"
              className="w-full bg-surface-container-low border border-secondary/30 rounded-lg p-2.5 text-primary text-sm font-serif focus:ring-0 focus:border-secondary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-montserrat uppercase tracking-wider text-secondary font-semibold block text-[10px]">
                Partner 1
              </label>
              <input
                type="text"
                value={partner1}
                onChange={(e) => setPartner1(e.target.value)}
                placeholder="Partner 1"
                className="w-full bg-surface-container-low border border-secondary/30 rounded-lg p-2 text-primary focus:ring-0 focus:border-secondary"
              />
            </div>
            <div className="space-y-1">
              <label className="font-montserrat uppercase tracking-wider text-secondary font-semibold block text-[10px]">
                Partner 2
              </label>
              <input
                type="text"
                value={partner2}
                onChange={(e) => setPartner2(e.target.value)}
                placeholder="Partner 2"
                className="w-full bg-surface-container-low border border-secondary/30 rounded-lg p-2 text-primary focus:ring-0 focus:border-secondary"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-montserrat uppercase tracking-wider text-secondary font-semibold block text-[10px]">
              Anniversary Date
            </label>
            <input
              type="date"
              value={anniversaryDate}
              onChange={(e) => setAnniversaryDate(e.target.value)}
              className="w-full bg-surface-container-low border border-secondary/30 rounded-lg p-2 text-primary focus:ring-0 focus:border-secondary"
            />
            <p className="text-[10px] text-on-surface-variant/70 italic">
              All live countdowns and days together counters calculate from this date.
            </p>
          </div>

          <div className="space-y-1">
            <label className="font-montserrat uppercase tracking-wider text-secondary font-semibold block text-[10px]">
              Song Link (Audiomack or Audio URL)
            </label>
            <input
              type="url"
              value={songUrl}
              onChange={(e) => setSongUrl(e.target.value)}
              placeholder="https://audiomack.com/favourish/song/baby-riddim"
              className="w-full bg-surface-container-low border border-secondary/30 rounded-lg p-2 text-primary focus:ring-0 focus:border-secondary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-montserrat uppercase tracking-wider text-secondary font-semibold block text-[10px]">
                Song Title
              </label>
              <input
                type="text"
                value={anthemTitle}
                onChange={(e) => setAnthemTitle(e.target.value)}
                placeholder="Baby Riddim"
                className="w-full bg-surface-container-low border border-secondary/30 rounded-lg p-2 text-primary focus:ring-0 focus:border-secondary"
              />
            </div>
            <div className="space-y-1">
              <label className="font-montserrat uppercase tracking-wider text-secondary font-semibold block text-[10px]">
                Song Artist
              </label>
              <input
                type="text"
                value={anthemArtist}
                onChange={(e) => setAnthemArtist(e.target.value)}
                placeholder="Fave"
                className="w-full bg-surface-container-low border border-secondary/30 rounded-lg p-2 text-primary focus:ring-0 focus:border-secondary"
              />
            </div>
          </div>

          {/* Cloud Sync Status Card (Both Phones) */}
          <div className="p-3.5 rounded-xl bg-surface-container-low border border-secondary/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="cloud_sync" size={18} className="text-secondary" />
                <span className="font-montserrat text-xs font-semibold uppercase tracking-wider text-primary">
                  Both Phones Sync
                </span>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                  isCloudConfigured
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                    : 'bg-secondary/10 text-secondary border border-secondary/30'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isCloudConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-secondary'
                  }`}
                ></span>
                <span>{isCloudConfigured ? 'Vercel KV Connected' : 'Device Storage'}</span>
              </span>
            </div>

            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              {isCloudConfigured
                ? 'Your sanctuary is linked to Vercel KV! When either partner seals a memory or picture, the other receives it automatically in real-time.'
                : 'Share your memories and photos with your partner instantly below:'}
            </p>

            {/* Method 1: 1-Tap Partner Sync Link (Instant & 0 Setup!) */}
            <div className="space-y-2 pt-1 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={handleCreateShareLink}
                className="w-full py-2.5 px-3 rounded-full bg-primary text-secondary-fixed text-xs font-montserrat uppercase tracking-wider font-semibold shadow flex items-center justify-center gap-1.5 hover:bg-primary-container transition-all active:scale-95"
              >
                <Icon name="link" size={14} />
                <span>Copy Partner Sync Link (WhatsApp/SMS)</span>
              </button>
              <p className="text-[10px] text-on-surface-variant/80 text-center leading-normal">
                Generates a secure sync link with your latest memories. Send it to your partner — when they open it, their phone automatically imports all photos &amp; memories!
              </p>

              {generatedLink && (
                <div className="p-2 bg-surface rounded border border-secondary/30 text-[10px] break-all select-all font-mono text-primary">
                  {generatedLink}
                </div>
              )}
            </div>

            {/* Method 2: Vercel KV Auto-Sync or Manual Code */}
            <div className="flex items-center justify-between pt-1 border-t border-outline-variant/20 text-[10px]">
              <button
                type="button"
                onClick={syncAllLocalToCloud}
                className="text-secondary hover:underline flex items-center gap-1 font-semibold"
              >
                <Icon name="sync" size={12} />
                <span>Check / Sync Vercel KV</span>
              </button>

              <button
                type="button"
                onClick={() => setShowManualCode(!showManualCode)}
                className="text-on-surface-variant hover:text-primary underline"
              >
                {showManualCode ? 'Hide Code Box' : 'Enter Partner Code'}
              </button>
            </div>

            {showManualCode && (
              <form onSubmit={handleManualImport} className="space-y-2 pt-1">
                <input
                  type="text"
                  value={manualCodeInput}
                  onChange={(e) => setManualCodeInput(e.target.value)}
                  placeholder="Paste partner sync code here..."
                  className="w-full bg-surface text-primary border border-secondary/30 rounded-lg p-2 text-xs font-mono"
                />
                <button
                  type="submit"
                  className="w-full py-1.5 rounded-full bg-secondary text-primary font-montserrat text-[10px] uppercase font-bold tracking-wider"
                >
                  Import Memories from Partner
                </button>
              </form>
            )}
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-outline-variant/30 space-y-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-full bg-primary text-secondary-fixed font-montserrat text-xs uppercase tracking-wider font-semibold shadow hover:bg-primary-container"
            >
              Save Settings
            </button>

            <button
              type="button"
              onClick={() => {
                setIsSettingsOpen(false);
                lockApp();
              }}
              className="w-full py-2 rounded-full border border-secondary/40 text-secondary hover:bg-secondary/10 font-montserrat text-[10px] uppercase tracking-wider font-semibold flex items-center justify-center gap-1.5"
            >
              <Icon name="lock" size={14} />
              <span>Lock Sanctuary Now</span>
            </button>

            <button
              type="button"
              onClick={handleExportJSON}
              className="w-full py-2 rounded-full border border-outline-variant/50 text-on-surface-variant hover:bg-surface-container font-montserrat text-[10px] uppercase tracking-wider font-semibold flex items-center justify-center gap-1.5"
            >
              <Icon name="download" size={15} />
              <span>Export Journal Backup (JSON)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (confirm('Clear all memories and vows? This cannot be undone unless you exported a backup.')) {
                  clearAllData();
                  setIsSettingsOpen(false);
                }
              }}
              className="w-full py-2 text-center text-error hover:underline text-[11px] font-medium"
            >
              Clear All Journal Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
