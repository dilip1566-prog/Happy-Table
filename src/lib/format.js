export const CURRENCY = 'GBP'
export const LOCALE = 'en-GB'

// Two decimals: a menu priced at 6.75 must not round to 7 on the bill.
const money = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export const formatMoney = (amount) => money.format(Number(amount) || 0)

/** Firestore Timestamp | Date | ISO string | null -> Date | null */
export function toDate(value) {
  if (!value) return null
  if (typeof value.toDate === 'function') return value.toDate()
  if (value instanceof Date) return value
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function formatTime(value) {
  const date = toDate(value)
  if (!date) return '--:--'
  return date.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function minutesSince(value) {
  const date = toDate(value)
  if (!date) return 0
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000))
}

/** "12:04" elapsed clock for KDS tickets. */
export function elapsedClock(value) {
  const date = toDate(value)
  if (!date) return '0:00'
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000))
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export const orderTotal = (order) =>
  (order.items || []).reduce((sum, line) => sum + Number(line.price) * Number(line.qty), 0)

export const countItems = (order) =>
  (order.items || []).reduce((sum, line) => sum + Number(line.qty), 0)

/**
 * Ticket urgency, driven by the quoted prep time where one exists and by a
 * flat threshold where it does not. Drives the only red in the KDS.
 */
export function ticketUrgency(order) {
  const age = minutesSince(order.created_at)
  const quoted = order.prep_time_minutes
  if (quoted) {
    if (age >= quoted) return 'late'
    if (age >= quoted * 0.75) return 'due'
    return 'fine'
  }
  if (age >= 12) return 'late'
  if (age >= 7) return 'due'
  return 'fine'
}

