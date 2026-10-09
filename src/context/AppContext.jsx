import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialCoupleProfile, initialMemories, initialVows } from '../data/seedData';
import { ambientPlayer, getAudioEmbedUrl } from '../utils/audioPlayer';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Navigation
  const [activeTab, setActiveTab] = useState('sanctuary');

  // Purge legacy mock data if previously stored in browser
  useEffect(() => {
    const isCleaned = localStorage.getItem('mm_clean_state_v1');
    if (!isCleaned) {
      localStorage.removeItem('mm_memories');
      localStorage.removeItem('mm_vows');
      localStorage.setItem('mm_clean_state_v1', 'true');
      setMemories([]);
      setVows([]);
    }
  }, []);

  // Couple Profile
  const [coupleProfile, setCoupleProfile] = useState(() => {
    const saved = localStorage.getItem('mm_couple_profile_v2');
    return saved ? JSON.parse(saved) : initialCoupleProfile;
  });

  // Memories (100% clean, ready for user inputs)
  const [memories, setMemories] = useState(() => {
    const isCleaned = localStorage.getItem('mm_clean_state_v1');
    if (!isCleaned) return [];
    const saved = localStorage.getItem('mm_memories');
    return saved ? JSON.parse(saved) : [];
  });

  // Vows
  const [vows, setVows] = useState(() => {
    const isCleaned = localStorage.getItem('mm_clean_state_v1');
    if (!isCleaned) return [];
    const saved = localStorage.getItem('mm_vows');
    return saved ? JSON.parse(saved) : [];
  });

  // Real Audio Player & Ambient Player State
  const [isAudioPlayerOpen, setIsAudioPlayerOpen] = useState(false);
  const [audioState, setAudioState] = useState({
    isPlaying: false,
    currentTime: 0,
    duration: 164,
  });

  // Password Protected Lock State ("forevermine")
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return sessionStorage.getItem('mm_unlocked') === 'true';
  });

  const unlockApp = () => {
    sessionStorage.setItem('mm_unlocked', 'true');
    setIsUnlocked(true);
  };

  const lockApp = () => {
    sessionStorage.removeItem('mm_unlocked');
    setIsUnlocked(false);
  };

  // Modals & UI overlays
  const [selectedMemoryModal, setSelectedMemoryModal] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isKeepsakeBookOpen, setIsKeepsakeBookOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Subscribe to audio player
  useEffect(() => {
    const unsubscribe = ambientPlayer.subscribe((state) => {
      setAudioState(state);
    });
    return () => unsubscribe();
  }, []);

  // Persist Couple Profile
  useEffect(() => {
    localStorage.setItem('mm_couple_profile_v2', JSON.stringify(coupleProfile));
  }, [coupleProfile]);

  // Persist Memories
  useEffect(() => {
    localStorage.setItem('mm_memories', JSON.stringify(memories));
  }, [memories]);

  // Persist Vows
  useEffect(() => {
    localStorage.setItem('mm_vows', JSON.stringify(vows));
  }, [vows]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const togglePlayAudio = () => {
    if (coupleProfile.songUrl && coupleProfile.songUrl.includes('audiomack.com')) {
      setIsAudioPlayerOpen((prev) => !prev);
      return;
    }
    ambientPlayer.toggle();
  };

  const addMemory = (newMemory) => {
    setMemories((prev) => [newMemory, ...prev]);
    showToast("Memory sealed & archived forever ✦");
    ambientPlayer.playChime();
  };

  const updateMemory = (id, updates) => {
    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  };

  const deleteMemory = (id) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
    showToast("Memory gently removed from archives.");
  };

  const toggleFavorite = (id) => {
    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isFavorite: !m.isFavorite } : m))
    );
  };

  const addVow = (newVow) => {
    setVows((prev) => [...prev, newVow]);
    showToast("Sacred vow sealed into the vault ✦");
  };

  const deleteVow = (index) => {
    setVows((prev) => prev.filter((_, idx) => idx !== index));
    showToast("Vow removed from vault.");
  };

  const clearAllData = () => {
    setMemories([]);
    setVows([]);
    localStorage.removeItem('mm_memories');
    localStorage.removeItem('mm_vows');
    showToast("Archives cleared. Ready for your memories.");
  };

  // Real-time Countdown & Milestone Calculations
  const [timeStats, setTimeStats] = useState({
    daysTogether: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    nextAnniversaryFormatted: '',
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const startDate = new Date(coupleProfile.anniversaryDate);

      // Days together
      const diffMsTogether = now - startDate;
      const daysTogether = Math.max(0, Math.floor(diffMsTogether / (1000 * 60 * 60 * 24)));

      // Next anniversary
      let nextAnniv = new Date(now.getFullYear(), startDate.getMonth(), startDate.getDate());
      if (now > nextAnniv) {
        nextAnniv = new Date(now.getFullYear() + 1, startDate.getMonth(), startDate.getDate());
      }

      const diffMs = nextAnniv - now;
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
      const seconds = Math.floor((diffMs / 1000) % 60);

      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const nextFormatted = `${months[nextAnniv.getMonth()]} ${nextAnniv.getDate()}, ${nextAnniv.getFullYear()}`;

      setTimeStats({
        daysTogether,
        days,
        hours,
        minutes,
        seconds,
        nextAnniversaryFormatted: nextFormatted,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [coupleProfile.anniversaryDate]);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        coupleProfile,
        setCoupleProfile,
        memories,
        addMemory,
        updateMemory,
        deleteMemory,
        toggleFavorite,
        vows,
        addVow,
        deleteVow,
        clearAllData,
        isAudioPlayerOpen,
        setIsAudioPlayerOpen,
        audioState,
        togglePlayAudio,
        selectedMemoryModal,
        setSelectedMemoryModal,
        isSettingsOpen,
        setIsSettingsOpen,
        isKeepsakeBookOpen,
        setIsKeepsakeBookOpen,
        isInstallModalOpen,
        setIsInstallModalOpen,
        isUnlocked,
        unlockApp,
        lockApp,
        toastMessage,
        showToast,
        timeStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
