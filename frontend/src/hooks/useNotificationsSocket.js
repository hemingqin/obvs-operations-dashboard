import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { buildWebSocketUrl } from "../lib/networkConfig.js";
import { getToken } from "../lib/auth.js";
import {
  fetchNotifications,
  normalizeNotification,
} from "../services/operationsService.js";

const NotificationsContext = createContext(null);

function notificationsEqual(current, next) {
  if (current.length !== next.length) {
    return false;
  }

  return current.every((notification, index) => {
    const nextNotification = next[index];
    return (
      notification.id === nextNotification.id &&
      notification.message === nextNotification.message &&
      notification.status === nextNotification.status &&
      notification.type === nextNotification.type &&
      notification.read === nextNotification.read &&
      notification.created_at === nextNotification.created_at
    );
  });
}

function upsertNotification(notifications, nextNotification) {
  const normalized = normalizeNotification(nextNotification);
  const exists = notifications.some(
    (notification) => notification.id === normalized.id,
  );

  if (exists) {
    let changed = false;
    const updated = notifications.map((notification) => {
      if (notification.id !== normalized.id) {
        return notification;
      }

      const isSame =
        notification.message === normalized.message &&
        notification.status === normalized.status &&
        notification.type === normalized.type &&
        notification.read === normalized.read &&
        notification.created_at === normalized.created_at;

      if (isSame) {
        return notification;
      }

      changed = true;
      return normalized;
    });

    return changed ? updated : notifications;
  }

  return [normalized, ...notifications];
}

