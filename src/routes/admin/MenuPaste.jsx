import { useMemo, useState } from 'react'
import {
  COLUMN_ROLES,
  DELIMITER_LABEL,
  MENU_PASTE_EXAMPLE,
  assignRole,
  buildRows,
  guessMapping,
  newCategoriesIn,
  parseGrid,
  roleOfColumn,
  slugifyCategory,
  usableRows,
} from '../../lib/menuImport'
import { formatMoney } from '../../lib/format'
import { inputClass } from '../../components/ui'

/**
 * Paste a menu in, check what we understood, then commit.
 *
 * The two halves below exist for the two ways this goes wrong, and they are
 * different problems.
 *
 * The preview catches bad *values* — a price with a typo, a missing name.
 * The column mapper catches a bad *reading*, which is the far commoner and
 * far nastier failure: no two restaurants' spreadsheets have the same column
 * order, so a fixed order gets one of them right and silently shreds the
 * rest. Before the mapper existed, a paste shaped `no, name, description,
 * price` reported "price is not a number" on every single row — true, and
 * completely useless, because the real problem was two columns to the left.
 *
 * So the reading is shown as a thing you can see and change, and the
 * detection is only ever a first guess.
 */
export function MenuPaste({ paste, categories = [] }) {
  const { text, setText, grid, mapping, setRole, rows, fallback, setFallback } = paste

  const good = useMemo(() => usableRows(rows), [rows])
  const bad = useMemo(() => rows.filter((row) => row.problem), [rows])
  const fresh = useMemo(() => newCategoriesIn(rows, categories), [rows, categories])

  const needsSection = grid.width > 0 && mapping.category == null

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
          Paste from a spreadsheet
        </label>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={7}
          spellCheck="false"
          placeholder={MENU_PASTE_EXAMPLE}
          className="w-full rounded-control border border-line-strong bg-surface px-3.5 py-3 font-mono text-[12.5px] leading-relaxed text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-accent"
        />
        <p className="mt-1.5 text-[12px] leading-relaxed text-ink-faint">
          Any column order. Paste it as it comes — out of Excel, Sheets, a Word
          table or a PDF — and check the columns we read it as, below.
        </p>
      </div>

      {grid.width > 0 && (
        <>
          <ColumnMapper grid={grid} mapping={mapping} setRole={setRole} />

          {needsSection && (
            <SectionFallback
              value={fallback}
              onChange={setFallback}
              categories={categories}
              count={good.length}
            />
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Tally
              tone={good.length ? 'good' : 'idle'}
              label={`${good.length} ${good.length === 1 ? 'dish' : 'dishes'} ready`}
            />
            {bad.length > 0 && <Tally tone="bad" label={`${bad.length} needing a look`} />}
            {fresh.length > 0 && (
              <Tally
                tone="info"
                label={`${fresh.length} new ${fresh.length === 1 ? 'section' : 'sections'}`}
              />
            )}
          </div>

          {/* The one case where the mapper is the answer and the row errors
              are noise. Say so rather than letting someone fix forty rows. */}
          {good.length === 0 && bad.length > 2 && (
            <p className="rounded-control border border-state-late/25 bg-state-late-bg px-3.5 py-2.5 text-[12.5px] leading-relaxed text-state-late">
              Every row failed, which almost always means the columns above are
              lined up wrong rather than the menu being wrong. Check which
              column is the dish name and which is the price.
            </p>
          )}

          {fresh.length > 0 && (
            <p className="rounded-control border border-line bg-sunken px-3.5 py-2.5 text-[12px] leading-relaxed text-ink-faint">
              New sections will be created:{' '}
              <span className="text-ink-soft">
                {fresh.map((category) => category.label).join(', ')}
              </span>
              . Check the spelling — a typo here makes a section nobody
              browsing the menu will ever find.
            </p>
          )}

          <PreviewTable rows={rows} />
        </>
      )}
    </div>
  )
}

/**
 * One dropdown per detected column, each showing what that column holds.
 *
 * The sample value underneath each is doing the real work: "Column 2" means
 * nothing, but "Column 2 — Lamb Rogan Josh" makes a wrong guess obvious at a
 * glance, with no counting across the textarea.
 */
function ColumnMapper({ grid, mapping, setRole }) {
  const sampleOf = (index) => {
    const found = grid.rows.find((row) => (row.fields[index] ?? '').trim())
    return found ? found.fields[index].trim() : ''
  }

  return (
    <div className="rounded-card border border-line bg-sunken p-3.5">
      <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-faint">
          We read {grid.width} {grid.width === 1 ? 'column' : 'columns'}, split on{' '}
          {DELIMITER_LABEL[grid.delimiter] ?? 'commas'}
        </p>
        <p className="text-[11px] text-ink-faint">Change any that look wrong</p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: grid.width }, (_, index) => {
          const role = roleOfColumn(mapping, index)
          const sample = sampleOf(index)
          return (
            <label key={index} className="block">
              <select
                value={role}
                onChange={(event) => setRole(index, event.target.value)}
                className={`${inputClass} h-9 text-[13px] ${
                  role === 'ignore' ? 'text-ink-faint' : ''
                }`}
              >
                {COLUMN_ROLES.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="mt-1 block truncate text-[11px] text-ink-faint" title={sample}>
                {grid.header?.[index]
                  ? `${grid.header[index]} · ${sample || '—'}`
                  : sample || <em>empty</em>}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Where dishes go when the paste has no section column.
 *
 * Without this they all silently land in "mains", which for a menu with
 * starters and desserts in it is wrong in a way nobody notices until a guest
 * cannot find the puddings.
 */
function SectionFallback({ value, onChange, categories, count }) {
  const [mode, setMode] = useState(categories.length ? 'existing' : 'new')

  return (
    <div className="rounded-card border border-line bg-sunken p-3.5">
      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-faint">
        No section column — file {count === 1 ? 'this dish' : `all ${count}`} under
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {categories.length > 0 && (
          <select
            value={mode === 'existing' ? value : '__new'}
            onChange={(event) => {
              if (event.target.value === '__new') {
                setMode('new')
                onChange('')
              } else {
                setMode('existing')
                onChange(event.target.value)
              }
            }}
            className={`${inputClass} h-9 flex-1 text-[13px]`}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.label}>
                {category.label}
              </option>
            ))}
            <option value="__new">+ A new section…</option>
          </select>
        )}

        {(mode === 'new' || !categories.length) && (
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Mains"
            className={`${inputClass} h-9 flex-1 text-[13px]`}
          />
        )}
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-ink-faint">
        You can move dishes between sections afterwards, one at a time.
      </p>
    </div>
  )
}

function Tally({ label, tone }) {
  const tones = {
    good: 'border-state-ready/25 bg-state-ready-bg text-state-ready',
    bad: 'border-state-late/25 bg-state-late-bg text-state-late',
    info: 'border-state-fire/25 bg-state-fire-bg text-state-fire',
    idle: 'border-line bg-sunken text-ink-faint',
  }
  return (
    <span
      className={`rounded-pill border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.06em] ${tones[tone]}`}
    >
      {label}
    </span>
  )
}

function PreviewTable({ rows }) {
  return (
    <div className="overflow-hidden rounded-card border border-line">
      {/* Scrolls both ways: a long description on a phone makes this wider
          than the sheet, and clipping it would hide the column that tells
          you the parse went wrong. */}
      <div className="max-h-[260px] overflow-auto">
        <table className="w-full text-left text-[12.5px]">
          <thead className="sticky top-0 bg-raised text-[11px] uppercase tracking-[0.06em] text-ink-faint">
            <tr>
              <th className="px-3 py-2 font-semibold">Dish</th>
              <th className="px-3 py-2 text-right font-semibold">Price</th>
              <th className="px-3 py-2 font-semibold">Section</th>
              <th className="px-3 py-2 font-semibold">Diet</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.line}
                className={`border-t border-line ${row.problem ? 'bg-state-late-bg/40' : ''}`}
              >
                <td className="px-3 py-2">
                  <span className={row.problem ? 'text-state-late' : 'text-ink'}>
                    {row.name || <em className="text-ink-faint">(no name)</em>}
                  </span>
                  {row.problem && (
                    <span className="mt-0.5 block text-[11px] text-state-late">
                      Line {row.line} &middot; {row.problem}
                    </span>
                  )}
                  {!row.problem && row.description && (
                    <span className="mt-0.5 block truncate text-[11px] text-ink-faint">
                      {row.description}
                    </span>
                  )}
                </td>
                <td className="tabular px-3 py-2 text-right text-ink-soft">
                  {row.price === null ? '—' : formatMoney(row.price)}
                </td>
                <td className="px-3 py-2 text-ink-faint">
                  {row.categoryLabel || <em>default</em>}
                </td>
                <td className="px-3 py-2 text-ink-faint">{row.diet}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/**
 * All the importer's state, owned by the parent.
 *
 * The parent needs the finished rows to commit them, and the component needs
 * them to draw the preview — so they are derived once here and both read the
 * same value. Two parses could disagree, and the one place that must never
 * happen is between what someone approved and what got written.
 */
export function useMenuPaste({ categories = [], defaultCategory = 'mains' } = {}) {
  const [text, setText] = useState('')
  const [overrides, setOverrides] = useState(null)
  const [fallback, setFallback] = useState('')

  const grid = useMemo(() => parseGrid(text), [text])
  const guessed = useMemo(() => guessMapping(grid), [grid])

  // A correction sticks until the text changes shape under it; re-guessing
  // on every keystroke would undo the change the moment anything was edited.
  const mapping = overrides ?? guessed

  const setRole = (columnIndex, role) => {
    setOverrides(assignRole(mapping, columnIndex, role))
  }

  const fallbackLabel =
    fallback.trim() || categories[0]?.label || ''
  const fallbackId = fallback.trim()
    ? slugifyCategory(fallback)
    : (categories[0]?.id ?? defaultCategory)

  const rows = useMemo(
    () => buildRows(grid, mapping, { fallbackCategory: fallbackId, fallbackLabel }),
    [grid, mapping, fallbackId, fallbackLabel]
  )

  return {
    text,
    setText: (next) => {
      setText(next)
      setOverrides(null) // a new paste deserves a fresh guess
    },
    grid,
    mapping,
    setRole,
    rows,
    fallback,
    setFallback,
  }
}
