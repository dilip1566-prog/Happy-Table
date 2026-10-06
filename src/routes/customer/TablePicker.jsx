import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTables } from '../../hooks/useTables'
import { RESTAURANT } from '../../mock/data'
import { Banner, Spinner } from '../../components/ui'

/**
 * /customer — the guest's front door.
 *
 * A QR sticker on the table can still deep-link straight to /customer/7, and
 * that remains the quickest path. This page exists for everything else: a
 * single poster by the entrance, a card on the bar, a guest who moved table,
 * or a code that would not scan.
 *
 * Only free tables are offered. Letting someone join a table that already has
 * a bill running is how the wrong party gets charged, so a taken table is
 * shown but not selectable — visible, because a guest sitting at table 7
 * needs to understand why 7 is not available rather than think the app is
 * broken.
 */
export default function TablePicker() {
  const { tables, loading } = useTables()
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  const choose = (table) => {
    if (table.status !== 'available') {
      setError(
        `Table ${table.table_number} is already in use. Please check your table number, or ask a member of staff.`
      )
      return
    }
    // The knock itself happens on the next screen, which already owns that
    // logic — this page only decides which table to open.
    navigate(`/customer/${table.table_number}`)
  }

  if (loading) {
    return (
      <div className="grid min-h-full place-items-center">
        <Spinner label="Looking up the dining room" />
      </div>
    )
  }

  const free = tables.filter((t) => t.status === 'available').length

  return (
    <div className="wash min-h-full">
      <header className="border-b border-line">
        <div className="mx-auto max-w-3xl px-5 py-9 text-center sm:py-12">
          <p className="font-display text-[40px] leading-none sm:text-[52px]">
            {RESTAURANT.name}
          </p>
          <p className="mt-2 text-[12px] uppercase tracking-[0.14em] text-ink-faint">
            {RESTAURANT.tagline}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-8">
        <div className="text-center">
          <h1 className="text-[22px] font-semibold tracking-[-0.02em]">
            Which table are you at?
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-ink-soft">
            Tap your table number. A host will come over to seat you, and the menu
            opens here automatically.
          </p>
        </div>

        {error && (
          <div className="mt-6">
            <Banner tone="bad" onDismiss={() => setError(null)}>
              {error}
            </Banner>
          </div>
        )}

        <div className="mt-8 grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3 md:grid-cols-5">
          {tables.map((table) => {
            const open = table.status === 'available'
            return (
              <button
                key={table.id}
                onClick={() => choose(table)}
                aria-label={
                  open
                    ? `Table ${table.table_number}, ${table.seats} seats`
                    : `Table ${table.table_number}, in use`
                }
                className={`rounded-card border py-5 text-center transition-all ${
                  open
                    ? 'border-state-ready/30 bg-surface hover:border-state-ready hover:bg-state-ready-bg active:scale-95'
                    : 'cursor-not-allowed border-line bg-sunken opacity-45'
                }`}
              >
                <span
                  className={`tabular block text-[28px] font-bold leading-none tracking-[-0.02em] ${
                    open ? 'text-ink' : 'text-ink-faint'
                  }`}
                >
                  {table.table_number}
                </span>
                <span
                  className={`mt-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] ${
                    open ? 'text-state-ready' : 'text-ink-faint'
                  }`}
                >
                  {open ? `${table.seats} seats` : 'In use'}
                </span>
              </button>
            )
          })}
        </div>

        <p className="mt-8 text-center text-[13px] text-ink-faint">
          {free} of {tables.length} tables free &middot; scanning the code on your
          table skips this step
        </p>
      </main>
    </div>
  )
}
