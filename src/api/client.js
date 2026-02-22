/**
 * API client — attaches Firebase Auth ID token to every request.
 *
 * All backend calls go through this module so auth headers are
 * applied consistently and errors are normalized.
 */
import { auth } from "../firebase";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://us-central1-prompt-engineering-course.cloudfunctions.net/api/v1";

/**
 * Get the current user's Firebase ID token (or null).
 */
async function getIdToken() {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

/**
 * Generic fetch wrapper.
 *
 * @param {string}  endpoint  — path relative to API_BASE, e.g. "/modules"
 * @param {object}  options   — standard fetch options + `params` for query string
 * @returns {Promise<any>}    — parsed JSON body
 */
export async function apiRequest(endpoint, options = {}) {
  const { params, body, headers: extraHeaders, ...rest } = options;

  // Build URL with optional query params
  let url = `${API_BASE}${endpoint}`;
  if (params) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") qs.append(k, v);
    });
    const qsStr = qs.toString();
    if (qsStr) url += `?${qsStr}`;
  }

  // Headers
  const headers = { "Content-Type": "application/json", ...extraHeaders };
  const token = await getIdToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const fetchOptions = { ...rest, headers };
  if (body) fetchOptions.body = JSON.stringify(body);

  const res = await fetch(url, fetchOptions);

  // Try to parse JSON regardless of status
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message = data?.error || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export default apiRequest;
