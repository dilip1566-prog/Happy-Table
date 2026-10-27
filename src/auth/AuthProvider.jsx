import { useEffect, useMemo, useState } from 'react'
import { signInWithEmail, subscribe } from '../data'
import { AuthContext } from './context'

const STORAGE_KEY = 'service-session-v1'

/**
 * Who is signed in on this device, and what they may do.
 *
 * The session lives in sessionStorage rather than localStorage: a tablet at
 * the pass gets used by whoever is standing in front of it, and a login that
 * survives the browser closing is a login nobody remembers to end. Closing
 * the tab signs out.
 *
 * Permissions are read live from the store, so when the owner revokes
 * something it takes effect on every open device immediately — no re-login.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const [rolePermissions, setRolePermissions] = useState({})
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const unsubscribe = subscribe('access', (map) => {
      setRolePermissions(map ?? {})
      setReady(true)
    })
    return unsubscribe // STRICT UNMOUNT
  }, [])

  const signIn = async (email, password) => {
    const person = await signInWithEmail(email, password)
    setUser(person)
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(person))
    } catch {
      /* private mode — the session just won't survive a reload */
    }
    return person
  }

  const signOut = () => {
    setUser(null)
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      /* non-fatal */
    }
  }

  const value = useMemo(() => {
    const granted = new Set(user ? (rolePermissions[user.role] ?? []) : [])

    return {
      user,
      ready,
      signIn,
      signOut,
      granted,
      /** The single question the whole UI asks. */
      can: (permissionId) => granted.has(permissionId),
      canAny: (...ids) => ids.some((id) => granted.has(id)),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, rolePermissions, ready])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
