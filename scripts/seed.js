/**
 * One-off seeder for the multi-tenant schema.
 *
 *   node scripts/seed.js                  # every restaurant in TENANTS
 *   node scripts/seed.js --only bobbys    # just one
 *   node scripts/seed.js --no-staff       # skip creating sign-in accounts
 *   node scripts/seed.js --force-menu     # rewrite menus that already exist
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
 * Reads the same .env the Vite app uses, and the same seed data the demo
 * runs on, so the live database and the mock cannot drift apart.
 *
 * Safe to re-run. Restaurant records, tables and config are written with
 * merge. A menu is only written when the collection is empty, unless
 * --force-menu is passed. Staff accounts that already exist are skipped.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { initializeApp } from 'firebase/app'
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth'
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  setDoc,
  writeBatch,
} from 'firebase/firestore'

import { TENANTS } from '../src/mock/data.js'
import { DEFAULT_ROLE_PERMISSIONS } from '../src/auth/permissions.js'

const here = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(here, '..', '.env')

function loadEnv() {
  let raw
  try {
    raw = readFileSync(envPath, 'utf8')
  } catch {
    console.error(`Missing ${envPath}. Copy .env.example to .env and fill it in.`)
    process.exit(1)
  }

  const env = {}
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, '')
  }
  return env
}

const env = loadEnv()

if (!env.VITE_FIREBASE_PROJECT_ID) {
  console.error(`${envPath} has no VITE_FIREBASE_PROJECT_ID. Fill it in first.`)
  process.exit(1)
}

const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
})
const db = getFirestore(app)
const auth = getAuth(app)

const args = process.argv.slice(2)
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null
const withStaff = !args.includes('--no-staff')
const forceMenu = args.includes('--force-menu')

/** Firestore caps a batch at 500 writes; menus here run to 171. */
async function commitInChunks(rows, write, size = 400) {
  for (let i = 0; i < rows.length; i += size) {
    const batch = writeBatch(db)
    for (const row of rows.slice(i, i + size)) write(batch, row)
    await batch.commit()
  }
}

async function seedRestaurant(id, tenant) {
  console.log(`\n--- ${tenant.name} (${id}) ---`)
  const root = doc(db, 'restaurants', id)

  // The record a guest reads before anything else resolves. Presentation
  // only: never put billing or contact details on this document, because
  // the rules make it world-readable.
  await setDoc(
    root,
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
    batch.set(doc(root, 'tables', String(table.table_number)), table, { merge: true })
  )
  console.log(`  ${tables.length} tables`)

  const menuRef = collection(root, 'menuItems')
  const existing = await getDocs(menuRef)
  if (existing.empty || forceMenu) {
    await commitInChunks(tenant.menu, (batch, item) =>
      batch.set(doc(menuRef, item.id), item)
    )
    console.log(`  ${tenant.menu.length} dishes`)
  } else {
    console.log(`  menu left alone (${existing.size} dishes already there — --force-menu to rewrite)`)
  }

  await setDoc(
    doc(root, 'config', 'inventory'),
    { sold_out_items: tenant.soldOut ?? [] },
    { merge: true }
  )
  await setDoc(
    doc(root, 'config', 'access'),
    { rolePermissions: DEFAULT_ROLE_PERMISSIONS },
    { merge: true }
  )
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
      const credential = await createUserWithEmailAndPassword(
        auth,
        person.email,
        person.password
      )
      await setDoc(doc(root, 'staff', credential.user.uid), {
        name: person.name,
        email: person.email,
        role: person.role,
        isActive: true,
        restaurantId: id,
      })
      console.log(`  + ${person.email} (${person.role})`)
    } catch (error) {
      if (error?.code === 'auth/email-already-in-use') {
        console.log(`  = ${person.email} already exists — staff document not touched`)
      } else {
        console.log(`  ! ${person.email}: ${error?.code ?? error?.message ?? error}`)
      }
    }
  }
}

async function main() {
  const entries = Object.entries(TENANTS).filter(([id]) => !only || id === only)
  if (!entries.length) {
    console.error(`No restaurant called "${only}". Known: ${Object.keys(TENANTS).join(', ')}`)
    process.exit(1)
  }

  console.log(`Seeding ${env.VITE_FIREBASE_PROJECT_ID}`)
  for (const [id, tenant] of entries) await seedRestaurant(id, tenant)

  console.log('\nDone.')
  console.log('\nTwo things the seeder cannot do for you:')
  console.log('  1. Make yourself a platform admin — add a document at')
  console.log('     platformAdmins/{your-auth-uid} by hand in the console.')
  console.log('     The operator console at the apex domain needs it.')
  console.log('  2. Deploy the rules and indexes:')
  console.log('     firebase deploy --only firestore:rules,firestore:indexes')
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
