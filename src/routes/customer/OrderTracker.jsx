import { countItems, formatMoney, minutesSince, orderTotal } from '../../lib/format'
import { useTicker } from '../../hooks/useTicker'

const STEPS = [
  { key: 'pending', label: 'Received' },
  { key: 'preparing', label: 'Cooking' },
  { key: 'ready', label: 'On its way' },
]

/**
 * What this table has already sent in.
 *
 * Lives inside a sheet rather than on the menu page: it matters intensely for
 * about thirty seconds after ordering and then becomes clutter above the food
 * the guest is trying to read. A button surfaces it on demand instead.
 *
 * The kitchen's quoted time is shown as a countdown, not a raw number — "about
 * 6 min" answers the question; "20 min prep" does not.
 */
export default function OrderTracker({ orders }) {
  useTicker(20000)

  return (
    <ul className="divide-y divide-line">
      {orders.map((order) => {
        const stepIndex = STEPS.findIndex((s) => s.key === order.status)
        const age = minutesSince(order.created_at)
        const remaining = order.prep_time_minutes
          ? Math.max(0, order.prep_time_minutes - age)
          : null

        return (
          <li key={order.id} className="py-4 first:pt-0 last:pb-0">
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <p className="text-[15px] font-semibold">
                {countItems(order)} item{countItems(order) === 1 ? '' : 's'}
              </p>
              <span className="tabular text-[15px] font-bold">
                {formatMoney(orderTotal(order))}
              </span>
            </div>

            <p className="tabular mb-3 text-[12px] text-ink-faint">
              Sent {age} min ago
              {remaining !== null &&
                ` · ${remaining > 0 ? `about ${remaining} min to go` : 'any moment now'}`}
            </p>

            <ul className="mb-3 space-y-1">
              {(order.items ?? []).map((line, index) => (
                <li key={index} className="flex gap-2 text-[13px] text-ink-soft">
                  <span className="tabular font-semibold text-ink">{line.qty}&times;</span>
                  {line.name}
                </li>
              ))}
            </ul>

            <div className="flex gap-1.5">
              {STEPS.map((step, index) => (
                <div key={step.key} className="flex-1">
                  <div
                    className={`h-1 rounded-pill transition-colors ${
                      index <= stepIndex ? 'bg-state-ready' : 'bg-line'
                    }`}
                  />
                  <p
                    className={`mt-1.5 text-[11px] ${
                      index === stepIndex
                        ? 'font-semibold text-ink'
                        : index < stepIndex
                          ? 'text-ink-faint'
                          : 'text-ink-faint/55'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
