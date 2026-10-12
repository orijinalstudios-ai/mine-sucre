import React from 'react';
import { CARD_THEMES, getCardTheme } from '../utils/cardThemes';
import Icon from './Icon';

export default function CardColorPicker({ selectedColor, onChange }) {
  const currentTheme = getCardTheme(selectedColor);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="font-montserrat text-[10px] uppercase tracking-wider text-primary font-semibold flex items-center gap-1.5">
          <Icon name="palette" size={14} className="text-secondary" />
          <span>Card Color on Main Screen</span>
        </label>
        <span className="font-serif italic text-xs text-secondary font-medium">
          {currentTheme.name}
        </span>
      </div>

      {/* Color Swatches Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {CARD_THEMES.map((theme) => {
          const isSelected = (selectedColor || 'parchment') === theme.id || selectedColor === theme.bg;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onChange(theme.id)}
              className={`flex flex-col items-center p-2 rounded-xl border transition-all active:scale-95 text-center group ${
                isSelected
                  ? 'ring-2 ring-secondary border-primary shadow-sm scale-102'
                  : 'border-outline-variant/30 hover:border-secondary/50'
              }`}
              style={{ backgroundColor: theme.bg }}
              title={theme.name}
            >
              <div
                className="w-5 h-5 rounded-full border shadow-2xs mb-1 flex items-center justify-center transition-transform group-hover:scale-110"
                style={{
                  backgroundColor: theme.previewColor,
                  borderColor: theme.border,
                }}
              >
                {isSelected && (
                  <span
                    className="text-[10px] font-bold"
                    style={{ color: theme.isDark ? '#ffd79b' : '#2f020e' }}
                  >
                    ✓
                  </span>
                )}
              </div>
              <span
                className="text-[8px] font-montserrat uppercase tracking-tight truncate w-full"
                style={{ color: theme.isDark ? '#ffd79b' : '#555' }}
              >
                {theme.name.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Live Mini Card Preview */}
      <div
        className="p-3 rounded-xl border shadow-xs transition-colors duration-300 flex items-center justify-between"
        style={{
          backgroundColor: currentTheme.bg,
          borderColor: currentTheme.border,
          color: currentTheme.text,
        }}
      >
        <div className="space-y-0.5">
          <span
            className="text-[9px] uppercase font-cinzel font-bold tracking-widest block"
            style={{ color: currentTheme.accent }}
          >
            Preview Styling
          </span>
          <p className="font-serif text-xs font-semibold">
            “Our sacred memories framed in {currentTheme.name}”
          </p>
        </div>
        <span
          className="text-[9px] font-montserrat uppercase px-2 py-0.5 rounded-full border"
          style={{
            borderColor: currentTheme.border,
            color: currentTheme.accent,
          }}
        >
          ✦ Active Tone
        </span>
      </div>
    </div>
  );
}
