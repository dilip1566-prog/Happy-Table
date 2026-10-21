import { useEffect, useMemo, useState } from 'react'
import { TenantContext } from './context'
import { setActiveTenant } from './current'
import { currentSlug } from './resolve'
import { lookupRestaurantBySlug } from '../data'
import { Spinner } from '../components/ui'

/**
 * The gate every tenant page sits behind.
 *
 * Resolves the subdomain to a restaurant before a single query runs, so no
 * component can accidentally read another restaurant's data while the
 * lookup is in flight. Three outcomes:
 *
 *   no slug      -> the root domain: our own admin console
 *   unknown slug -> a clear 404, not a blank screen
 *   suspended    -> told plainly, because an unpaid account should know why
 */
export function TenantProvider({ children, onRoot }) {
  const slug = useMemo(() => currentSlug(), [])
  const [state, setState] = useState({ status: 'loading', restaurant: null })

  useEffect(() => {
    if (!slug) {
      setActiveTenant(null)
      setState({ status: 'root', restaurant: null })
      return
    }

    let cancelled = false
    setState({ status: 'loading', restaurant: null })

    lookupRestaurantBySlug(slug)
      .then((restaurant) => {
        if (cancelled) return
        if (!restaurant) {
          setActiveTenant(null)
          setState({ status: 'unknown', restaurant: null })
          return
        }
        // Set this BEFORE rendering children: the first hook to mount will
        // immediately start querying, and it must already know where to look.
        setActiveTenant(restaurant.id)
        setState({
          status: restaurant.status === 'suspended' ? 'suspended' : 'ready',
          restaurant,
        })
      })
      .catch((error) => {
        console.error('[tenant] lookup failed', error)
        if (!cancelled) setState({ status: 'error', restaurant: null, error })
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  const value = useMemo(
    () => ({
      slug,
      restaurantId: state.restaurant?.id ?? null,
      restaurant: state.restaurant,
      status: state.status,
    }),
    [slug, state]
  )

  if (state.status === 'loading') {
    return (
      <div className="grid min-h-full place-items-center">
        <Spinner label="Opening the restaurant" />
      </div>
    )
  }

  if (state.status === 'root') return onRoot

  if (state.status === 'unknown') {
    return (
      <Notice
        title="We can’t find that restaurant"
        body={`Nothing is set up at “${slug}”. Check the address, or ask the restaurant for their link.`}
      />
    )
  }

  if (state.status === 'suspended') {
    return (
      <Notice
        title="Temporarily unavailable"
        body={`${state.restaurant?.name ?? 'This restaurant'} is not taking orders through the app at the moment. Please ask a member of staff.`}
      />
    )
  }

  if (state.status === 'error') {
    return (
      <Notice
        title="Something went wrong"
        body="We couldn’t reach the restaurant. Please try again in a moment."
      />
    )
  }

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
}

function Notice({ title, body }) {
  return (
    <div className="wash grid min-h-full place-items-center px-8 text-center">
      <div className="max-w-sm">
        <h1 className="font-display text-[34px] leading-tight">{title}</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">{body}</p>
      </div>
    </div>
  )
}
