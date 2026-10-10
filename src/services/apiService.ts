import { 
  db, 
  isFirebaseConfigured, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  onSnapshot 
} from './firebase';

/**
 * Universal Cross-Device & Cross-Deployment Sync Service
 * Seamlessly connects Google AI Studio, Vercel deployments,
 * and mobile devices in real time using Firebase Firestore and HTTP fallback.
 */

export interface SharedServerState {
  settings: any;
  notices: any[];
  posts: any[];
  comments: Record<string, any[]>;
  studyMaterials: any[];
  books: any[];
  lostFoundItems: any[];
  notifications: any[];
  reports: any[];
  activityLogs: any[];
  users: any[];
  updatedAt: string;
}

const PRIMARY_AI_STUDIO_URL = 'https://ais-pre-pqb7wjikhn6zb3kusrduly-622384418458.asia-east1.run.app';

/**
 * Resolves the appropriate HTTP sync endpoint
 */
export const getSyncEndpoint = (): string => {
  // 1. Explicitly configured custom sync server URL
  if (import.meta.env.VITE_SYNC_SERVER_URL) {
    return `${import.meta.env.VITE_SYNC_SERVER_URL.replace(/\/$/, '')}/api/sync`;
  }

  // 2. Browser context checks
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // On Vercel, the /api/sync function forwards to PRIMARY_AI_STUDIO_URL
    if (host.includes('vercel.app')) {
      return '/api/sync';
    }
  }

  return '/api/sync';
};

/**
 * Subscribes to real-time changes via Firebase Firestore.
 * When changes happen on Vercel, AI Studio immediately receives them,
 * and vice-versa, in milliseconds without polling.
 */
export const subscribeToRealtimeSync = (
  onDataChange: (type: string, payload: any) => void
): (() => void) => {
  if (!isFirebaseConfigured() || !db) {
    return () => {};
  }

  try {
    const unsub = onSnapshot(collection(db, 'campus_sync'), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const id = change.doc.id;
        const data = change.doc.data();
        if (data && data.payload !== undefined) {
          onDataChange(id, data.payload);
        }
      });
    }, (error) => {
      console.warn('Firestore realtime sync listener warning:', error);
    });

    return unsub;
  } catch (err) {
    console.warn('Could not establish Firestore realtime subscription:', err);
    return () => {};
  }
};

/**
 * Fetches current shared server state.
 * Tries Firestore first if configured, then falls back to HTTP sync endpoint.
 */
export const fetchSharedServerState = async (): Promise<SharedServerState | null> => {
  // If Firestore is active, fetch from Firestore cloud
  if (isFirebaseConfigured() && db) {
    try {
      const snap = await getDocs(collection(db, 'campus_sync'));
      if (!snap.empty) {
        const consolidated: any = {};
        let latestTime = '';
        snap.forEach((docItem) => {
          const val = docItem.data();
          if (val) {
            consolidated[docItem.id] = val.payload;
            if (val.updatedAt && val.updatedAt > latestTime) {
              latestTime = val.updatedAt;
            }
          }
        });
        if (Object.keys(consolidated).length > 0) {
          consolidated.updatedAt = latestTime || new Date().toISOString();
          return consolidated as SharedServerState;
        }
      }
    } catch (fsErr) {
      console.warn('Firestore read error, falling back to HTTP sync bridge:', fsErr);
    }
  }

  // Fallback: Fetch via HTTP sync endpoint
  const endpoint = getSyncEndpoint();
  try {
    const res = await fetch(endpoint, { cache: 'no-store' });
    if (!res.ok) {
      // If relative endpoint on Vercel failed, try direct AI Studio live URL
      if (endpoint === '/api/sync' && typeof window !== 'undefined' && !window.location.hostname.includes('asia-east1.run.app')) {
        const directRes = await fetch(`${PRIMARY_AI_STUDIO_URL}/api/sync`, { cache: 'no-store' });
        if (directRes.ok) {
          const directJson = await directRes.json();
          if (directJson.success && directJson.data) return directJson.data;
        }
      }
      return null;
    }
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
    return null;
  } catch (err) {
    // If local fetch failed, try direct AI Studio live URL as secondary bridge
    try {
      if (typeof window !== 'undefined' && !window.location.hostname.includes('asia-east1.run.app')) {
        const directRes = await fetch(`${PRIMARY_AI_STUDIO_URL}/api/sync`, { cache: 'no-store' });
        if (directRes.ok) {
          const directJson = await directRes.json();
          if (directJson.success && directJson.data) return directJson.data;
        }
      }
    } catch (directErr) {
      /* ignore */
    }
    return null;
  }
};

/**
 * Pushes updates to both Firebase Firestore and the HTTP sync server.
 * Guarantees that updates made on either Vercel or Google AI Studio
 * are persisted and broadcasted across both platforms.
 */
export const pushSharedServerUpdate = async (type: string, payload: any): Promise<boolean> => {
  const timestamp = new Date().toISOString();
  let firestoreSuccess = false;

  // 1. Push to Firestore if configured
  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'campus_sync', type), {
        payload,
        updatedAt: timestamp,
      }, { merge: true });
      firestoreSuccess = true;
    } catch (fsErr) {
      console.warn('Firestore write warning:', fsErr);
    }
  }

  // 2. Push to HTTP Sync endpoint
  let httpSuccess = false;
  const endpoint = getSyncEndpoint();

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, payload }),
    });
    httpSuccess = res.ok;

    // If failed on external host, try direct push to AI Studio server
    if (!httpSuccess && typeof window !== 'undefined' && !window.location.hostname.includes('asia-east1.run.app')) {
      await fetch(`${PRIMARY_AI_STUDIO_URL}/api/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, payload }),
      });
    }
  } catch (err) {
    // Attempt direct AI Studio server push as backup
    try {
      if (typeof window !== 'undefined' && !window.location.hostname.includes('asia-east1.run.app')) {
        await fetch(`${PRIMARY_AI_STUDIO_URL}/api/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, payload }),
        });
      }
    } catch (e) {
      /* ignore */
    }
  }

  return firestoreSuccess || httpSuccess;
};
