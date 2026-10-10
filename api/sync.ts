// Vercel Serverless Function handler for /api/sync
// Allows Vercel deployments to respond to /api/sync requests seamlessly

let inMemoryDb: any = null;

export default async function handler(req: any, res: any) {
  // Enable CORS for cross-origin testing if needed
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

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      data: inMemoryDb,
      timestamp: inMemoryDb?.updatedAt || new Date().toISOString(),
    });
  }

  if (req.method === 'POST') {
    const { type, payload, data } = req.body || {};
    if (!inMemoryDb) {
      inMemoryDb = {};
    }

    if (type && payload !== undefined) {
      inMemoryDb[type] = payload;
      inMemoryDb.updatedAt = new Date().toISOString();
      return res.status(200).json({ success: true, timestamp: inMemoryDb.updatedAt });
    }

    if (data) {
      inMemoryDb = { ...inMemoryDb, ...data, updatedAt: new Date().toISOString() };
      return res.status(200).json({ success: true, timestamp: inMemoryDb.updatedAt });
    }

    return res.status(400).json({ success: false, message: 'Invalid payload' });
  }

  return res.status(405).json({ success: false, message: 'Method Not Allowed' });
}
