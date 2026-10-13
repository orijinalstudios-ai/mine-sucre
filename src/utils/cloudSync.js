/**
 * Ultra-Lightweight Couple Cloud Sync Utility (0 KB external dependencies)
 * 
 * Auto-connected to live cloud database for Mine & Sucre.
 * Syncs automatically between both phones and computers in real-time.
 */

export const PROD_API_ENDPOINT = 'https://mine-and-sucre.vercel.app/api/sync';

/**
 * Determine the best endpoint URL to reach the cloud sync API:
 * - If running on production (mine-and-sucre.vercel.app), use relative '/api/sync'
 * - If running locally (localhost / 127.0.0.1 / local Wi-Fi IP) or in standalone PWA,
 *   use the production absolute URL 'https://mine-and-sucre.vercel.app/api/sync'
 *   (which allows cross-origin requests with Access-Control-Allow-Origin: *)
 */
export function getSyncEndpoint() {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'mine-and-sucre.vercel.app') {
      return '/api/sync';
    }
  }
  return PROD_API_ENDPOINT;
}

/**
 * Helper to fetch with a timeout
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = 12000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetch shared memories, vows, and profile from cloud
 */
export async function fetchCloudVault() {
  const endpoint = getSyncEndpoint();

  try {
    const res = await fetchWithTimeout(endpoint, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    }, 12000);

    if (res.ok) {
      const data = await res.json();
      return data;
    }
    return { configured: true, data: null, error: `HTTP ${res.status}` };
  } catch (err) {
    // If relative endpoint failed, retry once with the absolute production URL
    if (endpoint !== PROD_API_ENDPOINT) {
      try {
        const retryRes = await fetchWithTimeout(PROD_API_ENDPOINT, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        }, 12000);
        if (retryRes.ok) {
          return await retryRes.json();
        }
      } catch (retryErr) {
        return { configured: true, error: retryErr.message };
      }
    }
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

  const endpoint = getSyncEndpoint();

  try {
    const res = await fetchWithTimeout(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }, 15000);

    if (res.ok) {
      const json = await res.json();
      return { success: true, savedAt: timestamp, ...json };
    }
    return { success: false, error: `HTTP ${res.status}` };
  } catch (err) {
    // Fallback retry with absolute production URL if relative endpoint failed
    if (endpoint !== PROD_API_ENDPOINT) {
      try {
        const retryRes = await fetchWithTimeout(PROD_API_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }, 15000);
        if (retryRes.ok) {
          const json = await retryRes.json();
          return { success: true, savedAt: timestamp, ...json };
        }
      } catch (retryErr) {
        return { success: false, error: retryErr.message };
      }
    }
    return { success: false, error: err.message };
  }
}
