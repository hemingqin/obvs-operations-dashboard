import { Link } from "react-router-dom";
import Button from "../ui/Button.jsx";
import Badge from "../ui/Badge.jsx";

function Navbar({
  title,
  subtitle,
  role,
  profile,
  unreadNotifications = 0,
  notificationsSocketStatus = "fallback",
  onMenuToggle,
  onLogout
}) {
  const realtimeLabel =
    notificationsSocketStatus === "open"
      ? "Realtime"
      : notificationsSocketStatus === "reconnecting"
        ? "Reconnecting"
        : "REST fallback";

  return (
    <header className="navbar">
      <div className="navbar-main">
        <Button variant="ghost" size="sm" className="navbar-menu" onClick={onMenuToggle}>
          Menu
        </Button>
        <div>
          <p className="navbar-title">{title}</p>
          <p className="navbar-subtitle">{subtitle}</p>
        </div>
      </div>

      <div className="navbar-actions">
        <Badge variant={notificationsSocketStatus === "open" ? "success" : "warning"}>
          {realtimeLabel}
        </Badge>
        <Link
          to="/notifications"
          className="notification-bell"
          aria-label={`${unreadNotifications} unread notifications`}
        >
          {unreadNotifications} unread
        </Link>
        <Badge variant="info">{role ? `${role} role` : "authenticated"}</Badge>
        <div className="navbar-profile">
          <span className="navbar-profile-name">{profile?.displayName || "Team member"}</span>
          <span className="navbar-profile-meta">Internal operations</span>
        </div>
        <Button variant="secondary" size="sm" onClick={onLogout}>
          Logout
        </Button>
      </div>
    </header>
  );
}

export default Navbar;
