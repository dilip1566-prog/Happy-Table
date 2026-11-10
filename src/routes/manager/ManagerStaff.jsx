import { useEffect, useState } from 'react'
import {
  addStaff,
  removeStaff,
  resetRolePermissions,
  sendPasswordReset,
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
import { CopyableLink } from '../../components/CopyableLink'
import { PASSWORD_MIN } from '../../lib/passwords'

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

const BLANK = { name: '', role: 'waiter', email: '', password: '' }

/**
 * Hiring, in the order it actually happens.
 *
 * The owner creates the profile — name, role, address — and the new starter
 * chooses their own password from a link. The owner is never asked to invent
 * one, which matters for a reason that is not really about cryptography: a
 * password the owner types is a password the owner has to communicate, and
 * across a kitchen that means saying it out loud or writing it down by the
 * till. Both end with four people knowing one waiter's password.
 *
 * Typing one by hand is still here, because a new starter stood at the pass
 * with no phone signal is a real Tuesday, and refusing to help them is not
 * better security. It is the second option rather than the only one.
 */
function People({ staff, currentUserId, onError }) {
  const [form, setForm] = useState(BLANK)
  const [mode, setMode] = useState('invite') // 'invite' | 'password'
  const [saving, setSaving] = useState(false)
  const [added, setAdded] = useState(null)

  const reset = () => {
    setForm(BLANK)
    setMode('invite')
    setAdded(null)
  }

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      // An empty password is the instruction to invite. Sending the box's
      // contents when it is hidden would create an account with whatever was
      // typed before the owner switched modes.
      const result = await addStaff({
        ...form,
        password: mode === 'password' ? form.password : '',
      })
      setAdded({ name: form.name.trim(), email: form.email.trim(), mode, result })
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
        <SectionTitle hint="They sign in with this email address">
          Add someone
        </SectionTitle>

        {added ? (
          <AddedPanel added={added} onAgain={reset} />
        ) : (
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

              <Field label="Email" hint="Must be a working address — it is their sign-in">
                <input
                  required
                  type="email"
                  inputMode="email"
                  autoCapitalize="none"
                  spellCheck="false"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="priya@restaurant.co.uk"
                  className={inputClass}
                />
              </Field>

              <fieldset className="space-y-2">
                <legend className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
                  Their password
                </legend>

                <Choice
                  checked={mode === 'invite'}
                  onChange={() => setMode('invite')}
                  title="They set their own"
                  blurb="Sends a link to choose a password. Nobody else ever knows it."
                  recommended
                />
                <Choice
                  checked={mode === 'password'}
                  onChange={() => setMode('password')}
                  title="I'll set a temporary one"
                  blurb="For someone standing here with no phone. Ask them to change it."
                />
              </fieldset>

              {mode === 'password' && (
                <Field label="Temporary password" hint={`At least ${PASSWORD_MIN} characters`}>
                  <input
                    required
                    type="password"
                    minLength={PASSWORD_MIN}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••"
                    className={inputClass}
                  />
                </Field>
              )}

              <Button type="submit" full size="lg" disabled={saving}>
                {saving
                  ? 'Adding…'
                  : mode === 'invite'
                    ? 'Add & send invite'
                    : 'Add to the team'}
              </Button>
            </form>
          </Card>
        )}
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

/** One of two ways to give somebody a password, as a real radio. */
function Choice({ checked, onChange, title, blurb, recommended }) {
  return (
    <label
      className={`flex cursor-pointer gap-3 rounded-control border p-3 transition-colors ${
        checked ? 'border-accent bg-accent-wash' : 'border-line bg-sunken hover:border-line-strong'
      }`}
    >
      <input
        type="radio"
        name="password-mode"
        checked={checked}
        onChange={onChange}
        className="mt-0.5 size-4 shrink-0 accent-[var(--color-accent)]"
      />
      <span className="min-w-0">
        <span className="flex items-center gap-2 text-[14px] font-semibold">
          {title}
          {recommended && (
            <span className="rounded-pill bg-accent/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-accent">
              Better
            </span>
          )}
        </span>
        <span className="mt-0.5 block text-[12px] leading-relaxed text-ink-faint">{blurb}</span>
      </span>
    </label>
  )
}

/**
 * What happened, and what the owner has to do next.
 *
 * Replaces the form rather than sitting under it, because there is exactly
 * one thing worth doing at this moment — passing the link on — and a form
 * underneath invites adding the same person twice.
 */
function AddedPanel({ added, onAgain }) {
  const invite = added.result?.invite

  return (
    <Card className="p-5">
      <p className="text-[15px] font-semibold text-state-ready">
        {added.name} is on the team
      </p>

      {added.mode === 'password' ? (
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
          Tell them the password you just set, and ask them to change it from{' '}
          <span className="font-semibold text-ink">Forgot your password?</span> on the
          sign-in screen. Until they do, it is a password you both know.
        </p>
      ) : invite?.link ? (
        <>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
            Demo data has no mail server, so here is the link that would have been sent
            to <span className="font-semibold text-ink">{added.email}</span>. Give it to
            them and they choose their own password.
          </p>
          <CopyableLink link={invite.link} />
          <p className="mt-2 text-[12px] text-ink-faint">
            Good for one hour, and it works once.
          </p>
        </>
      ) : invite?.delivered ? (
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
          An invite is on its way to{' '}
          <span className="font-semibold text-ink">{added.email}</span>. They have an
          hour to set a password, and can ask for a fresh link any time after that.
        </p>
      ) : (
        <Banner tone="bad">
          {`${added.name} was added, but the invite email could not be sent. Use “Send a set-password link” on their card to try again.`}
        </Banner>
      )}

      <Button variant="secondary" full className="mt-4" onClick={onAgain}>
        Add someone else
      </Button>
    </Card>
  )
}

/**
 * One person, readable at a glance and editable in place.
 *
 * Address changes happen here rather than in a separate screen because the
 * two questions — "who is this" and "how do they get in" — are always asked
 * together, usually while the person is standing next to you.
 */
function PersonCard({ person, isMe, onError }) {
  const isOwner = person.role === 'owner'
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({
    name: person.name,
    role: person.role,
    email: person.email,
    password: '',
  })
  const [saving, setSaving] = useState(false)

  const open = () => {
    // Password starts empty and an empty box means "leave it alone" — the
    // store never sees a blank password as an instruction to clear one.
    setDraft({ name: person.name, role: person.role, email: person.email, password: '' })
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

            <Field label="Email">
              <input
                required
                type="email"
                inputMode="email"
                autoCapitalize="none"
                spellCheck="false"
                value={draft.email}
                onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="New password" hint="Leave blank to keep the current one">
            <input
              type="password"
              minLength={8}
              autoComplete="new-password"
              value={draft.password}
              onChange={(e) => setDraft((d) => ({ ...d, password: e.target.value }))}
              placeholder="••••••••"
              className={inputClass}
            />
          </Field>

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
    <Card className="p-4">
      <div className="flex items-center gap-3">
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
            {/* The one thing an owner wants to know about a new starter that
                the rest of the card cannot tell them: have they actually got
                in yet. */}
            {person.mustSetPassword && (
              <span className="rounded-pill bg-state-new-bg px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-state-new">
                Invited
              </span>
            )}
          </p>
          <p className="flex items-center gap-2 truncate text-[12px] text-ink-faint">
            {roleLabel(person.role)}
            <span>&middot;</span>
            {/* The address is not a secret — it is on their payslip. The
                password is never rendered anywhere. */}
            <span className="truncate text-ink-soft">{person.email}</span>
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
      </div>

      {person.active && <ResetLinkRow person={person} onError={onError} />}
    </Card>
  )
}

/**
 * "They cannot get in" — handled from the owner's screen in one tap.
 *
 * This is the single most common thing an owner is asked about an account,
 * usually ten minutes before service. Note it sends a link rather than
 * revealing or setting anything: the owner can always let somebody back in,
 * and still never learns their password.
 */
function ResetLinkRow({ person, onError }) {
  const [sent, setSent] = useState(null)
  const [busy, setBusy] = useState(false)

  const send = async () => {
    setBusy(true)
    try {
      setSent(await sendPasswordReset(person.email))
    } catch (err) {
      onError(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-3 border-t border-line pt-3">
      {sent ? (
        <>
          <p className="text-[12px] leading-relaxed text-state-ready">
            {sent.link
              ? 'Link ready — demo data sends no email, so pass this on yourself:'
              : `Sent to ${person.email}. Good for an hour, and it works once.`}
          </p>
          {sent.link && <CopyableLink link={sent.link} />}
          <button
            type="button"
            onClick={() => setSent(null)}
            className="mt-2 text-[12px] text-ink-faint transition-colors hover:text-ink"
          >
            Done
          </button>
        </>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <p className="text-[12px] leading-relaxed text-ink-faint">
            {person.mustSetPassword
              ? 'Waiting for them to choose a password.'
              : 'Locked out or forgotten it?'}
          </p>
          <Button size="sm" variant="quiet" disabled={busy} onClick={send}>
            {busy ? 'Sending…' : person.mustSetPassword ? 'Send again' : 'Send a link'}
          </Button>
        </div>
      )}
    </div>
  )
}
