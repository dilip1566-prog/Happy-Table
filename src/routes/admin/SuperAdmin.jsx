import { useEffect, useState } from 'react'
import { USE_MOCK, listRestaurants } from '../../data'
import { tenantUrl, rememberOverride } from '../../tenant/resolve'
import { Banner, Button, Card, Field, SectionTitle, inputClass } from '../../components/ui'

/**
 * Our console, not a restaurant's — it renders on the bare apex domain
 * where no tenant resolves.
 *
 * Restaurants are provisioned by us rather than signing themselves up,
 * because onboarding is real work: importing a menu, setting table counts,
 * issuing the owner's login. Self-service can follow once that is
 * automated.
 *
 * SCAFFOLD. The list below is local state. Creating a real restaurant needs
 * a Firestore write plus a Firebase Auth user for the owner, and creating an
 * auth user from an admin screen requires either a secondary Auth instance
 * or a Cloud Function — see REFACTOR-MAP.md §E.
 */
export default function SuperAdmin() {
  const [restaurants, setRestaurants] = useState([])
  const [form, setForm] = useState({ name: '', subdomain: '', ownerEmail: '', tables: 20 })
  const [notice, setNotice] = useState(null)

  // The platform's real roster. Showing an empty console while two
  // restaurants are live is worse than useless — it is how you end up
  // opening the wrong one and wondering why a table code is rejected.
  useEffect(() => {
    let cancelled = false
    listRestaurants()
      .then((rows) => !cancelled && setRestaurants(rows))
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const set = (field) => (event) =>
    setForm((f) => ({ ...f, [field]: event.target.value }))

  const slugify = (value) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
      .slice(0, 30)

  const create = (event) => {
    event.preventDefault()
    const subdomain = slugify(form.subdomain || form.name)
    if (!form.name.trim() || !subdomain) return

    if (restaurants.some((r) => r.subdomain === subdomain)) {
      setNotice({ tone: 'bad', text: `${subdomain} is already taken.` })
      return
    }

    setRestaurants((list) => [
      ...list,
      {
        id: subdomain,
        name: form.name.trim(),
        subdomain,
        ownerEmail: form.ownerEmail.trim(),
        tables: Number(form.tables) || 20,
        status: 'active',
      },
    ])
    setForm({ name: '', subdomain: '', ownerEmail: '', tables: 20 })
    setNotice({ tone: 'good', text: `${subdomain} created.` })
  }

  const open = (slug) => {
    // On localhost a subdomain may not resolve, so dev keeps a query-string
    // route into the same tenant.
    if (import.meta.env.DEV) {
      rememberOverride(slug)
      window.location.href = `/?tenant=${slug}`
      return
    }
    window.location.href = tenantUrl(slug, '/')
  }

  return (
    <div className="wash min-h-full">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-5xl items-baseline justify-between px-5 py-6">
          <div>
            <h1 className="font-display text-[30px] leading-none">Operator console</h1>
            <p className="mt-1.5 text-[12px] uppercase tracking-[0.12em] text-ink-faint">
              Restaurants on the platform
            </p>
          </div>
          <span className="rounded-pill border border-line-strong bg-surface px-3 py-1.5 text-[12px] font-semibold text-ink-soft">
            {restaurants.length} active
          </span>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-5 py-8 lg:grid-cols-[minmax(0,340px)_1fr]">
        <section>
          <SectionTitle hint="Each gets its own subdomain">Add a restaurant</SectionTitle>
          <Card className="p-5">
            <form onSubmit={create} className="space-y-4">
              <Field label="Restaurant name">
                <input
                  required
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Royal Sweet Mart"
                  className={inputClass}
                />
              </Field>

              <Field
                label="Subdomain"
                hint={`Guests will use ${slugify(form.subdomain || form.name) || 'name'}.happtable.co.uk`}
              >
                <input
                  value={form.subdomain}
                  onChange={set('subdomain')}
                  placeholder={slugify(form.name) || 'royalsweetmart'}
                  className={inputClass}
                />
              </Field>

              <Field label="Owner email" hint="They sign in with this">
                <input
                  required
                  type="email"
                  value={form.ownerEmail}
                  onChange={set('ownerEmail')}
                  placeholder="owner@royalsweetmart.co.uk"
                  className={inputClass}
                />
              </Field>

              <Field label="Tables">
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={form.tables}
                  onChange={set('tables')}
                  className={inputClass}
                />
              </Field>

              <Button type="submit" full size="lg">
                Create restaurant
              </Button>

              {notice && (
                <Banner tone={notice.tone} onDismiss={() => setNotice(null)}>
                  {notice.text}
                </Banner>
              )}
            </form>
          </Card>

          {USE_MOCK && (
            <p className="mt-4 rounded-card border border-line bg-sunken p-4 text-[12px] leading-relaxed text-ink-faint">
              Running on demo data, so restaurants created here live in this
              page only. With Firebase connected this writes a{' '}
              <code>restaurants</code> document and issues the owner&rsquo;s
              login.
            </p>
          )}
        </section>

        <section>
          <SectionTitle hint="Open one to see it as its guests do">
            Platform
          </SectionTitle>

          {restaurants.length === 0 ? (
            <Card className="px-6 py-14 text-center">
              <p className="text-[14px] text-ink-faint">
                No restaurants yet. Add one on the left.
              </p>
              {USE_MOCK && (
                <Button
                  variant="secondary"
                  className="mt-5"
                  onClick={() => open('bobbys')}
                >
                  Open the demo restaurant
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {restaurants.map((r) => (
                <Card key={r.id} className="p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-[16px] font-semibold">{r.name}</p>
                    <span className="rounded-pill bg-state-ready-bg px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-state-ready">
                      {r.status}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-[12px] text-ink-faint">
                    {r.subdomain}.happtable.co.uk
                  </p>
                  <p className="tabular mt-0.5 text-[12px] text-ink-faint">
                    {r.tables} tables
                    {r.dishes ? ` · ${r.dishes} dishes` : ''}
                    {r.ownerEmail ? ` · ${r.ownerEmail}` : ''}
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    full
                    className="mt-3"
                    onClick={() => open(r.subdomain)}
                  >
                    Open
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
