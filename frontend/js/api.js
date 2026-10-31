// api.js - Unified API client & Authentication utilities
async function api(path, { method = "GET", body } = {}) {
  const isFormData = body instanceof FormData;
  const res = await fetch(path, {
    method,
    headers: body && !isFormData ? { "Content-Type": "application/json" } : {},
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    credentials: "same-origin",
  });
  let data = null;
  try {
    data = await res.json();
  } catch (_) {
    /* empty response body */
  }
  if (!res.ok) {
    const err = new Error((data && data.error) || "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// Check session status with the Flask backend
async function getMe() {
  try {
    const me = await api("/api/me");
    return me && me.logged_in ? me : null;
  } catch {
    return null;
  }
}

// Invalidate session on server and redirect to login
async function logoutUser() {
  try {
    await api("/api/logout", { method: "POST" });
  } catch (err) {
    console.warn("Logout request returned an error:", err);
  }
  window.location.replace("login.html");
}

// Escape user-generated strings before inserting into innerHTML
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}
