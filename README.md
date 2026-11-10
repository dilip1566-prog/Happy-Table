# Happy Table

Restaurant menu and ordering across three surfaces — guest phone, front-of-house
tablet, kitchen display — sold to many restaurants at once. React (Vite) +
Tailwind v4, Firebase Auth + Firestore, no server of our own.

Official domain: **`happytable.co.uk`**.

**Currently running on in-memory demo data. Firebase is wired but switched off.**

```bash
npm install && npm run dev
```

## Two sets of routes, chosen by hostname

The hostname is resolved in `src/tenant/resolve.js` before anything renders.
It answers one of three ways, and that answer decides which router runs.

### The platform — `happytable.co.uk`, `www.`, or plain `localhost`

Served by `src/routes/platform/PlatformRoutes.jsx`. No restaurant exists on
these addresses, so nothing here may assume one.

| Route          | Who                | Job                                             |
| -------------- | ------------------ | ----------------------------------------------- |
| `/`            | Restaurant owners  | The marketing site, with live demo links         |
| `/admin/login` | Us                 | Platform admin sign-in                           |
| `/admin`       | Us                 | Operator console — create and manage restaurants |
| `/reset`       | Any member of staff | Set a first password, or replace a lost one     |

`/reset` answers here *and* on every restaurant, because Firebase allows
exactly one password-reset action URL per project. The canonical one is
`https://happytable.co.uk/reset`.

### A restaurant — `bobbys.happytable.co.uk`, or its own domain

| Route                | Device        | Job                                        |
| -------------------- | ------------- | ------------------------------------------ |
| `/`                  | Any           | The restaurant's front door                |
| `/login`             | Any           | Staff sign-in                              |
| `/reset`             | Any           | Set a first password, or replace a lost one |
| `/customer/:tableId` | Guest's phone | QR scan → menu → cart → live order tracking |
| `/manager`           | Tablet        | Floor plan, seating, menu, billing         |
| `/kitchen`           | Tablet        | Ticket rail, 86 list                       |

A restaurant that has pointed its own domain at us is matched on the whole
hostname against `customDomain`, rather than on a subdomain label.

### In development

Subdomains of `localhost` work with no DNS setup
(`http://bobbys.localhost:5180`), and where they do not resolve,
`?tenant=bobbys` does the same job and is remembered for the session. Both are
dev-only and compiled out of production.

---

## Switching to Firebase

Everything above [src/data/index.js](src/data/index.js) — every hook, every
component — imports its data from `src/data` and has no idea which backend is
behind it. The Firestore side lives in [src/firebase.js](src/firebase.js) and
[src/data/firestoreAdapter.js](src/data/firestoreAdapter.js), and exposes the
same function surface as the mock.

The order below matters. Seeding before the rules are deployed leaves the
database briefly open; flipping the switch before seeding gives you an empty
restaurant and a sign-in that cannot succeed.

1. **Fill in `.env`** — the six `VITE_FIREBASE_*` values from Firebase
   console → Project settings → Your apps → Web app → Config. See
   `.env.example`. Gitignored; restart Vite afterwards, which only reads it
   at startup.

2. **Enable the two services** in the console: Firestore Database
   (production mode) and Authentication → Email/Password.

3. **Deploy the rules and indexes.** `firebase.json` points the CLI at
   `firestore.rules` and `firestore.indexes.json`:

   ```
   firebase deploy --only firestore:rules,firestore:indexes
   ```

   Seeding needs a platform admin, and `firestore.rules` lets no client
   create the first one. Either seed with the Admin SDK (step 4), write
   `platformAdmins/{uid}` by hand in the console, or open the one-time
   bootstrap window documented in `firestore.rules` — commented out there
   on purpose, because this repository is public and Firebase Email/Password
   signup does not verify address ownership. Close it again straight after.

   With a platform admin in place, `/dev/seed` seeds from the browser using
   only the public web keys — no service account needed. That route exists
   only in dev builds.

