/**
 * Subdomain rules, in one place.
 *
 * A slug is not an ordinary form field: it becomes a hostname, a Firestore
 * document id and the address printed on every QR sticker in the building.
 * Both backends therefore check it against this one definition, and the
 * console shows the same message as the one a rejected write would throw —
 * otherwise a restaurant gets created and the link to it never resolves.
 */

/** 2–30 characters, starting with a letter or number. */
const SHAPE = /^[a-z0-9][a-z0-9-]{1,29}$/

/**
 * Labels the platform uses for itself. These must match RESERVED in
 * src/tenant/resolve.js, which refuses to treat them as tenants: a
 * restaurant allowed to claim "admin" would own admin.happytable.co.uk and
 * resolve to nothing.
 */
const RESERVED = new Set([
  'www',
  'app',
  'admin',
  'api',
  'staging',
  'preview',
  'mail',
  'support',
  'help',
  'status',
  'blog',
  'docs',
])

/** "Royal Sweet Mart!" -> "royalsweetmart" */
export function slugify(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 30)
}

/** Null when the slug is usable, otherwise why it is not. */
export function slugProblem(value) {
  const slug = String(value ?? '').toLowerCase()
  if (!slug) return 'Choose a subdomain.'
  if (slug.length < 2) return 'A subdomain needs at least two characters.'
  if (!SHAPE.test(slug)) {
    return 'Use lowercase letters, numbers and hyphens only, starting with a letter or number.'
  }
  if (slug.endsWith('-')) return 'A subdomain cannot end with a hyphen.'
  if (RESERVED.has(slug)) return `“${slug}” is reserved for the platform.`
  return null
}
