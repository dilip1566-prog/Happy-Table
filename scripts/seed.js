/**
 * One-off seeder for the multi-tenant schema.
 *
 *   node scripts/seed.js                      # every restaurant in TENANTS
 *   node scripts/seed.js --only bobbys        # just one
 *   node scripts/seed.js --no-staff           # skip creating sign-in accounts
 *   node scripts/seed.js --force-menu         # rewrite menus that already exist
 *   node scripts/seed.js --admin you@mail.com # also make that account a platform admin
 *
 * Writes the same shape the app reads:
 *
 *   restaurants/{id}                     name, tagline, status, categories
 *   restaurants/{id}/menuItems/{dishId}
 *   restaurants/{id}/tables/{tableNumber}
 *   restaurants/{id}/config/inventory    sold_out_items
 *   restaurants/{id}/config/access       rolePermissions
 *   restaurants/{id}/staff/{authUid}     name, email, role, isActive
 *
 * Runs on the ADMIN SDK, not the browser SDK, and that is deliberate.
 * firestore.rules refuses every write this script needs — a restaurant may
 * only be created by a platform admin, a menu only by a manager, and the
 * owner's own staff document only by an owner, which cannot exist before
 * that document does. Seeding is an administrative act, so it carries
 * administrative credentials and bypasses the rules outright. The rules then
 * stay strict for the app itself, which is the only thing guests touch.
 *
 * Needs a service account key: Firebase console > Project settings >
 * Service accounts > Generate new private key. Save it as
 * serviceAccount.json beside package.json (gitignored), or point
 * GOOGLE_APPLICATION_CREDENTIALS at it.
 *
 * Reads the same seed data the demo runs on, so the live database and the
 * mock cannot drift apart.
 *
 * Safe to re-run. Restaurant records, tables and config are written with
 * merge. A menu is only written when the collection is empty, unless
 * --force-menu is passed. An Auth account that already exists is reused and
 * its staff document re-written, which repairs a half-finished run.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { cert, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

import { TENANTS } from '../src/mock/data.js'
import { DEFAULT_ROLE_PERMISSIONS } from '../src/auth/permissions.js'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')

function die(...lines) {
  for (const line of lines) console.error(line)
  process.exit(1)
}

/** The six VITE_ values, read only to catch a wrong-project mistake. */
function loadEnv() {
  let raw
  try {
    raw = readFileSync(resolve(root, '.env'), 'utf8')
  } catch {
    return {}
  }
  const env = {}
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, '').trim()
  }
  return env
}

function loadServiceAccount() {
  const candidates = [
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    resolve(root, 'serviceAccount.json'),
  ].filter(Boolean)

  for (const path of candidates) {
    try {
      const parsed = JSON.parse(readFileSync(path, 'utf8'))
      if (!parsed.project_id || !parsed.private_key) continue
      return { path, parsed }
    } catch {
      /* try the next one */
    }
  }

  die(
    'No service account key found.',
    '',
    'Firebase console > Project settings (gear) > Service accounts tab',
    '  > Generate new private key > Generate key',
    '',
    `Save the downloaded file as:  ${resolve(root, 'serviceAccount.json')}`,
    '',
    'That file is a real secret — it bypasses all security rules. It is',
    'already in .gitignore. Never commit it or paste it anywhere.'
  )
}

const { path: keyPath, parsed: serviceAccount } = loadServiceAccount()
const env = loadEnv()

// Seeding the wrong project would scatter hundreds of dishes across someone
// else's database, so refuse when the key and the app disagree about where
// they are pointing.
if (
  env.VITE_FIREBASE_PROJECT_ID &&
  env.VITE_FIREBASE_PROJECT_ID !== serviceAccount.project_id
) {
  die(
    'Project mismatch — refusing to write.',
    `  .env points the app at:     ${env.VITE_FIREBASE_PROJECT_ID}`,
    `  the service account is for: ${serviceAccount.project_id}`,
    '',
    'Fix whichever is wrong, then run this again.'
  )
}

const app = initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore(app)
const auth = getAuth(app)

const args = process.argv.slice(2)
const flag = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : null)
const only = flag('--only')
const adminEmail = flag('--admin')
const adminPassword = flag('--admin-password')
const withStaff = !args.includes('--no-staff')
const forceMenu = args.includes('--force-menu')

/** Firestore caps a batch at 500 writes; menus here run to 171. */
async function commitInChunks(rows, write, size = 400) {
  for (let i = 0; i < rows.length; i += size) {
    const batch = db.batch()
    for (const row of rows.slice(i, i + size)) write(batch, row)
    await batch.commit()
  }
}

/**
 * One Auth account per person, found or made. Looking it up first is what
 * makes the script re-runnable: a second run reuses the account and rewrites
 * the staff document rather than failing on email-already-in-use and leaving
 * that person with no way in.
 */
async function ensureAccount({ email, password, name }) {
  try {
    const existing = await auth.getUserByEmail(email)
    return { uid: existing.uid, created: false }
  } catch (error) {
    if (error?.code !== 'auth/user-not-found') throw error
  }
  const made = await auth.createUser({ email, password, displayName: name })
  return { uid: made.uid, created: true }
}

