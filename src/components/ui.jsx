/**
 * SERVICE — component primitives.
 *
 * Sizing rule: front of house never goes below a 44px touch target; kitchen
 * controls start at 56px, because they are hit with the side of a hand, at
 * speed, sometimes through a glove.
 */

const cx = (...parts) => parts.filter(Boolean).join(' ')

// ---------------------------------------------------------------------------
// Buttons
// ---------------------------------------------------------------------------

const VARIANTS = {
  primary: 'bg-accent text-white hover:bg-accent-hover shadow-raise',
  secondary: 'bg-surface text-ink border border-line-strong hover:bg-sunken',
  quiet: 'bg-sunken text-ink-soft hover:bg-line',
  danger: 'bg-state-late text-white hover:brightness-95',
  ready: 'bg-state-ready text-white hover:brightness-95',
  // The one irreversible step a guest takes. Green rather than the accent, so
  // committing an order never looks like the navigation next to it — and dark
  // text on the green, because white on it falls under 3:1.
  confirm: 'bg-state-ready text-canvas font-bold hover:brightness-110 shadow-float',
  fire: 'bg-state-fire text-white hover:brightness-95',
  dark: 'bg-kds-raised text-kds-ink border border-kds-line hover:bg-kds-line',
}

const SIZES = {
  sm: 'h-9 px-3 text-[13px] rounded-[8px]',
  md: 'h-11 px-4 text-sm rounded-control',
  lg: 'h-13 px-5 text-[15px] rounded-control',
  xl: 'h-16 px-6 text-base rounded-card',
}

export function Button({
  variant = 'primary',
  size = 'md',
  full,
  className,
  children,
  ...props
}) {
  return (
    <button
      {...props}
      className={cx(
        'inline-flex items-center justify-center gap-2 font-semibold tracking-[-0.01em]',
        'transition-all duration-150 active:scale-[0.98]',
        'disabled:pointer-events-none disabled:opacity-40',
        VARIANTS[variant],
        SIZES[size],
        full && 'w-full',
        className
      )}
    >
      {children}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Surfaces
// ---------------------------------------------------------------------------

export function Card({ as: Tag = 'div', className, children, ...props }) {
  return (
    <Tag
      {...props}
      className={cx(
        'rounded-card border border-line bg-surface shadow-raise',
        className
      )}
    >
      {children}
    </Tag>
  )
}

export function SectionTitle({ children, hint, action }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-[17px] font-semibold tracking-[-0.02em]">{children}</h2>
        {hint && <p className="mt-0.5 text-[13px] text-ink-faint">{hint}</p>}
      </div>
      {action}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

const STATE_TOKENS = {
  pending: { label: 'New', fg: 'text-state-new', bg: 'bg-state-new-bg', dot: 'bg-state-new' },
  preparing: { label: 'On', fg: 'text-state-fire', bg: 'bg-state-fire-bg', dot: 'bg-state-fire' },
  ready: { label: 'Ready', fg: 'text-state-ready', bg: 'bg-state-ready-bg', dot: 'bg-state-ready' },
  available: { label: 'Open', fg: 'text-ink-faint', bg: 'bg-sunken', dot: 'bg-line-strong' },
  pending_approval: {
    label: 'Waiting',
    fg: 'text-state-new',
    bg: 'bg-state-new-bg',
    dot: 'bg-state-new',
  },
  occupied: { label: 'Seated', fg: 'text-state-fire', bg: 'bg-state-fire-bg', dot: 'bg-state-fire' },
  active: { label: 'Open', fg: 'text-state-ready', bg: 'bg-state-ready-bg', dot: 'bg-state-ready' },
}

export function Status({ value, className }) {
  const token = STATE_TOKENS[value] ?? STATE_TOKENS.available
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em]',
        token.bg,
        token.fg,
        className
      )}
    >
      <span className={cx('size-1.5 rounded-full', token.dot)} />
      {token.label}
    </span>
  )
}

/**
 * Diet mark. Bobby's kitchen is entirely vegetarian, so the useful
 * distinction is vegan vs vegetarian — not veg vs non-veg. The square-and-dot
 * keeps the familiar statutory shape; vegan gets a ring to read differently
 * at a glance and to survive being printed in mono.
 */
