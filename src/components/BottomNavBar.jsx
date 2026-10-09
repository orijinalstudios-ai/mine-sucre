import React from 'react';
import { useApp } from '../context/AppContext';
import Icon from './Icon';

export default function BottomNavBar() {
  const { activeTab, setActiveTab } = useApp();

  const navItems = [
    {
      id: 'sanctuary',
      label: 'Sanctuary',
      icon: 'favorite',
      fillWhenActive: true,
    },
    {
      id: 'journey',
      label: 'Journey',
      icon: 'auto_stories',
      fillWhenActive: true,
    },
    {
      id: 'capture',
      label: 'Capture',
      icon: 'add_circle',
      fillWhenActive: true,
    },
    {
      id: 'vault',
      label: 'Vault',
      icon: 'lock_open',
      fillWhenActive: false,
    },
  ];

  return (
    <nav className="w-full flex justify-around items-center px-4 py-2 pb-safe bg-surface-container-lowest/95 backdrop-blur-lg border-t border-secondary/20 shadow-[0_-4px_20px_rgba(47,2,14,0.08)]">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center transition-all duration-150 py-1 flex-1 active:scale-95 ${
              isActive
                ? 'text-primary font-semibold'
                : 'text-on-surface-variant/70 hover:text-secondary'
            }`}
          >
            <Icon
              name={item.icon}
              size={22}
              filled={isActive && item.fillWhenActive}
              className={`transition-transform ${
                isActive ? 'scale-110 text-primary' : 'text-on-surface-variant/70'
              }`}
            />
            <span className="font-montserrat text-[10px] tracking-wider uppercase mt-1">
              {item.label}
            </span>
            {isActive && (
              <span className="w-1.5 h-1.5 bg-secondary rounded-full mt-0.5"></span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
