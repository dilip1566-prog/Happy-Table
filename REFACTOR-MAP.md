# Step 1 — Analyse & map

Response to the multi-tenant refactor brief. **No code changed yet.**

This document does two things: maps what the refactor touches, and flags
where the brief and the existing app disagree. Several of those
disagreements would quietly undo decisions made deliberately in the last
week, so they need a ruling before anything is built.

---

## A. What the codebase actually is

| | Brief assumes | Reality |
| --- | --- | --- |
| Framework | Next.js middleware / Express | **Vite + React + React Router — a pure SPA with no server at all** |
| Backend | Firebase Admin SDK available | No server process exists to run it |
| Data | Mock or local calls | In-memory store behind a swappable adapter (`src/data/index.js`) |
| Auth | To be integrated | Built: PIN keypad, 4 roles, 18 owner-editable capabilities |

The adapter seam is the good news: `USE_MOCK` in `src/data/index.js` is the
only place that decides where data comes from, and every hook and component
already reads through it. The data-layer swap is genuinely one file plus the
Firestore implementations behind it.

The bad news is routing and the Admin SDK. There is no server. Subdomain
resolution has to happen client-side from `window.location.hostname`, and
anything needing the Admin SDK — custom claims, `revokeRefreshTokens` —
needs **Cloud Functions, which requires the Blaze (paid) plan**. The whole
app was built to sit inside the free tier; this is the point where that
stops being true.

---

## B. Conflicts needing a decision

### B1. The brief has no concept of a session — this is the big one

The brief attaches orders directly to a `tableId`. The existing app attaches
them to a **session**, and a session can span several tables.

Everything built this week hangs off that:

- Linking tables into one bill
- Joining a table to a party that is already eating
- Merging two parties onto one bill
- Party names ("Shayan") shown across every linked table
- Access codes, which identify a *party*, not a table
- Billing, which totals by `session_id`

Adopting the brief's model as written **deletes all of it.** A party across
tables 6, 7 and 8 would become three unrelated bills.

**Recommendation:** keep `sessions` as a subcollection and let orders carry
`sessionId` as well as `tableId`. Nothing else in the brief is harmed.

### B2. "Request to join table" reverts the flow you replaced

The brief specifies: customer picks a table → creates a `tableJoinRequest` →
waits for staff approval → menu unlocks.

That is the knock-and-wait model, which you explicitly replaced with the
table-code flow: browse the menu freely, order once a server hands over a
code. You called the dead waiting time the thing worth removing, and you
were right.

**Recommendation:** keep the code flow. `tableJoinRequests` is not needed —
`sessions` with an `access_code` already does this job, with less waiting.

### B3. Staff login — email/password or PIN?

The brief puts staff on Firebase Auth email/password. The app uses a
four-digit PIN keypad, chosen because staff sign in on a shared tablet at a
pass, mid-service, with wet hands.

Both are needed, for different people:

| | Who | How |
| --- | --- | --- |
| Account | The restaurant as our customer | Email + password |
| Staff | Owner, manager, waiter, kitchen | PIN, scoped to the restaurant |

**Recommendation:** email/password authenticates the *device* to the
restaurant; PINs then switch between staff on that device. This is how
every till in the country works and it keeps both the brief and the
existing design.

### B4. Four fixed roles vs eighteen editable capabilities

The brief puts a single `role` string in the custom claim and branches the
UI on it. The app has 18 capabilities in an owner-editable matrix — which
exists because your actual rule ("manager does everything except takings")
cannot be expressed by role alone.

**Recommendation:** keep `role` in the claim for coarse security-rule
checks, and keep the capability matrix in Firestore for UI and fine-grained
permissions. Rules enforce the floor; the matrix shapes what staff see.

### B5. Status values are narrower than the app's

| | Brief | App |
| --- | --- | --- |
| Table | `available`, `occupied` | `available`, `pending_approval`, `occupied`, **`needs_clearing`** |
| Order | 6 values incl. `served`, `completed`, `cancelled` | `pending`, `preparing`, `ready` |

`needs_clearing` is the "guests gone, table not wiped" state you asked for —
dropping it loses the clearing workflow. The brief's extra order statuses
are a genuine improvement and worth adopting (`cancelled` especially, since
order cancellation is currently missing).

### B6. Menu shape

Brief nests `menus/{menuId}/items`. The app has one flat menu with fields
the brief omits: `no` (the printed dish number), `diet`, `nuts`, `isNew`,
`weekend`.

