/**
 * In-memory stand-in for Firestore, used while the design is being built.
 *
 * It deliberately copies the two Firestore behaviours the app is built around:
 *
 *   1. subscribe() returns an unsubscribe function, exactly like onSnapshot.
 *      The hooks keep their strict-cleanup discipline, so restoring Firestore
 *      is a change of import, not a change of architecture.
 *   2. Reads and writes are async with a little latency, so loading and
 *      disabled states are real and can actually be designed against.
 *
 * Nothing here persists. Reloading the page resets the restaurant, which is
 * what you want when reviewing a design.
 */
import {
  MENU,
  SEED_SOLD_OUT,
  seedOrders,
  seedSessions,
  seedStaff,
  seedTables,
} from './data'
import { DEFAULT_ROLE_PERMISSIONS } from '../auth/permissions'

const LATENCY_MS = 180

const state = {
  tables: seedTables(),
  sessions: seedSessions(),
  menu: MENU.map((item) => ({ ...item })),
  orders: seedOrders(),
  soldOut: [...SEED_SOLD_OUT],
  staff: seedStaff(),
  rolePermissions: JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS)),
}

// collection name -> Set of callbacks
const listeners = {
  tables: new Set(),
  sessions: new Set(),
  menu: new Set(),
  orders: new Set(),
  inventory: new Set(),
  staff: new Set(),
  access: new Set(),
}

const clone = (value) => JSON.parse(JSON.stringify(value))
const wait = (ms = LATENCY_MS) => new Promise((resolve) => setTimeout(resolve, ms))

function snapshotFor(key) {
  if (key === 'inventory') return { sold_out_items: [...state.soldOut] }
  if (key === 'access') return clone(state.rolePermissions)
  return clone(state[key])
}

/**
 * Cross-tab sync.
 *
 * Firestore's whole point is that a write on the kitchen tablet lands on the
 * guest's phone a moment later. A plain in-memory mock is per-tab, which would
 * make the design impossible to review properly — you could never watch the
 * three surfaces react to each other. BroadcastChannel reproduces that one
 * behaviour across tabs of the same origin, so the demo behaves like the real
 * thing: open /kitchen and /customer/3 side by side and 86 a dish.
 */
const channel =
  typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('service-mock') : null

function emitLocal(key) {
  const payload = snapshotFor(key)
  for (const callback of listeners[key]) callback(payload)
}

function emit(key) {
  emitLocal(key)
  channel?.postMessage({ type: 'state', key, state: clone(state) })
}

function adopt(incoming) {
  if (!incoming) return
  state.tables = incoming.tables
  state.sessions = incoming.sessions
  state.menu = incoming.menu
  state.orders = incoming.orders
  state.soldOut = incoming.soldOut
  state.staff = incoming.staff
  state.rolePermissions = incoming.rolePermissions
  // Notify locally only — re-broadcasting here would put two tabs in an
  // endless echo.
  for (const key of Object.keys(listeners)) emitLocal(key)
}

if (channel) {
  channel.onmessage = (event) => {
    const message = event.data
    if (!message) return

    if (message.type === 'state') return adopt(message.state)

    // A tab that opens mid-service has only the seed data. Rather than wait
    // for the next write to catch up — which could be minutes — it asks, and
    // whoever is already open answers. Without this, opening the manager
    // screen in a second window would show an empty floor while the first
    // window showed three tables seated.
    if (message.type === 'hello') {
      channel.postMessage({ type: 'state', key: 'all', state: clone(state) })
    }
  }

  channel.postMessage({ type: 'hello' })
}

/**
 * Mirrors onSnapshot: fires once with current data, then on every change.
 * ALWAYS returns an unsubscribe function.
 */
export function subscribe(key, callback) {
  listeners[key].add(callback)

  // Async first emit, so consumers see a genuine loading tick.
  const timer = setTimeout(() => {
    if (listeners[key].has(callback)) callback(snapshotFor(key))
  }, 120)

  return () => {
    clearTimeout(timer)
    listeners[key].delete(callback)
  }
}

/** Mirrors getDocs: one-shot read, no subscription. */
export async function fetchOnce(key) {
  await wait()
  return snapshotFor(key)
}

// ---------------------------------------------------------------------------
// Workflow A — knock & approval
// ---------------------------------------------------------------------------

export async function knockOnTable(tableNumber) {
  await wait(120)
  const table = state.tables.find((t) => t.table_number === Number(tableNumber))
  if (!table) throw new Error(`Table ${tableNumber} does not exist. Check the QR code.`)

  if (table.status === 'available') {
    table.status = 'pending_approval'
    emit('tables')
  }
  return clone(table)
}

