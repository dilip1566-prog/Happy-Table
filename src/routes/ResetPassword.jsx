import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { USE_MOCK, checkResetToken, completePasswordReset, sendPasswordReset } from '../data'
import { useOptionalRestaurant } from '../tenant/context'
import { isValidEmail } from '../lib/validate'
import { PASSWORD_MIN, passwordProblem, scorePassword } from '../lib/passwords'
import { Banner, Button, Field, Spinner, inputClass } from '../components/ui'
import { CopyableLink } from '../components/CopyableLink'

/**
 * ===========================================================================
 * Setting a password — first time, or after forgetting one.  /reset
 * ===========================================================================
 *
 * Deliberately one screen for both. A new starter who has never had a
 * password and a waiter who cannot remember theirs need exactly the same
 * thing: a link to this page and a box to type into. Splitting them would
 * mean the new starter has to know that "forgot password" applies to a
 * password they never had, which is the sort of thing that ends with the
 * owner reading a password out across a service.
 *
 * Which half shows is decided by the URL, not by a tab the person has to
 * find:
 *
 *   /reset                     -> ask for a link
 *   /reset?token=...           -> set the password (demo backend)
 *   /reset?oobCode=...         -> set the password (Firebase's own link)
 *
 * Both code parameters are read because the two backends name it
 * differently and neither is worth translating at the seam — Firebase owns
 * the shape of a link it mails out.
 */
export default function ResetPassword() {
  const [params] = useSearchParams()
  const codeFromUrl = params.get('token') ?? params.get('oobCode')

  // A dead link drops through to the request form rather than stranding
  // someone on an error with nowhere to go.
  //
  // Which link died, not merely that one did. A boolean here is sticky: the
  // replacement link opens in the same mounted component, so the flag would
  // still be set and the person would be shown the request form again, with
  // a perfectly good link in the address bar. Comparing codes means a new
  // one always gets through and only the dismissed one stays dismissed.
  const [deadCode, setDeadCode] = useState(null)
  const showSetter = codeFromUrl && codeFromUrl !== deadCode

  return (
    <Shell>
      {showSetter ? (
        <SetPassword code={codeFromUrl} onDeadLink={() => setDeadCode(codeFromUrl)} />
      ) : (
        <RequestLink initialEmail={params.get('email') ?? ''} />
      )}
    </Shell>
  )
}

