import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import DashboardPage from "../pages/DashboardPage.jsx";
import DriversPage from "../pages/DriversPage.jsx";
import ExpensesPage from "../pages/ExpensesPage.jsx";
import ForbiddenPage from "../pages/ForbiddenPage.jsx";
import FuelPage from "../pages/FuelPage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import MaintenancePage from "../pages/MaintenancePage.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";
import TripsPage from "../pages/TripsPage.jsx";
import VehiclesPage from "../pages/VehiclesPage.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import RoleRoute from "./RoleRoute.jsx";

const fleetManagerOnly = ["Fleet Manager"];
const operationsRoles = ["Fleet Manager", "Safety Officer"];
const financeRoles = ["Fleet Manager", "Financial Analyst"];
const tripRoles = ["Fleet Manager", "Driver"];

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route element={<RoleRoute allowedRoles={fleetManagerOnly} />}>
            <Route path="/vehicles" element={<VehiclesPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
          </Route>
          <Route element={<RoleRoute allowedRoles={tripRoles} />}>
            <Route path="/trips" element={<TripsPage />} />
          </Route>
          <Route element={<RoleRoute allowedRoles={operationsRoles} />}>
            <Route path="/drivers" element={<DriversPage />} />
          </Route>
          <Route element={<RoleRoute allowedRoles={financeRoles} />}>
            <Route path="/fuel" element={<FuelPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
          </Route>
          <Route path="/403" element={<ForbiddenPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
