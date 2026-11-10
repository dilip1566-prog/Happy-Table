/**
 * Which restaurant is this browser looking at?
 *
 * Answered from the hostname, so the same deployment serves every tenant:
 *
 *   bobbys.happytable.co.uk      -> "bobbys"
 *   starvashnu.happytable.co.uk  -> "starvashnu"
 *   happytable.co.uk             -> the platform: marketing site + /admin
 *   www.happytable.co.uk         -> the platform
 *   feastindia.co.uk             -> a custom domain: looked up in Firestore
 *   bobbys.localhost:5180        -> "bobbys"   (works in dev, no DNS needed)
 *   localhost:5180               -> the platform
 *
 * Nothing here is hard-coded per restaurant. A new tenant is a row in
 * Firestore plus a subdomain its traffic can reach — no deploy, no code.
 */

/**
 * Hosts that are never a tenant, however many labels they have.
 *
 * `admin` is in here for a reason that is easy to miss: without it,
 * admin.happytable.co.uk would resolve as a tenant slug and a restaurant
 * called "admin" could claim the platform's own name.
 */
const RESERVED = new Set(['www', 'app', 'admin', 'api', 'staging', 'preview'])

/**
 * Apex domains we serve from. Anything to the left of one of these is a
 * tenant slug. Add a domain here and it starts resolving tenants.
 *
 * `happtable.co.uk` is the misspelling that shipped first and is kept on
 * purpose: if any link, QR code or bookmark went out carrying it, dropping
 * it from this list turns those into a dead end rather than a redirect.
 */
export const APEX_DOMAINS = ['happytable.co.uk', 'happtable.co.uk', 'localhost']

/** The one we print, link to and brand. The others merely still work. */
export const PRIMARY_DOMAIN = 'happytable.co.uk'

/** The apex this hostname sits under, or null if it is somebody else's. */
function apexFor(hostname) {
  return (
    APEX_DOMAINS.find(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    ) ?? null
  )
}

const cleanHost = (host = '') =>
  String(host).split(':')[0].toLowerCase().replace(/\.$/, '')

const isBareIp = (hostname) => /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)

export function slugFromHost(host = '') {
  const hostname = cleanHost(host)
  if (!hostname) return null

  // A bare IP is never a tenant — it is someone testing over the LAN.
  if (isBareIp(hostname)) return null

  const apex = apexFor(hostname)
  if (!apex) return null
  if (hostname === apex) return null

  const label = hostname.slice(0, -(apex.length + 1))
  if (!label || label.includes('.')) return null // no nested subdomains
  if (RESERVED.has(label)) return null

  return label
}

/**
 * What this page load is for, in one of three shapes:
 *
 *   { kind: 'platform' }           our own marketing site and /admin
 *   { kind: 'slug', slug }         a tenant, named by its subdomain
 *   { kind: 'host', host }         a hostname that is none of ours, so it
 *                                  may be a restaurant's custom domain
 *
 * The third case is why this replaced a function that returned a slug or
 * null. A null used to mean "the platform", which left no way to tell our
 * own apex apart from `feastindia.co.uk` — and a custom domain has to be
 * looked up in the database before anyone can say whether it is a tenant.
 */
export function tenantTarget(location = window.location) {
  if (import.meta.env.DEV) {
    const override = devOverride(location)
    if (override) return { kind: 'slug', slug: override }
  }

  const hostname = cleanHost(location.hostname)
  if (!hostname) return { kind: 'platform' }

  // Testing over the LAN: no subdomain is reachable by IP, so serve the
  // platform rather than claiming the address belongs to a restaurant.
  if (isBareIp(hostname)) return { kind: 'platform' }

  const apex = apexFor(hostname)
  if (!apex) return { kind: 'host', host: hostname }

  const slug = slugFromHost(hostname)
  return slug ? { kind: 'slug', slug } : { kind: 'platform' }
}

/**
 * `?tenant=bobbys`, remembered for the rest of the session.
 *
 * This exists so the whole multi-tenant app can be exercised on plain
 * localhost before any DNS is configured — and because `bobbys.localhost`
 * does not resolve on every machine. It is a development convenience and is
 * compiled out of production.
 *
 * It is remembered immediately because without that the override lasts
 * exactly one page load: the first link or refresh drops back to the
 * hostname, which on plain localhost is the platform — so a waiter and a
 * guest could silently end up on two different restaurants, and a perfectly
 * good table code would be reported as unknown.
 */
function devOverride(location) {
  const params = new URLSearchParams(location.search)
  if (params.has('tenant')) {
    const override = (params.get('tenant') || '').toLowerCase()
    rememberOverride(override)
    if (override) return override
  }
  try {
    const remembered = sessionStorage.getItem('tenant-override')
    if (remembered) return remembered.toLowerCase()
  } catch {
    /* private mode */
  }
  return null
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

/**
 * A link that opens a restaurant from wherever we happen to be running.
 *
 * In dev that is a query string, because subdomains of localhost are not
 * dependable; in production it is a real subdomain of whichever apex served
 * this page, so a link copied on `happtable.co.uk` keeps working there.
 */
export function tenantUrl(slug, path = '/') {
  const { protocol, hostname, port, origin } = window.location

  if (import.meta.env.DEV) {
    const separator = path.includes('?') ? '&' : '?'
    return `${origin}${path}${separator}tenant=${encodeURIComponent(slug)}`
  }

  const apex = apexFor(cleanHost(hostname)) ?? hostname
  const suffix = port ? `:${port}` : ''
  return `${protocol}//${slug}.${apex}${suffix}${path}`
}

/**
 * The address to print on a QR sticker or hand to a restaurant.
 *
 * Always the primary domain and always https, whatever this page is being
 * served from — a sticker printed from a dev machine must not say
 * `localhost`, and one printed today must not say the old misspelling.
 */
export function publicTenantUrl(slug, path = '/') {
  return `https://${slug}.${PRIMARY_DOMAIN}${path}`
}