function Shell({ children }) {
  // Optional, because this screen also answers on the apex. Firebase allows
  // one password-reset action URL per project, so a link mailed to a waiter
  // at any restaurant can land at happytable.co.uk/reset — where there is no
  // restaurant to name, and the platform's own name is the honest heading.
  const restaurant = useOptionalRestaurant()

  return (
    <div className="wash grid min-h-full place-items-center px-6 py-10">
      <div className="w-full max-w-[380px]">
        <div className="mb-7 text-center">
          <p className="font-display text-[34px] leading-none">
            {restaurant?.name ?? 'Happy Table'}
          </p>
          <p className="mt-2 text-[12px] uppercase tracking-[0.14em] text-ink-faint">
            Staff passwords
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Half one — ask for a link
// ---------------------------------------------------------------------------

function RequestLink({ initialEmail }) {
  const [email, setEmail] = useState(initialEmail)
  const [touched, setTouched] = useState(false)
  const [sent, setSent] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const emailLooksWrong = touched && email.length > 0 && !isValidEmail(email)

  const submit = async (event) => {
    event.preventDefault()
    setTouched(true)
    if (!isValidEmail(email)) {
      setError(new Error('Enter a valid email address.'))
      return
    }

    setBusy(true)
    setError(null)
    try {
      setSent(await sendPasswordReset(email))
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  if (sent) return <LinkSent result={sent} email={email} onAgain={() => setSent(null)} />

  return (
    <>
      <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.02em]">
        Set or reset your password
      </h1>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
        Enter the address you were added with and we will send you a link. Use this the
        first time you sign in too &mdash; the owner never sets your password for you.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        <Field
          label="Your work email"
          hint={emailLooksWrong ? 'That does not look like an email address' : null}
        >
          <input
            type="email"
            autoComplete="username"
            inputMode="email"
            autoCapitalize="none"
            spellCheck="false"
            autoFocus
            required
            value={email}
            onChange={(e) => {
              setError(null)
              setEmail(e.target.value)
            }}
            onBlur={() => setTouched(true)}
            aria-invalid={emailLooksWrong || undefined}
            placeholder="you@restaurant.co.uk"
            className={`${inputClass} ${emailLooksWrong ? 'border-state-late' : ''}`}
          />
        </Field>

        <Button type="submit" full size="lg" disabled={busy}>
          {busy ? 'Sending…' : 'Send me a link'}
        </Button>
      </form>

      {error && (
        <div className="mt-4">
          <Banner tone="bad" onDismiss={() => setError(null)}>
            {error}
          </Banner>
        </div>
      )}

      <BackToSignIn />
    </>
  )
}

/**
 * Confirmation, worded so it is true either way.
 *
 * It never says whether that address belongs to anybody. The backends are
 * built the same way for the same reason: a box that answers "is this person
 * staff here?" is a staff directory with extra steps.
 */
function LinkSent({ result, email, onAgain }) {
  return (
    <>
      <div className="rounded-card border border-state-ready/25 bg-state-ready-bg p-5">
        <p className="text-[15px] font-semibold text-state-ready">Check your email</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-state-ready/90">
          If <span className="font-semibold">{email}</span> belongs to someone on the team,
          a link to set a password is on its way. It is good for an hour and can be used
          once.
        </p>
      </div>

      {/* Demo backend only: there is no mail server, so the link it would
          have sent is shown instead. This is the whole flow made walkable —
          and it disappears the moment USE_MOCK is false. */}
      {USE_MOCK && <DemoLink result={result} />}

      <div className="mt-5 space-y-2">
        <p className="text-[13px] leading-relaxed text-ink-faint">
          Nothing arrived? Check the spam folder, then ask the owner to confirm which
          address you were added with.
        </p>
        <Button variant="quiet" size="sm" onClick={onAgain}>
          Try a different address
        </Button>
      </div>

      <BackToSignIn />
    </>
  )
}

function DemoLink({ result }) {
  const navigate = useNavigate()

  if (!result?.link) {
    return (
      <div className="mt-4 rounded-card border border-line bg-sunken p-4">
        <DemoLabel />
        <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
          No link was generated, which means no active account here uses that address.
          A real inbox would simply receive nothing &mdash; the screen above says the same
          thing to everybody on purpose.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-4 rounded-card border border-line bg-sunken p-4">
      <DemoLabel />
      <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
        Standing in for the email, because demo data has no mail server:
      </p>
      <CopyableLink link={result.link} />
      <Button
        full
        className="mt-3"
        onClick={() => navigate(`/reset?token=${result.token}`)}
      >
        Open the link &rarr;
      </Button>
    </div>
  )
}

function DemoLabel() {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-faint">
      Demo data &middot; no email is sent
    </p>
  )
}

// ---------------------------------------------------------------------------
// Half two — set the password
// ---------------------------------------------------------------------------

function SetPassword({ code, onDeadLink }) {
  const navigate = useNavigate()
  const [check, setCheck] = useState(null) // null = still checking
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [reveal, setReveal] = useState(false)
  const [capsLock, setCapsLock] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(null)
  const alive = useRef(true)

  // Judge the link before showing the form. Asking someone to choose a
  // password, type it twice and only then be told the link died an hour ago
  // is the single most annoying way to run this screen.
  useEffect(() => {
    alive.current = true
    checkResetToken(code)
      .then((result) => alive.current && setCheck(result))
      .catch(() => alive.current && setCheck({ valid: false, reason: 'unknown' }))
    return () => {
      alive.current = false
    } // STRICT UNMOUNT
  }, [code])

  const problem = passwordProblem(form.password)
  const mismatch = form.confirm.length > 0 && form.confirm !== form.password
  const ready = !problem && form.confirm === form.password && form.confirm.length > 0

  const submit = async (event) => {
    event.preventDefault()
    setSubmitted(true)
    if (!ready) return

    setBusy(true)
    setError(null)
    try {
      const result = await completePasswordReset(code, form.password)
      setDone({ email: result?.email ?? check?.email ?? null })
      setForm({ password: '', confirm: '' })
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  if (check === null) return <Spinner label="Checking your link" />

  if (!check.valid) {
    return (
      <>
        <div className="rounded-card border border-state-late/25 bg-state-late-bg p-5">
          <p className="text-[15px] font-semibold text-state-late">
            {check.reason === 'expired'
              ? 'That link has expired'
              : check.reason === 'used'
                ? 'That link has already been used'
                : 'That link is not valid'}
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-state-late/90">
            {check.reason === 'used'
              ? 'Each link works once. If it was not you who used it, tell the owner.'
              : 'Links last an hour, and only the most recent one works. Ask for a fresh one and it will arrive in a moment.'}
          </p>
        </div>

        <Button full size="lg" className="mt-5" onClick={onDeadLink}>
          Send me a new link
        </Button>

        <BackToSignIn />
      </>
    )
  }

  if (done) {
    return (
      <>
        <div className="rounded-card border border-state-ready/25 bg-state-ready-bg p-5">
          <p className="text-[15px] font-semibold text-state-ready">Password set</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-state-ready/90">
            You can sign in with it now. Nobody else knows it &mdash; not the owner, not
            us. If you forget it, come back here.
          </p>
        </div>

        <Button
          full
          size="lg"
          className="mt-5"
          onClick={() =>
            navigate(done.email ? `/login?email=${encodeURIComponent(done.email)}` : '/login')
          }
        >
          Sign in &rarr;
        </Button>
      </>
    )
  }

  const strength = scorePassword(form.password)
  const firstTime = check.purpose === 'invite'

  return (
    <>
      <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.02em]">
        {firstTime ? 'Choose your password' : 'Choose a new password'}
      </h1>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
        {firstTime ? 'Welcome aboard. This is for ' : 'This is for '}
        <span className="font-semibold text-ink">{check.email}</span>
        {check.name ? ` — ${check.name}.` : '.'}
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        <Field label="New password" hint={`At least ${PASSWORD_MIN} characters.`}>
          <div className="relative">
            <input
              type={reveal ? 'text' : 'password'}
              autoComplete="new-password"
              autoFocus
              required
              value={form.password}
              onChange={(e) => {
                setError(null)
                setForm((f) => ({ ...f, password: e.target.value }))
              }}
              onKeyUp={(e) => setCapsLock(e.getModifierState?.('CapsLock') ?? false)}
              onKeyDown={(e) => setCapsLock(e.getModifierState?.('CapsLock') ?? false)}
              aria-invalid={(submitted && Boolean(problem)) || undefined}
              placeholder="••••••••"
              className={`${inputClass} pr-16 ${
                submitted && problem ? 'border-state-late' : ''
              }`}
            />
            <button
              type="button"
              onClick={() => setReveal((r) => !r)}
              aria-pressed={reveal}
              className="absolute right-0 top-0 h-11 px-3 text-[12px] font-semibold text-ink-faint transition-colors hover:text-ink"
            >
              {reveal ? 'Hide' : 'Show'}
            </button>
          </div>
        </Field>

        {/* Shown as soon as there is something to measure, so the bar is
            feedback on what they are typing rather than a scold after the
            fact. */}
        {form.password.length > 0 && <StrengthBar strength={strength} />}

        {/* Worth its own line: a caps-locked tablet at a pass is the most
            common reason a brand new password "does not work" an hour later. */}
        {capsLock && (
          <p className="text-[12px] font-semibold text-state-new">Caps Lock is on.</p>
        )}

        <Field
          label="Type it again"
          hint={
            mismatch
              ? 'These two do not match yet'
              : form.confirm && !mismatch
                ? 'They match'
                : null
          }
        >
          <input
            type={reveal ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={form.confirm}
            onChange={(e) => {
              setError(null)
              setForm((f) => ({ ...f, confirm: e.target.value }))
            }}
            aria-invalid={mismatch || undefined}
            placeholder="••••••••"
            className={`${inputClass} ${
              mismatch
                ? 'border-state-late'
                : form.confirm && !mismatch
                  ? 'border-state-ready'
                  : ''
            }`}
          />
        </Field>

        {/* Live, not disabled. A button that cannot be pressed and will not
            say why is the worst of both — this one always presses and always
            explains. */}
        <Button type="submit" full size="lg" disabled={busy}>
          {busy ? 'Saving…' : firstTime ? 'Set my password' : 'Save new password'}
        </Button>

        {submitted && !ready && (
          <p className="text-[13px] text-state-late">
            {problem ?? 'Both boxes need to match before this can be saved.'}
          </p>
        )}
      </form>

      {error && (
        <div className="mt-4">
          <Banner tone="bad" onDismiss={() => setError(null)}>
            {error}
          </Banner>
        </div>
      )}
    </>
  )
}

function StrengthBar({ strength }) {
  // The house state hues, used the way they are used everywhere else:
  // red is wrong, amber is not there yet, blue is in progress, green is done.
  const tones = ['bg-state-late', 'bg-state-new', 'bg-state-fire', 'bg-state-ready']

  return (
    <div>
      <div className="flex gap-1.5" role="presentation">
        {[0, 1, 2, 3].map((slot) => (
          <span
            key={slot}
            className={`h-1 flex-1 rounded-pill transition-colors ${
              slot <= strength.level ? tones[strength.level] : 'bg-raised'
            }`}
          />
        ))}
      </div>
      <p aria-live="polite" className="mt-1.5 text-[12px] text-ink-faint">
        {strength.label}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Shared bits
// ---------------------------------------------------------------------------

function BackToSignIn() {
  return (
    <div className="mt-6 text-center">
      <Link
        to="/login"
        className="text-[13px] text-ink-faint transition-colors hover:text-ink"
      >
        &larr; Back to sign in
      </Link>
    </div>
  )
}
