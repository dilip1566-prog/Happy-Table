import { useEffect, useState } from 'react'
import { fetchOnce, subscribe, USE_MOCK } from '../data'

/**
 * The menu is static data: fetched once, never listened to in production.
 *
 * Under the mock we subscribe instead, purely so a dish added on the manager
 * screen appears immediately while the design is being reviewed. With the
 * real backend this collapses back to a single cached getDocs().
 */
export function useMenu() {
  const [menu, setMenu] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (USE_MOCK) {
      const unsubscribe = subscribe('menu', (rows) => {
        setMenu(rows)
        setLoading(false)
      })
      return unsubscribe // STRICT UNMOUNT
    }

    let cancelled = false
    fetchOnce('menu')
      .then((rows) => {
        if (cancelled) return
        setMenu(rows)
        setLoading(false)
      })
      .catch(() => !cancelled && setLoading(false))

    return () => {
      cancelled = true
    }
  }, [])

  return { menu, loading, refresh: () => {} }
}
