/**
 * Firestore implementation of the data interface in ./index.js.
 *
 * Dormant while USE_MOCK is true. It is written against the same signatures
 * the mock exposes, so flipping USE_MOCK to false is the only change needed.
 *
 * Note the subscribe() shape: it takes a collection key and hands back an
 * unsubscribe function, so the strict-cleanup contract the hooks rely on is
 * identical in both backends.
 */
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore'
import { db, COL, INVENTORY_DOC_ID, ORDER_STATUS, TABLE_STATUS } from '../firebase'
import {
  addMenuItem as fsAddMenuItem,
  approveAndLinkTables as fsApprove,
  closeSession as fsCloseSession,
  fetchOrdersForSession as fsOrdersForSession,
  fetchSessionsByStatus as fsSessionsByStatus,
  knockOnTable as fsKnock,
  rejectTable as fsReject,
  setItemSoldOut as fsSetSoldOut,
  setOrderStatus as fsSetOrderStatus,
  submitOrder as fsSubmitOrder,
} from '../lib/actions'

const docsToArray = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }))

/**
 * @param {'tables'|'sessions'|'menu'|'orders'|'inventory'} key
 * @returns {() => void} unsubscribe
 */
export function subscribe(key, callback) {
  if (key === 'inventory') {
    return onSnapshot(doc(db, COL.storeConfig, INVENTORY_DOC_ID), (snap) => {
      const data = snap.data()
      callback({ sold_out_items: Array.isArray(data?.sold_out_items) ? data.sold_out_items : [] })
    })
  }

  if (key === 'orders') {
    // Filtered so the KDS never re-reads historical orders.
    const q = query(
      collection(db, COL.orders),
      where('status', 'in', [ORDER_STATUS.pending, ORDER_STATUS.preparing]),
      orderBy('created_at', 'asc')
    )
    return onSnapshot(q, (snap) => callback(docsToArray(snap)))
  }

  if (key === 'tables') {
    // The floor plan needs every table, but a dining room is a bounded set.
    return onSnapshot(collection(db, COL.tables), (snap) => callback(docsToArray(snap)))
  }

  if (key === 'sessions') {
    const q = query(collection(db, COL.sessions), where('status', '==', 'active'))
    return onSnapshot(q, (snap) => callback(docsToArray(snap)))
  }

  // menu — should not normally be subscribed; fetched once instead.
  return onSnapshot(collection(db, COL.menu), (snap) => callback(docsToArray(snap)))
}

export async function fetchOnce(key) {
  const { getDocs, getDoc } = await import('firebase/firestore')

  if (key === 'inventory') {
    const snap = await getDoc(doc(db, COL.storeConfig, INVENTORY_DOC_ID))
    const data = snap.data()
    return { sold_out_items: Array.isArray(data?.sold_out_items) ? data.sold_out_items : [] }
  }

  const name = key === 'menu' ? COL.menu : key === 'tables' ? COL.tables : COL[key]
  return docsToArray(await getDocs(collection(db, name)))
}

export const knockOnTable = fsKnock
export const approveAndLinkTables = (tableNumbers, options) => fsApprove(tableNumbers, options)
export const rejectTable = fsReject
export const addMenuItem = fsAddMenuItem
export const setItemSoldOut = fsSetSoldOut
export const submitOrder = fsSubmitOrder
export const setOrderStatus = fsSetOrderStatus
export const fetchOrdersForSession = fsOrdersForSession
export const fetchSessionsByStatus = fsSessionsByStatus

export async function closeSession(sessionId, linkedTables) {
  return fsCloseSession(sessionId, linkedTables)
}

/**
 * Not yet in lib/actions.js — the Firestore version needs a `needs_clearing`
 * status added to the table schema and to firestore.rules first.
 */
export function markTableCleared() {
  throw new Error('[tables] markTableCleared() is not implemented for Firestore yet.')
}

export function mergeSessions() {
  throw new Error('[tables] mergeSessions() is not implemented for Firestore yet.')
}

export function addTablesToSession() {
  throw new Error('[tables] addTablesToSession() is not implemented for Firestore yet.')
}

export function freeTable() {
  throw new Error('[tables] freeTable() is not implemented for Firestore yet.')
}

export { TABLE_STATUS }

// ---------------------------------------------------------------------------
// Staff & access — NOT implemented against Firestore yet.
//
// These deliberately throw rather than silently doing nothing, so flipping
// USE_MOCK to false fails loudly at the point of use instead of appearing to
// work while granting everyone everything.
//
// The real implementation is not a port of the mock: PIN checking and the
// permission map must live server-side (Firebase Auth + custom claims, or a
// callable function), because anything shipped to the browser can be read and
// edited by whoever holds the device.
// ---------------------------------------------------------------------------
const notImplemented = (name) => () => {
  throw new Error(
    `[auth] ${name}() is not implemented for Firestore yet. ` +
      'Staff auth must move server-side before USE_MOCK is turned off.'
  )
}

export const signInWithPin = notImplemented('signInWithPin')
export const addStaff = notImplemented('addStaff')
export const updateStaff = notImplemented('updateStaff')
export const removeStaff = notImplemented('removeStaff')
export const setRolePermission = notImplemented('setRolePermission')
export const resetRolePermissions = notImplemented('resetRolePermissions')
