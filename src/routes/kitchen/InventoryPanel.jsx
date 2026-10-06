import { useMemo, useState } from 'react'
import { setItemSoldOut } from '../../data'
import { useMenu } from '../../hooks/useMenu'
import { useInventory } from '../../hooks/useInventory'
import { CATEGORIES } from '../../mock/data'
import { DishImage, DishMarks, Spinner, Switch } from '../../components/ui'
import { useAuth } from '../../auth/context'

/**
 * The 86 list.
 *
 * "86" is the kitchen's own word for a dish that has run out, so the screen
 * uses it. Sold-out items are pulled to the top: what is off is the thing a
 * chef needs to see, and what is on is just the rest of the menu.
 *
 * A toggle here reaches every guest phone in the room on the inventory
 * subscription they already hold — one write, instant effect.
 */
export default function InventoryPanel() {
  const { menu, loading } = useMenu()
  const { soldOutItems, isSoldOut } = useInventory()
  const canToggle = useAuth().can('inventory.toggle')
  const [busy, setBusy] = useState(null)
  const [filter, setFilter] = useState('all')

  const toggle = async (item) => {
    setBusy(item.id)
    try {
      await setItemSoldOut(item.id, !isSoldOut(item.id))
    } finally {
      setBusy(null)
    }
  }

  const rows = useMemo(() => {
    const list = filter === 'all' ? menu : menu.filter((m) => m.category === filter)
    // Off first, then by course, then alphabetically.
    return [...list].sort((a, b) => {
      const offDelta = Number(isSoldOut(b.id)) - Number(isSoldOut(a.id))
      if (offDelta) return offDelta
      if (a.category !== b.category) return a.category.localeCompare(b.category)
      return a.name.localeCompare(b.name)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menu, filter, soldOutItems.join('|')])

  if (loading) return <Spinner dark label="Loading the menu" />

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[17px] font-bold tracking-[-0.01em]">86 list</h2>
          <p className="mt-0.5 text-[13px] text-kds-ink-soft">
            {canToggle
            ? 'Switch a dish off and it greys out on every table immediately.'
            : 'View only — marking dishes off is not part of your role.'}
          </p>
        </div>
        <span
          className={`tabular rounded-pill px-3.5 py-1.5 text-[13px] font-bold ${
            soldOutItems.length
              ? 'bg-state-late/15 text-state-late'
              : 'bg-kds-surface text-kds-ink-soft'
          }`}
        >
          {soldOutItems.length} off
        </span>
      </div>

      <div className="rail mb-4 flex gap-1.5 overflow-x-auto pb-1">
        {[{ id: 'all', label: 'All' }, ...CATEGORIES].map((category) => (
          <button
            key={category.id}
            onClick={() => setFilter(category.id)}
            className={`shrink-0 rounded-pill px-4 py-2 text-[13px] font-semibold transition-colors ${
              filter === category.id
                ? 'bg-kds-ink text-kds'
                : 'bg-kds-surface text-kds-ink-soft hover:text-kds-ink'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      <ul className="divide-y divide-kds-line overflow-hidden rounded-card border border-kds-line bg-kds-surface">
        {rows.map((item) => {
          const off = isSoldOut(item.id)
          return (
            <li
              key={item.id}
              className={`flex items-center gap-3 px-3 py-3 transition-colors sm:gap-4 sm:px-4 ${
                off ? 'bg-state-late/[0.07]' : ''
              }`}
            >
              <DishImage
                src={item.image_url}
                name={item.name}
                dim={off}
                className="size-12 shrink-0 rounded-[9px] !bg-kds-raised"
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <DishMarks item={item} size={12} />
                  <p
                    className={`truncate text-[16px] font-semibold ${
                      off ? 'text-kds-ink-soft line-through' : ''
                    }`}
                  >
                    {item.name}
                  </p>
                </div>
                <p className="mt-0.5 text-[12px] uppercase tracking-[0.06em] text-kds-ink-soft">
                  {CATEGORIES.find((c) => c.id === item.category)?.label ?? item.category}
                </p>
              </div>

              <span
                className={`w-16 text-right text-[11px] font-bold uppercase tracking-[0.07em] ${
                  off ? 'text-state-late' : 'text-state-ready'
                }`}
              >
                {off ? '86' : 'On'}
              </span>

              <Switch
                checked={!off}
                disabled={!canToggle || busy === item.id}
                onChange={() => toggle(item)}
                label={`${item.name} availability`}
              />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
