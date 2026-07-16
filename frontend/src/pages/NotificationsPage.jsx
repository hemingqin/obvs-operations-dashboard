import { useMemo, useState } from "react";
import PageHeader from "../components/layout/PageHeader.jsx";
import DataTableShell from "../components/shared/DataTableShell.jsx";
import NotificationList from "../components/shared/NotificationList.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import { useOperationsData } from "../hooks/useOperationsData.js";
import { getToken } from "../lib/auth.js";
import { cn } from "../lib/utils.js";
import { markNotificationRead } from "../services/operationsService.js";

const ARCHIVE_STORAGE_KEY = "obvs-archived-notifications";

const categoryFilters = [
  { value: "All", predicate: () => true },
  { value: "Unread", predicate: (notification) => !notification.read },
  { value: "Read", predicate: (notification) => notification.read },
  { value: "Priority", predicate: (notification) => notification.type === "warning" },
  { value: "Donation", predicate: (notification) => notification.type === "donation" },
  { value: "Volunteer", predicate: (notification) => notification.type === "volunteer" },
  { value: "Service Request", predicate: (notification) => notification.type === "request" },
  { value: "System", predicate: (notification) => notification.type === "system" }
];

function loadArchivedIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem(ARCHIVE_STORAGE_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function persistArchivedIds(ids) {
  localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(Array.from(ids)));
}

function NotificationsPage() {
  const {
    notifications,
    loading,
    error,
    notificationsError,
    updateNotification
  } = useOperationsData();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showArchived, setShowArchived] = useState(false);
  const [archivedIds, setArchivedIds] = useState(loadArchivedIds);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const visibleNotifications = useMemo(() => {
    const query = search.trim().toLowerCase();
    const matchesCategory = categoryFilters.find((option) => option.value === category)?.predicate || (() => true);

    return notifications
      .filter((notification) => archivedIds.has(notification.id) === showArchived)
      .filter((notification) => !query || notification.message.toLowerCase().includes(query))
      .filter(matchesCategory)
      .sort((left, right) => new Date(right.created_at) - new Date(left.created_at));
  }, [notifications, archivedIds, showArchived, search, category]);

  function toggleArchive(id) {
    setArchivedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      persistArchivedIds(next);
      return next;
    });
  }

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
    const unreadIds = visibleNotifications
      .filter((notification) => !notification.read)
      .map((notification) => notification.id);

    await Promise.all(unreadIds.map((id) => handleMarkRead(id)));
  }

  return (
    <>
      <PageHeader
        eyebrow="Communications"
        title="Notifications"
        description="Review notifications from donations, service requests, and system alerts."
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowArchived((current) => !current)}
            >
              {showArchived ? "Back to inbox" : "View archived"}
            </Button>
            {!showArchived ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleMarkAllRead}
                disabled={!visibleNotifications.length || unreadCount === 0}
              >
                Mark all as read
              </Button>
            ) : null}
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
      </section>

      <DataTableShell
        title={showArchived ? "Archived notifications" : "Notification inbox"}
        description={
          showArchived
            ? "Notifications you've archived out of the active inbox."
            : "New notifications appear automatically as they are generated."
        }
        badge={`${visibleNotifications.length} records`}
        loading={false}
        hasRows={visibleNotifications.length > 0}
        emptyTitle={showArchived ? "No archived notifications" : "No notifications available"}
        emptyDescription={
          showArchived
            ? "Notifications you archive will show up here."
            : "Notifications from donations, requests, and system events will appear here."
        }
        actions={
          <div className="toolbar-inline">
            <Input
              id="notification-search"
              label=""
              placeholder="Search notifications"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="toolbar-field"
            />
            <div className="filter-chips">
              {categoryFilters.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={cn("filter-chip", category === option.value ? "filter-chip-active" : "")}
                  onClick={() => setCategory(option.value)}
                >
                  {option.value}
                </button>
              ))}
            </div>
          </div>
        }
      >
        <NotificationList
          notifications={visibleNotifications}
          loading={loading}
          onMarkRead={showArchived ? undefined : handleMarkRead}
          onArchive={toggleArchive}
          archiveLabel={showArchived ? "Unarchive" : "Archive"}
        />
      </DataTableShell>
    </>
  );
}

export default NotificationsPage;
