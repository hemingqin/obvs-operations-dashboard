export async function readApiError(response, fallbackMessage) {
  try {
    const payload = await response.json();
    return payload?.error?.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}
