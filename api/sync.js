// api/sync.js - Lightweight Vercel Serverless Endpoint for Couple Memory Sync
export default async function handler(req, res) {
  // CORS configuration for cross-origin or local dev testing
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Live Upstash Redis connection (pre-connected for Mine & Sucre)
  const kvUrl =
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    'https://shining-monarch-216455.upstash.io';
  const kvToken =
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    'gQAAAAAAA02HAQIgcDE2MTBkMzU2YTNjODU0ZjNhODQ3NTA2YjY0NjJjMWRkNQ';

  const vaultKey = 'couple_vault_mine_and_sucre';

  // GET: Fetch shared memories, vows, and profile from cloud
  if (req.method === 'GET') {
    if (!kvUrl || !kvToken) {
      return res.status(200).json({
        configured: false,
        message: 'Upstash Redis not connected yet. Connect Upstash in Vercel Marketplace or add UPSTASH_REDIS_REST_URL in Vercel Settings.',
      });
    }

    try {
      const response = await fetch(`${kvUrl}/get/${vaultKey}`, {
        headers: {
          Authorization: `Bearer ${kvToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Upstash returned status ${response.status}`);
      }

      const result = await response.json();
      let data = result.result;
      while (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {
          break;
        }
      }

      return res.status(200).json({
        configured: true,
        data: data || null,
      });
    } catch (err) {
      return res.status(500).json({
        error: 'Failed to read from cloud vault',
        details: err.message,
      });
    }
  }

  // POST: Save shared memories, vows, and profile to cloud
  if (req.method === 'POST') {
    if (!kvUrl || !kvToken) {
      return res.status(200).json({
        configured: false,
        message: 'Upstash Redis not connected yet. Connect Upstash in Vercel Marketplace or add UPSTASH_REDIS_REST_URL in Vercel Settings.',
      });
    }

    try {
      const payload = req.body;
      const stringified = typeof payload === 'string' ? payload : JSON.stringify(payload);

      const response = await fetch(`${kvUrl}/set/${vaultKey}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kvToken}`,
          'Content-Type': 'application/json',
        },
        body: stringified,
      });

      if (!response.ok) {
        throw new Error(`Upstash returned status ${response.status}`);
      }

      return res.status(200).json({
        success: true,
        savedAt: new Date().toISOString(),
      });
    } catch (err) {
      return res.status(500).json({
        error: 'Failed to write to cloud vault',
        details: err.message,
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
