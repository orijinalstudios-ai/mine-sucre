import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import AppLayout from './components/AppLayout';
import BottomNavBar from './components/BottomNavBar';
import SanctuaryView from './components/SanctuaryView';
import JourneyView from './components/JourneyView';
import CaptureView from './components/CaptureView';
import VaultView from './components/VaultView';
import MemoryDetailModal from './components/MemoryDetailModal';
import SettingsModal from './components/SettingsModal';
import PrintableKeepsakeModal from './components/PrintableKeepsakeModal';
import AudioPlayerModal from './components/AudioPlayerModal';
import InstallPromptModal from './components/InstallPromptModal';
import LockSplashScreen from './components/LockSplashScreen';

function MainApp() {
  const {
    activeTab,
    toastMessage,
    isInstallModalOpen,
    setIsInstallModalOpen,
    isUnlocked,
    unlockApp,
  } = useApp();

  if (!isUnlocked) {
    return <LockSplashScreen onUnlock={unlockApp} />;
  }

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Scrollable View Canvas */}
        <div className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col pb-6">
          {activeTab === 'sanctuary' && <SanctuaryView />}
          {activeTab === 'journey' && <JourneyView />}
          {activeTab === 'capture' && <CaptureView />}
          {activeTab === 'vault' && <VaultView />}
        </div>

        {/* Permanently Docked Bottom Dock */}
        <div className="shrink-0 z-40">
          <BottomNavBar />
        </div>
      </div>

      {/* Global Modals */}
      <MemoryDetailModal />
      <SettingsModal />
      <PrintableKeepsakeModal />
      <AudioPlayerModal />
      <InstallPromptModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-primary/95 text-secondary-fixed text-xs font-medium px-4 py-2.5 rounded-full shadow-lg border border-secondary/40 backdrop-blur-md flex items-center gap-2 animate-bounce">
          <span className="text-secondary text-sm">✦</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </AppLayout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
