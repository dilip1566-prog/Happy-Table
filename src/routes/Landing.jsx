import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRestaurant } from '../tenant/context'
import { useAuth } from '../auth/context'
import { useMenu } from '../hooks/useMenu'
import { roleLabel } from '../auth/permissions'
import { isValidEmail } from '../lib/validate'
import { Banner, Button, inputClass } from '../components/ui'

/**
 * The public front door.
 *
 * Two audiences arrive at this address and they want opposite things, so the
 * page asks once rather than guessing. Guests get the larger, warmer half —
 * they are the overwhelming majority of arrivals and the ones least willing
 * to hunt. Staff get a quieter door, because they come here a handful of
 * times a shift and already know where they are going.
 */
export default function Landing() {
  const { user } = useAuth()
  // The name comes from the tenant record, never a constant — this same
  // component serves every restaurant on the platform.
  const restaurant = useRestaurant()
  const { menu } = useMenu()

  return (
    <div className="wash flex min-h-full flex-col">
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-5 py-12 sm:py-16">
        <header className="text-center">
          <h1 className="font-display text-[54px] leading-none sm:text-[76px]">
            {restaurant.name}
          </h1>
          <p className="mt-3 text-[12px] uppercase tracking-[0.18em] text-ink-faint sm:text-[13px]">
            {restaurant.tagline}
          </p>
        </header>

        <div className="mt-10 grid grid-cols-1 items-start gap-3 sm:mt-14 sm:gap-4 md:grid-cols-2">
          <DoorCard
            to="/customer"
            eyebrow="Dining with us"
            title="View the menu & order"
            body={`Browse ${menu.length ? `all ${menu.length} dishes` : 'the menu'} freely. Your waiter gives you a table code when you are ready to order.`}
            cta="Start browsing"
            primary
          />

          <StaffSignIn user={user} />
        </div>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-4xl px-5 py-6 text-center text-[12px] text-ink-faint">
          Already at a table? Scan the code on the table to skip straight to the menu.
        </div>
      </footer>
    </div>
  )
}

/**
 * Sign-in, inline rather than a page away.
 *
 * Staff open this address on a shared tablet many times a week. Making them
 * tap through to a second screen first is one tap of pure friction, so the
 * whole form is here — small, quiet, and clearly the lesser half of the
 * page.
 */
function StaffSignIn({ user }) {
  const { signIn, signOut } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [touched, setTouched] = useState(false)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  const emailLooksWrong = touched && form.email.length > 0 && !isValidEmail(form.email)

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
      // Login owns the question of which screen each role should land on, so
      // hand the decision there rather than keeping a second copy of it.
      navigate('/login', { replace: true })
    } catch (err) {
      setError(err)
      setForm((f) => ({ ...f, password: '' }))
    } finally {
      setBusy(false)
    }
  }

  if (user) {
    return (
      <section className="rounded-card border border-line bg-surface p-6 sm:p-7">
        <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-faint">
          For our team
        </span>
        <h2 className="mt-2.5 text-[21px] font-semibold leading-tight tracking-[-0.02em] sm:text-[23px]">
          Signed in as {user.name}
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
          {roleLabel(user.role)} &middot; {user.email}
        </p>
        <Link to="/login">
          <Button variant="secondary" full size="lg" className="mt-6">
            Continue &rarr;
          </Button>
        </Link>
        <button
          type="button"
          onClick={signOut}
          className="mt-2 w-full text-center text-[12px] text-ink-faint transition-colors hover:text-ink"
        >
          Sign out
        </button>
      </section>
    )
  }

  return (
    <section className="rounded-card border border-line bg-surface p-6 sm:p-7">
      <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-faint">
        For our team
      </span>
      <h2 className="mt-2.5 text-[21px] font-semibold leading-tight tracking-[-0.02em] sm:text-[23px]">
        Staff sign in
      </h2>

      <form onSubmit={submit} className="mt-4 space-y-2.5" noValidate>
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
          aria-label="Email"
          aria-invalid={emailLooksWrong || undefined}
          placeholder="you@restaurant.co.uk"
          className={`${inputClass} ${emailLooksWrong ? 'border-state-late' : ''}`}
        />

        {emailLooksWrong && (
          <p className="text-[12px] text-state-late">
            That does not look like an email address.
          </p>
        )}

        <input
          type="password"
          autoComplete="current-password"
          required
          value={form.password}
          onChange={set('password')}
          aria-label="Password"
          placeholder="Password"
          className={inputClass}
        />

        <Button type="submit" full size="lg" disabled={busy} className="!mt-4">
          {busy ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      {error && (
        <div className="mt-3">
          <Banner tone="bad" onDismiss={() => setError(null)}>
            {error}
          </Banner>
        </div>
      )}
    </section>
  )
}

function DoorCard({ to, eyebrow, title, body, cta, primary }) {
  return (
    <Link
      to={to}
      className={`group flex flex-col rounded-card border p-6 transition-all sm:p-7 ${
        primary
          ? 'border-accent/40 bg-accent-wash hover:border-accent'
          : 'border-line bg-surface hover:border-line-strong'
      }`}
    >
      <span
        className={`text-[11px] font-bold uppercase tracking-[0.1em] ${
          primary ? 'text-accent' : 'text-ink-faint'
        }`}
      >
        {eyebrow}
      </span>

      <h2 className="mt-2.5 text-[21px] font-semibold leading-tight tracking-[-0.02em] sm:text-[23px]">
        {title}
      </h2>

      <p className="mt-2 flex-1 text-[14px] leading-relaxed text-ink-soft">{body}</p>

      <span
        className={`mt-6 inline-flex items-center justify-center gap-2 rounded-control px-5 py-3.5 text-[15px] font-semibold transition-colors ${
          primary
            ? 'bg-accent text-white group-hover:bg-accent-hover'
            : 'border border-line-strong bg-raised text-ink group-hover:bg-line'
        }`}
      >
        {cta}
        <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
      </span>
    </Link>
  )
}
