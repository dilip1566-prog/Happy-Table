/**
 * The active restaurant id, held outside React.
 *
 * The data layer is plain modules, not components, so it cannot read a
 * context. TenantProvider sets this once the subdomain has been resolved,
 * and every Firestore path is built from it.
 *
 * Reading it before it is set is a programming error rather than a runtime
 * condition — it means a query ran before the tenant gate let the app
 * render — so it throws loudly instead of quietly reading the wrong
 * restaurant's data.
 */
let activeTenantId = null

export function setActiveTenant(restaurantId) {
  activeTenantId = restaurantId || null
}

export function getActiveTenant() {
  return activeTenantId
}

export function requireTenant() {
  if (!activeTenantId) {
    throw new Error(
      '[tenant] No restaurant resolved. A query ran before the tenant gate finished.'
    )
  }
  return activeTenantId
}
