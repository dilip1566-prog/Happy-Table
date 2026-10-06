import { useEffect, useState } from 'react'
import {
  addStaff,
  removeStaff,
  resetRolePermissions,
  setRolePermission,
  subscribe,
  updateStaff,
} from '../../data'
import { useAuth } from '../../auth/context'
import {
  LOCKED_ROLES,
  PERMISSIONS,
  PERMISSION_GROUPS,
  ROLES,
  roleLabel,
} from '../../auth/permissions'
import {
  Banner,
  Button,
  Card,
  Field,
  SectionTitle,
  Spinner,
  Switch,
  inputClass,
} from '../../components/ui'

/**
 * Owner-only: who works here, and what each role may do.
 *
 * The matrix is the point. Rather than four hard-coded roles, the owner sets
 * each capability per role — so "the manager can do everything except see the
 * takings" is a switch, not a code change.
 *
 * The owner's own row is fixed. There has to be one account that can always
 * undo a mistake, including a mistake made on this screen.
 */
export default function ManagerStaff() {
  const { user } = useAuth()
  const [staff, setStaff] = useState([])
  const [access, setAccess] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(null)

  useEffect(() => {
    const offStaff = subscribe('staff', (rows) => {
      setStaff(rows)
      setLoading(false)
    })
    const offAccess = subscribe('access', setAccess)
    return () => {
      offStaff()
      offAccess()
    } // STRICT UNMOUNT
  }, [])

  const toggle = async (role, permissionId, granted) => {
    setBusy(`${role}:${permissionId}`)
    setError(null)
    try {
      await setRolePermission(role, permissionId, granted)
    } catch (err) {
      setError(err)
    } finally {
      setBusy(null)
    }
  }

  if (loading) return <Spinner label="Loading people" />

  return (
    <div className="space-y-9">
      {error && (
        <Banner tone="bad" onDismiss={() => setError(null)}>
          {error}
        </Banner>
      )}

      <AccessMatrix access={access} busy={busy} onToggle={toggle} onError={setError} />

      <People staff={staff} currentUserId={user?.id} onError={setError} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// The matrix
// ---------------------------------------------------------------------------

function AccessMatrix({ access, busy, onToggle, onError }) {
  return (
    <section>
      <SectionTitle hint="Tick what each role is allowed to do. Changes apply to every signed-in device immediately.">
        What each role can do
      </SectionTitle>

      <Card className="overflow-hidden">
        {/* Desktop: a real matrix. */}
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-line">
                <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
                  Capability
                </th>
                {ROLES.map((role) => (
                  <th key={role.id} className="px-3 py-3 text-center">
                    <span className="block text-[13px] font-bold">{role.label}</span>
                    <span className="mt-0.5 block text-[11px] font-normal text-ink-faint">
                      {LOCKED_ROLES.includes(role.id) ? 'always full' : role.blurb}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSION_GROUPS.map((group) => (
                <GroupRows
                  key={group}
                  group={group}
                  access={access}
                  busy={busy}
                  onToggle={onToggle}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Tablet & phone: one role at a time, because a 4-column matrix at
            375px is unreadable. */}
        <div className="lg:hidden">
          <StackedMatrix access={access} busy={busy} onToggle={onToggle} />
        </div>
      </Card>

      <div className="mt-3 flex flex-wrap gap-2">
        {ROLES.filter((r) => !LOCKED_ROLES.includes(r.id)).map((role) => (
          <Button
            key={role.id}
            variant="quiet"
            size="sm"
            onClick={() => resetRolePermissions(role.id).catch(onError)}
          >
            Reset {role.label} to defaults
          </Button>
        ))}
      </div>
    </section>
  )
}

function GroupRows({ group, access, busy, onToggle }) {
  const rows = PERMISSIONS.filter((p) => p.group === group)

  return (
    <>
      <tr className="bg-sunken">
        <td
          colSpan={ROLES.length + 1}
          className="px-5 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-faint"
        >
          {group}
        </td>
      </tr>
      {rows.map((permission) => (
        <tr key={permission.id} className="border-b border-line last:border-0">
          <td className="px-5 py-3">
            <span className="flex items-center gap-2 text-[14px] font-medium">
              {permission.label}
              {permission.sensitive && (
                <span className="rounded-pill bg-state-late-bg px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-state-late">
                  Sensitive
                </span>
              )}
            </span>
            {permission.hint && (
              <span className="mt-0.5 block text-[12px] text-ink-faint">{permission.hint}</span>
            )}
          </td>

          {ROLES.map((role) => {
            const locked = LOCKED_ROLES.includes(role.id)
            const on = locked || (access[role.id] ?? []).includes(permission.id)
            return (
              <td key={role.id} className="px-3 py-3 text-center">
                <div className="flex justify-center">
                  <Switch
                    checked={on}
                    disabled={locked || busy === `${role.id}:${permission.id}`}
                    onChange={(next) => onToggle(role.id, permission.id, next)}
                    label={`${role.label}: ${permission.label}`}
                  />
                </div>
              </td>
            )
          })}
        </tr>
      ))}
    </>
  )
}

function StackedMatrix({ access, busy, onToggle }) {
  const [role, setRole] = useState(ROLES[1].id)
  const locked = LOCKED_ROLES.includes(role)

  return (
    <div>
      <div className="rail flex gap-1.5 overflow-x-auto border-b border-line p-3">
        {ROLES.map((r) => (
          <button
            key={r.id}
            onClick={() => setRole(r.id)}
            className={`shrink-0 rounded-pill px-3.5 py-2 text-[13px] font-semibold transition-colors ${
              role === r.id ? 'bg-accent text-white' : 'bg-raised text-ink-soft'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {locked && (
        <p className="border-b border-line bg-sunken px-4 py-2.5 text-[12px] text-ink-faint">
          The owner always holds every permission.
        </p>
      )}

      {PERMISSION_GROUPS.map((group) => (
        <div key={group}>
          <p className="bg-sunken px-4 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-faint">
            {group}
          </p>
          {PERMISSIONS.filter((p) => p.group === group).map((permission) => {
            const on = locked || (access[role] ?? []).includes(permission.id)
            return (
              <div
                key={permission.id}
                className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium">{permission.label}</p>
                  {permission.hint && (
                    <p className="mt-0.5 text-[12px] text-ink-faint">{permission.hint}</p>
                  )}
                </div>
                <Switch
                  checked={on}
                  disabled={locked || busy === `${role}:${permission.id}`}
                  onChange={(next) => onToggle(role, permission.id, next)}
                  label={`${role}: ${permission.label}`}
                />
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// People
// ---------------------------------------------------------------------------

const BLANK = { name: '', role: 'waiter', pin: '' }

function People({ staff, currentUserId, onError }) {
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      await addStaff(form)
      setForm(BLANK)
    } catch (err) {
      onError(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
      <div>
        <SectionTitle hint="A four-digit PIN, used to sign in on any device">
          Add someone
        </SectionTitle>
        <Card className="p-5">
          <form onSubmit={submit} className="space-y-4">
            <Field label="Name">
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Priya"
                className={inputClass}
              />
            </Field>

            <Field label="Role">
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className={inputClass}
              >
                {ROLES.filter((r) => r.id !== 'owner').map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label} — {r.blurb}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="PIN" hint="Four digits, unique to this person">
              <input
                required
                inputMode="numeric"
                pattern="\d{4}"
                maxLength={4}
                value={form.pin}
                onChange={(e) =>
                  setForm((f) => ({ ...f, pin: e.target.value.replace(/\D/g, '').slice(0, 4) }))
                }
                placeholder="••••"
                className={`${inputClass} tabular tracking-[0.3em]`}
              />
            </Field>

            <Button type="submit" full size="lg" disabled={saving}>
              {saving ? 'Adding…' : 'Add to the team'}
            </Button>
          </form>
        </Card>
      </div>

      <div>
        <SectionTitle hint={`${staff.filter((s) => s.active).length} active`}>
          The team
        </SectionTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {staff.map((person) => (
            <PersonCard
              key={person.id}
              person={person}
              isMe={person.id === currentUserId}
              onError={onError}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * One person, readable at a glance and editable in place.
 *
 * PIN changes happen here rather than in a separate screen because the two
 * questions — "who is this" and "what is their code" — are always asked
 * together, usually while the person is standing next to you.
 */
function PersonCard({ person, isMe, onError }) {
  const isOwner = person.role === 'owner'
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({ name: person.name, role: person.role, pin: person.pin })
  const [saving, setSaving] = useState(false)
  const [revealed, setRevealed] = useState(false)

  const open = () => {
    setDraft({ name: person.name, role: person.role, pin: person.pin })
    setEditing(true)
  }

  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      await updateStaff(person.id, draft)
      setEditing(false)
    } catch (err) {
      onError(err)
    } finally {
      setSaving(false)
    }
  }

  if (editing) {
    return (
      <Card className="p-4">
        <form onSubmit={save} className="space-y-3">
          <Field label="Name">
            <input
              required
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Role">
              <select
                value={draft.role}
                disabled={isOwner}
                onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value }))}
                className={`${inputClass} disabled:opacity-50`}
              >
                {ROLES.filter((r) => r.id !== 'owner' || isOwner).map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="PIN">
              <input
                required
                inputMode="numeric"
                maxLength={4}
                value={draft.pin}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, pin: e.target.value.replace(/\D/g, '').slice(0, 4) }))
                }
                className={`${inputClass} tabular tracking-[0.3em]`}
              />
            </Field>
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="quiet" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button type="submit" full disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </form>
      </Card>
    )
  }

  return (
    <Card className="flex items-center gap-3 p-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-raised font-display text-[19px] text-ink-soft">
        {person.name.charAt(0)}
      </span>

      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 truncate text-[15px] font-semibold">
          {person.name}
          {isMe && (
            <span className="rounded-pill bg-accent-wash px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-accent">
              You
            </span>
          )}
          {!person.active && (
            <span className="rounded-pill bg-state-late-bg px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-state-late">
              Off
            </span>
          )}
        </p>
        <p className="flex items-center gap-2 text-[12px] text-ink-faint">
          {roleLabel(person.role)}
          <span>&middot;</span>
          {/* A PIN on a screen in a dining room is a PIN anyone walking past
              can read, so it stays masked until asked for. */}
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            className="tabular font-semibold tracking-[0.15em] text-ink-soft hover:text-ink"
            aria-label={revealed ? 'Hide PIN' : 'Show PIN'}
          >
            {revealed ? person.pin : '••••'}
          </button>
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <Button size="sm" variant="secondary" onClick={open}>
          Edit
        </Button>

        {!isOwner && (
          <>
            <Switch
              checked={person.active}
              onChange={(next) => updateStaff(person.id, { active: next }).catch(onError)}
              label={`${person.name} active`}
            />
            <button
              onClick={() => removeStaff(person.id).catch(onError)}
              aria-label={`Remove ${person.name}`}
              className="grid size-8 place-items-center rounded-[8px] bg-raised text-ink-faint transition-colors hover:bg-state-late-bg hover:text-state-late"
            >
              &times;
            </button>
          </>
        )}
      </div>
    </Card>
  )
}
