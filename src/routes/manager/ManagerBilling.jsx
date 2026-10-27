import { useEffect, useState } from 'react'
import { closeSession, fetchOrdersForSession } from '../../data'
import { useSessions } from '../../hooks/useSessions'
import { Can } from '../../auth/Guard'
import { useTicker } from '../../hooks/useTicker'
import { formatMoney, formatTime, minutesSince, orderTotal } from '../../lib/format'
import {
  Banner,
  Button,
  Card,
  Empty,
  SectionTitle,
  Spinner,
  Status,
} from '../../components/ui'

/**
 * Billing.
 *
 * Closing a tab frees tables and is awkward to undo, so it is a two-step
 * action: the button arms a confirm state that names exactly which tables are
 * about to be released. Destructive-by-accident is the failure mode here, not
 * slow.
 */
export default function ManagerBilling() {
  const { sessions, loading } = useSessions()
  const [active, setActive] = useState(null)
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [closing, setClosing] = useState(false)
  const [error, setError] = useState(null)
  useTicker(30000)

  // Keep the open bill in step with the live session list; if the tab was
  // closed elsewhere it must not linger here.
  useEffect(() => {
    if (!active) return
    const still = sessions.find((s) => s.session_id === active.session_id)
    if (!still) {
      setActive(null)
      setOrders([])
    }
  }, [sessions, active])

  const open = async (session) => {
    setActive(session)
    setConfirming(false)
    setLoadingOrders(true)
    setError(null)
    try {
      const rows = await fetchOrdersForSession(session.session_id)
      rows.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      setOrders(rows)
    } catch (err) {
      setError(err)
    } finally {
      setLoadingOrders(false)
    }
  }

  const close = async () => {
    if (!active) return
    setClosing(true)
    try {
      await closeSession(active.session_id, active.linked_tables)
      setActive(null)
      setOrders([])
      setConfirming(false)
    } catch (err) {
      setError(err)
    } finally {
      setClosing(false)
    }
  }

  const grand = orders.reduce((sum, order) => sum + orderTotal(order), 0)

  /**
   * One row per person when the party chose to pay separately.
   *
   * Anything ordered on the table's own code has no payer, so it collects
   * under "the table" rather than being quietly assigned to whoever is
   * first in the list — a split bill that guesses is worse than one that
   * admits what it does not know.
   */
  const split = (() => {
    const tabs = active?.tabs ?? []
    if (!tabs.length) return null

    const byCode = new Map(tabs.map((t) => [String(t.code), { ...t, total: 0, count: 0 }]))
    let shared = 0
    let sharedCount = 0

    for (const order of orders) {
      const row = order.tab_code ? byCode.get(String(order.tab_code)) : null
      if (row) {
        row.total += orderTotal(order)
        row.count += 1
      } else {
        shared += orderTotal(order)
        sharedCount += 1
      }
    }
    return { rows: [...byCode.values()], shared, sharedCount }
  })()
  const label = (s) => (s?.linked_tables ?? []).join(' + ')

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,320px)_1fr] lg:gap-7">
      <section>
        <SectionTitle hint={`${sessions.length} open`}>Tabs</SectionTitle>

        {loading ? (
          <Spinner label="Loading tabs" />
        ) : sessions.length === 0 ? (
          <Empty title="No open tabs" hint="Seat a table on the Floor tab." />
        ) : (
          <ul className="space-y-2.5">
            {sessions.map((session) => {
              const isActive = active?.session_id === session.session_id
              return (
                <li key={session.session_id}>
                  <button
                    onClick={() => open(session)}
                    className={`w-full rounded-card border p-4 text-left transition-all ${
                      isActive
                        ? 'border-accent bg-accent-wash shadow-raise'
                        : 'border-line bg-surface hover:border-line-strong'
                    }`}
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="text-[15px] font-semibold">
                        Table{session.linked_tables?.length > 1 ? 's' : ''} {label(session)}
                      </span>
                      <Status value="active" />
                    </div>
                    <p className="tabular mt-1.5 text-[12px] text-ink-faint">
                      {session.covers} covers &middot; {minutesSince(session.created_at)} min
                      {session.opened_by && (
                        <>
                          {' '}&middot;{' '}
                          <span className="font-semibold text-ink-soft">
                            {session.opened_by.name}
                          </span>
                        </>
                      )}
                    </p>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section>
        {error && (
          <div className="mb-4">
            <Banner tone="bad" onDismiss={() => setError(null)}>
              {error}
            </Banner>
          </div>
        )}

        {!active ? (
          <Empty
            icon="🧾"
            title="No tab selected"
            hint="Choose an open tab to see its bill and settle it."
          />
        ) : loadingOrders ? (
          <Spinner label="Totalling" />
        ) : (
          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-4 sm:px-6 sm:py-5">
              <div>
                <h2 className="font-display text-[26px] leading-none">
                  Table{active.linked_tables?.length > 1 ? 's' : ''} {label(active)}
                </h2>
                <p className="mt-1.5 text-[13px] text-ink-faint">
                  {active.covers} covers &middot; opened {formatTime(active.created_at)}
                  {active.opened_by && (
                    <> by <span className="font-semibold text-ink-soft">{active.opened_by.name}</span></>
                  )}{' '}
                  &middot; {orders.length} order{orders.length === 1 ? '' : 's'}
                </p>
              </div>
              <span className="tabular font-display text-[30px] leading-none">
                {formatMoney(grand)}
              </span>
            </div>

            {orders.length === 0 ? (
              <p className="px-6 py-14 text-center text-[14px] text-ink-faint">
                Nothing ordered on this tab yet.
              </p>
            ) : (
              <div className="divide-y divide-line">
                {orders.map((order) => (
                  <div key={order.id} className="px-4 py-4 sm:px-6">
                    <div className="mb-2.5 flex items-center justify-between">
                      <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
                        Table {order.ordered_by_table} &middot; {formatTime(order.created_at)}
                        {order.tab_code && (
                          <>
                            {' '}&middot;{' '}
                            <span className="text-accent">
                              {(active?.tabs ?? []).find(
                                (t) => String(t.code) === String(order.tab_code)
                              )?.label ?? `Code ${order.tab_code}`}
                            </span>
                          </>
                        )}
                      </span>
                      <Status value={order.status} />
                    </div>
                    <ul className="space-y-1.5">
                      {(order.items ?? []).map((line, index) => (
                        <li key={index} className="flex items-baseline justify-between text-[14px]">
                          <span className="text-ink-soft">
                            <span className="tabular mr-2 font-semibold text-ink">
                              {line.qty}&times;
                            </span>
                            {line.name}
                          </span>
                          <span className="tabular">{formatMoney(line.price * line.qty)}</span>
                        </li>
                      ))}
                    </ul>

                    {order.note && (
                      <p className="mt-2 whitespace-pre-wrap border-l-2 border-accent/40 pl-3 text-[12px] italic leading-relaxed text-ink-faint">
                        {order.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {split && (
              <div className="border-t border-line px-4 py-4 sm:px-6 sm:py-5">
                <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
                  Paying separately
                </p>
                <div className="space-y-1">
                  {split.rows.map((row) => (
                    <Row
                      key={row.code}
                      label={`${row.label} · code ${row.code}`}
                      value={formatMoney(row.total)}
                    />
                  ))}
                  {split.sharedCount > 0 && (
                    <Row
                      label={`On the table code · ${split.sharedCount} order${
                        split.sharedCount === 1 ? '' : 's'
                      }`}
                      value={formatMoney(split.shared)}
                    />
                  )}
                </div>
              </div>
            )}

            <div className="border-t border-line bg-sunken px-4 py-4 sm:px-6 sm:py-5">
              <Row label="Total" value={formatMoney(grand)} strong />
            </div>

            <Can
              permission="billing.close"
              fallback={
                <p className="border-t border-line px-4 py-4 text-center text-[13px] text-ink-faint sm:px-6">
                  Settling a tab is not part of your role.
                </p>
              }
            >
            <div className="border-t border-line px-4 py-4 sm:px-6 sm:py-5">
              {confirming ? (
                <div className="rise space-y-3">
                  <p className="text-[14px] text-ink-soft">
                    Close this tab and release table
                    {active.linked_tables?.length > 1 ? 's' : ''}{' '}
                    <strong className="text-ink">{(active.linked_tables ?? []).join(', ')}</strong>?
                    The guest&rsquo;s screen will end their session.
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button variant="quiet" size="lg" onClick={() => setConfirming(false)}>
                      Cancel
                    </Button>
                    <Button variant="danger" size="lg" full disabled={closing} onClick={close}>
                      {closing ? 'Closing…' : 'Yes, close the tab'}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button full size="xl" onClick={() => setConfirming(true)}>
                  Settle &amp; close tab
                </Button>
              )}
            </div>
            </Can>
          </Card>
        )}
      </section>
    </div>
  )
}

function Row({ label, value, muted, strong }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className={strong ? 'font-semibold' : muted ? 'text-ink-faint' : 'text-ink-soft'}>
        {label}
      </span>
      <span className={`tabular ${strong ? 'text-[19px] font-semibold' : ''}`}>{value}</span>
    </div>
  )
}
