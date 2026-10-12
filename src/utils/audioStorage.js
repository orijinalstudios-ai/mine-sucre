// IndexedDB Audio Storage Utility
// Allows storing high-quality audio files (MP3, WAV, M4A, etc.) locally without exceeding browser localStorage limits (5MB)

const DB_NAME = 'MeAndMineVault_Audio';
const DB_VERSION = 1;
const STORE_NAME = 'tracks';

// Memory cache fallback for browsers with restricted IndexedDB
const memoryStore = new Map();

// Active blob URLs created in this session to prevent memory leaks
const objectUrlRegistry = new Map();

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }

    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.warn('IndexedDB unavailable, falling back to memory store:', request.error);
        resolve(null);
      };
    } catch (err) {
      console.warn('Error opening IndexedDB:', err);
      resolve(null);
    }
  });
}

/**
 * Saves a binary audio File or Blob into IndexedDB
 * Returns a tiny ID string e.g. "idb:audio_1712345678_xyz" (~25 bytes)
 */
export async function saveAudioFile(fileOrBlob) {
  if (!fileOrBlob) return null;

  const id = `idb:audio_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const record = {
    id,
    blob: fileOrBlob,
    name: fileOrBlob.name || 'Keepsake Audio Track',
    type: fileOrBlob.type || 'audio/mpeg',
    size: fileOrBlob.size || 0,
    createdAt: Date.now(),
  };

  // 1. Immediately cache in memory & create Object URL for 0ms instant playback
  memoryStore.set(id, record);
  try {
    const immediateUrl = URL.createObjectURL(fileOrBlob);
    objectUrlRegistry.set(id, immediateUrl);
  } catch (err) {
    // ignore
  }

  // 2. Persist to IndexedDB
  const db = await openDB();
  if (!db) {
    return id;
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(record);

      req.onsuccess = () => resolve(id);
      req.onerror = () => {
        console.warn('IndexedDB put error, cached in memory:', req.error);
        resolve(id);
      };
    } catch (err) {
      console.warn('Transaction error, cached in memory:', err);
      resolve(id);
    }
  });
}

/**
 * Retrieves a Blob from IndexedDB given an ID
 */
export async function getAudioBlob(id) {
  if (!id || typeof id !== 'string') return null;

  if (memoryStore.has(id)) {
    return memoryStore.get(id).blob;
  }

  const db = await openDB();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);

      req.onsuccess = () => {
        if (req.result && req.result.blob) {
          resolve(req.result.blob);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    } catch (err) {
      resolve(null);
    }
  });
}

/**
 * Converts an audio identifier into a playable URL
 * - If it's an IndexedDB ID ("idb:..."), generates an Object URL from the stored Blob
 * - If it's already a web URL or Data URL, returns it directly
 */
export async function getAudioPlayableUrl(urlOrId) {
  if (!urlOrId || typeof urlOrId !== 'string') return '';

  if (urlOrId.startsWith('idb:')) {
    // 1. Check if we already created an active Object URL for this ID
    if (objectUrlRegistry.has(urlOrId)) {
      return objectUrlRegistry.get(urlOrId);
    }

    // 2. Check memory store
    if (memoryStore.has(urlOrId)) {
      const record = memoryStore.get(urlOrId);
      if (record?.blob) {
        const objectUrl = URL.createObjectURL(record.blob);
        objectUrlRegistry.set(urlOrId, objectUrl);
        return objectUrl;
      }
    }

    // 3. Query IndexedDB
    const blob = await getAudioBlob(urlOrId);
    if (blob) {
      const objectUrl = URL.createObjectURL(blob);
      objectUrlRegistry.set(urlOrId, objectUrl);
      return objectUrl;
    }
    return '';
  }

  return urlOrId;
}

/**
 * Deletes an audio track from IndexedDB
 */
export async function deleteAudioFile(id) {
  if (!id || typeof id !== 'string' || !id.startsWith('idb:')) return;

  if (objectUrlRegistry.has(id)) {
    URL.revokeObjectURL(objectUrlRegistry.get(id));
    objectUrlRegistry.delete(id);
  }

  memoryStore.delete(id);

  const db = await openDB();
  if (!db) return;

  try {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
  } catch (err) {
    console.warn('Error deleting from IndexedDB:', err);
  }
}
