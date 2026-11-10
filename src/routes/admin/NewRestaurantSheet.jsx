import { useMemo, useState } from 'react'
import { createRestaurant } from '../../data'
import { PRIMARY_DOMAIN } from '../../tenant/resolve'
import { slugify, slugProblem } from '../../lib/slug'
import { isValidEmail } from '../../lib/validate'
import { PASSWORD_MIN, passwordProblem } from '../../lib/passwords'
import { STARTER_CATEGORIES, STARTER_MENU } from '../../lib/starterMenu'
import { usableRows } from '../../lib/menuImport'
import { Banner, Button, Field, Sheet, inputClass } from '../../components/ui'
import { MenuPaste, useMenuPaste } from './MenuPaste'

/**
 * Create a restaurant.
 *
 * One form, and it provisions everything: the record, the tables, the
 * permission matrix, the owner's account and — if there is one to load — the
 * menu. A restaurant that exists but has no tables is not a restaurant that
 * can be used, so there is no "save and finish later" path here.
 *
 * The menu choice is the interesting part. Starting blank is honest but
 * leaves nothing to click; the starter template makes every screen walkable
 * in a minute; the paste is what actually gets used, because every
 * restaurant already has its menu in a spreadsheet.
 */
export default function NewRestaurantSheet({ onClose, onCreated, taken = [] }) {
  const [form, setForm] = useState({
    name: '',
    subdomain: '',
    tagline: '',
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
    tablesCount: 20,
    currency: 'GBP',
    customDomain: '',
  })
  const [menuMode, setMenuMode] = useState('starter')
  const [ownerMode, setOwnerMode] = useState('invite')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  // A brand new restaurant has no sections of its own yet, so the importer
  // offers the starter template's as somewhere to put dishes that arrive
  // without one.
  const paste = useMenuPaste({ categories: STARTER_CATEGORIES })
  const rows = paste.rows

  // Typed subdomain wins; otherwise it follows the name, so the common case
  // needs no second field filled in at all.
  const slug = useMemo(
    () => slugify(form.subdomain || form.name),
    [form.subdomain, form.name]
  )

  const slugIssue = slug ? slugProblem(slug) : null
  const slugTaken = Boolean(slug) && taken.includes(slug)

  const set = (field) => (event) => {
    setError(null)
    setForm((f) => ({ ...f, [field]: event.target.value }))
  }

  // Everything that would stop this working, decided up front so the reason
  // can be printed under the button rather than discovered on submit.
  const blocker = (() => {
    if (!form.name.trim()) return 'The restaurant needs a name.'
    if (!slug) return 'Choose a subdomain.'
    if (slugIssue) return slugIssue
    if (slugTaken) return `“${slug}” is already taken.`
    if (!isValidEmail(form.ownerEmail)) return 'Enter the owner’s email address.'
    if (ownerMode === 'password') {
      const problem = passwordProblem(form.ownerPassword)
      if (problem) return problem
    }
    if (menuMode === 'paste' && !usableRows(rows).length) {
      return 'Paste at least one dish, or choose another menu option.'
    }
    return null
  })()

  const submit = async (event) => {
    event.preventDefault()
    if (blocker) {
      setError(new Error(blocker))
      return
    }

    setBusy(true)
    setError(null)
    try {
      const { initialMenu, categories } = menuPayload(menuMode, rows)

      const created = await createRestaurant({
        name: form.name,
        subdomain: slug,
        tagline: form.tagline,
        ownerName: form.ownerName,
        ownerEmail: form.ownerEmail,
        ownerPassword: ownerMode === 'password' ? form.ownerPassword : '',
        tablesCount: Number(form.tablesCount) || 20,
        currency: form.currency,
        customDomain: form.customDomain,
        categories,
        initialMenu,
      })

      onCreated(created)
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Sheet title="Add a restaurant" onClose={onClose} width="max-w-2xl">
      <form id="new-restaurant" onSubmit={submit} className="space-y-6" noValidate>
        <section className="space-y-4">
          <Legend>The restaurant</Legend>

          <Field label="Name">
            <input
              required
              autoFocus
              value={form.name}
              onChange={set('name')}
              placeholder="Royal Sweet Mart"
              className={inputClass}
            />
          </Field>

          <Field
            label="Subdomain"
            hint={
              slugTaken
                ? `“${slug}” is already taken — try something else.`
                : slugIssue
                  ? slugIssue
                  : slug
                    ? `Guests will use ${slug}.${PRIMARY_DOMAIN}`
                    : 'Left blank, this follows the name.'
            }
          >
            <input
              value={form.subdomain}
              onChange={set('subdomain')}
              placeholder={slugify(form.name) || 'royalsweetmart'}
              autoCapitalize="none"
              spellCheck="false"
              aria-invalid={slugTaken || Boolean(slugIssue) || undefined}
              className={`${inputClass} ${slugTaken || slugIssue ? 'border-state-late' : ''}`}
            />
          </Field>

          <Field label="Tagline" hint="Shown under the name on their front page.">
            <input
              value={form.tagline}
              onChange={set('tagline')}
              placeholder="Vegetarian Indian kitchen"
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Tables">
              <input
                type="number"
                min="1"
                max="200"
                value={form.tablesCount}
                onChange={set('tablesCount')}
                className={inputClass}
              />
            </Field>
            <Field label="Currency">
              <select value={form.currency} onChange={set('currency')} className={inputClass}>
                <option value="GBP">GBP £</option>
                <option value="EUR">EUR €</option>
                <option value="USD">USD $</option>
              </select>
            </Field>
          </div>

          <Field
            label="Their own domain"
            hint="Optional, and only after they have pointed it at us. Leave blank to use the subdomain."
          >
            <input
              value={form.customDomain}
              onChange={set('customDomain')}
              placeholder="feastindia.co.uk"
              autoCapitalize="none"
              spellCheck="false"
              className={inputClass}
            />
          </Field>
        </section>

        <section className="space-y-4 border-t border-line pt-6">
          <Legend>The owner</Legend>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Their name">
              <input
                value={form.ownerName}
                onChange={set('ownerName')}
                placeholder="Nadia"
                className={inputClass}
              />
            </Field>
            <Field label="Email" hint="They sign in with this.">
              <input
                type="email"
                required
                value={form.ownerEmail}
                onChange={set('ownerEmail')}
                placeholder="owner@royalsweetmart.co.uk"
                autoCapitalize="none"
                spellCheck="false"
                className={inputClass}
              />
            </Field>
          </div>

          <Choice
            name="owner-mode"
            value={ownerMode}
            onChange={setOwnerMode}
            options={[
              {
                value: 'invite',
                label: 'They set their own password',
                badge: 'Better',
                hint: 'We email them a link. Nobody here ever knows their password, which is the only way that sentence can be true.',
              },
              {
                value: 'password',
                label: 'I’ll set a temporary one',
                hint: 'For a restaurant you are setting up alongside them, in the room.',
              },
            ]}
          />

          {ownerMode === 'password' && (
            <Field label="Temporary password" hint={`At least ${PASSWORD_MIN} characters.`}>
              <input
                type="text"
                value={form.ownerPassword}
                onChange={set('ownerPassword')}
                placeholder="something they can change"
                autoCapitalize="none"
                spellCheck="false"
                className={inputClass}
              />
            </Field>
          )}
        </section>

        <section className="space-y-4 border-t border-line pt-6">
          <Legend>Their menu</Legend>

          <Choice
            name="menu-mode"
            value={menuMode}
            onChange={setMenuMode}
            options={[
              {
                value: 'starter',
                label: 'Start from a template',
                badge: `${STARTER_MENU.length} dishes`,
                hint: 'Generic placeholder dishes in five sections, so every screen works from the first minute. Replace them later.',
              },
              {
                value: 'paste',
                label: 'Paste their real menu now',
                hint: 'Straight out of a spreadsheet. You see what we parsed before anything is saved.',
              },
              {
                value: 'blank',
                label: 'Start completely blank',
                hint: 'Nothing for a guest to browse until a dish is added, so the app will look broken until then.',
              },
            ]}
          />

          {menuMode === 'paste' && (
            <MenuPaste paste={paste} categories={STARTER_CATEGORIES} />
          )}
        </section>

        <Banner tone="bad" onDismiss={() => setError(null)}>
          {error}
        </Banner>
      </form>

      <div className="mt-6 border-t border-line pt-5">
        <Button type="submit" form="new-restaurant" full size="lg" disabled={busy}>
          {busy ? 'Setting it up…' : 'Create restaurant'}
        </Button>
        {/* The button stays pressable and the reason sits under it: a button
            that is simply dead tells you nothing about why. */}
        {blocker && !busy && (
          <p className="mt-2 text-center text-[12px] text-ink-faint">{blocker}</p>
        )}
      </div>
    </Sheet>
  )
}

/** What the chosen menu option actually sends. */
function menuPayload(mode, rows) {
  if (mode === 'starter') {
    return { initialMenu: STARTER_MENU, categories: STARTER_CATEGORIES }
  }
  if (mode === 'paste') {
    const good = usableRows(rows)
    return {
      initialMenu: good.map((row) => ({
        name: row.name,
        price: row.price,
        no: row.no,
        category: row.category,
        categoryLabel: row.categoryLabel,
        description: row.description,
        diet: row.diet,
      })),
      categories: [],
    }
  }
  return { initialMenu: [], categories: [] }
}

function Legend({ children }) {
  return (
    <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-faint">
      {children}
    </h3>
  )
}

/**
 * A real radio group, styled.
 *
 * Real inputs rather than buttons, so arrow keys, labels and screen readers
 * all work without being reimplemented.
 */
export function Choice({ name, value, onChange, options }) {
  return (
    <div className="space-y-2">
      {options.map((option) => {
        const selected = value === option.value
        return (
          <label
            key={option.value}
            className={`flex cursor-pointer gap-3 rounded-control border px-3.5 py-3 transition-colors ${
              selected
                ? 'border-accent bg-accent-wash'
                : 'border-line-strong bg-surface hover:border-line'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={selected}
              onChange={() => onChange(option.value)}
              className="mt-1 size-4 shrink-0 accent-[var(--color-accent)]"
            />
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-[14px] font-semibold">{option.label}</span>
                {option.badge && (
                  <span className="rounded-pill bg-raised px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-ink-faint">
                    {option.badge}
                  </span>
                )}
              </span>
              {option.hint && (
                <span className="mt-1 block text-[12.5px] leading-relaxed text-ink-faint">
                  {option.hint}
                </span>
              )}
            </span>
          </label>
        )
      })}
    </div>
  )
}
