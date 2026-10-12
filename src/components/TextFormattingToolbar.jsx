import React, { useState } from 'react';
import Icon from './Icon';

const QUICK_EMOJIS = ['💖', '💍', '✨', '🌹', '💌', '🕊️', '🥂', '🌙', '🎶', '✦', '🤍', '🥰', '💫', '♾️'];

const EXTENDED_EMOJIS = [
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎',
  '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '😍',
  '😘', '🥰', '🌹', '🌸', '💐', '🌺', '🌻', '🌷', '🌿',
  '💍', '💎', '💌', '🕊️', '🥂', '🍷', '🌙', '⭐', '✨',
  '☀️', '🏖️', '✈️', '🏡', '🧸', '🍫', '🕯️', '🎶', '🪄'
];

export default function TextFormattingToolbar({ textareaRef, value, onChange }) {
  const [showExtended, setShowExtended] = useState(false);

  const insertText = (before, after = '') => {
    const textarea = textareaRef?.current;
    if (!textarea) {
      onChange(value + before + after);
      return;
    }

    const start = textarea.selectionStart ?? value.length;
    const end = textarea.selectionEnd ?? value.length;
    const selected = value.substring(start, end);

    const replacement = before + (selected || '') + after;
    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      const newPos = selected
        ? start + replacement.length
        : start + before.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 10);
  };

  const insertEmoji = (emoji) => {
    insertText(emoji);
  };

  return (
    <div className="space-y-1.5 py-1">
      {/* Primary Toolbar: Text Format Shortcuts & Quick Emojis */}
      <div className="flex items-center justify-between gap-1.5 flex-wrap">
        {/* Formatting Buttons */}
        <div className="flex items-center gap-1 bg-surface-container-high/60 rounded-lg p-0.5 border border-outline-variant/30 text-xs">
          <button
            type="button"
            onClick={() => insertText('**', '**')}
            className="w-7 h-6 rounded flex items-center justify-center font-bold text-primary hover:bg-surface hover:shadow-xs active:scale-95 transition-all"
            title="Bold (**text**)"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => insertText('*', '*')}
            className="w-7 h-6 rounded flex items-center justify-center italic font-serif text-primary hover:bg-surface hover:shadow-xs active:scale-95 transition-all"
            title="Italic (*text*)"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => insertText('==', '==')}
            className="w-7 h-6 rounded flex items-center justify-center text-[10px] font-semibold text-secondary hover:bg-surface hover:shadow-xs active:scale-95 transition-all"
            title="Highlight (==text==)"
          >
            ✦
          </button>
          <button
            type="button"
            onClick={() => insertText('> ')}
            className="w-7 h-6 rounded flex items-center justify-center text-xs text-primary hover:bg-surface hover:shadow-xs active:scale-95 transition-all"
            title="Quote (> text)"
          >
            ❝
          </button>
          <button
            type="button"
            onClick={() => insertText('\n\n')}
            className="px-1.5 h-6 rounded flex items-center justify-center text-[9px] font-montserrat uppercase tracking-wider text-on-surface-variant hover:text-primary hover:bg-surface hover:shadow-xs active:scale-95 transition-all"
            title="Paragraph Break (blank line)"
          >
            ¶ Para
          </button>
        </div>

        {/* Extended Emoji Palette Toggle */}
        <button
          type="button"
          onClick={() => setShowExtended(!showExtended)}
          className={`px-2.5 h-7 rounded-lg text-xs flex items-center gap-1 border transition-all active:scale-95 ${
            showExtended
              ? 'bg-secondary text-surface border-secondary'
              : 'bg-surface-container-high/60 text-on-surface-variant border-outline-variant/30 hover:border-secondary/40 hover:text-primary'
          }`}
          title="More Romance Emojis"
        >
          <span>💖</span>
          <span className="text-[10px] font-montserrat uppercase font-semibold">
            {showExtended ? 'Hide Emojis' : 'More Emojis'}
          </span>
        </button>
      </div>

      {/* Quick Emojis Strip */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
        {QUICK_EMOJIS.map((emoji, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => insertEmoji(emoji)}
            className="w-7 h-7 rounded-full hover:bg-secondary-container/30 active:scale-125 transition-all flex items-center justify-center text-sm shrink-0"
            title={`Insert ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Extended Emoji Palette Drawer */}
      {showExtended && (
        <div className="p-2 rounded-xl bg-surface-container-low border border-secondary/30 shadow-inner grid grid-cols-9 gap-1 animate-fade-in text-base">
          {EXTENDED_EMOJIS.map((emoji, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => insertEmoji(emoji)}
              className="w-8 h-8 rounded-lg hover:bg-surface active:scale-125 transition-all flex items-center justify-center"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
