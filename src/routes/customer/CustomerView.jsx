import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { findSessionByCode, knockOnTable, submitOrder } from '../../data'
import { useTableStatus } from '../../hooks/useTables'
import { useMenu } from '../../hooks/useMenu'
import { useInventory } from '../../hooks/useInventory'
import { useMyOrders } from '../../hooks/useActiveOrders'
import { useCategories, useRestaurant } from '../../tenant/context'
import { formatMoney } from '../../lib/format'
import { Banner, Button, Sheet, Spinner, inputClass } from '../../components/ui'
import DishCard from './DishCard'
import CartSheet from './CartSheet'
import OrderTracker from './OrderTracker'
import WaitingRoom from './WaitingRoom'

/**
 * /customer/:tableId — the guest's phone, and the same page on a tablet.
 *
 * Responsive shape:
 *   phone   single column, sticky category rail, cart bar pinned to the bottom
 *   tablet  two columns of dishes, wider gutters
 *   desktop three columns, capped at a readable measure and centred
 *
 * On a long menu search is not a nicety — it is the
 * primary way anyone finds "samosa" without scrolling past six sections.
 */
export default function CustomerView() {
  const { tableId } = useParams()
  const navigate = useNavigate()
  const restaurant = useRestaurant()
  const categories = useCategories()

  // No table in the URL means nobody has been seated yet: the menu is open to
  // read, but nothing can be sent to the kitchen until a code is entered.
  const browsing = !tableId
  const { table, loading: tableLoading } = useTableStatus(tableId)
  const { menu, loading: menuLoading } = useMenu()
  const { soldOutItems, isSoldOut } = useInventory()

  const sessionId = table?.session_id ?? null
  const status = table?.status
  const { orders: myOrders } = useMyOrders(sessionId, tableId)

  // Which person on the table this device is ordering as, when the party
  // chose to pay separately. sessionStorage, not state: the redeem screen
  // navigates to /customer/:table, which remounts this component.
  const [tab, setTab] = useState(() => {
    try {
      const raw = sessionStorage.getItem('guest-tab-v1')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const [cart, setCart] = useState({})
  // One note for the whole order. Kept beside the cart so changing a
  // quantity never disturbs what the guest has typed.
  const [orderNote, setOrderNote] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [confirmation, setConfirmation] = useState(null)
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState(null)
  const [ordersOpen, setOrdersOpen] = useState(false)
  // Greets the guest the moment the menu opens, so the one thing standing
  // between them and ordering is stated up front rather than discovered when
  // they tap Add. Dismissible — reading the menu never requires a code.
  const [codeOpen, setCodeOpen] = useState(() => !tableId)

  const knocked = useRef(false)
  useEffect(() => {
    if (browsing || knocked.current) return
    knocked.current = true
    knockOnTable(tableId).catch(setError)
  }, [browsing, tableId])

  // Once a code lands the route gains a table, and the sheet that asked for
  // it has nothing left to ask — without this it stays open over the menu.
  useEffect(() => {
    if (!browsing) setCodeOpen(false)
  }, [browsing])

  const [wasSeated, setWasSeated] = useState(false)
  useEffect(() => {
    if (status === 'occupied') setWasSeated(true)
  }, [status])

  // A dish that sells out while sitting in a cart is removed from it.
  const soldOutKey = soldOutItems.join('|')
  useEffect(() => {
    if (!soldOutItems.length) return
    setCart((current) => {
      const next = {}
      let changed = false
      for (const [id, qty] of Object.entries(current)) {
        if (soldOutItems.includes(id)) changed = true
        else next[id] = qty
      }
      return changed ? next : current
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soldOutKey])

  const searching = query.trim().length > 0

  const results = useMemo(() => {
    if (!searching) return []
    const q = query.trim().toLowerCase()
    return menu.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        String(item.no) === q
    )
  }, [menu, query, searching])

  const grouped = useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, []]))
    for (const item of menu) {
      if (!map.has(item.category)) map.set(item.category, [])
      map.get(item.category).push(item)
    }
    return categories.map((c) => ({ ...c, items: map.get(c.id) ?? [] })).filter(
      (c) => c.items.length
    )
  }, [menu, categories])

  const lines = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => {
          const item = menu.find((m) => m.id === id)
          return item ? { ...item, qty } : null
        })
        .filter(Boolean),
    [cart, menu]
  )

  const total = lines.reduce((sum, l) => sum + l.price * l.qty, 0)
  const count = lines.reduce((sum, l) => sum + l.qty, 0)

  const setQty = (id, qty) => {
    // Reading the menu is free. Ordering is not — tapping Add asks for the
    // code rather than silently doing nothing, so the gate explains itself.
    if (browsing) return setCodeOpen(true)
    return setCart((c) => {
      if (qty <= 0) {
        const { [id]: _drop, ...rest } = c
        return rest
      }
      return { ...c, [id]: qty }
    })
  }

  const setNote = (text) => setOrderNote(String(text ?? '').slice(0, 500))

  /**
   * Adding a dish from the menu opens the order.
   *
   * A guest who has just tapped Add wants to know it landed and what it has
   * cost them so far, and they are one tap from sending it. The sheet
   * answers both without them going looking for the cart bar. Reducing a
   * quantity does not open it — that is a correction, not a decision point.
   */
  const addFromMenu = (id, qty) => {
    if (browsing) return setCodeOpen(true)
    const before = cart[id] ?? 0
    setQty(id, qty)
    if (qty > before) setCartOpen(true)
  }

  const jumpTo = (id) => {
    setActiveCategory(id)
    document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      await submitOrder({
        sessionId,
        tableNumber: tableId,
        items: lines,
        note: orderNote,
        // Null unless this device redeemed a personal code, in which case
        // the order lands on that person's bill rather than the table's.
        tabCode: tab?.table === Number(tableId) ? tab.code : null,
      })
      setCart({})
      setOrderNote('')
      setCartOpen(false)
      setConfirmation({ count, total })
      setTimeout(() => setConfirmation(null), 5000)
    } catch (err) {
      setError(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (!browsing && tableLoading) {
    return (
      <div className="grid min-h-full place-items-center">
        <Spinner label="Finding your table" />
      </div>
    )
  }

  if (!browsing && !table) {
    return (
      <div className="grid min-h-full place-items-center px-8 text-center">
        <div>
          <p className="font-display text-5xl">Hm.</p>
          <h1 className="mt-3 text-lg font-semibold">We can&rsquo;t find table {tableId}</h1>
          <p className="mt-1 text-[14px] text-ink-faint">
            That QR code isn&rsquo;t registered. Please ask a member of staff.
          </p>
        </div>
      </div>
    )
  }

  if (!browsing && status !== 'occupied') {
    return <WaitingRoom tableId={tableId} status={status} wasSeated={wasSeated} />
  }

  return (
    <div className="min-h-full pb-10">
      <Hero
        restaurant={restaurant}
        table={table}
        browsing={browsing}
        placedCount={myOrders.length}
        onViewOrders={() => setOrdersOpen(true)}
      />

      {/* Sticky nav: search always reachable, categories scroll horizontally. */}
      <div className="sticky top-0 z-30 border-b border-line bg-canvas/95 backdrop-blur-lg">
        <div className="mx-auto max-w-6xl px-4 pt-2.5 sm:px-6">
          <div className="flex items-center gap-2.5">
          <div className="relative min-w-0 flex-1">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint">
              ⌕
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${menu.length} dishes, or type a number`}
              aria-label="Search the menu"
              className="h-11 w-full rounded-control border border-line bg-surface pl-9 pr-9 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-accent"
            />
            {searching && (
              <button
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full bg-raised text-ink-soft"
              >
                &times;
              </button>
            )}
          </div>

          {/* The running order sits beside the search rather than across the
              bottom of the screen: a bar pinned over the menu covered the very
              dishes the guest was still choosing between. */}
          {count > 0 && (
            <button
              onClick={() => setCartOpen(true)}
              className="rise flex h-11 shrink-0 items-center gap-2.5 rounded-control bg-accent px-3.5 text-white shadow-float transition-transform active:scale-95"
            >
              <span className="tabular grid size-6 place-items-center rounded-full bg-white/25 text-[12px] font-bold">
                {count}
              </span>
              <span className="tabular text-[15px] font-bold">{formatMoney(total)}</span>
            </button>
          )}
          </div>
        </div>

        {!searching && (
          <div className="mx-auto max-w-6xl">
            <div className="rail flex gap-1.5 overflow-x-auto px-4 py-2.5 sm:px-6">
              {grouped.map((category) => (
                <button
                  key={category.id}
                  onClick={() => jumpTo(category.id)}
                  className={`shrink-0 rounded-pill px-3.5 py-2 text-[13px] font-semibold transition-colors ${
                    activeCategory === category.id
                      ? 'bg-accent text-white'
                      : 'bg-raised text-ink-soft hover:text-ink'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {error && (
          <div className="pt-4">
            <Banner tone="bad" onDismiss={() => setError(null)}>
              {error}
            </Banner>
          </div>
        )}

        {menuLoading ? (
          <div className="py-16">
            <Spinner label="Loading the menu" />
          </div>
        ) : searching ? (
          <section className="pt-6">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.07em] text-ink-faint">
              {results.length} result{results.length === 1 ? '' : 's'} for &ldquo;{query}&rdquo;
            </h2>
            {results.length === 0 ? (
              <p className="py-14 text-center text-[14px] text-ink-faint">
                Nothing matches. Try a shorter word.
              </p>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {results.map((item) => (
                  <DishCard
                    key={item.id}
                    item={item}
                    qty={cart[item.id] ?? 0}
                    soldOut={isSoldOut(item.id)}
                    onSetQty={(qty) => addFromMenu(item.id, qty)}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          grouped.map((category) => (
            <section key={category.id} id={`cat-${category.id}`} className="scroll-mt-32 pt-8">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-display text-[26px] leading-none tracking-[-0.01em] sm:text-[30px]">
                  {category.label}
                </h2>
                <span className="tabular text-[12px] text-ink-faint">
                  {category.items.length}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {category.items.map((item) => (
                  <DishCard
                    key={item.id}
                    item={item}
                    qty={cart[item.id] ?? 0}
                    soldOut={isSoldOut(item.id)}
                    onSetQty={(qty) => addFromMenu(item.id, qty)}
                  />
                ))}
              </div>
            </section>
          ))
        )}

        <Legend />
      </div>

      {confirmation && (
        <div className="pb-safe fixed inset-x-0 bottom-0 z-40 px-4">
          <div className="rise mx-auto flex max-w-lg items-center gap-3 rounded-card border border-state-ready/30 bg-state-ready-bg px-4 py-3.5 shadow-float">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-state-ready text-canvas">
              ✓
            </span>
            <div className="text-[13px] leading-tight">
              <p className="font-semibold text-state-ready">Sent to the kitchen</p>
              <p className="text-state-ready/80">
                {confirmation.count} items &middot; {formatMoney(confirmation.total)}
              </p>
            </div>
          </div>
        </div>
      )}

      {browsing && (
        <div className="pb-safe fixed inset-x-0 bottom-0 z-40 px-4">
          <button
            onClick={() => setCodeOpen(true)}
            className="rise mx-auto flex w-full max-w-lg items-center justify-center gap-2.5 rounded-card bg-accent px-5 py-4 text-white shadow-float transition-transform active:scale-[0.99]"
          >
            <span className="text-[15px] font-semibold">Enter your code to order</span>
          </button>
        </div>
      )}

      {codeOpen && (
        <CodeSheet
          onClose={() => setCodeOpen(false)}
          onFound={(match) => {
            const next = match.tab_code
              ? { code: match.tab_code, label: match.tab_label, table: match.table_number }
              : null
            setTab(next)
            try {
              if (next) sessionStorage.setItem('guest-tab-v1', JSON.stringify(next))
              else sessionStorage.removeItem('guest-tab-v1')
            } catch {
              /* private mode — they just lose the split on a refresh */
            }
            navigate(`/customer/${match.table_number}`)
          }}
        />
      )}



      {ordersOpen && (
        <Sheet title="Ordered" width="max-w-md" onClose={() => setOrdersOpen(false)}>
          {myOrders.length === 0 ? (
            <p className="py-12 text-center text-[14px] text-ink-faint">
              Nothing sent to the kitchen yet.
            </p>
          ) : (
            <OrderTracker orders={myOrders} />
          )}
        </Sheet>
      )}

      {cartOpen && (
        <CartSheet
          payerLabel={tab?.table === Number(tableId) ? tab.label : null}
          partyName={table?.party_name ?? null}
          tableNumber={table?.table_number ?? null}
          lines={lines}
          total={total}
          note={orderNote}
          submitting={submitting}
          onSetQty={setQty}
          onSetNote={setNote}
          onClose={() => setCartOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}

function Hero({ restaurant, table, browsing, placedCount, onViewOrders }) {
  return (
    <header className="wash border-b border-line">
      <div className="mx-auto flex max-w-6xl items-end justify-between gap-4 px-4 py-7 sm:px-6 sm:py-9">
        <div>
          <h1 className="font-display text-[38px] leading-none sm:text-[46px]">
            {restaurant.name}
          </h1>
          <p className="mt-1.5 text-[13px] uppercase tracking-[0.12em] text-ink-faint">
            {restaurant.tagline}
          </p>
        </div>
        {/* Deliberately NOT called "view order" — the bottom bar already owns
            that phrase for the unsent basket. This one is about food already
            with the kitchen, so it is named for the question it answers. */}
        <div className="flex shrink-0 items-center gap-2">
          {onViewOrders && placedCount > 0 && (
            <button
              onClick={onViewOrders}
              className="flex items-center gap-2 rounded-pill bg-state-fire px-4 py-2.5 text-[14px] font-bold text-canvas shadow-float transition-all hover:brightness-110 active:scale-[0.97]"
            >
              <span className="ring-live size-2 rounded-full bg-canvas/70" />
              Ordered
              <span className="tabular rounded-full bg-canvas/25 px-1.5 text-[12px] font-bold">
                {placedCount}
              </span>
            </button>
          )}
          {!browsing && (
            <span className="rounded-pill border border-line-strong bg-surface px-3 py-1.5 text-[12px] font-semibold text-ink-soft">
              Table {table.table_number}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}

/** Allergen key. A menu that uses symbols has to explain them somewhere. */
function Legend() {
  return (
    <footer className="mt-12 border-t border-line py-7 text-[12px] text-ink-faint">
      <p className="mb-3 font-semibold uppercase tracking-[0.07em]">Key</p>
      <ul className="flex flex-wrap gap-x-6 gap-y-2">
        <li>◻ with dot — vegetarian</li>
        <li>◻ with ring — vegan</li>
        <li>Ⓝ — contains nuts</li>
        <li>Weekend — available Saturday &amp; Sunday</li>
      </ul>
      <p className="mt-4 leading-relaxed">
        Please tell your server about any allergies before ordering.
      </p>
    </footer>
  )
}


/**
 * The gate between reading and ordering.
 *
 * A guest can browse the whole menu before anyone reaches them — deciding what
 * they want is the part that takes time, and making them wait for a server
 * before they can even look is the thing this flow exists to remove. The code
 * only appears once a member of staff has actually acknowledged the table, so
 * it is the acknowledgement, not a password.
 */
function CodeSheet({ onClose, onFound }) {
  const [code, setCode] = useState('')
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState(null)
  const [found, setFound] = useState(null)

  /**
   * The code is checked as it is typed, so the moment it is right the guest
   * sees whose table they are joining and goes straight through. A correct
   * code should not then need a button press to confirm what it already is.
   */
  useEffect(() => {
    const entered = code.trim()
    if (entered.length < 2) {
      setFound(null)
      return
    }

    let cancelled = false
    setChecking(true)

    findSessionByCode(entered)
      .then((match) => {
        if (cancelled) return
        if (match?.table_number) {
          setFound(match)
          setError(null)
          // A breath so the name registers before the menu replaces it.
          setTimeout(() => {
            if (!cancelled) onFound(match)
          }, 650)
        } else {
          setFound(null)
        }
      })
      .catch((err) => !cancelled && setError(err))
      .finally(() => !cancelled && setChecking(false))

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  const submit = async (event) => {
    event?.preventDefault()
    const entered = code.trim()
    if (entered.length < 2) return

    if (found?.table_number) return onFound(found)

    setError(`Code ${entered} is not open yet. Ask your server for the number.`)
    setCode('')
  }

  return (
    <Sheet title={found ? `${found.party_name ?? 'Your table'} · Table No ${found.table_number}` : 'Your table code'} width="max-w-sm" onClose={onClose}>
      <form onSubmit={submit}>
        <p className="text-[15px] font-medium leading-relaxed text-ink">
          Please key in your code — or ask your waiter for the code number.
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-faint">
          You can browse the whole menu without one. The code is only needed to
          send an order to the kitchen.
        </p>

        <input
          autoFocus
          value={code}
          onChange={(event) => {
            setError(null)
            setCode(event.target.value.replace(/\D/g, '').slice(0, 3))
          }}
          inputMode="numeric"
          autoComplete="off"
          aria-label="Table code"
          // Dashes, not a sample number. At this size a grey "65" reads as a
          // value that is already filled in, and the guest types nothing.
          placeholder="– –"
          className={`${inputClass} tabular mt-5 h-16 text-center text-[30px] font-bold tracking-[0.3em] placeholder:font-normal placeholder:tracking-[0.2em] placeholder:text-ink-faint/50`}
        />

        {found && (
          <p className="rise mt-3 rounded-control border border-state-ready/35 bg-state-ready-bg px-4 py-3 text-center">
            <span className="block text-[17px] font-bold text-state-ready">
              {found.party_name ?? 'Your table'}
            </span>
            <span className="tabular mt-0.5 block text-[13px] text-state-ready/80">
              Table No {found.table_number} &middot; opening your menu…
            </span>
          </p>
        )}

        <Button
          full
          size="xl"
          className="mt-3"
          disabled={checking || code.trim().length < 2}
          onClick={submit}
        >
          {checking ? 'Checking…' : found ? 'Start ordering' : 'Check code'}
        </Button>

        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full py-2 text-center text-[13px] font-medium text-ink-faint transition-colors hover:text-ink"
        >
          You can still browse the menu without a code
        </button>

        {error && (
          <div className="mt-4">
            <Banner tone="bad" onDismiss={() => setError(null)}>
              {error}
            </Banner>
          </div>
        )}
      </form>
    </Sheet>
  )
}
