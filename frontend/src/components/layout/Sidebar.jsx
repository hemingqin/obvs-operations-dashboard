import { NavLink } from "react-router-dom";
import Badge from "../ui/Badge.jsx";
import { cn } from "../../lib/utils.js";

function Sidebar({ items, open, onClose }) {
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
          <p className="sidebar-org">Oak Bay Volunteer Services</p>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
