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
      <div className="flex justify-between items-center w-full px-4 py-3">
        {/* Leading Action */}
        {showBack ? (
          <button
            onClick={onBack}
            className="hover:text-secondary transition-colors duration-200 active:scale-95 p-1 text-primary focus:outline-none flex items-center justify-center"
            title="Go Back"
          >
            <Icon name="arrow_back" size={20} />
          </button>
        ) : (
          <button
            onClick={() => setIsKeepsakeBookOpen(true)}
            className="hover:text-secondary transition-colors duration-200 active:scale-95 p-1 text-primary focus:outline-none flex items-center justify-center"
            title="Printable Keepsake Album"
          >
            <Icon name="menu_book" size={20} />
          </button>
        )}

        {/* Monogram Crest or Title */}
        {title ? (
          <h2 className="font-serif italic font-medium text-lg text-primary truncate max-w-[180px]">
            {title}
          </h2>
        ) : (
          <div
            className="flex items-center gap-1.5 cursor-pointer"
            onClick={() => setIsSettingsOpen(true)}
          >
            <span className="text-secondary text-[11px] opacity-70">✦</span>
            <span className="font-serif italic text-lg tracking-widest text-primary font-medium">
              {coupleProfile.partner1.charAt(0)} & {coupleProfile.partner2.charAt(0)}
            </span>
            <span className="text-secondary text-[11px] opacity-70">✦</span>
          </div>
        )}

        {/* Trailing Actions: Lock, Mobile Download & Settings */}
        <div className="flex items-center gap-1">
          <button
            onClick={lockApp}
            className="hover:text-secondary transition-colors duration-200 active:scale-95 p-1 text-primary focus:outline-none flex items-center justify-center"
            title="Lock Sanctuary"
          >
            <Icon name="lock" size={18} />
          </button>

          <button
            onClick={() => setIsInstallModalOpen(true)}
            className="hover:text-secondary transition-colors duration-200 active:scale-95 p-1 text-primary focus:outline-none flex items-center justify-center"
            title="Download App to Mobile"
          >
            <Icon name="smartphone" size={19} />
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="hover:text-secondary transition-colors duration-200 active:scale-95 p-1 text-primary focus:outline-none flex items-center justify-center"
            title="Settings & Personalization"
          >
            <Icon name="settings" size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
