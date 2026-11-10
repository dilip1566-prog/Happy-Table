/**
 * Turning a pasted menu into dishes.
 *
 * Onboarding a restaurant means retyping their menu, and that is the single
 * biggest cost in getting one live. Every one of them already has the list
 * in a spreadsheet, so the fastest import is the one that accepts a paste
 * straight out of it.
 *
 * The hard part is that no two of those spreadsheets agree on column order.
 * One has `name, price`; the next has `no, name, description, price`; the
 * one after that puts the section in a column and the diet in a symbol.
 * A fixed column order fails on almost all of them, and it fails *quietly* —
 * the name lands in the price column and every row is rejected for a reason
 * that is true but useless.
 *
 * So nothing here is positional. Columns are detected from their contents
 * (and from a header row where there is one), the guess is shown, and the
 * person importing can correct it. Guessing is a convenience; the mapping is
 * the contract.
 *
 * Nothing throws. A bad row comes back as a row carrying its `problem`, so
 * the preview can show twelve good dishes and one that needs a look rather
 * than refusing the whole paste over a stray line.
 */

export const DIETS = ['veg', 'vegan', 'non-veg']

/** What a column can be. `ignore` is first because it is a real answer. */
export const COLUMN_ROLES = [
  { id: 'ignore', label: 'Ignore' },
  { id: 'no', label: 'Dish number' },
  { id: 'name', label: 'Dish name' },
  { id: 'price', label: 'Price' },
  { id: 'category', label: 'Section' },
  { id: 'description', label: 'Description' },
  { id: 'diet', label: 'Diet' },
]

export const ASSIGNABLE_ROLES = COLUMN_ROLES.filter((role) => role.id !== 'ignore').map(
  (role) => role.id
)

const DIET_WORDS = {
  v: 'veg',
  veg: 'veg',
  vegetarian: 'veg',
  vegi: 'veg',
  veggie: 'veg',
  vg: 'vegan',
  vegan: 'vegan',
  plant: 'vegan',
  'plant-based': 'vegan',
  n: 'non-veg',
  nv: 'non-veg',
  'non-veg': 'non-veg',
  nonveg: 'non-veg',
  'non veg': 'non-veg',
  'non vegetarian': 'non-veg',
  'non-vegetarian': 'non-veg',
  meat: 'non-veg',
  chicken: 'non-veg',
  lamb: 'non-veg',
  fish: 'non-veg',
  seafood: 'non-veg',
}

// ---------------------------------------------------------------------------
// Splitting
// ---------------------------------------------------------------------------

/**
 * Split one line, respecting double quotes.
 *
 * Needed because descriptions contain commas far more often than not —
 * "Layers of vegetables and pasta, topped with cheese" is one field, and a
 * naive split turns it into two and shunts every later column along by one.
 */
function splitLine(line, delimiter) {
  if (delimiter === SPACES) return line.trim().split(/ {2,}/)

  const fields = []
  let current = ''
  let quoted = false

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]

    if (char === '"') {
      // A doubled quote inside a quoted field is an escaped quote, which is
      // how spreadsheets export a literal " — "6"" pizza" is one field.
      if (quoted && line[i + 1] === '"') {
        current += '"'
        i += 1
      } else {
        quoted = !quoted
      }
      continue
    }

    if (char === delimiter && !quoted) {
      fields.push(current)
      current = ''
      continue
    }

    current += char
  }

  fields.push(current)
  return fields
}

/** Sentinel for "columns are separated by runs of spaces". */
const SPACES = '\u0000spaces'

/**
 * Which character separates the columns.
 *
 * Tabs win outright: a tab anywhere means the paste came from a spreadsheet,
 * and guessing per line would break the moment one description had no comma.
 * Runs of two or more spaces are the last resort, for a paste out of a PDF
 * or a Word table where the columns were only ever lined up visually.
 */
function delimiterFor(text) {
  if (text.includes('\t')) return '\t'
  if (text.includes(',')) return ','
  if (/ {2,}/.test(text)) return SPACES
  return ','
}

export const DELIMITER_LABEL = {
  '\t': 'tabs',
  ',': 'commas',
  [SPACES]: 'spacing',
}

// ---------------------------------------------------------------------------
// Reading values
// ---------------------------------------------------------------------------

/** Accepts "£4.50", "4,50", "4.50 ", "12.95*" and plain 4.5. */
export function parsePrice(raw) {
  const cleaned = String(raw ?? '')
    .replace(/[£$€\s*]/g, '')
    // A lone comma in a price is a decimal separator, not a thousands mark —
    // nobody's starter costs four thousand pounds.
    .replace(/,(\d{1,2})$/, '.$1')
    .replace(/,/g, '')
  if (!cleaned) return null
  const value = Number(cleaned)
  return Number.isFinite(value) ? value : null
}

function parseDiet(raw) {
  const word = String(raw ?? '')
    .toLowerCase()
    .trim()
  if (!word) return null
  if (DIET_WORDS[word]) return DIET_WORDS[word]
  if (DIETS.includes(word)) return word
  return null
}

