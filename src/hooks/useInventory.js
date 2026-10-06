import { useEffect, useState } from 'react'
import { subscribe } from '../data'

/**
 * Live sold-out list from a single inventory record. One subscription covers
 * the entire menu no matter how long it is.
 */
export function useInventory() {
  const [soldOutItems, setSoldOutItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = subscribe('inventory', (data) => {
      setSoldOutItems(data.sold_out_items ?? [])
      setLoading(false)
    })
    return unsubscribe // STRICT UNMOUNT
  }, [])

  return { soldOutItems, isSoldOut: (id) => soldOutItems.includes(id), loading }
}
