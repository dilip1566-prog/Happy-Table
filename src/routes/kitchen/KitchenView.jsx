import { useState } from 'react'
import { useActiveOrders } from '../../hooks/useActiveOrders'
import { useInventory } from '../../hooks/useInventory'
import { useTicker } from '../../hooks/useTicker'
import { useAuth } from '../../auth/context'
import { roleLabel } from '../../auth/permissions'
import { useNavigate } from 'react-router-dom'
import { ticketUrgency } from '../../lib/format'
import OrderBoard from './OrderBoard'
import InventoryPanel from './InventoryPanel'

/**
 * /kitchen — the pass.
 *
 * Dark ground, because this screen lives under hot lamps and gets read from
 * two metres away. Everything is sized for a glance: the ticket clock is the
 * largest element on the card, and colour is reserved almost entirely for
 * lateness.
 *
 * The two panels stay mounted and switch with CSS, so the order feed is not
 * torn down and rebuilt every time a chef checks the 86 list.
 */
export default function KitchenView() {
  const [tab, setTab] = useState('orders')
  const { orders, bySession, loading } = useActiveOrders()
  const { soldOutItems } = useInventory()
  const { user, signOut, can } = useAuth()
  const navigate = useNavigate()
  useTicker(1000) // the clock has to tick every second to be trusted

  const late = orders.filter((o) => ticketUrgency(o) === 'late').length
  const now = orders.filter((o) => o.status === 'pending').length

  return (
    <div className="min-h-full bg-kds text-kds-ink">
      <header className="sticky top-0 z-40 border-b border-kds-line bg-kds/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 sm:px-6 sm:py-3.5">
          <div className="flex items-center gap-5">
            <span className="text-[13px] font-bold uppercase tracking-[0.14em] text-kds-ink-soft">
              Pass
            </span>

            <div className="flex items-center gap-2.5">
              <Metric value={now} label="new" tone="text-state-new" />
              <span className="text-kds-line">/</span>
              <Metric value={orders.length} label="working" />
              {late > 0 && (
                <>
                  <span className="text-kds-line">/</span>
                  <Metric value={late} label="late" tone="text-state-late" pulse />
                </>
              )}
            </div>
          </div>

          <nav className="order-3 flex w-full gap-1 rounded-pill bg-kds-surface p-1 sm:order-none sm:w-auto">
            {[
              { id: 'orders', label: 'Orders', show: true },
              {
                id: 'inventory',
                label: `86 list${soldOutItems.length ? ` · ${soldOutItems.length}` : ''}`,
                show: can('inventory.toggle') || can('menu.view'),
              },
            ]
              .filter((item) => item.show)
              .map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex-1 rounded-pill px-4 py-2.5 text-[13px] font-semibold transition-colors sm:flex-none sm:px-5 ${
                  tab === item.id
                    ? 'bg-kds-raised text-kds-ink'
                    : 'text-kds-ink-soft hover:text-kds-ink'
                }`}
              >
                {item.label}
              </button>
              ))}
          </nav>

          <button
            onClick={() => {
              signOut()
              navigate('/login', { replace: true })
            }}
            className="flex items-center gap-2 rounded-control border border-kds-line bg-kds-surface py-1.5 pl-1.5 pr-3 text-left transition-colors hover:bg-kds-raised"
            title="Sign out"
          >
            <span className="grid size-7 place-items-center rounded-full bg-kds-raised font-display text-[14px] text-kds-ink-soft">
              {user?.name?.charAt(0) ?? '?'}
            </span>
            <span className="leading-tight">
              <span className="block text-[12px] font-semibold">{user?.name}</span>
              <span className="block text-[10px] uppercase tracking-[0.06em] text-kds-ink-soft">
                {roleLabel(user?.role)} · sign out
              </span>
            </span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] p-4 sm:p-5">
        <div className={tab === 'orders' ? 'block' : 'hidden'}>
          <OrderBoard bySession={bySession} orders={orders} loading={loading} />
        </div>
        <div className={tab === 'inventory' ? 'block' : 'hidden'}>
          <InventoryPanel />
        </div>
      </main>
    </div>
  )
}

function Metric({ value, label, tone, pulse }) {
  return (
    <span className="flex items-baseline gap-1.5">
      <span className={`tabular text-[22px] font-bold leading-none ${tone ?? 'text-kds-ink'}`}>
        {value}
      </span>
      <span
        className={`text-[11px] font-semibold uppercase tracking-[0.08em] ${
          tone ?? 'text-kds-ink-soft'
        } ${pulse ? 'animate-pulse' : ''}`}
      >
        {label}
      </span>
    </span>
  )
}