export function DietMark({ diet, size = 14 }) {
  const vegan = diet === 'vegan'
  const color = vegan ? 'var(--color-vegan)' : 'var(--color-veg)'
  return (
    <span
      aria-label={vegan ? 'Vegan' : 'Vegetarian'}
      title={vegan ? 'Vegan' : 'Vegetarian'}
      className="inline-grid shrink-0 place-items-center rounded-[3px] border-[1.5px]"
      style={{ width: size, height: size, borderColor: color }}
    >
      <span
        className={cx('rounded-full', vegan && 'border-[1.5px] bg-transparent')}
        style={
          vegan
            ? { width: size * 0.5, height: size * 0.5, borderColor: color }
            : { width: size * 0.42, height: size * 0.42, background: color }
        }
      />
    </span>
  )
}

/**
 * Allergen, kept deliberately separate from the diet mark. "Contains nuts" is
 * a safety question, not a preference, and collapsing the two into one symbol
 * is how people get hurt.
 */
export function NutsMark({ size = 14 }) {
  return (
    <span
      aria-label="Contains nuts"
      title="Contains nuts"
      className="inline-grid shrink-0 place-items-center rounded-full border-[1.5px] font-bold"
      style={{
        width: size,
        height: size,
        borderColor: 'var(--color-nuts)',
        color: 'var(--color-nuts)',
        fontSize: size * 0.62,
        lineHeight: 1,
      }}
    >
      N
    </span>
  )
}

export function NewBadge() {
  return (
    <span className="rounded-pill bg-accent/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.07em] text-accent">
      New
    </span>
  )
}

export function WeekendBadge() {
  return (
    <span
      title="Weekend special"
      className="rounded-pill bg-state-new-bg px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.07em] text-state-new"
    >
      Weekend
    </span>
  )
}

/** The full mark row, so every surface shows allergens the same way. */
export function DishMarks({ item, size = 13 }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <DietMark diet={item.diet} size={size} />
      {item.nuts && <NutsMark size={size} />}
      {item.isNew && <NewBadge />}
      {item.weekend && <WeekendBadge />}
    </span>
  )
}

/**
 * Dish photography with a real fallback.
 *
 * Missing images are the normal case here — the menu ships with none. A blank
 * square reads as a bug; a monogram tile reads as "no photo yet", which is
 * the truth, and it upgrades silently the day real photography arrives.
 */
