import { Link } from 'react-router-dom'
import { RESTAURANT } from '../mock/data'
import { useAuth } from '../auth/context'
import { roleLabel } from '../auth/permissions'

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

  return (
    <div className="wash flex min-h-full flex-col">
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-5 py-12 sm:py-16">
        <header className="text-center">
          <h1 className="font-display text-[54px] leading-none sm:text-[76px]">
            {RESTAURANT.name}
          </h1>
          <p className="mt-3 text-[12px] uppercase tracking-[0.18em] text-ink-faint sm:text-[13px]">
            {RESTAURANT.tagline}
          </p>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-3 sm:mt-14 sm:gap-4 md:grid-cols-2">
          <DoorCard
            to="/customer"
            eyebrow="Dining with us"
            title="View the menu & order"
            body="Pick your table, browse all 171 dishes, and send your order straight to the kitchen."
            cta="Start ordering"
            primary
          />

          <DoorCard
            to="/login"
            eyebrow="For our team"
            title="Staff sign in"
            body="Floor plan, kitchen screen, billing and reports. Sign in with your four-digit code."
            cta={user ? `Continue as ${user.name}` : 'Sign in'}
            hint={user ? roleLabel(user.role) : null}
          />
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

function DoorCard({ to, eyebrow, title, body, cta, hint, primary }) {
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

      {hint && (
        <span className="mt-2 text-center text-[11px] uppercase tracking-[0.06em] text-ink-faint">
          Signed in as {hint}
        </span>
      )}
    </Link>
  )
}
