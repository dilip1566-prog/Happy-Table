/**
 * Matching the name a guest types against the one the waiter wrote down.
 *
 * The name is the second half of the table code: the waiter takes a first
 * name, the app draws a code, and the guest types both. One without the
 * other does not open a tab, so a code overheard across the room is not
 * enough to order on somebody else's bill.
 *
 * That only works if the matching is forgiving about the things people get
 * wrong without meaning to, and strict about the thing that matters. A
 * waiter types "Shayan Patel" and the guest types "shayan"; a waiter types
 * "José" and the guest's keyboard has no accent. Both should pass. A
 * different name should not.
 *
 * It is deliberately NOT a fuzzy match. "Shayaan" does not open "Shayan",
 * because a near-miss that silently passes is worse than a clear refusal
 * the guest can resolve by asking the waiter how they spelled it.
 */

/** Lower-case, unaccented, single-spaced. */
export function normaliseName(value) {
  return String(value ?? '')
    .normalize('NFD')
    // Strip combining accents: José -> Jose, Müller -> Muller.
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** The part people actually say when asked for a name. */
const firstWord = (value) => normaliseName(value).split(' ')[0] ?? ''

/**
 * Does what the guest typed match the party?
 *
 * Compared on the first word either way, so it does not matter whether the
 * waiter recorded a surname and the guest did not — or the reverse.
 */
export function nameMatches(typed, onFile) {
  const a = firstWord(typed)
  const b = firstWord(onFile)
  if (!a || !b) return false
  if (a === b) return true

  // Whole string too, for the party recorded as one word with a space in it
  // — "mary ann" typed against "Mary Ann".
  return normaliseName(typed) === normaliseName(onFile)
}