4. **Seed.** `scripts/seed.js` runs on the **Admin SDK** and needs a service
   account key (console → Project settings → Service accounts → Generate new
   private key) saved as `serviceAccount.json` in this folder. That file is a
   real secret and is gitignored — unlike the six `VITE_` values, which ship
   in every browser bundle by design.

   ```
   npm run seed -- --admin you@email.com
   ```

   It writes both restaurants from `src/mock/data.js`, so the live database
   and the demo cannot drift apart, and creates one Auth account per staff
   member. `--admin` also writes `platformAdmins/{uid}`, which is what the
   operator console at the apex domain checks. Re-running is safe.

   The seeder must bypass the rules, and does: a restaurant may only be
   created by a platform admin, a menu only by a manager, and the owner's own
   staff document only by an owner — which cannot exist before that document
   does. A browser-SDK seeder cannot break that circle.

5. **Flip the switch** in [src/data/index.js](src/data/index.js):

   ```js
   export const USE_MOCK = false
   ```

6. **Change the passwords.** Everyone is seeded with the demo password.
   Each person should use Forgot password on first sign-in; by design a
   manager cannot set someone else's password.

For live subdomains, add the apex domain under Authentication → Settings →
Authorized domains, or sign-in is refused there.

Note `useMenu` currently subscribes rather than fetching, purely so a
newly-added dish shows up instantly while the design is being reviewed. It
already branches on `USE_MOCK` and collapses back to a single cached
`getDocs()` when you flip the switch.

---

## Staff sign-in & permissions

Guests never sign in — they scan and order. Everything staff-facing sits
behind email and password at `/login`, and inline on the front door at `/`.

### Nobody else sets your password

The owner creates the profile; the person sets their own password. The two
halves meet at `/reset`, which is one screen doing one job for two arrivals:

```
owner, People screen          new starter / locked-out waiter
  Add someone                   /login -> "Forgot your password?"
  -> "They set their own"       or      -> "First time? Set your password"
  -> link sent                           -> enter address, link sent
                    \                   /
                     -> /reset?token=... (or ?oobCode=... from Firebase)
                     -> choose a password, twice
                     -> sign in, address already filled in
```

A first password and a forgotten one are the same screen on purpose. A new
starter should not have to work out that "forgot password" applies to a
password they have never had.

The owner can still type a temporary password — it is the second option on
the form, for someone standing at the pass with no phone. It is second
because a password the owner types is a password the owner has to say out
loud across a kitchen.

Three properties the screens depend on, enforced in both backends:

- **One live link per person.** Issuing a new one retires the old, so an
  older copy of an email cannot be replayed.
- **Single use, one hour.** Checked before the form is shown, not after the
  password has been typed twice.
- **No account enumeration.** "Check your email" is worded and returned
  identically whether or not the address belongs to anybody. A sign-in
  screen that answers "does this person work here?" is a staff directory.

On demo data there is no mail server, so the link is shown on screen instead
of sent — that block is behind `USE_MOCK` and disappears with it.

### What Firebase needs

`sendPasswordResetEmail`, `verifyPasswordResetCode` and
`confirmPasswordReset` do the work, so no password belonging to someone else
ever passes through this app or the owner's hands. Two console settings:

1. **Authentication → Templates → Password reset → customise action URL** →
   `https://<your-domain>/reset`. Without this, Firebase's email points at
   its own hosted page and the screen in this app is never reached. Both are
   functional; only one is yours.
2. **Re-deploy the rules.** `firestore.rules` gained a narrow `allow update`
   letting a person clear their own `mustSetPassword` flag and nothing else.
   Skipping it costs only a stale "Invited" badge on the owner's screen —
   sign-in, resets and everything else work regardless.

Inviting creates the Auth account with a CSPRNG password that is generated,
used once and never returned, logged or displayed; the emailed link is the
only way in.


