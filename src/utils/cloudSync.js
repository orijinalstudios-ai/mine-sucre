/**
 * Ultra-Lightweight Couple Cloud Sync Utility (0 KB external dependencies)
 * 
 * Auto-connected to live cloud database for Mine & Sucre.
 * Syncs automatically between both phones in real-time.
 */

const API_ENDPOINT = '/api/sync';
const VAULT_KEY = 'couple_vault_mine_and_sucre';

// Pre-connected live cloud database for Mine & Sucre
const LIVE_UPSTASH_URL = 'https://shining-monarch-216455.upstash.io';
const LIVE_UPSTASH_TOKEN = 'gQAAAAAAA02HAQIgcDE2MTBkMzU2YTNjODU0ZjNhODQ3NTA2YjY0NjJjMWRkNQ';

export function getCustomUpstash() {
  const url = localStorage.getItem('mm_upstash_url') || LIVE_UPSTASH_URL;
  const token = localStorage.getItem('mm_upstash_token') || LIVE_UPSTASH_TOKEN;
  if (url && token) return { url: url.trim(), token: token.trim() };
  return null;
}

export function saveCustomUpstash(url, token) {
  if (url && token) {
    localStorage.setItem('mm_upstash_url', url.trim());
    localStorage.setItem('mm_upstash_token', token.trim());
  } else {
    localStorage.removeItem('mm_upstash_url');
    localStorage.removeItem('mm_upstash_token');
  }
}

/**
 * Fetch shared memories, vows, and profile from cloud
 */
export async function fetchCloudVault() {
  const custom = getCustomUpstash();

  // Try direct Upstash cloud REST endpoint
  if (custom) {
    try {
      const res = await fetch(`${custom.url}/get/${VAULT_KEY}`, {
        headers: { Authorization: `Bearer ${custom.token}` },
      });
      if (res.ok) {
        const json = await res.json();
        let data = json.result;
        while (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (e) {
            break;
          }
        }
        return { configured: true, data: data || null };
      }
    } catch (err) {
      console.warn('Direct Upstash fetch fallback to /api/sync:', err);
    }
  }

  // Fallback to /api/sync on Vercel
  try {
    const res = await fetch(API_ENDPOINT, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
    return { configured: true, data: null };
  } catch (err) {
    return { configured: true, error: err.message };
  }
}

/**
 * Save current memories, vows, and profile to cloud
 */
export async function saveCloudVault({ memories, vows, coupleProfile, updatedAt }) {
  const timestamp = updatedAt || new Date().toISOString();
  const payload = {
    memories,
    vows,
    coupleProfile,
    updatedAt: timestamp,
  };

  const custom = getCustomUpstash();

  // Save directly to live Upstash cloud endpoint
  if (custom) {
    try {
      const res = await fetch(`${custom.url}/set/${VAULT_KEY}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${custom.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        return { success: true, savedAt: timestamp };
      }
    } catch (err) {
      console.warn('Direct Upstash save fallback to /api/sync:', err);
    }
  }

  // Backup write to /api/sync
  try {
    const res = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      return await res.json();
    }
    return { success: false };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Generate a 1-tap Partner Sync Link that can be sent over WhatsApp / iMessage.
 * Allows instant synchronization even offline or without internet database!
 */
export function generatePartnerSyncPayload({ memories, vows, coupleProfile }) {
  try {
    const minimalData = {
      p: coupleProfile,
      m: memories,
      v: vows,
      t: Date.now(),
    };
    const json = JSON.stringify(minimalData);
    const encoded = btoa(encodeURIComponent(json));
    return encoded;
  } catch (err) {
    console.warn('Failed to encode sync payload:', err);
    return null;
  }
}

/**
 * Parse and unpack partner sync payload from link or code
 */
export function unpackPartnerSyncPayload(encoded) {
  try {
    if (!encoded) return null;
    const json = decodeURIComponent(atob(encoded));
    const parsed = JSON.parse(json);
    if (!parsed || !parsed.m) return null;
    return {
      memories: parsed.m || [],
      vows: parsed.v || [],
      coupleProfile: parsed.p || null,
      timestamp: parsed.t,
    };
  } catch (err) {
    console.warn('Failed to decode sync payload:', err);
    return null;
  }
}
