/**
 * ===========================================================================
 * THE SWAP POINT
 * ===========================================================================
 *
 * Every hook and component imports its data from here and nowhere else.
 * Nothing above this file knows whether it is talking to Firestore or to the
 * in-memory mock.
 *
 * Currently: MOCK (design build).
 *
 * To restore Firebase, flip this one constant to false. The Firestore code is
 * untouched and still present in src/firebase.js and src/lib/actions.js.
 *
 * Before flipping back, note that the design added four menu fields the
 * original schema lacked — category, description, diet, spice — so the menu
 * documents need those, and ManagerMenu now writes them.
 */
export const USE_MOCK = true

import * as mock from '../mock/store'
import * as firestore from './firestoreAdapter'

const backend = USE_MOCK ? mock : firestore

// --- realtime (each returns an unsubscribe function) ------------------------
export const subscribe = backend.subscribe

// --- one-shot reads ---------------------------------------------------------
export const fetchOnce = backend.fetchOnce
export const fetchOrdersForSession = backend.fetchOrdersForSession
export const fetchSessionsByStatus = backend.fetchSessionsByStatus

// --- writes -----------------------------------------------------------------
export const knockOnTable = backend.knockOnTable
export const approveAndLinkTables = backend.approveAndLinkTables
export const addTablesToSession = backend.addTablesToSession
export const mergeSessions = backend.mergeSessions
export const rejectTable = backend.rejectTable
export const addMenuItem = backend.addMenuItem
export const setItemSoldOut = backend.setItemSoldOut
export const submitOrder = backend.submitOrder
export const setOrderStatus = backend.setOrderStatus
export const closeSession = backend.closeSession
export const markTableCleared = backend.markTableCleared
export const freeTable = backend.freeTable

// --- staff & access ---------------------------------------------------------
export const signInWithPin = backend.signInWithPin
export const addStaff = backend.addStaff
export const updateStaff = backend.updateStaff
export const removeStaff = backend.removeStaff
export const setRolePermission = backend.setRolePermission
export const resetRolePermissions = backend.resetRolePermissions

// --- reset (mock only; a real backend has nothing to reset to) --------------
export const resetAll = backend.resetAll ?? (() => {})
