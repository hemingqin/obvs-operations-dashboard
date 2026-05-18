import { Outlet, useLocation, useNavigate } from "react-router-dom";
import DashboardShell from "./DashboardShell.jsx";
import { clearToken, getSessionProfile } from "../../lib/auth.js";
import { useNotifications } from "../../hooks/useNotificationsSocket.js";

const pageMetadata = {
  "/dashboard": {
    title: "Operations dashboard",
    subtitle: "Unified nonprofit operations view across fundraising, staffing, and requests."
  },
  "/donations": {
    title: "Donations",
    subtitle: "Track gifts, review the ledger, and create new donation records."
  },
  "/volunteers": {
    title: "Volunteers",
    subtitle: "Manage people, onboarding, and shift readiness."
  },
  "/service-requests": {
    title: "Service requests",
    subtitle: "Review incoming requests and coordinate fulfillment."
  },
  "/my-requests": {
    title: "My requests",
    subtitle: "See the service requests currently assigned to you and take the next action."
  },
  "/notifications": {
    title: "Notifications",
    subtitle: "Monitor outbound alerts and internal operational notices."
  },
  "/reports": {
    title: "Reports",
    subtitle: "Explore operational trends and impact reporting."
  },
  "/users": {
    title: "Users",
    subtitle: "Manage platform access and organizational permissions."
  },
  "/settings": {
    title: "Settings",
    subtitle: "Adjust workspace defaults and system preferences."
  },
  "/availability": {
    title: "Availability",
    subtitle: "Update weekly availability and keep coordinators informed."
  },
  "/my-services": {
    title: "My services",
    subtitle: "Choose the types of services you are prepared to provide."
  },
  "/profile": {
    title: "Profile",
    subtitle: "Review your account details and role-specific context."
  },
  "/unauthorized": {
    title: "Unauthorized",
    subtitle: "You do not currently have access to this part of the workspace."
  }
};

function AppShellLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const profile = getSessionProfile();
  const notifications = useNotifications();
  const page = pageMetadata[location.pathname] || pageMetadata["/dashboard"];

  function handleLogout() {
    clearToken();
    navigate("/login", { replace: true });
  }

  return (
    <DashboardShell
      title={page.title}
      subtitle={page.subtitle}
      role={profile.role}
      onLogout={handleLogout}
      profile={profile}
      unreadNotifications={notifications?.unreadCount || 0}
      notificationsSocketStatus={notifications?.socketStatus || "fallback"}
    >
      <Outlet />
    </DashboardShell>
  );
}

export default AppShellLayout;
