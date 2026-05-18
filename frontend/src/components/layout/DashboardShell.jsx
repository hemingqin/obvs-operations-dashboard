import { useState } from "react";
import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";
import { getNavigationForRole } from "../../lib/navigation.js";

function DashboardShell({
  title,
  subtitle,
  role,
  onLogout,
  profile,
  unreadNotifications,
  notificationsSocketStatus,
  children
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigationItems = getNavigationForRole(role);

  return (
    <div className="dashboard-shell">
      <Sidebar
        items={navigationItems}
        role={role}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="dashboard-main">
        <Navbar
          title={title}
          subtitle={subtitle}
          role={role}
          profile={profile}
          unreadNotifications={unreadNotifications}
          notificationsSocketStatus={notificationsSocketStatus}
          onMenuToggle={() => setSidebarOpen((current) => !current)}
          onLogout={onLogout}
        />
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}

export default DashboardShell;
