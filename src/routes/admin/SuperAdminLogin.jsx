import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAdmin } from '../../admin/context'
import { DEMO_ADMIN_HINT, USE_MOCK } from '../../data'
import { isValidEmail } from '../../lib/validate'
import { Banner, Button, Field, inputClass } from '../../components/ui'

/**
 * Sign in to the operator console.
 *
 * Kept visibly apart from a restaurant's staff sign-in, because they are not
 * the same door and a tired person must never wonder which one they are at.
 * A restaurant owner reaching this screen has gone wrong, and the line at the
 * bottom says so and points them home rather than letting them try their
 * password three times.
 */
export default function SuperAdminLogin() {
  const { admin, signIn } = useAdmin()
  const [form, setForm] = useState({ email: '', password: '' })
  const [touched, setTouched] = useState(false)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Where they were headed before the guard sent them here.
  const from = location.state?.from ?? '/admin'

  useEffect(() => {
    if (admin) navigate(from, { replace: true })
  }, [admin, from, navigate])

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
    } catch (err) {
      setError(err)
      setForm((f) => ({ ...f, password: '' }))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="wash grid min-h-full place-items-center px-6 py-10">
      <div className="w-full max-w-[360px]">
        <div className="mb-8 text-center">
          <p className="font-display text-[34px] leading-none">Happy Table</p>
          <p className="mt-2.5 text-[12px] uppercase tracking-[0.14em] text-ink-faint">
            Operator console
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
              autoFocus
              value={form.email}
              onChange={set('email')}
              onBlur={() => setTouched(true)}
              aria-invalid={emailLooksWrong || undefined}
              placeholder={`you@happytable.co.uk`}
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

          <Button type="submit" full size="lg" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <div className="mt-4 min-h-[52px]">
          <Banner tone="bad" onDismiss={() => setError(null)}>
            {error}
          </Banner>
        </div>

        {USE_MOCK && DEMO_ADMIN_HINT && (
          <div className="rounded-card border border-line bg-sunken p-4">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-faint">
              Demo platform admin
            </p>
            <p className="tabular text-[13px] text-ink-soft">
              {DEMO_ADMIN_HINT.email}
            </p>
            <p className="tabular text-[13px] text-ink-soft">
              {DEMO_ADMIN_HINT.password}
            </p>
            <p className="mt-3 text-[11px] leading-relaxed text-ink-faint">
              Demo only. With Firebase connected this checks a{' '}
              <code>platformAdmins</code> document that no client can write,
              and the security rules check it again on every read.
            </p>
          </div>
        )}

        {/* The wrong-door case, answered before they try their password. */}
        <p className="mt-6 text-center text-[12px] leading-relaxed text-ink-faint">
          Work at a restaurant? Your sign-in is on your restaurant&rsquo;s own
          address, not here.
          <br />
          <Link to="/" className="mt-1 inline-block text-ink-soft hover:text-ink">
            &larr; Back to happytable.co.uk
          </Link>
        </p>
      </div>
    </div>
  )
}
