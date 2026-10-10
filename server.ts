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
  INITIAL_COMMENTS
} from './src/services/seedData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

app.use(express.json({ limit: '10mb' }));

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
    (currentDb as any)[type] = payload;
    saveDb();
    return res.json({ success: true, timestamp: currentDb.updatedAt });
  }

  // Bulk update if passed directly
  if (req.body.data) {
    currentDb = { ...currentDb, ...req.body.data };
    saveDb();
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