export function DishImage({ src, name, className, dim }) {
  const initial = (name || '?').trim().charAt(0).toUpperCase()

  return (
    <div className={cx('relative overflow-hidden bg-raised', className)}>
      <span
        aria-hidden="true"
        className="absolute inset-0 grid place-items-center font-display text-ink-faint/50"
        style={{ fontSize: '1.6em' }}
      >
        {initial}
      </span>
      {src && (
        <img
          src={src}
          alt={name}
          loading="lazy"
          className={cx('relative size-full object-cover', dim && 'opacity-40 grayscale')}
          onError={(event) => {
            event.currentTarget.style.display = 'none'
          }}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Feedback
// ---------------------------------------------------------------------------

export function Spinner({ label, dark }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cx(
        'flex items-center gap-2.5 text-[13px]',
        dark ? 'text-kds-ink-soft' : 'text-ink-faint'
      )}
    >
      <span
        className={cx(
          'size-4 animate-spin rounded-full border-2 border-t-transparent',
          dark ? 'border-kds-line' : 'border-line-strong'
        )}
      />
      {label}
    </div>
  )
}

export function Empty({ icon, title, hint, action, dark }) {
  return (
    <div
      className={cx(
        'wash grid place-items-center rounded-card border border-dashed px-6 py-14 text-center',
        dark ? 'border-kds-line' : 'border-line-strong'
      )}
    >
      {icon && <div className="mb-3 text-3xl opacity-60">{icon}</div>}
      <p className={cx('font-medium', dark ? 'text-kds-ink' : 'text-ink')}>{title}</p>
      {hint && (
        <p className={cx('mt-1 max-w-xs text-[13px]', dark ? 'text-kds-ink-soft' : 'text-ink-faint')}>
          {hint}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Banner({ tone = 'info', children, onDismiss }) {
  if (!children) return null
  const tones = {
    info: 'border-line bg-sunken text-ink-soft',
    good: 'border-state-ready/25 bg-state-ready-bg text-state-ready',
    bad: 'border-state-late/25 bg-state-late-bg text-state-late',
  }
  return (
    <div
      className={cx(
        'rise flex items-start justify-between gap-3 rounded-control border px-4 py-3 text-[13px]',
        tones[tone]
      )}
    >
      <span>{typeof children === 'string' ? children : children?.message ?? children}</span>
      {onDismiss && (
        <button onClick={onDismiss} aria-label="Dismiss" className="shrink-0 opacity-60">
          &times;
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[12px] text-ink-faint">{hint}</span>}
    </label>
  )
}

export const inputClass =
  'w-full rounded-control border border-line-strong bg-surface px-3.5 h-11 text-[15px] text-ink placeholder:text-ink-faint outline-none transition-colors focus:border-accent'

const STEPPER_SIZES = {
  xs: { box: 'size-7 text-[15px]', count: 'w-5 text-[13px]' },
  sm: { box: 'size-9 text-base', count: 'w-6 text-sm' },
  md: { box: 'size-11 text-lg', count: 'w-8' },
}

export function Stepper({ value, onChange, min = 0, compact, size }) {
  const button =
    'grid place-items-center rounded-[8px] bg-raised text-ink transition-colors hover:bg-line-strong active:scale-95 disabled:opacity-30'
  const scale = STEPPER_SIZES[size ?? (compact ? 'sm' : 'md')]
  const box = scale.box

  // At one, stepping down removes the line. Say so, rather than hiding a
  // delete behind a minus sign.
  const removing = value <= min + 1

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label={removing ? 'Remove' : 'Decrease'}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        className={cx(
          button,
          box,
          removing && 'bg-state-late-bg text-state-late hover:bg-state-late/25'
        )}
      >
        {removing ? '×' : '−'}
      </button>
      <span className={cx('tabular text-center font-semibold', scale.count)}>{value}</span>
      <button
        type="button"
        aria-label="Increase"
        onClick={() => onChange(value + 1)}
        className={cx(button, box)}
      >
        +
      </button>
    </div>
  )
}

export function Switch({ checked, onChange, label, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx(
        'relative h-8 w-14 shrink-0 rounded-pill transition-colors disabled:opacity-40',
        checked ? 'bg-state-ready' : 'bg-line-strong'
      )}
    >
      <span
        className={cx(
          'absolute top-1 size-6 rounded-full bg-white shadow-raise transition-all duration-200',
          checked ? 'left-7' : 'left-1'
        )}
      />
    </button>
  )
}

// ---------------------------------------------------------------------------
// Data display
// ---------------------------------------------------------------------------

export function Stat({ label, value, tone }) {
  const tones = {
    new: 'text-state-new',
    fire: 'text-state-fire',
    ready: 'text-state-ready',
    late: 'text-state-late',
    clear: 'text-state-clear',
  }
  return (
    <div className="rounded-card border border-line bg-surface px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-faint">
        {label}
      </p>
      <p className={cx('tabular mt-1 text-2xl font-semibold tracking-[-0.02em]', tone && tones[tone])}>
        {value}
      </p>
    </div>
  )
}

/** Bottom sheet, used for the cart and any confirm step on mobile. */
export function Sheet({ title, onClose, children, footer, width = 'max-w-md' }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:p-6">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cx(
          'sheet-up relative mx-auto flex w-full flex-col overflow-hidden border border-line bg-canvas shadow-sheet',
          'max-h-[86vh] rounded-t-[22px] sm:max-h-[82vh] sm:rounded-[18px]',
          width
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-[17px] font-semibold tracking-[-0.02em]">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 place-items-center rounded-full bg-sunken text-lg text-ink-soft"
          >
            &times;
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">{children}</div>
        {footer && (
          <div className="border-t border-line bg-surface px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export { cx }