/** "Rishi's Rekdi" -> "rishi-s-rekdi", matching the ids already in the menus. */
export function slugifyCategory(label) {
  return String(label)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}

// ---------------------------------------------------------------------------
// The grid
// ---------------------------------------------------------------------------

const HEADER_PATTERNS = [
  [/^(#|no\.?|num(ber)?|s\.?\s?no\.?|sr\.?|item\s*no)$/i, 'no'],
  [/(dish|item|name|product|title)/i, 'name'],
  [/(price|cost|amount|rate|£|\$|€)/i, 'price'],
  [/(categor|section|menu|group|course|type of)/i, 'category'],
  [/(desc|detail|about|ingredient|note)/i, 'description'],
  [/(diet|veg|allerg)/i, 'diet'],
]

function headerRole(label) {
  const text = String(label ?? '').trim()
  if (!text) return null
  for (const [pattern, role] of HEADER_PATTERNS) {
    if (pattern.test(text)) return role
  }
  return null
}

/** Does this line look like column headings rather than a dish? */
function looksLikeHeader(fields) {
  const roles = fields.map(headerRole).filter(Boolean)
  if (roles.length < 2) return false
  // A heading row never has a readable price in it. This is the test that
  // stops "Samosas, 4.50" being mistaken for a header because "Samosas"
  // happens to contain no digits.
  return !fields.some((field) => parsePrice(field) !== null && /\d/.test(field))
}

/**
 * Pasted text as a grid: a header if there is one, and the dish rows.
 *
 * Ragged rows are padded, because a trailing empty column is dropped by most
 * exports and a short row would otherwise shift the mapping for that line
 * alone.
 */
export function parseGrid(text) {
  const source = String(text ?? '')
  const delimiter = delimiterFor(source)
  const lines = source.split(/\r?\n/)

  const parsed = []
  lines.forEach((line, index) => {
    if (!line.trim()) return
    parsed.push({ line: index + 1, fields: splitLine(line, delimiter).map((f) => f.trim()) })
  })

  let header = null
  if (parsed.length && looksLikeHeader(parsed[0].fields)) {
    header = parsed.shift().fields
  }

  const width = parsed.reduce(
    (widest, row) => Math.max(widest, row.fields.length),
    header?.length ?? 0
  )
  for (const row of parsed) {
    while (row.fields.length < width) row.fields.push('')
  }

  return { delimiter, header, rows: parsed, width }
}

// ---------------------------------------------------------------------------
// Guessing what each column is
// ---------------------------------------------------------------------------

function columnStats(grid, index) {
  const values = grid.rows.map((row) => row.fields[index] ?? '').filter((v) => v !== '')
  const total = values.length || 1

  const prices = values.filter((v) => parsePrice(v) !== null)
  const decimals = values.filter((v) => /\d[.,]\d{1,2}\s*$/.test(v) || /[£$€]/.test(v))
  const integers = values.filter((v) => /^\d{1,4}$/.test(v))
  const diets = values.filter((v) => parseDiet(v) !== null)
  const lengths = values.map((v) => v.length)

  return {
    filled: values.length / (grid.rows.length || 1),
    priceRatio: prices.length / total,
    decimalRatio: decimals.length / total,
    integerRatio: integers.length / total,
    dietRatio: diets.length / total,
    avgLength: lengths.reduce((sum, n) => sum + n, 0) / total,
    distinctRatio: new Set(values.map((v) => v.toLowerCase())).size / total,
    values,
  }
}

/**
 * A first guess at which column is which.
 *
 * Header names win where they exist, because a person wrote them down on
 * purpose. Everything else is read off the contents, in an order chosen so
 * that the unambiguous columns are claimed before the ambiguous ones: a
 * price column is obvious, a description is only obvious once the name has
 * been taken.
 */
export function guessMapping(grid) {
  const mapping = {
    no: null,
    name: null,
    price: null,
    category: null,
    description: null,
    diet: null,
  }
  if (!grid.width) return mapping

  const taken = new Set()
  const claim = (role, index) => {
    if (index == null || taken.has(index) || mapping[role] != null) return
    mapping[role] = index
    taken.add(index)
  }

  if (grid.header) {
    grid.header.forEach((label, index) => claim(headerRole(label), index))
  }

  const stats = Array.from({ length: grid.width }, (_, index) => columnStats(grid, index))
  const free = () =>
    stats.map((s, index) => ({ ...s, index })).filter((s) => !taken.has(s.index))

  // Price: numbers, and preferably with a decimal or a currency symbol. The
  // rightmost wins a tie, because a trailing price column is far more common
  // than a leading one.
  if (mapping.price == null) {
    const candidates = free()
      .filter((s) => s.priceRatio >= 0.6)
      .sort(
        (a, b) =>
          b.decimalRatio - a.decimalRatio ||
          a.integerRatio - b.integerRatio ||
          b.index - a.index
      )
    claim('price', candidates[0]?.index)
  }

  // Dish number: plain small integers, almost all different, and sitting to
  // the left of the price. Claimed after price so a column of whole-pound
  // prices is not mistaken for it.
  if (mapping.no == null) {
    const candidate = free()
      .filter((s) => s.integerRatio >= 0.9 && s.distinctRatio >= 0.9 && s.avgLength <= 4)
      .sort((a, b) => a.index - b.index)[0]
    claim('no', candidate?.index)
  }

  if (mapping.diet == null) {
    const candidate = free()
      .filter((s) => s.dietRatio >= 0.6 && s.avgLength <= 16)
      .sort((a, b) => b.dietRatio - a.dietRatio)[0]
    claim('diet', candidate?.index)
  }

  // Name: the leftmost column of real text left standing.
  if (mapping.name == null) {
    const candidate = free()
      .filter((s) => s.avgLength >= 2 && s.filled >= 0.6)
      .sort((a, b) => a.index - b.index)[0]
    claim('name', candidate?.index)
  }

  // Description: the wordiest column left. Only if it is clearly wordier
  // than a name, or every two-column paste gains a description that is
  // really a section.
  if (mapping.description == null) {
    const candidate = free()
      .filter((s) => s.avgLength >= 25)
      .sort((a, b) => b.avgLength - a.avgLength)[0]
    claim('description', candidate?.index)
  }

  // Section: short text that repeats. Repetition is the whole signal — a
  // menu has forty dishes and six sections.
  if (mapping.category == null) {
    const candidate = free()
      .filter((s) => s.filled >= 0.5 && s.avgLength <= 30 && s.distinctRatio <= 0.6)
      .sort((a, b) => a.distinctRatio - b.distinctRatio)[0]
    claim('category', candidate?.index)
  }

  return mapping
}

/** Set one column's role, taking it off whatever held it before. */
export function assignRole(mapping, columnIndex, role) {
  const next = { ...mapping }
  for (const key of Object.keys(next)) {
    if (next[key] === columnIndex) next[key] = null
  }
  if (role && role !== 'ignore') next[role] = columnIndex
  return next
}

/** What this column is currently used for. */
export function roleOfColumn(mapping, columnIndex) {
  return (
    Object.keys(mapping).find((role) => mapping[role] === columnIndex) ?? 'ignore'
  )
}

// ---------------------------------------------------------------------------
// Building the dishes
// ---------------------------------------------------------------------------

/**
 * Apply a mapping to the grid.
 *
 * Returns every row, good and bad, in the order pasted, each carrying its
 * source line number so the preview can point at the line that needs fixing.
 */
export function buildRows(grid, mapping, { fallbackCategory = 'mains', fallbackLabel = '' } = {}) {
  const at = (fields, role) => (mapping[role] == null ? '' : (fields[mapping[role]] ?? ''))

  return grid.rows.map(({ line, fields }) => {
    const name = at(fields, 'name').trim()
    const rawPrice = at(fields, 'price')
    const price = parsePrice(rawPrice)
    const categoryLabel = at(fields, 'category').trim()
    const noValue = Number(at(fields, 'no'))

    const row = {
      line,
      name,
      price,
      no: Number.isInteger(noValue) && noValue > 0 ? noValue : null,
      categoryLabel: categoryLabel || fallbackLabel,
      category: categoryLabel ? slugifyCategory(categoryLabel) : fallbackCategory,
      description: at(fields, 'description').trim(),
      diet: parseDiet(at(fields, 'diet')) ?? 'veg',
      problem: null,
    }

    if (!name) row.problem = mapping.name == null ? 'No column set as the dish name' : 'No dish name'
    else if (mapping.price == null) row.problem = 'No column set as the price'
    else if (price === null) row.problem = rawPrice ? `“${rawPrice}” is not a price` : 'No price'
    else if (price < 0) row.problem = 'Price is negative'
    else if (price > 1000) row.problem = 'Price looks wrong'

    return row
  })
}

/** The rows worth committing. */
export const usableRows = (rows) => rows.filter((row) => !row.problem)

/**
 * Sections in the paste that the restaurant does not have yet.
 *
 * Returned rather than created silently: a typo in one row would otherwise
 * invent a section called "Startes" and quietly file a dish under it, where
 * nobody looking at the menu would ever find it.
 */
export function newCategoriesIn(rows, existing = []) {
  const known = new Set(existing.map((category) => category.id))
  const found = new Map()

  for (const row of usableRows(rows)) {
    if (!row.categoryLabel) continue
    if (known.has(row.category) || found.has(row.category)) continue
    found.set(row.category, { id: row.category, label: row.categoryLabel })
  }

  return [...found.values()]
}

/** A worked example, shown in the importer so nobody has to guess the shape. */
export const MENU_PASTE_EXAMPLE = [
  'Samosas (3), 4.50, Starters, Crispy pastry with spiced potato and peas, vegan',
  'Paneer Tikka, 7.25, Starters, Charred paneer with peppers and onion, veg',
  'Chicken Karahi, 11.50, Mains, Slow-cooked in tomato and ginger, non-veg',
].join('\n')
