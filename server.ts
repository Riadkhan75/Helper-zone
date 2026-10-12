import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { 
  INITIAL_POSTS, 
  INITIAL_STUDY_MATERIALS, 
  INITIAL_BOOKS, 
  INITIAL_LOST_FOUND, 
  INITIAL_NOTICES, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_REPORTS, 
  INITIAL_SETTINGS, 
  INITIAL_LOGS, 
  INITIAL_USERS,
  INITIAL_COMMENTS,
  INITIAL_VERIFICATION_REQUESTS,
  INITIAL_CHAT_CONVERSATIONS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_CLASS_ROUTINE,
  INITIAL_EXAMS,
  INITIAL_BOOKMARKS
} from './src/services/seedData.ts';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, getDocs, collection, onSnapshot } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Firestore cloud bridge for Node.js server
let serverDb: any = null;
try {
  const configPath = path.join(__dirname, 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const fbConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (fbConfig.apiKey && fbConfig.projectId) {
      const fbApp = getApps().length === 0 ? initializeApp(fbConfig, 'campus-server') : getApps()[0];
      serverDb = fbConfig.firestoreDatabaseId ? getFirestore(fbApp, fbConfig.firestoreDatabaseId) : getFirestore(fbApp);
      console.log('server.ts connected to Firestore cloud database:', fbConfig.firestoreDatabaseId || '(default)');
    }
  }
} catch (e) {
  console.warn('server.ts: Note: Firebase cloud bridge not active:', e);
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

app.use(express.json({ limit: '15mb' }));

// Cross-Origin Resource Sharing (CORS) for cross-deployment synchronization
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Database Structure
const initialDb = {
  settings: INITIAL_SETTINGS,
  notices: INITIAL_NOTICES,
  posts: INITIAL_POSTS,
  comments: (() => {
    const map: Record<string, any[]> = {};
    INITIAL_COMMENTS.forEach(c => {
      if (!map[c.postId]) map[c.postId] = [];
      map[c.postId].push(c);
    });
    return map;
  })(),
  studyMaterials: INITIAL_STUDY_MATERIALS,
  books: INITIAL_BOOKS,
  lostFoundItems: INITIAL_LOST_FOUND,
  notifications: INITIAL_NOTIFICATIONS,
  reports: INITIAL_REPORTS,
  activityLogs: INITIAL_LOGS,
  users: INITIAL_USERS,
  verifications: INITIAL_VERIFICATION_REQUESTS,
  chatConversations: INITIAL_CHAT_CONVERSATIONS,
  chatMessages: (() => {
    const map: Record<string, any[]> = {};
    INITIAL_CHAT_MESSAGES.forEach(m => {
      if (!map[m.conversationId]) map[m.conversationId] = [];
      map[m.conversationId].push(m);
    });
    return map;
  })(),
  routines: INITIAL_CLASS_ROUTINE,
  exams: INITIAL_EXAMS,
  bookmarks: INITIAL_BOOKMARKS,
  cgpa: [],
  updatedAt: new Date().toISOString(),
};

// In-memory cache + file sync
let currentDb = { ...initialDb };

const saveDb = () => {
  try {
    currentDb.updatedAt = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(currentDb, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save db.json:', err);
  }
};

// SSE Connected Clients Pool for Instant Realtime Broadcast across tabs and devices
const sseClients = new Set<express.Response>();

const broadcastSSE = (type: string, payload: any) => {
  const message = JSON.stringify({
    type,
    payload,
    timestamp: currentDb.updatedAt,
  });
  for (const client of sseClients) {
    try {
      client.write(`data: ${message}\n\n`);
      if (typeof (client as any).flush === 'function') {
        (client as any).flush();
      }
    } catch {
      sseClients.delete(client);
    }
  }
};

// Load database from file if available
if (fs.existsSync(DB_FILE)) {
  try {
    const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(fileContent);
    currentDb = {
      ...initialDb,
      ...parsed,
      notices: (Array.isArray(parsed.notices) && parsed.notices.length > 0) ? parsed.notices : initialDb.notices,
      posts: (Array.isArray(parsed.posts) && parsed.posts.length > 0) ? parsed.posts : initialDb.posts,
      studyMaterials: (Array.isArray(parsed.studyMaterials) && parsed.studyMaterials.length > 0) ? parsed.studyMaterials : initialDb.studyMaterials,
      books: (Array.isArray(parsed.books) && parsed.books.length > 0) ? parsed.books : initialDb.books,
      lostFoundItems: (Array.isArray(parsed.lostFoundItems) && parsed.lostFoundItems.length > 0) ? parsed.lostFoundItems : initialDb.lostFoundItems,
      users: (Array.isArray(parsed.users) && parsed.users.length > 0) ? parsed.users : initialDb.users,
      settings: parsed.settings || initialDb.settings,
      verifications: Array.isArray(parsed.verifications) ? parsed.verifications : initialDb.verifications,
      chatConversations: Array.isArray(parsed.chatConversations) ? parsed.chatConversations : initialDb.chatConversations,
      chatMessages: parsed.chatMessages || initialDb.chatMessages,
      routines: Array.isArray(parsed.routines) ? parsed.routines : initialDb.routines,
      exams: Array.isArray(parsed.exams) ? parsed.exams : initialDb.exams,
      bookmarks: parsed.bookmarks || initialDb.bookmarks,
      cgpa: Array.isArray(parsed.cgpa) ? parsed.cgpa : initialDb.cgpa,
    };
    saveDb();
    console.log('Database loaded and validated from persistent storage.');
  } catch (err) {
    console.warn('Error reading db.json, using initial dataset:', err);
  }
} else {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(currentDb, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not write initial db.json:', err);
  }
}

// Bi-directional Real-Time Firestore Synchronization Bridge
if (serverDb) {
  try {
    // 1. Initial hydration from Firestore cloud
    getDocs(collection(serverDb, 'campus_sync')).then((snap) => {
      let hydratedCount = 0;
      snap.forEach((d) => {
        const data = d.data();
        if (data && data.payload !== undefined) {
          (currentDb as any)[d.id] = data.payload;
          hydratedCount++;
        }
      });
      if (hydratedCount > 0) {
        currentDb.updatedAt = new Date().toISOString();
        saveDb();
        console.log(`server.ts successfully hydrated ${hydratedCount} collections from Firestore cloud.`);
      }
    }).catch((hErr) => {
      console.warn('server.ts Firestore hydration note:', hErr?.message || hErr);
    });

    // 2. Real-time Live Listener: Any write to Firestore anywhere instantly updates this server & broadcasts to connected browsers
    onSnapshot(collection(serverDb, 'campus_sync'), (snapshot) => {
      let changed = false;
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'removed') return;
        const id = change.doc.id;
        const data = change.doc.data();
        if (data && data.payload !== undefined) {
          const currentVal = (currentDb as any)[id];
          if (JSON.stringify(currentVal) !== JSON.stringify(data.payload)) {
            (currentDb as any)[id] = data.payload;
            changed = true;
            broadcastSSE(id, data.payload);
          }
        }
      });
      if (changed) {
        currentDb.updatedAt = new Date().toISOString();
        saveDb();
      }
    }, (snapErr) => {
      console.warn('server.ts Firestore onSnapshot listener note:', snapErr?.message || snapErr);
    });
  } catch (bridgeErr) {
    console.warn('server.ts Firestore bridge initialization error:', bridgeErr);
  }
}

