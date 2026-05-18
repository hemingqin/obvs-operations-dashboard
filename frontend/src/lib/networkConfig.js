const defaultApiBaseUrl = import.meta.env.DEV ? "http://localhost/api" : "/api";

export const apiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl
).replace(/\/$/, "");

export const wsBaseUrl = (
  import.meta.env.VITE_WS_BASE_URL ||
  apiBaseUrl.replace(/^http/, "ws").replace(/\/api$/, "")
).replace(/\/$/, "");

console.log("[networkConfig] apiBaseUrl =", apiBaseUrl);
console.log("[networkConfig] wsBaseUrl =", wsBaseUrl);

export function buildApiUrl(path) {
  const apiPath = path.startsWith("/") ? path : `/${path}`;
  return `${apiBaseUrl}${apiPath}`;
}

export function buildWebSocketUrl(path, token) {
  const websocketPath = path.startsWith("/") ? path : `/${path}`;
  return `${wsBaseUrl}${websocketPath}${
    token ? `?token=${encodeURIComponent(token)}` : ""
  }`;
}
