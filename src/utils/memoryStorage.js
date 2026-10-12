/**
 * Permanent IndexedDB Storage Layer for Couple Memories
 * 
 * Protects memories against browser localStorage quota limits (5MB)
 * and ensures photos, letters, and voice memos are permanently preserved offline.
 */

const DB_NAME = 'MeAndMineVault_Memories';
const DB_VERSION = 1;
const STORE_NAME = 'memories';
const META_STORE = 'meta';

function openMemoriesDB() {
  return new Promise((resolve) => {
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
        if (!db.objectStoreNames.contains(META_STORE)) {
          db.createObjectStore(META_STORE);
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.warn('IndexedDB unavailable for memories, continuing with localStorage fallback');
        resolve(null);
      };
    } catch (err) {
      console.warn('Error opening memories IndexedDB:', err);
      resolve(null);
    }
  });
}

/**
 * Persist entire array of memories into IndexedDB
 */
export async function saveMemoriesToIDB(memories) {
  if (!Array.isArray(memories)) return;
  const db = await openMemoriesDB();
  if (!db) return;

  try {
    const tx = db.transaction([STORE_NAME], 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    // Clear old items and write current list
    await new Promise((resolve, reject) => {
      const clearReq = store.clear();
      clearReq.onsuccess = resolve;
      clearReq.onerror = reject;
    });

    for (const mem of memories) {
      if (mem && mem.id) {
        store.put(mem);
      }
    }

    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = reject;
    });
  } catch (err) {
    console.warn('Non-fatal error saving memories to IndexedDB:', err);
  }
}

/**
 * Load all memories stored in IndexedDB
 */
export async function loadMemoriesFromIDB() {
  const db = await openMemoriesDB();
  if (!db) return [];

  return new Promise((resolve) => {
    try {
      const tx = db.transaction([STORE_NAME], 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const result = req.result;
        resolve(Array.isArray(result) ? result : []);
      };

      req.onerror = () => {
        console.warn('Could not read memories from IndexedDB');
        resolve([]);
      };
    } catch (err) {
      console.warn('Error querying IndexedDB memories:', err);
      resolve([]);
    }
  });
}

/**
 * Persist single memory immediately (fail-safe instant save)
 */
export async function appendMemoryToIDB(memory) {
  if (!memory || !memory.id) return;
  const db = await openMemoriesDB();
  if (!db) return;

  try {
    const tx = db.transaction([STORE_NAME], 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(memory);
  } catch (err) {
    console.warn('Error appending memory to IndexedDB:', err);
  }
}

/**
 * Track deleted memory IDs to prevent cloud auto-sync from resurrecting deleted memories
 */
export function getDeletedMemoryIds() {
  try {
    const raw = localStorage.getItem('mm_deleted_memory_ids');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch (e) {
    // ignore
  }
  return new Set();
}

export function recordDeletedMemoryId(id) {
  try {
    const current = getDeletedMemoryIds();
    current.add(id);
    localStorage.setItem('mm_deleted_memory_ids', JSON.stringify(Array.from(current)));
  } catch (e) {
    // ignore
  }
}
