import { Link } from "react-router-dom";
import Button from "../ui/Button.jsx";

function Navbar({
  title,
  subtitle,
  profile,
  unreadNotifications = 0,
  onMenuToggle,
  onLogout
}) {
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
        <Link
          to="/notifications"
          className="notification-bell"
          aria-label={unreadNotifications ? `${unreadNotifications} unread notifications` : "Notifications"}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          {unreadNotifications > 0 ? (
            <span className="notification-dot">{unreadNotifications > 9 ? "9+" : unreadNotifications}</span>
          ) : null}
        </Link>
        <div className="navbar-profile">
          <span className="navbar-profile-name">{profile?.displayName || "Team member"}</span>
          <span className="navbar-profile-meta">Oak Bay Volunteer Services</span>
        </div>
        <Button variant="secondary" size="sm" onClick={onLogout}>
          Logout
        </Button>
      </div>
    </header>
  );
}

export default Navbar;