### Capabilities, not screens

Access is granted per *action*, not per page, because the real rules cut
across pages: a manager opens the billing screen but must not see the day's
takings. Route-level gating would force that to be all-or-nothing.

The catalogue lives in [src/auth/permissions.js](src/auth/permissions.js) —
thirteen capabilities across Floor, Orders, Menu, Money and People.

### Four roles, owner-editable

| Role | Starts with |
| --- | --- |
| **Owner** | Everything. Locked — there must always be one account that can undo a mistake. |
| **Manager** | Everything except takings and access control. |
| **Waiter** | Floor only: seating and combining tables. |
| **Kitchen** | The order board and marking orders ready. |

These are *defaults*, not law. The owner opens **People** and flips any
capability for any role in a matrix. "The manager can do everything except
see the takings" is a switch, not a code change.

Kitchen deliberately starts without *fire a ticket* or *86 a dish*. Most
kitchens will want both, but that should be the owner's decision rather than
something that quietly arrived switched on.

### How it behaves

Changes apply live to every signed-in device — the permission map is a
subscription, so revoking something takes effect without anyone logging out.
Hidden controls are hidden, not disabled; a button a waiter can never press is
clutter. Routes refuse directly-typed URLs, and the two refusals are worded
differently on purpose — "please sign in" when you already are is the classic
way to make staff think the app is broken.

The session lives in `sessionStorage`, so closing the tab signs out. A login
that survives the browser closing is a login nobody remembers to end.

### This is a design build, not security

On demo data, passwords are compared in the browser and the permission map is
client-side. Anyone who can open DevTools can read both. That is fine for
reviewing the design and **not** fine anywhere near a real till. The reset
links are in memory too, so a reload forgets every one of them.

Under Firebase none of that applies to passwords — Auth holds them, mints and
redeems the reset codes, and this app never sees one. The permission map is
still client-side.

Before this goes live, sign-in and the permission map must move server-side —
Firebase Auth with custom claims, enforced again in Firestore rules. The
Firestore adapter already throws on every auth call rather than silently
granting everyone everything, so flipping `USE_MOCK` fails loudly instead of
looking like it works.

## The design

### One dark system

Dark started in the kitchen for hard reasons — a KDS sits under hot lamps, is
read from two metres away, and a bright panel in a dim pass is a glare source.
It now runs across all three surfaces as a house style: a dim dining room, a
phone at the table and a tablet at the pass all stop being the brightest
object in the room.

Warm near-blacks, not blue-greys. A cold UI next to food looks clinical.

### Gradients

Two in the entire system, both functional: a scrim for text over photography,
and a sub-5% warm wash on hero and empty states. No gradient buttons, no
gradient text, no gradient cards.

### Colour

One accent — terracotta, lifted for dark ground — used only for controls and
selection, so a button never competes with a state. Four state hues used
identically everywhere: amber = new/waiting, blue = cooking/seated,
green = ready/open, red = late. Status is never carried by colour alone.

### Type

`Instrument Serif` for display, `Inter` for everything else. Anything that
ticks or tallies uses tabular numerals so it does not jitter.

### Responsive

| Width | Guest | Manager | Kitchen |
| --- | --- | --- | --- |
| Phone (<640) | 1 column, sticky search, cart pinned bottom | nav full-width, 2-up stats and tables | tickets stack vertically |
| iPad (768–1279) | 2 columns | 3–4 table columns, billing stacks | ticket rail scrolls horizontally |
| Desktop (1280+) | 3 columns, capped and centred | up to 6 table columns, split billing | full rail, capped at 1600px |

Verified with no horizontal overflow at 375, 1024 and 1280.

## What each surface does

