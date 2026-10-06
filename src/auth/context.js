import { createContext, useContext } from 'react'

/**
 * The auth context and its hooks live apart from the provider component.
 *
 * React Fast Refresh only handles a module cleanly when it exports either
 * components or plain values, not both. With the hook and the provider in one
 * file, editing it during a dev session produced two module instances, two
 * different context objects, and "useAuth must be used inside AuthProvider"
 * on a tree that plainly was. Splitting them is the documented fix.
 */
export const AuthContext = createContext(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}

/** Convenience for the common case. */
export function useCan(permissionId) {
  return useAuth().can(permissionId)
}
