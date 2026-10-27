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

/**
 * This restaurant's menu sections, in its own order.
 *
 * They ride on the restaurant record rather than a collection of their own:
 * nothing can render until that record has loaded anyway, so putting them
 * here costs no extra read. Never import a CATEGORIES constant into a
 * component — that is one restaurant's list being shown to all of them.
 */
export function useCategories() {
  return useTenant().restaurant?.categories ?? []
}