// API: Server-Sent Events (SSE) Stream for Instant Realtime Synchronization
app.get('/api/sync/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'X-Accel-Buffering': 'no', // Critical: disables reverse-proxy buffering
  });

  if (typeof (res as any).flushHeaders === 'function') {
    (res as any).flushHeaders();
  }
  
  // Initial handshake packet with full current state
  res.write(`data: ${JSON.stringify({ type: 'init', data: currentDb, timestamp: currentDb.updatedAt })}\n\n`);
  if (typeof (res as any).flush === 'function') {
    (res as any).flush();
  }

  sseClients.add(res);

  // Keep-alive heartbeat ping every 10s to keep connections alive through proxies
  const heartbeat = setInterval(() => {
    try {
      res.write(': ping\n\n');
      if (typeof (res as any).flush === 'function') {
        (res as any).flush();
      }
    } catch {
      clearInterval(heartbeat);
      sseClients.delete(res);
    }
  }, 10000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
});

// API: Version Check Endpoint for ultra-fast low-bandwidth polling
app.get('/api/sync/version', (req, res) => {
  res.json({
    success: true,
    timestamp: currentDb.updatedAt,
  });
});

// API: Get Full Current Shared State (Cross-device sync)
app.get('/api/sync', (req, res) => {
  res.json({
    success: true,
    data: currentDb,
    timestamp: currentDb.updatedAt,
  });
});

// API: Mutation / Update specific collection or entire state
app.post('/api/sync', (req, res) => {
  const { type, payload } = req.body;

  if (type && payload !== undefined) {
    const existingVal = (currentDb as any)[type];
    const isDifferent = JSON.stringify(existingVal) !== JSON.stringify(payload);

    if (isDifferent) {
      (currentDb as any)[type] = payload;
      saveDb();
      // Instantly broadcast to all connected web browsers and tabs via SSE
      broadcastSSE(type, payload);
    }

    // Broadcast mutation to Firestore cloud
    if (serverDb) {
      setDoc(doc(serverDb, 'campus_sync', type), {
        payload,
        updatedAt: currentDb.updatedAt,
      }, { merge: true }).catch((err: any) => {
        console.warn('server.ts Firestore sync failed:', err?.message || err);
      });
    }

    return res.json({ success: true, timestamp: currentDb.updatedAt });
  }

  // Bulk update if passed directly
  if (req.body.data) {
    currentDb = { ...currentDb, ...req.body.data };
    saveDb();

    // Broadcast each updated collection via SSE
    Object.keys(req.body.data).forEach((k) => {
      broadcastSSE(k, req.body.data[k]);
    });

    if (serverDb && typeof req.body.data === 'object') {
      Object.keys(req.body.data).forEach((k) => {
        setDoc(doc(serverDb, 'campus_sync', k), {
          payload: req.body.data[k],
          updatedAt: currentDb.updatedAt,
        }, { merge: true }).catch((err: any) => {
          console.warn('server.ts Firestore bulk sync failed for', k, err?.message || err);
        });
      });
    }

    return res.json({ success: true, timestamp: currentDb.updatedAt });
  }

  res.status(400).json({ success: false, message: 'Invalid payload' });
});

// Setup Vite middleware for development
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Campus Help Zone Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
