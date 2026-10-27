// Single Firebase entry point. Everything else imports `db` from here so the
// app never initialises more than one Firestore instance (extra instances =
// extra websocket channels = wasted free-tier reads).
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// While the app runs on mock data this module is still imported (the adapter
// in src/data is a static import), but there is nothing to connect to and
// nothing to warn about. Initialise only when a project is actually
// configured, so the design build boots with a clean console.
export const isConfigured = Boolean(firebaseConfig.projectId)

export const app = isConfigured ? initializeApp(firebaseConfig) : null
export const db = app ? getFirestore(app) : null
export const auth = app ? getAuth(app) : null

if (!isConfigured && import.meta.env.DEV) {
  console.info(
    '[firebase] No VITE_FIREBASE_* config found — running on mock data. ' +
      'Set USE_MOCK = false in src/data/index.js once .env is filled in.'
  )
}

// Collection names are not centralised here any more. Every path is scoped
// to a restaurant and built in src/data/firestoreAdapter.js, which is the
// only module that talks to Firestore.
