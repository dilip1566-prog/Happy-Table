/**
 * The password rule, in one place.
 *
 * Three screens ask the same question — the owner setting a temporary one, a
 * new starter choosing their first, somebody resetting a forgotten one — and
 * both backends check it again on the way in. A second copy of "at least
 * eight" is a second thing to forget to change.
 *
 * Deliberately one rule and not five. A character-class checklist pushes
 * people towards Passw0rd! and away from a longer phrase, so length is the
 * only thing enforced; the meter below encourages the rest without blocking
 * anyone at a till mid-shift.
 */
export const PASSWORD_MIN = 8

/** The reason this password is unacceptable, or null if it is fine. */
export function passwordProblem(value) {
  const password = String(value ?? '')
  if (!password) return 'Choose a password.'
  if (password.length < PASSWORD_MIN) {
    return `Use at least ${PASSWORD_MIN} characters — that is ${PASSWORD_MIN - password.length} more.`
  }
  if (password.length > 128) return 'That password is too long.'
  if (password.trim().length === 0) return 'A password cannot be only spaces.'
  return null
}

/**
 * A rough, honest strength hint.
 *
 * Returns a level from 0 to 3 so the bar and the label can never disagree.
 * It is guidance, not a gate — `passwordProblem` is the only thing that
 * refuses anything.
 */
export function scorePassword(value) {
  const password = String(value ?? '')
  if (password.length < PASSWORD_MIN) {
    return { level: 0, label: 'Too short' }
  }

  const classes =
    (/[a-z]/.test(password) ? 1 : 0) +
    (/[A-Z]/.test(password) ? 1 : 0) +
    (/[0-9]/.test(password) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(password) ? 1 : 0)

  if (password.length >= 14 || (password.length >= 12 && classes >= 3)) {
    return { level: 3, label: 'Strong' }
  }
  if (password.length >= 11 || classes >= 3) {
    return { level: 2, label: 'Good' }
  }
  return { level: 1, label: 'Fair — a longer phrase is stronger' }
}

/**
 * A throwaway password nobody is ever told.
 *
 * Firebase Auth has no "create an account with no password", so inviting
 * someone means creating one with a password they will never learn and
 * immediately emailing them a link to choose their own. This generates that
 * placeholder from the platform's CSPRNG — never Math.random, because the
 * window between account creation and the reset is a window where this
 * string is the only thing standing in front of the account.
 */
export function randomPassword() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789-_'
  const bytes = new Uint32Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (n) => alphabet[n % alphabet.length]).join('')
}
