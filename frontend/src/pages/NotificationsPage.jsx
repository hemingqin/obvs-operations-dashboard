import { useMemo } from "react";
import PageHeader from "../components/layout/PageHeader.jsx";
import DataTableShell from "../components/shared/DataTableShell.jsx";
import NotificationList from "../components/shared/NotificationList.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import { useOperationsData } from "../hooks/useOperationsData.js";
import { getToken } from "../lib/auth.js";
import { markNotificationRead } from "../services/operationsService.js";

function NotificationsPage() {
  const {
    notifications,
    loading,
    error,
    notificationSource,
    notificationsError,
    notificationsSocketStatus,
    updateNotification
  } = useOperationsData();

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  async function handleMarkRead(id) {
    try {
      const updatedNotification = await markNotificationRead(getToken(), id);
      updateNotification?.(updatedNotification);
    } catch {
      const notification = notifications.find((item) => item.id === id);
      if (notification) {
        updateNotification?.({ ...notification, read: true });
      }
    }
  }

  async function handleMarkAllRead() {
    const unreadIds = notifications
      .filter((notification) => !notification.read)
      .map((notification) => notification.id);

    await Promise.all(unreadIds.map((id) => handleMarkRead(id)));
  }

  return (
    <>
      <PageHeader
        eyebrow="Communications"
        title="Notifications"
        description="A cleaner operations inbox with visual types, unread state, and lightweight action handling."
        actions={
          <>
            <Badge variant={notificationSource === "api" ? "info" : "warning"}>
              {notificationSource === "api" ? "Live backend data" : "Mock fallback"}
            </Badge>
            <Badge variant={notificationsSocketStatus === "open" ? "success" : "warning"}>
              {notificationsSocketStatus === "open" ? "Realtime connected" : "REST fallback"}
            </Badge>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={!notifications.length || unreadCount === 0}
            >
              Mark all as read
            </Button>
          </>
        }
      />

      {error ? <p className="form-banner form-banner-error">{error}</p> : null}
      {notificationsError ? (
        <p className="form-banner form-banner-warning">{notificationsError}</p>
      ) : null}

      <section className="stats-grid">
        <div className="mini-stat-card">
          <span className="summary-label">Unread</span>
          <strong>{unreadCount}</strong>
        </div>
        <div className="mini-stat-card">
          <span className="summary-label">Total notifications</span>
          <strong>{notifications.length}</strong>
        </div>
        <div className="mini-stat-card">
          <span className="summary-label">Pending items</span>
          <strong>
            {notifications.filter((notification) => notification.status !== "sent").length}
          </strong>
        </div>
        <div className="mini-stat-card">
          <span className="summary-label">Source</span>
          <strong>{notificationSource === "api" ? "API" : "Mock"}</strong>
        </div>
      </section>

      <DataTableShell
        title="Notification inbox"
        description="REST history stays available while realtime updates append as they arrive."
        badge={`${notifications.length} records`}
        loading={false}
        hasRows={notifications.length > 0}
        emptyTitle="No notifications available"
        emptyDescription="Notifications from donations, requests, and system events will appear here."
      >
        <NotificationList
          notifications={notifications}
          loading={loading}
          onMarkRead={handleMarkRead}
        />
      </DataTableShell>
    </>
  );
}

export default NotificationsPage;
