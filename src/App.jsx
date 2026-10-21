import { Navigate, Route, Routes } from 'react-router-dom'
import { TenantProvider } from './tenant/TenantProvider'
import { AuthProvider } from './auth/AuthProvider'
import { Require } from './auth/Guard'
import SuperAdmin from './routes/admin/SuperAdmin'
import Landing from './routes/Landing'
import Login from './routes/Login'
import CustomerView from './routes/customer/CustomerView'
import ManagerLayout from './routes/manager/ManagerLayout'
import ManagerDashboard from './routes/manager/ManagerDashboard'
import ManagerMenu from './routes/manager/ManagerMenu'
import ManagerBilling from './routes/manager/ManagerBilling'
import ManagerSales from './routes/manager/ManagerSales'
import ManagerStaff from './routes/manager/ManagerStaff'
import KitchenView from './routes/kitchen/KitchenView'

/**
 * One deployment, many restaurants.
 *
 * The hostname decides which. `bobbys.happy.co.uk` resolves to a restaurant
 * and renders the app below; the bare apex renders our own admin console
 * instead. TenantProvider sits above everything so no query can run before
 * it is known which restaurant's data to read.
 */
export default function App() {
  return (
    <TenantProvider onRoot={<SuperAdmin />}>
      <AuthProvider>
        <Routes>
          {/* The restaurant's front door: guests one way, staff the other. */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

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

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </TenantProvider>
  )
}
