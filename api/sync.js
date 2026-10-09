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

  // Detect Vercel KV or Upstash Redis credentials from environment
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  const vaultKey = 'couple_vault_mine_and_sucre';

  // GET: Fetch shared memories, vows, and profile from cloud
  if (req.method === 'GET') {
    if (!kvUrl || !kvToken) {
      return res.status(200).json({
        configured: false,
        message: 'Vercel KV not enabled yet. In Vercel, go to Storage > Create KV to enable auto-sync.',
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
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {
          // ignore
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
        message: 'Vercel KV not enabled yet. In Vercel, go to Storage > Create KV to enable auto-sync.',
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
