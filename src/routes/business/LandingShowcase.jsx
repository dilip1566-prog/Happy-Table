import { useLayoutEffect, useRef } from 'react'
import { DietMark, NutsMark } from '../../components/ui'

/**
 * The marketing page's pictures.
 *
 * Drawn in the product's own components and tokens rather than photographed
 * or faked in an illustration tool, for two reasons. The honest one: what a
 * prospective customer sees here is exactly what they get, down to the
 * colour of a late ticket. The practical one: there is no photography, and a
 * stock-image kitchen above a claim about software persuades nobody.
 *
 * Everything below is static markup. No data, no hooks, no timers — a
 * marketing page that polls is a marketing page that drains a phone.
 */

/* -------------------------------------------------------------------------- */
/* Scroll reveal                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Fade sections in as they arrive.
 *
 * Two decisions here, both learned the hard way.
 *
 * The hiding class is added by this hook and never by the markup. If it sat
 * in the JSX and the reveal failed for any reason — JavaScript blocked, an
 * effect that threw — the page would be permanently blank rather than
 * merely unanimated. Hide only once you are certain you can also unhide.
 *
 * And this does NOT use IntersectionObserver, which is the obvious tool and
 * the wrong one. The observer coalesces entries: scroll quickly and an
 * element can enter and leave the viewport between two delivery frames, so
 * the callback never sees it intersecting and the section stays invisible
 * for the rest of the visit. Flicking down a marketing page on a phone is
 * exactly that scroll. Tested at 500px steps and eighteen of twenty-five
 * sections never appeared.
 *
 * A position check on scroll cannot miss, because it asks where things are
 * now rather than waiting to be told they moved. One rAF-coalesced pass
 * over a couple of dozen elements costs nothing, and the listener removes
 * itself once everything has been shown.
 */
const pending = new Set()
let queued = false
let listening = false

/** Reveal anything at or above the fold, then stop listening when done. */
function sweep() {
  queued = false
  const limit = window.innerHeight * 0.92

  for (const element of [...pending]) {
    if (element.getBoundingClientRect().top < limit) {
      element.classList.add('is-in')
      pending.delete(element)
    }
  }

  if (!pending.size) stopListening()
}

/**
 * rAF for the common case, a timer as the safety net.
 *
 * Browsers pause requestAnimationFrame for pages that are not being painted,
 * so a page opened in a background tab — a middle-click, "open in new tab",
 * a restored session — would queue a frame that never arrives and stay
 * blank until something else happened to schedule one. setTimeout is
 * throttled in the background but it does still fire. Whichever runs first
 * clears `queued` and the other finds nothing to do.
 */
function schedule() {
  if (queued) return
  queued = true
  requestAnimationFrame(sweep)
  setTimeout(() => {
    if (queued) sweep()
  }, 120)
}

function startListening() {
  if (listening) return
  listening = true
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule, { passive: true })
  // Catch up the moment the tab is looked at, rather than waiting for a
  // throttled timer to come round in a tab nobody is watching.
  document.addEventListener('visibilitychange', schedule)
}

function stopListening() {
  if (!listening) return
  listening = false
  window.removeEventListener('scroll', schedule)
  window.removeEventListener('resize', schedule)
  document.removeEventListener('visibilitychange', schedule)
}

/**
 * useLayoutEffect rather than useEffect so the class lands before paint and
 * the section does not flash in and then straight back out.
 */
export function useReveal(delay = 0) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    element.style.transitionDelay = delay ? `${delay}ms` : ''
    element.classList.add('reveal')

    pending.add(element)
    startListening()
    schedule() // whatever is already on screen comes in at once

    return () => {
      pending.delete(element)
      if (!pending.size) stopListening()
    }
  }, [delay])

  return ref
}

/** A section that fades up when it is reached. */
export function Reveal({ as: Tag = 'div', delay, className, children, ...rest }) {
  const ref = useReveal(delay)
  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  )
}

/* -------------------------------------------------------------------------- */
/* The guest's phone                                                          */
/* -------------------------------------------------------------------------- */

const DISHES = [
  { no: 4, name: 'Punjabi Samosas (2)', price: '4.25', diet: 'vegan', nuts: true },
  { no: 12, name: 'Paneer Tikka', price: '6.50', diet: 'veg', nuts: false },
  { no: 31, name: 'Lamb Rogan Josh', price: '13.95', diet: 'non-veg', nuts: false },
]

