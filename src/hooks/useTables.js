import { useEffect, useMemo, useState } from 'react'
import { subscribe } from '../data'

/**
 * Live view of the whole floor. A dining room is a bounded set (tens of rows,
 * not thousands), so one listener here is cheaper than several filtered ones
 * and it powers the floor plan, the approvals queue and the cover count from
 * a single subscription.
 */
export function useTables() {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = subscribe('tables', (rows) => {
      setTables([...rows].sort((a, b) => a.table_number - b.table_number))
      setLoading(false)
    })
    return unsubscribe // STRICT UNMOUNT
  }, [])

  const pending = useMemo(
    () => tables.filter((t) => t.status === 'pending_approval'),
    [tables]
  )
  const occupied = useMemo(() => tables.filter((t) => t.status === 'occupied'), [tables])
  const needsClearing = useMemo(
    () => tables.filter((t) => t.status === 'needs_clearing'),
    [tables]
  )
  const free = useMemo(() => tables.filter((t) => t.status === 'available'), [tables])

  return { tables, pending, occupied, needsClearing, free, loading }
}

/** One table, for the customer route. */
export function useTableStatus(tableNumber) {
  const { tables, loading } = useTables()
  const table = tables.find((t) => String(t.table_number) === String(tableNumber)) ?? null
  return { table, loading }
}
