import React, { useState, useEffect } from 'react';
import Icon from './Icon';

export default function InstallPromptModal({ isOpen, onClose }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already running in standalone mode (already installed)
    const isInStandaloneMode = () =>
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone ||
      document.referrer.includes('android-app://');

    setIsStandalone(isInStandaloneMode());

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for Android install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface rounded-3xl max-w-sm w-full border border-secondary/40 shadow-2xl p-6 space-y-5 text-center">
        {/* App Icon Preview */}
        <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden shadow-lg border border-secondary/40 bg-primary flex items-center justify-center">
          <img src="/icon.svg" alt="App Icon" className="w-full h-full object-cover" />
        </div>

        <div className="space-y-1">
          <h3 className="font-serif text-xl font-bold text-primary">
            Download to Your Phone
          </h3>
          <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
            Install this memory journal as a private standalone app on your home screen.
          </p>
        </div>

        {isStandalone ? (
          <div className="bg-surface-container-low p-3.5 rounded-xl border border-secondary/30 text-xs text-secondary font-medium">
            ✦ Already installed and running as a standalone app!
          </div>
        ) : isIOS ? (
          /* iOS Instructions */
          <div className="bg-surface-container-low p-4 rounded-2xl border border-secondary/30 text-left space-y-2.5 text-xs text-on-surface-variant">
            <p className="font-montserrat uppercase text-[10px] tracking-wider text-secondary font-semibold">
              iPhone / iPad Steps:
            </p>
            <ol className="space-y-2 list-decimal list-inside leading-relaxed text-xs">
              <li>
                Tap the <span className="font-semibold text-primary">Share</span> button at the bottom of Safari (<span className="text-secondary font-bold">⎋</span>).
              </li>
              <li>
                Scroll down and tap <span className="font-semibold text-primary">“Add to Home Screen”</span> (<span className="text-secondary font-bold">⊞</span>).
              </li>
              <li>
                Tap <span className="font-semibold text-primary">Add</span> in the top-right corner.
              </li>
            </ol>
          </div>
        ) : deferredPrompt ? (
          /* Android Direct Install Button */
          <div className="space-y-2">
            <button
              onClick={handleInstallClick}
              className="w-full py-3 rounded-full bg-primary text-secondary-fixed font-montserrat text-xs uppercase tracking-wider font-semibold shadow hover:bg-primary-container active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Icon name="download" size={16} />
              <span>Install App on Device</span>
            </button>
          </div>
        ) : (
          /* Standard browser instructions */
          <div className="bg-surface-container-low p-4 rounded-2xl border border-secondary/30 text-left space-y-2 text-xs text-on-surface-variant">
            <p className="font-montserrat uppercase text-[10px] tracking-wider text-secondary font-semibold">
              Android / Chrome Steps:
            </p>
            <ol className="space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>Tap the <span className="font-semibold text-primary">three dots (⋮)</span> menu.</li>
              <li>Select <span className="font-semibold text-primary">“Install app”</span> or <span className="font-semibold text-primary">“Add to Home Screen”</span>.</li>
            </ol>
          </div>
        )}

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-full border border-outline-variant/40 text-on-surface-variant hover:text-primary font-montserrat text-xs uppercase tracking-wider font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
