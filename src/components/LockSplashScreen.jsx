import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import Icon from './Icon';

export default function LockSplashScreen({ onUnlock }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    const normalized = password.trim().toLowerCase();
    if (normalized === 'forevermine') {
      setError(false);
      setIsUnlocking(true);

      // Golden celebration particles
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.5 },
          colors: ['#ffd79b', '#ffe2b8', '#ffffff', '#775928', '#2f020e'],
        });
      } catch (err) {
        // Ignore
      }

      // Allow unlock animation to play before transitioning into app
      setTimeout(() => {
        onUnlock();
      }, 900);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-6 bg-gradient-to-br from-[#1e0108] via-[#2f020e] to-[#120005] text-[#fdf9f3] transition-all duration-700 ${
        isUnlocking ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Ambient background glow */}
      <div className="absolute w-96 h-96 rounded-full bg-[#ffd79b]/10 blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-sm flex flex-col items-center text-center relative z-10 space-y-7">
        {/* Monogram Seal */}
        <div className="flex items-center gap-2 text-xs font-montserrat uppercase tracking-widest text-[#ffd79b]/80">
          <span>✦</span>
          <span>Mine &amp; Sucre</span>
          <span>✦</span>
        </div>

        {/* Central Locked Heart with Unlock Animation */}
        <div className="relative my-2">
          {/* Animated Glow Rings */}
          <div
            className={`absolute -inset-4 rounded-full bg-[#ffd79b]/20 blur-xl transition-all duration-500 ${
              isUnlocking ? 'scale-150 bg-[#ffd79b]/50' : 'animate-pulse'
            }`}
          ></div>

          {/* Gilded Heart Emblem */}
          <div
            className={`w-28 h-28 rounded-full border-2 border-[#ffd79b]/60 flex items-center justify-center bg-gradient-to-b from-[#4a1622] to-[#2f020e] shadow-[0_0_35px_rgba(255,215,155,0.25)] relative transition-transform duration-500 ${
              isUnlocking ? 'scale-110 shadow-[0_0_60px_rgba(255,215,155,0.7)]' : 'hover:scale-105'
            } ${error ? 'animate-shake' : ''}`}
          >
            {/* Heart SVG Backdrop */}
            <div className="absolute inset-0 flex items-center justify-center text-[#ffd79b]/25 pointer-events-none">
              <Icon name="favorite" size={72} filled={true} />
            </div>

            {/* Central Padlock Icon that pops open */}
            <div
              className={`relative z-10 text-[#ffd79b] transition-all duration-500 ${
                isUnlocking ? 'scale-125 text-white' : ''
              }`}
            >
              <Icon
                name={isUnlocking ? 'lock_open' : 'lock'}
                size={34}
                className="drop-shadow-md"
              />
            </div>
          </div>
        </div>

        {/* Title and Romantic Prompt */}
        <div className="space-y-1.5">
          <h1 className="font-serif text-3xl text-[#ffe2b8] tracking-tight font-normal">
            Private Sanctuary
          </h1>
          <p className="font-sans text-xs text-[#fdf9f3]/70 max-w-xs leading-relaxed">
            Enter our sacred key to unlock our forever memories.
          </p>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="relative flex items-center">
            <span className="absolute left-4 text-[#ffd79b]/70 flex items-center">
              <Icon name="lock" size={16} />
            </span>

            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              className={`w-full bg-[#1b0209]/80 border text-center text-sm font-sans rounded-full pl-11 pr-11 py-3 text-[#fdf9f3] placeholder:text-[#fdf9f3]/40 focus:outline-none transition-all ${
                error
                  ? 'border-[#ff5449] ring-2 ring-[#ff5449]/30 bg-[#ff5449]/10'
                  : 'border-[#ffd79b]/40 focus:border-[#ffd79b] focus:ring-2 focus:ring-[#ffd79b]/20'
              }`}
              autoFocus
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 text-[#ffd79b]/70 hover:text-[#ffd79b] p-1"
              title={showPassword ? 'Hide Key' : 'Reveal Key'}
            >
              <Icon name={showPassword ? 'eye_off' : 'eye'} size={16} />
            </button>
          </div>

          {/* Feedback message */}
          {error && (
            <p className="font-serif italic text-xs text-[#ffb4ab] animate-fade-in">
              “Incorrect key, my love. Try again ✦”
            </p>
          )}

          {/* Unlock Action Button */}
          <button
            type="submit"
            disabled={isUnlocking}
            className={`w-full py-3.5 rounded-full bg-gradient-to-r from-[#ffd79b] via-[#ffe2b8] to-[#ffd79b] text-[#2f020e] font-montserrat text-xs uppercase tracking-widest font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
              isUnlocking ? 'opacity-80 scale-95' : 'hover:brightness-105'
            }`}
          >
            <Icon
              name={isUnlocking ? 'lock_open' : 'sparkles'}
              size={15}
              className="text-[#2f020e]"
            />
            <span>{isUnlocking ? 'Unlocking Sanctuary...' : 'Unlock Sanctuary'}</span>
          </button>
        </form>

        {/* Footer Monogram */}
        <p className="font-montserrat text-[9px] uppercase tracking-widest text-[#ffd79b]/50 pt-2">
          Bound Forever in the Vault
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}
