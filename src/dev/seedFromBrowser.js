/**
 * ===========================================================================
 * Browser seeder — the no-service-account path.
 * ===========================================================================
 *
 * DEV ONLY. Nothing in the app imports this, so it never reaches a production
 * bundle. It is loaded on demand from the dev server:
 *
 *   const { seedFromBrowser } = await import('/src/dev/seedFromBrowser.js')
 *   await seedFromBrowser({ email, password })
 *
 * WHY THIS EXISTS
 *
 * scripts/seed.js needs an Admin SDK key. This does the same job with only
 * the six public VITE_ values, by walking through firestore.rules rather than
 * around them. That is possible only because of one manual step: the account
 * signing in must already have a document at platformAdmins/{uid}, created by
 * hand in the Firebase console. The rules say `allow write: if false` on that
 * collection, so no client can grant it to itself — which is exactly the
 * property that makes the whole model safe.
 *
 * HOW THE CIRCLE BREAKS
 *
 *   1. as platform admin  -> create restaurants/{id}            (rules: isPlatformAdmin)
 *   2. as platform admin  -> grant self owner on that restaurant (rules: isPlatformAdmin)
 *   3. now owner          -> write tables, menu, config          (rules: isManagerUp / isStaff / isOwner)
 *   4. now owner          -> create the real staff documents     (rules: isOwner)
 *   5. last of all        -> delete own bootstrap staff document (rules: isOwner)
 *
 * Step 5 is last because it is the step that gives up the permission the
 * earlier ones depend on.
 *
 * Re-runnable. Documents are merged, menus skipped when already present, and
 * an Auth account that exists is signed into on a throwaway secondary app to
 * recover its uid rather than failing.
 */
import { deleteApp, initializeApp } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  query,
  setDoc,
  writeBatch,
} from 'firebase/firestore'

import { auth, db, firebaseConfig } from '../firebase'
import { TENANTS } from '../mock/data'
import { DEFAULT_ROLE_PERMISSIONS } from '../auth/permissions'

/** Firestore caps a batch at 500 writes; the bigger menu runs to 171. */
async function commitInChunks(rows, write, size = 400) {
  for (let i = 0; i < rows.length; i += size) {
    const batch = writeBatch(db)
    for (const row of rows.slice(i, i + size)) write(batch, row)
    await batch.commit()
  }
}

/**
 * An Auth account's uid, without disturbing who is currently signed in.
 *
 * Creating a user signs that user in, which would drop our platform-admin
 * session halfway through seeding. A throwaway secondary app keeps the two
 * sessions apart — the same trick firestoreAdapter.addStaff uses, and the
 * reason this whole design needs no Cloud Functions.
 */
async function uidFor({ email, password, name }) {
  const secondary = initializeApp(firebaseConfig, `seed-${Date.now()}-${Math.random()}`)
  const secondaryAuth = getAuth(secondary)
  try {
    const made = await createUserWithEmailAndPassword(secondaryAuth, email, password)
    return { uid: made.user.uid, created: true }
  } catch (error) {
    if (error?.code !== 'auth/email-already-in-use') throw error
    // Already there from an earlier run. The seed file knows the password,
    // so sign in to recover the uid and keep the run idempotent.
    const back = await signInWithEmailAndPassword(secondaryAuth, email, password)
    return { uid: back.user.uid, created: false }
  } finally {
    await deleteApp(secondary).catch(() => {})
  }
}

