/**
 * Cross-device synchronization service.
 * Communicates with /api/sync so updates on one phone/desktop
 * are immediately synchronized to all other devices.
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

export const fetchSharedServerState = async (): Promise<SharedServerState | null> => {
  try {
    const res = await fetch('/api/sync', { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
    return null;
  } catch (err) {
    console.warn('Sync server unreachable, relying on local store cache:', err);
    return null;
  }
};

export const pushSharedServerUpdate = async (type: string, payload: any): Promise<boolean> => {
  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, payload }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Sync push failed:', err);
    return false;
  }
};