The dish number matters — it is how staff and guests refer to dishes aloud,
and it is printed. `nuts` is an allergen field and legally significant.

**Recommendation:** flat `menuItems` subcollection, keeping all existing
fields. Multiple named menus (lunch, dinner) can be added later via a
`menuId` field rather than a nested collection.

---

## C. Where the brief is right and should be followed

- **Subcollections under `restaurants/{id}`** — correct, and the reason the
  security rule can be one airtight line
- **Super-admin dashboard** for provisioning — needed, since we onboard
  restaurants rather than letting them self-serve
- **Subdomain routing** — correct, and worth doing before any QR is printed
- **`isActive` with token revocation** — correct; a sacked employee must
  lose access instantly
- **Security rules keyed on `request.auth.token.restaurantId`** — correct

---

## D. Files touched, by phase

### Phase 0 — Firebase live, single tenant *(prerequisite)*
| File | Change |
| --- | --- |
| `src/firebase.js` | Real config from env |
| `src/data/firestoreAdapter.js` | Implement the 8 functions that currently throw |
| `src/lib/actions.js` | Add sessions, access codes, clearing, merge |
| `firestore.rules` | Replace the open placeholder |
| `src/data/index.js` | `USE_MOCK = false` |

### Phase 1 — Tenant scoping
| File | Change |
| --- | --- |
| `src/tenant/` *(new)* | Resolve subdomain → `restaurantId`, provide via context |
| `src/data/firestoreAdapter.js` | Every path prefixed `restaurants/{rid}/…` |
| `src/mock/data.js` | `RESTAURANT`, menu, tables all become tenant data |
| `src/mock/store.js` | Per-tenant, or retired once Phase 0 lands |
| `src/App.jsx` | Tenant gate above the router; 404 for unknown subdomain |
| `src/auth/AuthProvider.jsx` | Read `restaurantId` from the claim; assert it matches the subdomain |

### Phase 2 — Accounts & super-admin
| File | Change |
| --- | --- |
| `src/routes/admin/` *(new)* | Restaurant list, create, suspend, issue credentials |
| `src/routes/AccountLogin.jsx` *(new)* | Email + password for the restaurant |
| `functions/` *(new)* | Admin SDK: set claims, revoke tokens, provision |

### Phase 3 — Onboarding tools
| File | Change |
| --- | --- |
| Menu import | Document → structured items → restaurant signs off |
| QR sheet | Printable codes per table |

### Unchanged
All three surfaces and their design: `routes/customer/*`, `routes/kitchen/*`,
`routes/manager/*`, `components/ui.jsx`, `index.css`, `hooks/*`. The refactor
changes where data comes from and who may see it — not the product.

---

## E. DECISIONS — settled

| # | Question | Ruling |
| --- | --- | --- |
| 1 | Sessions | **Keep.** Linked tables, merging, combined bills and party names all stay. The new architecture wraps around them. |
| 2 | Join-table flow | **Keep the existing code.** No `tableJoinRequests` collection — the current knock and access-code mechanism stands. |
| 3 | Staff login | **Replace PIN with email + password.** |
| 4 | Role handling | **Keep the 18-capability owner-editable matrix.** |
| 5 | Leavers | **No token revocation.** Set the account inactive; they lose access and disappear from the owner's staff list. |
| 6 | Subdomain vs path | *Still open — blocks routing.* |

### Consequence of ruling 5: Cloud Functions may be avoidable

Revocation via `revokeRefreshTokens` was the main thing forcing the Admin
SDK, and therefore Cloud Functions and the Blaze plan. Without it, access
control can be enforced entirely in security rules by reading the staff
document:

```
function staff() {
  return get(/databases/$(database)/documents/restaurants/$(rid)/staff/$(request.auth.uid)).data;
}
allow read, write: if staff().isActive == true;
```

Trade-off: one extra document read per rule evaluation, slightly slower, but
**no Cloud Functions and no Blaze plan for the pilot.** Custom claims become
optional rather than required.

Open point on ruling 5: once an inactive member is hidden from the owner's
list there is no way to restore them — reinstating someone means re-adding
them. Acceptable for staff turnover, worth confirming.

---

## F. Remaining question

**Subdomain or path for guest URLs?** Hard to reverse once QR codes are
printed. My recommendation remains subdomain — `bobbys.happy.co.uk` — which
is also what the brief specifies.
