/**
 * Ultra-Lightweight Couple Cloud Sync Utility (0 KB external dependencies)
 * 
 * Communicates with /api/sync on Vercel using standard browser fetch().
 * Also supports direct partner pairing links (shareable via WhatsApp/Messages).
 */

const API_ENDPOINT = '/api/sync';

/**
 * Fetch shared memories, vows, and profile from cloud
 */
export async function fetchCloudVault() {
  try {
    const res = await fetch(API_ENDPOINT, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      return { configured: false, error: `HTTP ${res.status}` };
    }

    const data = await res.json();
    return data;
  } catch (err) {
    // Network error or local dev without serverless runner
    return { configured: false, error: err.message };
  }
}

/**
 * Save current memories, vows, and profile to cloud
 */
export async function saveCloudVault({ memories, vows, coupleProfile }) {
  try {
    const payload = {
      memories,
      vows,
      coupleProfile,
      updatedAt: new Date().toISOString(),
    };

    const res = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return { success: false, error: `HTTP ${res.status}` };
    }

    const data = await res.json();
    return data;
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Generate a 1-tap Partner Sync Link that can be sent over WhatsApp / iMessage.
 * Allows instant synchronization even without any database configured!
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
    // Base64 encode safely for UTF-8
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
