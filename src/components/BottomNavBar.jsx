import React from 'react';
import { useApp } from '../context/AppContext';
import Icon from './Icon';

export default function BottomNavBar() {
  const { activeTab, setActiveTab } = useApp();

  return (
    <nav className="w-full bg-surface/95 backdrop-blur-xl border-t border-secondary/25 shadow-[0_-6px_25px_rgba(47,2,14,0.06)] px-3 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] transition-colors">
      <div className="flex items-center justify-around max-w-md sm:max-w-lg mx-auto">
        {/* Sanctuary Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('sanctuary')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 active:scale-90 ${
            activeTab === 'sanctuary'
              ? 'text-primary font-bold'
              : 'text-on-surface-variant/65 hover:text-secondary'
          }`}
          title="Sanctuary Home"
        >
          <div
            className={`w-9 h-7 flex items-center justify-center rounded-full transition-all duration-200 ${
              activeTab === 'sanctuary'
                ? 'bg-secondary-container/35 text-primary scale-105 shadow-sm'
                : ''
            }`}
          >
            <Icon
              name="favorite"
              size={20}
              filled={activeTab === 'sanctuary'}
              strokeWidth={activeTab === 'sanctuary' ? 2.2 : 1.8}
              className={activeTab === 'sanctuary' ? 'text-primary' : 'text-on-surface-variant/70'}
            />
          </div>
          <span className="font-montserrat text-[9px] tracking-widest uppercase mt-0.5">
            Sanctuary
          </span>
          <span
            className={`w-1 h-1 rounded-full bg-secondary transition-all duration-300 mt-0.5 ${
              activeTab === 'sanctuary' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
            }`}
          />
        </button>

        {/* Journey Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('journey')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 active:scale-90 ${
            activeTab === 'journey'
              ? 'text-primary font-bold'
              : 'text-on-surface-variant/65 hover:text-secondary'
          }`}
          title="Chronicles & Memories"
        >
          <div
            className={`w-9 h-7 flex items-center justify-center rounded-full transition-all duration-200 ${
              activeTab === 'journey'
                ? 'bg-secondary-container/35 text-primary scale-105 shadow-sm'
                : ''
            }`}
          >
            <Icon
              name="auto_stories"
              size={20}
              strokeWidth={activeTab === 'journey' ? 2.3 : 1.8}
              className={activeTab === 'journey' ? 'text-primary' : 'text-on-surface-variant/70'}
            />
          </div>
          <span className="font-montserrat text-[9px] tracking-widest uppercase mt-0.5">
            Journey
          </span>
          <span
            className={`w-1 h-1 rounded-full bg-secondary transition-all duration-300 mt-0.5 ${
              activeTab === 'journey' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
            }`}
          />
        </button>

        {/* Capture Jewel Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('capture')}
          className="flex flex-col items-center justify-center group active:scale-90 transition-transform px-2"
          title="Pen a New Memory"
        >
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_4px_16px_rgba(47,2,14,0.3)] border-2 ${
              activeTab === 'capture'
                ? 'bg-gradient-to-tr from-[#3a0614] via-[#521321] to-[#3a0614] text-[#ffd79b] border-[#ffd79b] ring-4 ring-[#ffd79b]/30 scale-105'
                : 'bg-gradient-to-tr from-[#2f020e] via-[#4a1622] to-[#2f020e] text-[#ffd79b] border-[#ffd79b]/70 hover:scale-105'
            }`}
          >
            <Icon
              name="plus"
              size={22}
              strokeWidth={2.6}
              className="transition-transform group-hover:rotate-90 duration-300 text-[#ffd79b]"
            />
          </div>
          <span
            className={`font-montserrat text-[9px] tracking-widest uppercase mt-0.5 transition-colors ${
              activeTab === 'capture'
                ? 'text-primary font-bold'
                : 'text-on-surface-variant/75 group-hover:text-primary font-medium'
            }`}
          >
            Capture
          </span>
        </button>

        {/* Vault Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('vault')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 active:scale-90 ${
            activeTab === 'vault'
              ? 'text-primary font-bold'
              : 'text-on-surface-variant/65 hover:text-secondary'
          }`}
          title="Sacred Vault & Vows"
        >
          <div
            className={`w-9 h-7 flex items-center justify-center rounded-full transition-all duration-200 ${
              activeTab === 'vault'
                ? 'bg-secondary-container/35 text-primary scale-105 shadow-sm'
                : ''
            }`}
          >
            <Icon
              name={activeTab === 'vault' ? 'lock_open' : 'lock'}
              size={19}
              strokeWidth={activeTab === 'vault' ? 2.2 : 1.8}
              className={activeTab === 'vault' ? 'text-primary' : 'text-on-surface-variant/70'}
            />
          </div>
          <span className="font-montserrat text-[9px] tracking-widest uppercase mt-0.5">
            Vault
          </span>
          <span
            className={`w-1 h-1 rounded-full bg-secondary transition-all duration-300 mt-0.5 ${
              activeTab === 'vault' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
            }`}
          />
        </button>
      </div>
    </nav>
  );
}
