import { useMemo, useState } from 'react'
import { signInPlatformAdmin, signOutPlatformAdmin } from '../data'
import { AdminContext } from './context'

/**
 * Who is running the platform, on this tab.
 *
 * sessionStorage rather than localStorage, deliberately: this console can
 * suspend a restaurant and read every account on the platform, so a session
 * that outlives the browser window is a session nobody remembers to end.
 * Closing the tab signs out.
 *
 * What is stored here is a convenience, not a credential. In Firestore mode
 * the real gate is `platformAdmins/{uid}`, which is checked at sign-in and
 * again by the security rules on every single read and write — so editing
 * this record by hand opens the console's chrome and nothing behind it. That
 * ordering is the point: the UI is a convenience, the rules are the
 * enforcement.
 */
const STORAGE_KEY = 'happytable-superadmin-session'

function readStored() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(readStored)

  const value = useMemo(
    () => ({
      admin,

      signIn: async (email, password) => {
        const person = await signInPlatformAdmin(email, password)
        setAdmin(person)
        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(person))
        } catch {
          /* private mode — the session just won't survive a reload */
        }
        return person
      },

      signOut: async () => {
        // Clear our own record first. If the Firebase sign-out is slow or
        // fails, the console must already be locked rather than sitting
        // open while we wait on the network.
        setAdmin(null)
        try {
          sessionStorage.removeItem(STORAGE_KEY)
        } catch {
          /* non-fatal */
        }
        await signOutPlatformAdmin()
      },
    }),
    [admin]
  )

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}
