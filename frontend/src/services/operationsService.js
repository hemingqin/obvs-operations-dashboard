import { readApiError } from "../lib/api.js";
import { buildApiUrl } from "../lib/networkConfig.js";
import { mockNotifications } from "../lib/mockData.js";

function buildHeaders(token, extraHeaders = {}) {
  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

function inferNotificationType(message = "") {
  const normalized = message.toLowerCase();

  if (normalized.includes("warning")) {
    return "warning";
  }

  if (normalized.includes("request")) {
    return "request";
  }

  if (normalized.includes("donation")) {
    return "donation";
  }

  return "system";
}

export function normalizeNotification(notification) {
  const type = notification.type || inferNotificationType(notification.message);
  const read =
    typeof notification.read === "boolean"
      ? notification.read
      : notification.status === "sent" && type === "system";

  return {
    ...notification,
    type,
    read
  };
}

async function parseJsonResponse(response, fallbackMessage) {
  if (!response.ok) {
    const error = new Error(await readApiError(response, fallbackMessage));
    error.status = response.status;
    throw error;
  }

  return response.json();
}

export async function fetchDonations() {
  const response = await fetch(buildApiUrl("/donations"));
  const payload = await parseJsonResponse(response, "Failed to load donations");
  return Array.isArray(payload) ? payload : [];
}

export async function createDonation(token, donation) {
  const response = await fetch(buildApiUrl("/donations"), {
    method: "POST",
    headers: buildHeaders(token, { "Content-Type": "application/json" }),
    body: JSON.stringify(donation)
  });

  return response;
}

export async function fetchNotifications(token) {
  const response = await fetch(buildApiUrl("/notifications"), {
    headers: buildHeaders(token)
  });

  if (response.status === 404) {
    return {
      notifications: mockNotifications.map(normalizeNotification),
      source: "mock"
    };
  }

  const payload = await parseJsonResponse(response, "Failed to load notifications");
  return {
    notifications: Array.isArray(payload) ? payload.map(normalizeNotification) : [],
    source: "api"
  };
}

export async function markNotificationRead(token, id) {
  const response = await fetch(buildApiUrl(`/notifications/${id}/read`), {
    method: "POST",
    headers: buildHeaders(token)
  });

  const payload = await parseJsonResponse(response, "Failed to update notification");
  return normalizeNotification(payload);
}

export async function fetchServiceRequests(token) {
  const response = await fetch(buildApiUrl("/service-requests"), {
    headers: buildHeaders(token)
  });

  const payload = await parseJsonResponse(response, "Failed to load service requests");
  return Array.isArray(payload) ? payload : [];
}

export async function createServiceRequest(token, requestPayload) {
  const response = await fetch(buildApiUrl("/service-requests"), {
    method: "POST",
    headers: buildHeaders(token, { "Content-Type": "application/json" }),
    body: JSON.stringify(requestPayload)
  });

  const payload = await parseJsonResponse(response, "Failed to create service request");
  return payload;
}

export async function fetchMyServiceRequests(token) {
  const response = await fetch(buildApiUrl("/service-requests/mine"), {
    headers: buildHeaders(token)
  });

  const payload = await parseJsonResponse(response, "Failed to load your service requests");
  return Array.isArray(payload) ? payload : [];
}

export async function fetchVolunteerProfile(token) {
  const response = await fetch(buildApiUrl("/volunteer/profile"), {
    headers: buildHeaders(token)
  });

  return parseJsonResponse(response, "Failed to load volunteer profile");
}

export async function updateVolunteerProfile(token, payload) {
  const response = await fetch(buildApiUrl("/volunteer/profile"), {
    method: "PUT",
    headers: buildHeaders(token, { "Content-Type": "application/json" }),
    body: JSON.stringify(payload)
  });

  return parseJsonResponse(response, "Failed to save volunteer profile");
}

export async function fetchVolunteerAvailability(token) {
  const response = await fetch(buildApiUrl("/volunteer/availability"), {
    headers: buildHeaders(token)
  });

  const payload = await parseJsonResponse(response, "Failed to load volunteer availability");
  return Array.isArray(payload) ? payload : [];
}

export async function updateVolunteerAvailability(token, payload) {
  const response = await fetch(buildApiUrl("/volunteer/availability"), {
    method: "PUT",
    headers: buildHeaders(token, { "Content-Type": "application/json" }),
    body: JSON.stringify(payload)
  });

  const saved = await parseJsonResponse(response, "Failed to save volunteer availability");
  return Array.isArray(saved) ? saved : [];
}

export async function fetchVolunteerServices(token) {
  const response = await fetch(buildApiUrl("/volunteer/services"), {
    headers: buildHeaders(token)
  });

  const payload = await parseJsonResponse(response, "Failed to load volunteer services");
  return Array.isArray(payload) ? payload : [];
}

export async function updateVolunteerServices(token, payload) {
  const response = await fetch(buildApiUrl("/volunteer/services"), {
    method: "PUT",
    headers: buildHeaders(token, { "Content-Type": "application/json" }),
    body: JSON.stringify(payload)
  });

  const saved = await parseJsonResponse(response, "Failed to save volunteer services");
  return Array.isArray(saved) ? saved : [];
}