/**
 * Seat one or more tables as a single session.
 *
 * `staff` is recorded on the session so the whole restaurant can see who is
 * looking after a table. Without it the floor plan can say a table is busy
 * but not whose it is, which is the first thing anyone actually asks.
 */
export async function approveAndLinkTables(tableNumbers, { covers, staff, partyName } = {}) {
  await wait()
  if (!tableNumbers?.length) throw new Error('Select at least one table to approve.')

  const sessionId = `sess_${Date.now().toString(36)}`
  const linked = tableNumbers.map(Number).sort((a, b) => a - b)
  const seats = linked.reduce(
    (sum, n) => sum + (state.tables.find((t) => t.table_number === n)?.seats ?? 2),
    0
  )

  state.sessions.push({
    id: sessionId,
    session_id: sessionId,
    linked_tables: linked,
    status: 'active',
    created_at: new Date(),
    covers: covers ?? seats,
    party_name: String(partyName || '').trim() || null,
    opened_by: staff ? { id: staff.id, name: staff.name, role: staff.role } : null,
  })

  for (const number of linked) {
    const table = state.tables.find((t) => t.table_number === number)
    if (table) {
      table.status = 'occupied'
      table.session_id = sessionId
      table.served_by = staff?.name ?? null
      // Denormalised onto the table so the floor plan can name the party
      // without joining to the session for every tile.
      table.party_name = String(partyName || '').trim() || null
    }
  }

  emit('tables')
  emit('sessions')
  return sessionId
}

/**
 * Join free tables onto a party that is already running.
 *
 * A table that is seated mid-service — a friend arrives late, a party of four
 * becomes six — must land on the SAME session, or the kitchen plates two
 * tickets separately and the bill splits in two. Orders already placed stay
 * exactly where they are: billing reads by session_id, so everything from
 * before and after the join totals together.
 *
 * Only free tables may be joined. Pulling an occupied table into another
 * party would merge two bills, which is never what anyone meant.
 */
export async function addTablesToSession(tableNumbers, sessionId, { staff } = {}) {
  await wait()

  const session = state.sessions.find(
    (s) => s.session_id === sessionId && s.status === 'active'
  )
  if (!session) throw new Error('That party has already been closed.')

  const wanted = (tableNumbers ?? []).map(Number)
  if (!wanted.length) throw new Error('Select at least one table to add.')

  const clash = wanted.find((n) => {
    const t = state.tables.find((x) => x.table_number === n)
    return t && t.status === 'occupied'
  })
  if (clash) {
    throw new Error(`Table ${clash} already has a party on it.`)
  }

  const added = []
  for (const number of wanted) {
    const table = state.tables.find((t) => t.table_number === number)
    if (!table) continue
    table.status = 'occupied'
    table.session_id = sessionId
    // The joined table shows the same party and the same server, because to
    // everyone on the floor it is now one table.
    table.party_name = session.party_name ?? null
    table.served_by = session.opened_by?.name ?? staff?.name ?? null
    session.covers = (session.covers ?? 0) + (table.seats ?? 2)
    added.push(number)
  }

  session.linked_tables = [...new Set([...(session.linked_tables ?? []), ...added])].sort(
    (a, b) => a - b
  )

  emit('tables')
  emit('sessions')
  return added
}

/**
 * Merge two parties that are already seated and already ordering.
 *
 * Two tables decide to pay together. Everything already sent to the kitchen
 * from BOTH sides has to end up on one bill, so the orders are re-pointed at
 * the surviving session rather than left behind — a bill that reads by
 * session_id would otherwise silently drop half the food.
 *
 * The surviving session keeps its own name and opening time, because that is
 * the tab the floor has been calling it all evening.
 */
export async function mergeSessions(keepSessionId, mergeSessionId) {
  await wait()
  if (keepSessionId === mergeSessionId) throw new Error('That is the same party.')

  const keep = state.sessions.find(
    (s) => s.session_id === keepSessionId && s.status === 'active'
  )
  const gone = state.sessions.find(
    (s) => s.session_id === mergeSessionId && s.status === 'active'
  )
  if (!keep || !gone) throw new Error('One of those parties has already been closed.')

  // Re-point every order, placed before or after this moment.
  for (const order of state.orders) {
    if (order.session_id === mergeSessionId) order.session_id = keepSessionId
  }

  // Move the tables across.
  for (const number of gone.linked_tables ?? []) {
    const table = state.tables.find((t) => t.table_number === number)
    if (!table) continue
    table.session_id = keepSessionId
    table.party_name = keep.party_name ?? null
    table.served_by = keep.opened_by?.name ?? table.served_by ?? null
  }

  keep.linked_tables = [
    ...new Set([...(keep.linked_tables ?? []), ...(gone.linked_tables ?? [])]),
  ].sort((a, b) => a - b)
  keep.covers = (keep.covers ?? 0) + (gone.covers ?? 0)

  // The absorbed session is closed, not deleted, so nothing that still refers
  // to it breaks — it simply drops out of the open-tabs list.
  gone.status = 'closed'
  gone.linked_tables = []
  gone.merged_into = keepSessionId

  emit('tables')
  emit('sessions')
  emit('orders')
  return keep.session_id
}

