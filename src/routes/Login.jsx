import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/context'
import { USE_MOCK, subscribe } from '../data'
import { RESTAURANT } from '../mock/data'
import { roleLabel } from '../auth/permissions'
import { Banner } from '../components/ui'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back']

/** Which screen this person should land on, in order of preference. */
const HOME_BY_PERMISSION = [
  ['floor.view', '/manager'],
  ['orders.view', '/kitchen'],
  ['billing.view', '/manager/billing'],
  ['menu.view', '/manager/menu'],
  ['reports.sales', '/manager/sales'],
  ['staff.manage', '/manager/people'],
]

const ROUTE_PERMISSION = {
  '/manager': 'floor.view',
  '/manager/menu': 'menu.view',
  '/manager/billing': 'billing.view',
  '/manager/sales': 'reports.sales',
  '/manager/people': 'staff.manage',
  '/kitchen': 'orders.view',
}

function landingFor(requested, can) {
  const needed = requested ? ROUTE_PERMISSION[requested] : null
  if (requested && (!needed || can(needed))) return requested

  const match = HOME_BY_PERMISSION.find(([permission]) => can(permission))
  return match ? match[1] : '/'
}

/**
 * PIN entry.
 *
 * A keypad, not a form. Staff sign in on a shared tablet with wet hands in
 * the middle of service — an email field and an on-screen keyboard is the
 * wrong instrument for that job, which is why every till in the country uses
 * four digits.
 *
 * Submits automatically on the fourth digit; there is no separate confirm.
 */
export default function Login() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const { signIn, user, can, ready } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const requested = location.state?.from ?? null

  useEffect(() => {
    if (!user || !ready) return
    // The remembered destination belongs to whoever was here last. Sending the
    // next person to a page their role cannot open greets them with a padlock,
    // so fall back to the first screen they actually have.
    navigate(landingFor(requested, can), { replace: true })
  }, [user, ready, requested, can, navigate])

  const submit = async (value) => {
    setBusy(true)
    setError(null)
    try {
      await signIn(value)
    } catch (err) {
      setError(err)
      setPin('')
      // A wrong PIN should feel wrong, briefly.
      if (navigator.vibrate) navigator.vibrate(120)
    } finally {
      setBusy(false)
    }
  }

  const press = (key) => {
    if (busy) return
    setError(null)

    if (key === 'clear') return setPin('')
    if (key === 'back') return setPin((p) => p.slice(0, -1))
    if (pin.length >= 4) return

    const next = pin + key
    setPin(next)
    if (next.length === 4) submit(next)
  }

  // Physical keyboards exist on the manager's laptop too.
  useEffect(() => {
    const onKey = (event) => {
      if (/^\d$/.test(event.key)) press(event.key)
      else if (event.key === 'Backspace') press('back')
      else if (event.key === 'Escape') press('clear')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey) // STRICT UNMOUNT
  })

  return (
    <div className="wash grid min-h-full place-items-center px-6 py-10">
      <div className="w-full max-w-[320px]">
        <div className="mb-8 text-center">
          <p className="font-display text-[40px] leading-none">{RESTAURANT.name}</p>
          <p className="mt-2 text-[12px] uppercase tracking-[0.14em] text-ink-faint">
            Staff sign in
          </p>
        </div>

        <div className="mb-7 flex justify-center gap-3" aria-label={`${pin.length} of 4 digits`}>
          {[0, 1, 2, 3].map((index) => (
            <span
              key={index}
              className={`size-3.5 rounded-full transition-all ${
                busy && pin.length === 4
                  ? 'animate-pulse bg-accent'
                  : index < pin.length
                    ? 'scale-110 bg-accent'
                    : 'bg-line-strong'
              }`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {KEYS.map((key) => (
            <button
              key={key}
              onClick={() => press(key)}
              disabled={busy}
              className={`h-16 rounded-card border border-line text-[22px] font-semibold transition-all active:scale-95 disabled:opacity-40 ${
                key === 'clear' || key === 'back'
                  ? 'bg-sunken text-[13px] font-bold uppercase tracking-[0.06em] text-ink-faint'
                  : 'bg-surface text-ink hover:border-line-strong'
              }`}
            >
              {key === 'clear' ? 'Clear' : key === 'back' ? 'Delete' : key}
            </button>
          ))}
        </div>

        <div className="mt-5 min-h-[52px]">
          <Banner tone="bad" onDismiss={() => setError(null)}>
            {error}
          </Banner>
        </div>

        {USE_MOCK && <DemoAccounts />}
      </div>
    </div>
  )
}

/**
 * Visible only while the app runs on demo data. The PINs live in the seed
 * file, and this reads them from there rather than hard-coding a second copy
 * that could drift — and it disappears entirely once USE_MOCK is false.
 */
function DemoAccounts() {
  const [staff, setStaff] = useState([])

  useEffect(() => {
    const unsubscribe = subscribe('staff', setStaff)
    return unsubscribe // STRICT UNMOUNT
  }, [])

  if (!staff.length) return null

  return (
    <div className="mt-7 rounded-card border border-line bg-sunken p-4">
      <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-faint">
        Demo accounts
      </p>
      <ul className="space-y-1.5">
        {staff
          .filter((person) => person.active)
          .map((person) => (
            <li key={person.id} className="flex items-baseline justify-between text-[13px]">
              <span className="text-ink-soft">
                {person.name}{' '}
                <span className="text-ink-faint">— {roleLabel(person.role)}</span>
              </span>
              <span className="tabular font-bold text-accent">{person.pin}</span>
            </li>
          ))}
      </ul>
      <p className="mt-3 text-[11px] leading-relaxed text-ink-faint">
        Demo only. PINs are checked in the browser here — real sign-in must move
        server-side before this goes near a till.
      </p>

      {/* Guests never sign in, so their screens need a way in from somewhere
          while the design is being reviewed. */}
      <div className="mt-4 border-t border-line pt-4">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-faint">
          Guest screens (no sign-in)
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/customer"
            className="rounded-pill border border-line-strong bg-surface px-3 py-1.5 text-[12px] font-semibold text-ink-soft transition-colors hover:text-ink"
          >
            Guest front door
          </Link>
          <Link
            to="/customer/3"
            className="rounded-pill border border-line-strong bg-surface px-3 py-1.5 text-[12px] font-semibold text-ink-soft transition-colors hover:text-ink"
          >
            Table 3 — as if scanned
          </Link>
        </div>
      </div>
    </div>
  )
}
