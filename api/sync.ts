// Vercel Serverless Function handler for /api/sync
// Bridges and synchronizes data with Google AI Studio and clients worldwide

const PRIMARY_SYNC_SERVER =
  process.env.SYNC_SERVER_URL ||
  process.env.VITE_SYNC_SERVER_URL ||
  'https://ais-pre-pqb7wjikhn6zb3kusrduly-622384418458.asia-east1.run.app';

let inMemoryDb: any = null;

export default async function handler(req: any, res: any) {
  // CORS Headers for seamless cross-origin requests
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. GET: Fetch latest state from primary server or fallback memory
  if (req.method === 'GET') {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const serverRes = await fetch(`${PRIMARY_SYNC_SERVER}/api/sync`, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (serverRes.ok) {
        const json = await serverRes.json();
        if (json.success && json.data) {
          inMemoryDb = json.data;
          return res.status(200).json(json);
        }
      }
    } catch (err) {
      // Primary server asleep or unreachable, continue to cached state
    }

    return res.status(200).json({
      success: true,
      data: inMemoryDb,
      timestamp: inMemoryDb?.updatedAt || new Date().toISOString(),
      source: 'vercel-cached-bridge',
    });
  }

  // 2. POST: Update state and propagate to primary server
  if (req.method === 'POST') {
    const { type, payload, data } = req.body || {};
    if (!inMemoryDb) {
      inMemoryDb = {};
    }

    if (type && payload !== undefined) {
      inMemoryDb[type] = payload;
      inMemoryDb.updatedAt = new Date().toISOString();
    } else if (data) {
      inMemoryDb = { ...inMemoryDb, ...data, updatedAt: new Date().toISOString() };
    }

    // Forward to primary Google AI Studio server
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const forwardRes = await fetch(`${PRIMARY_SYNC_SERVER}/api/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (forwardRes.ok) {
        const result = await forwardRes.json();
        return res.status(200).json(result);
      }
    } catch (err) {
      // Forwarding failed or timed out, acknowledge cached write
    }

    return res.status(200).json({
      success: true,
      timestamp: inMemoryDb.updatedAt,
      source: 'vercel-cached-bridge',
    });
  }

  return res.status(405).json({ success: false, message: 'Method Not Allowed' });
}
