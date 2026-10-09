import React from 'react';

export default function AppLayout({ children }) {
  return (
    <div className="h-screen h-[100dvh] w-full bg-[#f5f1eb] text-on-surface flex justify-center font-sans antialiased selection:bg-[#ffd79b]/40 overflow-hidden">
      {/* Clean full-height canvas: edge-to-edge on mobile, elegantly centered on desktop & tablets */}
      <div className="w-full max-w-md sm:max-w-lg h-full bg-surface flex flex-col shadow-2xl relative md:border-x md:border-secondary/15 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
