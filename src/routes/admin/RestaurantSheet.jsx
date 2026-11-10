import { useEffect, useMemo, useState } from 'react'
import {
  addMenuItemToRestaurant,
  bulkAddMenuItems,
  deleteMenuItemFromRestaurant,
  fetchRestaurantMenu,
  updateRestaurant,
} from '../../data'
import { publicTenantUrl, tenantUrl } from '../../tenant/resolve'
import { formatMoney } from '../../lib/format'
import { slugifyCategory, usableRows } from '../../lib/menuImport'
import {
  Banner,
  Button,
  DietMark,
  Field,
  NutsMark,
  Sheet,
  Spinner,
  inputClass,
} from '../../components/ui'
import { CopyableLink } from '../../components/CopyableLink'
import { MenuPaste, useMenuPaste } from './MenuPaste'

const STATUSES = [
  { id: 'active', label: 'Active' },
  { id: 'suspended', label: 'Suspended' },
]

/**
 * One restaurant, opened from its card.
 *
 * Two tabs because there are two reasons to be here, and they want different
 * amounts of room: checking or changing the account, and working on the menu.
 * The menu is the one people come back to, so it is the tab that gets the
 * full width and the scroll.
 */
export default function RestaurantSheet({ restaurant, onClose, onChanged }) {
  const [tab, setTab] = useState('menu')

  return (
    <Sheet
      title={restaurant.name}
      onClose={onClose}
      width="max-w-3xl"
    >
      <div className="mb-5 flex gap-1 rounded-control border border-line bg-sunken p-1">
        <TabButton active={tab === 'menu'} onClick={() => setTab('menu')}>
          Menu
        </TabButton>
        <TabButton active={tab === 'account'} onClick={() => setTab('account')}>
          Account
        </TabButton>
      </div>

      {tab === 'menu' ? (
        <MenuManager restaurant={restaurant} onChanged={onChanged} />
      ) : (
        <AccountPanel restaurant={restaurant} onChanged={onChanged} />
      )}
    </Sheet>
  )
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-[7px] px-4 py-2 text-[13px] font-semibold transition-colors ${
        active ? 'bg-raised text-ink' : 'text-ink-faint hover:text-ink-soft'
      }`}
    >
      {children}
    </button>
  )
}

/* ========================================================================== */
/* Menu                                                                       */
/* ========================================================================== */

function MenuManager({ restaurant, onChanged }) {
  const [menu, setMenu] = useState(null)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [adding, setAdding] = useState(false)
  const [importing, setImporting] = useState(false)
  const [filter, setFilter] = useState('')

  // STRICT UNMOUNT: the sheet can be closed mid-read, and a setState after
  // that is a warning in dev and a leak in principle.
  useEffect(() => {
    let alive = true
    setMenu(null)
    fetchRestaurantMenu(restaurant.id)
      .then((rows) => alive && setMenu(rows))
      .catch((err) => alive && setError(err))
    return () => {
      alive = false
    }
  }, [restaurant.id])

  const reload = async () => {
    try {
      setMenu(await fetchRestaurantMenu(restaurant.id))
      onChanged?.()
    } catch (err) {
      setError(err)
    }
  }

  const categories = restaurant.categories ?? []
  const labelFor = useMemo(() => {
    const map = new Map(categories.map((category) => [category.id, category.label]))
    return (id) => map.get(id) ?? id
  }, [categories])

  const shown = useMemo(() => {
    if (!menu) return []
    const needle = filter.trim().toLowerCase()
    if (!needle) return menu
    return menu.filter(
      (dish) =>
        dish.name.toLowerCase().includes(needle) ||
        labelFor(dish.category).toLowerCase().includes(needle)
    )
  }, [menu, filter, labelFor])

  // Grouped by section, in the restaurant's own category order where it has
  // one — a menu listed alphabetically is a menu nobody recognises.
  const grouped = useMemo(() => {
    const order = new Map(categories.map((category, index) => [category.id, index]))
    const buckets = new Map()
    for (const dish of shown) {
      if (!buckets.has(dish.category)) buckets.set(dish.category, [])
      buckets.get(dish.category).push(dish)
    }
    return [...buckets.entries()].sort(
      ([a], [b]) => (order.get(a) ?? 999) - (order.get(b) ?? 999)
    )
  }, [shown, categories])

  const remove = async (dish) => {
    setError(null)
    setNotice(null)
    try {
      await deleteMenuItemFromRestaurant(restaurant.id, dish.id)
      setMenu((rows) => rows.filter((row) => row.id !== dish.id))
      setNotice(`${dish.name} removed.`)
      onChanged?.()
    } catch (err) {
      setError(err)
    }
  }

  if (error && !menu) {
    return (
      <Banner tone="bad" onDismiss={() => setError(null)}>
        {error}
      </Banner>
    )
  }

  if (!menu) {
    return (
      <div className="grid place-items-center py-14">
        <Spinner label="Reading the menu" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder={`Search ${menu.length} dishes`}
          className={`${inputClass} h-10 min-w-0 flex-1 text-[14px]`}
        />
        <Button size="sm" variant="secondary" onClick={() => setAdding(true)}>
          Add a dish
        </Button>
        <Button size="sm" onClick={() => setImporting((on) => !on)}>
          {importing ? 'Close importer' : 'Bulk import'}
        </Button>
      </div>

      {importing && (
        <BulkImporter
          restaurant={restaurant}
          onDone={async (added) => {
            setImporting(false)
            setNotice(`${added} ${added === 1 ? 'dish' : 'dishes'} added.`)
            await reload()
          }}
        />
      )}

      {adding && (
        <QuickAddDish
          restaurant={restaurant}
          onCancel={() => setAdding(false)}
          onAdded={async (name) => {
            setAdding(false)
            setNotice(`${name} added.`)
            await reload()
          }}
        />
      )}

      <Banner tone="good" onDismiss={() => setNotice(null)}>
        {notice}
      </Banner>
      <Banner tone="bad" onDismiss={() => setError(null)}>
        {error}
      </Banner>

      {menu.length === 0 ? (
        <div className="rounded-card border border-line bg-sunken px-6 py-12 text-center">
          <p className="text-[14px] text-ink-soft">This menu is empty.</p>
          <p className="mx-auto mt-2 max-w-sm text-[12.5px] leading-relaxed text-ink-faint">
            Until there is at least one dish, a guest scanning a table has
            nothing to browse and the restaurant will look broken. Paste their
            menu in with Bulk import.
          </p>
        </div>
      ) : shown.length === 0 ? (
        <p className="py-10 text-center text-[13px] text-ink-faint">
          Nothing matches “{filter}”.
        </p>
      ) : (
        <div className="space-y-5">
          {grouped.map(([categoryId, dishes]) => (
            <section key={categoryId}>
              <h4 className="mb-2 flex items-baseline justify-between gap-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-faint">
                  {labelFor(categoryId)}
                </span>
                <span className="tabular text-[11px] text-ink-faint">
                  {dishes.length}
                </span>
              </h4>
              <div className="overflow-hidden rounded-card border border-line">
                {dishes.map((dish, index) => (
                  <DishRow
                    key={dish.id}
                    dish={dish}
                    first={index === 0}
                    onRemove={() => remove(dish)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

function DishRow({ dish, first, onRemove }) {
  const [confirming, setConfirming] = useState(false)

  return (
    <div
      className={`flex items-center gap-3 px-3.5 py-2.5 ${first ? '' : 'border-t border-line'}`}
    >
      <span className="tabular w-8 shrink-0 text-[11px] text-ink-faint">
        {dish.no ?? '—'}
      </span>

      <span className="flex shrink-0 items-center gap-1">
        <DietMark diet={dish.diet} size={13} />
        {dish.nuts && <NutsMark size={13} />}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px]">{dish.name}</span>
        {dish.description && (
          <span className="block truncate text-[11.5px] text-ink-faint">
            {dish.description}
          </span>
        )}
      </span>

      <span className="tabular shrink-0 text-[14px] text-ink-soft">
        {formatMoney(dish.price)}
      </span>

      {/* Two taps to delete, because the one-tap version of this removes a
          dish from a live menu with no undo. */}
      {confirming ? (
        <span className="flex shrink-0 gap-1">
          <Button size="sm" variant="danger" onClick={onRemove}>
            Delete
          </Button>
          <Button size="sm" variant="quiet" onClick={() => setConfirming(false)}>
            No
          </Button>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          aria-label={`Remove ${dish.name}`}
          className="shrink-0 rounded-control px-2 py-1 text-[12px] text-ink-faint transition-colors hover:text-state-late"
        >
          Remove
        </button>
      )}
    </div>
  )
}

function QuickAddDish({ restaurant, onAdded, onCancel }) {
  const categories = restaurant.categories ?? []
  const [form, setForm] = useState({
    name: '',
    price: '',
    category: categories[0]?.id ?? '',
    newCategory: '',
    description: '',
    diet: 'veg',
    nuts: false,
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const set = (field) => (event) => {
    setError(null)
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setForm((f) => ({ ...f, [field]: value }))
  }

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const makingNew = form.category === '__new'
      const label = makingNew ? form.newCategory.trim() : null
      if (makingNew && !label) throw new Error('Name the new section.')

      await addMenuItemToRestaurant(restaurant.id, {
        name: form.name,
        price: Number(form.price),
        category: makingNew ? slugifyCategory(label) : form.category || 'mains',
        categoryLabel: label ?? undefined,
        description: form.description,
        diet: form.diet,
        nuts: form.nuts,
      })
      onAdded(form.name.trim())
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-3 rounded-card border border-line bg-sunken p-4"
      noValidate
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_120px]">
        <Field label="Dish name">
          <input
            required
            autoFocus
            value={form.name}
            onChange={set('name')}
            placeholder="Paneer Tikka"
            className={inputClass}
          />
        </Field>
        <Field label="Price">
          <input
            required
            type="number"
            min="0"
            step="0.05"
            value={form.price}
            onChange={set('price')}
            placeholder="6.50"
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Section">
          <select value={form.category} onChange={set('category')} className={inputClass}>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
            <option value="__new">+ New section…</option>
          </select>
        </Field>
        <Field label="Diet">
          <select value={form.diet} onChange={set('diet')} className={inputClass}>
            <option value="veg">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="non-veg">Non-vegetarian</option>
          </select>
        </Field>
      </div>

      {form.category === '__new' && (
        <Field label="New section name">
          <input
            value={form.newCategory}
            onChange={set('newCategory')}
            placeholder="Tandoor"
            className={inputClass}
          />
        </Field>
      )}

      <Field label="Description">
        <input
          value={form.description}
          onChange={set('description')}
          placeholder="Charred paneer with peppers and onion"
          className={inputClass}
        />
      </Field>

      <label className="flex items-center gap-2.5 text-[13px] text-ink-soft">
        <input
          type="checkbox"
          checked={form.nuts}
          onChange={set('nuts')}
          className="size-4 accent-[var(--color-accent)]"
        />
        Contains nuts
      </label>

      <Banner tone="bad" onDismiss={() => setError(null)}>
        {error}
      </Banner>

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={busy}>
          {busy ? 'Adding…' : 'Add dish'}
        </Button>
        <Button type="button" size="sm" variant="quiet" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

function BulkImporter({ restaurant, onDone }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const paste = useMenuPaste({ categories: restaurant.categories ?? [] })
  const good = usableRows(paste.rows)

  const commit = async () => {
    setBusy(true)
    setError(null)
    try {
      const { added } = await bulkAddMenuItems(
        restaurant.id,
        good.map((row) => ({
          name: row.name,
          price: row.price,
          no: row.no,
          category: row.category,
          categoryLabel: row.categoryLabel,
          description: row.description,
          diet: row.diet,
        }))
      )
      paste.setText('')
      onDone(added)
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3 rounded-card border border-line bg-sunken p-4">
      <MenuPaste paste={paste} categories={restaurant.categories ?? []} />

      <Banner tone="bad" onDismiss={() => setError(null)}>
        {error}
      </Banner>

      <Button full disabled={busy || !good.length} onClick={commit}>
        {busy
          ? 'Adding…'
          : good.length
            ? `Commit ${good.length} ${good.length === 1 ? 'dish' : 'dishes'} to the menu`
            : 'Nothing to commit yet'}
      </Button>
    </div>
  )
}

/* ========================================================================== */
/* Account                                                                    */
/* ========================================================================== */

function AccountPanel({ restaurant, onChanged }) {
  const [form, setForm] = useState({
    name: restaurant.name ?? '',
    tagline: restaurant.tagline ?? '',
    customDomain: restaurant.customDomain ?? '',
    status: restaurant.status ?? 'active',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)

  const set = (field) => (event) => {
    setError(null)
    setSaved(false)
    setForm((f) => ({ ...f, [field]: event.target.value }))
  }

  const save = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await updateRestaurant(restaurant.id, form)
      setSaved(true)
      onChanged?.()
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  const guestLink = publicTenantUrl(restaurant.subdomain, '/customer')

  return (
    <div className="space-y-6">
      <section>
        <h4 className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-faint">
          Open it
        </h4>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <LaunchLink to={tenantUrl(restaurant.subdomain, '/')} label="Front door" />
          <LaunchLink to={tenantUrl(restaurant.subdomain, '/customer/3')} label="Guest menu" />
          <LaunchLink to={tenantUrl(restaurant.subdomain, '/manager')} label="Manager floor" />
          <LaunchLink to={tenantUrl(restaurant.subdomain, '/kitchen')} label="Kitchen pass" />
        </div>

        <div className="mt-3">
          <p className="text-[12px] text-ink-faint">
            The address for their QR stickers — always the live domain, never
            whatever this page is being served from:
          </p>
          <CopyableLink link={guestLink} label="Copy QR link" />
        </div>
      </section>

      <form onSubmit={save} className="space-y-4 border-t border-line pt-6" noValidate>
        <h4 className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-faint">
          Details
        </h4>

        <Field label="Name">
          <input required value={form.name} onChange={set('name')} className={inputClass} />
        </Field>

        <Field label="Tagline">
          <input value={form.tagline} onChange={set('tagline')} className={inputClass} />
        </Field>

        <Field
          label="Subdomain"
          hint="Fixed. It is the document id and the address on every printed QR code, so changing it is a migration rather than an edit."
        >
          <input
            readOnly
            disabled
            value={`${restaurant.subdomain}.happytable.co.uk`}
            className={`${inputClass} opacity-60`}
          />
        </Field>

        <Field
          label="Their own domain"
          hint="Only once they have pointed it at us, or the app will answer on an address that does not resolve."
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

        <Field
          label="Status"
          hint={
            form.status === 'suspended'
              ? 'Suspended: guests and staff both get a plain “not taking orders” screen. Their data is untouched.'
              : 'Active: the restaurant is open to guests and staff.'
          }
        >
          <select value={form.status} onChange={set('status')} className={inputClass}>
            {STATUSES.map((status) => (
              <option key={status.id} value={status.id}>
                {status.label}
              </option>
            ))}
          </select>
        </Field>

        <Banner tone="bad" onDismiss={() => setError(null)}>
          {error}
        </Banner>
        {saved && <Banner tone="good">Saved.</Banner>}

        <Button type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Save changes'}
        </Button>
      </form>

      <section className="border-t border-line pt-6">
        <h4 className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-faint">
          Owner
        </h4>
        <p className="text-[13px] text-ink-soft">
          {restaurant.ownerEmail || <span className="text-ink-faint">Not recorded</span>}
        </p>
        <p className="mt-2 text-[12px] leading-relaxed text-ink-faint">
          Staff are managed by the restaurant itself, under People on their own
          manager screen. Nobody here can read or set a password — the owner
          sets theirs from the link they were emailed, and so does everyone
          they hire.
        </p>
      </section>
    </div>
  )
}

function LaunchLink({ to, label }) {
  return (
    <a
      href={to}
      className="rounded-control border border-line-strong bg-raised px-3 py-2.5 text-center text-[12.5px] font-semibold text-ink-soft transition-colors hover:text-ink"
    >
      {label}
    </a>
  )
}
