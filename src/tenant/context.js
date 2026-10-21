import { createContext, useContext } from 'react'

/**
 * Kept apart from the provider component for the same reason as the auth
 * context: a module that exports both a component and a hook breaks React
 * Fast Refresh and produces two copies of the context.
 */
export const TenantContext = createContext(null)

export function useTenant() {
  const context = useContext(TenantContext)
  if (!context) throw new Error('useTenant must be used inside <TenantProvider>')
  return context
}

/** The restaurant record: name, tagline, currency, status. */
export function useRestaurant() {
  return useTenant().restaurant
}
