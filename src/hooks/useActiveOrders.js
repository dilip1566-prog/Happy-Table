import { useEffect, useMemo, useState } from 'react'
import { subscribe } from '../data'

/**
 * The KDS feed. Filtered to work the kitchen still has to do, so served
 * tickets fall out of the query rather than needing a cleanup write.
 */
export function useActiveOrders() {
  const [allOrders, setAllOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = subscribe('orders', (rows) => {
      setAllOrders(rows)
      setLoading(false)
    })
    return unsubscribe // STRICT UNMOUNT
  }, [])

  const orders = useMemo(
    () =>
      allOrders
        .filter((o) => o.status === 'pending' || o.status === 'preparing')
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
    [allOrders]
  )

  const bySession = useMemo(() => {
    const groups = new Map()
    for (const order of orders) {
      if (!groups.has(order.session_id)) groups.set(order.session_id, [])
      groups.get(order.session_id).push(order)
    }
    return Array.from(groups, ([session_id, rows]) => ({ session_id, orders: rows }))
  }, [orders])

  return { orders, allOrders, bySession, loading }
}

/** The guest's own tickets, for the order-tracking strip. */
export function useMyOrders(sessionId, tableNumber) {
  const { allOrders, loading } = useActiveOrders()
  const mine = useMemo(
    () =>
      allOrders
        .filter(
          (o) => o.session_id === sessionId && Number(o.ordered_by_table) === Number(tableNumber)
        )
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    [allOrders, sessionId, tableNumber]
  )
  return { orders: mine, loading }
}
