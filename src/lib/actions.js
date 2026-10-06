// Every Firestore write in the app lives here. Keeping mutations out of the
// components makes the read/write cost of each workflow auditable in one file.
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import {
  db,
  COL,
  INVENTORY_DOC_ID,
  ORDER_STATUS,
  SESSION_STATUS,
  TABLE_STATUS,
  tableDocId,
} from '../firebase'

// ---------------------------------------------------------------------------
// Workflow A - the knock
// ---------------------------------------------------------------------------

/**
 * Customer scans the QR at a table. One getDoc, and at most one updateDoc.
 * Returns the table's current state so the caller can branch without a re-read.
 */
export async function knockOnTable(tableNumber) {
  const ref = doc(db, COL.tables, tableDocId(tableNumber))
  const snap = await getDoc(ref)

  if (!snap.exists()) {
    throw new Error(`Table ${tableNumber} does not exist. Check the QR code.`)
  }

  const data = snap.data()

  // Only an available table may knock. A table that is already pending or
  // occupied is left alone - re-scanning the QR must never reset a live session.
  if (data.status === TABLE_STATUS.available) {
    await updateDoc(ref, { status: TABLE_STATUS.pendingApproval })
    return { ...data, status: TABLE_STATUS.pendingApproval }
  }

  return data
}

/**
 * Manager approves one or more knocking tables and links them into a session.
 * Atomic: the session doc and every table update commit together, so tables
 * can never point at a session that failed to create.
 */
export async function approveAndLinkTables(tableNumbers) {
  if (!tableNumbers?.length) throw new Error('Select at least one table to approve.')

  const sessionId = `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
  const linkedTables = tableNumbers.map(Number).sort((a, b) => a - b)

  const batch = writeBatch(db)

  // Doc ID == session_id so billing can read the session by ID, not by query.
  batch.set(doc(db, COL.sessions, sessionId), {
    session_id: sessionId,
    linked_tables: linkedTables,
    status: SESSION_STATUS.active,
    created_at: serverTimestamp(),
  })

  for (const tableNumber of linkedTables) {
    batch.update(doc(db, COL.tables, tableDocId(tableNumber)), {
      status: TABLE_STATUS.occupied,
      session_id: sessionId,
    })
  }

  await batch.commit()
  return sessionId
}

/** Manager rejects a knock - table goes straight back to available. */
export async function rejectTable(tableNumber) {
  await updateDoc(doc(db, COL.tables, tableDocId(tableNumber)), {
    status: TABLE_STATUS.available,
    session_id: null,
  })
}

// ---------------------------------------------------------------------------
// Workflow B - menu and inventory
// ---------------------------------------------------------------------------

export async function addMenuItem({ name, price, image_url }) {
  const trimmedName = String(name || '').trim()
  if (!trimmedName) throw new Error('Name is required.')

  const numericPrice = Number(price)
  if (!Number.isFinite(numericPrice) || numericPrice < 0) {
    throw new Error('Price must be a non-negative number.')
  }

  const ref = await addDoc(collection(db, COL.menu), {
    name: trimmedName,
    price: numericPrice,
    image_url: String(image_url || '').trim(),
  })
  return ref.id
}

export async function updateMenuItem(menuItemId, { name, price, image_url }) {
  await updateDoc(doc(db, COL.menu, menuItemId), {
    name: String(name).trim(),
    price: Number(price),
    image_url: String(image_url || '').trim(),
  })
}

/**
 * Kitchen flips availability. arrayUnion / arrayRemove are idempotent and
 * commute, so two chefs toggling different items at the same moment cannot
 * clobber each other the way a read-modify-write of the array would.
 */
export async function setItemSoldOut(menuItemId, soldOut) {
  const ref = doc(db, COL.storeConfig, INVENTORY_DOC_ID)
  const payload = {
    sold_out_items: soldOut ? arrayUnion(menuItemId) : arrayRemove(menuItemId),
  }
  // setDoc(merge) rather than updateDoc so a fresh project with no inventory
  // doc yet self-heals on the first toggle instead of throwing NOT_FOUND.
  await setDoc(ref, payload, { merge: true })
}

// ---------------------------------------------------------------------------
// Workflow C - orders and billing
// ---------------------------------------------------------------------------

/** Customer submits the cart. `items` is a plain array of line objects. */
export async function submitOrder({ sessionId, tableNumber, items }) {
  if (!sessionId) throw new Error('No active session.')
  if (!items?.length) throw new Error('Cart is empty.')

  const ref = await addDoc(collection(db, COL.orders), {
    session_id: sessionId,
    ordered_by_table: Number(tableNumber),
    items: items.map((item) => ({
      menu_item_id: item.id,
      name: item.name,
      price: Number(item.price),
      qty: Number(item.qty),
    })),
    status: ORDER_STATUS.pending,
    prep_time_minutes: null,
    created_at: serverTimestamp(),
  })
  return ref.id
}

/**
 * Kitchen advances a ticket. Setting status to "ready" drops the order out of
 * the KDS query automatically - no extra cleanup write needed.
 */
export async function setOrderStatus(orderId, status, prepTimeMinutes) {
  const payload = { status }
  if (prepTimeMinutes !== undefined) {
    payload.prep_time_minutes =
      prepTimeMinutes === null || prepTimeMinutes === '' ? null : Number(prepTimeMinutes)
  }
  await updateDoc(doc(db, COL.orders, orderId), payload)
}

/** Billing: one query, every order on the tab, live or already served. */
export async function fetchOrdersForSession(sessionId) {
  const q = query(collection(db, COL.orders), where('session_id', '==', sessionId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

/** Lists sessions by status - used by the manager billing screen. */
export async function fetchSessionsByStatus(status = SESSION_STATUS.active) {
  const q = query(collection(db, COL.sessions), where('status', '==', status))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

/**
 * Close the tab: session -> closed, and every linked table freed in the same
 * atomic batch so a table can never be left stranded as "occupied" pointing at
 * a dead session.
 */
export async function closeSession(sessionId, linkedTables = []) {
  const batch = writeBatch(db)

  batch.update(doc(db, COL.sessions, sessionId), { status: SESSION_STATUS.closed })

  for (const tableNumber of linkedTables) {
    batch.update(doc(db, COL.tables, tableDocId(tableNumber)), {
      status: TABLE_STATUS.available,
      session_id: null,
    })
  }

  await batch.commit()
}
