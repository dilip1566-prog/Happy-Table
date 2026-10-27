/**
 * Which restaurant is this browser looking at?
 *
 * Answered from the hostname, so the same deployment serves every tenant:
 *
 *   bobbys.happtable.co.uk      -> "bobbys"
 *   starvashnu.happtable.co.uk  -> "starvashnu"
 *   happtable.co.uk             -> null  (the root: our own admin console)
 *   www.happtable.co.uk         -> null
 *   bobbys.localhost:5180       -> "bobbys"   (works in dev, no DNS needed)
 *   localhost:5180              -> null
 *
 * Nothing here is hard-coded per restaurant. A new tenant is a row in
 * Firestore and a DNS wildcard that already exists — no deploy, no code.
 */

/** Hosts that are never a tenant, however many labels they have. */
const RESERVED = new Set(['www', 'app', 'admin', 'api', 'staging', 'preview'])

/**
 * Apex domains we serve from. Anything to the left of one of these is a
 * tenant slug. Add a domain here and it starts resolving tenants.
 */
const APEX_DOMAINS = ['happtable.co.uk', 'localhost']

export function slugFromHost(host = '') {
  // Strip the port and lower-case: "Bobbys.localhost:5180" -> "bobbys.localhost"
  const hostname = String(host).split(':')[0].toLowerCase().replace(/\.$/, '')
  if (!hostname) return null

  // A bare IP is never a tenant — it is someone testing over the LAN.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) return null

  const apex = APEX_DOMAINS.find(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
  )
  if (!apex) return null
  if (hostname === apex) return null

  const label = hostname.slice(0, -(apex.length + 1))
  if (!label || label.includes('.')) return null // no nested subdomains
  if (RESERVED.has(label)) return null

  return label
}

/**
 * The slug for this page load.
 *
 * `?tenant=bobbys` overrides the hostname. That exists so the whole
 * multi-tenant app can be exercised on plain localhost before any DNS is
 * configured — and because `bobbys.localhost` does not resolve on every
 * machine. It is a development convenience and is ignored in production.
 */
export function currentSlug(location = window.location) {
  if (import.meta.env.DEV) {
    const params = new URLSearchParams(location.search)
    if (params.has('tenant')) {
      const override = (params.get('tenant') || '').toLowerCase()
      // Remember it immediately. Without this the override lasts exactly one
      // page load: the first link or refresh drops back to the hostname,
      // which on plain localhost is the root — so a waiter and a guest could
      // silently end up on two different restaurants, and a perfectly good
      // table code would be reported as unknown.
      rememberOverride(override)
      if (override) return override
    }
    try {
      const remembered = sessionStorage.getItem('tenant-override')
      if (remembered) return remembered.toLowerCase()
    } catch {
      /* private mode */
    }
  }
  return slugFromHost(location.hostname)
}

/** Remembers a `?tenant=` override so links inside the app keep working. */
export function rememberOverride(slug) {
  if (!import.meta.env.DEV) return
  try {
    if (slug) sessionStorage.setItem('tenant-override', slug)
    else sessionStorage.removeItem('tenant-override')
  } catch {
    /* non-fatal */
  }
}

/** The public address we print on a QR sticker for a given restaurant. */
export function tenantUrl(slug, path = '/') {
  const { protocol, hostname, port } = window.location
  const apex = APEX_DOMAINS.find(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
  )
  const base = apex ?? hostname
  const suffix = port ? `:${port}` : ''
  return `${protocol}//${slug}.${base}${suffix}${path}`
}