export function PhoneMock({ className = '' }) {
  return (
    <div
      aria-hidden
      className={`relative w-[232px] shrink-0 rounded-[30px] border border-line-strong bg-canvas p-2 shadow-float ${className}`}
    >
      {/* The notch. Three pixels of pretending, and the thing that makes the
          rest of the rectangle read as a phone at a glance. */}
      <div className="absolute left-1/2 top-[9px] z-10 h-[5px] w-16 -translate-x-1/2 rounded-full bg-sunken" />

      <div className="overflow-hidden rounded-[23px] bg-canvas pt-5">
        <div className="px-3.5 pb-2.5">
          <p className="font-display text-[19px] leading-none">Bobby&rsquo;s</p>
          <p className="mt-1 text-[8.5px] uppercase tracking-[0.14em] text-ink-faint">
            Table 7 &middot; Code 64
          </p>
        </div>

        <div className="flex gap-1.5 px-3.5 pb-2.5">
          {['All', 'Deli', 'Thali', 'Breads'].map((chip, index) => (
            <span
              key={chip}
              className={`rounded-pill px-2 py-[3px] text-[8.5px] font-semibold ${
                index === 0
                  ? 'bg-accent text-white'
                  : 'border border-line bg-surface text-ink-faint'
              }`}
            >
              {chip}
            </span>
          ))}
        </div>

        <div className="space-y-1.5 px-3.5">
          {DISHES.map((dish) => (
            <div
              key={dish.no}
              className="flex items-center gap-2 rounded-[10px] border border-line bg-surface p-2"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-[7px] bg-raised font-display text-[12px] text-ink-faint">
                {dish.no}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1">
                  <DietMark diet={dish.diet} size={8} />
                  {dish.nuts && <NutsMark size={8} />}
                  <span className="truncate text-[9.5px] font-semibold">{dish.name}</span>
                </span>
                <span className="tabular mt-[1px] block text-[9px] text-ink-faint">
                  &pound;{dish.price}
                </span>
              </span>
              <span className="shrink-0 rounded-[6px] bg-raised px-2 py-1 text-[8.5px] font-bold text-ink-soft">
                Add
              </span>
            </div>
          ))}
        </div>

        <div className="mt-2.5 flex items-center justify-between border-t border-line bg-surface px-3.5 py-2.5">
          <span className="tabular text-[9px] text-ink-faint">3 items &middot; &pound;24.70</span>
          <span className="rounded-[7px] bg-accent px-2.5 py-1.5 text-[9px] font-bold text-white">
            View order
          </span>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* The floor                                                                  */
/* -------------------------------------------------------------------------- */

const TABLES = [
  { n: 1, state: 'free' },
  { n: 2, state: 'free' },
  { n: 3, state: 'busy', who: 'Shayan' },
  { n: 4, state: 'busy', who: 'Shayan' },
  { n: 5, state: 'waiting' },
  { n: 6, state: 'free' },
  { n: 7, state: 'busy', who: 'Patel' },
  { n: 8, state: 'clear' },
  { n: 9, state: 'free' },
  { n: 10, state: 'busy', who: 'Khan' },
  { n: 11, state: 'free' },
  { n: 12, state: 'free' },
]

const TABLE_TONE = {
  free: 'border-line bg-surface text-ink-faint',
  busy: 'border-state-fire/35 bg-state-fire-bg text-state-fire',
  waiting: 'border-state-new/40 bg-state-new-bg text-state-new ring-live',
  clear: 'border-state-clear/35 bg-state-clear-bg text-state-clear',
}

export function FloorMock({ className = '' }) {
  return (
    <div
      aria-hidden
      className={`w-full overflow-hidden rounded-[16px] border border-line-strong bg-canvas shadow-float ${className}`}
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div>
          <p className="text-[13px] font-semibold leading-none">Dining room</p>
          <p className="mt-1 text-[10px] text-ink-faint">
            7 of 12 free &middot; select several to combine
          </p>
        </div>
        <div className="flex gap-1.5">
          <Pill label="Waiting" value="1" tone="text-state-new" />
          <Pill label="Seated" value="4" tone="text-state-fire" />
          <Pill label="To clear" value="1" tone="text-state-clear" />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 p-3 sm:grid-cols-6">
        {TABLES.map((table) => (
          <div
            key={table.n}
            className={`rounded-[10px] border px-2 py-2.5 text-center ${TABLE_TONE[table.state]}`}
          >
            <p className="tabular text-[15px] font-semibold leading-none text-ink">{table.n}</p>
            <p className="mt-1 truncate text-[8px] font-bold uppercase tracking-[0.06em]">
              {table.who ?? (table.state === 'clear' ? 'Clear' : table.state === 'waiting' ? 'Knock' : 'Free')}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function Pill({ label, value, tone }) {
  return (
    <span className="rounded-[7px] border border-line bg-sunken px-2 py-1 text-center">
      <span className={`tabular block text-[12px] font-semibold leading-none ${tone}`}>
        {value}
      </span>
      <span className="mt-[2px] block text-[7.5px] uppercase tracking-[0.06em] text-ink-faint">
        {label}
      </span>
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/* The pass                                                                   */
/* -------------------------------------------------------------------------- */

const TICKETS = [
  {
    table: 3,
    clock: '12:40',
    state: 'late',
    items: ['2 × Punjabi Samosas', '1 × Dal Makhani', '2 × Garlic Naan'],
    note: 'No chilli on the dal — allergy',
  },
  {
    table: 7,
    clock: '6:05',
    state: 'on',
    items: ['1 × Lamb Rogan Josh', '1 × Pilau Rice'],
    note: null,
  },
  {
    table: 10,
    clock: '0:48',
    state: 'new',
    items: ['3 × Paneer Tikka', '1 × Raita'],
    note: null,
  },
]

const TICKET_TONE = {
  late: { edge: 'border-l-state-late', clock: 'text-state-late', chip: 'bg-state-late text-white' },
  on: { edge: 'border-l-state-fire', clock: 'text-state-fire', chip: 'bg-state-fire text-white' },
  new: { edge: 'border-l-state-new', clock: 'text-state-new', chip: 'bg-state-new text-canvas' },
}

const TICKET_LABEL = { late: 'Late', on: 'On', new: 'New' }

export function PassMock({ className = '' }) {
  return (
    <div
      aria-hidden
      className={`w-full overflow-hidden rounded-[16px] border border-kds-line bg-kds shadow-float ${className}`}
    >
      <div className="flex items-center justify-between border-b border-kds-line px-4 py-2.5">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-kds-ink-soft">
          The pass
        </p>
        <p className="tabular text-[11px] text-kds-ink-soft">3 on</p>
      </div>

      <div className="space-y-2 p-3">
        {TICKETS.map((ticket) => {
          const tone = TICKET_TONE[ticket.state]
          return (
            <div
              key={ticket.table}
              className={`rounded-[10px] border border-kds-line border-l-[3px] bg-kds-surface p-2.5 ${tone.edge}`}
            >
              <div className="flex items-baseline justify-between">
                <p className="text-[12px] font-bold text-kds-ink">Table {ticket.table}</p>
                <span className="flex items-center gap-1.5">
                  <span className={`tabular text-[12px] font-bold ${tone.clock}`}>
                    {ticket.clock}
                  </span>
                  <span
                    className={`rounded-[5px] px-1.5 py-[1px] text-[8px] font-bold uppercase tracking-[0.06em] ${tone.chip}`}
                  >
                    {TICKET_LABEL[ticket.state]}
                  </span>
                </span>
              </div>

              <ul className="mt-1.5 space-y-[2px]">
                {ticket.items.map((item) => (
                  <li key={item} className="text-[10px] text-kds-ink-soft">
                    {item}
                  </li>
                ))}
              </ul>

              {/* Shown with the ticket, never behind a tap — the whole reason
                  the note field exists is that the kitchen reads it. */}
              {ticket.note && (
                <p className="mt-1.5 rounded-[6px] bg-state-new-bg px-2 py-1 text-[9px] leading-snug text-state-new">
                  {ticket.note}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Hero arrangement                                                           */
/* -------------------------------------------------------------------------- */

/**
 * The three surfaces, overlapped, in the order a plate of food moves through
 * them: phone, then floor, then pass.
 */
export function HeroShowcase() {
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-[520px] pb-6 pt-2">
      <div className="pl-0 sm:pl-14">
        <FloorMock className="rotate-[-1.2deg]" />
      </div>

      <div className="mt-[-28px] flex items-end justify-between gap-3">
        <PhoneMock className="rotate-[2deg]" />
        <div className="hidden min-w-0 flex-1 translate-y-6 sm:block">
          <PassMock className="rotate-[1deg]" />
        </div>
      </div>

      {/* Shows the pass on a phone, where the overlap above has no room. */}
      <div className="mt-4 sm:hidden">
        <PassMock />
      </div>
    </div>
  )
}
