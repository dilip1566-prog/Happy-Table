import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { TenantProvider } from './tenant/TenantProvider'
import { AuthProvider } from './auth/AuthProvider'
import { Require } from './auth/Guard'
import PlatformRoutes from './routes/platform/PlatformRoutes'
import Landing from './routes/Landing'
import Login from './routes/Login'
import ResetPassword from './routes/ResetPassword'
import CustomerView from './routes/customer/CustomerView'
import ManagerLayout from './routes/manager/ManagerLayout'
import ManagerDashboard from './routes/manager/ManagerDashboard'
import ManagerMenu from './routes/manager/ManagerMenu'
import ManagerBilling from './routes/manager/ManagerBilling'
import ManagerSales from './routes/manager/ManagerSales'
import ManagerStaff from './routes/manager/ManagerStaff'
import KitchenView from './routes/kitchen/KitchenView'

/**
 * One-off seeding screen for a live Firebase project. `import.meta.env.DEV`
 * is replaced with a literal at build time, so this whole branch is dead code
 * in production and the chunk is never emitted — the route simply does not
 * exist there.
 */
const SeedPage = import.meta.env.DEV ? lazy(() => import('./dev/SeedPage')) : null

/**
 * One deployment, many restaurants, plus the platform itself.
 *
 * The hostname decides which. `bobbys.happytable.co.uk` resolves to a
 * restaurant and renders the tenant app below; the bare apex and `www` render
 * our own marketing site and operator console, which have their own router in
 * routes/platform. A restaurant's own domain resolves to that restaurant.
 *
 * TenantProvider sits above everything so no query can run before it is known
 * which restaurant's data to read — and so the platform's screens, which have
 * no restaurant at all, never get a stale one.
 */
export default function App() {
  return (
    <TenantProvider onRoot={<PlatformRoutes />}>
      <AuthProvider>
        <Routes>
          {/* The restaurant's front door: guests one way, staff the other. */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* Public, and it has to be: the person arriving here cannot sign
              in yet — either they have never had a password or they have
              forgotten it. The link in the URL is the only credential. */}
          <Route path="/reset" element={<ResetPassword />} />

          {/* Public: the guest's phone. /customer is the menu, readable by
              anyone; ordering unlocks once a server hands over a table code.
              /customer/:tableId is what the QR stickers point at. */}
          <Route path="/customer" element={<CustomerView />} />
          <Route path="/customer/:tableId" element={<CustomerView />} />

          {/* Staff. */}
          <Route
            path="/manager"
            element={
              <Require anyOf={['floor.view', 'menu.view', 'billing.view']}>
                <ManagerLayout />
              </Require>
            }
          >
            <Route
              index
              element={
                <Require permission="floor.view">
                  <ManagerDashboard />
                </Require>
              }
            />
            <Route
              path="menu"
              element={
                <Require permission="menu.view">
                  <ManagerMenu />
                </Require>
              }
            />
            <Route
              path="billing"
              element={
                <Require permission="billing.view">
                  <ManagerBilling />
                </Require>
              }
            />
            <Route
              path="sales"
              element={
                <Require permission="reports.sales">
                  <ManagerSales />
                </Require>
              }
            />
            <Route
              path="people"
              element={
                <Require permission="staff.manage">
                  <ManagerStaff />
                </Require>
              }
            />
          </Route>

          <Route
            path="/kitchen"
            element={
              <Require permission="orders.view">
                <KitchenView />
              </Require>
            }
          />

          {SeedPage && (
            <Route
              path="/dev/seed"
              element={
                <Suspense fallback={null}>
                  <SeedPage />
                </Suspense>
              }
            />
          )}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </TenantProvider>
  )
}
