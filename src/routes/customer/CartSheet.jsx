import { useState } from 'react'
import { formatMoney } from '../../lib/format'
import { Button, DietMark, NutsMark, Sheet, Stepper } from '../../components/ui'

const NOTE_LIMIT = 500

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
export default function CartSheet({
  payerLabel,
  partyName,
  tableNumber,
  lines,
  total,
  note = '',
  submitting,
  onSetQty,
  onSetNote,
  onClose,
  onSubmit,
}) {
  const count = lines.reduce((sum, line) => sum + line.qty, 0)
  const [photo, setPhoto] = useState(null)

  return (
    <Sheet
      title={
        tableNumber
          ? `${payerLabel ?? partyName ?? 'Your order'} · Table No ${tableNumber}`
          : `Your order · ${count} item${count === 1 ? '' : 's'}`
      }
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

          {/*
            Named rather than left to the × in the corner. Sending the order
            and going back for more are both ordinary things to want here,
            and only one of them was previously spelled out.
          */}
          <Button
            full
            size="lg"
            variant="secondary"
            className="mt-2"
            disabled={submitting}
            onClick={onClose}
          >
            Continue ordering
          </Button>

          <p className="tabular mt-2 text-center text-[12px] text-ink-faint">
            {count} item{count === 1 ? '' : 's'}
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

      {/*
        One box for the whole order, spelled out rather than hidden behind an
        icon. Asking for a change to the food is a normal part of ordering, so
        the place to ask is visible without being hunted for.
      */}
      <div className="mt-5">
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
            Any special requirements
          </span>
          <textarea
            rows={3}
            maxLength={NOTE_LIMIT}
            value={note}
            onChange={(event) => onSetNote(event.target.value)}
            placeholder="No chilli in the lasagne, one portion mild for a child, extra napkins…"
            className="w-full resize-y rounded-control border border-line-strong bg-sunken px-3.5 py-2.5 text-[15px] leading-relaxed text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-accent"
          />
        </label>

        <div className="mt-1 flex items-baseline justify-between gap-3">
          <p className="text-[12px] leading-relaxed text-ink-faint">
            The kitchen sees this with your order. For a serious allergy please
            tell your waiter as well.
          </p>
          <span
            className={`tabular shrink-0 text-[11px] ${
              note.length >= NOTE_LIMIT ? 'text-state-late' : 'text-ink-faint'
            }`}
          >
            {note.length}/{NOTE_LIMIT}
          </span>
        </div>
      </div>

      {payerLabel && (
        <p className="mt-3 rounded-card border border-line bg-sunken px-4 py-2.5 text-[12px] leading-relaxed text-ink-faint">
          This goes on <strong className="text-ink-soft">{payerLabel}</strong>&rsquo;s
          bill &mdash; you only pay for what you order here.
        </p>
      )}

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
