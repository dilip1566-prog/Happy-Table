import { useState } from 'react'
import { formatMoney } from '../../lib/format'
import { Button, DietMark, NutsMark, Sheet, Stepper } from '../../components/ui'

/**
 * Review step.
 *
 * One line per dish — number, name, photo (only if there is one), quantity,
 * amount. A table of nineteen items has to be scannable in a single glance,
 * and a stacked card layout turned that into half a metre of scrolling.
 *
 * Narrow on purpose: a bill is a column of numbers, and stretching it across
 * a desktop screen puts empty space between a dish and its price.
 *
 * One total, no tax breakdown: menu prices are what the guest pays.
 */
export default function CartSheet({ lines, total, submitting, onSetQty, onClose, onSubmit }) {
  const count = lines.reduce((sum, line) => sum + line.qty, 0)
  const [photo, setPhoto] = useState(null)

  return (
    <Sheet
      title={`Your order · ${count} item${count === 1 ? '' : 's'}`}
      onClose={onClose}
      width="max-w-lg"
      footer={
        <>
          <Button
            full
            size="xl"
            variant="confirm"
            disabled={submitting || !lines.length}
            onClick={onSubmit}
          >
            {submitting ? 'Sending…' : `Confirm order · ${formatMoney(total)}`}
          </Button>
          <p className="mt-2 text-center text-[12px] text-ink-faint">
            Added to your table&rsquo;s bill. Settle at the end of the meal.
          </p>
        </>
      }
    >
      <ul className="divide-y divide-line">
        {lines.map((line) => (
          <li key={line.id} className="flex items-center gap-2.5 py-2">
            <span className="tabular w-7 shrink-0 text-[17px] font-bold leading-none text-accent">
              {line.no}
            </span>

            <span className="flex shrink-0 items-center gap-1">
              <DietMark diet={line.diet} size={11} />
              {line.nuts && <NutsMark size={11} />}
            </span>

            <span className="min-w-0 flex-1 truncate text-[14px] font-medium">{line.name}</span>

            {/* Only dishes that actually have a photograph get the button. */}
            {line.image_url && (
              <button
                type="button"
                onClick={() => setPhoto(line)}
                aria-label={`Photo of ${line.name}`}
                className="grid size-7 shrink-0 place-items-center rounded-[7px] bg-raised text-[13px] text-ink-soft transition-colors hover:text-ink"
              >
                ◎
              </button>
            )}

            <Stepper
              value={line.qty}
              onChange={(qty) => onSetQty(line.id, qty)}
              size="xs"
            />

            <span className="tabular w-[62px] shrink-0 text-right text-[15px] font-bold">
              {formatMoney(line.price * line.qty)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-baseline justify-between rounded-card border border-line bg-sunken px-4 py-3">
        <span className="text-[14px] font-semibold">Total</span>
        <span className="tabular text-[24px] font-bold">{formatMoney(total)}</span>
      </div>

      {photo && (
        <button
          onClick={() => setPhoto(null)}
          className="fixed inset-0 z-[60] grid place-items-center bg-black/85 p-6"
          aria-label="Close photo"
        >
          <figure className="max-w-sm">
            <img
              src={photo.image_url}
              alt={photo.name}
              className="w-full rounded-card object-cover"
            />
            <figcaption className="mt-3 text-center text-[14px] text-ink-soft">
              {photo.no} &middot; {photo.name}
            </figcaption>
          </figure>
        </button>
      )}
    </Sheet>
  )
}
