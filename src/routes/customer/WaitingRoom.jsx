import { useState } from 'react'
import { useRestaurant } from '../../tenant/context'
import { USE_MOCK, approveAndLinkTables } from '../../data'

/**
 * Everything before and after service.
 *
 * The knock is genuinely a wait with no progress bar to offer, so the screen
 * sets expectations honestly rather than faking motion. After the bill is
 * settled it becomes a sign-off, which stops a closed table reading as
 * "still waiting".
 */
export default function WaitingRoom({ tableId, status, wasSeated }) {
  const restaurant = useRestaurant()
  if (wasSeated) {
    return (
      <Shell>
        <p className="font-display text-[44px] leading-none">Thank you</p>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
          Your bill is settled and table {tableId} is closed. We hope to see you again.
        </p>
        <p className="mt-6 text-[13px] text-ink-faint">
          Scan the code again to start a new visit.
        </p>
      </Shell>
    )
  }

  const knocking = status === 'pending_approval'

  return (
    <Shell>
      <span className="mb-6 flex items-center gap-2 rounded-pill bg-state-new-bg px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-state-new">
        <span className="ring-live size-1.5 rounded-full bg-state-new" />
        {knocking ? 'Letting the team know' : 'Just a moment'}
      </span>

      <p className="font-display text-[44px] leading-none">{restaurant.name}</p>

      <h1 className="mt-5 text-[19px] font-semibold tracking-[-0.02em]">
        {knocking ? `Welcome to table ${tableId}` : 'Getting your table ready'}
      </h1>

      <p className="mt-2 max-w-xs text-[14px] leading-relaxed text-ink-soft">
        {knocking
          ? 'A host is on their way to seat you. Your menu opens here automatically — no need to refresh.'
          : 'One moment while we check this table.'}
      </p>

      <div className="mt-9 flex gap-1.5" aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="size-1.5 animate-pulse rounded-full bg-line-strong"
            style={{ animationDelay: `${index * 0.22}s`, animationDuration: '1.4s' }}
          />
        ))}
      </div>

      {knocking && <SeatMeShortcut tableId={tableId} />}
    </Shell>
  )
}

/**
 * Demo affordance only, and it disappears the moment USE_MOCK is false.
 *
 * In service a guest obviously cannot seat themselves — approval is the
 * manager's call and that is the whole point of the knock. But while the
 * design is being reviewed, being stranded here with no way forward unless
 * you open a second screen makes the guest flow impossible to walk through.
 */
function SeatMeShortcut({ tableId }) {
  const [seating, setSeating] = useState(false)
  if (!USE_MOCK) return null

  return (
    <div className="mt-10 w-full border-t border-line pt-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
        Design preview
      </p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-faint">
        A host would approve this on the manager screen. Skip ahead:
      </p>
      <button
        disabled={seating}
        onClick={() => {
          setSeating(true)
          approveAndLinkTables([Number(tableId)]).catch(() => setSeating(false))
        }}
        className="mt-3 h-11 w-full rounded-control border border-line-strong bg-surface text-[14px] font-semibold text-ink transition-colors hover:bg-sunken disabled:opacity-50"
      >
        {seating ? 'Seating…' : `Seat table ${tableId} now`}
      </button>
    </div>
  )
}

function Shell({ children }) {
  return (
    <div className="wash grid min-h-full place-items-center px-8">
      <div className="flex max-w-sm flex-col items-center text-center">{children}</div>
    </div>
  )
}
