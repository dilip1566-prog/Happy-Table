# Phase 1 — Audit and implementation plan

Response to the Master Implementation Brief. **No code changed.**

Audited 4 November 2026 against branch `firebase-connection`.
47 source files, ~9,800 lines. Build passes (`vite build`, 1.4s).

Official domain, used throughout from here on: **`happytable.co.uk`**.

---

## 0. Read this first — three findings that block Phase 2

### 0.1 The apex domain in the code is misspelled

`src/tenant/resolve.js:24`

```js
const APEX_DOMAINS = ['happtable.co.uk', 'localhost']
```

`happtable` — no "y". It appears in 8 places, but this one is the only one
that does anything: it is the single constant deciding whether a hostname
resolves to a restaurant.

The consequence is not cosmetic. The moment `happytable.co.uk` is pointed at
this app, `slugFromHost()` finds no matching apex, returns `null`, and
**every restaurant subdomain renders the operator console instead of the
restaurant.** `bobbys.happytable.co.uk` would show our own admin screen to
Bobby's guests.

One-word fix, highest-value finding in the audit. Nothing in Phase 2 works
before it.

(The brief's forbidden string `happypet.co.uk` appears nowhere. Good.)

### 0.2 There is no `/admin` route, and the operator console has no lock on it

`src/App.jsx:37` renders `<TenantProvider onRoot={<SuperAdmin />}>`. When no
tenant resolves, `TenantProvider` returns `onRoot` **instead of** `<Routes>`.

Two consequences:

1. The apex has no router at all. `happytable.co.uk/`, `/admin`,
   `/anything` all render the same component. The brief's `/` marketing site
   and `/admin` console cannot coexist until this changes.
2. **Anyone who loads the apex gets the operator console.** There is no
   sign-in in front of it, and nothing in the app ever reads
   `platformAdmins/{uid}`. Today it only exposes the restaurant list, which
   the rules make public anyway — but Phase 4 puts account creation and
   suspension behind that same open door.

### 0.3 Classic Firebase Hosting has no confirmed wildcard-subdomain support

`firebase.json` uses **classic Hosting** (`hosting.public: "dist"`). Its
custom-domain docs cover single domains and subdomains and do not document
wildcards. **Firebase App Hosting** does support a wildcard domain, but that
is a different product and would be a migration.

`src/tenant/resolve.js:17` currently claims a new tenant is "a DNS wildcard
that already exists — no deploy, no code." That assumption is unverified and
probably wrong for the hosting product in use. It needs settling **before any
QR code is printed**, because the URL shape is the one decision this project
cannot walk back.

Options in §5.2.

---

## 1. What the application actually is

| | |
| --- | --- |
| Stack | Vite 6.4 · React 18 · React Router 6 · Tailwind v4 |
| Shape | **Pure SPA. No server process of any kind.** |
| Backend | Firebase (Auth + Firestore). Project `happy-table-42d9e`. |
| Cloud Functions | **None.** No `functions/` directory, no `functions` key. |
| Data source today | **Mock. In-memory.** `USE_MOCK = true`, `src/data/index.js:21` |
| Tests | **None.** Zero test files. |
| Lint | **No config.** `npx eslint` fails — there is no `eslint.config.*`. |
| Bundle | 649 kB / 169 kB gzip, single chunk, no code splitting |

The absence of a server is the structural fact the whole brief has to be
read against. Everything the Admin SDK would normally do — custom claims,
privileged writes, server-side role checks — either runs in the browser
against security rules, runs in `scripts/seed.js` on a developer's machine,
or does not happen.

### The one good seam

`src/data/index.js` is a genuine adapter boundary. Every hook and component
imports data from there and nowhere else; `mock/store.js` (980 lines) and
`data/firestoreAdapter.js` (875 lines) expose identical surfaces. Swapping
backends really is one constant.

This is worth protecting. It is why the rest of this plan adds to the
adapters rather than reaching around them.

---

## 2. What is built and working

Verified by reading the code and by walking the flows in the dev server.

**Guest (public, no sign-in)**
Menu browsing · dish cards with diet/spice/allergen fields · table-code
redemption · cart · order submission with notes · live order tracker ·
waiting room · live 86 (sold-out) greying

**Floor / waiter**
Floor plan with live table states · seat guests · approve arrivals ·
**combine tables into one bill** · join a table to a party already eating ·
merge two parties · mark cleared · party names across linked tables

**Kitchen**
Order board · fire with a quoted time · mark ready · inventory 86 panel

**Manager / owner**
Dashboard · menu CRUD · billing with **split bills** · sales totals ·
staff management · **18-capability owner-editable permission matrix**

**Platform**
Subdomain → tenant resolution with a gate that runs before any query ·
per-tenant Firestore subcollections · strict isolation rules · Admin-SDK
seeder · a dev-only seed screen that is dead-code-eliminated from production

**Staff passwords (built this session, uncommitted)**
Invite-by-default staff creation where the owner never sets or sees a
password · self-service set/reset at `/reset` · single-use expiring links ·
no account enumeration · rules allow a person to clear only their own
`mustSetPassword` flag and nothing else

That is a substantial, coherent product. **Nothing in the plan below
rewrites any of it.**

---

## 3. What is scaffold, missing, or not what it looks like

| Brief wants | Reality |
| --- | --- |
| Phase 3 — marketing site | **Does not exist.** The apex is the operator console. `index.html` has title "Service", no description, no favicon, no OG tags. |
| Phase 4 — `/admin` | **No route.** See §0.2. |
| Phase 4 — create restaurants | `SuperAdmin.jsx:59` pushes to **local React state**. Nothing persists. Reload and it is gone. |
| Phase 4 — approve/reject, suspend, reactivate, edit, assign owner, search, filter, logout | **None of it exists.** |
| Phase 5 — self-registration | Does not exist. |
| Phase 5 — subscription state | **No fields anywhere.** The restaurant document is `{name, tagline, status, categories}`. `status` is only ever compared against `'suspended'`. |
| Phase 5 — statuses (pending / free pilot / active / suspended / cancelled) | Only `active` and `suspended` exist. |
| Phase 2 — custom domains | No support, no plan. |
| Phase 8 — production data | **The app has never run against live Firestore.** `firestoreAdapter.js:20` says so in its own header: "UNTESTED against a live project." |
| Phase 9 — lint, tests | Neither exists. "Build, lint and test" is **build only** today. |

### Honesty check against the brief's own rule

> *Do not imply that features are available if they have not actually been implemented.*

Two live claims in the repo fail this and should be corrected as part of the
work:

- `src/routes/admin/SuperAdmin.jsx` tells the operator that with Firebase
  connected, creating a restaurant "writes a `restaurants` document and
  issues the owner's login." It does not; that code does not exist.
- `src/tenant/resolve.js:17` claims a wildcard already exists. See §0.3.

---

## 4. Security review

### 4.1 Tenant isolation — structurally sound

Subcollections under `restaurants/{rid}`, with authorisation derived from
`restaurants/{rid}/staff/{uid}` — the staff document *is* the grant. One
lookup answers belonging, employment and role together, and revocation is a
single `isActive: false` write with no token to chase.

A restaurant user cannot reach another restaurant's records by changing a
URL or document ID: the path itself is the check, and the rules deny
anything not explicitly matched. **This is the right model and should not be
touched.**

The SPEC's warning that access codes 51–99 would collide between restaurants
is already resolved by the subcollection model.

### 4.2 Open findings

| # | Finding | Severity | Where |
| --- | --- | --- | --- |
| 1 | Operator console is unauthenticated and unrouted | **High** — becomes critical in Phase 4 | `App.jsx:37` |
| 2 | Nothing in the client ever checks `platformAdmins` | **High** (same cause) | — |
| 3 | `restaurants/{rid}` is world-readable, and `listRestaurants()` is an unauthenticated read of the whole collection | **High the moment Phase 5 lands** | `firestore.rules:66`, `firestoreAdapter.js:80` |
| 4 | Signed-in identity, **including `role`**, is held in `sessionStorage` as plain JSON and trusted by `can()` | **Medium** | `AuthProvider.jsx:19` |
| 5 | `README.md` and `Login.jsx` still describe PIN-era behaviour in places | Low (misleading) | — |
| 6 | No rate limiting on guest order creation beyond "session must be active" | Low | `firestore.rules:109` |

**On #3** — the public read is deliberate and necessary: a guest must resolve
a subdomain before signing in to anything. The rules comment already says
"keep it to presentation fields — never put billing or contact details on
this document." Phase 4 and 5 ask for exactly contact details, subscription
amount and administrative notes. **Those must not go on that document.**

**On #4** — a staff member can edit `sessionStorage`, set `role: "owner"`,
and the *UI* will open the takings and People screens. The Firestore rules
still refuse every write and every staff read, because they re-derive the
role server-side from the staff document. So this is a UI bypass, not a data
breach — but it means the honest statement of the model is:

> **The rules enforce. The permission matrix only shapes what staff see.**

Phase 6 asks that permissions be "enforced by the backend." They are, for
writes. Reads of another tenant are impossible. What a determined staff
member can do is see their *own* restaurant's screens their role should not
show. Worth closing, and cheap to close (§5.6).

### 4.3 Credentials — clean

- `.env` holds the six `VITE_FIREBASE_*` web keys and is gitignored. These
  are **public by design**; shipping them in a browser bundle is correct and
  is not a leak.
- No service account key anywhere in the repo. `.gitignore` covers
  `serviceAccount*.json` and `*-firebase-adminsdk-*.json`.
- The one-time bootstrap window in `firestore.rules:191` is **committed
  disarmed (commented out)**, with the reasoning written down. Correct for a
  public repository — an armed window plus a known address is an invitation,
  because Firebase email/password signup does not verify address ownership.

### 4.4 What could not be verified from here

`firebase login:list` reports no authorised account, so the live console was
not inspected. **Unverified:** which auth providers are enabled, whether the
rules and indexes currently deployed match this repo, whether email
enumeration protection is on, hosting sites, and any custom domains. All
claims above about Firebase come from the repository, not the console.

---

## 5. Implementation plan

Ordered so that each phase is shippable and reviewable on its own, and so
nothing is built on a foundation that is about to move.

### 5.0 Pre-flight (half a day) — do this first, separately

1. Fix `APEX_DOMAINS` to `happytable.co.uk`, and the 7 cosmetic mentions.
2. Commit the finished staff-password work, which is currently uncommitted.
3. Add `eslint.config.js` so "lint" means something in Phase 9.
4. Correct the two overstated claims in §3.

Small, zero-risk, and it unblocks everything else.

### 5.1 Give the apex a router — the keystone change

Replace the short-circuit:

```jsx
<TenantProvider onRoot={<PlatformRoutes />}>
```

`PlatformRoutes` is its own `<Routes>`:

| Path | Who | Phase |
| --- | --- | --- |
| `/` | public marketing site | 3 |
| `/register` | restaurant self-registration | 5 |
| `/reset` | **tenant-neutral** password set/reset | 5.0 |
| `/admin/*` | platform owner console, behind its own gate | 4 |

This also settles the open `/reset` question. Firebase allows **one**
password-reset action URL per project. Today the apex cannot serve `/reset`
and a tenant subdomain would bake one restaurant into a project-wide
template. Putting `/reset` on the apex router gives exactly one correct
answer: `https://happytable.co.uk/reset`. The screen already works without a
tenant; only its `Shell` needs to stop assuming one.

~40 lines. Nothing existing changes behaviour.

### 5.2 Domain and hosting — decide before building Phase 3

The code's subdomain routing is finished and correct. The question is only
whether the hosting can serve `*.happytable.co.uk`.

| Option | Cost | Verdict |
| --- | --- | --- |
| **Classic Firebase Hosting, each subdomain added by hand** | A console step + certificate wait per restaurant; a per-project custom-domain cap | Fine up to ~15 restaurants. Onboarding is not fully self-service. |
| **Firebase App Hosting** | Migration off classic Hosting | Wildcards documented; needs verifying in the console against current docs |
| **Cloudflare Pages / Netlify / Vercel** | Move hosting only; Firestore and Auth stay | True wildcard + one certificate. Cleanest for subdomain-per-tenant. |
| **Path-based: `happytable.co.uk/r/bobbys`** | Routing change; no DNS work at all | What `SPEC-MULTI-TENANT.md` §2.1 originally recommended. Ugliest URL, zero infrastructure risk. |

**Recommendation:** confirm wildcard support in the console first. If classic
Hosting cannot do it, host the SPA on Cloudflare Pages and keep Firebase for
Auth and Firestore — it is a smaller change than migrating to App Hosting
and it keeps subdomains, which are worth more than they cost here.

**Needs you, not me:** the DNS records, domain verification, and the
certificate provisioning wait. I will write the exact records out once the
hosting choice is made. **No live DNS or production configuration will be
touched without your approval.**

### 5.3 Phase 3 — marketing site (2–3 days)

New `src/routes/site/`, reusing the existing design system and `ui.jsx`
components. Product intro, the four surfaces (guest / waiter / kitchen /
management), roles and permissions, **£30 per month** as the standard price,
a restaurant login link, and a clear call to action into `/register`.

Written to describe only what is built. The subscription section will say
plainly that payment is arranged directly, because no payment integration
will exist.

Plus the `index.html` work the brief implies: real title, description,
favicon, OG tags.

### 5.4 Phase 4 — operator console (3–4 days)

**Platform admin sign-in is a separate path from staff sign-in,** and this
matters. Staff sign-in reads `restaurants/{rid}/staff/{uid}` — it needs a
tenant. A platform admin has no tenant. So `/admin` gets its own sign-in
that authenticates with Firebase Auth and then checks `platformAdmins/{uid}`.

The rules already have `isPlatformAdmin()` and already make `platformAdmins`
unwritable from any client. That is the line the whole tenancy model rests
on, and it stays exactly as it is.

Then the ten capabilities from the brief, against real Firestore:
dashboard counts, manual creation, approve/reject, edit, suspend/reactivate,
assign owner + invite, status and activity, search and filter, subscription
amount and notes, logout.

**Creating a restaurant needs no Admin SDK.** The secondary-Firebase-app
pattern already used in `addStaff` creates the owner's auth account without
signing the admin out, then `sendPasswordResetEmail` issues the invite — so
the owner sets their own password and nobody else ever knows it. The only
Admin-SDK-only act left is creating the *first* platform admin, which is a
one-off console write.

### 5.5 Phase 5 — onboarding and subscriptions (2–3 days)

**Schema — and this is the important decision.** Keep `restaurants/{rid}`
public and presentation-only. Everything commercial goes in a sibling
document no client but a platform admin can read:

```
restaurants/{rid}            name, tagline, subdomain, status, categories, currency
                             -> stays world-readable; needed to resolve a subdomain

restaurants/{rid}/private/account
                             plan, amount, currency, status, trialEndsAt,
                             contact, notes, createdAt, activatedAt
                             -> allow read, write: if isPlatformAdmin()

applications/{id}            a self-registration, pending review
                             -> allow create: if shape is valid   (public)
                                allow read, update, delete: if isPlatformAdmin()
```

Self-registration writes an `applications` document and **never** a
`restaurants` document, so a public form cannot create a tenant, and
certainly cannot create a platform admin. Slug uniqueness is checked on
approval, where an admin is present to resolve a clash.

`status` on the public document carries `pending_approval`, `free_pilot`,
`active`, `suspended`, `cancelled`. `TenantProvider` renders the app only for
`active` and `free_pilot`, and gets a plain screen for each of the others —
an unpaid account should be told why.

**No Stripe, no Direct Debit, no payment processing.** A free pilot will be
recorded and labelled as a free pilot, never as a paying subscription. The
shape above is what Stripe would later need, so adding billing will not
require rebuilding tenant management.

### 5.6 Phase 6–7 — permissions and isolation hardening (1–2 days)

Keep everything. Add:

- Derive `role` from the staff document on every load rather than trusting
  the `sessionStorage` copy — closes §4.2 #4 for perhaps 20 lines.
- Audit the rules against the new collections.
- **Write the cross-tenant tests the brief asks for** (Phase 9): a signed-in
  waiter at restaurant A attempting every read and write against restaurant
  B, a guest attempting staff reads, a staff member attempting
  `platformAdmins`, a staff member attempting to change their own role, and
  an `applications` write attempting to set an admin flag. Firestore's rules
  emulator runs these offline, with no project needed.

### 5.7 Phase 8 — going live on Firestore (2–3 days, highest risk)

The adapter has never executed. Expect index errors and timestamp mismatches
on first contact; that is normal and it is why this gets its own phase.

**Make `USE_MOCK` environment-driven instead of a source constant:**

```js
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || !projectId
```

Editing a tracked file before every deploy is how mock data eventually ships
to production. An env var keeps dev on mock and builds production real, which
is what Phase 8 asks for.

Then, in order: deploy rules and indexes · seed **one** restaurant ·
exercise every flow against live data · confirm persistence across refresh
and sign-out · confirm orders and the kitchen board sync in real time ·
only then switch the default.

**Test and production data stay separate** — ideally a second Firebase
project; at minimum, test restaurants under their own slugs that are never
listed publicly.

**No existing restaurant record will be deleted and no production data
overwritten.** The seeder is already written to merge, and to write a menu
only into an empty collection unless explicitly forced.

### 5.8 Phase 9 — testing and deployment

Everything in the brief's list, plus the rules tests from §5.6. What will be
reported honestly as *not* done unless it is actually done: DNS, deployment,
payment collection, production readiness.

---

## 6. External setup that needs you

Nothing here can be done from this machine.

1. **Decide the hosting product** (§5.2) — blocks DNS, and blocks printing QR codes.
2. **DNS for `happytable.co.uk`** — apex, `www`, and wildcard or per-tenant subdomains. I will supply the exact records; you make the change.
3. **Firebase console — authorised domains.** Add `happytable.co.uk` and every subdomain in use under Authentication → Settings, or sign-in is refused there.
4. **Firebase console — password reset action URL.** Set to `https://happytable.co.uk/reset` once §5.1 ships.
5. **Create the first platform admin.** `dilip1566@gmail.com` still has no account in `happy-table-42d9e`. Create the account, then write `platformAdmins/{uid}` by hand in the console. The disarmed bootstrap window in `firestore.rules` expires 8 November 2026 and is only safe to arm while the account already exists and is one you control.
6. **Deploy rules and indexes** — `npm run deploy:rules`.
7. **`firebase login`** on this machine, if you want me to verify console state rather than infer it from the repo.

---

## 7. Estimate

| Phase | Work | Days |
| --- | --- | --- |
| 5.0 | Pre-flight: domain fix, commit, lint config | 0.5 |
| 5.1 | Apex router + tenant-neutral `/reset` | 0.5 |
| 5.3 | Marketing site | 2–3 |
| 5.4 | Operator console | 3–4 |
| 5.5 | Onboarding, applications, subscription schema | 2–3 |
| 5.6 | Permission hardening + isolation tests | 1–2 |
| 5.7 | Firestore go-live | 2–3 |
| 5.8 | Full test pass | 1–2 |
| | | **13–20 days** |

§5.2 is excluded: it is a decision and a DNS change, not development.

---

## 8. Assumptions

Stated rather than silently adopted, per the brief's rule 8.

1. **`happytable.co.uk` is the real domain** and `happtable` in the code is a
   typo, not a second domain you own. If you own `happtable.co.uk` too, say
   so — it should then stay in `APEX_DOMAINS` alongside.
2. **Subdomain-per-restaurant is still wanted.** If §5.2 makes that
   expensive, path-based tenancy is the fallback — but that is your call, not
   mine, because it changes what gets printed on every table.
3. **£30/month is a list price, not a billing system.** It will be shown as a
   price and recorded as an amount; nothing will collect it.
4. **The four roles stay as they are** — owner, manager, waiter, kitchen —
   with the 18-capability matrix on top. The brief lists the same four.
5. **Sessions stay.** The brief attaches orders to tables; this app attaches
   them to a session that can span tables, and linked bills, merges, party
   names and split billing all hang off that. `REFACTOR-MAP.md` §B1 covers
   this. Nothing in the brief is harmed by keeping it.
6. **The table-code flow stays**, not knock-and-wait (`REFACTOR-MAP.md` §B2).
7. **No Cloud Functions, so no Blaze plan**, unless §5.2 forces App Hosting.