**Guest.** Hero, then a sticky course rail, then the menu. Every dish carries
the statutory veg / non-veg mark and a three-dot heat scale (dots rather than
chilli emoji, which renders differently on every phone and turns to mush below
16px). Sold out is signalled three ways at once — desaturated photo, struck
price, explicit label — so it never depends on colour. A dish that sells out
while it is sitting in a cart is removed from it.

Once an order is in, a live tracker strip shows Received → Cooking → On its
way, with the kitchen's quoted time as a countdown. This is the single biggest
reduction in "where is our food?" floor traffic and by 2026 guests simply
expect it.

The cart shows GST explicitly. A total that jumps between the phone and the
printed bill is the fastest way to start an argument at the table.

**Front of house.** The floor plan shows the whole room, not just the arrivals
queue — the real question is never "who is waiting" in isolation, it is "who is
waiting, and do I have anywhere to put them". Multi-table selection is the
normal path, not an edge case; pushing two tables together for a party of six
links them into one session and one bill.

Closing a tab is two-step: the button arms a confirm that names exactly which
tables are about to be released. Destructive-by-accident is the failure mode
here, not slow.

**Kitchen.** A horizontal rail of fixed-width ticket columns, oldest first —
the layout every kitchen already knows from a paper rail. The elapsed clock is
the largest element on each card and ticks every second. Urgency is computed
against the kitchen's own quoted prep time, not a flat threshold, so a ticket
quoted at 30 minutes does not turn red at 12. Marking a ticket ready drops it
out of the query; nothing needs cleaning up.

The 86 list uses the kitchen's own word for it, and sorts what is *off* to the
top — that is the part a chef needs to see.

---

## The operator console

`/admin` on the apex, behind a platform-admin sign-in. On demo data the
credential is `admin@happytable.co.uk` / `admin1234`, printed on the sign-in
screen. With Firebase connected it authenticates against Firebase Auth and
then checks `platformAdmins/{uid}` — a collection no client can write, which
the security rules check again on every read. Authentication is not
authorisation, and those are two separate steps on purpose.

**Creating a restaurant provisions it completely** in one call: the record,
every table numbered with standard seat counts, `config/inventory`,
`config/access` seeded with the default permission matrix, the owner's
account, and the menu. Half a restaurant is worse than none — it looks ready
and then fails on the first thing anybody tries.

The owner's password is optional and leaving it blank is the better path: the
account is created with a CSPRNG string that is never returned, logged or
shown, and the set-your-password email is the only way in. Nobody at the
platform ever knows a restaurant owner's password.

### Loading a menu

The real cost of onboarding, so there are three ways in, all from the same
screen:

- **A starter template** — fifteen generic dishes in five sections, so every
  screen is walkable from the first minute.
- **Paste from a spreadsheet** — comma- or tab-separated, which is what the
  clipboard carries out of Excel and Sheets. Quoted fields are respected, so
  a description with a comma in it stays one field. `£`-prefixed prices parse.
  Every row is previewed before anything is written, with bad rows named by
  line number — a shunted column is the way this goes wrong, and it is silent
  unless you show the parse.
- **One at a time**, from the restaurant's Menu tab.

New sections found in a paste are created automatically and listed before
commit, so a typo makes a visible new section rather than an invisible one.

---

## Demo data

Three restaurants are seeded: **Bobby's** (171 dishes), **Star Vashnu Dhaba**
(163 dishes, with photography) and **Feast India** (26 dishes, its own domain,
and the only one serving meat — so it is the one that exercises
`diet: 'non-veg'`).

In-memory, seeded so every UI state is visible on load: two parties seated
(one across linked tables 3 + 4), two walk-ins knocking, four tickets at
various ages including one already late, and one dish 86'd.

It syncs across browser tabs via `BroadcastChannel`, so you can put `/kitchen`
and `/customer/3` side by side and watch one drive the other — the behaviour
Firestore would give you. A reload resets the restaurant. "Simulate walk-in" in
the manager header drops a new arrival onto the floor.

