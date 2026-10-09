import React from 'react';
import { useApp } from '../context/AppContext';
import Icon from './Icon';

export default function TopAppBar({ title, showBack = false, onBack }) {
  const {
    coupleProfile,
    setIsSettingsOpen,
    setIsKeepsakeBookOpen,
    setIsInstallModalOpen,
    lockApp,
  } = useApp();

  return (
    <header className="bg-surface/95 backdrop-blur-md text-primary sticky top-0 z-30 border-b border-outline-variant/30 shadow-sm transition-colors">
      <div className="flex justify-between items-center w-full px-4 py-2.5">
        {/* Leading Action */}
        {showBack ? (
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full border border-secondary/20 hover:border-secondary/40 hover:bg-secondary-container/20 active:scale-90 text-primary transition-all flex items-center justify-center"
            title="Go Back"
          >
            <Icon name="arrow_back" size={17} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsKeepsakeBookOpen(true)}
            className="w-8 h-8 rounded-full border border-secondary/20 hover:border-secondary/40 hover:bg-secondary-container/20 active:scale-90 text-primary transition-all flex items-center justify-center"
            title="Printable Keepsake Album"
          >
            <Icon name="menu_book" size={17} />
          </button>
        )}

        {/* Monogram Crest or Title */}
        {title ? (
          <h2 className="font-serif italic font-semibold text-lg text-primary truncate max-w-[180px]">
            {title}
          </h2>
        ) : (
          <div
            className="flex items-center gap-1.5 cursor-pointer relative group px-2 py-1 rounded-full hover:bg-secondary-container/15 transition-colors"
            onClick={() => setIsSettingsOpen(true)}
            title="Auto-Sync Live between Mine & Sucre"
          >
            <span className="text-secondary text-[10px] opacity-75">✦</span>
            <span className="font-cinzel font-semibold text-base tracking-widest text-primary">
              {coupleProfile.partner1.charAt(0)} &amp; {coupleProfile.partner2.charAt(0)}
            </span>
            <span className="text-secondary text-[10px] opacity-75">✦</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5 inline-block" title="Both phones auto-synced" />
          </div>
        )}

        {/* Trailing Actions: Lock, Mobile Download & Settings */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={lockApp}
            className="w-8 h-8 rounded-full border border-secondary/20 hover:border-secondary/40 hover:bg-secondary-container/20 active:scale-90 text-primary transition-all flex items-center justify-center"
            title="Lock Sanctuary"
          >
            <Icon name="lock" size={15} />
          </button>

          <button
            type="button"
            onClick={() => setIsInstallModalOpen(true)}
            className="w-8 h-8 rounded-full border border-secondary/20 hover:border-secondary/40 hover:bg-secondary-container/20 active:scale-90 text-primary transition-all flex items-center justify-center"
            title="Download App to Mobile"
          >
            <Icon name="smartphone" size={16} />
          </button>

          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="w-8 h-8 rounded-full border border-secondary/20 hover:border-secondary/40 hover:bg-secondary-container/20 active:scale-90 text-primary transition-all flex items-center justify-center"
            title="Settings & Personalization"
          >
            <Icon name="settings" size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
