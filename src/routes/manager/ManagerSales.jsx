import { useEffect, useMemo, useState } from 'react'
import { subscribe } from '../../data'
import { formatMoney, orderTotal } from '../../lib/format'
import { Card, SectionTitle, Spinner, Stat } from '../../components/ui'

/**
 * Takings.
 *
 * This screen is the reason `reports.sales` exists as a separate capability.
 * A manager runs the whole service — seats, fires, settles — without ever
 * needing to know what the day took, and for most owners that is exactly the
 * line they want drawn.
 *
 * Everything here is derived from orders already in memory, so opening it
 * costs nothing extra.
 */
export default function ManagerSales() {
  const [orders, setOrders] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const offOrders = subscribe('orders', (rows) => {
      setOrders(rows)
      setLoading(false)
    })
    const offSessions = subscribe('sessions', setSessions)
    return () => {
      offOrders()
      offSessions()
    } // STRICT UNMOUNT
  }, [])

  const stats = useMemo(() => {
    const gross = orders.reduce((sum, order) => sum + orderTotal(order), 0)
    const covers = sessions.reduce((sum, s) => sum + (s.covers ?? 0), 0)

    const byDish = new Map()
    for (const order of orders) {
      for (const line of order.items ?? []) {
        const row = byDish.get(line.menu_item_id) ?? { name: line.name, qty: 0, value: 0 }
        row.qty += Number(line.qty)
        row.value += Number(line.price) * Number(line.qty)
        byDish.set(line.menu_item_id, row)
      }
    }

    const top = [...byDish.values()].sort((a, b) => b.value - a.value).slice(0, 8)
    const maxValue = top[0]?.value ?? 1

    return {
      gross,
      covers,
      orderCount: orders.length,
      perCover: covers ? gross / covers : 0,
      perOrder: orders.length ? gross / orders.length : 0,
      top,
      maxValue,
    }
  }, [orders, sessions])

  if (loading) return <Spinner label="Adding up" />

  return (
    <div className="space-y-7">
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        <Stat label="Taken today" value={formatMoney(stats.gross)} tone="ready" />
        <Stat label="Covers" value={stats.covers} />
        <Stat label="Orders" value={stats.orderCount} />
        <Stat label="Per cover" value={formatMoney(stats.perCover)} />
      </div>

      <section>
        <SectionTitle hint="By value, across every open and settled tab">
          Best sellers
        </SectionTitle>

        <Card className="divide-y divide-line">
          {stats.top.length === 0 ? (
            <p className="px-5 py-12 text-center text-[14px] text-ink-faint">
              Nothing sold yet today.
            </p>
          ) : (
            stats.top.map((row, index) => (
              <div key={row.name} className="px-5 py-3.5">
                <div className="mb-2 flex items-baseline justify-between gap-4">
                  <span className="flex min-w-0 items-baseline gap-2.5">
                    <span className="tabular text-[13px] font-bold text-ink-faint">
                      {index + 1}
                    </span>
                    <span className="truncate text-[15px] font-medium">{row.name}</span>
                  </span>
                  <span className="flex shrink-0 items-baseline gap-3">
                    <span className="tabular text-[12px] text-ink-faint">{row.qty} sold</span>
                    <span className="tabular w-[70px] text-right text-[15px] font-bold">
                      {formatMoney(row.value)}
                    </span>
                  </span>
                </div>
                <div
                  className="h-1 rounded-pill bg-accent/70"
                  style={{ width: `${Math.max(4, (row.value / stats.maxValue) * 100)}%` }}
                />
              </div>
            ))
          )}
        </Card>
      </section>

      <p className="text-[12px] leading-relaxed text-ink-faint">
        Figures cover the current demo session only — every order in memory, open
        tabs included. Once this is on a real database these become
        date-ranged and will need a proper end-of-day close.
      </p>
    </div>
  )
}
