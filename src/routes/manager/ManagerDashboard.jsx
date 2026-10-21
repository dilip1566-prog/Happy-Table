import { useState } from 'react'
import {
  addTablesToSession,
  approveAndLinkTables,
  freeTable,
  markTableCleared,
  mergeSessions,
  rejectTable,
  suggestAccessCode,
} from '../../data'
import { useTables } from '../../hooks/useTables'
import { useSessions } from '../../hooks/useSessions'
import { useTicker } from '../../hooks/useTicker'
import { useAuth } from '../../auth/context'
import { minutesSince } from '../../lib/format'
import {
  Banner,
  Button,
  Field,
  SectionTitle,
  Sheet,
  Spinner,
  Stat,
  inputClass,
} from '../../components/ui'

/**
 * The floor.
 *
 * A table is a physical object, so the tile behaves like one: tap a free
 * table to start seating it, tap a busy one to see who is on it and hand it
 * back. Everything about a table happens on the table, rather than in a
 * separate list elsewhere on the screen.
 */
export default function ManagerDashboard() {
  const { tables, pending, occupied, needsClearing, free, loading } = useTables()
  const { sessions } = useSessions()
  const { can, user } = useAuth()
  useTicker(20000)

  const [selected, setSelected] = useState([])
  const [seating, setSeating] = useState(false)
  const [openTableId, setOpenTableId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(null)
  const [issued, setIssued] = useState(null) // the code to read out after seating

  const canSeat = can('floor.seat')
  const canLink = can('floor.link')
  const canClear = can('floor.clear')

  const flash = (message) => {
    setDone(message)
    setTimeout(() => setDone(null), 4000)
  }

  const toggle = (number) =>
    setSelected((current) => {
      if (current.includes(number)) return current.filter((n) => n !== number)
      return canLink ? [...current, number] : [number]
    })

  /**
   * One handler, two destinations. With no joinSessionId this is exactly the
   * original path — a brand new party. With one, the tables land on a session
   * that may already have food on the way.
   */
  const seat = async (partyName, joinSessionId, accessCode) => {
    setBusy(true)
    setError(null)
    const list = [...selected].sort((a, b) => a - b)
    try {
      if (joinSessionId) {
        const joined = sessions.find((s) => s.session_id === joinSessionId)
        await addTablesToSession(selected, joinSessionId, { staff: user })
        flash(
          `Table${list.length > 1 ? 's' : ''} ${list.join(' + ')} added to ${
            joined?.party_name ?? `table ${joined?.linked_tables?.[0] ?? ''}`
          } — one bill`
        )
      } else {
        await approveAndLinkTables(selected, { staff: user, partyName, accessCode })
        // The code is the whole point of the new flow, so it gets its own
        // card rather than a banner that scrolls away before it is read out.
        setIssued({ code: accessCode, tables: list, partyName: partyName?.trim() || null })
      }
      setSelected([])
      setSeating(false)
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  const release = async (table) => {
    setBusy(true)
    setError(null)
    try {
      if (table.status === 'needs_clearing') await markTableCleared(table.table_number)
      else await freeTable(table.table_number)
      flash(`Table ${table.table_number} is free`)
      setOpenTableId(null)
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  const merge = async (keepId, mergeId) => {
    setBusy(true)
    setError(null)
    try {
      await mergeSessions(keepId, mergeId)
      flash('Parties merged — everything is now on one bill')
      setOpenTableId(null)
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  const sessionFor = (table) =>
    sessions.find((s) => s.session_id === table?.session_id) ?? null

  const openTable = tables.find((t) => t.id === openTableId) ?? null

  if (loading) return <Spinner label="Reading the floor" />

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        <Stat label="Waiting" value={pending.length} tone={pending.length ? 'new' : undefined} />
        <Stat label="Occupied" value={occupied.length} tone="fire" />
        <Stat
          label="To clear"
          value={needsClearing.length}
          tone={needsClearing.length ? 'clear' : undefined}
        />
        <Stat label="Free" value={free.length} tone="ready" />
      </div>

      {error && (
        <Banner tone="bad" onDismiss={() => setError(null)}>
          {error}
        </Banner>
      )}
      {done && <Banner tone="good">{done}</Banner>}

      <section>
        <SectionTitle
          hint={
            canSeat
              ? `${free.length} of ${tables.length} free${
                  canLink ? ' · select several to combine' : ''
                }`
              : `${free.length} of ${tables.length} free · view only`
          }
        >
          Dining room
        </SectionTitle>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-6">
          {tables.map((table) => (
            <TableTile
              key={table.id}
              table={table}
              session={sessionFor(table)}
              selected={selected.includes(table.table_number)}
              canSeat={canSeat}
              onSelect={() => toggle(table.table_number)}
              onOpen={() => setOpenTableId(table.id)}
              onDismiss={() => rejectTable(table.table_number).catch(setError)}
            />
          ))}
        </div>
      </section>

      {selected.length > 0 && (
        <div className="sticky bottom-5 z-30">
          <div className="rise flex flex-col gap-3 rounded-card border border-line bg-surface p-3 shadow-float sm:flex-row sm:items-center sm:justify-between sm:pl-5">
            <p className="text-[14px]">
              <span className="font-semibold">
                Table{selected.length > 1 ? 's' : ''}{' '}
                {[...selected].sort((a, b) => a - b).join(' + ')}
              </span>
              {selected.length > 1 && (
                <span className="text-ink-faint"> — one bill between them</span>
              )}
            </p>
            <div className="flex gap-2">
              <Button variant="quiet" onClick={() => setSelected([])}>
                Clear
              </Button>
              <Button size="lg" className="flex-1 sm:flex-none" onClick={() => setSeating(true)}>
                Seat guests
              </Button>
            </div>
          </div>
        </div>
      )}

      {issued && <CodeHandoverCard {...issued} onClose={() => setIssued(null)} />}

      {seating && (
        <SeatPartyDialog
          tables={[...selected].sort((a, b) => a - b)}
          sessions={sessions}
          busy={busy}
          onCancel={() => setSeating(false)}
          onSeat={seat}
        />
      )}

      {openTable && (
        <TableDialog
          table={openTable}
          session={sessionFor(openTable)}
          sessions={sessions}
          canClear={canClear}
          canLink={canLink}
          busy={busy}
          onClose={() => setOpenTableId(null)}
          onRelease={release}
          onMerge={merge}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tile
// ---------------------------------------------------------------------------

function TableTile({ table, session, selected, canSeat, onSelect, onOpen, onDismiss }) {
  const { status, table_number: number, seats } = table
  const waiting = status === 'pending_approval'
  const busy = status === 'occupied'
  const clearing = status === 'needs_clearing'

  const party = table.party_name ?? session?.party_name ?? null
  const server = table.served_by ?? session?.opened_by?.name ?? null

  const edge = waiting
    ? 'bg-state-new'
    : busy
      ? 'bg-state-fire'
      : clearing
        ? 'bg-state-clear'
        : 'bg-state-ready'

  // A busy table opens its own dialog; a free one starts a seating.
  const handleClick = busy || clearing ? onOpen : canSeat ? onSelect : undefined

  return (
    <div
      className={`relative overflow-hidden rounded-card border transition-all ${
        selected
          ? 'border-accent bg-accent-wash shadow-raise'
          : waiting
            ? 'border-state-new/40 bg-surface shadow-raise'
            : busy
              ? 'border-state-fire/25 bg-surface'
              : clearing
                ? 'border-state-clear/40 bg-surface shadow-raise'
                : 'border-state-ready/25 bg-surface'
      }`}
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${edge}`} />

      <button
        onClick={handleClick}
        disabled={!handleClick}
        className="block w-full px-4 py-3.5 pl-5 text-left disabled:cursor-default"
      >
        <div className="flex items-baseline justify-between">
          <span className="tabular text-[26px] font-semibold leading-none tracking-[-0.02em]">
            {number}
          </span>
          <span className="text-[11px] text-ink-faint">{seats} seats</span>
        </div>

        {busy && party ? (
          // The party's name replaces the word "occupied": it says the same
          // thing and answers the next question at the same time.
          <p className="mt-2 truncate text-[15px] font-bold text-state-fire">{party}</p>
        ) : (
          <p
            className={`mt-2.5 text-[12px] font-bold uppercase tracking-[0.07em] ${
              waiting
                ? 'text-state-new'
                : busy
                  ? 'text-state-fire'
                  : clearing
                    ? 'text-state-clear'
                    : 'text-state-ready'
            }`}
          >
            {waiting ? 'Waiting' : busy ? 'Occupied' : clearing ? 'Clearing' : 'Free'}
          </p>
        )}

        {busy && (
          <>
            {/* The code is what staff get asked for, so it sits on the tile
                rather than one tap away inside the table dialog. */}
            {session?.access_code && (
              <p className="mt-1.5 flex items-baseline gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-ink-faint">
                  Code
                </span>
                <span className="tabular text-[17px] font-bold leading-none text-accent">
                  {session.access_code}
                </span>
              </p>
            )}
            <p className="tabular mt-1 truncate text-[11px] text-ink-faint">
              {server && `${server} · `}
              {session ? `${minutesSince(session.created_at)} min` : 'seated'}
            </p>
          </>
        )}
        {clearing && (
          <p className="mt-1 text-[11px] text-ink-faint">Guests gone &middot; needs a reset</p>
        )}
        {waiting && canSeat && <p className="mt-0.5 text-[11px] text-ink-faint">Tap to select</p>}
      </button>

      {waiting && canSeat && (
        <button
          onClick={onDismiss}
          className="w-full border-t border-line py-2 text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-faint transition-colors hover:bg-state-late-bg hover:text-state-late"
        >
          Dismiss
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Dialogs
// ---------------------------------------------------------------------------

/**
 * Names the party on the way in, so the floor stops being a grid of numbers.
 *
 * It also offers to add these tables to a party that is already seated. That
 * choice only appears when there is something to join, so a quiet restaurant
 * sees exactly the form it always did.
 */
function SeatPartyDialog({ tables, sessions, busy, onCancel, onSeat }) {
  const [name, setName] = useState('')
  const [joinId, setJoinId] = useState(null)
  // Suggested once per dialog so it does not change under the staff member
  // while they are typing the party name.
  const [code, setCode] = useState(() => {
    try {
      return suggestAccessCode()
    } catch {
      return ''
    }
  })

  const open = sessions ?? []
  const joined = open.find((s) => s.session_id === joinId) ?? null
  const label = (s) =>
    s.party_name ??
    `Table${s.linked_tables?.length > 1 ? 's' : ''} ${(s.linked_tables ?? []).join(' + ')}`

  return (
    <Sheet
      title={`Seat table${tables.length > 1 ? 's' : ''} ${tables.join(' + ')}`}
      onClose={onCancel}
      width="max-w-sm"
      footer={
        <Button
          full
          size="xl"
          disabled={busy || (!joinId && code.trim().length < 2)}
          onClick={() => onSeat(name, joinId, code)}
        >
          {busy ? 'Seating…' : joined ? `Add to ${label(joined)}` : 'Seat guests'}
        </Button>
      }
    >
      {open.length > 0 && (
        <div className="mb-5">
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
            Seat as
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setJoinId(null)}
              className={`flex-1 rounded-control border py-2.5 text-[13px] font-semibold transition-colors ${
                joinId === null
                  ? 'border-accent bg-accent-wash text-ink'
                  : 'border-line-strong bg-surface text-ink-faint'
              }`}
            >
              New party
            </button>
            <button
              type="button"
              onClick={() => setJoinId(open[0].session_id)}
              className={`flex-1 rounded-control border py-2.5 text-[13px] font-semibold transition-colors ${
                joinId !== null
                  ? 'border-accent bg-accent-wash text-ink'
                  : 'border-line-strong bg-surface text-ink-faint'
              }`}
            >
              Join a table
            </button>
          </div>
        </div>
      )}

      {joinId === null ? (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            onSeat(name, null)
          }}
        >
          <Field
            label="Party name"
            hint="Optional — but it is how everyone will refer to this table"
          >
            <input
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="John"
              className={inputClass}
            />
          </Field>

          <div className="mt-4">
            <Field
              label="Table code"
              hint="Read this out to the table — it opens their menu straight away"
            >
              <input
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.replace(/\D/g, '').slice(0, 3))
                }
                inputMode="numeric"
                className={`${inputClass} tabular text-center text-[22px] font-bold tracking-[0.25em]`}
              />
            </Field>
          </div>
        </form>
      ) : (
        <div>
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
            Which party?
          </p>
          <ul className="space-y-2">
            {open.map((session) => {
              const active = session.session_id === joinId
              return (
                <li key={session.session_id}>
                  <button
                    type="button"
                    onClick={() => setJoinId(session.session_id)}
                    className={`w-full rounded-control border px-3.5 py-3 text-left transition-colors ${
                      active
                        ? 'border-accent bg-accent-wash'
                        : 'border-line bg-surface hover:border-line-strong'
                    }`}
                  >
                    <span className="block text-[15px] font-semibold">{label(session)}</span>
                    <span className="tabular mt-0.5 block text-[12px] text-ink-faint">
                      {session.covers} covers &middot; {minutesSince(session.created_at)} min
                      {session.opened_by && ` · ${session.opened_by.name}`}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {joined ? (
        <p className="mt-4 rounded-control border border-line bg-sunken px-3.5 py-3 text-[13px] leading-relaxed text-ink-soft">
          Table{tables.length > 1 ? 's' : ''} {tables.join(', ')} will join{' '}
          <strong className="text-ink">{label(joined)}</strong>. Anything already ordered
          stays on the same bill.
        </p>
      ) : (
        tables.length > 1 && (
          <p className="mt-4 rounded-control border border-line bg-sunken px-3.5 py-3 text-[13px] text-ink-soft">
            Tables {tables.join(', ')} will share one bill.
          </p>
        )
      )}
    </Sheet>
  )
}

/** Who is on this table, and the one action that matters: hand it back. */
function TableDialog({
  table,
  session,
  sessions,
  canClear,
  canLink,
  busy,
  onClose,
  onRelease,
  onMerge,
}) {
  const [confirming, setConfirming] = useState(false)
  const [merging, setMerging] = useState(false)
  const party = table.party_name ?? session?.party_name ?? null
  const server = table.served_by ?? session?.opened_by?.name ?? null
  const clearing = table.status === 'needs_clearing'
  const others = (session?.linked_tables ?? []).filter((n) => n !== table.table_number)
  const mergeable = (sessions ?? []).filter(
    (s) => s.session_id !== session?.session_id && s.status === 'active'
  )

  return (
    <Sheet title={`Table ${table.table_number}`} onClose={onClose} width="max-w-sm">
      <div className="space-y-4">
        <div>
          <p className="font-display text-[32px] leading-none">{party ?? 'No name given'}</p>
          <p className="mt-2 text-[13px] text-ink-soft">
            {clearing ? 'Bill settled — needs clearing' : 'Currently seated'}
            {server && ` · seated by ${server}`}
          </p>
        </div>

        <dl className="divide-y divide-line rounded-card border border-line bg-sunken px-4">
          {session?.access_code && (
            <Row label="Table code" value={String(session.access_code)} />
          )}
          <Row label="Seats" value={String(table.seats)} />
          {session && <Row label="Covers" value={String(session.covers)} />}
          {session && <Row label="Here for" value={`${minutesSince(session.created_at)} min`} />}
          {others.length > 0 && <Row label="Shares a bill with" value={others.join(', ')} />}
        </dl>

        {/* Merging two live parties: offered only when there is another open
            tab to merge with, and only to someone who may combine tables. */}
        {canLink && session && others.length === 0 && mergeable.length > 0 && (
          merging ? (
            <div className="rise space-y-3">
              <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
                Merge onto this bill
              </p>
              <ul className="space-y-2">
                {mergeable.map((other) => (
                  <li key={other.session_id}>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onMerge(session.session_id, other.session_id)}
                      className="w-full rounded-control border border-line bg-surface px-3.5 py-3 text-left transition-colors hover:border-accent disabled:opacity-50"
                    >
                      <span className="block text-[15px] font-semibold">
                        {other.party_name ?? `Table ${(other.linked_tables ?? []).join(' + ')}`}
                      </span>
                      <span className="tabular mt-0.5 block text-[12px] text-ink-faint">
                        Table{other.linked_tables?.length > 1 ? 's' : ''}{' '}
                        {(other.linked_tables ?? []).join(', ')} &middot; {other.covers} covers
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="text-[12px] leading-relaxed text-ink-faint">
                Everything they have already ordered moves onto{' '}
                {party ? <strong className="text-ink">{party}</strong> : 'this'}&rsquo;s bill.
              </p>
              <Button variant="quiet" size="lg" full onClick={() => setMerging(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button variant="secondary" size="lg" full onClick={() => setMerging(true)}>
              Merge another party onto this bill
            </Button>
          )
        )}

        {!canClear ? (
          <p className="rounded-control border border-line bg-sunken px-3.5 py-3 text-center text-[13px] text-ink-faint">
            Freeing a table is not part of your role.
          </p>
        ) : confirming ? (
          <div className="rise space-y-3">
            <p className="text-[14px] leading-relaxed text-ink-soft">
              {party ? <strong className="text-ink">{party}</strong> : 'This party'} has left, and
              table {table.table_number} is wiped down?
              {others.length > 0 && (
                <>
                  {' '}
                  Table{others.length > 1 ? 's' : ''} {others.join(', ')} will move to clearing.
                </>
              )}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="quiet" size="lg" onClick={() => setConfirming(false)}>
                Not yet
              </Button>
              <Button
                variant="confirm"
                size="lg"
                full
                disabled={busy}
                onClick={() => onRelease(table)}
              >
                {busy ? 'Freeing…' : 'Yes, table is free'}
              </Button>
            </div>
          </div>
        ) : (
          <Button full size="xl" variant="confirm" onClick={() => setConfirming(true)}>
            Table is free
          </Button>
        )}
      </div>
    </Sheet>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-baseline justify-between py-2.5 text-[14px]">
      <dt className="text-ink-faint">{label}</dt>
      <dd className="tabular font-semibold">{value}</dd>
    </div>
  )
}


/**
 * The hand-over card.
 *
 * Shown immediately after seating, with the code set large enough to read
 * across a table in low light. It is the one thing the staff member must
 * carry from their screen to the guest, so it gets a screen of its own rather
 * than a toast that disappears while they are still walking over.
 */
function CodeHandoverCard({ code, tables, partyName, onClose }) {
  return (
    <Sheet title="Tell the table" onClose={onClose} width="max-w-sm">
      <div className="text-center">
        <p className="text-[14px] text-ink-soft">
          {partyName ? (
            <>
              <strong className="text-ink">{partyName}</strong> seated at table
            </>
          ) : (
            'Seated at table'
          )}
          {tables.length > 1 ? 's' : ''} {tables.join(' + ')}
        </p>

        <p className="tabular my-6 text-[88px] font-bold leading-none tracking-[-0.03em] text-accent">
          {code}
        </p>

        <p className="mx-auto max-w-[17rem] text-[14px] leading-relaxed text-ink-soft">
          Ask them to go to the menu page and enter <strong className="text-ink">{code}</strong>.
          Their menu opens straight away — no waiting for approval.
        </p>
      </div>

      <Button full size="xl" className="mt-7" onClick={onClose}>
        Done
      </Button>
    </Sheet>
  )
}
