/**
 * Firestore implementation of the data interface in ./index.js.
 *
 * Every path is scoped to one restaurant:
 *
 *     restaurants/{restaurantId}/tables
 *                               /sessions
 *                               /orders
 *                               /menuItems
 *                               /staff
 *                               /config/inventory
 *
 * Subcollections rather than flat collections with a restaurant_id field,
 * because the security rule then becomes a single statement that a careless
 * query cannot slip past. With the flat model every query must remember to
 * filter, and the first one that forgets shows one restaurant another's
 * takings.
 *
 * UNTESTED against a live project. Written from the mock's behaviour; the
 * first run against real Firestore will need a pass for index errors and
 * timestamp handling.
 */
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase'
import { requireTenant } from '../tenant/current'
import { DEFAULT_ROLE_PERMISSIONS } from '../auth/permissions'

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const root = () => doc(db, 'restaurants', requireTenant())
const col = (name) => collection(root(), name)
const rec = (name, id) => doc(root(), name, String(id))

const INVENTORY = () => doc(root(), 'config', 'inventory')

const rows = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }))

/** Firestore Timestamp -> Date, so the UI's date maths keeps working. */
const hydrate = (row) => ({
  ...row,
  created_at: row.created_at?.toDate ? row.created_at.toDate() : row.created_at,
})

// ---------------------------------------------------------------------------
// Tenant lookup — the one query NOT scoped to a tenant
// ---------------------------------------------------------------------------

export async function lookupRestaurantBySlug(slug) {
  const q = query(
    collection(db, 'restaurants'),
    where('subdomain', '==', String(slug).toLowerCase()),
    limit(1)
  )
  const snap = await getDocs(q)
  if (snap.empty) return null
  const found = snap.docs[0]
  return { id: found.id, ...found.data() }
}

// ---------------------------------------------------------------------------
// Realtime
// ---------------------------------------------------------------------------

export function subscribe(key, callback) {
  if (key === 'inventory') {
    return onSnapshot(INVENTORY(), (snap) => {
      const data = snap.data()
      callback({
        sold_out_items: Array.isArray(data?.sold_out_items) ? data.sold_out_items : [],
      })
    })
  }

  if (key === 'access') {
    return onSnapshot(doc(root(), 'config', 'access'), (snap) => {
      callback(snap.data()?.rolePermissions ?? DEFAULT_ROLE_PERMISSIONS)
    })
  }

  if (key === 'orders') {
    // Filtered so the KDS never re-reads historical orders.
    const q = query(
      col('orders'),
      where('status', 'in', ['pending', 'preparing']),
      orderBy('created_at', 'asc')
    )
    return onSnapshot(q, (snap) => callback(rows(snap).map(hydrate)))
  }

  if (key === 'sessions') {
    const q = query(col('sessions'), where('status', '==', 'active'))
    return onSnapshot(q, (snap) => callback(rows(snap).map(hydrate)))
  }

  if (key === 'staff') {
    // Inactive staff are not returned at all: a leaver disappears from the
    // owner's list rather than lingering with a badge.
    const q = query(col('staff'), where('isActive', '==', true))
    return onSnapshot(q, (snap) => callback(rows(snap)))
  }

  if (key === 'tables') {
    return onSnapshot(col('tables'), (snap) => callback(rows(snap)))
  }

  // menu
  return onSnapshot(col('menuItems'), (snap) => callback(rows(snap)))
}

export async function fetchOnce(key) {
  if (key === 'inventory') {
    const snap = await getDoc(INVENTORY())
    const data = snap.data()
    return {
      sold_out_items: Array.isArray(data?.sold_out_items) ? data.sold_out_items : [],
    }
  }
  const name = key === 'menu' ? 'menuItems' : key
  return rows(await getDocs(col(name))).map(hydrate)
}

// ---------------------------------------------------------------------------
// Workflow A — seating
// ---------------------------------------------------------------------------

export async function knockOnTable(tableNumber) {
  const ref = rec('tables', tableNumber)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error(`Table ${tableNumber} does not exist.`)

  const data = snap.data()
  if (data.status === 'available') {
    await updateDoc(ref, { status: 'pending_approval' })
    return { ...data, status: 'pending_approval' }
  }
  return data
}

