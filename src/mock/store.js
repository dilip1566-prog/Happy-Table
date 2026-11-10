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
import { TENANTS } from './data'
import { DEFAULT_ROLE_PERMISSIONS } from '../auth/permissions'
import { getActiveTenant } from '../tenant/current'
import { tenantUrl } from '../tenant/resolve'
import { isValidEmail, normaliseEmail } from '../lib/validate'
import { passwordProblem } from '../lib/passwords'
import { slugProblem } from '../lib/slug'

const LATENCY_MS = 180

/**
 * One store per restaurant, created on first touch.
 *
 * Firestore gets this isolation from subcollection paths; the mock has to do
 * it by hand. Without it every tenant would share one set of tables and one
 * menu, and "two restaurants" would be a label rather than a fact.
 */
const stores = new Map()

/**
 * Restaurants created at runtime from the operator console.
 *
 * Held apart from TENANTS, which is seed data compiled into the bundle, and
 * persisted to localStorage — the one deliberate exception to "nothing here
 * persists". The platform's roster of restaurants lives in Firestore in
 * production and survives a page load there, so a demo where a restaurant
 * you just created 404s on the next navigation would be testing the wrong
 * thing. Live service state — tables, orders, sessions — stays in memory and
 * still resets on reload.
 */
const REGISTRY_KEY = 'happytable-mock-restaurants'

const extraTenants = new Map()

/** Rehydrate into the same shape TENANTS uses, so nothing downstream cares. */
function hydrateTenant(record) {
  const tablesCount = Number(record.tablesCount) || 20
  return {
    ...record,
    tables: () =>
      Array.from({ length: tablesCount }, (_, index) => ({
        id: String(index + 1),
        table_number: index + 1,
        status: 'available',
        session_id: null,
        seats: index < 4 ? 2 : index < tablesCount - 2 ? 4 : 6,
      })),
    staff: () => (record.staffSeed ?? []).map((person) => ({ ...person })),
  }
}

function loadRegistry() {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw)
    for (const [id, record] of Object.entries(parsed ?? {})) {
      extraTenants.set(id, hydrateTenant(record))
    }
  } catch {
    /* private mode, or a registry written by an older shape — start clean */
  }
}

function saveRegistry() {
  try {
    const plain = {}
    for (const [id, tenant] of extraTenants) {
      // Drop the two generated functions; everything else is JSON already.
      const { tables, staff, ...rest } = tenant
      plain[id] = rest
    }
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(plain))
  } catch {
    /* non-fatal: the restaurant still works until this tab closes */
  }
}

loadRegistry()

/**
 * Outstanding set-your-password links, also persisted.
 *
 * Same reasoning as the registry, and the same exception. In Firebase these
 * are minted and held by Auth, so they survive the browser being closed; a
 * mock that lost them the moment the link was clicked would make the invite
 * flow impossible to demonstrate, because clicking a link IS a page load.
 *
 * Nothing of value is protected by these in demo mode — the staff list has
 * plaintext passwords in it already — so this is no weaker than what sits
 * beside it. The real backend keeps all of it server-side.
 */
const RESETS_KEY = 'happytable-mock-resets'

