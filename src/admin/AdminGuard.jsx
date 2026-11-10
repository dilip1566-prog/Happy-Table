import { Navigate, useLocation } from 'react-router-dom'
import { useAdmin } from './context'

/**
 * Nothing under /admin renders without a platform admin signed in.
 *
 * The destination is remembered, so somebody who followed a link to a
 * particular restaurant lands back on it after signing in rather than at the
 * top of the dashboard.
 */
export function RequireAdmin({ children }) {
  const { admin } = useAdmin()
  const location = useLocation()

  if (!admin) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    )
  }

  return children
}