export async function rejectTable(tableNumber) {
  await updateDoc(rec('tables', tableNumber), {
    status: 'available',
    session_id: null,
    served_by: null,
    party_name: null,
  })
}

/**
 * Access codes start at 51 so they can never be read as a table number, and
 * are unique **per restaurant** — two restaurants may both be using 65.
 */
const CODE_FLOOR = 51
const CODE_CEILING = 99

export async function suggestAccessCode() {
  const snap = await getDocs(query(col('sessions'), where('status', '==', 'active')))
  const taken = new Set(rows(snap).map((s) => String(s.access_code)))

  const free = []
  for (let n = CODE_FLOOR; n <= CODE_CEILING; n += 1) {
    if (!taken.has(String(n))) free.push(n)
  }
  if (free.length) return String(free[Math.floor(Math.random() * free.length)])

  for (let n = 100; n <= 999; n += 1) {
    if (!taken.has(String(n))) return String(n)
  }
  throw new Error('No table codes left. Close a tab first.')
}

export async function findSessionByCode(code) {
  const q = query(
    col('sessions'),
    where('status', '==', 'active'),
    where('access_code', '==', String(code).trim()),
    limit(1)
  )
  const snap = await getDocs(q)
  if (snap.empty) return null
  const session = { id: snap.docs[0].id, ...snap.docs[0].data() }
  return {
    session_id: session.session_id ?? session.id,
    party_name: session.party_name ?? null,
    table_number: (session.linked_tables ?? [])[0] ?? null,
    linked_tables: session.linked_tables ?? [],
  }
}

export async function approveAndLinkTables(
  tableNumbers,
  { covers, staff, partyName, accessCode } = {}
) {
  if (!tableNumbers?.length) throw new Error('Select at least one table to approve.')

  const linked = tableNumbers.map(Number).sort((a, b) => a - b)
  const code = String(accessCode || '').trim() || (await suggestAccessCode())

  // Seat counts drive the cover estimate, so read the tables first.
  const seats = await Promise.all(
    linked.map(async (n) => (await getDoc(rec('tables', n))).data()?.seats ?? 2)
  )
  const totalSeats = seats.reduce((sum, s) => sum + s, 0)

  const sessionRef = doc(col('sessions'))
  const sessionId = sessionRef.id
  const batch = writeBatch(db)

  batch.set(sessionRef, {
    session_id: sessionId,
    linked_tables: linked,
    status: 'active',
    created_at: serverTimestamp(),
    covers: covers ?? totalSeats,
    party_name: String(partyName || '').trim() || null,
    access_code: code,
    opened_by: staff ? { id: staff.id, name: staff.name, role: staff.role } : null,
  })

  for (const number of linked) {
    batch.update(rec('tables', number), {
      status: 'occupied',
      session_id: sessionId,
      served_by: staff?.name ?? null,
      party_name: String(partyName || '').trim() || null,
    })
  }

  await batch.commit()
  return sessionId
}

export async function addTablesToSession(tableNumbers, sessionId, { staff } = {}) {
  const sessionRef = rec('sessions', sessionId)
  const sessionSnap = await getDoc(sessionRef)
  if (!sessionSnap.exists() || sessionSnap.data().status !== 'active') {
    throw new Error('That party has already been closed.')
  }
  const session = sessionSnap.data()
  const wanted = (tableNumbers ?? []).map(Number)
  if (!wanted.length) throw new Error('Select at least one table to add.')

  const tables = await Promise.all(wanted.map((n) => getDoc(rec('tables', n))))
  const clash = tables.find((t) => t.data()?.status === 'occupied')
  if (clash) throw new Error(`Table ${clash.id} already has a party on it.`)

  const extraSeats = tables.reduce((sum, t) => sum + (t.data()?.seats ?? 2), 0)
  const batch = writeBatch(db)

  for (const number of wanted) {
    batch.update(rec('tables', number), {
      status: 'occupied',
      session_id: sessionId,
      party_name: session.party_name ?? null,
      served_by: session.opened_by?.name ?? staff?.name ?? null,
    })
  }

  batch.update(sessionRef, {
    linked_tables: [...new Set([...(session.linked_tables ?? []), ...wanted])].sort(
      (a, b) => a - b
    ),
    covers: (session.covers ?? 0) + extraSeats,
  })

  await batch.commit()
  return wanted
}