export async function rejectTable(tableNumber) {
  await wait(120)
  const table = state.tables.find((t) => t.table_number === Number(tableNumber))
  if (table) {
    table.status = 'available'
    table.session_id = null
    table.served_by = null
    emit('tables')
  }
}

// ---------------------------------------------------------------------------
// Workflow B — menu & inventory
// ---------------------------------------------------------------------------

export async function addMenuItem(item) {
  await wait()
  const name = String(item.name || '').trim()
  if (!name) throw new Error('Name is required.')

  const price = Number(item.price)
  if (!Number.isFinite(price) || price < 0) throw new Error('Price must be a positive number.')

  const created = {
    id: `m_${Date.now().toString(36)}`,
    name,
    price,
    description: String(item.description || '').trim(),
    category: item.category || 'mains',
    diet: item.diet || 'veg',
    spice: Number(item.spice) || 0,
    image_url: String(item.image_url || '').trim(),
  }
  state.menu.push(created)
  emit('menu')
  return created.id
}

export async function setItemSoldOut(menuItemId, soldOut) {
  await wait(120)
  const already = state.soldOut.includes(menuItemId)
  if (soldOut && !already) state.soldOut.push(menuItemId)
  if (!soldOut && already) state.soldOut = state.soldOut.filter((id) => id !== menuItemId)
  emit('inventory')
}

// ---------------------------------------------------------------------------
// Workflow C — orders & billing
// ---------------------------------------------------------------------------

export async function submitOrder({ sessionId, tableNumber, items }) {
  await wait()
  if (!sessionId) throw new Error('No active session.')
  if (!items?.length) throw new Error('Cart is empty.')

  const order = {
    id: `ord_${Date.now().toString(36)}`,
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
    created_at: new Date(),
  }
  state.orders.push(order)
  emit('orders')
  return order.id
}

export async function setOrderStatus(orderId, status, prepTimeMinutes) {
  await wait(120)
  const order = state.orders.find((o) => o.id === orderId)
  if (!order) return
  order.status = status
  if (prepTimeMinutes !== undefined) {
    order.prep_time_minutes =
      prepTimeMinutes === null || prepTimeMinutes === '' ? null : Number(prepTimeMinutes)
  }
  emit('orders')
}

export async function fetchOrdersForSession(sessionId) {
  await wait()
  return clone(state.orders.filter((o) => o.session_id === sessionId))
}

export async function fetchSessionsByStatus(status = 'active') {
  await wait()
  return clone(state.sessions.filter((s) => s.status === status))
}

export async function closeSession(sessionId) {
  await wait()
  const session = state.sessions.find((s) => s.session_id === sessionId)
  if (!session) return

  session.status = 'closed'
  for (const number of session.linked_tables ?? []) {
    const table = state.tables.find((t) => t.table_number === number)
    if (table) {
      // Settling the bill does NOT free the table. Guests linger, and plates
      // stay on it either way. It goes to the floor team to clear first.
      table.status = 'needs_clearing'
      table.session_id = null
    }
  }

  emit('tables')
  emit('sessions')
}

/**
 * Free a table from the floor plan.
 *
 * If the table still has a live session — the party left without the tab
 * being settled — that session is closed too. A tab left open against a table
 * that now has different people at it is how the wrong party gets charged.
 */
export async function freeTable(tableNumber) {
  await wait(140)
  const table = state.tables.find((t) => t.table_number === Number(tableNumber))
  if (!table) return

  const session = state.sessions.find((s) => s.session_id === table.session_id)
  if (session && session.status === 'active') {
    session.status = 'closed'
    // Any other table on the same session goes to clearing, not free — nobody
    // has said those are wiped down.
    for (const other of session.linked_tables ?? []) {
      if (other === table.table_number) continue
      const sibling = state.tables.find((t) => t.table_number === other)
      if (sibling) {
        sibling.status = 'needs_clearing'
        sibling.session_id = null
      }
    }
    emit('sessions')
  }

  table.status = 'available'
  table.session_id = null
  table.served_by = null
  table.party_name = null
  emit('tables')
}

