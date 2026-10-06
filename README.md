# Bobby's &middot; Service

Bobby's menu and ordering across three surfaces — guest phone, front-of-house tablet,
kitchen display — on React (Vite) + Tailwind v4.

**Currently running on in-memory demo data. Firebase is wired but switched off.**

```bash
npm install && npm run dev
```

| Route                | Device        | Job                                         |
| -------------------- | ------------- | ------------------------------------------- |
| `/customer/:tableId` | Guest's phone | QR scan → menu → cart → live order tracking  |
| `/manager`           | Tablet        | Floor plan, seating, menu, billing           |
| `/kitchen`           | Tablet        | Ticket rail, 86 list                         |
| `/`                  | Any           | Dev switchboard (not used in service)        |

---

## Switching back to Firebase

One constant, in [src/data/index.js](src/data/index.js):

```js
export const USE_MOCK = false
```

Everything above that file — every hook, every component — imports its data
from `src/data` and has no idea which backend is behind it. The Firestore code
is untouched in [src/firebase.js](src/firebase.js),
[src/lib/actions.js](src/lib/actions.js) and
[src/data/firestoreAdapter.js](src/data/firestoreAdapter.js).

Two things to do at the same time:

1. **Fill in `.env`** (see `.env.example`) and create the Firestore database.
2. **Add the four new menu fields.** The design needed `category`,
   `description`, `diet` and `spice`, which the original schema did not have.
   `ManagerMenu` already writes them; existing menu documents need
   backfilling. `scripts/seed.js` writes the old shape and should be updated
   from `src/mock/data.js`, which has the full shape.

Also note `useMenu` currently subscribes rather than fetching, purely so a
newly-added dish shows up instantly while the design is being reviewed. It
already branches on `USE_MOCK` and collapses back to a single cached
`getDocs()` when you flip the switch.

---

## Staff sign-in & permissions

Guests never sign in — they scan and order. Everything staff-facing sits
behind a four-digit PIN keypad at `/login`. PIN rather than email and
password because this is a shared tablet at a pass, operated with wet hands
mid-service; it is what every till in the country uses, for that reason.

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

PINs are checked in the browser and the permission map is client-side. Anyone
who can open DevTools can read both. That is fine for reviewing the design and
**not** fine anywhere near a real till.

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

## Demo data

In-memory, seeded so every UI state is visible on load: two parties seated
(one across linked tables 3 + 4), two walk-ins knocking, four tickets at
various ages including one already late, and one dish 86'd.

It syncs across browser tabs via `BroadcastChannel`, so you can put `/kitchen`
and `/customer/3` side by side and watch one drive the other — the behaviour
Firestore would give you. A reload resets the restaurant. "Simulate walk-in" in
the manager header drops a new arrival onto the floor.

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
  mock/data.js                seed menu, tables, sessions, orders
  firebase.js                 init + constants (only runs when configured)
  lib/actions.js              every Firestore write, in one file
  lib/format.js               money, clocks, ticket urgency
  hooks/                      useTables · useInventory · useMenu
                              useActiveOrders · useSessions · useTicker
  components/ui.jsx           the primitives
  index.css                   design tokens
  routes/customer|manager|kitchen
```

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

Not yet exercised: anything against real Firestore — `USE_MOCK` has been true
throughout.

---

## Firestore rules

[firestore.rules](firestore.rules) is a working starting point, not production
security. As written, anyone who can reach the project can seat themselves and
edit the menu. Fine on closed restaurant Wi-Fi; before exposing this publicly,
put the manager and kitchen routes behind Firebase Auth and gate the `allow`
rules on `request.auth`. Every line that needs changing is marked.