Two things deliberately outlive a reload, because in Firestore they would:
restaurants created from the operator console, and outstanding
set-your-password links. Both sit in `localStorage`. Without the first, a
restaurant created ten seconds ago would 404; without the second, clicking an
invite link would destroy the token it carries, since clicking a link *is* a
page load. Live service state — tables, sessions, orders — still resets.
Clear them with `localStorage.removeItem('happytable-mock-restaurants')` and
`…('happytable-mock-resets')`.

**The dish photographs are Unsplash placeholders and several do not match
their dish.** Swap them for real photography. Missing or broken images fall
back to a monogram tile rather than a blank square, since a kitchen adds a dish
at 6pm and photographs it next week.

---

## Layout

```
src/
  data/index.js            ← THE SWAP POINT (USE_MOCK)
  data/firestoreAdapter.js    Firestore implementation (dormant)
  mock/store.js               in-memory store + BroadcastChannel sync
  mock/data.js                seed menus, tables, staff for all three tenants
  firebase.js                 init + constants (only runs when configured)

  tenant/resolve.js        ← hostname -> platform | slug | custom domain
  tenant/TenantProvider.jsx   the gate: resolves before any query runs
  admin/                      platform-admin session + /admin guard

  lib/format.js               money, clocks, ticket urgency
  lib/slug.js                 subdomain rules, shared by both backends
  lib/menuImport.js           CSV/TSV menu parsing
  lib/starterMenu.js          the template a new restaurant can start from
  hooks/                      useTables · useInventory · useMenu
                              useActiveOrders · useSessions · useTicker
  components/ui.jsx           the primitives
  index.css                   design tokens

  routes/platform/            the apex router
  routes/business/            the marketing site
  routes/admin/               operator console: list, create, menu management
  routes/customer|manager|kitchen
```

### Two kinds of data call

Everything a restaurant's own screens do is scoped to the active tenant by
`requireTenant()`. The operator console cannot use any of it — it runs on the
apex, where no tenant is resolved, and it edits restaurants it is not inside.
So the platform section of each adapter names its restaurant in an argument
instead: `createRestaurant`, `fetchRestaurantMenu`,
`addMenuItemToRestaurant`, `bulkAddMenuItems`,
`deleteMenuItemFromRestaurant`, `updateRestaurant`.

### The unsubscribe rule survived the rewrite

Every subscription still returns its cleanup from the `useEffect` that opened
it — six `useEffect`s across six hooks, six cleanups. The mock's `subscribe()`
returns an unsubscribe function exactly as `onSnapshot` does, so the discipline
is enforced identically in both backends and flipping `USE_MOCK` cannot
introduce a leak.

`main.jsx` keeps `<React.StrictMode>` on. Its dev double-mount is what surfaces
a subscription that forgot to clean up.

---

## Verified

Production build passes. All four routes render with no console errors.
Checked by hand: cart and GST totals, the 86 toggle greying a dish out on a
*separate browser tab*, ticket urgency colouring (red past the quote, amber
approaching it), live elapsed clocks, and the image fallback.

**Rules: verified against live Firestore** (project `happy-table-42d9e`, on an
empty database). Reads of the restaurant record and menu are open as intended;
unauthenticated reads of `staff` and `platformAdmins`, and unauthenticated
writes to restaurants, menus, staff, sessions and unmatched collections, all
return 403. Probed over the REST API with no auth token, which is exactly how
a stranger arrives.

Not yet exercised: the app's own read and write paths against real Firestore —
`USE_MOCK` has been true throughout, so the adapter has never run against
anything but the mock.

---

## Firestore rules

[firestore.rules](firestore.rules) is a working starting point, not production
security. As written, anyone who can reach the project can seat themselves and
edit the menu. Fine on closed restaurant Wi-Fi; before exposing this publicly,
put the manager and kitchen routes behind Firebase Auth and gate the `allow`
rules on `request.auth`. Every line that needs changing is marked.
