import { useEffect, useState } from 'react'

/**
 * Re-renders on an interval so elapsed-time labels stay honest without every
 * ticket card owning its own timer.
 */
export function useTicker(intervalMs = 15000) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), intervalMs)
    return () => clearInterval(id) // STRICT UNMOUNT
  }, [intervalMs])
}
