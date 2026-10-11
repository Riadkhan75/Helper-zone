import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  Firestore,
  collection,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import bundledConfig from '../../firebase-applet-config.json';

// Configuration priority:
// 1. Provisioned / injected firebase-applet-config.json
// 2. Vite environment variables fallback
const firebaseConfig = {
  apiKey: (bundledConfig && bundledConfig.apiKey) || import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: (bundledConfig && bundledConfig.authDomain) || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: (bundledConfig && bundledConfig.projectId) || import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: (bundledConfig && bundledConfig.storageBucket) || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: (bundledConfig && bundledConfig.messagingSenderId) || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: (bundledConfig && bundledConfig.appId) || import.meta.env.VITE_FIREBASE_APP_ID,
};

const databaseId = ((bundledConfig as any)?.firestoreDatabaseId) || import.meta.env.VITE_FIREBASE_DATABASE_ID || undefined;

export const isFirebaseConfigured = (): boolean => {
  return !!(
    firebaseConfig.apiKey && 
    firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY' &&
    firebaseConfig.projectId
  );
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (isFirebaseConfigured()) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    // Initialize Firestore using the specific database ID if configured
    db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
    storage = getStorage(app);
    console.info('Connected to Firebase Firestore & Auth successfully. Database ID:', databaseId || '(default)');

    // Validate connection to Firestore as per skill guideline
    getDocFromServer(doc(db, 'campus_sync', 'test_connection')).catch((testErr) => {
      // Non-blocking test
      if (testErr instanceof Error && testErr.message.includes('the client is offline')) {
        console.warn('Firebase connection note:', testErr.message);
      }
    });
  } catch (err) {
    console.warn('Firebase initialization error, switching to interactive local store:', err);
  }
} else {
  console.info('Firebase configuration not detected. Running Campus Help Zone in active local persistence mode.');
}

export { 
  app, 
  auth, 
  db, 
  storage,
  collection,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
};
export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
};
export type { User };
