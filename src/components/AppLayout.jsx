import React from 'react';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f5f1eb] text-on-surface flex justify-center font-sans antialiased selection:bg-[#ffd79b]/40">
      {/* Clean full-height canvas: edge-to-edge on mobile, elegantly centered on desktop */}
      <div className="w-full max-w-md min-h-screen bg-surface flex flex-col shadow-2xl relative md:border-x md:border-secondary/15">
        {children}
      </div>
    </div>
  );
}
