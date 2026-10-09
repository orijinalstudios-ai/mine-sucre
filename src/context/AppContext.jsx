import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialCoupleProfile, initialMemories, initialVows } from '../data/seedData';
import { ambientPlayer, getAudioEmbedUrl } from '../utils/audioPlayer';
import {
  fetchCloudVault,
  saveCloudVault,
} from '../utils/cloudSync';

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

  // Lightweight Cloud Sync State (Pre-connected to live cloud database)
  const [isCloudConfigured, setIsCloudConfigured] = useState(true);

  // Auto-pull shared memories from live cloud database
  const pullFromCloud = async (silent = true) => {
    try {
      const res = await fetchCloudVault();
      if (res && res.data) {
        const cloudData = res.data;
        const cloudUpdatedAt = cloudData.updatedAt;
        const localUpdatedAt = localStorage.getItem('mm_vault_updated_at');

        // Apply if no local record, or cloud is newer/equal
        const shouldApply =
          !localUpdatedAt ||
          !cloudUpdatedAt ||
          cloudUpdatedAt >= localUpdatedAt;

        if (shouldApply) {
          if (Array.isArray(cloudData.memories)) {
            setMemories(cloudData.memories);
            localStorage.setItem('mm_memories', JSON.stringify(cloudData.memories));
          }
          if (Array.isArray(cloudData.vows)) {
            setVows(cloudData.vows);
            localStorage.setItem('mm_vows', JSON.stringify(cloudData.vows));
          }
          if (cloudData.coupleProfile && typeof cloudData.coupleProfile === 'object') {
            setCoupleProfile((prev) => ({ ...prev, ...cloudData.coupleProfile }));
            localStorage.setItem('mm_couple_profile_v2', JSON.stringify(cloudData.coupleProfile));
          }
          if (cloudUpdatedAt) {
            localStorage.setItem('mm_vault_updated_at', cloudUpdatedAt);
          }
          if (!silent) {
            showToast('✦ Sanctuary synced with partner in real-time!');
          }
        } else if (!silent) {
          showToast('✦ Sanctuary is up to date!');
        }
      }
    } catch (err) {
      console.warn('Auto-sync notice:', err);
    }
  };

  // Continuous Auto-Sync: on mount, on phone wake/focus, and every 10 seconds while active
  useEffect(() => {
    // Initial fetch on mount
    pullFromCloud(true);

    // Sync whenever phone is unlocked, tab switched, or app focused
    const handleFocus = () => pullFromCloud(true);
    window.addEventListener('focus', handleFocus);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') pullFromCloud(true);
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Live continuous polling while tab is active
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        pullFromCloud(true);
      }
    }, 10000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(interval);
    };
  }, []);

  const addMemory = async (newMemory) => {
    const now = new Date().toISOString();
    localStorage.setItem('mm_vault_updated_at', now);

    // Optimistically update local state immediately
    setMemories((prev) => [newMemory, ...prev]);
    showToast("Memory sealed & archived forever ✦");
    ambientPlayer.playChime();

    try {
      // Fetch latest cloud memories to merge seamlessly without overwriting partner
      const cloudRes = await fetchCloudVault();
      let merged = [newMemory, ...memories];
      let currentVows = vows;
      let currentProfile = coupleProfile;

      if (cloudRes && cloudRes.data) {
        if (Array.isArray(cloudRes.data.memories)) {
          const knownIds = new Set(merged.map((m) => m.id));
          const partnerMemories = cloudRes.data.memories.filter((m) => !knownIds.has(m.id));
          merged = [...merged, ...partnerMemories];
        }
        if (Array.isArray(cloudRes.data.vows)) {
          currentVows = cloudRes.data.vows;
        }
        if (cloudRes.data.coupleProfile) {
          currentProfile = { ...coupleProfile, ...cloudRes.data.coupleProfile };
        }
      }

      setMemories(merged);
      localStorage.setItem('mm_memories', JSON.stringify(merged));
      await saveCloudVault({
        memories: merged,
        vows: currentVows,
        coupleProfile: currentProfile,
        updatedAt: now,
      });
    } catch (err) {
      saveCloudVault({
        memories: [newMemory, ...memories],
        vows,
        coupleProfile,
        updatedAt: now,
      });
    }
  };

  const updateMemory = async (id, updates) => {
    const now = new Date().toISOString();
    localStorage.setItem('mm_vault_updated_at', now);

    const updated = memories.map((m) => (m.id === id ? { ...m, ...updates } : m));
    setMemories(updated);
    localStorage.setItem('mm_memories', JSON.stringify(updated));

    if (isCloudConfigured) {
      await saveCloudVault({ memories: updated, vows, coupleProfile, updatedAt: now });
    }
  };

  const deleteMemory = async (id) => {
    const now = new Date().toISOString();
    localStorage.setItem('mm_vault_updated_at', now);

    const updated = memories.filter((m) => m.id !== id);
    setMemories(updated);
    localStorage.setItem('mm_memories', JSON.stringify(updated));
    showToast("Memory gently removed from archives.");

    if (isCloudConfigured) {
      await saveCloudVault({ memories: updated, vows, coupleProfile, updatedAt: now });
    }
  };

  const toggleFavorite = async (id) => {
    const now = new Date().toISOString();
    localStorage.setItem('mm_vault_updated_at', now);

    const updated = memories.map((m) => (m.id === id ? { ...m, isFavorite: !m.isFavorite } : m));
    setMemories(updated);
    localStorage.setItem('mm_memories', JSON.stringify(updated));

    if (isCloudConfigured) {
      await saveCloudVault({ memories: updated, vows, coupleProfile, updatedAt: now });
    }
  };

  const addVow = async (newVow) => {
    const now = new Date().toISOString();
    localStorage.setItem('mm_vault_updated_at', now);

    const updated = [...vows, newVow];
    setVows(updated);
    localStorage.setItem('mm_vows', JSON.stringify(updated));
    showToast("Sacred vow sealed into the vault ✦");

    if (isCloudConfigured) {
      await saveCloudVault({ memories, vows: updated, coupleProfile, updatedAt: now });
    }
  };

  const deleteVow = async (indexOrId) => {
    const now = new Date().toISOString();
    localStorage.setItem('mm_vault_updated_at', now);

    const updated = typeof indexOrId === 'string'
      ? vows.filter((v) => v.id !== indexOrId)
      : vows.filter((_, idx) => idx !== indexOrId);
    setVows(updated);
    localStorage.setItem('mm_vows', JSON.stringify(updated));
    showToast("Vow removed from vault.");

    if (isCloudConfigured) {
      await saveCloudVault({ memories, vows: updated, coupleProfile, updatedAt: now });
    }
  };

  const updateCoupleProfile = async (newProfile) => {
    const now = new Date().toISOString();
    localStorage.setItem('mm_vault_updated_at', now);

    setCoupleProfile(newProfile);
    localStorage.setItem('mm_couple_profile_v2', JSON.stringify(newProfile));

    if (isCloudConfigured) {
      await saveCloudVault({ memories, vows, coupleProfile: newProfile, updatedAt: now });
    }
  };

  const clearAllData = async () => {
    const now = new Date().toISOString();
    localStorage.setItem('mm_vault_updated_at', now);

    setMemories([]);
    setVows([]);
    localStorage.removeItem('mm_memories');
    localStorage.removeItem('mm_vows');

    if (isCloudConfigured) {
      await saveCloudVault({ memories: [], vows: [], coupleProfile, updatedAt: now });
    }
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

      // Safely parse anniversary YYYY-MM-DD into year, month, day components
      const rawDate = coupleProfile.anniversaryDate || '2025-03-27';
      const parts = rawDate.split('-').map(Number);
      const startYear = parts[0] || 2025;
      const startMonth = parts[1] || 3; // 1-indexed (March = 3)
      const startDay = parts[2] || 27;

      // 1. Days Together: calculated by comparing local calendar midnights
      // This guarantees that the counter increments automatically the moment a new day begins (12:00:00 AM midnight)
      const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const startMidnight = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0);
      const diffMsCalendar = todayMidnight.getTime() - startMidnight.getTime();
      const daysTogether = Math.max(0, Math.round(diffMsCalendar / (1000 * 60 * 60 * 24)));

      // 2. Next Anniversary Countdown (exact time remaining until midnight of next anniversary)
      let nextAnniv = new Date(now.getFullYear(), startMonth - 1, startDay, 0, 0, 0, 0);
      if (now.getTime() >= nextAnniv.getTime()) {
        nextAnniv = new Date(now.getFullYear() + 1, startMonth - 1, startDay, 0, 0, 0, 0);
      }

      const diffMs = Math.max(0, nextAnniv.getTime() - now.getTime());
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
      const seconds = Math.floor((diffMs / 1000) % 60);

      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
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

    // 1-second live interval to update countdown and increment day count at midnight in real time
    const interval = setInterval(calculateTime, 1000);

    // Also recalculate immediately whenever phone is unlocked, tab switched, or app focused
    const handleFocus = () => calculateTime();
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
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
        isCloudConfigured,
        updateCoupleProfile,
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