/** Wiped down and reset — the table is genuinely ready for the next party. */
export async function markTableCleared(tableNumber) {
  await wait(140)
  const table = state.tables.find((t) => t.table_number === Number(tableNumber))
  if (!table) return
  table.status = 'available'
  table.session_id = null
  table.served_by = null
  table.party_name = null
  emit('tables')
}

// ---------------------------------------------------------------------------
// Reset — restores the opening state of the restaurant. Not a simulation:
// nothing here invents activity, it only clears back to an empty service.
// ---------------------------------------------------------------------------

export function resetAll() {
  state.tables = seedTables()
  state.sessions = seedSessions()
  state.menu = MENU.map((item) => ({ ...item }))
  state.orders = seedOrders()
  state.soldOut = [...SEED_SOLD_OUT]
  state.staff = seedStaff()
  state.rolePermissions = JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS))
  for (const key of Object.keys(listeners)) emit(key)
}

// ---------------------------------------------------------------------------
// Staff & access
// ---------------------------------------------------------------------------

/**
 * Sign in by PIN.
 *
 * Checked client-side because there is no server here. That is acceptable for
 * a design build and NOT acceptable in production — anyone can read the PIN
 * list out of the bundle. When Firebase comes back, this becomes a real auth
 * call and the permission map moves behind security rules.
 */
export async function signInWithPin(pin) {
  await wait(220)
  const person = state.staff.find((u) => u.pin === String(pin).trim() && u.active)
  if (!person) throw new Error('That PIN was not recognised.')
  const { pin: _omit, ...safe } = person
  return safe
}

export async function addStaff({ name, role, pin }) {
  await wait()
  const trimmed = String(name || '').trim()
  if (!trimmed) throw new Error('Name is required.')
  if (!/^\d{4}$/.test(String(pin))) throw new Error('PIN must be 4 digits.')
  if (state.staff.some((u) => u.pin === String(pin))) {
    throw new Error('That PIN is already in use.')
  }

  state.staff.push({
    id: `u_${Date.now().toString(36)}`,
    name: trimmed,
    role: role || 'waiter',
    pin: String(pin),
    active: true,
  })
  emit('staff')
}

/**
 * Edit a person — name, role or PIN.
 *
 * The owner's own record is editable (they must be able to change their own
 * code) except for the two things that would lock them out: their role, and
 * being switched off.
 */
export async function updateStaff(id, changes) {
  await wait(140)
  const person = state.staff.find((u) => u.id === id)
  if (!person) throw new Error('That person no longer exists.')

  if (person.role === 'owner') {
    if (changes.active === false) throw new Error('The owner account cannot be switched off.')
    if (changes.role && changes.role !== 'owner') {
      throw new Error('The owner’s role cannot be changed.')
    }
  }

  if (changes.role === 'owner' && person.role !== 'owner') {
    throw new Error('There can only be one owner account.')
  }

  if (changes.name !== undefined) {
    const trimmed = String(changes.name).trim()
    if (!trimmed) throw new Error('Name cannot be empty.')
    changes.name = trimmed
  }

  if (changes.pin !== undefined) {
    const pin = String(changes.pin).trim()
    if (!/^\d{4}$/.test(pin)) throw new Error('PIN must be exactly 4 digits.')
    if (state.staff.some((u) => u.id !== id && u.pin === pin)) {
      throw new Error('Another person already uses that PIN.')
    }
    changes.pin = pin
  }

  Object.assign(person, changes)
  emit('staff')
  return { ...person }
}

export async function removeStaff(id) {
  await wait(120)
  const person = state.staff.find((u) => u.id === id)
  if (person?.role === 'owner') throw new Error('The owner account cannot be removed.')
  state.staff = state.staff.filter((u) => u.id !== id)
  emit('staff')
}

/** Owner-only: grant or revoke one capability for one role. */
export async function setRolePermission(role, permissionId, granted) {
  await wait(80)
  if (role === 'owner') throw new Error('The owner keeps every permission.')

  const current = new Set(state.rolePermissions[role] ?? [])
  if (granted) current.add(permissionId)
  else current.delete(permissionId)
  state.rolePermissions[role] = [...current]
  emit('access')
}

export async function resetRolePermissions(role) {
  await wait(120)
  if (role === 'owner') return
  state.rolePermissions[role] = [...(DEFAULT_ROLE_PERMISSIONS[role] ?? [])]
  emit('access')
}
