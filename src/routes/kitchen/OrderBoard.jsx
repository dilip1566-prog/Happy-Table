import { useState } from 'react'
import { setOrderStatus } from '../../data'
import { countItems, elapsedClock, ticketUrgency } from '../../lib/format'
import { Empty, Spinner } from '../../components/ui'
import { useAuth } from '../../auth/context'

const PREP_PRESETS = [10, 15, 20, 30]

/**
 * The ticket rail.
 *
 * Tickets sit in a horizontal rail of fixed-width columns — the layout every
 * kitchen already knows from a paper rail, read left to right, oldest first.
 * Grouping is by session, so a party split across linked tables plates
 * together instead of arriving in two waves.
 */
export default function OrderBoard({ bySession, orders, loading }) {
  const [busy, setBusy] = useState(null)
  const { can } = useAuth()
  const canFire = can('orders.fire')
  const canReady = can('orders.ready')

  const advance = async (order, status, prep) => {
    setBusy(order.id)
    try {
      await setOrderStatus(order.id, status, prep)
    } finally {
      setBusy(null)
    }
  }

  if (loading) return <Spinner dark label="Opening the order feed" />

  if (!orders.length) {
    return (
      <Empty
        dark
        icon="✓"
        title="All tickets cleared"
        hint="New orders appear here the moment a table sends them."
      />
    )
  }

  return (
    <div className="grid gap-4 sm:flex sm:overflow-x-auto sm:pb-4">
      {bySession.map((group) => (
        <SessionRail
          key={group.session_id}
          group={group}
          busy={busy}
          onAdvance={advance}
          canFire={canFire}
          canReady={canReady}
        />
      ))}
    </div>
  )
}

function SessionRail({ group, busy, onAdvance, canFire, canReady }) {
  const tables = [...new Set(group.orders.map((o) => o.ordered_by_table))].sort((a, b) => a - b)

  return (
    <section className="w-full sm:w-[320px] sm:shrink-0">
      <header className="mb-2.5 flex items-baseline justify-between px-0.5">
        <h2 className="text-[15px] font-bold tracking-[-0.01em]">
          {tables.length > 1 ? 'Tables' : 'Table'}{' '}
          <span className="tabular">{tables.join(' + ')}</span>
        </h2>
        <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-kds-ink-soft">
          {group.orders.length} ticket{group.orders.length === 1 ? '' : 's'}
        </span>
      </header>

      <div className="space-y-3">
        {group.orders.map((order) => (
          <Ticket
            key={order.id}
            order={order}
            busy={busy === order.id}
            onAdvance={onAdvance}
            canFire={canFire}
            canReady={canReady}
          />
        ))}
      </div>
    </section>
  )
}

function Ticket({ order, busy, onAdvance, canFire, canReady }) {
  const urgency = ticketUrgency(order)
  const isNew = order.status === 'pending'

  const edge = {
    late: 'bg-state-late',
    due: 'bg-state-new',
    fine: isNew ? 'bg-state-new' : 'bg-state-fire',
  }[urgency]

  const clockTone = {
    late: 'text-state-late',
    due: 'text-state-new',
    fine: 'text-kds-ink',
  }[urgency]

  return (
    <article
      className={`rise relative overflow-hidden rounded-card border bg-kds-surface ${
        urgency === 'late' ? 'border-state-late/50' : 'border-kds-line'
      }`}
    >
      <span className={`absolute inset-x-0 top-0 h-1 ${edge}`} />

      <div className="flex items-start justify-between px-4 pb-3 pt-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-kds-ink-soft">
            Table {order.ordered_by_table} &middot; {countItems(order)} items
          </p>
          <p className={`tabular mt-0.5 text-[30px] font-bold leading-none ${clockTone}`}>
            {elapsedClock(order.created_at)}
          </p>
        </div>

        <span
          className={`rounded-pill px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${
            isNew ? 'bg-state-new/15 text-state-new' : 'bg-state-fire/15 text-state-fire'
          }`}
        >
          {isNew ? 'New' : `On · ${order.prep_time_minutes}m`}
        </span>
      </div>

      <ul className="space-y-2 border-t border-kds-line px-4 py-3.5">
        {(order.items ?? []).map((line, index) => (
          <li key={index} className="flex items-baseline gap-3">
            <span className="tabular grid size-7 shrink-0 place-items-center rounded-[6px] bg-kds-raised text-[14px] font-bold">
              {line.qty}
            </span>
            <span className="text-[16px] font-medium leading-snug">{line.name}</span>
          </li>
        ))}
      </ul>

      <div className="border-t border-kds-line p-3">
        {isNew ? (
          !canFire ? (
            // A pass that may only mark food ready still needs to clear the
            // ticket, so the Ready action stays even before it is fired.
            canReady ? (
              <button
                disabled={busy}
                onClick={() => onAdvance(order, 'ready')}
                className="h-14 w-full rounded-control bg-state-ready text-[15px] font-bold text-kds transition-transform active:scale-95 disabled:opacity-40"
              >
                {busy ? '…' : 'Ready'}
              </button>
            ) : (
              <p className="py-3 text-center text-[12px] text-kds-ink-soft">View only</p>
            )
          ) : (
          <>
            <p className="mb-2 px-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-kds-ink-soft">
              Fire &amp; quote
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {PREP_PRESETS.map((minutes) => (
                <button
                  key={minutes}
                  disabled={busy}
                  onClick={() => onAdvance(order, 'preparing', minutes)}
                  className="tabular h-14 rounded-control bg-state-fire text-[15px] font-bold text-white transition-transform active:scale-95 disabled:opacity-40"
                >
                  {minutes}m
                </button>
              ))}
            </div>
          </>
          )
        ) : !canReady ? (
          <p className="py-3 text-center text-[12px] text-kds-ink-soft">View only</p>
        ) : (
          <div className="flex gap-2">
            <button
              disabled={busy}
              onClick={() => onAdvance(order, 'ready')}
              className="h-14 flex-1 rounded-control bg-state-ready text-[15px] font-bold text-white transition-transform active:scale-95 disabled:opacity-40"
            >
              {busy ? '…' : 'Ready'}
            </button>
            <button
              disabled={busy}
              onClick={() => onAdvance(order, 'pending', null)}
              className="h-14 rounded-control border border-kds-line bg-kds-raised px-4 text-[13px] font-semibold text-kds-ink-soft transition-transform active:scale-95 disabled:opacity-40"
            >
              Undo
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
