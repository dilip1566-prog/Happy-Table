import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminProvider } from '../../admin/AdminProvider'
import { RequireAdmin } from '../../admin/AdminGuard'
import HappyTableLanding from '../business/HappyTableLanding'
import ResetPassword from '../ResetPassword'
import SuperAdmin from '../admin/SuperAdmin'
import SuperAdminLogin from '../admin/SuperAdminLogin'

/**
 * Everything served from the apex: happytable.co.uk and www.
 *
 * This exists because the apex used to have no router at all. TenantProvider
 * returned a single component in place of <Routes>, so `/`, `/admin` and
 * `/anything` all rendered the operator console — which meant the marketing
 * site and the console could not both exist, and the console had no sign-in
 * in front of it.
 *
 * Nothing here is inside a TenantProvider, and that is the point: there is
 * no restaurant on this domain, so any screen that assumed one would be
 * assuming wrong. The data calls these screens make all name their
 * restaurant explicitly.
 */
export default function PlatformRoutes() {
  return (
    <AdminProvider>
      <Routes>
        <Route path="/" element={<HappyTableLanding />} />

        {/* Public: the sign-in screen itself cannot be behind the guard, or
            there would be no way through it. */}
        <Route path="/admin/login" element={<SuperAdminLogin />} />

        <Route
          path="/admin/*"
          element={
            <RequireAdmin>
              <SuperAdmin />
            </RequireAdmin>
          }
        />

        {/* Firebase allows exactly one password-reset action URL per project,
            and a tenant subdomain would bake one restaurant into a template
            every restaurant's staff receive. So the canonical address is
            https://happytable.co.uk/reset, and it is answered here. Each
            restaurant's own /reset keeps working too, for the demo links. */}
        <Route path="/reset" element={<ResetPassword />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AdminProvider>
  )
}