export function useNotificationsSocket(token) {
  const [notifications, setNotifications] = useState([]);
  const [notificationSource, setNotificationSource] = useState("api");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [socketStatus, setSocketStatus] = useState("connecting");
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef(null);
  const socketRef = useRef(null);
  const manualCloseRef = useRef(false);
  const suppressReconnectRef = useRef(false);

  const setSocketStatusIfChanged = useCallback((status) => {
    setSocketStatus((current) => (current === status ? current : status));
  }, []);

  const setErrorIfChanged = useCallback((message) => {
    setError((current) => (current === message ? current : message));
  }, []);

  const setNotificationSourceIfChanged = useCallback((source) => {
    setNotificationSource((current) => (current === source ? current : source));
  }, []);

  const replaceNotificationsIfChanged = useCallback((nextNotifications) => {
    const normalizedNotifications = nextNotifications.map(normalizeNotification);
    setNotifications((current) =>
      notificationsEqual(current, normalizedNotifications)
        ? current
        : normalizedNotifications,
    );
  }, []);

  const loadNotifications = useCallback(async () => {
    if (!token) {
      setLoading((current) => (current ? false : current));
      return;
    }

    setLoading((current) => (current ? current : true));
    setErrorIfChanged("");

    try {
      const result = await fetchNotifications(token);
      replaceNotificationsIfChanged(result.notifications);
      setNotificationSourceIfChanged(result.source);
    } catch (requestError) {
      setErrorIfChanged(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load notifications",
      );
      setNotificationSourceIfChanged("fallback");
    } finally {
      setLoading((current) => (current ? false : current));
    }
  }, [
    token,
    replaceNotificationsIfChanged,
    setErrorIfChanged,
    setNotificationSourceIfChanged,
  ]);

  const updateNotification = useCallback((nextNotification) => {
    setNotifications((current) =>
      upsertNotification(current, nextNotification),
    );
  }, []);

  const loadNotificationsRef = useRef(loadNotifications);
  loadNotificationsRef.current = loadNotifications;

  useEffect(() => {
    loadNotificationsRef.current();
  }, [token]);

  useEffect(() => {
    manualCloseRef.current = false;

    if (!token) {
      manualCloseRef.current = true;
      setSocketStatusIfChanged("fallback");
      return undefined;
    }

    reconnectAttemptRef.current = 0;
    let stopped = false;

    function scheduleReconnect() {
      if (stopped || manualCloseRef.current || !token) {
        return;
      }

      setSocketStatusIfChanged("reconnecting");
      const delay = Math.min(1000 * 2 ** reconnectAttemptRef.current, 15000);
      reconnectAttemptRef.current += 1;
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = window.setTimeout(() => {
        if (!stopped && !manualCloseRef.current) {
          connect();
        }
      }, delay);
    }

    function closeCurrentSocket({ suppressReconnect = false } = {}) {
      if (!socketRef.current) {
        return;
      }

      if (
        socketRef.current.readyState === WebSocket.CLOSING ||
        socketRef.current.readyState === WebSocket.CLOSED
      ) {
        socketRef.current = null;
        return;
      }

      suppressReconnectRef.current = suppressReconnect;
      socketRef.current.close();
      socketRef.current = null;
    }

    function connect() {
      if (stopped || manualCloseRef.current || !token) {
        return;
      }

      const currentSocket = socketRef.current;
      if (
        currentSocket &&
        (currentSocket.readyState === WebSocket.CONNECTING ||
          currentSocket.readyState === WebSocket.OPEN)
      ) {
        return;
      }

      setSocketStatusIfChanged(
        reconnectAttemptRef.current > 0 ? "reconnecting" : "connecting",
      );
      const websocketUrl = buildWebSocketUrl("/notifications/ws", token);

      closeCurrentSocket({ suppressReconnect: true });
      console.log("[useNotificationsSocket] final websocketUrl =", websocketUrl);
      const socket = new WebSocket(websocketUrl);
      socketRef.current = socket;

      socket.addEventListener("open", () => {
        reconnectAttemptRef.current = 0;
        setSocketStatusIfChanged("open");
        setErrorIfChanged("");
      });

      socket.addEventListener("message", (event) => {
        try {
          const payload = JSON.parse(event.data);

          if (
            payload.event === "notification.created" &&
            payload.notification
          ) {
            setNotifications((current) =>
              upsertNotification(current, payload.notification),
            );
            setNotificationSourceIfChanged("api");
          }

          if (payload.event === "notifications.error") {
            setErrorIfChanged(
              payload.message || "Realtime notifications are unavailable.",
            );
            setSocketStatusIfChanged("fallback");
          }
        } catch {
          setErrorIfChanged("Received an unreadable realtime notification.");
        }
      });

      socket.addEventListener("close", () => {
        if (socketRef.current === socket) {
          socketRef.current = null;
        }

        if (suppressReconnectRef.current) {
          suppressReconnectRef.current = false;
          return;
        }

        if (!stopped && !manualCloseRef.current && token) {
          scheduleReconnect();
        }
      });

      socket.addEventListener("error", () => {
        setErrorIfChanged(
          "Realtime notifications disconnected; REST history remains available.",
        );
        if (socketRef.current === socket) {
          socket.close();
        }
      });
    }

    connect();

    return () => {
      stopped = true;
      manualCloseRef.current = true;
      window.clearTimeout(reconnectTimerRef.current);
      closeCurrentSocket({ suppressReconnect: true });
    };
  }, [token]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  return useMemo(
    () => ({
      notifications,
      notificationSource,
      notificationsLoading: loading,
      notificationsError: error,
      socketStatus,
      unreadCount,
      reloadNotifications: loadNotifications,
      updateNotification,
      setNotifications,
    }),
    [
      notifications,
      notificationSource,
      loading,
      error,
      socketStatus,
      unreadCount,
      loadNotifications,
      updateNotification,
    ],
  );
}

export function NotificationsProvider({ children }) {
  const notifications = useNotificationsSocket(getToken());

  const providerValue = useMemo(
    () => ({
      notifications: notifications.notifications,
      notificationSource: notifications.notificationSource,
      notificationsLoading: notifications.notificationsLoading,
      notificationsError: notifications.notificationsError,
      socketStatus: notifications.socketStatus,
      unreadCount: notifications.unreadCount,
      reloadNotifications: notifications.reloadNotifications,
      updateNotification: notifications.updateNotification,
      setNotifications: notifications.setNotifications,
    }),
    [
      notifications.notifications,
      notifications.notificationSource,
      notifications.notificationsLoading,
      notifications.notificationsError,
      notifications.socketStatus,
      notifications.unreadCount,
      notifications.reloadNotifications,
      notifications.updateNotification,
      notifications.setNotifications,
    ],
  );

  return createElement(
    NotificationsContext.Provider,
    { value: providerValue },
    children,
  );
}

export function useNotifications() {
  return useContext(NotificationsContext);
}
