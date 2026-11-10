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
 * untouched and still present in src/firebase.js.
 *
 * Before flipping back, note that the design added four menu fields the
 * original schema lacked — category, description, diet, spice — so the menu
 * documents need those, and ManagerMenu now writes them.
 */
export const USE_MOCK = true

import * as mock from '../mock/store'
import * as firestore from './firestoreAdapter'

const backend = USE_MOCK ? mock : firestore

// --- tenant (the only calls not scoped to a restaurant) ---------------------
export const lookupRestaurantBySlug = backend.lookupRestaurantBySlug
// A restaurant that has pointed its own domain at us: matched on the whole
// hostname, because there is no subdomain label to read.
export const lookupRestaurantByHost = backend.lookupRestaurantByHost
export const listRestaurants = backend.listRestaurants

// --- the platform's own console ---------------------------------------------
// These name their restaurant in an argument instead of reading the active
// tenant: /admin runs on the apex, where no tenant is resolved at all, and it
// edits restaurants it is not inside.
export const signInPlatformAdmin = backend.signInPlatformAdmin
export const signOutPlatformAdmin = backend.signOutPlatformAdmin ?? (async () => {})
export const createRestaurant = backend.createRestaurant
export const updateRestaurant = backend.updateRestaurant
export const assignRestaurantOwner = backend.assignRestaurantOwner ?? null
export const fetchRestaurantMenu = backend.fetchRestaurantMenu
export const addMenuItemToRestaurant = backend.addMenuItemToRestaurant
export const bulkAddMenuItems = backend.bulkAddMenuItems
export const deleteMenuItemFromRestaurant = backend.deleteMenuItemFromRestaurant

/** Shown on the admin sign-in screen while the app runs on demo data. */
export const DEMO_ADMIN_HINT = backend.DEMO_ADMIN_HINT ?? null

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
export const findSessionByCode = backend.findSessionByCode
export const suggestAccessCode = backend.suggestAccessCode ?? (() => '')
export const suggestAccessCodes = backend.suggestAccessCodes ?? (() => [])
export const rejectTable = backend.rejectTable
export const addMenuItem = backend.addMenuItem
export const setItemSoldOut = backend.setItemSoldOut
export const submitOrder = backend.submitOrder
export const setOrderStatus = backend.setOrderStatus
export const closeSession = backend.closeSession
export const markTableCleared = backend.markTableCleared
export const freeTable = backend.freeTable

// --- staff & access ---------------------------------------------------------
export const signInWithEmail = backend.signInWithEmail
export const addStaff = backend.addStaff

// --- setting and resetting a password ---------------------------------------
// Three calls rather than one, because the screen has three jobs: ask for a
// link, judge a link before asking anyone to trust it, and redeem it. Only
// sendPasswordReset ever hears an email address; the other two take the code
// from the link and nothing else.
export const sendPasswordReset = backend.sendPasswordReset
export const checkResetToken = backend.checkResetToken
export const completePasswordReset = backend.completePasswordReset

export const updateStaff = backend.updateStaff
export const removeStaff = backend.removeStaff
export const setRolePermission = backend.setRolePermission
export const resetRolePermissions = backend.resetRolePermissions

// --- reset (mock only; a real backend has nothing to reset to) --------------
export const resetAll = backend.resetAll ?? (() => {})
