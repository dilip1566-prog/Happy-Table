import { useState } from 'react'
import { claimPlatformAdmin, seedFromBrowser, signInOrCreate } from './seedFromBrowser'
import { Banner, Button, Field, inputClass } from '../components/ui'

/**
 * ===========================================================================
 * Dev-only seeding screen.  /dev/seed
 * ===========================================================================
 *
 * Mounted only when import.meta.env.DEV, so the route does not exist in a
 * production build.
 *
 * Exists so the password never has to travel through anybody but the person
 * who owns it: you type it here, the browser sends it straight to Firebase
 * Auth, and it is held in component state for the length of one run and
 * nowhere else. Nothing is written to disk, to the repo, or to a log.
 *
 * Two stages on purpose. A brand new Firebase project has no accounts at all,
 * so stage one makes one and — the important part — shows you its uid. Stage
 * two cannot work until a document exists at platformAdmins/{that uid},
 * created by hand in the Firebase console, because firestore.rules says
 * `allow write: if false` there. No client can grant itself that, which is
 * the single property the rest of the model rests on.
 */
export default function SeedPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [account, setAccount] = useState(null) // { uid, created }
  const [claimed, setClaimed] = useState(false)
  const [lines, setLines] = useState([])
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [copied, setCopied] = useState(false)

  const set = (field) => (event) => {
    setError(null)
    setForm((f) => ({ ...f, [field]: event.target.value }))
  }

  const authenticate = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const result = await signInOrCreate(form)
      setAccount(result)
      setForm((f) => ({ ...f, password: '' }))
    } catch (err) {
      setError(
        err?.code === 'auth/weak-password'
          ? new Error('Firebase needs a password of at least 6 characters.')
          : err?.code === 'auth/invalid-email'
            ? new Error('That is not a valid email address.')
            : err
      )
    } finally {
      setBusy(false)
    }
  }

  const claim = async () => {
    setBusy(true)
    setError(null)
    try {
      await claimPlatformAdmin()
      setClaimed(true)
    } catch (err) {
      setError(
        err?.code === 'permission-denied'
          ? new Error(
              'The bootstrap window rejected this account. It only accepts the one email ' +
                'address named in firestore.rules, and only before the window expires. ' +
                'Check the address you signed in with matches.'
            )
          : err
      )
    } finally {
      setBusy(false)
    }
  }

  const seed = async () => {
    setBusy(true)
    setError(null)
    setLines([])
    setDone(false)
    try {
      const result = await seedFromBrowser({ onLog: (line) => setLines((l) => [...l, line]) })
      setLines(result.log)
      setDone(true)
    } catch (err) {
      if (err?.code === 'permission-denied') {
        setError(
          new Error(
            'Signed in, but this account is not a platform admin yet. Create a document at ' +
              'platformAdmins/' +
              account?.uid +
              ' in the Firebase console, then press Seed again.'
          )
        )
      } else {
        setError(err)
      }
    } finally {
      setBusy(false)
    }
  }

  const copyUid = async () => {
    try {
      await navigator.clipboard.writeText(account.uid)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard blocked — the uid is selectable on screen anyway */
    }
  }

  return (
    <div className="wash min-h-full px-6 py-10">
      <div className="mx-auto w-full max-w-xl">
        <header>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-state-late">
            Dev only &middot; not in production builds
          </p>
          <h1 className="mt-2 font-display text-[36px] leading-none">Seed the live database</h1>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
            Writes both restaurants, their menus, tables and config, and creates one Firebase
            Auth account per staff member &mdash; using only the public web keys. Safe to run
            twice; menus already present are left alone.
          </p>
        </header>

        {/* ---------------- stage one: an account to work as ---------------- */}
        <Step n={1} title="An account" done={Boolean(account)}>
          {!account ? (
            <>
              <p className="text-[13px] leading-relaxed text-ink-soft">
                A new Firebase project has no accounts, so there is nothing to sign in as yet.
                Enter an email and a password and this will create one &mdash; or sign you in,
                if it already exists.
              </p>

              <form onSubmit={authenticate} className="mt-4 space-y-4" noValidate>
                <Field label="Email">
                  <input
                    type="email"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck="false"
                    required
                    value={form.email}
                    onChange={set('email')}
                    placeholder="you@email.com"
                    className={inputClass}
                  />
                </Field>

                <Field
                  label="Password"
                  hint="At least 6 characters. Sent straight to Firebase Auth, never stored."
                >
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
                  {busy ? 'Working…' : 'Create account or sign in'}
                </Button>
              </form>
            </>
          ) : (
            <>
              <p className="text-[13px] leading-relaxed text-ink-soft">
                {account.created ? 'Account created' : 'Signed in'} &mdash; this is the uid you
                need next.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <code className="tabular min-w-0 flex-1 truncate rounded-control border border-line-strong bg-sunken px-3 py-2.5 text-[13px] text-accent">
                  {account.uid}
                </code>
                <Button variant="secondary" onClick={copyUid}>
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </>
          )}
        </Step>

        {/* ------------- stage two: claim through the open window ----------- */}
        <Step n={2} title="Become the platform admin" done={claimed} muted={!account}>
          <p className="text-[13px] leading-relaxed text-ink-soft">
            Writes <code className="rounded bg-raised px-1 py-0.5">platformAdmins/{'{'}uid{'}'}</code>{' '}
            for this account. Possible only through the bootstrap window in the rules, which
            accepts one named email address, only for its own uid, create-only, and expires on
            its own.
          </p>
          <Button
            full
            size="lg"
            variant={claimed ? 'secondary' : undefined}
            className="mt-4"
            disabled={busy || !account || claimed}
            onClick={claim}
          >
            {claimed ? 'Claimed ✓' : busy ? 'Claiming…' : 'Claim platform admin'}
          </Button>
        </Step>

        {/* ---------------------- stage three: go ---------------------------- */}
        <Step n={3} title="Seed" muted={!claimed}>
          <Button full size="lg" disabled={busy || !claimed} onClick={seed}>
            {busy ? 'Seeding…' : 'Seed the database'}
          </Button>
        </Step>

        {error && (
          <div className="mt-5">
            <Banner tone="bad" onDismiss={() => setError(null)}>
              {error}
            </Banner>
          </div>
        )}

        {done && (
          <div className="mt-5">
            <Banner tone="good">
              Seeded. Set USE_MOCK = false in src/data/index.js and restart Vite.
            </Banner>
          </div>
        )}

        {lines.length > 0 && (
          <pre className="mt-4 max-h-[420px] overflow-auto whitespace-pre-wrap rounded-card border border-line bg-sunken p-4 text-[12px] leading-relaxed text-ink-soft">
            {lines.join('\n')}
          </pre>
        )}
      </div>
    </div>
  )
}

function Step({ n, title, children, done, muted }) {
  return (
    <section
      className={`mt-5 rounded-card border p-5 transition-opacity ${
        done ? 'border-state-ok/40 bg-state-ok/5' : 'border-line bg-surface'
      } ${muted ? 'opacity-55' : ''}`}
    >
      <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-faint">
        <span
          className={`grid size-5 place-items-center rounded-full text-[11px] ${
            done ? 'bg-state-ok text-black' : 'bg-raised text-ink-soft'
          }`}
        >
          {done ? '✓' : n}
        </span>
        {title}
      </p>
      {children}
    </section>
  )
}
