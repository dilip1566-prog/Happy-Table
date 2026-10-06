import { useEffect, useState } from 'react'
import { subscribe } from '../data'

/** Active sessions, for billing and the floor plan. */
export function useSessions() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = subscribe('sessions', (rows) => {
      setSessions(rows.filter((s) => s.status === 'active'))
      setLoading(false)
    })
    return unsubscribe // STRICT UNMOUNT
  }, [])

  return { sessions, loading }
}
