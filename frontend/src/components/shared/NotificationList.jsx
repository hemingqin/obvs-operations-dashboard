import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import EmptyState from "./EmptyState.jsx";
import { formatDate } from "../../hooks/useOperationsData.js";

const typeVariantMap = {
  donation: "success",
  volunteer: "info",
  system: "default",
  request: "default",
  warning: "warning"
};

function NotificationList({
  notifications,
  loading,
  compact = false,
  onMarkRead,
  onArchive,
  archiveLabel = "Archive"
}) {
  if (loading) {
    return <p className="empty-state">Loading notifications...</p>;
  }

  if (!notifications.length) {
    return (
      <EmptyState
        title="No notifications"
        description="Notification activity will show up here once records exist."
        compact={compact}
      />
    );
  }

  return (
    <div className="stack-list">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={notification.read ? "activity-item notification-read" : "activity-item"}
        >
          <div className="notification-main">
            <div className="notification-meta-row">
              <Badge variant={typeVariantMap[notification.type] || "default"}>
                {notification.type || "system"}
              </Badge>
              {!notification.read ? <Badge variant="warning">Unread</Badge> : null}
            </div>
            <p className="activity-title">{notification.message}</p>
            <p className="activity-meta">{formatDate(notification.created_at)}</p>
          </div>
          <div className="notification-actions">
            <Badge variant={notification.status === "sent" ? "success" : "warning"}>
              {notification.status}
            </Badge>
            {!notification.read && onMarkRead ? (
              <Button variant="ghost" size="sm" onClick={() => onMarkRead(notification.id)}>
                Mark as read
              </Button>
            ) : null}
            {onArchive ? (
              <Button variant="ghost" size="sm" onClick={() => onArchive(notification.id)}>
                {archiveLabel}
              </Button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

export default NotificationList;
