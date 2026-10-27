// Single Firebase entry point. Everything else imports `db` from here so the
// app never initialises more than one Firestore instance (extra instances =
// extra websocket channels = wasted free-tier reads).
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
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

// ---- Collection / document names -------------------------------------------
// Centralised so a typo is a build-time import error, not a silent empty query.
export const COL = {
  tables: 'tables',
  sessions: 'sessions',
  menu: 'menu',
  storeConfig: 'store_config',
  orders: 'orders',
}

// store_config holds exactly one document, by design: a single doc means a
// single onSnapshot channel serves every customer device in the restaurant.
export const INVENTORY_DOC_ID = 'inventory'

// Table documents are keyed by their table number as a string ("7"), so the
// customer route can read one document by ID instead of running a query.
export const tableDocId = (tableNumber) => String(tableNumber)

export const TABLE_STATUS = {
  available: 'available',
  pendingApproval: 'pending_approval',
  occupied: 'occupied',
}

export const SESSION_STATUS = {
  active: 'active',
  billed: 'billed',
  closed: 'closed',
}

export const ORDER_STATUS = {
  pending: 'pending',
  preparing: 'preparing',
  ready: 'ready',
}
