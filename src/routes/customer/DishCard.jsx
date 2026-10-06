import { formatMoney } from '../../lib/format'
import { DishMarks, DishImage, Stepper } from '../../components/ui'

/**
 * A menu row.
 *
 * Text-forward by default. With 171 dishes and no photography, a typographic
 * list is not a compromise — it is how a menu of this length is actually read,
 * and it scans far faster than 171 placeholder tiles would. The image slot
 * appears only when a dish genuinely has a photograph, so the layout upgrades
 * itself as real photography arrives rather than needing a rebuild.
 *
 * Sold out is signalled three ways at once — dimmed text, struck price and an
 * explicit label — so it never depends on colour alone.
 */
export default function DishCard({ item, qty, soldOut, onSetQty }) {
  const hasImage = Boolean(item.image_url)

  return (
    <article
      className={`group relative flex gap-3 rounded-card border p-3 transition-colors sm:p-3.5 ${
        soldOut
          ? 'border-line bg-sunken'
          : qty > 0
            ? 'border-accent/45 bg-accent-wash'
            : 'border-line bg-surface hover:border-line-strong'
      }`}
    >
      {hasImage && (
        <DishImage
          src={item.image_url}
          name={item.name}
          dim={soldOut}
          className="size-[76px] shrink-0 rounded-[11px] sm:size-[88px]"
        />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {/* The number is how staff and guests refer to a dish out loud,
                so it is set as large as the price and given the accent. */}
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <span
                className={`tabular text-[22px] font-bold leading-none tracking-[-0.02em] ${
                  soldOut ? 'text-ink-faint' : 'text-accent'
                }`}
              >
                {item.no}
              </span>
              <DishMarks item={item} />
            </div>

            <h3
              className={`text-[17px] font-semibold leading-snug tracking-[-0.01em] ${
                soldOut ? 'text-ink-faint' : 'text-ink'
              }`}
            >
              {item.name}
            </h3>
          </div>

          <span
            className={`tabular shrink-0 text-[22px] font-bold leading-none tracking-[-0.02em] ${
              soldOut ? 'text-ink-faint line-through' : 'text-ink'
            }`}
          >
            {formatMoney(item.price)}
          </span>
        </div>

        {item.description && (
          <p
            className={`mt-1.5 text-[13px] leading-relaxed ${
              soldOut ? 'text-ink-faint/70' : 'text-ink-soft'
            }`}
          >
            {item.description}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between gap-3">
          {soldOut ? (
            <span className="rounded-pill bg-state-late-bg px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-state-late">
              Sold out
            </span>
          ) : (
            <span className="text-[12px] text-ink-faint">
              {qty > 0 ? `${qty} in order` : ''}
            </span>
          )}

          {soldOut ? (
            <span className="text-[12px] font-medium text-ink-faint">Unavailable</span>
          ) : qty > 0 ? (
            <Stepper value={qty} onChange={onSetQty} compact />
          ) : (
            <button
              onClick={() => onSetQty(1)}
              aria-label={`Add ${item.name}`}
              className="h-9 rounded-[8px] bg-accent px-4 text-[13px] font-semibold text-white transition-all hover:bg-accent-hover active:scale-95"
            >
              Add
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
