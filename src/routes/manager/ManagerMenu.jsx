import { useMemo, useState } from 'react'
import { addMenuItem } from '../../data'
import { useMenu } from '../../hooks/useMenu'
import { useInventory } from '../../hooks/useInventory'
import { useCategories } from '../../tenant/context'
import { useAuth } from '../../auth/context'
import { formatMoney } from '../../lib/format'
import {
  Banner,
  Button,
  Card,
  DishImage,
  Field,
  SectionTitle,
  DishMarks,
  Spinner,
  inputClass,
} from '../../components/ui'

const BLANK = {
  name: '',
  description: '',
  price: '',
  category: '',
  diet: 'veg',
  nuts: false,
  isNew: true,
  image_url: '',
}

/**
 * Menu management.
 *
 * The form previews the dish exactly as the guest will see it. Menu entry is
 * done once and lived with for months, so seeing the real card while typing
 * is worth more than a compact form.
 */
export default function ManagerMenu() {
  const { menu, loading } = useMenu()
  const { can } = useAuth()
  const { isSoldOut } = useInventory()
  const categories = useCategories()
  // The section list belongs to this restaurant, so the blank form cannot be
  // a module constant — it has to pick up whatever this kitchen's first
  // section happens to be.
  const blank = () => ({ ...BLANK, category: categories[0]?.id ?? '' })
  const [form, setForm] = useState(blank)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(null)
  const [filter, setFilter] = useState('all')

  const set = (field) => (event) => setForm((f) => ({ ...f, [field]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await addMenuItem(form)
      setSaved(form.name.trim())
      setForm(blank())
      setTimeout(() => setSaved(null), 4000)
    } catch (err) {
      setError(err)
    } finally {
      setSaving(false)
    }
  }

  const shown = useMemo(
    () => (filter === 'all' ? menu : menu.filter((m) => m.category === filter)),
    [menu, filter]
  )

  const canEdit = can('menu.edit')

  return (
    <div
      className={
        canEdit
          ? 'grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:gap-7'
          : 'grid min-w-0 grid-cols-1 gap-6'
      }
    >
      {canEdit && (
      <section className="min-w-0">
        <SectionTitle hint="Appears on guest devices immediately">Add a dish</SectionTitle>

        <Card className="p-5">
          <form onSubmit={submit} className="space-y-4">
            <Field label="Name">
              <input
                required
                value={form.name}
                onChange={set('name')}
                placeholder="Chilli Paneer"
                className={inputClass}
              />
            </Field>

            <Field label="Description" hint="One line. What makes it worth ordering.">
              <input
                value={form.description}
                onChange={set('description')}
                placeholder="Paneer cubes stir-fried with green chillies, soy sauce, onions &amp; capsicums."
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Price">
                <input
                  required
                  type="number"
                  min="0"
                  step="0.05"
                  value={form.price}
                  onChange={set('price')}
                  placeholder="10.00"
                  className={inputClass}
                />
              </Field>
              <Field label="Course">
                <select value={form.category} onChange={set('category')} className={inputClass}>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Diet">
                <div className="flex gap-2">
                  {['veg', 'vegan'].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, diet: value }))}
                      className={`flex h-11 flex-1 items-center justify-center gap-1.5 rounded-control border text-[13px] font-semibold capitalize transition-colors ${
                        form.diet === value
                          ? 'border-accent bg-accent-wash text-ink'
                          : 'border-line-strong bg-surface text-ink-faint'
                      }`}
                    >
                      <DishMarks item={{ diet: value }} size={12} />
                      {value}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Allergen">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, nuts: !f.nuts }))}
                  className={`flex h-11 w-full items-center justify-center gap-2 rounded-control border text-[13px] font-semibold transition-colors ${
                    form.nuts
                      ? 'border-state-new/50 bg-state-new-bg text-state-new'
                      : 'border-line-strong bg-surface text-ink-faint'
                  }`}
                >
                  {form.nuts ? 'Contains nuts' : 'No nuts'}
                </button>
              </Field>
            </div>

            <Field label="Image URL">
              <input
                type="url"
                value={form.image_url}
                onChange={set('image_url')}
                placeholder="https://…"
                className={inputClass}
              />
            </Field>

            <Button type="submit" full size="lg" disabled={saving}>
              {saving ? 'Saving…' : 'Add to menu'}
            </Button>

            {saved && <Banner tone="good">Added “{saved}”.</Banner>}
            {error && (
              <Banner tone="bad" onDismiss={() => setError(null)}>
                {error}
              </Banner>
            )}
          </form>
        </Card>

        {(form.name || form.image_url) && (
          <div className="mt-5">
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
              Guest preview
            </p>
            <PreviewCard item={form} />
          </div>
        )}
      </section>
      )}

      <section className="min-w-0">
        <SectionTitle hint={`${menu.length} dishes`}>Current menu</SectionTitle>

        <div className="rail mb-4 flex gap-1.5 overflow-x-auto pb-1">
          {[{ id: 'all', label: 'All' }, ...categories].map((category) => (
            <button
              key={category.id}
              onClick={() => setFilter(category.id)}
              className={`shrink-0 rounded-pill px-3.5 py-2 text-[13px] font-semibold transition-colors ${
                filter === category.id
                  ? 'bg-ink text-canvas'
                  : 'bg-sunken text-ink-soft hover:bg-line'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {loading ? (
          <Spinner label="Loading menu" />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {shown.map((item) => (
              <Card key={item.id} className="flex gap-3 p-3">
                <DishImage
                  src={item.image_url}
                  name={item.name}
                  dim={isSoldOut(item.id)}
                  className="size-16 shrink-0 rounded-[10px]"
                />

                <div className="min-w-0 flex-1">
                  <DishMarks item={item} size={12} />
                  <p className="mt-1 truncate text-[14px] font-semibold">{item.name}</p>
                  <p className="truncate text-[12px] text-ink-faint">{item.description}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="tabular text-[13px] font-semibold">
                      {formatMoney(item.price)}
                    </span>
                    {isSoldOut(item.id) && (
                      <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-state-late">
                        86&rsquo;d
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function PreviewCard({ item }) {
  return (
    <article className="flex gap-3.5 rounded-card border border-line bg-surface p-3 shadow-raise">
      <div className="min-w-0 flex-1">
        <DishMarks item={item} />
        <h3 className="mt-1.5 text-[15px] font-semibold leading-snug">
          {item.name || 'Dish name'}
        </h3>
        <p className="mt-1 text-[13px] leading-snug text-ink-faint">
          {item.description || 'A short, appetising description.'}
        </p>
        <p className="tabular mt-2.5 text-[15px] font-semibold">
          {formatMoney(item.price || 0)}
        </p>
      </div>
      <DishImage
        src={item.image_url}
        name={item.name || '?'}
        className="size-[88px] shrink-0 rounded-[11px]"
      />
    </article>
  )
}
