import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialCoupleProfile, initialMemories, initialVows } from '../data/seedData';
import { ambientPlayer, getAudioEmbedUrl } from '../utils/audioPlayer';
import {
  fetchCloudVault,
  saveCloudVault,
  generatePartnerSyncPayload,
  unpackPartnerSyncPayload,
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

  // Lightweight Cloud Sync State
  const [isCloudConfigured, setIsCloudConfigured] = useState(false);

  // 1. Check for Partner Sync Link in URL Hash (#sync=...) on mount
  useEffect(() => {
    try {
      const hash = window.location.hash;
      if (hash && hash.includes('sync=')) {
        const payload = hash.split('sync=')[1];
        const unpacked = unpackPartnerSyncPayload(payload);
        if (unpacked) {
          if (unpacked.memories && unpacked.memories.length > 0) {
            setMemories(unpacked.memories);
            localStorage.setItem('mm_memories', JSON.stringify(unpacked.memories));
          }
          if (unpacked.vows && unpacked.vows.length > 0) {
            setVows(unpacked.vows);
            localStorage.setItem('mm_vows', JSON.stringify(unpacked.vows));
          }
          if (unpacked.coupleProfile) {
            setCoupleProfile((prev) => ({ ...prev, ...unpacked.coupleProfile }));
            localStorage.setItem('mm_couple_profile_v2', JSON.stringify(unpacked.coupleProfile));
          }
          window.history.replaceState(null, '', window.location.pathname);
          showToast('✦ Sacred memories synced from partner!');
        }
      }
    } catch (err) {
      console.warn('Hash sync error:', err);
    }
  }, []);

  // 2. Poll/Check Vercel KV via /api/sync on load
  useEffect(() => {
    fetchCloudVault().then((res) => {
      if (res && res.configured) {
        setIsCloudConfigured(true);
        if (res.data) {
          if (res.data.memories && res.data.memories.length > 0) {
            setMemories(res.data.memories);
            localStorage.setItem('mm_memories', JSON.stringify(res.data.memories));
          }
          if (res.data.vows && res.data.vows.length > 0) {
            setVows(res.data.vows);
            localStorage.setItem('mm_vows', JSON.stringify(res.data.vows));
          }
          if (res.data.coupleProfile) {
            setCoupleProfile(res.data.coupleProfile);
            localStorage.setItem('mm_couple_profile_v2', JSON.stringify(res.data.coupleProfile));
          }
        }
      }
    });
  }, []);

  // Helper to sync local state to cloud vault
  const syncAllLocalToCloud = async () => {
    showToast('✦ Syncing sanctuary to cloud...');
    const res = await saveCloudVault({ memories, vows, coupleProfile });
    if (res && res.success) {
      setIsCloudConfigured(true);
      showToast("✦ Sanctuary synced! Both phones now share memories.");
    } else if (res && !res.configured) {
      showToast('✦ In Vercel, connect Storage > KV for auto-sync.');
    } else {
      showToast('✦ Could not reach cloud vault.');
    }
  };

  // Helper to generate a 1-tap partner sync link to share via WhatsApp / SMS
  const generateSyncLink = () => {
    const payload = generatePartnerSyncPayload({ memories, vows, coupleProfile });
    if (!payload) {
      showToast('Unable to generate sync link');
      return null;
    }
    const url = `${window.location.origin}${window.location.pathname}#sync=${payload}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        showToast('✦ Partner sync link copied! Send to Sucre.');
      }).catch(() => {
        showToast('Link generated! Copy it from Settings.');
      });
    }
    return url;
  };

  const importSyncData = (encoded) => {
    const unpacked = unpackPartnerSyncPayload(encoded);
    if (unpacked) {
      if (unpacked.memories && unpacked.memories.length > 0) {
        setMemories(unpacked.memories);
        localStorage.setItem('mm_memories', JSON.stringify(unpacked.memories));
      }
      if (unpacked.vows && unpacked.vows.length > 0) {
        setVows(unpacked.vows);
        localStorage.setItem('mm_vows', JSON.stringify(unpacked.vows));
      }
      if (unpacked.coupleProfile) {
        setCoupleProfile((prev) => ({ ...prev, ...unpacked.coupleProfile }));
        localStorage.setItem('mm_couple_profile_v2', JSON.stringify(unpacked.coupleProfile));
      }
      showToast('✦ Memories imported successfully!');
      return true;
    } else {
      showToast('Invalid sync code.');
      return false;
    }
  };

  const addMemory = (newMemory) => {
    setMemories((prev) => {
      const updated = [newMemory, ...prev];
      if (isCloudConfigured) {
        saveCloudVault({ memories: updated, vows, coupleProfile });
      }
      return updated;
    });
    showToast("Memory sealed & archived forever ✦");
    ambientPlayer.playChime();
  };

  const updateMemory = (id, updates) => {
    setMemories((prev) => {
      const updated = prev.map((m) => (m.id === id ? { ...m, ...updates } : m));
      if (isCloudConfigured) {
        saveCloudVault({ memories: updated, vows, coupleProfile });
      }
      return updated;
    });
  };

  const deleteMemory = (id) => {
    setMemories((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      if (isCloudConfigured) {
        saveCloudVault({ memories: updated, vows, coupleProfile });
      }
      return updated;
    });
    showToast("Memory gently removed from archives.");
  };

  const toggleFavorite = (id) => {
    setMemories((prev) => {
      const updated = prev.map((m) => (m.id === id ? { ...m, isFavorite: !m.isFavorite } : m));
      if (isCloudConfigured) {
        saveCloudVault({ memories: updated, vows, coupleProfile });
      }
      return updated;
    });
  };

  const addVow = (newVow) => {
    setVows((prev) => {
      const updated = [...prev, newVow];
      if (isCloudConfigured) {
        saveCloudVault({ memories, vows: updated, coupleProfile });
      }
      return updated;
    });
    showToast("Sacred vow sealed into the vault ✦");
  };

  const deleteVow = (indexOrId) => {
    setVows((prev) => {
      const updated = typeof indexOrId === 'string'
        ? prev.filter((v) => v.id !== indexOrId)
        : prev.filter((_, idx) => idx !== indexOrId);
      if (isCloudConfigured) {
        saveCloudVault({ memories, vows: updated, coupleProfile });
      }
      return updated;
    });
    showToast("Vow removed from vault.");
  };

  const updateCoupleProfile = (newProfile) => {
    setCoupleProfile(newProfile);
    if (isCloudConfigured) {
      saveCloudVault({ memories, vows, coupleProfile: newProfile });
    }
  };

  const clearAllData = () => {
    setMemories([]);
    setVows([]);
    localStorage.removeItem('mm_memories');
    localStorage.removeItem('mm_vows');
    if (isCloudConfigured) {
      saveCloudVault({ memories: [], vows: [], coupleProfile });
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
        isCloudConfigured,
        syncAllLocalToCloud,
        generateSyncLink,
        importSyncData,
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
