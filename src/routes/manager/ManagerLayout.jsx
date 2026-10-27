import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useRestaurant } from '../../tenant/context'
import { useTables } from '../../hooks/useTables'
import { useAuth } from '../../auth/context'
import { roleLabel } from '../../auth/permissions'

/**
 * Manager chrome, built for a tablet held in landscape at the pass.
 *
 * Tabs are filtered by capability rather than hidden by role, so a waiter
 * signed in here sees only Floor — and the owner can change that from the
 * People screen without anyone touching this file.
 */
const TABS = [
  { to: '/manager', end: true, label: 'Floor', permission: 'floor.view' },
  { to: '/manager/menu', end: false, label: 'Menu', permission: 'menu.view' },
  { to: '/manager/billing', end: false, label: 'Billing', permission: 'billing.view' },
  { to: '/manager/sales', end: false, label: 'Sales', permission: 'reports.sales' },
  { to: '/manager/people', end: false, label: 'People', permission: 'staff.manage' },
]

export default function ManagerLayout() {
  const restaurant = useRestaurant()
  const { pending } = useTables()
  const { user, signOut, can } = useAuth()
  const navigate = useNavigate()

  const visibleTabs = TABS.filter((tab) => can(tab.permission))

  const handleSignOut = () => {
    signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-40 border-b border-line bg-canvas/92 backdrop-blur-lg">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 sm:px-6 sm:py-3.5">
          <div className="flex items-baseline gap-2.5">
            <span className="font-display text-[22px] leading-none">{restaurant.name}</span>
            <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
              Front of house
            </span>
          </div>

          {/* Five tabs cannot share 375px. Rather than squeeze them until the
              labels clip, the bar scrolls sideways on a phone and only stretches
              to fit once there is room. */}
          <nav className="rail order-3 flex w-full gap-1 overflow-x-auto rounded-pill bg-sunken p-1 sm:order-none sm:w-auto sm:overflow-visible">
            {visibleTabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `relative shrink-0 rounded-pill px-3.5 py-2 text-center text-[13px] font-semibold transition-colors sm:px-4 ${
                    isActive ? 'bg-raised text-ink shadow-raise' : 'text-ink-faint hover:text-ink'
                  }`
                }
              >
                {tab.label}
                {tab.label === 'Floor' && pending.length > 0 && (
                  <span className="tabular absolute -right-0.5 -top-0.5 grid size-4 min-w-4 place-items-center rounded-full bg-state-new px-1 text-[10px] font-bold text-canvas">
                    {pending.length}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 rounded-control border border-line-strong bg-surface py-1.5 pl-1.5 pr-3 text-left transition-colors hover:bg-raised"
              title="Sign out"
            >
              <span className="grid size-7 place-items-center rounded-full bg-raised font-display text-[14px] text-ink-soft">
                {user?.name?.charAt(0) ?? '?'}
              </span>
              <span className="leading-tight">
                <span className="block text-[12px] font-semibold">{user?.name}</span>
                <span className="block text-[10px] uppercase tracking-[0.06em] text-ink-faint">
                  {roleLabel(user?.role)} &middot; sign out
                </span>
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 sm:py-6">
        <Outlet />
      </main>
    </div>
  )
}
