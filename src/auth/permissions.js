/**
 * Capabilities, not screens.
 *
 * Access is granted per action rather than per page, because the real rules
 * cut across pages: a manager sees the billing screen but not the takings on
 * it; a waiter works the floor but cannot settle a tab. Gating whole routes
 * would force those to be all-or-nothing.
 *
 * The owner edits which capabilities each role holds, so these are defaults,
 * not law. The one fixed rule is that the owner keeps everything — there has
 * to be someone who can undo a mistake.
 */

export const PERMISSIONS = [
  // --- Floor ---------------------------------------------------------------
  { id: 'floor.view', group: 'Floor', label: 'See the floor plan' },
  { id: 'floor.seat', group: 'Floor', label: 'Seat guests & approve arrivals' },
  {
    id: 'floor.link',
    group: 'Floor',
    label: 'Combine tables into one bill',
    hint: 'Pushing tables together for a large party',
  },
  {
    id: 'floor.clear',
    group: 'Floor',
    label: 'Mark a table cleared',
    hint: 'Wiped down and reset — ready for the next party',
  },

  // --- Orders --------------------------------------------------------------
  { id: 'orders.view', group: 'Orders', label: 'See the order board' },
  {
    id: 'orders.fire',
    group: 'Orders',
    label: 'Start cooking & quote a time',
    hint: 'Moves a ticket from New to On',
  },
  { id: 'orders.ready', group: 'Orders', label: 'Mark orders ready' },

  // --- Menu ----------------------------------------------------------------
  { id: 'menu.view', group: 'Menu', label: 'See the menu list' },
  { id: 'menu.edit', group: 'Menu', label: 'Add & change dishes' },
  {
    id: 'inventory.toggle',
    group: 'Menu',
    label: 'Mark dishes off (86)',
    hint: 'Instantly greys the dish out on every table',
  },

  // --- Money ---------------------------------------------------------------
  { id: 'billing.view', group: 'Money', label: "Open a table's bill" },
  { id: 'billing.close', group: 'Money', label: 'Settle & close tabs' },
  {
    id: 'reports.sales',
    group: 'Money',
    label: 'See takings & sales totals',
    hint: 'Day totals, covers, average spend',
    sensitive: true,
  },

  // --- People --------------------------------------------------------------
  {
    id: 'staff.manage',
    group: 'People',
    label: 'Manage people & access',
    hint: 'Add staff and change what each role can do',
    sensitive: true,
  },
]

export const PERMISSION_GROUPS = [...new Set(PERMISSIONS.map((p) => p.group))]

export const ALL_PERMISSIONS = PERMISSIONS.map((p) => p.id)

export const ROLES = [
  { id: 'owner', label: 'Owner', blurb: 'Everything, including takings and access' },
  { id: 'manager', label: 'Manager', blurb: 'Runs service; no takings, no access control' },
  { id: 'waiter', label: 'Waiter', blurb: 'Floor only — seating and combining tables' },
  { id: 'kitchen', label: 'Kitchen', blurb: 'The pass — marking orders ready' },
]

/**
 * Starting grants. The owner can change everything below except their own row.
 *
 * Kitchen deliberately starts with only view + ready, per the brief. Firing a
 * ticket and 86-ing a dish are left off so the owner turns them on knowingly —
 * most kitchens will want both, but that should be a decision, not a default.
 */
export const DEFAULT_ROLE_PERMISSIONS = {
  owner: [...ALL_PERMISSIONS],

  manager: ALL_PERMISSIONS.filter((id) => id !== 'reports.sales' && id !== 'staff.manage'),

  waiter: ['floor.view', 'floor.seat', 'floor.link', 'floor.clear'],

  kitchen: ['orders.view', 'orders.ready'],
}

/** The owner's row is fixed, so nobody can lock themselves out of their own shop. */
export const LOCKED_ROLES = ['owner']

export const roleLabel = (id) => ROLES.find((r) => r.id === id)?.label ?? id
