import { NavLink } from "react-router-dom";
import Badge from "../ui/Badge.jsx";
import { cn } from "../../lib/utils.js";

function Sidebar({ items, role, open, onClose }) {
  return (
    <>
      <div className={cn("sidebar-overlay", open ? "is-open" : "")} onClick={onClose} />
      <aside className={cn("sidebar", open ? "is-open" : "")}>
        <div className="sidebar-brand">
          <img
              src="/images/obvs-logo.png"
              alt="OBVS Logo"
              className="sidebar-logo"/>
        </div>

        <nav className="sidebar-nav" aria-label="Primary">
          {items.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                cn("sidebar-link", isActive ? "sidebar-link-active" : "")
              }
              onClick={onClose}
            >
              <span>{item.label}</span>
              {item.badge ? <Badge variant="info">{item.badge}</Badge> : null}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Badge variant="success">{role ? `${role} access` : "session active"}</Badge>
          {/* <p className="sidebar-help">
            Role-aware navigation is ready for Volunteer, Coordinator, and Admin workspaces.
          </p> */}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
