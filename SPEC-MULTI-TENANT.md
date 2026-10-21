# Multi-tenant build spec

Turning the current single-restaurant app into a product sold to many
restaurants, each with their own account, their own menu, and their own
guests.

Status: **specification only. Nothing in this document is built yet.**

---

## 1. What we are building

Today the app serves one restaurant. Bobby's name, Bobby's 171 dishes and
Bobby's twenty tables are compiled into the code.

The product is the same three surfaces — guest, front of house, kitchen —
sold to many restaurants at once. Each restaurant signs in with an **email
and password**, sees only their own data, and hands their guests a URL that
belongs to them.

Two separate ideas of "login" now exist, and keeping them apart is the
single most important thing in this document:

| | Who | How they sign in | Scope |
| --- | --- | --- | --- |
| **Account** | The restaurant, as a customer of ours | Email + password | One restaurant |
| **Staff** | Owner, manager, waiter, kitchen | 4-digit PIN | Within that restaurant |

The PIN system already built stays exactly as it is. It simply becomes
per-restaurant: two restaurants can both have a waiter whose PIN is 3333,
and neither can see the other.

---

## 2. Decisions needed before any code

These five answers shape everything. Three of them are expensive to change
later.

### 2.1 Guest URL shape — HARD TO REVERSE

QR codes get printed and stuck to tables. Changing this later means
reprinting every sticker in every restaurant.

| Option | Guest sees | Work | Verdict |
| --- | --- | --- | --- |
| Path | `app.co.uk/r/bobbys/t/7` | Lowest — ships today | **Recommended to start** |
| Subdomain | `bobbys.app.co.uk/t/7` | Wildcard DNS + certificate | Better brand, add later |
| Custom domain | `order.bobbys.co.uk` | Per-restaurant DNS | Premium tier only |

**Recommendation:** path-based now, with the routing written so subdomains
can be added later *without invalidating printed codes* — a subdomain simply
resolves to the same tenant and redirects.

### 2.2 Who creates a restaurant account?

**Recommendation: we provision, they do not self-sign-up.** For the first
fifty this is right, because onboarding is real work — importing their menu
from a PDF or spreadsheet, setting table counts and seat numbers. Self-
service signup can follow once that is automated.

This means we need a small **operator console** of our own (section 5).

### 2.3 Data isolation model — HARD TO REVERSE

| Option | Shape | Risk |
| --- | --- | --- |
| **Subcollections** | `restaurants/{rid}/orders/{id}` | Rules are one line and airtight |
| Flat + field | `orders/{id}` with `restaurant_id` | One forgotten `where` clause leaks data between restaurants |

**Recommendation: subcollections.** The security rule becomes a single
statement that cannot be bypassed by a careless query:

```
match /restaurants/{rid}/{document=**} {
  allow read, write: if request.auth.token.restaurantId == rid;
}
```

With the flat model, every query everywhere must remember to filter, and the
first one that forgets shows one restaurant another's takings.

### 2.4 One account per restaurant, or several?

**Recommendation: several, with an owner flag.** A restaurant with two
directors will ask on day one. Cheap now, awkward to retrofit.

### 2.5 What we charge for

Out of scope for the build, but it changes the schema, so decide the shape:
flat monthly fee, per-table, or per-order. A `plan` and `status` field on the
restaurant document covers all three and costs nothing to add now.

---

## 3. Sequencing — read this before planning dates

The current app runs entirely on in-memory mock data. Staff PINs are checked
in the browser. The Firestore rules are wide open and the Firestore adapter
has never executed.

**Multi-tenancy must not be built on that foundation.** With one restaurant,
weak security is a risk to one business. With fifty, the failure mode is one
restaurant reading another's takings, or editing their menu — which ends the
product, not just the engagement.

Recommended order:

| Phase | Work | Why first |
| --- | --- | --- |
| **0** | Firebase live for one restaurant. Real auth, tight rules, tested. | Everything below assumes a real backend |
| **1** | Tenant scoping: data model, rules, routing, tenant-aware UI | The core of the change |
| **2** | Operator console: create restaurants, issue credentials | How we onboard the fifty |
| **3** | Onboarding tools: menu import, table setup, QR sheet printing | Makes each new restaurant minutes, not hours |
| **4** | Billing and subscription state | Only matters once they are live |

Phase 0 is already overdue and is not additional work — it is work the
single-restaurant app needs regardless.

---

## 4. What changes in the existing code

| Area | Today | Becomes |
| --- | --- | --- |
| `src/mock/data.js` `RESTAURANT` | Hard-coded constant | Loaded from the tenant document |
| Menu (171 dishes) | Hard-coded array | Per-restaurant collection |
| Tables (20, fixed seats) | Hard-coded seed | Per-restaurant, configurable |
| Access codes 51–99 | Unique globally | Unique **per restaurant** |
| `src/mock/store.js` | One global store | Per-tenant, or removed with Phase 0 |
| Staff PINs | Checked in the browser | Server-side, scoped to the restaurant |
| `src/data/index.js` | `USE_MOCK` toggle | Real backend; tenant id resolved from the URL |
| Routes | `/customer`, `/manager` | `/r/:slug/customer`, `/r/:slug/manager` |

The three surfaces, the permission matrix, the table and billing logic and
all the design work carry over unchanged. This is a change of foundation,
not of product.

---

## 5. Operator console (ours, not theirs)

A separate area, reachable only by us:

- List all restaurants: name, slug, plan, status, orders this month
- Create a restaurant: name, slug, table count, currency, owner email
- Issue or reset the owner's password
- Suspend or reactivate an account
- Support access into a restaurant — **logged and visible to them**, never silent
- Basic usage, for billing and for spotting a restaurant in trouble

---

## 6. Per-restaurant settings

What a restaurant owner can change for themselves:

- Name, logo, tagline, guest-facing colours
- Tables: how many, seats each, names if they use them
- Menu: import, add, edit, 86
- Staff and the permission matrix *(already built)*
- Currency and tax display
- Their guest URL, and a printable QR sheet for every table

---

## 7. Things that will bite

Known in advance, cheaper to plan for than to discover:

1. **Printed QR codes are permanent.** Decide the URL shape once (2.1).
2. **Access codes must be scoped per restaurant** or two restaurants both
   using code 65 will cross guests over. This is a live bug waiting in the
   current code.
3. **Firestore costs scale with tenants.** The read-optimisation already in
   the app matters more now, not less.
4. **Support access must be auditable.** Being able to enter a customer's
   account invisibly is a liability; log it and show them.
5. **Menu import is the real onboarding cost.** Bobby's menu came from a
   spreadsheet and needed a custom parser. Fifty restaurants will arrive in
   fifty formats. Budget for this properly — it is the difference between
   onboarding taking ten minutes and taking a day.
6. **One restaurant's outage must not be everyone's.** Shared infrastructure
   means a bad deploy affects all fifty at once.

---

## 8. Open questions for the owner

1. Path or subdomain for guest URLs? *(2.1 — decide before any QR is printed)*
2. Do restaurants self-serve signup, or do we provision? *(2.2)*
3. One login per restaurant, or several? *(2.4)*
4. UK only, or do we need multiple currencies and tax rules?
5. What is the pricing shape? *(2.5)*
6. Do we offer custom domains at a higher tier?
