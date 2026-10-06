/**
 * One-off seeder: creates the table documents, the inventory config doc, and
 * a few sample dishes so the app has something to render on first run.
 *
 *   node scripts/seed.js            # 12 tables
 *   node scripts/seed.js --tables 20
 *   node scripts/seed.js --no-menu  # tables + inventory only
 *
 * Reads the same .env the Vite app uses. Safe to re-run: tables and the
 * inventory doc are written with merge, and menu items are only added when the
 * menu collection is empty.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { initializeApp } from 'firebase/app'
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  setDoc,
  writeBatch,
} from 'firebase/firestore'

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

const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
})
const db = getFirestore(app)

const args = process.argv.slice(2)
const tableCount = Number(args[args.indexOf('--tables') + 1]) || 12
const withMenu = !args.includes('--no-menu')

const SAMPLE_MENU = [
  { name: 'Paneer Tikka', price: 320, image_url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400' },
  { name: 'Butter Chicken', price: 420, image_url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400' },
  { name: 'Dal Makhani', price: 280, image_url: 'https://images.unsplash.com/photo-1626500155537-8d5a2a2e2c1c?w=400' },
  { name: 'Garlic Naan', price: 80, image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400' },
  { name: 'Hyderabadi Biryani', price: 450, image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400' },
  { name: 'Masala Chai', price: 60, image_url: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400' },
  { name: 'Gulab Jamun', price: 140, image_url: 'https://images.unsplash.com/photo-1601303516534-bf0b1eb8bd4f?w=400' },
]

async function seedTables() {
  const batch = writeBatch(db)
  for (let number = 1; number <= tableCount; number += 1) {
    batch.set(
      doc(db, 'tables', String(number)),
      { table_number: number, status: 'available', session_id: null },
      { merge: true }
    )
  }
  await batch.commit()
  console.log(`✓ ${tableCount} tables ready (docs "1".."${tableCount}")`)
}

async function seedInventory() {
  await setDoc(doc(db, 'store_config', 'inventory'), { sold_out_items: [] }, { merge: true })
  console.log('✓ store_config/inventory ready')
}

async function seedMenu() {
  const existing = await getDocs(collection(db, 'menu'))
  if (!existing.empty) {
    console.log(`• menu already has ${existing.size} items - skipping`)
    return
  }

  const batch = writeBatch(db)
  for (const item of SAMPLE_MENU) {
    batch.set(doc(collection(db, 'menu')), item)
  }
  await batch.commit()
  console.log(`✓ ${SAMPLE_MENU.length} sample dishes added`)
}

try {
  await seedTables()
  await seedInventory()
  if (withMenu) await seedMenu()
  console.log('\nSeed complete.')
  process.exit(0)
} catch (err) {
  console.error('\nSeed failed:', err.message)
  process.exit(1)
}
