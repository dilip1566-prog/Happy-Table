/**
 * Email checking, in one place.
 *
 * Deliberately permissive. The only thing a format check can honestly prove
 * is that someone has not typed a table number into an email box — whether
 * the address exists is a question only a sent message can answer. Being
 * stricter than this reliably rejects real addresses, which is a worse
 * failure than letting a typo through to the password step.
 */
const SHAPE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/

export function isValidEmail(value) {
  const trimmed = String(value ?? '').trim()
  if (!trimmed || trimmed.length > 254) return false
  return SHAPE.test(trimmed)
}

export function normaliseEmail(value) {
  return String(value ?? '').trim().toLowerCase()
}