function readResetStore() {
  try {
    const raw = localStorage.getItem(RESETS_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function loadResets(tenantId) {
  const rows = readResetStore()[tenantId]
  return Array.isArray(rows) ? rows : []
}

function persistResets(tenantId, resets) {
  try {
    const all = readResetStore()
    all[tenantId] = resets
    localStorage.setItem(RESETS_KEY, JSON.stringify(all))
  } catch {
    /* non-fatal: the link still works until this tab closes */
  }
}

/**
 * Keep a password a runtime-created restaurant's owner has just chosen.
 *
 * Their staff list is rebuilt from the registry on every load, so without
 * this the owner sets a password, reloads, and is locked out of a
 * restaurant that was created ten seconds ago. Seeded restaurants are not
 * affected: theirs come back as demo1234 by design.
 */
function rememberSeedPassword(tenantId, person) {
  const runtime = extraTenants.get(tenantId)
  if (!runtime) return
  const seeded = (runtime.staffSeed ?? []).find((row) => row.id === person.id)
  if (!seeded) return
  seeded.password = person.password
  delete seeded.mustSetPassword
  saveRegistry()
}

/** Seed data for a restaurant, whether compiled in or created today. */
function tenantDef(id) {
  return extraTenants.get(id) ?? TENANTS[id] ?? null
}

/** Every restaurant the mock knows about, newest last. */
function allTenantEntries() {
  return [...Object.entries(TENANTS), ...extraTenants.entries()]
}

function createStore(tenantId) {
  const seed = tenantDef(tenantId) ?? TENANTS.bobbys
  return {
    state: {
      tables: seed.tables(),
      sessions: [],
      menu: seed.menu.map((item) => ({ ...item })),
      orders: [],
      soldOut: [...(seed.soldOut ?? [])],
      staff: seed.staff(),
      rolePermissions: JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS)),
      // Outstanding set-your-password links. Firebase keeps these itself and
      // mails them out; with no mail server here they are handed back to the
      // caller to pass on by hand, and kept across page loads so that
      // clicking one does not destroy it.
      resets: loadResets(tenantId),
    },
    // collection name -> Set of callbacks
    listeners: {
      tables: new Set(),
      sessions: new Set(),
      menu: new Set(),
      orders: new Set(),
      inventory: new Set(),
      staff: new Set(),
      access: new Set(),
    },
  }
}

function storeFor(tenantId) {
  const id = tenantId || getActiveTenant() || 'bobbys'
  if (!stores.has(id)) stores.set(id, createStore(id))
  return stores.get(id)
}

/** The active restaurant's data. */
const S = () => storeFor().state
/** The active restaurant's listeners. */
const L = () => storeFor().listeners

const clone = (value) => JSON.parse(JSON.stringify(value))
const wait = (ms = LATENCY_MS) => new Promise((resolve) => setTimeout(resolve, ms))

function payloadFor(target, key) {
  if (key === 'inventory') return { sold_out_items: [...target.state.soldOut] }
  if (key === 'access') return clone(target.state.rolePermissions)
  return clone(target.state[key])
}

function snapshotFor(key) {
  return payloadFor(storeFor(), key)
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
  for (const callback of L()[key]) callback(payload)
}

/**
 * Notify one named restaurant's listeners.
 *
 * Named rather than active, because the operator console writes menus for
 * restaurants it is not itself "inside" — on the apex there is no active
 * tenant at all, so an emit that asked `getActiveTenant()` would quietly
 * fire into Bobby's store while editing somebody else's menu.
 */
function emitFor(tenantId, key) {
  const target = storeFor(tenantId)
  const payload = payloadFor(target, key)
  for (const callback of target.listeners[key]) callback(payload)
  channel?.postMessage({
    type: 'state',
    tenant: tenantId,
    key,
    state: clone(target.state),
  })
}

function emit(key) {
  emitFor(getActiveTenant() || 'bobbys', key)
}

/**
 * Take on state broadcast by another tab.
 *
 * Scoped by tenant: a message from a tab showing Bobby's must never land in
 * the Dhaba's store. Without the check, two tabs on different restaurants
 * would overwrite each other — the exact cross-tenant leak this whole refactor
 * exists to prevent.
 */
function adopt(tenant, incoming) {
  if (!incoming || !tenant) return
  const target = storeFor(tenant)
  target.state = {
    tables: incoming.tables,
    sessions: incoming.sessions,
    menu: incoming.menu,
    orders: incoming.orders,
    soldOut: incoming.soldOut,
    staff: incoming.staff,
    rolePermissions: incoming.rolePermissions,
    // Carried across tabs like everything else, or a link issued in the
    // owner's window would be unredeemable in the one the new starter opens.
    resets: incoming.resets ?? [],
  }
  // Notify locally only — re-broadcasting here would put two tabs in an
  // endless echo.
  for (const key of Object.keys(target.listeners)) {
    const payload =
      key === 'inventory'
        ? { sold_out_items: [...target.state.soldOut] }
        : key === 'access'
          ? clone(target.state.rolePermissions)
          : clone(target.state[key])
    for (const callback of target.listeners[key]) callback(payload)
  }
}

if (channel) {
  channel.onmessage = (event) => {
    const message = event.data
    if (!message) return

    if (message.type === 'state') return adopt(message.tenant, message.state)

    // A tab that opens mid-service has only the seed data. Rather than wait
    // for the next write to catch up — which could be minutes — it asks, and
    // whoever is already open answers. Without this, opening the manager
    // screen in a second window would show an empty floor while the first
    // window showed three tables seated.
    if (message.type === 'hello') {
      channel.postMessage({
        type: 'state',
        tenant: getActiveTenant(),
        key: 'all',
        state: clone(S()),
      })
    }
  }

  channel.postMessage({ type: 'hello' })
}

/**
 * Mirrors onSnapshot: fires once with current data, then on every change.
 * ALWAYS returns an unsubscribe function.
 */
export function subscribe(key, callback) {
  L()[key].add(callback)

  // Async first emit, so consumers see a genuine loading tick.
  const timer = setTimeout(() => {
    if (L()[key].has(callback)) callback(snapshotFor(key))
  }, 120)

  return () => {
    clearTimeout(timer)
    L()[key].delete(callback)
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
  const table = S().tables.find((t) => t.table_number === Number(tableNumber))
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
/**
 * Table codes start at 51 so they can never be mistaken for a table number.
 * A guest who hears "sixty-five" and a room numbered 1-20 cannot collide, and
 * staff reading one out loud never has to clarify which kind of number it is.
 *
 * Two digits is deliberate: it is said once across a noisy dining room and
 * typed with a thumb. If a very large restaurant ever exhausts 51-99 it rolls
 * on to three digits rather than refusing to seat anyone.
 */
const CODE_FLOOR = 51
const CODE_CEILING = 99

function codesInUse() {
  const taken = new Set()
  for (const session of S().sessions) {
    if (session.status !== 'active') continue
    taken.add(String(session.access_code))
    // Payer codes share one space with table codes. Two guests on different
    // tables being handed the same number is the one failure that silently
    // puts food on a stranger's bill.
    for (const tab of session.tabs ?? []) taken.add(String(tab.code))
  }
  return taken
}

export function suggestAccessCode() {
  const taken = codesInUse()
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

/**
 * Every restaurant on the platform, for the operator console.
 *
 * Firestore answers this with one getDocs on `restaurants`; the mock reads
 * the same registry the tenant lookup uses, so the console can never show a
 * restaurant you cannot actually open.
 */
export async function listRestaurants() {
  await wait(120)
  return allTenantEntries().map(([id, tenant]) => ({
    id,
    subdomain: id,
    name: tenant.name,
    tagline: tenant.tagline,
    status: tenant.status,
    // Carried here because the operator console edits menus from this list
    // without ever opening the restaurant: without the sections, the
    // quick-add form has nothing to file a dish under and the menu is
    // grouped by raw slug instead of by the restaurant's own headings.
    // Firestore returns them for free by spreading the document.
    categories: tenant.categories ?? [],
    customDomain: tenant.customDomain ?? null,
    currency: tenant.currency ?? 'GBP',
    ownerEmail: tenant.ownerEmail ?? tenant.staff()[0]?.email ?? '',
    createdAt: tenant.createdAt ?? null,
    tables: tenant.tables().length,
    // Read through the live store where one exists, so a dish added a moment
    // ago is counted. Falling back to the seed means a restaurant nobody has
    // opened yet still reports its real size.
    dishes: (stores.get(id)?.state.menu ?? tenant.menu).length,
  }))
}

/**
 * Several free codes at once, for a table paying separately.
 *
 * Drawn together rather than by calling suggestAccessCode in a loop, because
 * nothing is written to the store between those calls — the loop would
 * happily hand the same number to two people at one table.
 */
export function suggestAccessCodes(count) {
  const taken = codesInUse()
  const out = []
  const free = []
  for (let n = CODE_FLOOR; n <= CODE_CEILING; n += 1) {
    if (!taken.has(String(n))) free.push(String(n))
  }
  while (out.length < count && free.length) {
    out.push(free.splice(Math.floor(Math.random() * free.length), 1)[0])
  }
  for (let n = 100; n <= 999 && out.length < count; n += 1) {
    if (!taken.has(String(n))) out.push(String(n))
  }
  if (out.length < count) throw new Error('Not enough table codes left. Close a tab first.')
  return out
}

/** Resolve a code a guest has typed in. */
export async function findSessionByCode(code) {
  await wait(160)
  const wanted = String(code ?? '').trim()

  let matchedTab = null
  const session = S().sessions.find((s) => {
    if (s.status !== 'active') return false
    if (String(s.access_code) === wanted) return true
    const tab = (s.tabs ?? []).find((t) => String(t.code) === wanted)
    if (tab) {
      matchedTab = tab
      return true
    }
    return false
  })
  if (!session) return null

  return {
    session_id: session.session_id,
    party_name: session.party_name ?? null,
    table_number: (session.linked_tables ?? [])[0] ?? null,
    linked_tables: session.linked_tables ?? [],
    // Null when the whole table is on one bill, or when someone used the
    // table's own code rather than their personal one.
    tab_code: matchedTab ? String(matchedTab.code) : null,
    tab_label: matchedTab ? matchedTab.label : null,
  }
}

export async function approveAndLinkTables(
  tableNumbers,
  { covers, staff, partyName, accessCode, tabs } = {}
) {
  await wait()
  if (!tableNumbers?.length) throw new Error('Select at least one table to approve.')

  const sessionId = `sess_${Date.now().toString(36)}`
  const linked = tableNumbers.map(Number).sort((a, b) => a - b)
  const seats = linked.reduce(
    (sum, n) => sum + (S().tables.find((t) => t.table_number === n)?.seats ?? 2),
    0
  )

  S().sessions.push({
    id: sessionId,
    session_id: sessionId,
    linked_tables: linked,
    status: 'active',
    created_at: new Date(),
    covers: covers ?? seats,
    party_name: String(partyName || '').trim() || null,
    access_code: String(accessCode || '').trim() || suggestAccessCode(),
    // Empty when the table is on one bill. One entry per person when they
    // are paying separately; each entry's code opens the menu and stamps
    // every order that person sends.
    tabs: (tabs ?? [])
      .filter((t) => t && String(t.code).trim())
      .map((t, index) => ({
        code: String(t.code).trim(),
        label: String(t.label || '').trim() || `Guest ${index + 1}`,
      })),
    opened_by: staff ? { id: staff.id, name: staff.name, role: staff.role } : null,
  })

  for (const number of linked) {
    const table = S().tables.find((t) => t.table_number === number)
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

  const session = S().sessions.find(
    (s) => s.session_id === sessionId && s.status === 'active'
  )
  if (!session) throw new Error('That party has already been closed.')

  const wanted = (tableNumbers ?? []).map(Number)
  if (!wanted.length) throw new Error('Select at least one table to add.')

  const clash = wanted.find((n) => {
    const t = S().tables.find((x) => x.table_number === n)
    return t && t.status === 'occupied'
  })
  if (clash) {
    throw new Error(`Table ${clash} already has a party on it.`)
  }

  const added = []
  for (const number of wanted) {
    const table = S().tables.find((t) => t.table_number === number)
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

  const keep = S().sessions.find(
    (s) => s.session_id === keepSessionId && s.status === 'active'
  )
  const gone = S().sessions.find(
    (s) => s.session_id === mergeSessionId && s.status === 'active'
  )
  if (!keep || !gone) throw new Error('One of those parties has already been closed.')

  // Re-point every order, placed before or after this moment.
  for (const order of S().orders) {
    if (order.session_id === mergeSessionId) order.session_id = keepSessionId
  }

  // Move the tables across.
  for (const number of gone.linked_tables ?? []) {
    const table = S().tables.find((t) => t.table_number === number)
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
  const table = S().tables.find((t) => t.table_number === Number(tableNumber))
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
  S().menu.push(created)
  emit('menu')
  return created.id
}

export async function setItemSoldOut(menuItemId, soldOut) {
  await wait(120)
  const already = S().soldOut.includes(menuItemId)
  if (soldOut && !already) S().soldOut.push(menuItemId)
  if (!soldOut && already) S().soldOut = S().soldOut.filter((id) => id !== menuItemId)
  emit('inventory')
}

// ---------------------------------------------------------------------------
// Workflow C — orders & billing
// ---------------------------------------------------------------------------

export async function submitOrder({ sessionId, tableNumber, items, note, tabCode }) {
  await wait()
  if (!sessionId) throw new Error('No active session.')
  if (!items?.length) throw new Error('Cart is empty.')

  const order = {
    id: `ord_${Date.now().toString(36)}`,
    session_id: sessionId,
    ordered_by_table: Number(tableNumber),
    // Which person on this table is paying for it. Null means the table.
    tab_code: tabCode ? String(tabCode) : null,
    // Whatever the guest asked for in their own words. Capped here as well
    // as in the box, because the box is not the only possible caller.
    note: String(note || '').trim().slice(0, 500) || null,
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
  S().orders.push(order)
  emit('orders')
  return order.id
}

export async function setOrderStatus(orderId, status, prepTimeMinutes) {
  await wait(120)
  const order = S().orders.find((o) => o.id === orderId)
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
  return clone(S().orders.filter((o) => o.session_id === sessionId))
}

export async function fetchSessionsByStatus(status = 'active') {
  await wait()
  return clone(S().sessions.filter((s) => s.status === status))
}

export async function closeSession(sessionId) {
  await wait()
  const session = S().sessions.find((s) => s.session_id === sessionId)
  if (!session) return

  session.status = 'closed'
  for (const number of session.linked_tables ?? []) {
    const table = S().tables.find((t) => t.table_number === number)
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
  const table = S().tables.find((t) => t.table_number === Number(tableNumber))
  if (!table) return

  const session = S().sessions.find((s) => s.session_id === table.session_id)
  if (session && session.status === 'active') {
    session.status = 'closed'
    // Any other table on the same session goes to clearing, not free — nobody
    // has said those are wiped down.
    for (const other of session.linked_tables ?? []) {
      if (other === table.table_number) continue
      const sibling = S().tables.find((t) => t.table_number === other)
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
  const table = S().tables.find((t) => t.table_number === Number(tableNumber))
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
  // Re-seeds from this restaurant's own fixtures, so resetting Bobby's does
  // not hand it the Dhaba's menu.
  const id = getActiveTenant() || 'bobbys'
  const fresh = createStore(id).state
  const current = storeFor(id)
  current.state = fresh
  for (const key of Object.keys(current.listeners)) emit(key)
}

// ---------------------------------------------------------------------------
// Staff & access
// ---------------------------------------------------------------------------

/**
 * Sign in with an email address and a password.
 *
 * Checked client-side because there is no server here. That is acceptable
 * for a design build and NOT acceptable in production — anyone can read the
 * staff list out of the bundle. When Firebase comes back this becomes
 * signInWithEmailAndPassword and the permission map moves behind security
 * rules.
 *
 * The two failures are reported identically on purpose: telling a stranger
 * that an address exists but the password is wrong tells them which
 * addresses to keep guessing at.
 */
export async function signInWithEmail(email, password) {
  await wait(220)
  const wanted = normaliseEmail(email)
  if (!isValidEmail(wanted)) throw new Error('Enter a valid email address.')
  if (!String(password ?? '')) throw new Error('Enter your password.')

  const person = S().staff.find(
    (u) => normaliseEmail(u.email) === wanted && u.password === password && u.active
  )
  if (!person) throw new Error('Email or password not recognised.')
  const { password: _omit, ...safe } = person
  return safe
}

/**
 * Hire someone.
 *
 * `password` is optional, and leaving it out is the better path: the profile
 * is created with no password at all and an invite link is handed back for
 * the new starter to set their own. A password the owner types is a password
 * the owner knows, which then has to be communicated across a noisy kitchen
 * and usually ends up on a sticky note by the till.
 *
 * Returns the invite when there is one, so the caller can pass it on.
 */
export async function addStaff({ name, role, email, password }) {
  await wait()
  const trimmed = String(name || '').trim()
  if (!trimmed) throw new Error('Name is required.')

  const address = normaliseEmail(email)
  if (!isValidEmail(address)) throw new Error('Enter a valid email address.')
  if (S().staff.some((u) => normaliseEmail(u.email) === address)) {
    throw new Error('Someone here already uses that email address.')
  }

  const chosen = String(password ?? '')
  if (chosen) {
    const problem = passwordProblem(chosen)
    if (problem) throw new Error(problem)
  }

  const person = {
    id: `u_${Date.now().toString(36)}`,
    name: trimmed,
    role: role || 'waiter',
    email: address,
    active: true,
  }

  if (chosen) person.password = chosen
  // No password field at all rather than an empty one: signInWithEmail
  // refuses an empty password before it ever reaches the comparison, so
  // there is no value a stranger could send that would match.
  else person.mustSetPassword = true

  S().staff.push(person)
  emit('staff')

  const invite = chosen ? null : issueReset(person, 'invite')
  if (invite) emit('staff')

  return { id: person.id, invite }
}

/**
 * Edit a person — name, role, email or password.
 *
 * The owner's own record is editable (they must be able to change their own
 * code) except for the two things that would lock them out: their role, and
 * being switched off.
 */
export async function updateStaff(id, changes) {
  await wait(140)
  const person = S().staff.find((u) => u.id === id)
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

  if (changes.email !== undefined) {
    const address = normaliseEmail(changes.email)
    if (!isValidEmail(address)) throw new Error('Enter a valid email address.')
    if (S().staff.some((u) => u.id !== id && normaliseEmail(u.email) === address)) {
      throw new Error('Another person already uses that email address.')
    }
    changes.email = address
  }

  if (changes.password !== undefined) {
    // An empty box means "leave it alone", not "clear the password".
    if (!String(changes.password)) delete changes.password
    else {
      const problem = passwordProblem(changes.password)
      if (problem) throw new Error(problem)
      // They have one now, so they are no longer waiting to choose one.
      changes.mustSetPassword = false
    }
  }

  Object.assign(person, changes)
  emit('staff')
  return { ...person }
}

export async function removeStaff(id) {
  await wait(120)
  const person = S().staff.find((u) => u.id === id)
  if (person?.role === 'owner') throw new Error('The owner account cannot be removed.')
  S().staff = S().staff.filter((u) => u.id !== id)
  emit('staff')
}

// ---------------------------------------------------------------------------
// Setting and resetting a password
//
// Firebase does all of this server-side: it mints a single-use code, mails it
// out, and takes the new password itself, so the app never sees either. There
// is no mail server here, so the link is handed straight back to the caller
// to pass on — which is also what makes the whole flow walkable on demo data.
//
// The rules the real one enforces are kept, because they are the ones the
// screens have to cope with: single use, time limited, and one live link per
// person so an older copy of an email cannot be replayed.
// ---------------------------------------------------------------------------

const RESET_TTL_MINUTES = 60

function resetToken() {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Mint a link for one person in one named restaurant, retiring any they
 * already had.
 *
 * Takes the restaurant explicitly because the operator console creates an
 * owner from the apex, where no tenant is active — asking for the active one
 * there would file the token under Bobby's and leave the new owner holding a
 * link nothing can redeem.
 *
 * Synchronous and internal: addStaff needs the invite in the same tick it
 * creates the profile, so the owner is never shown a half-finished result.
 */
function issueResetIn(tenantId, person, purpose = 'reset') {
  const target = storeFor(tenantId)
  const token = resetToken()
  const now = Date.now()

  // One live link each. Two valid links means the older email still works
  // after the newer one has been used, which is the replay this prevents.
  target.state.resets = target.state.resets.filter((r) => r.staff_id !== person.id)
  target.state.resets.push({
    token,
    staff_id: person.id,
    email: person.email,
    purpose,
    created_at: new Date(now).toISOString(),
    expires_at: new Date(now + RESET_TTL_MINUTES * 60_000).toISOString(),
    used_at: null,
  })
  persistResets(tenantId, target.state.resets)

  return {
    token,
    purpose,
    email: person.email,
    name: person.name,
    // Addressed to the restaurant the person belongs to, not to whatever
    // page happens to be open. In dev that appends ?tenant=, which also
    // makes the link survive a lost sessionStorage override.
    link: tenantUrl(tenantId, `/reset?token=${token}`),
    expires_in_minutes: RESET_TTL_MINUTES,
  }
}

/** The common case: a link for someone in the restaurant already open. */
function issueReset(person, purpose = 'reset') {
  return issueResetIn(getActiveTenant() || 'bobbys', person, purpose)
}

/**
 * Ask for a set-your-password link.
 *
 * Succeeds identically whether or not the address belongs to anyone, and the
 * caller is told only `sent`. An honest "no such account here" would turn
 * this box into a way to find out who works here, which is the one thing a
 * sign-in screen must never answer. The link rides back only when there is
 * someone to give it to, and the screens treat its absence as unremarkable.
 */
export async function sendPasswordReset(email) {
  await wait(260)
  const address = normaliseEmail(email)
  if (!isValidEmail(address)) throw new Error('Enter a valid email address.')

  const person = S().staff.find((u) => normaliseEmail(u.email) === address)

  // A switched-off account gets no link. Reinstating a leaver is the owner's
  // decision, not something a former colleague can trigger from outside.
  if (!person || person.active === false) return { sent: true, delivered: false }

  const invite = issueReset(person, person.mustSetPassword ? 'invite' : 'reset')
  return { sent: true, delivered: true, ...invite }
}

/** What a link is worth, before asking anyone to type a new password into it. */
export async function checkResetToken(token) {
  await wait(160)
  const row = S().resets.find((r) => r.token === String(token ?? ''))
  if (!row) return { valid: false, reason: 'unknown' }
  if (row.used_at) return { valid: false, reason: 'used' }
  if (Date.parse(row.expires_at) < Date.now()) return { valid: false, reason: 'expired' }

  const person = S().staff.find((u) => u.id === row.staff_id)
  if (!person || person.active === false) return { valid: false, reason: 'unknown' }

  return { valid: true, email: person.email, name: person.name, purpose: row.purpose }
}

/** Redeem a link and set the password it was issued for. */
export async function completePasswordReset(token, password) {
  await wait(280)

  const problem = passwordProblem(password)
  if (problem) throw new Error(problem)

  const row = S().resets.find((r) => r.token === String(token ?? ''))
  if (!row) throw new Error('This link is not valid. Ask for a new one.')
  if (row.used_at) throw new Error('This link has already been used. Ask for a new one.')
  if (Date.parse(row.expires_at) < Date.now()) {
    throw new Error('This link has expired. Ask for a new one.')
  }

  const person = S().staff.find((u) => u.id === row.staff_id)
  if (!person || person.active === false) {
    throw new Error('This account is no longer active. Speak to the owner.')
  }

  person.password = String(password)
  person.mustSetPassword = false
  row.used_at = new Date().toISOString()

  const tenantId = getActiveTenant() || 'bobbys'
  // Both of these outlive the page, because the next thing this person does
  // is navigate to the sign-in screen — which is a page load.
  persistResets(tenantId, S().resets)
  rememberSeedPassword(tenantId, person)

  emit('staff')
  return { email: person.email, name: person.name }
}

/** Owner-only: grant or revoke one capability for one role. */
export async function setRolePermission(role, permissionId, granted) {
  await wait(80)
  if (role === 'owner') throw new Error('The owner keeps every permission.')

  const current = new Set(S().rolePermissions[role] ?? [])
  if (granted) current.add(permissionId)
  else current.delete(permissionId)
  S().rolePermissions[role] = [...current]
  emit('access')
}

export async function resetRolePermissions(role) {
  await wait(120)
  if (role === 'owner') return
  S().rolePermissions[role] = [...(DEFAULT_ROLE_PERMISSIONS[role] ?? [])]
  emit('access')
}


// ---------------------------------------------------------------------------
// Tenant — the mock pretends to be whichever restaurant was asked for, so the
// multi-tenant routing can be exercised with no Firebase project at all.
// ---------------------------------------------------------------------------

/**
 * The mock's `restaurants` collection. Anything not listed 404s, exactly as
 * an unknown subdomain will in Firestore.
 */
const publicRecord = (id, tenant) => ({
  id,
  subdomain: id,
  name: tenant.name,
  tagline: tenant.tagline,
  status: tenant.status,
  categories: tenant.categories,
  customDomain: tenant.customDomain ?? null,
  currency: tenant.currency ?? 'GBP',
})

export async function lookupRestaurantBySlug(slug) {
  await wait(120)
  const wanted = String(slug || '').toLowerCase()
  const found = tenantDef(wanted)
  if (!found) return null
  return publicRecord(wanted, found)
}

/**
 * Resolve a restaurant that has pointed its own domain at us.
 *
 * Separate from the slug lookup because a custom domain has no subdomain to
 * read — the whole hostname is the key, and it has to be matched against a
 * field rather than against a document id.
 */
export async function lookupRestaurantByHost(host) {
  await wait(120)
  const wanted = String(host || '')
    .toLowerCase()
    .replace(/^www\./, '')
  if (!wanted) return null

  for (const [id, tenant] of allTenantEntries()) {
    const domain = String(tenant.customDomain ?? '')
      .toLowerCase()
      .replace(/^www\./, '')
    if (domain && domain === wanted) return publicRecord(id, tenant)
  }
  return null
}

// ---------------------------------------------------------------------------
// The platform: our own console, not a restaurant's
//
// Everything below operates on a restaurant named by argument rather than on
// the one currently open. That is the whole difference between this section
// and the rest of the file: the operator console runs on the apex, where no
// tenant is active, and it edits restaurants it is not inside.
// ---------------------------------------------------------------------------

/**
 * The demo platform admin.
 *
 * Firestore checks a `platformAdmins/{uid}` document; with no project to
 * check, the mock accepts one fixed credential. It is deliberately the only
 * one, and deliberately not in any restaurant's staff list — a restaurant
 * owner must never be able to sign in here.
 */
const DEMO_ADMIN = {
  email: 'admin@happytable.co.uk',
  password: 'admin1234',
  name: 'Platform admin',
}

export async function signInPlatformAdmin(email, password) {
  await wait(320)
  const address = normaliseEmail(email)
  if (!isValidEmail(address)) throw new Error('Enter a valid email address.')

  if (address !== DEMO_ADMIN.email || String(password ?? '') !== DEMO_ADMIN.password) {
    // One message for both failures, for the same reason as staff sign-in:
    // telling a stranger the address exists is telling them what to attack.
    throw new Error('Email or password not recognised.')
  }

  return { uid: 'admin_demo', email: DEMO_ADMIN.email, name: DEMO_ADMIN.name }
}

/** Shown on the sign-in screen while the app runs on demo data. */
export const DEMO_ADMIN_HINT = { email: DEMO_ADMIN.email, password: DEMO_ADMIN.password }

// --- restaurants ------------------------------------------------------------

const nextDishNo = (menu) =>
  menu.reduce((highest, item) => Math.max(highest, Number(item.no) || 0), 0) + 1

let dishCounter = 0
const dishId = (prefix = 'd') => {
  dishCounter += 1
  return `${prefix}_${Date.now().toString(36)}${dishCounter.toString(36)}`
}

/** Normalise one dish from whatever the caller had to hand. */
function normaliseDish(raw, fallbackNo) {
  const name = String(raw.name ?? '').trim()
  if (!name) throw new Error('Every dish needs a name.')

  const price = Number(raw.price)
  if (!Number.isFinite(price) || price < 0) {
    throw new Error(`"${name}" needs a price.`)
  }

  // A number supplied with the dish is the one printed in the restaurant's
  // menu book, and staff and guests say it out loud to each other. Keep it
  // where there is one; only invent a number when there is not.
  const supplied = Number(raw.no)
  const no = Number.isInteger(supplied) && supplied > 0 ? supplied : fallbackNo

  return {
    id: raw.id ?? dishId(),
    no,
    name,
    description: String(raw.description ?? '').trim(),
    price,
    category: raw.category || 'mains',
    diet: raw.diet || 'veg',
    nuts: Boolean(raw.nuts),
    isNew: Boolean(raw.isNew),
    weekend: Boolean(raw.weekend),
    image_url: String(raw.image_url ?? '').trim(),
  }
}

/**
 * Create a restaurant, ready to take orders.
 *
 * A restaurant is not useful the moment its name is saved — it needs tables
 * to seat people at, a permission matrix so roles mean something, and an
 * owner who can sign in. All of that happens here in one call, because a
 * half-provisioned restaurant is worse than none: it looks ready and then
 * fails on the first thing anybody tries.
 *
 * The owner's password is optional on purpose. Leaving it blank issues a
 * set-your-password link instead, so nobody at the platform ever knows a
 * restaurant owner's password — the same rule the staff screens follow.
 */
export async function createRestaurant({
  name,
  subdomain,
  tagline = '',
  ownerEmail,
  ownerPassword = '',
  ownerName = '',
  tablesCount = 20,
  currency = 'GBP',
  customDomain = '',
  categories = [],
  initialMenu = [],
} = {}) {
  await wait(420)

  const trimmedName = String(name ?? '').trim()
  if (!trimmedName) throw new Error('The restaurant needs a name.')

  const slug = String(subdomain ?? '').toLowerCase().trim()
  const slugIssue = slugProblem(slug)
  if (slugIssue) throw new Error(slugIssue)
  if (tenantDef(slug)) throw new Error(`"${slug}" is already taken.`)

  const address = normaliseEmail(ownerEmail)
  if (!isValidEmail(address)) throw new Error('Enter a valid owner email address.')

  const chosen = String(ownerPassword ?? '')
  if (chosen) {
    const problem = passwordProblem(chosen)
    if (problem) throw new Error(problem)
  }

  const tables = Math.min(Math.max(Number(tablesCount) || 20, 1), 200)

  // Numbered from one, in the order given, so dish numbers match the printed
  // menu from the first day rather than from the first edit.
  let no = 1
  const menu = (initialMenu ?? []).map((dish) => normaliseDish(dish, no++))

  // Any category a dish actually uses has to exist, or that dish lands in a
  // section the guest menu never renders.
  const labelled = new Map(
    (categories ?? []).map((category) => [category.id, category.label ?? category.id])
  )
  for (const dish of initialMenu ?? []) {
    const id = dish.category || 'mains'
    if (!labelled.has(id)) labelled.set(id, dish.categoryLabel || id)
  }

  const owner = {
    id: 'u_owner',
    name: String(ownerName ?? '').trim() || 'Owner',
    role: 'owner',
    email: address,
    active: true,
  }
  if (chosen) owner.password = chosen
  else owner.mustSetPassword = true

  const record = {
    name: trimmedName,
    tagline: String(tagline ?? '').trim(),
    status: 'active',
    currency: currency || 'GBP',
    customDomain: String(customDomain ?? '').toLowerCase().trim() || null,
    ownerEmail: address,
    createdAt: new Date().toISOString(),
    categories: [...labelled].map(([id, label]) => ({ id, label })),
    menu,
    tablesCount: tables,
    staffSeed: [owner],
    soldOut: [],
  }

  extraTenants.set(slug, hydrateTenant(record))
  saveRegistry()

  // Build the store now rather than on first visit, so the console can read
  // the menu back immediately and the owner's invite has somewhere to live.
  // Any links persisted under this slug belong to an earlier demo that used
  // the same name; they are not this restaurant's and must not be live.
  persistResets(slug, [])
  stores.delete(slug)
  storeFor(slug)

  const invite = chosen ? null : issueResetIn(slug, owner, 'invite')

  return { id: slug, subdomain: slug, invite }
}

/**
 * Change a restaurant's record — name, tagline, status, domain, owner email.
 *
 * Only the fields passed are touched, so a status change cannot accidentally
 * blank a tagline.
 */
export async function updateRestaurant(restaurantId, changes = {}) {
  await wait(220)
  const target = tenantDef(restaurantId)
  if (!target) throw new Error('That restaurant no longer exists.')

  if (changes.name !== undefined) {
    const value = String(changes.name).trim()
    if (!value) throw new Error('The restaurant needs a name.')
    target.name = value
  }
  if (changes.tagline !== undefined) target.tagline = String(changes.tagline).trim()
  if (changes.status !== undefined) target.status = changes.status
  if (changes.currency !== undefined) target.currency = changes.currency
  if (changes.customDomain !== undefined) {
    target.customDomain = String(changes.customDomain).toLowerCase().trim() || null
  }
  if (changes.ownerEmail !== undefined) {
    const address = normaliseEmail(changes.ownerEmail)
    if (!isValidEmail(address)) throw new Error('Enter a valid owner email address.')
    target.ownerEmail = address
  }

  if (extraTenants.has(restaurantId)) saveRegistry()
}

// --- a named restaurant's menu ----------------------------------------------

/** Read one restaurant's menu without opening it. */
export async function fetchRestaurantMenu(restaurantId) {
  await wait(200)
  if (!tenantDef(restaurantId)) throw new Error('That restaurant no longer exists.')
  return clone(storeFor(restaurantId).state.menu)
}

/**
 * Teach a restaurant about a category its dishes are about to use.
 *
 * Takes effect for the guest menu on the next page load, because the
 * category list rides on the restaurant record that TenantProvider reads
 * once at the start. That is a fair trade for not re-resolving the tenant
 * mid-service.
 */
function ensureCategories(restaurantId, additions = []) {
  if (!additions.length) return
  const tenant = tenantDef(restaurantId)
  if (!tenant) return

  const known = new Set((tenant.categories ?? []).map((category) => category.id))
  const fresh = []
  for (const category of additions) {
    if (!category.id || known.has(category.id)) continue
    known.add(category.id)
    fresh.push({ id: category.id, label: category.label || category.id })
  }
  if (!fresh.length) return

  tenant.categories = [...(tenant.categories ?? []), ...fresh]
  if (extraTenants.has(restaurantId)) saveRegistry()
}

export async function addMenuItemToRestaurant(restaurantId, dish) {
  await wait(220)
  if (!tenantDef(restaurantId)) throw new Error('That restaurant no longer exists.')

  const target = storeFor(restaurantId)
  const created = normaliseDish(dish, nextDishNo(target.state.menu))

  ensureCategories(restaurantId, [
    { id: created.category, label: dish.categoryLabel || created.category },
  ])

  target.state.menu.push(created)
  emitFor(restaurantId, 'menu')
  return created.id
}

/**
 * Commit a whole pasted menu at once.
 *
 * One call rather than a loop of single adds, so a paste of eighty dishes is
 * one write and one re-render instead of eighty of each — and so a bad row
 * part-way down cannot leave half a menu committed.
 */
export async function bulkAddMenuItems(restaurantId, dishes = []) {
  await wait(380)
  if (!tenantDef(restaurantId)) throw new Error('That restaurant no longer exists.')
  if (!dishes.length) return { added: 0 }

  const target = storeFor(restaurantId)
  let no = nextDishNo(target.state.menu)

  // Validate every row before writing any of them.
  const prepared = dishes.map((dish) => normaliseDish(dish, no++))

  ensureCategories(
    restaurantId,
    dishes.map((dish) => ({
      id: dish.category || 'mains',
      label: dish.categoryLabel || dish.category || 'mains',
    }))
  )

  target.state.menu.push(...prepared)
  emitFor(restaurantId, 'menu')
  return { added: prepared.length }
}

export async function deleteMenuItemFromRestaurant(restaurantId, dishId) {
  await wait(200)
  if (!tenantDef(restaurantId)) throw new Error('That restaurant no longer exists.')

  const target = storeFor(restaurantId)
  const before = target.state.menu.length
  target.state.menu = target.state.menu.filter((item) => item.id !== dishId)
  if (target.state.menu.length === before) throw new Error('That dish has already gone.')

  // A dish that no longer exists cannot be sold out. Leaving the id behind
  // would keep a phantom entry on the 86 list forever.
  if (target.state.soldOut.includes(dishId)) {
    target.state.soldOut = target.state.soldOut.filter((id) => id !== dishId)
    emitFor(restaurantId, 'inventory')
  }

  emitFor(restaurantId, 'menu')
}
