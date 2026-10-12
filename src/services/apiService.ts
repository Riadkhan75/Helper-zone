import { 
  db, 
  auth,
  isFirebaseConfigured, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  onSnapshot 
} from './firebase';

export { isFirebaseConfigured };

/**
 * Universal Cross-Device & Cross-Deployment Sync Service
 * Seamlessly connects Google AI Studio, Vercel deployments,
 * and mobile devices in real time using Firebase Firestore and HTTP fallback.
 */

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

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
  verifications?: any[];
  chatConversations?: any[];
  chatMessages?: Record<string, any[]>;
  routines?: any[];
  exams?: any[];
  bookmarks?: any;
  cgpa?: any[];
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

// Universal Multi-Device Local Broadcast Channel
const localSyncChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('campus_sync_bus') : null;

/**
 * Subscribes to real-time changes across all tabs, windows, and devices.
 * Uses a triple-tier sync architecture:
 * 1. BroadcastChannel (0ms instant cross-tab sync in same browser)
 * 2. Server-Sent Events (SSE) (50ms instant cross-device sync via Express server)
 * 3. Firebase Firestore cloud onSnapshot (worldwide cross-cloud sync)
 */
export const subscribeToRealtimeSync = (
  onDataChange: (type: string, payload: any) => void
): (() => void) => {
  const cleanups: (() => void)[] = [];

  // Tier 1: Local Browser BroadcastChannel (Instant 0ms sync between open tabs)
  if (localSyncChannel) {
    const handleLocalMessage = (event: MessageEvent) => {
      if (event.data && event.data.type && event.data.payload !== undefined) {
        onDataChange(event.data.type, event.data.payload);
      }
    };
    localSyncChannel.addEventListener('message', handleLocalMessage);
    cleanups.push(() => {
      localSyncChannel.removeEventListener('message', handleLocalMessage);
    });
  }

  // Tier 2: Server-Sent Events (SSE) stream from Express server
  if (typeof EventSource !== 'undefined') {
    try {
      const sse = new EventSource('/api/sync/events');
      sse.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === 'init' && parsed.data && typeof parsed.data === 'object') {
            Object.keys(parsed.data).forEach((key) => {
              if (key !== 'updatedAt') {
                onDataChange(key, parsed.data[key]);
              }
            });
          } else if (parsed.type && parsed.payload !== undefined) {
            onDataChange(parsed.type, parsed.payload);
          }
        } catch {
          // Ignore parse errors on keepalive comments
        }
      };

      sse.onerror = () => {
        // EventSource automatically retries connection
      };

      cleanups.push(() => {
        sse.close();
      });
    } catch (e) {
      console.warn('SSE initialization note:', e);
    }
  }

  // Tier 3: Firebase Firestore cloud real-time snapshot
  if (isFirebaseConfigured() && db) {
    const path = 'campus_sync';
    try {
      const unsub = onSnapshot(collection(db, path), (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'removed') return;
          const id = change.doc.id;
          const data = change.doc.data();
          if (data && data.payload !== undefined) {
            onDataChange(id, data.payload);
          }
        });
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      });

      cleanups.push(unsub);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
    }
  }

  return () => {
    cleanups.forEach((fn) => {
      try {
        fn();
      } catch {
        /* ignore */
      }
    });
  };
};

/**
 * Fetches current shared server state.
 * Tries Firestore first if configured, then falls back to HTTP sync endpoint.
 */
export const fetchSharedServerState = async (): Promise<SharedServerState | null> => {
  // If Firestore is active, fetch from Firestore cloud
  if (isFirebaseConfigured() && db) {
    const path = 'campus_sync';
    try {
      const snap = await getDocs(collection(db, path));
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
      handleFirestoreError(fsErr, OperationType.LIST, path);
    }
  }

  // Fallback: Fetch via HTTP sync endpoint
  const endpoint = getSyncEndpoint();
  try {
    const res = await fetch(endpoint, { cache: 'no-store' });
    if (!res.ok) {
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
    try {
      if (typeof window !== 'undefined' && !window.location.hostname.includes('asia-east1.run.app')) {
        const directRes = await fetch(`${PRIMARY_AI_STUDIO_URL}/api/sync`, { cache: 'no-store' });
        if (directRes.ok) {
          const directJson = await directRes.json();
          if (directJson.success && directJson.data) return directJson.data;
        }
      }
    } catch {
      /* ignore */
    }
    return null;
  }
};

/**
 * Pushes updates to all sync channels:
 * 1. BroadcastChannel (0ms for all tabs in same browser)
 * 2. HTTP sync endpoint (Express server broadcasts via SSE to all active devices in 50ms)
 * 3. Firebase Firestore cloud document (persists in cloud)
 */
export const pushSharedServerUpdate = async (type: string, payload: any): Promise<boolean> => {
  const timestamp = new Date().toISOString();

  // 1. Instant 0ms broadcast to all other open tabs in the same browser
  if (localSyncChannel) {
    try {
      localSyncChannel.postMessage({ type, payload, timestamp });
    } catch {
      /* ignore */
    }
  }

  let firestoreSuccess = false;

  // 2. Push to Firestore if configured
  if (isFirebaseConfigured() && db) {
    const docPath = `campus_sync/${type}`;
    try {
      await setDoc(doc(db, 'campus_sync', type), {
        payload,
        updatedAt: timestamp,
      }, { merge: true });
      firestoreSuccess = true;
    } catch (fsErr) {
      handleFirestoreError(fsErr, OperationType.WRITE, docPath);
    }
  }

  // 3. Push to HTTP Sync endpoint (triggers server SSE broadcast to all other devices)
  let httpSuccess = false;
  const endpoint = getSyncEndpoint();

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, payload }),
    });
    httpSuccess = res.ok;

    if (!httpSuccess && typeof window !== 'undefined' && !window.location.hostname.includes('asia-east1.run.app')) {
      await fetch(`${PRIMARY_AI_STUDIO_URL}/api/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, payload }),
      });
    }
  } catch (err) {
    try {
      if (typeof window !== 'undefined' && !window.location.hostname.includes('asia-east1.run.app')) {
        await fetch(`${PRIMARY_AI_STUDIO_URL}/api/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, payload }),
        });
      }
    } catch {
      /* ignore */
    }
  }

  return firestoreSuccess || httpSuccess;
};
