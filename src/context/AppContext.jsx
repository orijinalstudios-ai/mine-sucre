import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { initialCoupleProfile, initialMemories, initialVows } from '../data/seedData';
import { ambientPlayer, getAudioEmbedUrl, resolveSongInfo } from '../utils/audioPlayer';
import {
  fetchCloudVault,
  saveCloudVault,
} from '../utils/cloudSync';
import {
  saveMemoriesToIDB,
  loadMemoriesFromIDB,
  appendMemoryToIDB,
  getDeletedMemoryIds,
  recordDeletedMemoryId,
} from '../utils/memoryStorage';

export function safeLocalStorageSet(key, value) {
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, stringValue);
    return true;
  } catch (err) {
    console.warn(`[Vault Storage] Non-fatal localStorage quota warning for "${key}":`, err);
    return false;
  }
}

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
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.anniversaryDate === '2025-03-27') {
          parsed.anniversaryDate = '2025-04-27';
        }
        // Auto-heal missing anthem fields and migrate dead Spotify 404 URL
        const healed = {
          ...initialCoupleProfile,
          ...parsed,
          anthemTitle: (parsed.anthemTitle && parsed.anthemTitle.trim()) || initialCoupleProfile.anthemTitle,
          anthemArtist: (parsed.anthemArtist && parsed.anthemArtist.trim()) || initialCoupleProfile.anthemArtist,
          anthemDuration: (parsed.anthemDuration && parsed.anthemDuration.trim()) || initialCoupleProfile.anthemDuration,
          songUrl: (!parsed.songUrl || parsed.songUrl.includes('1a2R0g4f08rY2k26t1vY3g'))
            ? initialCoupleProfile.songUrl
            : parsed.songUrl.trim(),
        };
        safeLocalStorageSet('mm_couple_profile_v2', healed);
        return healed;
      } catch (e) {
        return initialCoupleProfile;
      }
    }
    return initialCoupleProfile;
  });

  // Memories (100% clean, resilient against storage quota crashes)
  const [memories, setMemories] = useState(() => {
    try {
      const isCleaned = localStorage.getItem('mm_clean_state_v1');
      if (!isCleaned) return [];
      const saved = localStorage.getItem('mm_memories');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Strip out any oversized legacy Base64 strings to permanently relieve localStorage quota
        let cleaned = false;
        const sanitized = parsed.map((m) => {
          if (m && m.songUrl && typeof m.songUrl === 'string' && m.songUrl.startsWith('data:audio/') && m.songUrl.length > 50000) {
            cleaned = true;
            return { ...m, songUrl: null };
          }
          return m;
        });
        if (cleaned) {
          safeLocalStorageSet('mm_memories', sanitized);
        }
        return sanitized;
      }
      return [];
    } catch (e) {
      console.warn('Error reading memories from localStorage:', e);
      return [];
    }
  });

  // Vows
  const [vows, setVows] = useState(() => {
    try {
      const isCleaned = localStorage.getItem('mm_clean_state_v1');
      if (!isCleaned) return [];
      const saved = localStorage.getItem('mm_vows');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
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
  const [editingMemory, setEditingMemory] = useState(null);
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
    safeLocalStorageSet('mm_couple_profile_v2', coupleProfile);
  }, [coupleProfile]);

  // Memories reference for race-condition-free async operations
  const memoriesRef = useRef(memories);
  useEffect(() => {
    memoriesRef.current = memories;
  }, [memories]);

  // Dual-layer hydration: restore any memories preserved in IndexedDB
  useEffect(() => {
    let isMounted = true;
    async function hydrateIDB() {
      try {
        const idbMemories = await loadMemoriesFromIDB();
        if (isMounted && Array.isArray(idbMemories) && idbMemories.length > 0) {
          setMemories((current) => {
            const existingIds = new Set(current.map((m) => m.id));
            const missing = idbMemories.filter((m) => !existingIds.has(m.id));
            if (missing.length > 0) {
              const combined = [...current, ...missing];
              safeLocalStorageSet('mm_memories', combined);
              return combined;
            }
            return current;
          });
        }
      } catch (err) {
        console.warn('Non-fatal IDB memories hydration:', err);
      }
    }
    hydrateIDB();
    return () => {
      isMounted = false;
    };
  }, []);

  // Persist Memories safely to both localStorage and IndexedDB
  useEffect(() => {
    safeLocalStorageSet('mm_memories', memories);
    saveMemoriesToIDB(memories);
  }, [memories]);

  // Persist Vows safely
  useEffect(() => {
    safeLocalStorageSet('mm_vows', vows);
  }, [vows]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Track playing state (Can play either couple anthem or memory specific song)
  const [activeTrack, setActiveTrack] = useState(() => ({
    title: coupleProfile?.anthemTitle || 'Baby Riddim',
    artist: coupleProfile?.anthemArtist || 'Fave',
    url: coupleProfile?.songUrl || 'https://audiomack.com/favourish/song/baby-riddim',
    isAnthem: true,
  }));

  const playAnthem = () => {
    setActiveTrack({
      title: coupleProfile?.anthemTitle || 'Baby Riddim',
      artist: coupleProfile?.anthemArtist || 'Fave',
      url: coupleProfile?.songUrl || 'https://audiomack.com/favourish/song/baby-riddim',
      isAnthem: true,
    });
    setIsAudioPlayerOpen(true);
  };

  const playMemorySong = (mem, options = {}) => {
    if (!mem) return;
    // Pass the entire mem object to resolveSongInfo so mem.songUrl is preserved
    const resolved = resolveSongInfo(mem, coupleProfile);
    setActiveTrack({
      ...resolved,
      memoryId: mem.id || null,
      memoryTitle: mem.title || '',
      onTrackUpdated: mem.onTrackUpdated || options.onTrackUpdated || null,
    });
    setIsAudioPlayerOpen(true);
  };

  const togglePlayAudio = (memOrTrack) => {
    if (memOrTrack && typeof memOrTrack === 'object' && (memOrTrack.song || memOrTrack.title)) {
      playMemorySong(memOrTrack);
      return;
    }
    playAnthem();
  };

  // Live Cloud Sync State & Diagnostics
  const [syncState, setSyncState] = useState({
    status: 'idle', // 'idle' | 'syncing' | 'synced' | 'error'
    lastSyncedAt: null,
    error: null,
  });

  const isSyncInProgressRef = useRef(false);

  /**
   * Bidirectional sync engine:
   * Reconciles local memories with the cloud vault using per-item timestamps.
   * If local has newer or unpushed memories, pushes them to the cloud.
   * If cloud has partner's memories, pulls them into local storage & state.
   */
  const syncNow = async (manual = false) => {
    if (isSyncInProgressRef.current) return;
    isSyncInProgressRef.current = true;
    setSyncState((prev) => ({ ...prev, status: 'syncing', error: null }));

    try {
      const res = await fetchCloudVault();
      if (!res) throw new Error('Could not reach cloud server');
      if (res.error) throw new Error(res.error);

      const cloudData = res.data;
      const currentMemories = memoriesRef.current || memories;
      const currentVows = vows;
      const currentProfile = coupleProfile;
      const deletedIds = getDeletedMemoryIds();

      let needsCloudPush = false;
      let mergedMemories = [...currentMemories];

      if (cloudData && Array.isArray(cloudData.memories)) {
        const memoryMap = new Map();

        // 1. Add cloud memories that haven't been locally deleted
        for (const cm of cloudData.memories) {
          if (cm && cm.id && !deletedIds.has(cm.id)) {
            memoryMap.set(cm.id, cm);
          }
        }

        // 2. Merge local memories with per-item updatedAt comparison
        for (const lm of currentMemories) {
          if (!lm || !lm.id) continue;
          if (deletedIds.has(lm.id)) continue;

          if (memoryMap.has(lm.id)) {
            const cm = memoryMap.get(lm.id);
            const lmTime = lm.updatedAt ? new Date(lm.updatedAt).getTime() : 0;
            const cmTime = cm.updatedAt ? new Date(cm.updatedAt).getTime() : 0;
            if (lmTime > cmTime) {
              // Local is strictly newer than cloud
              memoryMap.set(lm.id, lm);
              needsCloudPush = true;
            } else if (cmTime > lmTime) {
              // Cloud is strictly newer, already in map
            } else {
              // Same timestamp or fallback: merge properties safely
              memoryMap.set(lm.id, { ...cm, ...lm });
            }
          } else {
            // Memory exists locally on this device but not in cloud yet
            memoryMap.set(lm.id, lm);
            needsCloudPush = true;
          }
        }

        mergedMemories = Array.from(memoryMap.values());
      } else {
        // Cloud is empty. If this device has local memories, push them!
        if (currentMemories.length > 0) {
          needsCloudPush = true;
        }
      }

      // Check if merged memories differ from local state
      const mergedMemStr = JSON.stringify(mergedMemories);
      const localMemStr = JSON.stringify(currentMemories);
      if (mergedMemStr !== localMemStr) {
        setMemories(mergedMemories);
        safeLocalStorageSet('mm_memories', mergedMemories);
        saveMemoriesToIDB(mergedMemories);
      }

      // Merge vows
      let mergedVows = currentVows;
      if (cloudData && Array.isArray(cloudData.vows)) {
        if (cloudData.vows.length > 0 && currentVows.length === 0) {
          mergedVows = cloudData.vows;
          setVows(mergedVows);
          safeLocalStorageSet('mm_vows', mergedVows);
        } else if (currentVows.length > 0 && cloudData.vows.length === 0) {
          needsCloudPush = true;
        }
      } else if (currentVows.length > 0) {
        needsCloudPush = true;
      }

      // Merge couple profile
      let mergedProfile = currentProfile;
      if (cloudData && cloudData.coupleProfile && typeof cloudData.coupleProfile === 'object') {
        const cp = {
          ...initialCoupleProfile,
          ...currentProfile,
          ...cloudData.coupleProfile,
        };
        if (cp.anniversaryDate === '2025-03-27') cp.anniversaryDate = '2025-04-27';
        if (!cp.anthemTitle || !cp.anthemTitle.trim()) cp.anthemTitle = initialCoupleProfile.anthemTitle;
        if (!cp.anthemArtist || !cp.anthemArtist.trim()) cp.anthemArtist = initialCoupleProfile.anthemArtist;
        if (!cp.anthemDuration || !cp.anthemDuration.trim()) cp.anthemDuration = initialCoupleProfile.anthemDuration;
        if (!cp.songUrl || cp.songUrl.includes('1a2R0g4f08rY2k26t1vY3g')) {
          cp.songUrl = initialCoupleProfile.songUrl;
        }

        if (JSON.stringify(cp) !== JSON.stringify(currentProfile)) {
          mergedProfile = cp;
          setCoupleProfile(mergedProfile);
          safeLocalStorageSet('mm_couple_profile_v2', mergedProfile);
          needsCloudPush = true;
        }
      } else if (currentProfile) {
        needsCloudPush = true;
      }

      // If this device had newer memories or missing items on cloud, push now
      const nowIso = new Date().toISOString();
      if (needsCloudPush) {
        await saveCloudVault({
          memories: mergedMemories,
          vows: mergedVows,
          coupleProfile: mergedProfile,
          updatedAt: nowIso,
        });
      }

      safeLocalStorageSet('mm_vault_updated_at', nowIso);
      setSyncState({
        status: 'synced',
        lastSyncedAt: new Date(),
        error: null,
      });

      if (manual) {
        showToast('✦ Memories synced across devices in real time!');
      }
    } catch (err) {
      console.warn('Sync notice:', err.message);
      setSyncState((prev) => ({
        ...prev,
        status: 'error',
        error: err.message,
      }));
      if (manual) {
        showToast(`Sync notice: ${err.message || 'Offline'}`);
      }
    } finally {
      isSyncInProgressRef.current = false;
    }
  };

  // Continuous Auto-Sync: on mount, on phone wake/focus, and every 20 seconds while active
  useEffect(() => {
    syncNow(false);

    const handleFocus = () => syncNow(false);
    window.addEventListener('focus', handleFocus);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') syncNow(false);
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        syncNow(false);
      }
    }, 20000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(interval);
    };
  }, []);

  const addMemory = async (newMemory) => {
    const now = new Date().toISOString();
    const memoryWithTime = {
      ...newMemory,
      updatedAt: now,
    };

    // 1. Instantly append to IndexedDB (fail-safe hard storage)
    appendMemoryToIDB(memoryWithTime);

    // 2. Synchronously update local React state and localStorage
    const currentList = memoriesRef.current || memories;
    const updatedLocal = [memoryWithTime, ...currentList.filter((m) => m.id !== newMemory.id)];
    setMemories(updatedLocal);
    safeLocalStorageSet('mm_memories', updatedLocal);
    saveMemoriesToIDB(updatedLocal);

    showToast("Memory sealed & archived forever ✦");
    ambientPlayer.playChime();

    // 3. Immediately trigger cloud sync & push
    try {
      await saveCloudVault({
        memories: updatedLocal,
        vows,
        coupleProfile,
        updatedAt: now,
      });
      setSyncState({
        status: 'synced',
        lastSyncedAt: new Date(),
        error: null,
      });
    } catch (err) {
      console.warn('Error saving new memory to cloud vault:', err);
    }
  };

  const updateMemory = async (id, updates) => {
    const now = new Date().toISOString();
    const currentList = memoriesRef.current || memories;
    const updated = currentList.map((m) =>
      m.id === id ? { ...m, ...updates, updatedAt: now } : m
    );
    setMemories(updated);
    safeLocalStorageSet('mm_memories', updated);
    saveMemoriesToIDB(updated);

    if (selectedMemoryModal && selectedMemoryModal.id === id) {
      setSelectedMemoryModal((prev) => ({ ...prev, ...updates, updatedAt: now }));
    }

    showToast("Memory sealed & updated in archives ✦");

    // Immediately trigger cloud sync & push
    try {
      await saveCloudVault({
        memories: updated,
        vows,
        coupleProfile,
        updatedAt: now,
      });
      setSyncState({
        status: 'synced',
        lastSyncedAt: new Date(),
        error: null,
      });
    } catch (err) {
      console.warn('Error saving update to cloud vault:', err);
    }
  };

  const deleteMemory = async (id) => {
    recordDeletedMemoryId(id);
    const now = new Date().toISOString();
    const currentList = memoriesRef.current || memories;
    const updated = currentList.filter((m) => m.id !== id);
    setMemories(updated);
    safeLocalStorageSet('mm_memories', updated);
    saveMemoriesToIDB(updated);
    showToast("Memory gently removed from archives.");

    try {
      await saveCloudVault({
        memories: updated,
        vows,
        coupleProfile,
        updatedAt: now,
      });
      setSyncState({
        status: 'synced',
        lastSyncedAt: new Date(),
        error: null,
      });
    } catch (err) {
      console.warn('Error deleting memory from cloud vault:', err);
    }
  };

  const toggleFavorite = async (id) => {
    const now = new Date().toISOString();
    const currentList = memoriesRef.current || memories;
    const updated = currentList.map((m) =>
      m.id === id ? { ...m, isFavorite: !m.isFavorite, updatedAt: now } : m
    );
    setMemories(updated);
    safeLocalStorageSet('mm_memories', updated);
    saveMemoriesToIDB(updated);

    try {
      await saveCloudVault({
        memories: updated,
        vows,
        coupleProfile,
        updatedAt: now,
      });
      setSyncState({
        status: 'synced',
        lastSyncedAt: new Date(),
        error: null,
      });
    } catch (err) {
      console.warn('Error saving favorite to cloud vault:', err);
    }
  };

  const addVow = async (newVow) => {
    const now = new Date().toISOString();
    lastLocalWriteRef.current = Date.now();
    safeLocalStorageSet('mm_vault_updated_at', now);

    const updated = [...vows, newVow];
    setVows(updated);
    safeLocalStorageSet('mm_vows', updated);
    showToast("Sacred vow sealed into the vault ✦");

    if (isCloudConfigured) {
      await saveCloudVault({ memories, vows: updated, coupleProfile, updatedAt: now });
    }
  };

  const deleteVow = async (indexOrId) => {
    const now = new Date().toISOString();
    lastLocalWriteRef.current = Date.now();
    safeLocalStorageSet('mm_vault_updated_at', now);

    const updated = typeof indexOrId === 'string'
      ? vows.filter((v) => v.id !== indexOrId)
      : vows.filter((_, idx) => idx !== indexOrId);
    setVows(updated);
    safeLocalStorageSet('mm_vows', updated);
    showToast("Vow removed from vault.");

    if (isCloudConfigured) {
      await saveCloudVault({ memories, vows: updated, coupleProfile, updatedAt: now });
    }
  };

  const updateCoupleProfile = async (newProfile) => {
    const now = new Date().toISOString();
    lastLocalWriteRef.current = Date.now();
    safeLocalStorageSet('mm_vault_updated_at', now);

    setCoupleProfile(newProfile);
    safeLocalStorageSet('mm_couple_profile_v2', newProfile);

    if (isCloudConfigured) {
      await saveCloudVault({ memories, vows, coupleProfile: newProfile, updatedAt: now });
    }
  };

  const clearAllData = async () => {
    const now = new Date().toISOString();
    lastLocalWriteRef.current = Date.now();
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
      const rawDate = coupleProfile.anniversaryDate || '2025-04-27';
      const parts = rawDate.split('-').map(Number);
      const startYear = parts[0] || 2025;
      const startMonth = parts[1] || 4; // 1-indexed (April = 4)
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
        activeTrack,
        setActiveTrack,
        playAnthem,
        playMemorySong,
        audioState,
        togglePlayAudio,
        selectedMemoryModal,
        setSelectedMemoryModal,
        editingMemory,
        setEditingMemory,
        isSettingsOpen,
        setIsSettingsOpen,
        isKeepsakeBookOpen,
        setIsKeepsakeBookOpen,
        isInstallModalOpen,
        setIsInstallModalOpen,
        isUnlocked,
        unlockApp,
        lockApp,
        syncState,
        syncNow,
        pullFromCloud: syncNow,
        isCloudConfigured: true,
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
