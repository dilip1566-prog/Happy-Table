import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context'
import { Empty, Spinner } from '../components/ui'

/**
 * Route-level gate.
 *
 * Two distinct refusals, deliberately worded differently:
 *   not signed in  -> send to the keypad, remembering where they were going
 *   signed in but not permitted -> say so plainly, and do not offer a way in
 *
 * Conflating them ("please log in" when you are already logged in) is the
 * classic way to make staff think the app is broken.
 */
export function Require({ permission, anyOf, children }) {
  const { user, ready, can, canAny } = useAuth()
  const location = useLocation()

  if (!ready) {
    return (
      <div className="grid min-h-full place-items-center p-8">
        <Spinner label="Checking access" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  const allowed = anyOf ? canAny(...anyOf) : permission ? can(permission) : true
  if (!allowed) return <NoAccess />

  return children
}

export function NoAccess({ what }) {
  const { user } = useAuth()

  return (
    <div className="grid min-h-full place-items-center p-8">
      <Empty
        icon="🔒"
        title={what ? `No access to ${what}` : 'No access'}
        hint={`Your role (${user?.role ?? 'unknown'}) does not include this. The owner can change it under People.`}
      />
    </div>
  )
}

/**
 * Inline gate for a control rather than a page — a button a waiter should not
 * see at all. Renders nothing by default, because a disabled button that can
 * never be enabled is just clutter.
 */
export function Can({ permission, anyOf, children, fallback = null }) {
  const { can, canAny } = useAuth()
  const allowed = anyOf ? canAny(...anyOf) : can(permission)
  return allowed ? children : fallback
}
