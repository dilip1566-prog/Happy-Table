import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { USE_MOCK, listRestaurants } from '../../data'
import { useAdmin } from '../../admin/context'
import { PRIMARY_DOMAIN, tenantUrl } from '../../tenant/resolve'
import { Banner, Button, Spinner, Stat, inputClass } from '../../components/ui'
import { CopyableLink } from '../../components/CopyableLink'
import NewRestaurantSheet from './NewRestaurantSheet'
import RestaurantSheet from './RestaurantSheet'

/**
 * Our console, not a restaurant's.
 *
 * It renders on the apex domain, where no tenant resolves, behind a
 * platform-admin sign-in. Everything it touches names its restaurant
 * explicitly rather than reading an active tenant, because there isn't one
 * here — see the platform section of src/data/firestoreAdapter.js.
 *
 * Restaurants are provisioned by us rather than signing themselves up,
 * because onboarding is real work: loading a menu, setting table counts,
 * issuing the owner's login. Self-service can follow once that is
 * automated — and the create form here is most of the automation.
 */
export default function SuperAdmin() {
  const { admin, signOut } = useAdmin()
  const [restaurants, setRestaurants] = useState(null)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [invite, setInvite] = useState(null)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [creating, setCreating] = useState(false)
  const [openId, setOpenId] = useState(null)

  const load = useCallback(async () => {
    try {
      setRestaurants(await listRestaurants())
    } catch (err) {
      setError(err)
    }
  }, [])

  useEffect(() => {
    let alive = true
    listRestaurants()
      .then((rows) => alive && setRestaurants(rows))
      .catch((err) => alive && setError(err))
    return () => {
      alive = false // STRICT UNMOUNT
    }
  }, [])

  const counts = useMemo(() => {
    const rows = restaurants ?? []
    return {
      total: rows.length,
      active: rows.filter((r) => r.status === 'active').length,
      suspended: rows.filter((r) => r.status === 'suspended').length,
      dishes: rows.reduce((sum, r) => sum + (Number(r.dishes) || 0), 0),
    }
  }, [restaurants])

  const shown = useMemo(() => {
    const rows = restaurants ?? []
    const needle = query.trim().toLowerCase()
    return rows.filter((r) => {
      if (status !== 'all' && r.status !== status) return false
      if (!needle) return true
      return (
        r.name.toLowerCase().includes(needle) ||
        r.subdomain.toLowerCase().includes(needle) ||
        String(r.ownerEmail ?? '').toLowerCase().includes(needle) ||
        String(r.customDomain ?? '').toLowerCase().includes(needle)
      )
    })
  }, [restaurants, query, status])

  const open = shown.find((r) => r.id === openId) ?? null

  return (
    <div className="wash min-h-full">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <div>
            <Link to="/" className="font-display text-[26px] leading-none hover:text-accent">
              Happy Table
            </Link>
            <p className="mt-1.5 text-[12px] uppercase tracking-[0.12em] text-ink-faint">
              Operator console
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-right text-[12px] leading-tight text-ink-faint sm:block">
              Signed in as
              <br />
              <span className="text-ink-soft">{admin?.email}</span>
            </span>
            <Button variant="secondary" size="sm" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-7">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Restaurants" value={counts.total} />
          <Stat label="Active" value={counts.active} tone="ready" />
          <Stat label="Suspended" value={counts.suspended} tone={counts.suspended ? 'late' : undefined} />
          <Stat label="Dishes on platform" value={counts.dishes} />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, subdomain, owner or domain"
            // Full width on a phone: sharing a row with the filter chips
            // there leaves a box too narrow to read what you have typed.
            className={`${inputClass} h-10 w-full min-w-0 text-[14px] sm:w-auto sm:flex-1`}
          />
          <div className="flex gap-1 rounded-control border border-line bg-sunken p-1">
            {[
              { id: 'all', label: 'All' },
              { id: 'active', label: 'Active' },
              { id: 'suspended', label: 'Suspended' },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setStatus(option.id)}
                className={`rounded-[7px] px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
                  status === option.id ? 'bg-raised text-ink' : 'text-ink-faint hover:text-ink-soft'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <Button onClick={() => setCreating(true)}>Add a restaurant</Button>
        </div>

        <div className="mt-4 space-y-3">
          <Banner tone="bad" onDismiss={() => setError(null)}>
            {error}
          </Banner>
          <Banner tone="good" onDismiss={() => setNotice(null)}>
            {notice}
          </Banner>
        </div>

        {/* A created owner's link, held until it is dismissed. Losing it
            means the owner cannot get in and a new one has to be issued. */}
        {invite && (
          <div className="mt-4 rounded-card border border-accent/40 bg-accent-wash p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[13px] font-semibold">
                  {invite.delivered === false || invite.link
                    ? 'Pass this link to the owner'
                    : 'An invite is on its way'}
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-ink-faint">
                  {invite.link
                    ? `It sets ${invite.email}'s password and expires in ${invite.expires_in_minutes ?? 60} minutes. Running on demo data, so there is no email — hand it over yourself.`
                    : invite.delivered === false
                      ? `We could not email ${invite.email}. Open their restaurant’s People screen and send it again.`
                      : `${invite.email} has been emailed a link to set their password. Nobody here ever sees it.`}
                </p>
              </div>
              <button
                onClick={() => setInvite(null)}
                aria-label="Dismiss"
                className="shrink-0 text-ink-faint"
              >
                &times;
              </button>
            </div>
            {invite.link && <CopyableLink link={invite.link} label="Copy link" />}
          </div>
        )}

        {restaurants === null ? (
          <div className="grid place-items-center py-20">
            <Spinner label="Reading the platform" />
          </div>
        ) : shown.length === 0 ? (
          <div className="mt-5 rounded-card border border-line bg-sunken px-6 py-16 text-center">
            <p className="text-[14px] text-ink-soft">
              {restaurants.length === 0
                ? 'No restaurants yet.'
                : `Nothing matches that${status === 'all' ? '' : ` in ${status}`}.`}
            </p>
            {restaurants.length === 0 && (
              <Button className="mt-5" onClick={() => setCreating(true)}>
                Add the first one
              </Button>
            )}
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onOpen={() => setOpenId(restaurant.id)}
              />
            ))}
          </div>
        )}

        {USE_MOCK && (
          <p className="mt-7 rounded-card border border-line bg-sunken p-4 text-[12px] leading-relaxed text-ink-faint">
            Running on demo data. Restaurants created here are kept in this
            browser so they survive a page load and can actually be opened,
            but they exist nowhere else — and their tables, orders and
            sessions still reset on reload. With Firebase connected, the same
            form writes a <code>restaurants</code> document, its tables, its
            permission matrix and its menu, and emails the owner a link to set
            their own password.
          </p>
        )}
      </main>

      {creating && (
        <NewRestaurantSheet
          taken={(restaurants ?? []).map((r) => r.subdomain)}
          onClose={() => setCreating(false)}
          onCreated={async (created) => {
            setCreating(false)
            setNotice(`${created.subdomain}.${PRIMARY_DOMAIN} is live.`)
            if (created.invite) setInvite(created.invite)
            await load()
            // Straight into the new restaurant's menu: the next thing anybody
            // wants after creating one is to put the dishes in.
            setOpenId(created.id)
          }}
        />
      )}

      {open && (
        <RestaurantSheet
          restaurant={open}
          onClose={() => setOpenId(null)}
          onChanged={load}
        />
      )}
    </div>
  )
}