/**
 * Merge two live parties onto one bill.
 *
 * Orders are re-pointed at the surviving session, not just the tables — a
 * bill read by session_id would otherwise silently drop half the food.
 */
export async function mergeSessions(keepSessionId, mergeSessionId) {
  if (keepSessionId === mergeSessionId) throw new Error('That is the same party.')

  const keepRef = rec('sessions', keepSessionId)
  const goneRef = rec('sessions', mergeSessionId)
  const [keepSnap, goneSnap] = await Promise.all([getDoc(keepRef), getDoc(goneRef)])

  if (!keepSnap.exists() || keepSnap.data().status !== 'active') {
    throw new Error('One of those parties has already been closed.')
  }
  if (!goneSnap.exists() || goneSnap.data().status !== 'active') {
    throw new Error('One of those parties has already been closed.')
  }

  const keep = keepSnap.data()
  const gone = goneSnap.data()

  const movingOrders = await getDocs(
    query(col('orders'), where('session_id', '==', mergeSessionId))
  )

  const batch = writeBatch(db)
  for (const order of movingOrders.docs) {
    batch.update(order.ref, { session_id: keepSessionId })
  }
  for (const number of gone.linked_tables ?? []) {
    batch.update(rec('tables', number), {
      session_id: keepSessionId,
      party_name: keep.party_name ?? null,
      served_by: keep.opened_by?.name ?? null,
    })
  }

  batch.update(keepRef, {
    linked_tables: [
      ...new Set([...(keep.linked_tables ?? []), ...(gone.linked_tables ?? [])]),
    ].sort((a, b) => a - b),
    covers: (keep.covers ?? 0) + (gone.covers ?? 0),
  })
  batch.update(goneRef, {
    status: 'closed',
    linked_tables: [],
    merged_into: keepSessionId,
  })

  await batch.commit()
  return keepSessionId
}

// ---------------------------------------------------------------------------
// Clearing & freeing
// ---------------------------------------------------------------------------

export async function closeSession(sessionId, linkedTables = []) {
  const batch = writeBatch(db)
  batch.update(rec('sessions', sessionId), { status: 'closed' })
  for (const number of linkedTables) {
    // Settling does not free the table — plates are still on it.
    batch.update(rec('tables', number), {
      status: 'needs_clearing',
      session_id: null,
    })
  }
  await batch.commit()
}

export async function markTableCleared(tableNumber) {
  await updateDoc(rec('tables', tableNumber), {
    status: 'available',
    session_id: null,
    served_by: null,
    party_name: null,
  })
}

export async function freeTable(tableNumber) {
  const tableRef = rec('tables', tableNumber)
  const snap = await getDoc(tableRef)
  if (!snap.exists()) return
  const sessionId = snap.data().session_id

  const batch = writeBatch(db)

  if (sessionId) {
    const sessionSnap = await getDoc(rec('sessions', sessionId))
    if (sessionSnap.exists() && sessionSnap.data().status === 'active') {
      batch.update(rec('sessions', sessionId), { status: 'closed' })
      for (const other of sessionSnap.data().linked_tables ?? []) {
        if (Number(other) === Number(tableNumber)) continue
        batch.update(rec('tables', other), {
          status: 'needs_clearing',
          session_id: null,
        })
      }
    }
  }

  batch.update(tableRef, {
    status: 'available',
    session_id: null,
    served_by: null,
    party_name: null,
  })

  await batch.commit()
}

// ---------------------------------------------------------------------------
// Menu & inventory
// ---------------------------------------------------------------------------

export async function addMenuItem(item) {
  const name = String(item.name || '').trim()
  if (!name) throw new Error('Name is required.')
  const price = Number(item.price)
  if (!Number.isFinite(price) || price < 0) throw new Error('Price must be positive.')

  // Dish numbers are printed and spoken aloud, so they are assigned once and
  // never reshuffled — the next number is always one past the highest used.
  const existing = await getDocs(query(col('menuItems'), orderBy('no', 'desc'), limit(1)))
  const nextNo = existing.empty ? 1 : (existing.docs[0].data().no ?? 0) + 1

  const ref = await addDoc(col('menuItems'), {
    no: nextNo,
    name,
    description: String(item.description || '').trim(),
    price,
    category: item.category || 'mains',
    diet: item.diet || 'veg',
    nuts: Boolean(item.nuts),
    isNew: Boolean(item.isNew),
    weekend: Boolean(item.weekend),
    image_url: String(item.image_url || '').trim(),
  })
  return ref.id
}

