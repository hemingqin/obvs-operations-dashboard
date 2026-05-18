export function getToken() {
  return localStorage.getItem("token");
}

export function setToken(token) {
  localStorage.setItem("token", token);
}

export function clearToken() {
  localStorage.removeItem("token");
}

export function decodeTokenPayload(token) {
  if (!token) {
    return null;
  }

  try {
    const [, payload] = token.split(".");
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

export function normalizeRole(role) {
  if (role === "staff") {
    return "coordinator";
  }

  if (role === "admin" || role === "coordinator" || role === "volunteer") {
    return role;
  }

  return null;
}

export function getSessionRole() {
  const token = getToken();

  if (!token) {
    return null;
  }

  const payload = decodeTokenPayload(token);
  return normalizeRole(payload?.role);
}

export function getSessionProfile() {
  const payload = decodeTokenPayload(getToken());
  const role = normalizeRole(payload?.role);

  return {
    id: payload?.user_id ?? null,
    role,
    displayName:
      role === "admin"
        ? "Admin user"
        : role === "coordinator"
          ? "Coordinator user"
          : role === "volunteer"
            ? "Volunteer user"
            : "Team member",
    legacyRole: typeof payload?.role === "string" ? payload.role : null
  };
}