async function seedRestaurant(id, tenant, selfUid, selfEmail, log) {
  log(`--- ${tenant.name} (${id}) ---`)
  const restaurant = doc(db, 'restaurants', id)
  const staffHere = doc(db, 'restaurants', id, 'staff', selfUid)

  // 1. The record a guest reads before anything else resolves. Presentation
  //    fields only — the rules make this document world-readable.
  await setDoc(
    restaurant,
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
  log(`  record + ${tenant.categories.length} categories`)

  // 2. Grant ourselves owner here. Permitted because we are a platform
  //    admin, and required because nothing below is open to one.
  await setDoc(
    staffHere,
    {
      name: 'Bootstrap (seeder)',
      email: selfEmail,
      role: 'owner',
      isActive: true,
      restaurantId: id,
    },
    { merge: true }
  )
  log('  granted self owner (temporary)')

  // 3. Tables are keyed by their number as a string, so the customer route
  //    can read one document by id instead of running a query.
  const tables = tenant.tables()
  await commitInChunks(tables, (batch, table) =>
    batch.set(doc(db, 'restaurants', id, 'tables', String(table.table_number)), table, {
      merge: true,
    })
  )
  log(`  ${tables.length} tables`)

  const menuRef = collection(db, 'restaurants', id, 'menuItems')
  const probe = await getDocs(query(menuRef, limit(1)))
  if (probe.empty) {
    await commitInChunks(tenant.menu, (batch, item) =>
      batch.set(doc(menuRef, item.id), item)
    )
    log(`  ${tenant.menu.length} dishes`)
  } else {
    log('  menu already present — left alone')
  }

  await setDoc(
    doc(db, 'restaurants', id, 'config', 'inventory'),
    { sold_out_items: tenant.soldOut ?? [] },
    { merge: true }
  )
  await setDoc(
    doc(db, 'restaurants', id, 'config', 'access'),
    { rolePermissions: DEFAULT_ROLE_PERMISSIONS },
    { merge: true }
  )
  log('  config: inventory + permissions')

  // 4. The real people. Each needs an Auth account AND a staff document
  //    keyed by their uid, because that uid is what every rule looks up.
  let made = 0
  let reused = 0
  for (const person of tenant.staff()) {
    if (!person.email || !person.password) {
      log(`  ! ${person.name} has no email/password in the seed — skipped`)
      continue
    }
    try {
      const { uid, created } = await uidFor(person)
      await setDoc(
        doc(db, 'restaurants', id, 'staff', uid),
        {
          name: person.name,
          email: person.email,
          role: person.role,
          isActive: true,
          restaurantId: id,
        },
        { merge: true }
      )
      created ? made++ : reused++
      log(`  ${created ? '+' : '='} ${person.email} (${person.role})`)
    } catch (error) {
      log(`  ! ${person.email}: ${error?.code ?? error?.message ?? error}`)
    }
  }
  log(`  staff: ${made} created, ${reused} already existed`)

  // 5. Hand back the owner grant we gave ourselves. Last, because every
  //    step above depended on it.
  await deleteDoc(staffHere)
  log('  revoked own owner grant')
}

/**
 * Seeds using whoever is signed in right now.
 *
 * Authentication is the page's job, not this module's — the uid has to be
 * visible to the person before seeding can possibly succeed, because they
 * need it to create the platformAdmins document by hand. Signing in here
 * would hide it behind a failure.
 */
export async function seedFromBrowser({ only = null, onLog } = {}) {
  const lines = []
  const log = (line) => {
    lines.push(line)
    onLog?.(line)
  }

  if (!db || !auth) throw new Error('Firebase is not configured — check .env and restart Vite.')

  const me = auth.currentUser
  if (!me) throw new Error('Not signed in.')

  log(`signed in as ${me.email}`)
  log(`uid ${me.uid}`)

  const entries = Object.entries(TENANTS).filter(([id]) => !only || id === only)
  for (const [id, tenant] of entries) {
    await seedRestaurant(id, tenant, me.uid, me.email, log)
  }

  log('done')
  return { uid: me.uid, log: lines }
}

/**
 * Claim platform admin for whoever is signed in.
 *
 * Only works inside the bootstrap window in firestore.rules: the signed-in
 * address must match the one named there, the document must be the caller's
 * own uid, and the window must not have expired. Everything else about that
 * collection stays sealed — no edits, no deletes, no claiming on behalf of
 * someone else, ever.
 */
export async function claimPlatformAdmin() {
  if (!db || !auth) throw new Error('Firebase is not configured — check .env and restart Vite.')
  const me = auth.currentUser
  if (!me) throw new Error('Not signed in.')

  await setDoc(doc(db, 'platformAdmins', me.uid), {
    email: me.email,
    claimed_at: new Date().toISOString(),
  })
  return { uid: me.uid, email: me.email }
}

/**
 * Sign in, or create the account if Firebase has never seen it.
 *
 * Firebase Auth starts empty, so on a brand new project the very first
 * attempt has nobody to authenticate against. Rather than make that a dead
 * end, fall through to signup — Email/Password is enabled, so this is the
 * same call the app's own staff signup makes.
 */
export async function signInOrCreate({ email, password }) {
  if (!auth) throw new Error('Firebase is not configured — check .env and restart Vite.')
  try {
    const back = await signInWithEmailAndPassword(auth, email, password)
    return { uid: back.user.uid, created: false }
  } catch (error) {
    const missing =
      error?.code === 'auth/user-not-found' || error?.code === 'auth/invalid-credential'
    if (!missing) throw error
    try {
      const made = await createUserWithEmailAndPassword(auth, email, password)
      return { uid: made.user.uid, created: true }
    } catch (second) {
      // The account does exist — the password was simply wrong. Say that,
      // rather than the misleading 'invalid-credential' Firebase returns
      // when it refuses to confirm whether an address is registered.
      if (second?.code === 'auth/email-already-in-use') {
        throw new Error('That account exists, but the password is wrong.')
      }
      throw second
    }
  }
}