export async function setItemSoldOut(menuItemId, soldOut) {
  await setDoc(
    INVENTORY(),
    { sold_out_items: soldOut ? arrayUnion(menuItemId) : arrayRemove(menuItemId) },
    { merge: true }
  )
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export async function submitOrder({ sessionId, tableNumber, items }) {
  if (!sessionId) throw new Error('No active session.')
  if (!items?.length) throw new Error('Cart is empty.')

  const ref = await addDoc(col('orders'), {
    session_id: sessionId,
    ordered_by_table: Number(tableNumber),
    items: items.map((item) => ({
      menu_item_id: item.id,
      name: item.name,
      price: Number(item.price),
      qty: Number(item.qty),
    })),
    status: 'pending',
    prep_time_minutes: null,
    created_at: serverTimestamp(),
  })
  return ref.id
}

export async function setOrderStatus(orderId, status, prepTimeMinutes) {
  const payload = { status }
  if (prepTimeMinutes !== undefined) {
    payload.prep_time_minutes =
      prepTimeMinutes === null || prepTimeMinutes === '' ? null : Number(prepTimeMinutes)
  }
  await updateDoc(rec('orders', orderId), payload)
}

export async function fetchOrdersForSession(sessionId) {
  const snap = await getDocs(query(col('orders'), where('session_id', '==', sessionId)))
  return rows(snap).map(hydrate)
}

export async function fetchSessionsByStatus(status = 'active') {
  const snap = await getDocs(query(col('sessions'), where('status', '==', status)))
  return rows(snap).map(hydrate)
}

// ---------------------------------------------------------------------------
// Staff & access
//
// Sign-in itself is Firebase Auth (see src/auth/AuthProvider). These manage
// the staff records that carry role and isActive.
// ---------------------------------------------------------------------------

export async function addStaff({ uid, name, email, role }) {
  if (!uid) throw new Error('A staff record needs the Firebase Auth uid.')
  await setDoc(doc(root(), 'staff', uid), {
    name: String(name || '').trim(),
    email: String(email || '').trim().toLowerCase(),
    role: role || 'waiter',
    isActive: true,
    restaurantId: requireTenant(),
  })
  return uid
}

export async function updateStaff(id, changes) {
  const ref = doc(root(), 'staff', id)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('That person no longer exists.')

  if (snap.data().role === 'owner') {
    if (changes.isActive === false) throw new Error('The owner cannot be switched off.')
    if (changes.role && changes.role !== 'owner') {
      throw new Error('The owner’s role cannot be changed.')
    }
  }
  await updateDoc(ref, changes)
}

/**
 * A leaver is deactivated, not deleted: their past orders still reference
 * them, and an audit trail with holes is worse than none.
 */
export async function removeStaff(id) {
  await updateStaff(id, { isActive: false })
}

export async function setRolePermission(role, permissionId, granted) {
  if (role === 'owner') throw new Error('The owner keeps every permission.')
  const ref = doc(root(), 'config', 'access')

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)
    const map = snap.data()?.rolePermissions ?? DEFAULT_ROLE_PERMISSIONS
    const current = new Set(map[role] ?? [])
    if (granted) current.add(permissionId)
    else current.delete(permissionId)
    tx.set(ref, { rolePermissions: { ...map, [role]: [...current] } }, { merge: true })
  })
}

export async function resetRolePermissions(role) {
  if (role === 'owner') return
  const ref = doc(root(), 'config', 'access')
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)
    const map = snap.data()?.rolePermissions ?? DEFAULT_ROLE_PERMISSIONS
    tx.set(
      ref,
      { rolePermissions: { ...map, [role]: [...(DEFAULT_ROLE_PERMISSIONS[role] ?? [])] } },
      { merge: true }
    )
  })
}

/** Mock-only; a real backend has nothing to reset to. */
export const resetAll = undefined