function RestaurantCard({ restaurant, onOpen }) {
  const suspended = restaurant.status === 'suspended'

  return (
    <div className="flex flex-col rounded-card border border-line bg-surface p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="truncate text-[16px] font-semibold">{restaurant.name}</p>
        <span
          className={`shrink-0 rounded-pill px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] ${
            suspended
              ? 'bg-state-late-bg text-state-late'
              : 'bg-state-ready-bg text-state-ready'
          }`}
        >
          {restaurant.status}
        </span>
      </div>

      <p className="mt-1 truncate text-[12px] text-ink-faint">
        {restaurant.customDomain ?? `${restaurant.subdomain}.${PRIMARY_DOMAIN}`}
      </p>

      <p className="tabular mt-0.5 text-[12px] text-ink-faint">
        {restaurant.tables} tables &middot; {restaurant.dishes} dishes
      </p>

      {restaurant.ownerEmail && (
        <p className="mt-0.5 truncate text-[12px] text-ink-faint">{restaurant.ownerEmail}</p>
      )}

      <div className="mt-auto flex gap-2 pt-4">
        <Button size="sm" full onClick={onOpen}>
          Manage
        </Button>
        <a href={tenantUrl(restaurant.subdomain, '/')} className="flex-1">
          <Button size="sm" variant="secondary" full>
            Open
          </Button>
        </a>
      </div>
    </div>
  )
}
