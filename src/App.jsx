import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { Require } from './auth/Guard'
import Landing from './routes/Landing'
import Login from './routes/Login'
import CustomerView from './routes/customer/CustomerView'
import TablePicker from './routes/customer/TablePicker'
import ManagerLayout from './routes/manager/ManagerLayout'
import ManagerDashboard from './routes/manager/ManagerDashboard'
import ManagerMenu from './routes/manager/ManagerMenu'
import ManagerBilling from './routes/manager/ManagerBilling'
import ManagerSales from './routes/manager/ManagerSales'
import ManagerStaff from './routes/manager/ManagerStaff'
import KitchenView from './routes/kitchen/KitchenView'

/**
 * Guests are never asked to sign in — they scan a code and order. Everything
 * staff-facing sits behind the keypad, and behind a specific capability
 * rather than a role, so the owner can move the lines without a code change.
 */
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* The front door asks which of the two audiences has arrived,
            rather than guessing and making the other one back out. */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        {/* Public: the guest's phone. /customer is the front door for anyone
            who did not scan a table code; /customer/:tableId is what the QR
            stickers point at and skips the picker entirely. */}
        <Route path="/customer" element={<TablePicker />} />
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
  )
}
