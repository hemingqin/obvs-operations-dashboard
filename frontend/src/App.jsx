import { Navigate, Route, Routes } from "react-router-dom";
import AppShellLayout from "./components/layout/AppShellLayout.jsx";
import { getSessionRole, getToken } from "./lib/auth.js";
import { NotificationsProvider } from "./hooks/useNotificationsSocket.js";
import { getDefaultRouteForRole } from "./lib/navigation.js";
import DashboardPage from "./pages/DashboardPage.jsx";
import DonationsPage from "./pages/DonationsPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import PlaceholderPage from "./pages/PlaceholderPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import ServiceRequestsPage from "./pages/ServiceRequestsPage.jsx";
import UnauthorizedPage from "./pages/UnauthorizedPage.jsx";
import VolunteerAvailabilityPage from "./pages/VolunteerAvailabilityPage.jsx";
import VolunteerMyRequestsPage from "./pages/VolunteerMyRequestsPage.jsx";
import VolunteerMyServicesPage from "./pages/VolunteerMyServicesPage.jsx";

function ProtectedRoute({ children }) {
  if (!getToken()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <NotificationsProvider>
        <AppShellLayout />
      </NotificationsProvider>
    </ProtectedRoute>
  );
}

function RoleRoute({ allowedRoles, children }) {
  const role = getSessionRole();

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route
          path="/donations"
          element={
            <RoleRoute allowedRoles={["coordinator", "admin"]}>
              <DonationsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/volunteers"
          element={
            <RoleRoute allowedRoles={["coordinator", "admin"]}>
              <PlaceholderPage section="Volunteers" />
            </RoleRoute>
          }
        />
        <Route
          path="/service-requests"
          element={
            <RoleRoute allowedRoles={["coordinator", "admin"]}>
              <ServiceRequestsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/my-requests"
          element={
            <RoleRoute allowedRoles={["volunteer"]}>
              <VolunteerMyRequestsPage />
            </RoleRoute>
          }
        />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route
          path="/reports"
          element={
            <RoleRoute allowedRoles={["coordinator", "admin"]}>
              <PlaceholderPage section="Reports" />
            </RoleRoute>
          }
        />
        <Route
          path="/users"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <PlaceholderPage section="Users" />
            </RoleRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <PlaceholderPage section="Settings" />
            </RoleRoute>
          }
        />
        <Route
          path="/availability"
          element={
            <RoleRoute allowedRoles={["volunteer"]}>
              <VolunteerAvailabilityPage />
            </RoleRoute>
          }
        />
        <Route
          path="/my-services"
          element={
            <RoleRoute allowedRoles={["volunteer"]}>
              <VolunteerMyServicesPage />
            </RoleRoute>
          }
        />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="*"
        element={<Navigate to={getDefaultRouteForRole(getSessionRole())} replace />}
      />
    </Routes>
  );
}

export default App;
