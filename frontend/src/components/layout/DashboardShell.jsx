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
  children
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigationItems = getNavigationForRole(role);

  return (
    <div className="dashboard-shell">
      <Sidebar
        items={navigationItems}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="dashboard-main">
        <Navbar
          title={title}
          subtitle={subtitle}
          profile={profile}
          unreadNotifications={unreadNotifications}
          onMenuToggle={() => setSidebarOpen((current) => !current)}
          onLogout={onLogout}
        />
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}

export default DashboardShell;
