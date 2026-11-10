import { createContext, useContext } from 'react'

/**
 * Kept apart from the provider component for the same reason as the auth and
 * tenant contexts: a module exporting both a component and a plain value
 * breaks React Fast Refresh and ends up with two copies of the context.
 */
export const AdminContext = createContext(null)

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) throw new Error('useAdmin must be used inside <AdminProvider>')
  return context
}