async function seedRestaurant(id, tenant) {
  console.log(`\n--- ${tenant.name} (${id}) ---`)
  const restaurant = db.collection('restaurants').doc(id)

  // The record a guest reads before anything else resolves. Presentation
  // only: never put billing or contact details on this document, because
  // the rules make it world-readable.
  await restaurant.set(
    {
      name: tenant.name,
      tagline: tenant.tagline,
      status: tenant.status ?? 'active',
      subdomain: id,
      currency: 'GBP',
      categories: tenant.categories,
    },
    { merge: true }
  )
  console.log(`  record + ${tenant.categories.length} categories`)

  // Tables are keyed by their number as a string, so the customer route can
  // read one document by id instead of running a query.
  const tables = tenant.tables()
  await commitInChunks(tables, (batch, table) =>
    batch.set(restaurant.collection('tables').doc(String(table.table_number)), table, {
      merge: true,
    })
  )
  console.log(`  ${tables.length} tables`)

  const menuRef = restaurant.collection('menuItems')
  const probe = await menuRef.limit(1).get()
  if (probe.empty || forceMenu) {
    await commitInChunks(tenant.menu, (batch, item) => batch.set(menuRef.doc(item.id), item))
    console.log(`  ${tenant.menu.length} dishes`)
  } else {
    const all = await menuRef.count().get()
    console.log(
      `  menu left alone (${all.data().count} dishes already there — --force-menu to rewrite)`
    )
  }

  await restaurant
    .collection('config')
    .doc('inventory')
    .set({ sold_out_items: tenant.soldOut ?? [] }, { merge: true })
  await restaurant
    .collection('config')
    .doc('access')
    .set({ rolePermissions: DEFAULT_ROLE_PERMISSIONS }, { merge: true })
  console.log('  config: inventory + permissions')

  if (!withStaff) {
    console.log('  staff skipped (--no-staff)')
    return
  }

  // Each person needs a Firebase Auth account AND a staff document under
  // this restaurant. The document is keyed by the Auth uid, because that is
  // what the security rules look up on every single request.
  for (const person of tenant.staff()) {
    if (!person.email || !person.password) {
      console.log(`  ! ${person.name} has no email/password in the seed — skipped`)
      continue
    }
    try {
      const { uid, created } = await ensureAccount(person)
      await restaurant
        .collection('staff')
        .doc(uid)
        .set(
          {
            name: person.name,
            email: person.email,
            role: person.role,
            isActive: true,
            restaurantId: id,
          },
          { merge: true }
        )
      console.log(`  ${created ? '+' : '='} ${person.email} (${person.role})`)
    } catch (error) {
      console.log(`  ! ${person.email}: ${error?.code ?? error?.message ?? error}`)
    }
  }
}

/**
 * The operator console at the apex domain reads platformAdmins/{uid}. The
 * rules make that collection unwritable from any client, so this is the only
 * automated way in — and it is scoped to one address passed on the command
 * line, never inferred.
 */
async function seedPlatformAdmin(email) {
  console.log('\n--- platform admin ---')
  let uid
  try {
    uid = (await auth.getUserByEmail(email)).uid
    console.log(`  found ${email}`)
  } catch (error) {
    if (error?.code !== 'auth/user-not-found') throw error
    if (!adminPassword) {
      console.log(`  ! no account for ${email} yet.`)
      console.log('    Re-run with --admin-password "<at least 6 characters>" to create one.')
      return
    }
    uid = (await auth.createUser({ email, password: adminPassword })).uid
    console.log(`  created ${email}`)
  }
  await db.collection('platformAdmins').doc(uid).set({ email }, { merge: true })
  console.log(`  platformAdmins/${uid} written — the apex console will open for this account`)
}

async function main() {
  const entries = Object.entries(TENANTS).filter(([id]) => !only || id === only)
  if (!entries.length) {
    die(`No restaurant called "${only}". Known: ${Object.keys(TENANTS).join(', ')}`)
  }

  console.log(`Seeding ${serviceAccount.project_id}`)
  console.log(`  using key ${keyPath}`)
  for (const [id, tenant] of entries) await seedRestaurant(id, tenant)
  if (adminEmail) await seedPlatformAdmin(adminEmail)

  console.log('\nDone.')
  console.log('\nStill to do by hand:')
  console.log('  1. firebase deploy --only firestore:rules,firestore:indexes')
  if (!adminEmail) {
    console.log('  2. Make yourself the platform operator — re-run with')
    console.log('     --admin your@email.com, or add platformAdmins/{your-uid}')
    console.log('     in the console by hand.')
  }
  console.log('\nEveryone seeded shares the demo password. Each person should use')
  console.log('Forgot password on first sign-in before this goes near real money.')
  process.exit(0)
}

main().catch((error) => {
  console.error('\nSeeding failed:')
  console.error(error)
  process.exit(1)
})
