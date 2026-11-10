import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/context'
import { USE_MOCK, subscribe } from '../data'
import { useRestaurant } from '../tenant/context'
import { roleLabel } from '../auth/permissions'
import { isValidEmail } from '../lib/validate'
import { Banner, Button, Field, inputClass } from '../components/ui'

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
 * Staff sign-in: email address and password.
 *
 * The address is checked for shape before anything is sent, so a typo comes
 * back instantly instead of as a rejected sign-in — the two failures look
 * identical to a tired person and only one of them is worth retyping the
 * password for.
 */
export default function Login() {
  const restaurant = useRestaurant()
  const [params] = useSearchParams()
  // Carried here by the reset screen, so someone who has just set a password
  // is not asked to type their own address back in immediately afterwards.
  const [form, setForm] = useState({ email: params.get('email') ?? '', password: '' })
  const [touched, setTouched] = useState(false)
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

  const emailLooksWrong = touched && form.email.length > 0 && !isValidEmail(form.email)

  // Only pass an address on that is worth prefilling. Half an email in the
  // box on the next screen is worse than an empty one.
  const resetHref = isValidEmail(form.email)
    ? `/reset?email=${encodeURIComponent(form.email.trim())}`
    : '/reset'

  const set = (field) => (event) => {
    setError(null)
    setForm((f) => ({ ...f, [field]: event.target.value }))
  }

  const submit = async (event) => {
    event.preventDefault()
    setTouched(true)

    if (!isValidEmail(form.email)) {
      setError(new Error('Enter a valid email address.'))
      return
    }

    setBusy(true)
    setError(null)
    try {
      await signIn(form.email, form.password)
    } catch (err) {
      setError(err)
      setForm((f) => ({ ...f, password: '' }))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="wash grid min-h-full place-items-center px-6 py-10">
      <div className="w-full max-w-[340px]">
        <div className="mb-7 text-center">
          <p className="font-display text-[40px] leading-none">{restaurant.name}</p>
          <p className="mt-2 text-[12px] uppercase tracking-[0.14em] text-ink-faint">
            Staff sign in
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field
            label="Email"
            hint={emailLooksWrong ? 'That does not look like an email address' : null}
          >
            <input
              type="email"
              autoComplete="username"
              inputMode="email"
              autoCapitalize="none"
              spellCheck="false"
              required
              value={form.email}
              onChange={set('email')}
              onBlur={() => setTouched(true)}
              aria-invalid={emailLooksWrong || undefined}
              placeholder="you@restaurant.co.uk"
              className={`${inputClass} ${emailLooksWrong ? 'border-state-late' : ''}`}
            />
          </Field>

          <Field label="Password">
            <input
              type="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={set('password')}
              placeholder="••••••••"
              className={inputClass}
            />
          </Field>

          {/* Quiet and small, but always there. It carries whatever address is
              already typed, so reaching it costs one tap and no retyping. */}
          <div className="flex justify-end">
            <Link
              to={resetHref}
              className="text-[12px] text-ink-faint underline decoration-line-strong underline-offset-2 transition-colors hover:text-ink"
            >
              Forgot your password?
            </Link>
          </div>

          <Button type="submit" full size="lg" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        {/* First shift, no password yet. Without this line the only route in
            is a link labelled for a password they have never had. */}
        <p className="mt-3.5 text-center text-[12px] leading-relaxed text-ink-faint">
          First time signing in?{' '}
          <Link to={resetHref} className="font-semibold text-accent hover:underline">
            Set your password
          </Link>
        </p>

        <div className="mt-4 min-h-[52px]">
          <Banner tone="bad" onDismiss={() => setError(null)}>
            {error}
          </Banner>

          {/* A rejected sign-in is the moment the link is actually wanted, and
              the moment it is furthest from the eye. Repeat it here rather
              than make them hunt back up the form. */}
          {error && (
            <Link to={resetHref}>
              <Button variant="secondary" full size="sm" className="mt-2">
                Set or reset your password &rarr;
              </Button>
            </Link>
          )}
        </div>

        {USE_MOCK && <DemoAccounts />}
      </div>
    </div>
  )
}

/**
 * Visible only while the app runs on demo data. The addresses live in the
 * seed file, and this reads them from there rather than hard-coding a second
 * copy that could drift — and it disappears entirely once USE_MOCK is false.
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
        {/* "Starting", not "password": anyone who has walked the reset flow
            has changed theirs, and this list would otherwise be confidently
            wrong about them until the next reload. */}
        Demo accounts &middot; starting password{' '}
        <span className="tabular text-accent">demo1234</span>
      </p>
      <ul className="space-y-1.5">
        {staff
          .filter((person) => person.active)
          .map((person) => (
            <li key={person.id} className="text-[13px]">
              <span className="text-ink-soft">{person.email}</span>{' '}
              <span className="text-ink-faint">&mdash; {roleLabel(person.role)}</span>
            </li>
          ))}
      </ul>
      <p className="mt-3 text-[11px] leading-relaxed text-ink-faint">
        Demo only. Passwords are checked in the browser here — real sign-in
        must move server-side before this goes near a till.
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
